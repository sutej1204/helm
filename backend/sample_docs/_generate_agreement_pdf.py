"""Generate a sample distribution agreement PDF.

Used to test the AI agreement-extraction path. Run:
  python -m sample_docs._generate_agreement_pdf bbb        # default
  python -m sample_docs._generate_agreement_pdf crestline

The output PDF mirrors the data in the matching CSV agreement file so
the deterministic and AI paths produce equivalent rebate maps.
"""
from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


HERE = Path(__file__).resolve().parent


# Same data as the CSVs — kept here so the PDF is self-contained.
BBB_PROGRAMS = [
    ("8888006.100",      "BBB Central Bill",       "AAPA",          "QUARTERLY", "3.00%",  "GE03, GE08"),
    ("8888812.10MWI",    "Perfect Step Group",     "Vendor direct", "QUARTERLY", "8.50%",  "PS10, GE10"),
    ("8888015.100MWI",   "BBB HD Loyalty",         "Vendor direct", "QUARTERLY", "8.25%",  "GE02, GE10"),
    ("8888015.105MWI",   "BBB RE Loyalty",         "Vendor direct", "QUARTERLY", "8.25%",  "GE02, GE10"),
    ("8888016.100MWI",   "Perfect Step Master",    "Vendor direct", "QUARTERLY", "2.00%",  "PS10, GE10"),
    ("8888017.100",      "BBB Trubo Para",         "Vendor direct", "QUARTERLY", "2.50%",  "OE10, GE08"),
    ("8888018.100",      "BBB Power Steer",        "Vendor direct", "QUARTERLY", "3.50%",  "GE03, GE06"),
    ("8888018.105",      "BBB Caliper Volume",     "Vendor direct", "QUARTERLY", "10.50%", "PS10, GE06"),
    ("8888DEVAL",        "BBB Devel All",          "Vendor direct", "MONTHLY",   "8.50%",  "GE02, GE03, GE04, GE06, GE07, GE10, OE10, WL01, WL02"),
    ("8888PLHD-MKTI",    "BBB RE Volume",          "Vendor direct", "MONTHLY",   "11.00%", "GE02, GE03, GE04, GE07, GE10"),
    ("8888PLLD-MKTI",    "BBB Volume",             "Vendor direct", "MONTHLY",   "11.00%", "GE03, GE04, GE10, PS10"),
    ("8888PS-BSCL-IP",   "BBB Caliper Char",       "Vendor direct", "MONTHLY",   "8.00%",  "GE03, PS10"),
    ("8888PS-PCLM",      "BBB Caliper Loyalty",    "Vendor direct", "MONTHLY",   "6.00%",  "GE02, PS10"),
]

CRESTLINE_PROGRAMS = [
    ("5001023.100",      "Crestline Central Bill",      "APAA",          "QUARTERLY", "3.50%",  "DC03, DC04"),
    ("5001500.10MWI",    "Premier Step Group",          "Vendor direct", "QUARTERLY", "9.00%",  "RG10, RG20"),
    ("5001023.105MWI",   "Crestline HD Loyalty",        "Vendor direct", "QUARTERLY", "8.75%",  "DC02, DC03"),
    ("5001500.100MWI",   "Crestline RE Loyalty",        "Vendor direct", "QUARTERLY", "7.50%",  "DC02, RG10"),
    ("5001234.100",      "Crestline Brake Pad",         "Vendor direct", "QUARTERLY", "4.00%",  "SW20, WH02"),
    ("5001234.105",      "Crestline Brake Volume",      "Vendor direct", "QUARTERLY", "9.50%",  "SW20, DC04"),
    ("5001CRDEVAL",      "Crestline Development",       "Vendor direct", "MONTHLY",   "8.00%",  "DC02, DC03, DC04, WH01, WH02"),
    ("5001PLHD-MKTI",    "Crestline RE Volume",         "Vendor direct", "MONTHLY",   "10.00%", "DC02, DC03, DC04, SW20"),
    ("5001PLLD-MKTI",    "Crestline Volume",            "Vendor direct", "MONTHLY",   "11.50%", "DC03, DC04, RG10, SW20"),
    ("5001PLST-MKTI",    "Crestline Power Steer",       "Vendor direct", "MONTHLY",   "1.50%",  "WH02"),
    ("5001PLTB-MKTI",    "Crestline Trubo Loyalty",     "Vendor direct", "MONTHLY",   "2.00%",  "NE10, WH01"),
    ("5001PS-BSCL-IP",   "Crestline Caliper Char",      "Vendor direct", "MONTHLY",   "7.50%",  "SW20, RG20, DC03"),
    ("5001PS-PCLM",      "Crestline Caliper Loyalty",   "Vendor direct", "MONTHLY",   "5.00%",  "DC02, RG10"),
    ("5001NE-PROMO",     "Crestline Northeast Promo",   "Vendor direct", "QUARTERLY", "8.00%",  "NE10, WH01"),
    ("5001SW-PROMO",     "Crestline Southwest Promo",   "Vendor direct", "QUARTERLY", "9.00%",  "SW20, RG20"),
]


PRESETS = {
    "bbb": {
        "output": HERE / "BBB_Distribution_Agreement_2024.pdf",
        "supplier_name": "BBB Industries, Inc.",
        "supplier_addr": ["BBB Industries, Inc.", "1234 Industrial Way", "Birmingham, AL 35246"],
        "primary_color": "#0b3a82",
        "accent_color": "#cf2026",
        "logo_first": "BBB",
        "logo_second": "INDUSTRIES",
        "agreement_no": "AG-2024-BBB-DISTR",
        "effective_date": "January 1, 2024",
        "expiration_date": "December 31, 2024",
        "payment_terms": "Net 30",
        "programs": BBB_PROGRAMS,
        "footer": (
            "This 2024 Master Distribution Agreement governs all rebate, "
            "SPA, and chargeback programs between BBB Industries, Inc. "
            "and the Distributor. All rebate percentages are applied to "
            "qualifying P1 invoiced sales by VCSC code, paid quarterly "
            "or monthly per program. Returns and dead stock excluded."
        ),
    },
    "crestline": {
        "output": HERE / "Crestline_Distribution_Agreement_2024.pdf",
        "supplier_name": "Crestline Industries, Inc.",
        "supplier_addr": ["Crestline Industries, Inc.", "Vendor Programs Department", "PO BOX 4827, Phoenix, AZ 85072-3812"],
        "primary_color": "#1f5f3f",
        "accent_color": "#c9870a",
        "logo_first": "CRESTLINE",
        "logo_second": "INDUSTRIES",
        "agreement_no": "AG-2024-CRESTLINE-DIST",
        "effective_date": "January 1, 2024",
        "expiration_date": "December 31, 2024",
        "payment_terms": "Net 30",
        "programs": CRESTLINE_PROGRAMS,
        "footer": (
            "Crestline Industries 2024 Distribution Agreement. All rebate "
            "percentages apply to net P1 invoiced sales by VCSC code over "
            "the program period. Disputes must be filed within 90 days of "
            "the credit memo issue date."
        ),
    },
}


def build(preset: str = "bbb") -> Path:
    if preset not in PRESETS:
        raise SystemExit(
            f"Unknown preset {preset!r}. Available: {', '.join(sorted(PRESETS))}"
        )
    p = PRESETS[preset]
    output = p["output"]

    primary = colors.HexColor(p["primary_color"])

    doc = SimpleDocTemplate(
        str(output),
        pagesize=letter,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()
    title = ParagraphStyle("Title", parent=styles["Heading1"], fontSize=20,
                           textColor=primary, spaceAfter=4)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=11,
                        textColor=primary, spaceAfter=6, spaceBefore=10)
    body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9, leading=12)
    small = ParagraphStyle("Small", parent=styles["Normal"], fontSize=8, leading=10)

    story: list = []

    # Header
    header = Table(
        [[
            Paragraph(
                f'<font color="{p["primary_color"]}" size=20><b>{p["logo_first"]}</b></font> '
                f'<font color="{p["accent_color"]}" size=20><b>{p["logo_second"]}</b></font>',
                title,
            ),
            Paragraph(
                "<b>Distribution Agreement — 2024</b><br/>"
                f"<b>AGREEMENT NO.:</b> {p['agreement_no']}<br/>"
                f"<b>EFFECTIVE:</b> {p['effective_date']}<br/>"
                f"<b>EXPIRES:</b> {p['expiration_date']}<br/>"
                f"<b>TERMS:</b> {p['payment_terms']}",
                body,
            ),
        ]],
        colWidths=[3.5 * inch, 3.8 * inch],
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, primary),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(header)
    story.append(Spacer(1, 6))

    # Parties
    story.append(Paragraph("<b>BETWEEN</b>", h2))
    story.append(Paragraph(
        f"<b>Vendor:</b> {p['supplier_addr'][0]}<br/>" + "<br/>".join(p["supplier_addr"][1:]),
        body,
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>Distributor:</b> Helm Distribution Co.<br/>"
        "1200 Industrial Blvd<br/>"
        "Hartford, CT 06120",
        body,
    ))

    # Programs section
    story.append(Paragraph("REBATE & CHARGEBACK PROGRAMS", h2))
    story.append(Paragraph(
        "The following programs apply for the 2024 program year. "
        "Rebate percentages are calculated on net P1 invoiced sales "
        "by VCSC code over the program period. Where a VCSC qualifies "
        "under multiple programs, the maximum applicable rate is paid.",
        body,
    ))
    story.append(Spacer(1, 6))

    # Programs table
    program_rows = [["AWI CODE", "PROGRAM NAME", "DELIVERY", "FREQUENCY", "REBATE %", "ELIGIBLE VCSC"]]
    for row in p["programs"]:
        program_rows.append(list(row))

    program_tbl = Table(
        program_rows,
        colWidths=[1.2 * inch, 1.7 * inch, 0.85 * inch, 0.85 * inch, 0.65 * inch, 2.05 * inch],
        repeatRows=1,
    )
    program_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (4, 1), (4, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#888")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#ccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(program_tbl)
    story.append(Spacer(1, 14))

    # Footer
    story.append(Paragraph("TERMS & CONDITIONS", h2))
    story.append(Paragraph(p["footer"], small))

    doc.build(story)
    return output


if __name__ == "__main__":
    preset = sys.argv[1].lower() if len(sys.argv) > 1 else "bbb"
    out = build(preset)
    print(f"Wrote {out} ({out.stat().st_size:,} bytes)")
