"""Deterministic per-VCSC reconciliation.

Replaces the all-Claude analysis with Python parsing + arithmetic. The
remaining Claude call (in the analyze router) is now tiny: just supplier
name, period label, and narrative summary, which are the things the
model actually does well.

Why move the math out of Claude:
  - Sonnet/Haiku get the totals wrong when summing 30+ rows (we measured
    Sonnet returning $27M against a true $9.3M aggregate).
  - Latency drops from ~12-25s to ~50-200ms for the math half.
  - Output is reproducible — re-running gives identical numbers.

The parsers handle the formats used by the sample documents
(BBB and Crestline) and degrade gracefully when columns are missing —
the analyze endpoint falls back to the legacy all-Claude path if this
function returns no eligible codes.
"""
from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass


# ── Data shapes ──────────────────────────────────────────────────────────────


@dataclass
class CodeAnalysis:
    vcsc: str
    sales_amount: float
    applied_rebate_pct: float
    expected_credit: float
    received_credit: float
    mismatch: float
    status: str  # matched | underpaid | overpaid | unclaimed
    program_codes: list[str]


@dataclass
class CalcResult:
    total_sales: float
    total_expected_credit: float
    total_received_credit: float
    total_mismatch: float
    recoverable_amount: float
    mismatch_percent: float
    weighted_avg_rebate_pct: float
    pos_lines_total: int
    pos_lines_eligible: int
    per_code: list[CodeAnalysis]
    # Pure-regex metadata pulled out alongside the math.
    credit_memo_number: str | None = None
    credit_memo_date: str | None = None
    detected_period: str | None = None


# ── Parsers ──────────────────────────────────────────────────────────────────


def _column_picker(headers: list[str], *keywords: str) -> str | None:
    """Find the header whose lowered+stripped form contains any keyword."""
    norm = [(h, re.sub(r"[^a-z0-9]", "", h.lower())) for h in headers]
    for kw in keywords:
        kwn = re.sub(r"[^a-z0-9]", "", kw.lower())
        for raw, n in norm:
            if kwn in n:
                return raw
    return None


def parse_pos_csv(text: str) -> tuple[dict[str, float], int, list[str]]:
    """Parse the POS sales CSV.

    Returns (sales_by_vcsc, total_input_lines, sample_dates) — sample_dates
    is a small set of date/month strings used to derive the period label.
    """
    sales: dict[str, float] = {}
    dates: list[str] = []
    rdr = csv.DictReader(io.StringIO(text))
    headers = rdr.fieldnames or []
    vcsc_col = _column_picker(headers, "vcsc", "vcsccode", "vcsc1")
    # Prefer the P1 (final/settled) column over P0; fall back to anything
    # that smells like an amount.
    amount_col = (
        _column_picker(headers, "p1wdinv", "p1wd", "p1inv", "p1amount")
        or _column_picker(headers, "p0wdinv", "p0wd", "p0inv", "p0amount")
        or _column_picker(headers, "amount", "total", "salesamount", "salestotal", "wd", "inv")
    )
    date_col = _column_picker(headers, "month", "date", "period")
    year_col = _column_picker(headers, "year")

    if not vcsc_col or not amount_col:
        return sales, 0, dates

    total = 0
    for row in rdr:
        total += 1
        vcsc = (row.get(vcsc_col) or "").strip().upper()
        if not vcsc:
            continue
        amount_str = (row.get(amount_col) or "").replace("$", "").replace(",", "").strip()
        try:
            amount = float(amount_str)
        except ValueError:
            continue
        sales[vcsc] = sales.get(vcsc, 0.0) + amount
        if date_col:
            d = (row.get(date_col) or "").strip()
            y = (row.get(year_col) or "").strip() if year_col else ""
            if d:
                dates.append(f"{d} {y}".strip() if y else d)
    return sales, total, dates


_VCSC_VALUE = re.compile(r"^[A-Z]{2,4}\d{2,3}$")
_PERCENT_VALUE = re.compile(r"^\s*([\d]+(?:\.\d+)?)\s*%\s*$")


def parse_agreement_csv(
    text: str,
) -> tuple[dict[str, float], dict[str, list[str]]]:
    """Parse the rebate-program agreement CSV.

    Real-world rebate spreadsheets are routinely misaligned (some rows
    skip a column, some duplicate a cell, etc.), so we detect the rebate %
    and VCSC values by VALUE PATTERN rather than column position. We
    still pick the AWI code from a header-based column when available
    because that's just text and harder to match by pattern.
    """
    rebates: dict[str, float] = {}
    programs: dict[str, list[str]] = {}
    rdr = csv.reader(io.StringIO(text))
    rows = list(rdr)
    if not rows:
        return rebates, programs

    headers = rows[0]
    awi_idx = next(
        (i for i, h in enumerate(headers)
         if "awi" in (h or "").lower() and "code" in (h or "").lower()),
        0,
    )

    for row in rows[1:]:
        # First numeric-percent cell in the row is the rebate.
        pct: float | None = None
        for cell in row:
            m = _PERCENT_VALUE.match(cell.strip()) if cell else None
            if m:
                try:
                    pct = float(m.group(1))
                except ValueError:
                    pct = None
                break
        if pct is None:
            continue

        # All cells matching the VCSC code pattern.
        vcscs = [c.strip().upper() for c in row if c and _VCSC_VALUE.match(c.strip().upper())]
        if not vcscs:
            continue

        awi = (row[awi_idx] if awi_idx < len(row) else "").strip()

        for v in vcscs:
            if pct > rebates.get(v, 0.0):
                rebates[v] = pct
            programs.setdefault(v, [])
            if awi and awi not in programs[v]:
                programs[v].append(awi)

    return rebates, programs


def parse_credit_memo(text: str) -> tuple[dict[str, float], str | None, str | None]:
    """Parse a credit memo (CSV or extracted-PDF text).

    Returns (received_by_vcsc, memo_number, memo_date) where amounts are
    positive (the magnitude of the credit). Memo number / date are pulled
    by regex from any header text we recognise.
    """
    received: dict[str, float] = {}

    # Memo metadata via regex — same logic the frontend uses for the hover
    # tooltip, but applied here too so the engine doesn't depend on the
    # frontend having extracted them first.
    memo_number = None
    memo_date = None
    num_match = re.search(r"(?:NUMBER|Memo\s*Number)[\s:]*([A-Za-z0-9\-]+)", text, re.IGNORECASE)
    if num_match:
        memo_number = num_match.group(1)
    date_match = re.search(
        r"(?:DATE|Memo\s*Date)[\s:]*([\d]{1,2}[-\s/][A-Za-z]{3,9}[-\s/][\d]{2,4}|[\d]{4}-[\d]{2}-[\d]{2})",
        text,
        re.IGNORECASE,
    )
    if date_match:
        memo_date = date_match.group(1)

    # CSV path (sample CSVs put VCSC + Credit Amount columns explicitly).
    first_line = text.split("\n", 1)[0]
    if "," in first_line and "VCSC" in first_line.upper():
        try:
            rdr = csv.DictReader(io.StringIO(text))
            headers = rdr.fieldnames or []
            vcsc_col = _column_picker(headers, "vcsc")
            amount_col = (
                _column_picker(headers, "creditamount", "credit", "amount", "total")
            )
            if vcsc_col and amount_col:
                for row in rdr:
                    vcsc = (row.get(vcsc_col) or "").strip().upper()
                    if not vcsc or vcsc == "TOTAL":
                        continue
                    a = (row.get(amount_col) or "").replace("$", "").replace(",", "").strip()
                    try:
                        received[vcsc] = received.get(vcsc, 0.0) + abs(float(a))
                    except ValueError:
                        continue
                if received:
                    return received, memo_number, memo_date
        except csv.Error:
            pass

    # PDF-text path. Two layouts in the wild:
    #   (a) all cells on one line:
    #       "1 8888015.100MWI GE02 BBB HD Loyalty Credit GE02 1 $-22,500.00 $-22,500.00"
    #   (b) pypdf split per cell, one line per cell:
    #         1
    #         8888015.100MWI
    #         GE02
    #         BBB HD Loyalty Credit GE02
    #         1
    #         $-22,500.00
    #         $-22,500.00
    # First try (a); if nothing matches, fall through to a block-walker
    # that handles (b).
    one_line_pattern = re.compile(
        r"^\s*\d+\s+\S+\s+([A-Z][A-Z0-9]{1,7})\s+.+?\$?(-?[\d,]+\.\d{2})\s+\$?(-?[\d,]+\.\d{2})\s*$",
        re.MULTILINE,
    )
    matches = list(one_line_pattern.finditer(text))
    if matches:
        for m in matches:
            vcsc = m.group(1).upper()
            amt_str = m.group(3).replace(",", "")
            try:
                received[vcsc] = received.get(vcsc, 0.0) + abs(float(amt_str))
            except ValueError:
                continue
        return received, memo_number, memo_date

    # Layout (b): walk lines, pair VCSC codes with the next $ amount.
    vcsc_line = re.compile(r"^[A-Z][A-Z0-9]{1,5}$")
    money_line = re.compile(r"^\$?\s*(-?[\d,]+\.\d{2})\s*(USD)?\s*$")
    pending: str | None = None
    pending_lookahead = 0
    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue
        if vcsc_line.fullmatch(line):
            # Skip "TOTAL" / metadata words masquerading as VCSCs by length.
            if line in {"USD", "QTY", "TOTAL", "DATE"}:
                continue
            pending = line
            pending_lookahead = 6  # look at next ~6 non-empty lines
            continue
        m = money_line.match(line)
        if m and pending and pending_lookahead > 0:
            amt = m.group(1).replace(",", "")
            try:
                received[pending] = received.get(pending, 0.0) + abs(float(amt))
            except ValueError:
                pass
            pending = None  # one amount per VCSC; ignore the duplicate "total" line
            pending_lookahead = 0
            continue
        if pending:
            pending_lookahead -= 1
            if pending_lookahead <= 0:
                pending = None

    return received, memo_number, memo_date


# ── Computation ──────────────────────────────────────────────────────────────


def _classify(expected: float, received: float) -> str:
    if expected <= 0:
        return "matched"
    if received <= 0.01:
        return "unclaimed"
    diff = expected - received
    if abs(diff) / expected <= 0.05:
        return "matched"
    return "underpaid" if diff > 0 else "overpaid"


def _format_period(dates: list[str]) -> str | None:
    """Best-effort 'Apr–Aug 2024'-style label from a list of monthly date strings."""
    if not dates:
        return None
    # Order by canonical month index when possible.
    months_order = ["january","february","march","april","may","june",
                    "july","august","september","october","november","december"]
    def month_idx(s: str) -> int:
        s = s.lower()
        for i, m in enumerate(months_order):
            if m in s or m[:3] in s:
                return i
        return -1

    indexed = [(month_idx(d), d) for d in dates]
    indexed = [(i, d) for i, d in indexed if i >= 0]
    if not indexed:
        return None
    indexed.sort()
    first = indexed[0][1]
    last = indexed[-1][1]
    # Trim to "Mon YYYY" form when possible.
    def tidy(s: str) -> str:
        m = re.search(r"([A-Za-z]+)[\s,]*(\d{4})?", s)
        if not m:
            return s
        mon = m.group(1).capitalize()[:3]
        yr = m.group(2) or ""
        return f"{mon} {yr}".strip()

    a = tidy(first)
    b = tidy(last)
    return a if a == b else f"{a}–{b}"


def compute_from_components(
    sales: dict[str, float],
    total_lines: int,
    dates: list[str],
    rebates: dict[str, float],
    programs: dict[str, list[str]],
    received: dict[str, float],
    memo_number: str | None,
    memo_date: str | None,
) -> CalcResult:
    """Run the math given pre-parsed inputs. Used by `compute()` (full
    text path) and by the analyze endpoint when an AI extractor supplies
    the rebates/programs maps for a PDF agreement."""
    eligible = sorted(set(sales) & set(rebates))
    per_code: list[CodeAnalysis] = []

    for vcsc in eligible:
        s = sales[vcsc]
        rate = rebates[vcsc]
        expected = round(s * rate / 100, 2)
        rcv = round(received.get(vcsc, 0.0), 2)
        mm = round(expected - rcv, 2)
        per_code.append(
            CodeAnalysis(
                vcsc=vcsc,
                sales_amount=round(s, 2),
                applied_rebate_pct=rate,
                expected_credit=expected,
                received_credit=rcv,
                mismatch=mm,
                status=_classify(expected, rcv),
                program_codes=programs.get(vcsc, []),
            )
        )

    total_sales = sum(c.sales_amount for c in per_code)
    total_expected = sum(c.expected_credit for c in per_code)
    total_received = sum(c.received_credit for c in per_code)
    total_mismatch = round(total_expected - total_received, 2)
    recoverable = round(sum(c.mismatch for c in per_code if c.mismatch > 0), 2)
    mismatch_pct = (total_mismatch / total_expected * 100) if total_expected else 0.0
    weighted_pct = (total_expected / total_sales * 100) if total_sales else 0.0

    return CalcResult(
        total_sales=round(total_sales, 2),
        total_expected_credit=round(total_expected, 2),
        total_received_credit=round(total_received, 2),
        total_mismatch=total_mismatch,
        recoverable_amount=recoverable,
        mismatch_percent=round(mismatch_pct, 2),
        weighted_avg_rebate_pct=round(weighted_pct, 2),
        pos_lines_total=total_lines,
        pos_lines_eligible=len(eligible),
        per_code=per_code,
        credit_memo_number=memo_number,
        credit_memo_date=memo_date,
        detected_period=_format_period(dates),
    )


def compute(pos_text: str, agreement_text: str, credit_memo_text: str) -> CalcResult:
    """Convenience: parse all three docs (CSV path) then run the math."""
    sales, total_lines, dates = parse_pos_csv(pos_text)
    rebates, programs = parse_agreement_csv(agreement_text)
    received, memo_number, memo_date = parse_credit_memo(credit_memo_text)
    return compute_from_components(
        sales, total_lines, dates, rebates, programs, received,
        memo_number, memo_date,
    )
