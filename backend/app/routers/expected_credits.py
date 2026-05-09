from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..auth import require_token
from ..db import get_db
from ..models import ExpectedCredit, Program, VendorAgreement
from ..schemas import (
    BulkExpectedCreditRequest,
    BulkExpectedCreditResponse,
    ExpectedCreditOut,
)

router = APIRouter(
    prefix="/api/expected-credits",
    tags=["expected-credits"],
    dependencies=[Depends(require_token)],
)


def _hydrate_program(db: Session, rows: list[ExpectedCredit]) -> list[ExpectedCredit]:
    """Eager-load program (+ agreement + supplier) onto each row as a
    transient attribute. Avoids declaring a SQLAlchemy relationship and
    works for any list of credits."""
    if not rows:
        return rows
    program_ids = {r.program_id for r in rows}
    programs = (
        db.query(Program)
        .options(joinedload(Program.agreement).joinedload(VendorAgreement.supplier))
        .filter(Program.id.in_(program_ids))
        .all()
    )
    by_id = {p.id: p for p in programs}
    for r in rows:
        setattr(r, "program", by_id.get(r.program_id))
    return rows


@router.get(
    "",
    response_model=list[ExpectedCreditOut],
    response_model_by_alias=True,
)
def list_expected_credits(db: Session = Depends(get_db)) -> list[ExpectedCredit]:
    rows = db.query(ExpectedCredit).order_by(ExpectedCredit.id.desc()).all()
    return _hydrate_program(db, rows)


@router.post(
    "/bulk",
    response_model=BulkExpectedCreditResponse,
    response_model_by_alias=True,
)
def bulk_create_expected_credits(
    req: BulkExpectedCreditRequest,
    db: Session = Depends(get_db),
) -> BulkExpectedCreditResponse:
    """Persist a batch of upload-analysis credits — one row per VCSC.

    Idempotency: any prior rows tied to the same (program=AI-ANALYSIS,
    period, computation_version) are deleted before insert, so re-running
    the engine on the same period replaces rather than duplicates.

    The FK target is the seeded `AI-ANALYSIS` placeholder program (created
    by `ensure_ai_analysis_placeholder()` on startup).
    """
    placeholder = (
        db.query(Program).filter(Program.program_code == "AI-ANALYSIS").one_or_none()
    )
    if not placeholder:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI-ANALYSIS placeholder program is not present in the database. "
                "Restart the API to run the startup seed, or re-run "
                "ensure_ai_analysis_placeholder()."
            ),
        )

    # Replace prior rows for this run.
    deleted = (
        db.query(ExpectedCredit)
        .filter(
            ExpectedCredit.program_id == placeholder.id,
            ExpectedCredit.period_start == req.period_start,
            ExpectedCredit.period_end == req.period_end,
            ExpectedCredit.computation_version == req.computation_version,
        )
        .delete(synchronize_session=False)
    )

    inserted_rows: list[ExpectedCredit] = []
    for item in req.items:
        # Normalise rebate %: incoming may be 0.085 (fraction) or 8.5 (percent).
        applied_rate = (
            item.applied_rate * Decimal("100")
            if item.applied_rate < Decimal("1")
            else item.applied_rate
        )
        row = ExpectedCredit(
            program_id=placeholder.id,
            period_start=req.period_start,
            period_end=req.period_end,
            eligible_sale_amount=item.sales_amount,
            applied_rate=applied_rate,
            applied_tier=(
                f"{req.supplier_name} · {item.vcsc}" if req.supplier_name else item.vcsc
            ),
            exclusions_amount=Decimal("0"),
            expected_amount=item.expected_amount,
            computation_version=req.computation_version,
            status=item.status,
            vcsc=item.vcsc,
            received_amount=item.received_amount,
            mismatch_amount=item.mismatch,
            program_codes=item.program_codes or None,
        )
        db.add(row)
        inserted_rows.append(row)

    db.commit()
    for r in inserted_rows:
        db.refresh(r)

    return BulkExpectedCreditResponse(
        inserted=len(inserted_rows),
        deleted=deleted,
        program_id=placeholder.id,
        rows=_hydrate_program(db, inserted_rows),
    )
