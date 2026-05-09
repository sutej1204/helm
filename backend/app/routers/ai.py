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
from ..services.anthropic_client import complete


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
    """End-to-end: extract → compute → reconcile in one Claude call.

    Claude reads all three documents, applies the rebate-percent table to
    POS sales, sums received credits per code, and surfaces the mismatch.
    """
    system = (
        "You are a financial analyst specialising in supplier rebate "
        "reconciliation for industrial distribution. You will receive three "
        "documents: (1) a POS sales export listing monthly sales by product "
        "code (VCSC), (2) a distribution agreement listing rebate "
        "percentages per program / VCSC, and (3) a credit memo listing "
        "credits already received. Compute, for each VCSC code:\n"
        "  expected_credit = sum(sales × applicable_rebate_pct)\n"
        "  received_credit = sum(credits_received_for_that_vcsc)\n"
        "  mismatch        = expected_credit − received_credit\n"
        "Where multiple programs apply to the same VCSC, use the maximum "
        "rebate percentage that matches BOTH the agreement program AND any "
        "available program metadata. Treat rebate % values as decimals "
        "(e.g. '8.50%' = 0.085). Skip rows whose VCSC code does not appear "
        "in the agreement at all (those POS lines are 'ineligible').\n\n"
        "Status rules per code:\n"
        "  - 'matched'    : |mismatch| ≤ 5% of expected\n"
        "  - 'underpaid'  : received < expected by more than 5%\n"
        "  - 'overpaid'   : received > expected by more than 5%\n"
        "  - 'unclaimed'  : received_credit == 0 and expected > 0\n\n"
        "Return ONLY a single JSON object with keys:\n"
        "  totalSales, totalExpectedCredit, totalReceivedCredit, "
        "totalMismatch, recoverableAmount (sum of positive mismatches "
        "across underpaid + unclaimed codes), mismatchPercent "
        "(totalMismatch / totalExpectedCredit × 100), "
        "weightedAvgRebatePct, posLinesTotal, posLinesEligible, "
        "perCodeBreakdown (array of {vcsc, salesAmount, "
        "appliedRebatePct, expectedCredit, receivedCredit, mismatch, "
        "status, programCodes}), summary (one-paragraph English "
        "narrative).\n"
        "  ALSO include these metadata fields when extractable:\n"
        "    supplierName       — the manufacturer/vendor named in the "
        "agreement (e.g. 'BBB Industries', 'Trane Technologies')\n"
        "    detectedPeriod     — concise period label inferred from the "
        "POS dates (e.g. 'May–Sep 2024', 'Q3 2024')\n"
        "    creditMemoNumber   — memo number from the credit memo "
        "(string, e.g. '3373974')\n"
        "    creditMemoDate     — issue date from the credit memo "
        "(human-readable, e.g. '23-SEP-2024')\n"
        "All numbers as numbers, not strings. Output JSON only."
    )

    user = (
        f"=== POS SALES DATA ===\n{req.pos_text[:14000]}\n\n"
        f"=== DISTRIBUTION AGREEMENT (rebate table) ===\n{req.agreement_text[:14000]}\n\n"
        f"=== CREDIT MEMO (already received) ===\n{req.credit_memo_text[:14000]}\n\n"
        f"Period: {req.period_label or 'unspecified'}\n\n"
        "RESPONSE FORMAT — IMPORTANT: Respond with ONLY a single JSON "
        "object. No prose, no markdown, no code fences, no commentary "
        "before or after. The very first character of your response must "
        "be '{' and the very last character must be '}'. Compute the "
        "totals correctly but do not show your work — only the final JSON."
    )

    raw = complete(system=system, user=user, max_tokens=4000)
    parsed = _force_json(raw)
    if not parsed:
        import logging
        logging.getLogger("helm.ai").warning(
            "expected-credit/analyze: failed to parse Claude response. First 600 chars: %r",
            raw[:600],
        )

    # Defensive defaults so a malformed Claude response still returns a
    # structurally valid object — the UI can render empty rows rather than
    # blow up on missing keys.
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
