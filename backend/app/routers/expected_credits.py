from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from ..auth import require_token
from ..db import get_db
from ..models import ExpectedCredit, Program, VendorAgreement
from ..schemas import ExpectedCreditOut

router = APIRouter(
    prefix="/api/expected-credits",
    tags=["expected-credits"],
    dependencies=[Depends(require_token)],
)


@router.get(
    "",
    response_model=list[ExpectedCreditOut],
    response_model_by_alias=True,
)
def list_expected_credits(db: Session = Depends(get_db)) -> list[ExpectedCredit]:
    rows = db.query(ExpectedCredit).order_by(ExpectedCredit.id.desc()).all()
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
        # Attach as a transient attribute Pydantic picks up via from_attributes.
        # Avoids declaring a SQLAlchemy relationship for a non-FK field.
        setattr(r, "program", by_id.get(r.program_id))
    return rows
