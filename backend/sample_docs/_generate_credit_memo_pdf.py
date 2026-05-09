"""One-shot generator for sample credit-memo PDFs.

Run:
  python -m sample_docs._generate_credit_memo_pdf            # default: BBB
  python -m sample_docs._generate_credit_memo_pdf bbb        # same as above
  python -m sample_docs._generate_credit_memo_pdf crestline  # Crestline preset

Why this file is checked in: gives anyone cloning the repo a way to
regenerate the demo PDFs without committing binary blobs that drift.
The generated PDFs ARE also committed so casual users don't need
reportlab installed.
"""
from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


HERE = Path(__file__).resolve().parent


# ── Presets ──────────────────────────────────────────────────────────────────
# Each preset matches the corresponding CSV in this directory so the analysis
# produces the same numbers regardless of which upload format the user picks.

BBB_LINE_ITEMS = [
    ("8888015.100MWI", "GE02", "BBB HD Loyalty Credit GE02", 1, -22500.00),
    ("8888PLHD-MKTI",  "GE02", "BBB RE Volume Credit GE02",   1, -18900.00),
    ("8888006.100",    "GE03", "BBB Central Bill Credit GE03", 1,  -3200.00),
    ("8888PLLD-MKTI",  "GE03", "BBB Volume Credit GE03",       1,  -7100.00),
    ("8888PLLD-MKTI",  "GE04", "BBB Volume Credit GE04",       1,  -4400.00),
    ("8888018.100",    "GE06", "BBB Power Steer Credit GE06",  1,   -260.00),
    ("8888DEVAL",      "GE07", "BBB Devel Credit GE07",        1,   -450.00),
    ("8888PLLD-MKTI",  "GE10", "BBB Volume Credit GE10",       1,    -30.00),
    ("8888812.10MWI",  "PS10", "Perfect Step Credit PS10",     1, -205000.00),
    ("8888016.100MWI", "PS10", "Perfect Step Mas Credit PS10", 1, -13200.00),
    ("8888DEVAL",      "WL01", "BBB Devel WL01 Credit",        1,  -4750.00),
    ("8888DEVAL",      "WL02", "BBB Devel WL02 Credit",        1,   -310.00),
    ("8888017.100",    "OE10", "BBB Trubo Para Credit OE10",   1, -89200.00),
]

CRESTLINE_LINE_ITEMS = [
    ("5001023.105MWI", "DC02", "Crestline HD Loyalty Credit DC02", 1, -32000.00),
    ("5001PLHD-MKTI",  "DC02", "Crestline RE Volume Credit DC02",  1, -13500.00),
    ("5001023.100",    "DC03", "Crestline Central Bill Credit DC03", 1, -3200.00),
    ("5001PLLD-MKTI",  "DC03", "Crestline Volume Credit DC03",     1, -5400.00),
    ("5001PLLD-MKTI",  "DC04", "Crestline Volume Credit DC04",     1, -5500.00),
    ("5001CRDEVAL",    "WH01", "Crestline Devel WH01 Credit",      1, -13200.00),
    ("5001CRDEVAL",    "WH02", "Crestline Devel WH02 Credit",      1, -5800.00),
    ("5001NE-PROMO",   "NE10", "Crestline Northeast Promo NE10",   1, -28500.00),
    ("5001PLHD-MKTI",  "SW20", "Crestline RE Volume Credit SW20",  1, -48000.00),
    ("5001PLLD-MKTI",  "RG10", "Crestline Volume Credit RG10",     1, -119000.00),
]


PRESETS = {
    "bbb": {
        "output": HERE / "BBB_Credit_Memo_3373974.pdf",
        "memo_number": "3373974",
        "memo_date": "23-SEP-2024",
        "supplier_name": "BBB Industries, LLC",
        "primary_color": "#0b3a82",  # navy
        "accent_color": "#cf2026",   # red
        "logo_first": "BBB",
        "logo_second": "INDUSTRIES",
        "remit_addr": [
            "BBB Industries, LLC",
            "Dept #29251",
            "PO BOX 11763",
            "Birmingham, AL 35246-9295",
        ],
        "sales_order_no": "377371",
        "customer_order_no": "3373974-Q3",
        "purchase_order_no": "PO-2024-Q3-CRED",
        "incentive": "QUARTERLY REBATE",
        "terms": "5% 15TH Net 30",
        "comment": (
            "Quarterly rebate credit memo covering Q2-Q3 2024 POS pull. "
            "Apply against open AP balance per terms. Reference SPA / "
            "rebate program family AWI codes per line."
        ),
        "line_items": BBB_LINE_ITEMS,
    },
    "crestline": {
        "output": HERE / "Crestline_Credit_Memo_4582193.pdf",
        "memo_number": "4582193",
        "memo_date": "15-SEP-2024",
        "supplier_name": "Crestline Industries, Inc.",
        "primary_color": "#1f5f3f",  # forest green
        "accent_color": "#c9870a",   # amber
        "logo_first": "CRESTLINE",
        "logo_second": "INDUSTRIES",
        "remit_addr": [
            "Crestline Industries, Inc.",
            "Vendor Programs Dept",
            "PO BOX 4827",
            "Phoenix, AZ 85072-3812",
        ],
        "sales_order_no": "458219",
        "customer_order_no": "4582193-Q3",
        "purchase_order_no": "PO-2024-Q3-CRESTLINE",
        "incentive": "QUARTERLY REBATE",
        "terms": "Net 30",
        "comment": (
            "Apr-Aug 2024 POS reconciliation rebate disbursement. Multi-program "
            "credits applied per the 2024 distribution agreement. RG20 codes "
            "pending adjudication and not included on this memo."
        ),
        "line_items": CRESTLINE_LINE_ITEMS,
    },
}


def build(preset: str = "bbb") -> Path:
    if preset not in PRESETS:
        raise SystemExit(
            f"Unknown preset {preset!r}. Available: {', '.join(sorted(PRESETS))}"
        )
    p = PRESETS[preset]
    output = p["output"]
    line_items = p["line_items"]
    primary = colors.HexColor(p["primary_color"])
    accent = colors.HexColor(p["accent_color"])
    remit_lines = "<br/>".join(p["remit_addr"])

    doc = SimpleDocTemplate(
        str(output),
        pagesize=letter,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title", parent=styles["Heading1"], fontSize=22,
        textColor=primary, spaceAfter=4,
    )
    body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9, leading=11)
    small = ParagraphStyle("Small", parent=styles["Normal"], fontSize=8, leading=10)

    story: list = []

    # ── Header ──────────────────────────────────────────────────────────────
    header = Table(
        [[
            Paragraph(
                f'<font color="{p["primary_color"]}" size=22><b>{p["logo_first"]}</b></font> '
                f'<font color="{p["accent_color"]}" size=22><b>{p["logo_second"]}</b></font>',
                title_style,
            ),
            Paragraph(
                "<b>Credit Memo</b><br/>"
                f"<b>NUMBER:</b>  {p['memo_number']}<br/>"
                f"<b>DATE:</b>    {p['memo_date']}<br/>"
                "<b>DELIVERY:</b> 0",
                body,
            ),
        ]],
        colWidths=[3.7 * inch, 3.6 * inch],
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, primary),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(header)
    story.append(Spacer(1, 8))

    # ── Bill-to / Ship-to / Cross-Dock ──────────────────────────────────────
    addresses = Table(
        [[
            Paragraph(
                "<b>BILL TO:</b><br/>"
                "Helm Distribution Co.<br/>"
                "Procurement Finance — AP<br/>"
                "1200 Industrial Blvd<br/>"
                "Hartford, CT 06120",
                body,
            ),
            Paragraph(
                "<b>SHIP TO:</b><br/>"
                "Helm Distribution Co.<br/>"
                "DC-7 Receiving Dock<br/>"
                "1200 Industrial Blvd<br/>"
                "Hartford, CT 06120",
                body,
            ),
            Paragraph(
                "<b>REMIT TO:</b><br/>" + remit_lines,
                body,
            ),
        ]],
        colWidths=[2.5 * inch, 2.5 * inch, 2.3 * inch],
    )
    addresses.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#888")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#bbb")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(addresses)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>CROSS-DOCK :</b>  &nbsp;", body))
    story.append(Spacer(1, 2))

    # ── Order metadata ──────────────────────────────────────────────────────
    meta = Table(
        [
            ["SALES ORDER NO.", "CUSTOMER ORDER NO.", "PURCHASE ORDER NO.", "INCENTIVE", "TERMS"],
            [p["sales_order_no"], p["customer_order_no"], p["purchase_order_no"], p["incentive"], p["terms"]],
        ],
        colWidths=[1.5 * inch, 1.8 * inch, 1.7 * inch, 1.5 * inch, 1.0 * inch],
    )
    # Lighten the primary colour for the row-header background.
    primary_light = colors.HexColor(p["primary_color"]).clone()
    primary_light.alpha = 0.15
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary_light),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#888")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#bbb")),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(meta)
    story.append(Spacer(1, 12))

    # ── Line items table ────────────────────────────────────────────────────
    line_data = [["LINE", "PROGRAM AWI", "VCSC", "DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"]]
    total = 0.0
    for i, (awi, vcsc, desc, qty, amt) in enumerate(line_items, 1):
        line_data.append([str(i), awi, vcsc, desc, str(qty), f"${amt:,.2f}", f"${amt:,.2f}"])
        total += amt

    line_table = Table(
        line_data,
        colWidths=[0.4*inch, 1.2*inch, 0.6*inch, 2.4*inch, 0.4*inch, 1.0*inch, 1.0*inch],
        repeatRows=1,
    )
    line_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (4, 1), (-1, -1), "RIGHT"),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#888")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#ccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 12))

    # ── Totals box ──────────────────────────────────────────────────────────
    totals = Table(
        [
            ["UNIT TOTAL", f"${total:,.2f}"],
            ["CORE TOTAL", "0.00"],
            ["CHARGES",    "0.00"],
            ["SALES TAX",  "0.00"],
            ["TOTAL AMOUNT", f"${total:,.2f} USD"],
        ],
        colWidths=[1.6 * inch, 1.6 * inch],
        hAlign="RIGHT",
    )
    totals.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#888")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#bbb")),
        ("BACKGROUND", (0, -1), (-1, -1), primary),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.whitesmoke),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(totals)
    story.append(Spacer(1, 16))

    story.append(Paragraph(f"<b>COMMENTS:</b> {p['comment']}", small))

    doc.build(story)
    return output


if __name__ == "__main__":
    preset = sys.argv[1].lower() if len(sys.argv) > 1 else "bbb"
    out = build(preset)
    print(f"Wrote {out} ({out.stat().st_size:,} bytes)")
