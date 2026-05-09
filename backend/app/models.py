"""SQLAlchemy models — thin slice for the expected-credit-engine page.

Tables ported from the original Drizzle schema (`shared/schema.ts`):
  suppliers, vendor_agreements, programs, expected_credits, claims.

Other tables in the original schema (purchase_orders, invoices,
customer_sales, settlement_events, etc.) are intentionally omitted from
this initial slice — add them as more pages need to come online.
"""
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    JSON,
    ARRAY,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    contact_name: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(Text)
    address: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active")
    risk_score: Mapped[float | None] = mapped_column()
    compliance_rate: Mapped[float | None] = mapped_column()
    spend_amount: Mapped[float | None] = mapped_column()
    payment_terms: Mapped[int | None] = mapped_column(Integer)
    last_assessment_date: Mapped[datetime | None] = mapped_column(DateTime)


class VendorAgreement(Base):
    __tablename__ = "vendor_agreements"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id"), nullable=False
    )
    agreement_name: Mapped[str] = mapped_column(Text, nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    expiration_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active")
    document_url: Mapped[str | None] = mapped_column(Text)
    ingestion_status: Mapped[str] = mapped_column(
        Text, nullable=False, default="parsed"
    )
    ingestion_confidence: Mapped[Decimal | None] = mapped_column(Numeric)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    supplier: Mapped["Supplier"] = relationship()


class Program(Base):
    __tablename__ = "programs"

    id: Mapped[int] = mapped_column(primary_key=True)
    agreement_id: Mapped[int] = mapped_column(
        ForeignKey("vendor_agreements.id"), nullable=False
    )
    program_type: Mapped[str] = mapped_column(Text, nullable=False)
    program_name: Mapped[str] = mapped_column(Text, nullable=False)
    program_code: Mapped[str | None] = mapped_column(Text)
    base_rate: Mapped[Decimal | None] = mapped_column(Numeric)
    rate_type: Mapped[str | None] = mapped_column(Text)
    tier_structure: Mapped[list | dict | None] = mapped_column(JSON)
    cap: Mapped[Decimal | None] = mapped_column(Numeric)
    eligible_skus: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    eligible_customer_classes: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    eligible_branches: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    exclusions: Mapped[dict | None] = mapped_column(JSON)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    expiration_date: Mapped[date | None] = mapped_column(Date)
    claim_deadline_days: Mapped[int | None] = mapped_column(Integer)
    reporting_format: Mapped[str | None] = mapped_column(Text)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    agreement: Mapped["VendorAgreement"] = relationship()


class ExpectedCredit(Base):
    __tablename__ = "expected_credits"

    id: Mapped[int] = mapped_column(primary_key=True)
    program_id: Mapped[int] = mapped_column(
        ForeignKey("programs.id"), nullable=False
    )
    # sale_line_id references customer_sale_lines in the full schema; thin
    # slice keeps it as a plain column without an FK constraint.
    sale_line_id: Mapped[int | None] = mapped_column(Integer)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    eligible_sale_amount: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    applied_rate: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    applied_tier: Mapped[str | None] = mapped_column(Text)
    exclusions_amount: Mapped[Decimal] = mapped_column(Numeric, default=Decimal("0"))
    expected_amount: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    computation_version: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="computed")
    claim_id: Mapped[int | None] = mapped_column(Integer)
    # Upload-analysis fields (populated by /api/expected-credits/bulk).
    # Nullable because seeded rows from the original demo don't carry
    # per-VCSC data.
    vcsc: Mapped[str | None] = mapped_column(Text)
    received_amount: Mapped[Decimal | None] = mapped_column(Numeric)
    mismatch_amount: Mapped[Decimal | None] = mapped_column(Numeric)
    program_codes: Mapped[list[str] | None] = mapped_column(ARRAY(Text))


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[int] = mapped_column(primary_key=True)
    claim_number: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    program_id: Mapped[int] = mapped_column(
        ForeignKey("programs.id"), nullable=False
    )
    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id"), nullable=False
    )
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    submitted_amount: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    expected_amount: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    format: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="draft")
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime)
    adjudicated_at: Mapped[datetime | None] = mapped_column(DateTime)
    approved_amount: Mapped[Decimal | None] = mapped_column(Numeric)
    rejected_amount: Mapped[Decimal | None] = mapped_column(Numeric)
    rejection_reason_codes: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    dispute_status: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
