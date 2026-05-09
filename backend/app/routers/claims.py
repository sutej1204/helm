from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import require_token
from ..db import get_db
from ..models import Claim, Program, Supplier
from ..schemas import ClaimIn, ClaimOut

router = APIRouter(
    prefix="/api/claims",
    tags=["claims"],
    dependencies=[Depends(require_token)],
)


@router.get("", response_model=list[ClaimOut], response_model_by_alias=True)
def list_claims(db: Session = Depends(get_db)) -> list[Claim]:
    return db.query(Claim).order_by(Claim.id.desc()).all()


@router.get("/{claim_id}", response_model=ClaimOut, response_model_by_alias=True)
def get_claim(claim_id: int, db: Session = Depends(get_db)) -> Claim:
    c = db.get(Claim, claim_id)
    if not c:
        raise HTTPException(404, "Claim not found")
    return c


@router.post(
    "",
    response_model=ClaimOut,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
def create_claim(payload: ClaimIn, db: Session = Depends(get_db)) -> Claim:
    if not db.get(Program, payload.program_id):
        raise HTTPException(400, f"Program {payload.program_id} does not exist")
    if not db.get(Supplier, payload.supplier_id):
        raise HTTPException(400, f"Supplier {payload.supplier_id} does not exist")

    claim = Claim(**payload.model_dump())
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim
