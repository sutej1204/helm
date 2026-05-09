"""AI-powered endpoints, all routed through Anthropic Claude.

  POST /api/ai/resolver/draft-email   — drafts a dispute email from computation
  POST /api/chat/supply-chain         — supply-chain assistant chat
  POST /api/ai/contracts/extract      — extracts structured terms from a contract
"""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field

from ..auth import require_token
from ..services.anthropic_client import complete


router = APIRouter(tags=["ai"], dependencies=[Depends(require_token)])


# ── /api/ai/resolver/draft-email ─────────────────────────────────────────────


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
    """Drafts a professional dispute email for the supplier credit recovery."""
    system = (
        "You are a senior procurement-finance analyst at a distribution company. "
        "You write concise, professional dispute emails to suppliers about owed credits. "
        "Output ONLY a JSON object with keys 'subject', 'body', 'reference'. "
        "The subject line MUST start with the program code. "
        "The body is plain-text email body, no HTML, ~6-9 short paragraphs, "
        "with a polite-but-firm tone, citing specific figures from the input. "
        "The reference is a short tracking ID like HELM-AI-YYYYMMDD-NNN."
    )
    user = json.dumps(
        {
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
        },
        indent=2,
    )
    raw = complete(system=system, user=user, max_tokens=1500)
    parsed = _force_json(raw)
    return ResolverDraftResponse(
        subject=parsed.get("subject", f"{req.program_code} Credit Recovery — {req.period_label}"),
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


# ── helpers ──────────────────────────────────────────────────────────────────


def _force_json(text: str) -> dict:
    """Best-effort JSON parse — Claude usually obeys 'output ONLY JSON' but
    occasionally wraps in ```json ... ``` or a trailing comment. Strip those."""
    s = text.strip()
    if s.startswith("```"):
        # remove leading ```json or ``` and trailing ```
        s = s.split("\n", 1)[1] if "\n" in s else s
        if s.endswith("```"):
            s = s[: -3]
    s = s.strip()
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        # fall back: return empty so the caller's defaults kick in
        return {}
