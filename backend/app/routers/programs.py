from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..auth import require_token
from ..db import get_db
from ..models import Program, VendorAgreement
from ..schemas import ProgramOut

router = APIRouter(
    prefix="/api/programs",
    tags=["programs"],
    dependencies=[Depends(require_token)],
)


@router.get("", response_model=list[ProgramOut], response_model_by_alias=True)
def list_programs(db: Session = Depends(get_db)) -> list[Program]:
    return (
        db.query(Program)
        .options(joinedload(Program.agreement).joinedload(VendorAgreement.supplier))
        .order_by(Program.id)
        .all()
    )


@router.get("/{program_id}", response_model=ProgramOut, response_model_by_alias=True)
def get_program(program_id: int, db: Session = Depends(get_db)) -> Program:
    p = db.get(Program, program_id)
    if not p:
        raise HTTPException(404, "Program not found")
    return p
