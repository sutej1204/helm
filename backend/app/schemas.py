"""Pydantic v2 schemas — wire format matches the original Express API
(camelCase field names, decimals serialized as strings to preserve
precision the way the original `numeric` columns did)."""
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


def _to_camel(snake: str) -> str:
    head, *rest = snake.split("_")
    return head + "".join(w.capitalize() for w in rest)


class _Out(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_to_camel,
        populate_by_name=True,
        ser_json_bytes="utf8",
    )


# ── Suppliers ────────────────────────────────────────────────────────────────
class SupplierOut(_Out):
    id: int
    name: str
    code: str
    contact_name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    category: str
    status: str
    risk_score: float | None = None
    compliance_rate: float | None = None
    spend_amount: float | None = None
    payment_terms: int | None = None
    last_assessment_date: datetime | None = None


# ── Vendor agreements ────────────────────────────────────────────────────────
class AgreementOut(_Out):
    id: int
    supplier_id: int
    agreement_name: str
    effective_date: date
    expiration_date: date | None = None
    status: str
    document_url: str | None = None
    ingestion_status: str
    ingestion_confidence: Decimal | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


# ── Programs ─────────────────────────────────────────────────────────────────
class ProgramOut(_Out):
    id: int
    agreement_id: int
    program_type: str
    program_name: str
    program_code: str | None = None
    base_rate: Decimal | None = None
    rate_type: str | None = None
    tier_structure: Any | None = None
    cap: Decimal | None = None
    eligible_skus: list[str] | None = None
    eligible_customer_classes: list[str] | None = None
    eligible_branches: list[str] | None = None
    exclusions: dict | None = None
    effective_date: date
    expiration_date: date | None = None
    claim_deadline_days: int | None = None
    reporting_format: str | None = None
    active: bool
    created_at: datetime | None = None
    agreement: AgreementOut | None = None
    supplier: SupplierOut | None = None


# ── Expected credits ─────────────────────────────────────────────────────────
class ExpectedCreditOut(_Out):
    id: int
    program_id: int
    sale_line_id: int | None = None
    period_start: date
    period_end: date
    eligible_sale_amount: Decimal
    applied_rate: Decimal
    applied_tier: str | None = None
    exclusions_amount: Decimal | None = None
    expected_amount: Decimal
    computed_at: datetime | None = None
    computation_version: str | None = None
    status: str
    claim_id: int | None = None
    program: ProgramOut | None = None


# ── Claims ───────────────────────────────────────────────────────────────────
class ClaimIn(BaseModel):
    """Body for `POST /api/claims`. Mirrors the camelCase payload the React
    client already sends — see expected-credit-engine.tsx 'Export to Claim'."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=_to_camel)

    claim_number: str
    program_id: int
    supplier_id: int
    period_start: date
    period_end: date
    submitted_amount: Decimal
    expected_amount: Decimal
    format: str
    status: str = "draft"
    submitted_at: datetime | None = None
    acknowledged_at: datetime | None = None
    adjudicated_at: datetime | None = None
    approved_amount: Decimal | None = None
    rejected_amount: Decimal | None = None
    rejection_reason_codes: list[str] | None = None
    dispute_status: str | None = None


class ClaimOut(_Out):
    id: int
    claim_number: str
    program_id: int
    supplier_id: int
    period_start: date
    period_end: date
    submitted_amount: Decimal
    expected_amount: Decimal
    format: str
    status: str
    submitted_at: datetime | None = None
    acknowledged_at: datetime | None = None
    adjudicated_at: datetime | None = None
    approved_amount: Decimal | None = None
    rejected_amount: Decimal | None = None
    rejection_reason_codes: list[str] | None = None
    dispute_status: str | None = None
    created_at: datetime | None = None
