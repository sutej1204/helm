"""One-shot generator for a sample BBB credit memo PDF.

Run:  python -m sample_docs._generate_credit_memo_pdf

Why this file is checked in: gives anyone cloning the repo a way to
regenerate the demo PDF without committing a binary blob that drifts.
The generated PDF (`BBB_Credit_Memo_3373974.pdf`) IS committed too, so
casual users don't need reportlab installed.
"""
from __future__ import annotations

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
OUTPUT = HERE / "BBB_Credit_Memo_3373974.pdf"


# Same line items as BBB_Credit_Memo_3373974.csv so analyze() stays
# consistent whichever upload format the user picks.
LINE_ITEMS = [
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


def build() -> Path:
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title", parent=styles["Heading1"], fontSize=22,
        textColor=colors.HexColor("#0b3a82"), spaceAfter=4,
    )
    h2 = ParagraphStyle("H2", parent=styles["Heading3"], fontSize=10, spaceAfter=2)
    body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9, leading=11)
    small = ParagraphStyle("Small", parent=styles["Normal"], fontSize=8, leading=10)

    story: list = []

    # ── Header ──────────────────────────────────────────────────────────────
    header = Table(
        [[
            Paragraph(
                '<font color="#0b3a82" size=22><b>BBB</b></font> '
                '<font color="#cf2026" size=22><b>INDUSTRIES</b></font>',
                title_style,
            ),
            Paragraph(
                "<b>Credit Memo</b><br/>"
                "<b>NUMBER:</b>  3373974<br/>"
                "<b>DATE:</b>    23-SEP-2024<br/>"
                "<b>DELIVERY:</b> 0",
                body,
            ),
        ]],
        colWidths=[3.7 * inch, 3.6 * inch],
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, colors.HexColor("#0b3a82")),
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
                "<b>REMIT TO:</b><br/>"
                "BBB Industries, LLC<br/>"
                "Dept #29251<br/>"
                "PO BOX 11763<br/>"
                "Birmingham, AL 35246-9295",
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
            ["377371", "3373974-Q3", "PO-2024-Q3-CRED", "QUARTERLY REBATE", "5% 15TH Net 30"],
        ],
        colWidths=[1.5 * inch, 1.8 * inch, 1.7 * inch, 1.5 * inch, 1.0 * inch],
    )
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbe5f2")),
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
    for i, (awi, vcsc, desc, qty, amt) in enumerate(LINE_ITEMS, 1):
        line_data.append([str(i), awi, vcsc, desc, str(qty), f"${amt:,.2f}", f"${amt:,.2f}"])
        total += amt

    line_table = Table(
        line_data,
        colWidths=[0.4*inch, 1.2*inch, 0.6*inch, 2.4*inch, 0.4*inch, 1.0*inch, 1.0*inch],
        repeatRows=1,
    )
    line_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0b3a82")),
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
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#0b3a82")),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.whitesmoke),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(totals)
    story.append(Spacer(1, 16))

    story.append(Paragraph(
        "<b>COMMENTS:</b> Quarterly rebate credit memo covering Q2-Q3 2024 "
        "POS pull. Apply against open AP balance per terms. Reference SPA / "
        "rebate program family AWI codes per line.",
        small,
    ))

    doc.build(story)
    return OUTPUT


if __name__ == "__main__":
    out = build()
    print(f"Wrote {out} ({out.stat().st_size:,} bytes)")
