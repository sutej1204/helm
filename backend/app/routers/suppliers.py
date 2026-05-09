from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import require_token
from ..db import get_db
from ..models import Supplier
from ..schemas import SupplierOut

router = APIRouter(
    prefix="/api/suppliers",
    tags=["suppliers"],
    dependencies=[Depends(require_token)],
)


@router.get("", response_model=list[SupplierOut], response_model_by_alias=True)
def list_suppliers(db: Session = Depends(get_db)) -> list[Supplier]:
    return db.query(Supplier).order_by(Supplier.id).all()


@router.get("/{supplier_id}", response_model=SupplierOut, response_model_by_alias=True)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)) -> Supplier:
    s = db.get(Supplier, supplier_id)
    if not s:
        raise HTTPException(404, "Supplier not found")
    return s
