"""Seed script — populates the thin-slice tables with the same demo data
the original `MemStorage.seedData()` produced. Idempotent: re-running is a
no-op when rows already exist.

Run:
  python -m app.seed
"""
from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select

from .db import SessionLocal, get_engine, Base
from .models import (
    Claim,
    ExpectedCredit,
    Program,
    Supplier,
    VendorAgreement,
)


SUPPLIERS = [
    {"name": "Carrier Global", "code": "CARR001", "category": "HVAC Equipment", "risk_score": 0.82, "compliance_rate": 0.94, "spend_amount": 18500000, "payment_terms": 45},
    {"name": "Trane Technologies", "code": "TRAN002", "category": "HVAC Equipment", "risk_score": 0.78, "compliance_rate": 0.91, "spend_amount": 14200000, "payment_terms": 30},
    {"name": "Lennox International", "code": "LENN003", "category": "HVAC Equipment", "risk_score": 0.85, "compliance_rate": 0.88, "spend_amount": 9800000, "payment_terms": 45},
    {"name": "Rheem Manufacturing", "code": "RHEE004", "category": "HVAC Equipment", "risk_score": 0.79, "compliance_rate": 0.92, "spend_amount": 7600000, "payment_terms": 30},
    {"name": "Mitsubishi Electric", "code": "MITS005", "category": "HVAC Systems", "risk_score": 0.88, "compliance_rate": 0.96, "spend_amount": 6200000, "payment_terms": 60},
    {"name": "Honeywell Controls", "code": "HONE006", "category": "Controls & Automation", "risk_score": 0.91, "compliance_rate": 0.97, "spend_amount": 4800000, "payment_terms": 30},
    {"name": "Johnson Controls", "code": "JOHN007", "category": "Building Systems", "risk_score": 0.84, "compliance_rate": 0.93, "spend_amount": 5400000, "payment_terms": 45},
    {"name": "Daikin Applied", "code": "DAIK008", "category": "HVAC Systems", "risk_score": 0.87, "compliance_rate": 0.95, "spend_amount": 3900000, "payment_terms": 60},
    {"name": "Pacific HVAC Supply", "code": "PAHV009", "category": "Parts & Supplies", "risk_score": 0.72, "compliance_rate": 0.84, "spend_amount": 1800000, "payment_terms": 30},
    {"name": "Northeast Coil Co.", "code": "NECO010", "category": "Parts & Supplies", "risk_score": 0.69, "compliance_rate": 0.81, "spend_amount": 1200000, "payment_terms": 30},
]

# (supplier_index, agreement_name, ingestion_confidence)
AGREEMENTS = [
    (0, "Carrier 2024 Master Distribution Agreement", "97"),
    (1, "Trane 2024 Distributor Agreement", "94"),
    (2, "Lennox Annual Distributor Program", "91"),
    (3, "Rheem Distribution Agreement 2024", "95"),
    (4, "Mitsubishi Electric Distributor Program", "98"),
    (5, "Honeywell Controls Partnership Agreement", "96"),
    (6, "Johnson Controls 2024 Distributor Agreement", "93"),
    (7, "Daikin Applied Distribution Program", "97"),
    (8, "Pacific HVAC Supply Agreement", "88"),
    (9, "Northeast Coil Distribution Terms", "85"),
]


def _programs(agreement_ids: list[int]) -> list[dict]:
    carrier, trane, lennox, rheem, *_ = agreement_ids
    return [
        # Carrier
        {
            "agreement_id": carrier, "program_type": "spa", "program_name": "ContractorPro SPA",
            "program_code": "CARR-SPA-2024-CONTRACTOR",
            "base_rate": Decimal("5.0"), "rate_type": "percent",
            "tier_structure": [{"threshold": 0, "rate": 5.0}, {"threshold": 500000, "rate": 7.0}],
            "cap": Decimal("250000"),
            "eligible_skus": ["CARR-25HC", "CARR-38HD", "CARR-40RU"],
            "eligible_customer_classes": ["contractor"],
            "exclusions": {"customerClasses": ["residential"], "skuPrefixes": ["CARR-PARTS"]},
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 12, 31),
            "claim_deadline_days": 45, "reporting_format": "edi_844", "active": True,
        },
        {
            "agreement_id": carrier, "program_type": "rebate", "program_name": "Carrier Q1 Volume Rebate",
            "program_code": "CARR-REB-2024-Q1",
            "base_rate": Decimal("3.0"), "rate_type": "percent",
            "tier_structure": [{"threshold": 0, "rate": 3.0}, {"threshold": 1000000, "rate": 4.5}],
            "cap": Decimal("150000"),
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 3, 31),
            "claim_deadline_days": 30, "reporting_format": "edi_844", "active": True,
        },
        {
            "agreement_id": carrier, "program_type": "chargeback", "program_name": "Carrier GPO Chargeback",
            "program_code": "CARR-CB-2024-GPO",
            "base_rate": Decimal("2.5"), "rate_type": "percent",
            "eligible_customer_classes": ["GPO-Northeast", "GPO-MidAtlantic"],
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 12, 31),
            "claim_deadline_days": 60, "reporting_format": "edi_844", "active": True,
        },
        # Trane
        {
            "agreement_id": trane, "program_type": "spa", "program_name": "Trane Commercial SPA",
            "program_code": "TRAN-SPA-2024-COMM",
            "base_rate": Decimal("4.5"), "rate_type": "percent",
            "tier_structure": [{"threshold": 0, "rate": 4.5}, {"threshold": 750000, "rate": 6.0}],
            "cap": Decimal("200000"),
            "eligible_skus": ["TRAN-4TWX", "TRAN-XB15", "TRAN-XR17"],
            "eligible_customer_classes": ["commercial", "contractor"],
            "exclusions": {"skuPrefixes": ["TRAN-FILTER"]},
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 12, 31),
            "claim_deadline_days": 45, "reporting_format": "edi_844", "active": True,
        },
        {
            "agreement_id": trane, "program_type": "rebate", "program_name": "Trane Annual Volume Rebate",
            "program_code": "TRAN-REB-2024-VOL",
            "base_rate": Decimal("2.0"), "rate_type": "percent",
            "tier_structure": [{"threshold": 0, "rate": 2.0}, {"threshold": 500000, "rate": 3.5}],
            "cap": Decimal("100000"),
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 12, 31),
            "claim_deadline_days": 30, "reporting_format": "csv", "active": True,
        },
        {
            "agreement_id": trane, "program_type": "allowance", "program_name": "Trane Co-op Advertising",
            "program_code": "TRAN-ALLOW-2024-COOP",
            "base_rate": Decimal("1.0"), "rate_type": "percent",
            "cap": Decimal("50000"),
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 12, 31),
            "claim_deadline_days": 90, "reporting_format": "portal", "active": True,
        },
        # Lennox
        {
            "agreement_id": lennox, "program_type": "spa", "program_name": "Lennox Contractor SPA",
            "program_code": "LENN-SPA-2024",
            "base_rate": Decimal("5.0"), "rate_type": "percent",
            "tier_structure": [{"threshold": 0, "rate": 5.0}, {"threshold": 400000, "rate": 6.5}],
            "cap": Decimal("120000"),
            "eligible_skus": ["LENN-XC21", "LENN-EL296V"],
            "eligible_customer_classes": ["contractor"],
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 12, 31),
            "claim_deadline_days": 45, "reporting_format": "edi_844", "active": True,
        },
        # Rheem
        {
            "agreement_id": rheem, "program_type": "rebate", "program_name": "Rheem Volume Rebate",
            "program_code": "RHEE-REB-2024",
            "base_rate": Decimal("3.5"), "rate_type": "percent",
            "tier_structure": [{"threshold": 0, "rate": 3.5}, {"threshold": 600000, "rate": 5.0}],
            "cap": Decimal("80000"),
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 12, 31),
            "claim_deadline_days": 30, "reporting_format": "edi_844", "active": True,
        },
        # Trane FlexPath SPA — the new program added by the Helm-MVP-Sutej work
        {
            "agreement_id": trane, "program_type": "spa", "program_name": "Trane FlexPath SPA",
            "program_code": "TRAN-SPA-FLEXPATH-Q1",
            "base_rate": Decimal("4.0"), "rate_type": "percent",
            "tier_structure": [{"threshold": 0, "rate": 4.0}, {"threshold": 500000, "rate": 5.0}],
            "cap": Decimal("300000"),
            "eligible_skus": ["TRAN-4TWX", "TRAN-XB15", "TRAN-XR17", "TRAN-FLEX-100", "TRAN-FLEX-200", "TRAN-FLEX-300"],
            "eligible_customer_classes": ["contractor", "commercial"],
            "exclusions": {"excludeReturns": True, "dedup": True},
            "effective_date": date(2024, 1, 1), "expiration_date": date(2024, 3, 31),
            "claim_deadline_days": 60, "reporting_format": "edi_844", "active": True,
        },
    ]


def seed() -> None:
    # Make sure tables exist (handy when running before alembic).
    Base.metadata.create_all(bind=get_engine())

    with SessionLocal() as db:
        if db.scalar(select(Supplier).limit(1)):
            print("Seed: suppliers already present, skipping.")
            return

        # Suppliers
        last_assessment = datetime.utcnow() - timedelta(days=30)
        supplier_objs = [
            Supplier(
                **s,
                contact_name=f"{s['name']} Contact",
                email=f"ap@{s['code'].lower()}.com",
                phone="+1-800-555-0100",
                address="123 Industrial Blvd, Hartford, CT",
                status="active",
                last_assessment_date=last_assessment,
            )
            for s in SUPPLIERS
        ]
        db.add_all(supplier_objs)
        db.flush()
        supplier_ids = [s.id for s in supplier_objs]

        # Agreements
        agreement_objs = [
            VendorAgreement(
                supplier_id=supplier_ids[idx],
                agreement_name=name,
                effective_date=date(2024, 1, 1),
                expiration_date=date(2024, 12, 31),
                status="active",
                document_url=f"/docs/agreements/{idx + 1}.pdf",
                ingestion_status="parsed",
                ingestion_confidence=Decimal(conf),
            )
            for idx, name, conf in AGREEMENTS
        ]
        db.add_all(agreement_objs)
        db.flush()
        agreement_ids = [a.id for a in agreement_objs]

        # Programs
        program_objs = [Program(**p) for p in _programs(agreement_ids)]
        db.add_all(program_objs)
        db.flush()

        # A couple of demo expected credits so "Previously Computed Credits"
        # has rows on first load. Keep numbers small/illustrative.
        flexpath = next(
            p for p in program_objs if p.program_code == "TRAN-SPA-FLEXPATH-Q1"
        )
        carrier_q1 = next(
            p for p in program_objs if p.program_code == "CARR-REB-2024-Q1"
        )
        db.add_all([
            ExpectedCredit(
                program_id=flexpath.id,
                period_start=date(2024, 1, 1), period_end=date(2024, 3, 31),
                eligible_sale_amount=Decimal("4694200"),
                applied_rate=Decimal("5.0"),
                applied_tier="Tier 2 (>$500k)",
                exclusions_amount=Decimal("0"),
                expected_amount=Decimal("234710"),
                computation_version="v2.2.0",
                status="computed",
            ),
            ExpectedCredit(
                program_id=carrier_q1.id,
                period_start=date(2024, 1, 1), period_end=date(2024, 3, 31),
                eligible_sale_amount=Decimal("1820000"),
                applied_rate=Decimal("4.5"),
                applied_tier="Tier 2 (>$1M)",
                exclusions_amount=Decimal("0"),
                expected_amount=Decimal("81900"),
                computation_version="v2.2.0",
                status="claimed",
            ),
        ])

        db.commit()
        print(
            f"Seed: inserted {len(supplier_objs)} suppliers, "
            f"{len(agreement_objs)} agreements, {len(program_objs)} programs, "
            "2 expected credits."
        )


if __name__ == "__main__":
    seed()
