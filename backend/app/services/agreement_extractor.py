"""AI-driven extraction for unstructured (typically PDF) rebate agreements.

The deterministic CSV parser in `calculator.parse_agreement_csv` only
fires on tabular agreements. When a customer drops in a PDF — typed
contract paragraphs, scanned table, etc. — that parser yields nothing
and we route through here instead. Output shape is deliberately the
same as the CSV parser's so the rest of the engine doesn't care which
path produced the rebate map.

Persistence side: extractions are cached in the DB by SHA-1 of the
agreement text. A re-upload of the same PDF reuses the cached
suppliers / vendor_agreements / programs rows rather than spending
another Anthropic call.
"""
from __future__ import annotations

import hashlib
import json
import logging
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from ..models import Program, Supplier, VendorAgreement
from .anthropic_client import complete, is_configured


logger = logging.getLogger("helm.agreement_extractor")


# ── Shapes ───────────────────────────────────────────────────────────────────


@dataclass
class ExtractedProgram:
    awi_code: str | None
    program_name: str
    program_type: str  # spa | rebate | chargeback | allowance | other
    rebate_pct: float
    rate_type: str  # "percent" only for now
    vcscs: list[str]
    frequency: str | None  # quarterly | monthly | annual | None
    cap: float | None
    exclusions: str | None


@dataclass
class AgreementExtraction:
    supplier_name: str | None
    effective_date: str | None
    expiration_date: str | None
    payment_terms: str | None
    programs: list[ExtractedProgram]
    text_hash: str  # SHA-1 of the source text — cache key
    raw_text_excerpt: str  # first 400 chars, kept on the agreement record


# ── Prompt + extraction ──────────────────────────────────────────────────────


_SYSTEM_PROMPT = (
    "You extract structured rebate-program data from supplier distribution "
    "agreements. Output ONLY a single JSON object — no prose, no markdown, "
    "no code fences.\n\n"
    "Schema:\n"
    "{\n"
    '  "supplierName": string | null,    # the manufacturer/vendor named '
    "in the document (e.g. 'BBB Industries', 'Crestline Industries')\n"
    '  "effectiveDate": string | null,   # e.g. "Jan 1, 2024"\n'
    '  "expirationDate": string | null,  # e.g. "Dec 31, 2025"\n'
    '  "paymentTerms": string | null,    # e.g. "Net 30"\n'
    '  "programs": [\n'
    "    {\n"
    '      "awiCode": string | null,       # the program / AWI / vendor '
    "code, e.g. '8888006.100'\n"
    '      "programName": string,           # e.g. "BBB Central Bill"\n'
    '      "programType": string,           # one of: spa | rebate | '
    "chargeback | allowance | other\n"
    '      "rebatePct": number,             # rebate percent as a number, '
    "e.g. 3.5 (NOT 0.035 and NOT '3.5%')\n"
    '      "rateType": "percent",\n'
    '      "vcscs": [string, ...],          # eligible VCSC codes (DC02, '
    "GE03, PS10, etc.)\n"
    '      "frequency": string | null,      # quarterly | monthly | '
    "annual | null\n"
    '      "cap": number | null,             # rebate cap in USD\n'
    '      "exclusions": string | null      # short text describing any '
    "exclusions\n"
    "    }\n"
    "  ]\n"
    "}\n\n"
    "Rules:\n"
    "  - VCSC codes are short (2-6 chars) uppercase strings like DC02, "
    "GE03, PS10, NE10, WL01.\n"
    "  - If the agreement explicitly lists VCSCs eligible for a program, "
    "include them all. If a program covers 'all locations' or similar "
    "blanket language, set vcscs to an empty array.\n"
    "  - rebatePct is ALWAYS a number, never a string. Convert '8.50%' "
    "to 8.5, '3.00%' to 3.0.\n"
    "  - One JSON object per program even if the document repeats them "
    "in tables.\n"
    "  - Output JSON only."
)


def extract(text: str, model: str | None = None) -> AgreementExtraction:
    """Call the model once, return a structured extraction.

    Doesn't touch the DB. Caller should pass the result to `persist()`
    when it wants to keep it.
    """
    text_hash = hashlib.sha1(text.encode("utf-8", errors="ignore")).hexdigest()
    excerpt = text[:400]

    if not is_configured():
        return AgreementExtraction(
            supplier_name=None,
            effective_date=None,
            expiration_date=None,
            payment_terms=None,
            programs=[],
            text_hash=text_hash,
            raw_text_excerpt=excerpt,
        )

    # Truncate aggressively — most agreements have all the rebate info in
    # the first ~12K chars; tables further in are usually appendices.
    user = "AGREEMENT TEXT:\n" + text[:14000]

    raw = complete(
        system=_SYSTEM_PROMPT,
        user=user,
        max_tokens=3000,
        model=model,
    )
    parsed = _force_json(raw)
    if not parsed:
        logger.warning("agreement_extractor: model returned non-JSON. First 400 chars: %r", raw[:400])
        return AgreementExtraction(
            supplier_name=None,
            effective_date=None,
            expiration_date=None,
            payment_terms=None,
            programs=[],
            text_hash=text_hash,
            raw_text_excerpt=excerpt,
        )

    programs: list[ExtractedProgram] = []
    for p in parsed.get("programs", []) or []:
        try:
            rebate = float(p.get("rebatePct") or 0)
        except (TypeError, ValueError):
            continue
        # If the model returned 0.085 (a fraction) instead of 8.5, normalise.
        if 0 < rebate < 1:
            rebate = rebate * 100
        vcscs_raw = p.get("vcscs") or []
        vcscs = [
            v.strip().upper()
            for v in vcscs_raw
            if isinstance(v, str) and v.strip()
        ]
        programs.append(
            ExtractedProgram(
                awi_code=(p.get("awiCode") or None),
                program_name=(p.get("programName") or "Unnamed Program").strip(),
                program_type=(p.get("programType") or "other").strip().lower(),
                rebate_pct=rebate,
                rate_type=(p.get("rateType") or "percent").lower(),
                vcscs=vcscs,
                frequency=p.get("frequency"),
                cap=_safe_float(p.get("cap")),
                exclusions=p.get("exclusions"),
            )
        )

    return AgreementExtraction(
        supplier_name=parsed.get("supplierName"),
        effective_date=parsed.get("effectiveDate"),
        expiration_date=parsed.get("expirationDate"),
        payment_terms=parsed.get("paymentTerms"),
        programs=programs,
        text_hash=text_hash,
        raw_text_excerpt=excerpt,
    )


# ── Persistence ──────────────────────────────────────────────────────────────


def persist(
    db: Session,
    extraction: AgreementExtraction,
    *,
    source_filename: str | None = None,
) -> dict:
    """Cache an extraction in the DB.

    Lookup key: SHA-1 of the original agreement text, stored in
    `vendor_agreements.document_url` (we reuse the column rather than
    add a new one — the format is `ai-extracted:<hash>:<filename>`).
    Re-uploads of the same PDF therefore short-circuit, returning the
    existing supplier/agreement/program ids without spending another
    AI call upstream and without inserting duplicates.
    """
    cache_key = f"ai-extracted:{extraction.text_hash}"

    # Have we cached this exact agreement before?
    existing = (
        db.query(VendorAgreement)
        .filter(VendorAgreement.document_url.like(f"{cache_key}%"))
        .one_or_none()
    )
    if existing:
        cached_programs = (
            db.query(Program).filter(Program.agreement_id == existing.id).all()
        )
        return {
            "supplierId": existing.supplier_id,
            "agreementId": existing.id,
            "programIds": [p.id for p in cached_programs],
            "cached": True,
        }

    # Find or create the supplier.
    sup_name = (extraction.supplier_name or "Unknown Supplier (AI-extracted)").strip()
    supplier = (
        db.query(Supplier).filter(Supplier.name == sup_name).one_or_none()
    )
    if not supplier:
        supplier = Supplier(
            name=sup_name,
            code=_synth_supplier_code(sup_name),
            category="AI-extracted",
            contact_name=None,
            email=None,
            phone=None,
            address=None,
            status="active",
        )
        db.add(supplier)
        db.flush()

    # Create the agreement record.
    eff = _parse_date_loose(extraction.effective_date) or date(2024, 1, 1)
    exp = _parse_date_loose(extraction.expiration_date)
    agreement = VendorAgreement(
        supplier_id=supplier.id,
        agreement_name=(source_filename or f"AI-extracted agreement {datetime.utcnow():%Y-%m-%d}"),
        effective_date=eff,
        expiration_date=exp,
        status="active",
        document_url=f"{cache_key}:{source_filename or 'unnamed.pdf'}",
        ingestion_status="parsed",
        ingestion_confidence=Decimal("80"),
    )
    db.add(agreement)
    db.flush()

    # Programs.
    program_ids: list[int] = []
    for p in extraction.programs:
        prog = Program(
            agreement_id=agreement.id,
            program_type=p.program_type or "other",
            program_name=p.program_name,
            program_code=p.awi_code,
            base_rate=Decimal(str(round(p.rebate_pct, 4))),
            rate_type=p.rate_type or "percent",
            tier_structure=None,
            cap=Decimal(str(p.cap)) if p.cap is not None else None,
            eligible_skus=p.vcscs or None,  # overload: VCSCs ride in the SKU array
            eligible_customer_classes=None,
            eligible_branches=None,
            exclusions={"text": p.exclusions} if p.exclusions else None,
            effective_date=eff,
            expiration_date=exp,
            claim_deadline_days=None,
            reporting_format=None,
            active=True,
        )
        db.add(prog)
        db.flush()
        program_ids.append(prog.id)

    db.commit()
    return {
        "supplierId": supplier.id,
        "agreementId": agreement.id,
        "programIds": program_ids,
        "cached": False,
    }


def to_rebate_maps(
    extraction: AgreementExtraction,
) -> tuple[dict[str, float], dict[str, list[str]]]:
    """Convert an extraction to the (rebates, programs_per_vcsc) pair the
    deterministic calculator's `compute_from_components` expects."""
    rebates: dict[str, float] = {}
    programs: dict[str, list[str]] = {}
    for p in extraction.programs:
        for v in p.vcscs:
            if p.rebate_pct > rebates.get(v, 0.0):
                rebates[v] = p.rebate_pct
            programs.setdefault(v, [])
            label = p.awi_code or p.program_name
            if label and label not in programs[v]:
                programs[v].append(label)
    return rebates, programs


# ── Helpers ──────────────────────────────────────────────────────────────────


def _force_json(text: str) -> dict:
    """Same multi-candidate JSON extractor used in routers/ai.py — hoisted
    locally so this module doesn't depend on the router."""
    s = text.strip()
    candidates: list[str] = [s]

    # Fenced ``` blocks.
    parts = s.split("```")
    for i, part in enumerate(parts):
        if i % 2 == 1:
            inner = part.split("\n", 1)[1] if "\n" in part else part
            candidates.append(inner.strip().rstrip("`").strip())

    # Balanced top-level {...} blocks.
    depth = 0
    in_str = False
    esc = False
    starts: list[int] = []
    for i, ch in enumerate(s):
        if esc:
            esc = False
            continue
        if ch == "\\":
            esc = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch == "{":
            if depth == 0:
                starts.append(i)
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and starts:
                candidates.append(s[starts.pop() : i + 1])

    best: dict = {}
    best_score = -1
    for c in candidates:
        try:
            obj = json.loads(c)
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            score = len(obj)
            if score > best_score:
                best = obj
                best_score = score
    return best


def _safe_float(v: object) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def _parse_date_loose(s: str | None) -> date | None:
    """Best-effort parse of dates Claude commonly emits."""
    if not s:
        return None
    s = s.strip()
    for fmt in ("%Y-%m-%d", "%b %d, %Y", "%B %d, %Y", "%d-%b-%Y", "%d %B %Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _synth_supplier_code(name: str) -> str:
    """Generate a stable but unique supplier code for AI-extracted suppliers."""
    base = "".join(c for c in name.upper() if c.isalnum())[:6] or "AISUPP"
    suffix = hashlib.sha1(name.encode()).hexdigest()[:4].upper()
    return f"{base}-{suffix}"
