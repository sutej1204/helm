"""Reconciliation endpoints — currently stubs.

The full implementation requires the purchase_orders, invoices,
goods_receipts, and customer_sales tables which aren't part of the thin
slice. We return canned MatchResult shapes for the three exception
invoices the 4-Way Match page advertises (ids 2, 3, 4).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_token


router = APIRouter(
    prefix="/api/recon",
    tags=["recon"],
    dependencies=[Depends(require_token)],
)


# Canned scenarios — match the data the React `four-way-match.tsx` page
# advertises in its hardcoded `exceptionInvoices` array. Keep numbers
# consistent with what the static UI shows.
_AP_MATCH_FIXTURES: dict[int, dict] = {
    2: {
        "invoice": {
            "id": 2,
            "number": "INV-CARR-2024-002",
            "supplier": "Carrier Global",
            "amount": "87420.00",
            "lineCount": 6,
        },
        "po": {
            "id": 2,
            "number": "PO-2024-0002",
            "supplier": "Carrier Global",
            "amount": "81820.00",
        },
        "receipts": [
            {"id": 12, "receivedAt": "2024-02-14", "lineCount": 6},
        ],
        "variances": [
            {
                "invoiceLine": {"id": 21, "sku": "CARR-25HC", "qty": 12, "lineTotal": "32400.00"},
                "poLine": {"id": 8, "sku": "CARR-25HC", "qty": 12, "lineTotal": "30000.00"},
                "invoicePrice": "2700.00",
                "poPrice": "2500.00",
                "contractedPrice": "2500.00",
                "priceVariance": 2400,
                "varianceFlag": "above_contract",
                "recoverable": True,
            },
            {
                "invoiceLine": {"id": 22, "sku": "CARR-38HD", "qty": 8, "lineTotal": "27200.00"},
                "poLine": {"id": 9, "sku": "CARR-38HD", "qty": 8, "lineTotal": "24000.00"},
                "invoicePrice": "3400.00",
                "poPrice": "3000.00",
                "contractedPrice": "3000.00",
                "priceVariance": 3200,
                "varianceFlag": "above_contract",
                "recoverable": True,
            },
        ],
        "matchStatus": "price_variance",
        "totalVariance": 5600,
        "hasRecoverableVariance": True,
        "summary": {
            "rule": "Helm SPA Clause §4.2 — locked unit price",
            "explanation": (
                "Carrier billed $2,700 / $3,400 against contracted SPA prices of "
                "$2,500 / $3,000. The 3-way match (Invoice ↔ PO ↔ Receipt) is "
                "clean because the PO was issued at the higher list price; only "
                "the 4th-leg comparison against the SPA agreement surfaces the "
                "$5,600 overcharge."
            ),
        },
    },
    4: {
        "invoice": {
            "id": 4,
            "number": "INV-TRAN-2024-003",
            "supplier": "Trane Technologies",
            "amount": "62100.00",
            "lineCount": 4,
        },
        "po": {
            "id": 10,
            "number": "PO-2024-0010",
            "supplier": "Trane Technologies",
            "amount": "60000.00",
        },
        "receipts": [
            {"id": 18, "receivedAt": "2024-03-04", "lineCount": 4},
        ],
        "variances": [
            {
                "invoiceLine": {"id": 41, "sku": "TRAN-XR17", "qty": 5, "lineTotal": "21500.00"},
                "poLine": {"id": 17, "sku": "TRAN-XR17", "qty": 5, "lineTotal": "20000.00"},
                "invoicePrice": "4300.00",
                "poPrice": "4000.00",
                "contractedPrice": "4000.00",
                "priceVariance": 1500,
                "varianceFlag": "above_contract",
                "recoverable": True,
            },
            {
                "invoiceLine": {"id": 42, "sku": "TRAN-XB15", "qty": 3, "lineTotal": "11400.00"},
                "poLine": {"id": 18, "sku": "TRAN-XB15", "qty": 3, "lineTotal": "10800.00"},
                "invoicePrice": "3800.00",
                "poPrice": "3600.00",
                "contractedPrice": "3600.00",
                "priceVariance": 600,
                "varianceFlag": "above_contract",
                "recoverable": True,
            },
        ],
        "matchStatus": "price_variance",
        "totalVariance": 2100,
        "hasRecoverableVariance": True,
        "summary": {
            "rule": "Trane Commercial SPA — list-vs-net pricing",
            "explanation": (
                "Two line items billed above the contracted SPA rate. Both "
                "qualify for a $2,100 chargeback under the agreement's price "
                "protection clause."
            ),
        },
    },
    3: {
        "invoice": {
            "id": 3,
            "number": "INV-TRAN-2024-002",
            "supplier": "Trane Technologies",
            "amount": "44100.00",
            "lineCount": 3,
        },
        "po": {
            "id": 11,
            "number": "PO-2024-0011",
            "supplier": "Trane Technologies",
            "amount": "44100.00",
        },
        "receipts": [
            {"id": 19, "receivedAt": "2024-03-12", "lineCount": 3},
        ],
        "variances": [],
        "matchStatus": "matched",
        "totalVariance": 0,
        "hasRecoverableVariance": False,
        "summary": {
            "rule": "All four legs aligned",
            "explanation": "Invoice, PO, receipt, and SPA agreement all consistent — no chargeback opportunity.",
        },
    },
}


@router.post("/ap-match/{invoice_id}")
def ap_match(invoice_id: int) -> dict:
    fixture = _AP_MATCH_FIXTURES.get(invoice_id)
    if fixture is None:
        raise HTTPException(404, f"No match scenario for invoice {invoice_id}")
    return fixture
