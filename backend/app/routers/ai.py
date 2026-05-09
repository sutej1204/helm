"""AI-powered endpoints, all routed through Anthropic Claude.

  POST /api/ai/resolver/draft-email   — drafts a dispute email from computation
  POST /api/chat/supply-chain         — supply-chain assistant chat
  POST /api/ai/contracts/extract      — extracts structured terms from a contract
"""
from __future__ import annotations

import io
import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, ConfigDict, Field

from ..auth import require_token
from ..services.anthropic_client import complete, is_configured
from ..services.calculator import compute as compute_deterministic


router = APIRouter(tags=["ai"], dependencies=[Depends(require_token)])


# ── /api/ai/extract-pdf ──────────────────────────────────────────────────────


class PdfExtractResponse(BaseModel):
    filename: str
    pages: int
    text: str
    char_count: int = Field(..., alias="charCount")

    model_config = ConfigDict(populate_by_name=True)


@router.post(
    "/api/ai/extract-pdf",
    response_model=PdfExtractResponse,
    response_model_by_alias=True,
)
async def extract_pdf_text(file: UploadFile = File(...)) -> PdfExtractResponse:
    """Extract plain text from an uploaded PDF using pypdf.

    Used by the Expected Credit Engine page when a credit memo (or any
    other input) is supplied as a PDF — the frontend ships the file here,
    receives back text, and feeds that into /api/ai/expected-credit/analyze
    via the same JSON contract it already uses for CSV uploads.
    """
    name = (file.filename or "uploaded.pdf").lower()
    if not name.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=f"Expected a .pdf file; got '{file.filename}'.",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        # Imported lazily so a missing pypdf at import time doesn't crash the
        # whole router for unrelated AI endpoints.
        from pypdf import PdfReader  # type: ignore[import-not-found]
    except ImportError as e:
        raise HTTPException(
            status_code=500,
            detail="pypdf is not installed on the server. Run `pip install pypdf`.",
        ) from e

    try:
        reader = PdfReader(io.BytesIO(raw))
        pieces = []
        for page in reader.pages:
            text = page.extract_text() or ""
            if text.strip():
                pieces.append(text)
        joined = "\n\n".join(pieces).strip()
    except Exception as e:  # noqa: BLE001 — pypdf throws a wide variety
        raise HTTPException(
            status_code=400, detail=f"Could not parse PDF: {e}"
        ) from e

    if not joined:
        raise HTTPException(
            status_code=422,
            detail=(
                "PDF parsed but no extractable text was found — the file is "
                "probably an image-only scan. Run OCR upstream and re-upload."
            ),
        )

    return PdfExtractResponse(
        filename=file.filename or "uploaded.pdf",
        pages=len(reader.pages),
        text=joined,
        charCount=len(joined),
    )


# ── /api/ai/resolver/draft-email ─────────────────────────────────────────────


class TopMismatchLine(BaseModel):
    """One row of context — usually the most-underpaid product codes — passed
    so the drafted email can reference specific figures rather than generic
    program-level totals."""

    vcsc: str
    sales_amount: float = Field(..., alias="salesAmount")
    applied_rate_pct: float = Field(..., alias="appliedRatePct")
    expected_credit: float = Field(..., alias="expectedCredit")
    received_credit: float = Field(..., alias="receivedCredit")
    mismatch: float
    status: str

    model_config = ConfigDict(populate_by_name=True)


class ResolverDraftRequest(BaseModel):
    program_name: str = Field(..., alias="programName")
    program_code: str = Field(..., alias="programCode")
    period_label: str = Field(..., alias="periodLabel")
    expected_amount: float = Field(..., alias="expectedAmount")
    eligible_amount: float = Field(..., alias="eligibleAmount")
    eligible_lines: int = Field(..., alias="eligibleLines")
    total_input_lines: int = Field(..., alias="totalInputLines")
    applied_rate: float = Field(..., alias="appliedRate")
    applied_tier: str = Field(..., alias="appliedTier")
    supplier_name: str = Field(..., alias="supplierName")
    computation_version: str | None = Field(default=None, alias="computationVersion")
    # Optional — populated when the engine ran on uploaded docs so the email
    # can quote specific underpaid codes rather than generic program totals.
    recoverable_amount: float | None = Field(default=None, alias="recoverableAmount")
    total_received_credit: float | None = Field(default=None, alias="totalReceivedCredit")
    credit_memo_number: str | None = Field(default=None, alias="creditMemoNumber")
    credit_memo_date: str | None = Field(default=None, alias="creditMemoDate")
    top_mismatches: list[TopMismatchLine] = Field(
        default_factory=list, alias="topMismatches"
    )

    model_config = ConfigDict(populate_by_name=True)


class ResolverDraftResponse(BaseModel):
    subject: str
    body: str
    reference: str


@router.post(
    "/api/ai/resolver/draft-email",
    response_model=ResolverDraftResponse,
)
def draft_resolver_email(req: ResolverDraftRequest) -> ResolverDraftResponse:
    """Drafts a professional dispute email for the supplier credit recovery.

    Two scenarios:
      A) Caller provides only program-level totals (the demo case, no upload):
         email is general-purpose, citing the program code and headline credit
         amount.
      B) Caller also provides recoverable_amount, top_mismatches, and the
         credit memo metadata (the upload case): email is much more specific
         — it references the exact memo number, the underpayment vs the memo,
         and quotes the most-underpaid product codes by VCSC.
    """
    system = (
        "You are a senior procurement-finance analyst at a distribution "
        "company. You write concise, professional dispute emails to "
        "suppliers about owed credits.\n\n"
        "Output ONLY a JSON object with keys 'subject', 'body', "
        "'reference'.\n"
        "  - The subject line MUST start with the program code (or "
        "'CREDIT RECOVERY' if the program code is 'AI-ANALYSIS' or empty), "
        "and include the supplier name and headline dollar amount.\n"
        "  - The body is plain-text email body (no HTML), 6-9 short "
        "paragraphs, polite-but-firm tone. Cite SPECIFIC figures from the "
        "input. When the input contains 'top_mismatches' or "
        "'credit_memo_number', mention them by name in the body — naming "
        "specific VCSC codes that were underpaid is far more credible than "
        "a vague program-level dispute.\n"
        "  - When recoverable_amount is provided, frame the email around "
        "that figure (the mismatch between expected and received credit), "
        "not just the gross expected amount.\n"
        "  - The reference is a short tracking ID of the form "
        "HELM-AI-YYYYMMDD-NNN."
    )
    payload = {
        "supplier": req.supplier_name,
        "program_name": req.program_name,
        "program_code": req.program_code,
        "period": req.period_label,
        "expected_credit_usd": req.expected_amount,
        "eligible_purchase_value_usd": req.eligible_amount,
        "eligible_lines": req.eligible_lines,
        "total_input_lines": req.total_input_lines,
        "applied_rate_pct": req.applied_rate,
        "applied_tier": req.applied_tier,
        "computation_version": req.computation_version,
    }
    if req.recoverable_amount is not None:
        payload["recoverable_amount_usd"] = req.recoverable_amount
    if req.total_received_credit is not None:
        payload["total_received_credit_usd"] = req.total_received_credit
    if req.credit_memo_number:
        payload["credit_memo_number"] = req.credit_memo_number
    if req.credit_memo_date:
        payload["credit_memo_date"] = req.credit_memo_date
    if req.top_mismatches:
        payload["top_mismatches"] = [m.model_dump(by_alias=True) for m in req.top_mismatches]

    user = json.dumps(payload, indent=2)
    raw = complete(system=system, user=user, max_tokens=1500)
    parsed = _force_json(raw)
    fallback_code = req.program_code if req.program_code and req.program_code != "AI-ANALYSIS" else "CREDIT RECOVERY"
    return ResolverDraftResponse(
        subject=parsed.get(
            "subject",
            f"{fallback_code} — {req.supplier_name} — {req.period_label}",
        ),
        body=parsed.get("body", raw),
        reference=parsed.get("reference", "HELM-AI-DRAFT"),
    )


# ── /api/chat/supply-chain ───────────────────────────────────────────────────


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@router.post("/api/chat/supply-chain", response_model=ChatResponse)
def supply_chain_chat(req: ChatRequest) -> ChatResponse:
    system = (
        "You are Helm AI, an analyst inside a procurement & rebate-recovery platform. "
        "Your specialty is supply-chain economics, supplier rebates, SPA programs, "
        "tier structures, and credit reconciliation between distributors and "
        "manufacturers (HVAC, building products, industrial supply). "
        "Answer in 2-5 sentences unless the user asks for detail. Use concrete "
        "examples and dollar amounts when relevant. Never say 'as an AI'."
    )
    text = complete(system=system, user=req.message, max_tokens=600)
    return ChatResponse(response=text)


# ── /api/ai/contracts/extract ────────────────────────────────────────────────


class ContractExtractRequest(BaseModel):
    text: str = Field(..., description="Raw contract text or summary excerpt.")
    filename: str | None = None


class ExtractedTerms(BaseModel):
    effective_date: str | None = Field(default=None, alias="effectiveDate")
    expiry_date: str | None = Field(default=None, alias="expiryDate")
    pricing_tiers: str | None = Field(default=None, alias="pricingTiers")
    rebate_rate: str | None = Field(default=None, alias="rebateRate")
    payment_terms: str | None = Field(default=None, alias="paymentTerms")
    total_value: str | None = Field(default=None, alias="totalValue")
    key_terms: list[str] = Field(default_factory=list, alias="keyTerms")
    confidence: float | None = None
    summary: str | None = None

    model_config = ConfigDict(populate_by_name=True)


@router.post(
    "/api/ai/contracts/extract",
    response_model=ExtractedTerms,
    response_model_by_alias=True,
)
def extract_contract_terms(req: ContractExtractRequest) -> ExtractedTerms:
    system = (
        "You extract structured commercial terms from supplier contracts. "
        "Return ONLY a JSON object with keys: effectiveDate, expiryDate, "
        "pricingTiers, rebateRate, paymentTerms, totalValue, keyTerms, "
        "confidence, summary. effectiveDate / expiryDate are human-readable "
        "(e.g. 'Jan 1, 2024'). pricingTiers and rebateRate are short prose. "
        "totalValue is a USD figure with $ prefix. keyTerms is a string array "
        "of 2-5 standout clauses. confidence is 0-1. summary is one sentence."
    )
    user = (
        f"Contract filename: {req.filename or 'unknown'}\n\n"
        f"Contract text:\n---\n{req.text[:12000]}\n---"
    )
    raw = complete(system=system, user=user, max_tokens=1200)
    parsed = _force_json(raw)
    return ExtractedTerms(**parsed)


# ── /api/ai/expected-credit/analyze ──────────────────────────────────────────


class ExpectedCreditAnalyzeRequest(BaseModel):
    """All three uploaded docs as text. The frontend already parses CSV
    client-side and can pass the parsed sample; PDFs / XLS would be parsed
    upstream and converted to text/CSV before calling this endpoint."""

    pos_text: str = Field(..., alias="posText")
    agreement_text: str = Field(..., alias="agreementText")
    credit_memo_text: str = Field(..., alias="creditMemoText")
    period_label: str | None = Field(default=None, alias="periodLabel")

    model_config = ConfigDict(populate_by_name=True)


class CodeBreakdown(BaseModel):
    """Per-VCSC (per product code) breakdown."""

    model_config = ConfigDict(populate_by_name=True)
    vcsc: str
    sales_amount: float = Field(..., alias="salesAmount")
    applied_rebate_pct: float = Field(..., alias="appliedRebatePct")
    expected_credit: float = Field(..., alias="expectedCredit")
    received_credit: float = Field(..., alias="receivedCredit")
    mismatch: float
    status: str  # "matched" | "underpaid" | "overpaid" | "unclaimed"
    program_codes: list[str] = Field(default_factory=list, alias="programCodes")


class ExpectedCreditAnalyzeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_sales: float = Field(..., alias="totalSales")
    total_expected_credit: float = Field(..., alias="totalExpectedCredit")
    total_received_credit: float = Field(..., alias="totalReceivedCredit")
    total_mismatch: float = Field(..., alias="totalMismatch")
    recoverable_amount: float = Field(..., alias="recoverableAmount")
    mismatch_percent: float = Field(..., alias="mismatchPercent")
    weighted_avg_rebate_pct: float = Field(..., alias="weightedAvgRebatePct")
    per_code_breakdown: list[CodeBreakdown] = Field(..., alias="perCodeBreakdown")
    summary: str
    period_label: str | None = Field(default=None, alias="periodLabel")
    pos_lines_total: int = Field(..., alias="posLinesTotal")
    pos_lines_eligible: int = Field(..., alias="posLinesEligible")
    # Optional metadata extracted by the model from the uploaded docs.
    supplier_name: str | None = Field(default=None, alias="supplierName")
    detected_period: str | None = Field(default=None, alias="detectedPeriod")
    credit_memo_number: str | None = Field(default=None, alias="creditMemoNumber")
    credit_memo_date: str | None = Field(default=None, alias="creditMemoDate")


@router.post(
    "/api/ai/expected-credit/analyze",
    response_model=ExpectedCreditAnalyzeResponse,
    response_model_by_alias=True,
)
def analyze_expected_credit(
    req: ExpectedCreditAnalyzeRequest,
) -> ExpectedCreditAnalyzeResponse:
    """Hybrid pipeline: deterministic Python for the math, tiny AI call
    for metadata + narrative.

    Math (parsing + per-VCSC computation) takes <50ms and is reproducible.
    The AI call only needs to extract the supplier name and write a
    one-paragraph summary, both of which fit comfortably in a Haiku
    request that returns in ~1-3s.
    """
    calc = compute_deterministic(
        pos_text=req.pos_text,
        agreement_text=req.agreement_text,
        credit_memo_text=req.credit_memo_text,
    )

    # If the parser couldn't find a single eligible code, fall back to the
    # legacy all-AI path — handles unfamiliar CSV layouts that our column
    # heuristics can't follow.
    if not calc.per_code:
        return _legacy_all_ai_analyze(req)

    # Build the structured part of the response from the calculator.
    per_code = [
        {
            "vcsc": c.vcsc,
            "salesAmount": c.sales_amount,
            "appliedRebatePct": c.applied_rebate_pct,
            "expectedCredit": c.expected_credit,
            "receivedCredit": c.received_credit,
            "mismatch": c.mismatch,
            "status": c.status,
            "programCodes": c.program_codes,
        }
        for c in calc.per_code
    ]

    # Tiny metadata + narrative call. We hand Claude only the totals and
    # short snippets of the docs so the prompt stays small (<2K tokens) and
    # the round-trip is fast. If the API key isn't configured or the call
    # fails, we fall back to deterministic-only metadata.
    metadata = _ai_metadata(req, calc) if is_configured() else {}

    return ExpectedCreditAnalyzeResponse(**{
        "totalSales": calc.total_sales,
        "totalExpectedCredit": calc.total_expected_credit,
        "totalReceivedCredit": calc.total_received_credit,
        "totalMismatch": calc.total_mismatch,
        "recoverableAmount": calc.recoverable_amount,
        "mismatchPercent": calc.mismatch_percent,
        "weightedAvgRebatePct": calc.weighted_avg_rebate_pct,
        "posLinesTotal": calc.pos_lines_total,
        "posLinesEligible": calc.pos_lines_eligible,
        "perCodeBreakdown": per_code,
        "summary": metadata.get("summary") or _fallback_summary(calc),
        "periodLabel": req.period_label,
        "supplierName": metadata.get("supplierName"),
        # Prefer deterministic regex extraction when present; AI value is a
        # fallback. Haiku occasionally hallucinates a period (e.g. claiming
        # "Q1 2024" for May-Sep data), so the regex wins when it has one.
        "detectedPeriod": calc.detected_period or metadata.get("detectedPeriod"),
        "creditMemoNumber": calc.credit_memo_number or metadata.get("creditMemoNumber"),
        "creditMemoDate": calc.credit_memo_date or metadata.get("creditMemoDate"),
    })


def _ai_metadata(req: ExpectedCreditAnalyzeRequest, calc) -> dict:
    """Tiny Haiku call for supplier name + period + summary narrative.

    Sends a small prompt: top of the agreement (where the supplier name
    lives), top of the memo (where memo # / date live), and the totals
    we already computed. Returns {} on parse failure.
    """
    agreement_excerpt = req.agreement_text[:600]
    memo_excerpt = req.credit_memo_text[:800]
    facts = {
        "totalSales": calc.total_sales,
        "totalExpectedCredit": calc.total_expected_credit,
        "totalReceivedCredit": calc.total_received_credit,
        "recoverableAmount": calc.recoverable_amount,
        "underpaidCount": sum(1 for c in calc.per_code if c.status == "underpaid"),
        "unclaimedCount": sum(1 for c in calc.per_code if c.status == "unclaimed"),
        "matchedCount": sum(1 for c in calc.per_code if c.status == "matched"),
        "topUnderpaidCodes": [c.vcsc for c in sorted(calc.per_code, key=lambda c: -c.mismatch)[:3]],
    }

    system = (
        "Extract metadata + write a one-paragraph executive summary. "
        "Output ONLY a JSON object with keys: supplierName "
        "(manufacturer/vendor named in the agreement, e.g. 'BBB Industries'); "
        "detectedPeriod (concise label, e.g. 'Apr–Aug 2024'); "
        "creditMemoNumber; creditMemoDate (human-readable); summary "
        "(2-3 sentences citing the recoverable amount and underpaid count). "
        "Use null for any field you can't determine. JSON only — no markdown."
    )
    user = (
        "AGREEMENT EXCERPT:\n" + agreement_excerpt + "\n\n"
        "CREDIT MEMO EXCERPT:\n" + memo_excerpt + "\n\n"
        "COMPUTED FACTS:\n" + json.dumps(facts, indent=2)
    )
    try:
        raw = complete(system=system, user=user, max_tokens=600)
    except Exception:  # noqa: BLE001 — fallback values are handled below
        return {}
    return _force_json(raw) or {}


def _fallback_summary(calc) -> str:
    """Plain-Python summary used when the AI metadata call is skipped or fails."""
    underpaid = sum(1 for c in calc.per_code if c.status == "underpaid")
    unclaimed = sum(1 for c in calc.per_code if c.status == "unclaimed")
    return (
        f"Across {len(calc.per_code)} VCSC codes, total POS sales of "
        f"${calc.total_sales:,.0f} qualify for an expected rebate credit of "
        f"${calc.total_expected_credit:,.0f}. The credit memo on file "
        f"covers ${calc.total_received_credit:,.0f}, leaving "
        f"${calc.recoverable_amount:,.0f} recoverable across "
        f"{underpaid} underpaid and {unclaimed} unclaimed codes."
    )


def _legacy_all_ai_analyze(
    req: ExpectedCreditAnalyzeRequest,
) -> ExpectedCreditAnalyzeResponse:
    """Original all-AI fallback for unfamiliar CSV layouts where the
    deterministic parser can't find any eligible codes."""
    system = (
        "You are a financial analyst specialising in supplier rebate "
        "reconciliation. The Python parser couldn't infer the file layout, "
        "so reconcile the three documents directly. Compute per-VCSC: "
        "expected = sales × max(rebate%); mismatch = expected − received. "
        "Statuses: matched (|mismatch| ≤ 5% of expected), underpaid, "
        "overpaid, unclaimed (received == 0). Output ONLY one JSON object "
        "with keys totalSales, totalExpectedCredit, totalReceivedCredit, "
        "totalMismatch, recoverableAmount, mismatchPercent, "
        "weightedAvgRebatePct, posLinesTotal, posLinesEligible, "
        "perCodeBreakdown[] of {vcsc, salesAmount, appliedRebatePct, "
        "expectedCredit, receivedCredit, mismatch, status, programCodes}, "
        "summary, supplierName, detectedPeriod, creditMemoNumber, "
        "creditMemoDate. Numbers as numbers, output JSON only."
    )
    user = (
        f"=== POS ===\n{req.pos_text[:14000]}\n\n"
        f"=== AGREEMENT ===\n{req.agreement_text[:14000]}\n\n"
        f"=== CREDIT MEMO ===\n{req.credit_memo_text[:14000]}"
    )
    raw = complete(system=system, user=user, max_tokens=4000)
    parsed = _force_json(raw) or {}
    parsed.setdefault("totalSales", 0)
    parsed.setdefault("totalExpectedCredit", 0)
    parsed.setdefault("totalReceivedCredit", 0)
    parsed.setdefault("totalMismatch", 0)
    parsed.setdefault("recoverableAmount", 0)
    parsed.setdefault("mismatchPercent", 0)
    parsed.setdefault("weightedAvgRebatePct", 0)
    parsed.setdefault("posLinesTotal", 0)
    parsed.setdefault("posLinesEligible", 0)
    parsed.setdefault("perCodeBreakdown", [])
    parsed.setdefault("summary", "Analysis returned no narrative.")
    parsed.setdefault("supplierName", None)
    parsed.setdefault("detectedPeriod", None)
    parsed.setdefault("creditMemoNumber", None)
    parsed.setdefault("creditMemoDate", None)
    parsed["periodLabel"] = req.period_label
    return ExpectedCreditAnalyzeResponse(**parsed)


# ── helpers ──────────────────────────────────────────────────────────────────


def _force_json(text: str) -> dict:
    """Best-effort JSON parse. Builds a list of candidate JSON strings from
    the response (raw text, fenced code blocks, and every balanced top-level
    `{...}` block) and tries each. Returns the parsed dict with the most
    keys — handy when Claude inlines small JSON examples in narration but
    the real answer is the full object.
    """
    s = text.strip()
    candidates: list[str] = [s]

    # All fenced ``` ... ``` blocks (alt indices when split on ```).
    parts = s.split("```")
    for i, part in enumerate(parts):
        if i % 2 == 1:
            inner = part.split("\n", 1)[1] if "\n" in part else part
            candidates.append(inner.strip().rstrip("`").strip())

    # Every balanced top-level {...} block.
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

    # Try each candidate; keep the dict with the most keys (the "real" payload
    # rather than a tiny example object Claude might have shown inline).
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
