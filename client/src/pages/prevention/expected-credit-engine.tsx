import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Calculator, CheckCircle2, Zap, ChevronRight, Download, ArrowRight,
  Wrench, ChevronLeft, Upload, FileText, BarChart3, FileSpreadsheet,
  X, AlertCircle, Loader2, CheckCheck, Filter, Sparkles, Mail,
  Send, Bot, Paperclip, Building2, CircleCheck,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DropOffReason { reason: string; count: number }

interface RichPipelineStep {
  step: number;
  name: string;
  linesIn: number;
  linesOut: number;
  dropOff: number;
  dropOffReasons: DropOffReason[];
  recoverableNote?: string;
}

interface LineRecord {
  lineId: string;
  sku: string;
  customer: string;
  date: string;
  qty: number;
  value: number;
  status: "passed" | "dropped";
  reasonCode: string;
  appliedRate: number | null;
  tier: string | null;
  exclusionFlag: boolean;
  droppedAtStep: number | null;
}

interface RichComputeResult {
  program: any;
  totalInputLines: number;
  totalEligibleLines: number;
  totalEligibleAmount: number;
  appliedRate: number;
  appliedTier: string;
  exclusionsAmount: number;
  expectedAmount: number;
  richPipeline: RichPipelineStep[];
  savedCredits: any[];
  lineRecords: LineRecord[];
  computationVersion: string;
  source: "seed" | "upload";
  // Populated when the engine ran on uploaded docs:
  supplierName?: string;
  detectedPeriod?: string;
  creditMemoNumber?: string;
  creditMemoDate?: string;
  totalReceivedCredit?: number;
  recoverableAmount?: number;
  perCodeBreakdown?: AnalyzeResponseCode[];
}

interface ExtractedMetadata {
  documentType?: "pdf" | "csv";
  memoNumber?: string;
  memoDate?: string;
  totalAmount?: string;
  lineCount?: number;
  pageCount?: number;
  topLines?: string[];
  detectedKeywords?: string[];
}

interface ParsedFile {
  name: string;
  sizeKB: number;
  rowCount: number;
  headers: string[];
  sampleRows: string[][];
  rawText: string;
  totalAmount: number;
  detectedAmountCol: number;
  detectedSkuCol: number;
  detectedCustomerCol: number;
  detectedDateCol: number;
  status: "idle" | "parsing" | "ready" | "error";
  errorMsg?: string;
  extracted?: ExtractedMetadata;
}

// Pull a few high-signal fields out of an extracted credit-memo PDF.
// Pure regex — fast, no AI roundtrip — used for the hover tooltip.
function extractMemoMetadata(text: string, pages: number): ExtractedMetadata {
  const md: ExtractedMetadata = { documentType: "pdf", pageCount: pages };
  const numMatch = text.match(/NUMBER[\s:]*([A-Za-z0-9-]+)/i);
  if (numMatch) md.memoNumber = numMatch[1];
  const dateMatch = text.match(/DATE[\s:]*([\d]{1,2}[-\s/][A-Za-z]{3,9}[-\s/][\d]{2,4}|[\d]{4}-[\d]{2}-[\d]{2})/i);
  if (dateMatch) md.memoDate = dateMatch[1];
  const totalMatch = text.match(/TOTAL\s+AMOUNT[\s:]*\$?([-\d,]+\.\d{2})/i);
  if (totalMatch) md.totalAmount = `$${totalMatch[1]}`;
  // Count rows that look like line items (digit, then a code, then an amount).
  const lineMatches = text.match(/^\s*\d+\s+\S+/gm) ?? [];
  md.lineCount = lineMatches.length || undefined;
  // Top lines (first non-empty 5 paragraphs, trimmed) for hover preview.
  md.topLines = text.split(/\n+/).filter(l => l.trim().length > 4).slice(0, 6).map(l => l.trim().slice(0, 80));
  return md;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const programOptions = [
  { id: 3, name: "Carrier Q1 Volume Rebate", code: "CARR-REB-2024-Q1", supplier: "Carrier Global", baseRate: 3.0, tierRate: 4.5, tierThreshold: 1000000 },
  { id: 1, name: "ContractorPro SPA", code: "CARR-SPA-2024-CONTRACTOR", supplier: "Carrier Global", baseRate: 5.0, tierRate: 7.0, tierThreshold: 500000 },
  { id: 4, name: "Trane Commercial SPA", code: "TRAN-SPA-2024-COMM", supplier: "Trane Technologies", baseRate: 4.5, tierRate: 6.0, tierThreshold: 750000 },
  { id: 5, name: "Trane Annual Volume Rebate", code: "TRAN-REB-2024-VOL", supplier: "Trane Technologies", baseRate: 2.0, tierRate: 3.5, tierThreshold: 500000 },
  { id: 9, name: "Trane FlexPath SPA", code: "TRAN-SPA-FLEXPATH-Q1", supplier: "Trane Technologies", baseRate: 4.0, tierRate: 5.0, tierThreshold: 500000 },
  { id: 7, name: "Lennox Contractor SPA", code: "LENN-SPA-2024", supplier: "Lennox International", baseRate: 5.0, tierRate: 6.5, tierThreshold: 400000 },
];

const periodOptions = [
  { start: "2024-01-01", end: "2024-03-31", label: "Q1 2024" },
  { start: "2024-04-01", end: "2024-06-30", label: "Q2 2024" },
  { start: "2024-07-01", end: "2024-09-30", label: "Q3 2024" },
];

// ─── Trane FlexPath Q1 2024 seed scenario ────────────────────────────────────

const FLEXPATH_SKUS = ["TRAN-4TWX", "TRAN-XB15", "TRAN-XR17", "TRAN-FLEX-100", "TRAN-FLEX-200", "TRAN-FLEX-300"];
const ROSTER_CUSTOMERS = [
  "Apex Mechanical", "BlueSky HVAC LLC", "Metro Commercial Props",
  "StarAir Solutions", "Crestwood Buildings", "Rapid Comfort Systems",
  "Harbor Climate Control", "Peak Performance HVAC", "Tri-State Mechanical",
  "Summit Air Systems", "Delta Climate Partners", "Ridge HVAC Inc.",
];
const OFF_ROSTER_CUSTOMERS = [
  "Sunset Plumbing LLC", "Valley Air Corp", "Westside Properties",
  "Horizon Contractors", "Northern HVAC Works", "Coastal Comfort LLC",
];

function buildFlexPathLineRecords(): LineRecord[] {
  const lines: LineRecord[] = [];
  let id = 1;
  const q1Dates = ["2024-01-08","2024-01-15","2024-01-22","2024-02-05","2024-02-12","2024-02-19","2024-03-04","2024-03-11","2024-03-18","2024-03-25"];
  for (let i = 0; i < 15; i++) {
    lines.push({ lineId: `FP-${String(id++).padStart(4,"0")}`, sku: FLEXPATH_SKUS[i % FLEXPATH_SKUS.length], customer: OFF_ROSTER_CUSTOMERS[i % OFF_ROSTER_CUSTOMERS.length], date: q1Dates[i % q1Dates.length], qty: 4 + (i % 12), value: (1800 + (i * 120)) * (4 + (i % 12)), status: "dropped", reasonCode: "END-CUST-NOT-ROSTER", appliedRate: null, tier: null, exclusionFlag: false, droppedAtStep: 1 });
  }
  for (let i = 0; i < 8; i++) {
    lines.push({ lineId: `FP-${String(id++).padStart(4,"0")}`, sku: FLEXPATH_SKUS[i % FLEXPATH_SKUS.length], customer: ROSTER_CUSTOMERS[i % ROSTER_CUSTOMERS.length], date: i % 2 === 0 ? "2023-12-28" : "2024-04-02", qty: 3 + (i % 8), value: (2000 + (i * 80)) * (3 + (i % 8)), status: "dropped", reasonCode: "DATE-OUTSIDE-WINDOW", appliedRate: null, tier: null, exclusionFlag: false, droppedAtStep: 1 });
  }
  for (let i = 0; i < 5; i++) {
    lines.push({ lineId: `FP-${String(id++).padStart(4,"0")}`, sku: `TRAN-FILTER-0${i+1}`, customer: ROSTER_CUSTOMERS[i % ROSTER_CUSTOMERS.length], date: q1Dates[i % q1Dates.length], qty: 10 + i, value: 180 * (10 + i), status: "dropped", reasonCode: "SKU-NOT-ELIGIBLE", appliedRate: null, tier: null, exclusionFlag: false, droppedAtStep: 1 });
  }
  for (let i = 0; i < 8; i++) {
    lines.push({ lineId: `FP-${String(id++).padStart(4,"0")}`, sku: FLEXPATH_SKUS[i % FLEXPATH_SKUS.length], customer: ROSTER_CUSTOMERS[i % ROSTER_CUSTOMERS.length], date: q1Dates[i % q1Dates.length], qty: -(2 + (i % 5)), value: -(2400 + (i * 200)) * (2 + (i % 5)), status: "dropped", reasonCode: "FULL-RETURN", appliedRate: null, tier: null, exclusionFlag: true, droppedAtStep: 5 });
  }
  for (let i = 0; i < 5; i++) {
    lines.push({ lineId: `FP-${String(id++).padStart(4,"0")}`, sku: FLEXPATH_SKUS[i % FLEXPATH_SKUS.length], customer: ROSTER_CUSTOMERS[i % ROSTER_CUSTOMERS.length], date: q1Dates[i % q1Dates.length], qty: 6 + i, value: (1900 + i * 100) * (6 + i), status: "dropped", reasonCode: "PARTIAL-EXCLUSION", appliedRate: null, tier: null, exclusionFlag: true, droppedAtStep: 5 });
  }
  for (let i = 0; i < 40; i++) {
    const sku = FLEXPATH_SKUS[i % FLEXPATH_SKUS.length];
    const qty = 5 + (i % 20);
    const val = qty * (sku.includes("FLEX") ? 1600 + (i * 30) : 2400 + (i * 50));
    lines.push({ lineId: `FP-${String(id++).padStart(4,"0")}`, sku, customer: ROSTER_CUSTOMERS[i % ROSTER_CUSTOMERS.length], date: q1Dates[i % q1Dates.length], qty, value: val, status: "passed", reasonCode: "PASS", appliedRate: 5.0, tier: "Tier 2 (>$500k)", exclusionFlag: false, droppedAtStep: null });
  }
  return lines;
}

const FLEXPATH_RICH_PIPELINE: RichPipelineStep[] = [
  { step: 1, name: "Eligibility Filter", linesIn: 4217, linesOut: 3891, dropOff: 326, dropOffReasons: [{ reason: "end-customer-not-on-roster", count: 198 }, { reason: "date-outside-window", count: 87 }, { reason: "sku-not-eligible", count: 41 }], recoverableNote: "198 lines recoverable with master data fix — end customers not yet added to roster." },
  { step: 2, name: "UOM Normalisation", linesIn: 3891, linesOut: 3891, dropOff: 0, dropOffReasons: [] },
  { step: 3, name: "Rate Application", linesIn: 3891, linesOut: 3891, dropOff: 0, dropOffReasons: [{ reason: "base rate 4% applied", count: 3891 }] },
  { step: 4, name: "Tier Application", linesIn: 3891, linesOut: 3891, dropOff: 0, dropOffReasons: [{ reason: "tier-2 triggered at $500k threshold → 5%", count: 3891 }] },
  { step: 5, name: "Exclusions & Dedup", linesIn: 3891, linesOut: 3832, dropOff: 59, dropOffReasons: [{ reason: "full return exclusion", count: 47 }, { reason: "partial exclusion applied", count: 12 }] },
];

// ─── CSV Parsing ──────────────────────────────────────────────────────────────

function parseCSVContent(content: string): { headers: string[]; rows: string[][]; rowCount: number } {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [], rowCount: 0 };
  const first = lines[0];
  const commas = (first.match(/,/g) || []).length;
  const tabs = (first.match(/\t/g) || []).length;
  const semis = (first.match(/;/g) || []).length;
  const delim = tabs > commas && tabs > semis ? "\t" : semis > commas ? ";" : ",";
  const splitLine = (l: string) => l.split(delim).map(v => v.trim().replace(/^["']|["']$/g, ""));
  const headers = splitLine(lines[0]);
  const dataLines = lines.slice(1);
  const rows = dataLines.slice(0, 100).map(splitLine);
  return { headers, rows, rowCount: dataLines.length };
}

function detectColIdx(headers: string[], keywords: string[]): number {
  const lower = headers.map(h => h.toLowerCase().replace(/[^a-z]/g, ""));
  for (const kw of keywords) {
    const idx = lower.findIndex(h => h.includes(kw));
    if (idx >= 0) return idx;
  }
  return -1;
}

// Fallback amount-detection: scan a sample of rows and pick the column whose
// values look most like dollar amounts. Useful when the header doesn't carry
// any of the keyword tokens (e.g. "P1 WD Inv $").
function sniffAmountCol(rows: string[][]): number {
  if (!rows.length) return -1;
  const numCols = rows[0].length;
  const scores = new Array(numCols).fill(0);
  for (const row of rows.slice(0, 30)) {
    for (let i = 0; i < numCols && i < row.length; i++) {
      const v = (row[i] || "").trim();
      if (!v) continue;
      // Strict dollar form gets the most weight; bare integers count too,
      // but only if they're large enough not to be quantity columns.
      if (/^[\$\-]?\s*[\d,]+(\.\d{1,4})?$/.test(v)) {
        const numeric = parseFloat(v.replace(/[\$,\s]/g, ""));
        if (!Number.isFinite(numeric)) continue;
        if (v.includes("$")) scores[i] += 3;
        else if (v.includes(",")) scores[i] += 2;
        else if (Math.abs(numeric) >= 100) scores[i] += 1;
      }
    }
  }
  let best = -1;
  let bestScore = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > bestScore) {
      bestScore = scores[i];
      best = i;
    }
  }
  // Require enough confidence — otherwise we'd mis-classify date columns etc.
  return bestScore >= 5 ? best : -1;
}

function sumAmountCol(rows: string[][], colIdx: number): number {
  if (colIdx < 0) return 0;
  return rows.reduce((sum, row) => {
    const raw = (row[colIdx] || "").replace(/[$,\s]/g, "");
    const val = parseFloat(raw);
    return sum + (isNaN(val) ? 0 : Math.abs(val));
  }, 0);
}

// PDFs go to the backend's pypdf extractor; the returned text is treated
// the same as a plain-text upload from there on.
async function extractPdfText(file: File): Promise<{ text: string; pages: number; charCount: number }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/ai/extract-pdf", { method: "POST", body: fd });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`PDF extraction failed (${res.status}): ${txt}`);
  }
  return res.json();
}

async function parseUploadedFile(file: File): Promise<ParsedFile> {
  // PDF path: extract on backend, then treat the text as the file content.
  const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
  if (isPdf) {
    try {
      const { text, pages } = await extractPdfText(file);
      const extracted = extractMemoMetadata(text, pages);
      // Try to recover a totalAmount value for the file-loaded summary panel.
      const totalParsed = extracted.totalAmount
        ? Math.abs(parseFloat(extracted.totalAmount.replace(/[$,]/g, ""))) || 0
        : 0;
      return {
        name: file.name,
        sizeKB: Math.round(file.size / 1024),
        rowCount: pages,
        headers: ["page"],
        sampleRows: text.split(/\n\n+/).slice(0, 20).map(p => [p.slice(0, 120)]),
        rawText: text,
        totalAmount: totalParsed,
        detectedAmountCol: -1,
        detectedSkuCol: -1,
        detectedCustomerCol: -1,
        detectedDateCol: -1,
        status: "ready",
        errorMsg: undefined,
        extracted,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "PDF parse failed";
      return {
        name: file.name,
        sizeKB: Math.round(file.size / 1024),
        rowCount: 0,
        headers: [],
        sampleRows: [],
        rawText: "",
        totalAmount: 0,
        detectedAmountCol: -1,
        detectedSkuCol: -1,
        detectedCustomerCol: -1,
        detectedDateCol: -1,
        status: "error",
        errorMsg: msg,
      };
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = (e.target?.result as string) ?? "";
        const { headers, rows, rowCount } = parseCSVContent(content);
        let amountColIdx = detectColIdx(headers, [
          "amount", "total", "value", "price", "credit", "debit",
          "lineamount", "netsales", "salestotal", "invoiceamount",
          "rebate", "billed", "wdinv", "wd", "inv", "salesusd",
        ]);
        if (amountColIdx < 0) amountColIdx = sniffAmountCol(rows);
        const skuColIdx = detectColIdx(headers, ["sku","part","item","product","material","productcode","partnum","manufacturersku","mfrsku","vcsc","awicode"]);
        const customerColIdx = detectColIdx(headers, ["customer","client","soldto","customername","accountname","buyername","endcustomer"]);
        const dateColIdx = detectColIdx(headers, ["date","invoicedate","saledate","transactiondate","postingdate","orderdate","month"]);
        const totalAmount = sumAmountCol(rows, amountColIdx);
        resolve({
          name: file.name,
          sizeKB: Math.round(file.size / 1024),
          rowCount,
          headers,
          sampleRows: rows.slice(0, 20),
          rawText: content,
          totalAmount,
          detectedAmountCol: amountColIdx,
          detectedSkuCol: skuColIdx,
          detectedCustomerCol: customerColIdx,
          detectedDateCol: dateColIdx,
          status: "ready",
        });
      } catch {
        resolve({ name: file.name, sizeKB: Math.round(file.size / 1024), rowCount: 0, headers: [], sampleRows: [], rawText: "", totalAmount: 0, detectedAmountCol: -1, detectedSkuCol: -1, detectedCustomerCol: -1, detectedDateCol: -1, status: "error", errorMsg: "Could not parse file" });
      }
    };
    reader.onerror = () => resolve({ name: file.name, sizeKB: Math.round(file.size / 1024), rowCount: 0, headers: [], sampleRows: [], rawText: "", totalAmount: 0, detectedAmountCol: -1, detectedSkuCol: -1, detectedCustomerCol: -1, detectedDateCol: -1, status: "error", errorMsg: "Read error" });
    reader.readAsText(file);
  });
}

// ─── File-driven computation ──────────────────────────────────────────────────

function buildLineRecordsFromFile(
  posFile: ParsedFile,
  notOnRoster: number, outsideWindow: number, skuNotEligible: number,
  fullReturns: number, partialExclusions: number,
  appliedRate: number, appliedTier: string,
): LineRecord[] {
  const lines: LineRecord[] = [];
  const rows = posFile.sampleRows;
  const sc = posFile.detectedSkuCol;
  const cc = posFile.detectedCustomerCol;
  const dc = posFile.detectedDateCol;
  const ac = posFile.detectedAmountCol;
  let id = 1;
  const mkLine = (row: string[], i: number): Omit<LineRecord, "status" | "reasonCode" | "appliedRate" | "tier" | "exclusionFlag" | "droppedAtStep"> => ({
    lineId: `UPL-${String(id++).padStart(4, "0")}`,
    sku: sc >= 0 ? (row[sc] || `SKU-${i}`) : `SKU-${i}`,
    customer: cc >= 0 ? (row[cc] || `CUST-${i}`) : `CUST-${i}`,
    date: dc >= 0 ? (row[dc] || "2024-01-01") : "2024-01-01",
    qty: 1,
    value: ac >= 0 ? Math.abs(parseFloat((row[ac] || "0").replace(/[$,]/g, "")) || 0) : 0,
  });
  // Dropped at step 1
  const drop1Rows = rows.slice(0, Math.min(notOnRoster + outsideWindow + skuNotEligible, 28));
  drop1Rows.forEach((row, i) => {
    const base = mkLine(row, i);
    const reason = i < notOnRoster ? "END-CUST-NOT-ROSTER" : i < notOnRoster + outsideWindow ? "DATE-OUTSIDE-WINDOW" : "SKU-NOT-ELIGIBLE";
    lines.push({ ...base, status: "dropped", reasonCode: reason, appliedRate: null, tier: null, exclusionFlag: false, droppedAtStep: 1 });
  });
  // Dropped at step 5
  const drop5Start = Math.min(drop1Rows.length, rows.length - (fullReturns + partialExclusions));
  rows.slice(drop5Start, drop5Start + Math.min(fullReturns + partialExclusions, 8)).forEach((row, i) => {
    const base = mkLine(row, i + 100);
    const reason = i < fullReturns ? "FULL-RETURN" : "PARTIAL-EXCLUSION";
    lines.push({ ...base, status: "dropped", reasonCode: reason, appliedRate: null, tier: null, exclusionFlag: true, droppedAtStep: 5 });
  });
  // Passed
  const passedRows = rows.slice(Math.min(drop1Rows.length + 8, rows.length - 30), rows.length);
  passedRows.slice(0, 30).forEach((row, i) => {
    const base = mkLine(row, i + 200);
    lines.push({ ...base, status: "passed", reasonCode: "PASS", appliedRate, tier: appliedTier, exclusionFlag: false, droppedAtStep: null });
  });
  return lines;
}

function computeFromUploadedFiles(posFile: ParsedFile, agreementFile: ParsedFile | null, creditMemosFile: ParsedFile | null, programId: number): RichComputeResult {
  const prog = programOptions.find(p => p.id === programId) || programOptions[4];
  let baseRate = prog.baseRate;
  let tierRate = prog.tierRate;
  let tierThreshold = prog.tierThreshold;

  // Try to extract rate from agreement file if uploaded
  if (agreementFile && agreementFile.sampleRows.length > 0) {
    const flat = agreementFile.sampleRows.flat().join(" ");
    const rateMatches = flat.match(/(\d+(?:\.\d+)?)\s*%/g) || [];
    const rates = rateMatches.map(r => parseFloat(r)).filter(r => r > 0.5 && r < 20);
    if (rates.length >= 2) { baseRate = Math.min(...rates); tierRate = Math.max(...rates); }
    else if (rates.length === 1) { baseRate = rates[0]; tierRate = rates[0] + 1.0; }
  }

  const totalInputLines = posFile.rowCount || 1;
  // Estimate total amount: if we have a small sample, scale up
  const sampleTotal = posFile.totalAmount;
  const sampleRows = Math.max(posFile.sampleRows.length, 1);
  const totalRawAmount = sampleTotal > 0 ? (sampleTotal / sampleRows) * totalInputLines : totalInputLines * 2200;

  const notOnRoster = Math.round(totalInputLines * 0.047);
  const outsideWindow = Math.round(totalInputLines * 0.021);
  const skuNotEligible = Math.round(totalInputLines * 0.009);
  const step1Dropped = notOnRoster + outsideWindow + skuNotEligible;
  const step1Out = totalInputLines - step1Dropped;
  const amountAfterEligibility = totalRawAmount * (step1Out / totalInputLines);

  const appliedRate = amountAfterEligibility >= tierThreshold ? tierRate : baseRate;
  const appliedTier = amountAfterEligibility >= tierThreshold ? `Tier 2 (>${(tierThreshold / 1000).toFixed(0)}k)` : "base";

  const fullReturns = Math.round(step1Out * 0.012);
  const partialExclusions = Math.round(step1Out * 0.003);
  const step5Dropped = fullReturns + partialExclusions;
  const step5Out = step1Out - step5Dropped;
  const finalAmount = amountAfterEligibility * (step5Out / step1Out);
  const expectedAmount = Math.round(finalAmount * (appliedRate / 100));

  const richPipeline: RichPipelineStep[] = [
    { step: 1, name: "Eligibility Filter", linesIn: totalInputLines, linesOut: step1Out, dropOff: step1Dropped, dropOffReasons: [{ reason: "end-customer-not-on-roster", count: notOnRoster }, { reason: "date-outside-window", count: outsideWindow }, { reason: "sku-not-eligible", count: skuNotEligible }], recoverableNote: `${notOnRoster} lines potentially recoverable with master data roster update.` },
    { step: 2, name: "UOM Normalisation", linesIn: step1Out, linesOut: step1Out, dropOff: 0, dropOffReasons: [] },
    { step: 3, name: "Rate Application", linesIn: step1Out, linesOut: step1Out, dropOff: 0, dropOffReasons: [{ reason: `base rate ${baseRate}% applied to eligible lines`, count: step1Out }] },
    { step: 4, name: "Tier Application", linesIn: step1Out, linesOut: step1Out, dropOff: 0, dropOffReasons: [{ reason: `${appliedTier}: ${appliedRate}% rate locked`, count: step1Out }] },
    { step: 5, name: "Exclusions & Dedup", linesIn: step1Out, linesOut: step5Out, dropOff: step5Dropped, dropOffReasons: [{ reason: "full return exclusion", count: fullReturns }, { reason: "partial exclusion applied", count: partialExclusions }] },
  ];

  return {
    program: { programName: prog.name, programCode: prog.code },
    totalInputLines,
    totalEligibleLines: step5Out,
    totalEligibleAmount: Math.round(finalAmount),
    appliedRate,
    appliedTier,
    exclusionsAmount: 0,
    expectedAmount,
    richPipeline,
    savedCredits: [],
    lineRecords: buildLineRecordsFromFile(posFile, notOnRoster, outsideWindow, skuNotEligible, fullReturns, partialExclusions, appliedRate, appliedTier),
    computationVersion: "v2.2.0-upload",
    source: "upload",
  };
}

function buildGenericRichPipeline(apiPipeline: any[]): RichPipelineStep[] {
  return apiPipeline.map((step: any) => ({ step: step.step, name: step.name, linesIn: step.linesIn, linesOut: step.linesOut, dropOff: step.dropOff, dropOffReasons: step.dropOff > 0 ? [{ reason: step.reason, count: step.dropOff }] : [] }));
}

// ─── Backend analysis → RichComputeResult ────────────────────────────────────

interface AnalyzeResponseCode {
  vcsc: string;
  salesAmount: number;
  appliedRebatePct: number;  // may be a fraction (0.085) or a percent (8.5)
  expectedCredit: number;
  receivedCredit: number;
  mismatch: number;
  status: "matched" | "underpaid" | "overpaid" | "unclaimed";
  programCodes?: string[];
}

interface AnalyzeResponse {
  totalSales: number;
  totalExpectedCredit: number;
  totalReceivedCredit: number;
  totalMismatch: number;
  recoverableAmount: number;
  mismatchPercent: number;
  weightedAvgRebatePct: number;
  perCodeBreakdown: AnalyzeResponseCode[];
  summary: string;
  posLinesTotal: number;
  posLinesEligible: number;
  periodLabel?: string | null;
  supplierName?: string | null;
  detectedPeriod?: string | null;
  creditMemoNumber?: string | null;
  creditMemoDate?: string | null;
}

function buildResultFromAnalysis(d: AnalyzeResponse): RichComputeResult {
  const ineligible = Math.max(0, d.posLinesTotal - d.posLinesEligible);
  const matchedCount = d.perCodeBreakdown.filter(c => c.status === "matched").length;
  const issueCount = d.perCodeBreakdown.length - matchedCount;
  const totalCodes = d.perCodeBreakdown.length || 1;
  const avgRebate = d.weightedAvgRebatePct < 1
    ? d.weightedAvgRebatePct * 100
    : d.weightedAvgRebatePct;

  // Synthesize a 5-step pipeline from the analysis output. Eligibility =
  // POS lines that have a matching VCSC in the agreement; reconciliation =
  // codes flagged as matched/underpaid.
  const richPipeline: RichPipelineStep[] = [
    {
      step: 1,
      name: "Eligibility Filter",
      linesIn: d.posLinesTotal,
      linesOut: d.posLinesEligible,
      dropOff: ineligible,
      dropOffReasons: ineligible > 0
        ? [{ reason: "VCSC code not in agreement roster", count: ineligible }]
        : [],
      recoverableNote: ineligible > 0
        ? `${ineligible} POS line(s) reference codes not on the agreement — verify with master data.`
        : undefined,
    },
    {
      step: 2,
      name: "UOM Normalisation",
      linesIn: d.posLinesEligible,
      linesOut: d.posLinesEligible,
      dropOff: 0,
      dropOffReasons: [],
    },
    {
      step: 3,
      name: "Rate Application",
      linesIn: d.posLinesEligible,
      linesOut: d.posLinesEligible,
      dropOff: 0,
      dropOffReasons: [{
        reason: `weighted-avg rate ${avgRebate.toFixed(2)}% applied across ${totalCodes} programs`,
        count: d.posLinesEligible,
      }],
    },
    {
      step: 4,
      name: "Tier Application",
      linesIn: d.posLinesEligible,
      linesOut: d.posLinesEligible,
      dropOff: 0,
      dropOffReasons: [{
        reason: `expected credit: $${Math.round(d.totalExpectedCredit).toLocaleString()}`,
        count: d.posLinesEligible,
      }],
    },
    {
      step: 5,
      name: "Reconciliation vs Credit Memo",
      linesIn: totalCodes,
      linesOut: matchedCount,
      dropOff: issueCount,
      dropOffReasons: [
        { reason: "underpaid (shortfall vs expected)", count: d.perCodeBreakdown.filter(c => c.status === "underpaid").length },
        { reason: "unclaimed (no credit received)", count: d.perCodeBreakdown.filter(c => c.status === "unclaimed").length },
        { reason: "overpaid (received more than expected)", count: d.perCodeBreakdown.filter(c => c.status === "overpaid").length },
      ].filter(x => x.count > 0),
      recoverableNote: d.recoverableAmount > 0
        ? `$${Math.round(d.recoverableAmount).toLocaleString()} potentially recoverable across ${issueCount} program code(s).`
        : undefined,
    },
  ];

  // Each per-code row becomes one LineRecord so the table shows real codes.
  const lineRecords: LineRecord[] = d.perCodeBreakdown.map((c, i) => {
    const passed = c.status === "matched";
    const pct = c.appliedRebatePct < 1 ? c.appliedRebatePct * 100 : c.appliedRebatePct;
    return {
      lineId: `BBB-${String(i + 1).padStart(4, "0")}`,
      sku: c.vcsc,
      customer: (c.programCodes ?? []).join(", ") || "—",
      date: "2024",
      qty: 1,
      value: c.salesAmount,
      status: passed ? "passed" : "dropped",
      reasonCode: passed
        ? "PASS"
        : c.status.toUpperCase(),
      appliedRate: pct,
      tier: passed ? "matched" : c.status,
      exclusionFlag: false,
      droppedAtStep: passed ? null : 5,
    };
  });

  return {
    program: {
      programName: d.supplierName
        ? `${d.supplierName} — multi-program reconciliation`
        : "Multi-program reconciliation",
      programCode: "AI-ANALYSIS",
    },
    totalInputLines: d.posLinesTotal,
    totalEligibleLines: d.posLinesEligible,
    totalEligibleAmount: d.totalSales,
    appliedRate: avgRebate,
    appliedTier: `weighted across ${totalCodes} programs`,
    exclusionsAmount: 0,
    // Hero shows the headline number — recoverable mismatch is the most
    // useful figure for "what should we go claim".
    expectedAmount: d.recoverableAmount > 0 ? d.recoverableAmount : d.totalExpectedCredit,
    richPipeline,
    savedCredits: [],
    lineRecords,
    computationVersion: "helm-ai-v1",
    source: "upload",
    supplierName: d.supplierName ?? undefined,
    detectedPeriod: d.detectedPeriod ?? d.periodLabel ?? undefined,
    creditMemoNumber: d.creditMemoNumber ?? undefined,
    creditMemoDate: d.creditMemoDate ?? undefined,
    totalReceivedCredit: d.totalReceivedCredit,
    recoverableAmount: d.recoverableAmount,
    perCodeBreakdown: d.perCodeBreakdown,
  };
}

function buildGenericLineRecords(savedCredits: any[]): LineRecord[] {
  return savedCredits.map((c: any, i: number) => ({ lineId: `SL-${String(c.saleLineId || i + 1).padStart(4, "0")}`, sku: "—", customer: "—", date: c.periodStart || "—", qty: 1, value: parseFloat(c.eligibleSaleAmount || "0"), status: "passed" as const, reasonCode: "PASS", appliedRate: parseFloat(c.appliedRate || "0"), tier: c.appliedTier || "base", exclusionFlag: false, droppedAtStep: null }));
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────

interface FileUploadZoneProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  accept: string;
  file: ParsedFile | null;
  onFile: (f: ParsedFile) => void;
  onClear: () => void;
}

function FileUploadZone({ label, description, icon, accept, file, onFile, onClear }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    setParsing(true);
    const parsed = await parseUploadedFile(f);
    setParsing(false);
    onFile(parsed);
  }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <div className="flex-1 min-w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-emerald-400">{icon}</div>
        <div>
          <div className="text-xs font-semibold text-foreground">{label}</div>
          <div className="text-[10px] text-muted-foreground">{description}</div>
        </div>
      </div>

      {!file && !parsing ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${dragging ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-emerald-500/50 hover:bg-muted/10"}`}
          onDragEnter={e => { e.preventDefault(); setDragging(true); }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className={`h-5 w-5 mx-auto mb-2 transition-colors ${dragging ? "text-emerald-400" : "text-muted-foreground"}`} />
          <div className="text-xs text-muted-foreground">Drop file or <span className="text-emerald-400 underline underline-offset-2">browse</span></div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">{accept.replace(/\./g, "").toUpperCase()}</div>
          <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={onInputChange} />
        </div>
      ) : parsing ? (
        <div className="border border-border rounded-xl p-5 flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
          <div className="text-xs text-muted-foreground">Parsing file…</div>
        </div>
      ) : file ? (
        <div className={`relative group border rounded-xl p-3 ${file.status === "error" ? "border-rose-500/40 bg-rose-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <CheckCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{file.name}</span>
            </div>
            <button onClick={onClear} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {file.status === "error" ? (
            <div className="flex items-center gap-1.5 text-[10px] text-rose-400">
              <AlertCircle className="h-3 w-3" />
              {file.errorMsg || "Parse error"}
            </div>
          ) : (
            <div className="space-y-1 text-[10px]">
              <div className="flex gap-3">
                <span className="text-emerald-400 font-semibold">
                  {file.extracted?.documentType === "pdf"
                    ? `${file.rowCount} ${file.rowCount === 1 ? "page" : "pages"}`
                    : `${file.rowCount.toLocaleString()} rows`}
                </span>
                {file.extracted?.documentType !== "pdf" && (
                  <span className="text-muted-foreground">{file.headers.length} cols</span>
                )}
                <span className="text-muted-foreground">{file.sizeKB} KB</span>
                {file.extracted?.memoNumber && (
                  <span className="text-emerald-400 font-mono">#{file.extracted.memoNumber}</span>
                )}
              </div>
              {file.totalAmount > 0 && (
                <div className="text-muted-foreground">
                  Total value: <span className="text-foreground">${file.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {file.headers.length > 0 && file.extracted?.documentType !== "pdf" && (
                <div className="text-muted-foreground truncate">Cols: {file.headers.slice(0, 4).join(", ")}{file.headers.length > 4 ? "…" : ""}</div>
              )}
              {(file.extracted || file.headers.length > 0) && (
                <div className="text-[10px] text-emerald-400/70 italic">hover for details</div>
              )}
            </div>
          )}

          {/* Hover popover with extracted details */}
          {file.status === "ready" && (file.extracted || file.totalAmount > 0 || file.rowCount > 0) && (
            <div
              className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute z-30 left-0 right-0 top-full mt-2 bg-slate-950 border border-emerald-500/40 rounded-xl p-3 shadow-2xl shadow-emerald-500/10 pointer-events-none"
            >
              <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2 font-semibold">
                {file.extracted?.documentType === "pdf" ? "Extracted from PDF" : "Detected Columns"}
              </div>
              <div className="space-y-1.5 text-xs">
                {file.extracted?.memoNumber && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Memo Number</span>
                    <span className="text-foreground font-mono">{file.extracted.memoNumber}</span>
                  </div>
                )}
                {file.extracted?.memoDate && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">{file.extracted.memoDate}</span>
                  </div>
                )}
                {file.extracted?.totalAmount && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-emerald-400 font-semibold">{file.extracted.totalAmount}</span>
                  </div>
                )}
                {file.extracted?.lineCount && file.extracted.lineCount > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Line Items</span>
                    <span className="text-foreground">{file.extracted.lineCount}</span>
                  </div>
                )}
                {file.extracted?.pageCount && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Pages</span>
                    <span className="text-foreground">{file.extracted.pageCount}</span>
                  </div>
                )}
                {!file.extracted && file.totalAmount > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Detected Total</span>
                    <span className="text-emerald-400 font-semibold">${file.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                {!file.extracted && file.rowCount > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Rows</span>
                    <span className="text-foreground">{file.rowCount.toLocaleString()}</span>
                  </div>
                )}
                {!file.extracted && file.headers.length > 0 && (
                  <div className="pt-1 border-t border-slate-800">
                    <div className="text-muted-foreground mb-1">All columns ({file.headers.length}):</div>
                    <div className="text-[10px] text-foreground font-mono leading-snug">
                      {file.headers.join(", ")}
                    </div>
                  </div>
                )}
                {file.extracted?.topLines && file.extracted.topLines.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-800">
                    <div className="text-muted-foreground mb-1 text-[10px]">First lines:</div>
                    <div className="text-[10px] text-foreground/80 leading-snug space-y-0.5 max-h-32 overflow-hidden">
                      {file.extracted.topLines.map((line, i) => (
                        <div key={i} className="truncate">{line}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── AI Resolver Modal ────────────────────────────────────────────────────────

type AIResolverStep = "drafting" | "preview" | "sent";

const DRAFT_STEPS = [
  { label: "Analysing expected credit computation", duration: 500 },
  { label: "Scanning 3,832 eligible line items", duration: 700 },
  { label: "Cross-referencing agreement terms", duration: 600 },
  { label: "Composing supplier communication", duration: 800 },
  { label: "Attaching line-level data export", duration: 400 },
];

interface AIDraft {
  subject: string;
  body: string;
  reference: string;
}

function AIResolverModal({ open, onClose, result }: { open: boolean; onClose: () => void; result: RichComputeResult }) {
  const [step, setStep] = useState<AIResolverStep>("drafting");
  const [draftProgress, setDraftProgress] = useState(0);
  const [aiDraft, setAiDraft] = useState<AIDraft | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setStep("drafting");
      setDraftProgress(0);
      setAiDraft(null);
      setAiError(null);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Visual progression — kept as UX sugar so the modal doesn't feel snappy/empty.
    let elapsed = 0;
    DRAFT_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => { if (!cancelled) setDraftProgress(i + 1); }, elapsed));
      elapsed += s.duration;
    });
    timers.push(setTimeout(() => { if (!cancelled) setStep("preview"); }, elapsed + 200));

    // Real AI call in parallel — finishes whenever it finishes.
    const isUpload = result.source === "upload";
    const supplierName = result.supplierName
      ?? (isUpload ? "Supplier" : "Trane Technologies");
    const periodLabel = result.detectedPeriod
      ?? (isUpload ? "the analysed period" : "Q1 2024");

    // For uploaded scenarios, pick the largest mismatches so the email
    // can quote them by name.
    const topMismatches = (result.perCodeBreakdown ?? [])
      .filter(c => c.status !== "matched")
      .sort((a, b) => Math.abs(b.mismatch) - Math.abs(a.mismatch))
      .slice(0, 5)
      .map(c => ({
        vcsc: c.vcsc,
        salesAmount: c.salesAmount,
        appliedRatePct: c.appliedRebatePct < 1 ? c.appliedRebatePct * 100 : c.appliedRebatePct,
        expectedCredit: c.expectedCredit,
        receivedCredit: c.receivedCredit,
        mismatch: c.mismatch,
        status: c.status,
      }));

    apiRequest("POST", "/api/ai/resolver/draft-email", {
      programName: result.program?.programName ?? "",
      programCode: result.program?.programCode ?? "",
      periodLabel,
      expectedAmount: result.expectedAmount,
      eligibleAmount: result.totalEligibleAmount,
      eligibleLines: result.totalEligibleLines,
      totalInputLines: result.totalInputLines,
      appliedRate: result.appliedRate,
      appliedTier: result.appliedTier,
      supplierName,
      computationVersion: result.computationVersion,
      // Upload-scenario context (omitted by backend if undefined):
      recoverableAmount: result.recoverableAmount,
      totalReceivedCredit: result.totalReceivedCredit,
      creditMemoNumber: result.creditMemoNumber,
      creditMemoDate: result.creditMemoDate,
      topMismatches: topMismatches.length ? topMismatches : undefined,
    })
      .then(r => r.json())
      .then((data: AIDraft) => { if (!cancelled) setAiDraft(data); })
      .catch((err: Error) => { if (!cancelled) setAiError(err.message); });

    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [open, result]);

  const reference = aiDraft?.reference ?? "HELM-AI-DRAFT";
  const supplierName = result.supplierName ?? "Trane Technologies";

  const handleSend = () => {
    setStep("sent");
    toast({
      title: `Email sent to ${supplierName}`,
      description: `Credit claim dispute dispatched · Ref: ${reference}`,
    });
  };

  const topSkus = [
    { sku: "TRAN-4TWX", desc: "4TWX Series Split System", qty: 412, value: 624180, credit: 31209 },
    { sku: "TRAN-XB15", desc: "XB15 Central Air", qty: 389, value: 541200, credit: 27060 },
    { sku: "TRAN-XR17", desc: "XR17 Variable Speed", qty: 311, value: 498900, credit: 24945 },
    { sku: "TRAN-FLEX-100", desc: "FlexPath 100 RTU", qty: 276, value: 412400, credit: 20620 },
    { sku: "TRAN-FLEX-200", desc: "FlexPath 200 RTU", qty: 198, value: 330800, credit: 16540 },
  ];

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-foreground p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 to-violet-950/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              <Bot className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                Helm AI Resolver
                <Badge className="bg-violet-500/20 text-violet-300 border-0 text-[9px] px-1.5 font-semibold">BETA</Badge>
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">Drafting a professional credit recovery email to {supplierName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {/* ── Step 1: Drafting ── */}
          {step === "drafting" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                <span>Helm AI is preparing your dispute email…</span>
              </div>
              <div className="space-y-2.5">
                {DRAFT_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i < draftProgress ? "opacity-100" : "opacity-30"}`}>
                    {i < draftProgress
                      ? <CircleCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      : <div className="h-4 w-4 rounded-full border border-slate-600 shrink-0" />
                    }
                    <span className={i < draftProgress ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
                    {i === draftProgress - 1 && i < DRAFT_STEPS.length - 1 && (
                      <span className="ml-auto text-[10px] text-violet-400 font-semibold animate-pulse">Processing…</span>
                    )}
                    {i < draftProgress && (
                      <span className="ml-auto text-[10px] text-emerald-400">Done</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(draftProgress / DRAFT_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Email Preview ── */}
          {step === "preview" && (
            <div className="space-y-4">
              {/* Email chrome */}
              <div className="rounded-xl border border-slate-700 overflow-hidden text-sm">
                {/* Email meta */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 space-y-1.5">
                  {[
                    {
                      label: "To",
                      value: result.source === "upload"
                        ? `vendor.rebates@${(supplierName || "supplier").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
                        : "vendor.rebates@trane.com; ap-disputes@tranetechnologies.com",
                    },
                    { label: "CC", value: "procurement@yourdomain.com; finance-ops@yourdomain.com" },
                    {
                      label: "Subject",
                      value: aiDraft?.subject
                        ?? `${supplierName} Credit Recovery — ${result.detectedPeriod ?? "Q1 2024"} · $${result.expectedAmount.toLocaleString()} Outstanding · Ref: ${reference}`,
                    },
                  ].map(row => (
                    <div key={row.label} className="flex gap-3 text-xs">
                      <span className="text-muted-foreground w-14 shrink-0 pt-0.5">{row.label}</span>
                      <span className="text-foreground font-medium leading-relaxed">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex gap-3 text-xs mt-1">
                    <span className="text-muted-foreground w-14 shrink-0 pt-0.5">Attach</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["FlexPath-Q1-2024-LineItems-3832rows.csv", "FlexPath-SPA-Agreement-Ref.pdf", "CreditMemo-Reconciliation.xlsx"].map(f => (
                        <span key={f} className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-300">
                          <Paperclip className="h-2.5 w-2.5" />{f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email body — drafted by Claude via /api/ai/resolver/draft-email */}
                <div className="bg-slate-950 px-5 py-4 text-xs text-slate-300 leading-relaxed space-y-3 max-h-80 overflow-y-auto">
                  {aiDraft ? (
                    aiDraft.body.split(/\n{2,}/).map((para, i) => (
                      <p key={i} className="whitespace-pre-wrap">{para}</p>
                    ))
                  ) : aiError ? (
                    <p className="text-amber-400">
                      Couldn't reach Helm AI ({aiError}). The dispute reference and figures below
                      are drafted from your live computation; you can edit and send manually.
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      <Loader2 className="h-3.5 w-3.5 inline-block animate-spin mr-1.5 text-violet-400" />
                      Helm AI is still drafting — content will appear shortly.
                    </p>
                  )}

                  {/* Top SKUs sidebar — visual sugar that survives across drafts */}
                  <div className="rounded-lg border border-slate-700 overflow-hidden my-2">
                    <div className="bg-slate-800/60 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Top 5 Eligible SKUs (of {topSkus.length} shown · full data attached)</div>
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b border-slate-700 text-muted-foreground">
                          <th className="px-3 py-1.5 text-left font-medium">SKU</th>
                          <th className="px-3 py-1.5 text-left font-medium">Description</th>
                          <th className="px-3 py-1.5 text-right font-medium">Qty</th>
                          <th className="px-3 py-1.5 text-right font-medium">Net Value</th>
                          <th className="px-3 py-1.5 text-right font-medium text-emerald-400">Credit Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSkus.map((row, i) => (
                          <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/30">
                            <td className="px-3 py-1.5 font-mono text-violet-300">{row.sku}</td>
                            <td className="px-3 py-1.5 text-slate-300">{row.desc}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{row.qty}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">${row.value.toLocaleString()}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums font-semibold text-emerald-400">${row.credit.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-700 bg-slate-800/40">
                          <td colSpan={3} className="px-3 py-1.5 font-semibold text-slate-300">Total (all {result.totalEligibleLines.toLocaleString()} lines — see attachment)</td>
                          <td className="px-3 py-1.5 text-right tabular-nums font-semibold">${result.totalEligibleAmount.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums font-bold text-emerald-400">${result.expectedAmount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-muted-foreground text-[10px]">
                    Auto-drafted by Helm AI Resolver · Ref: <span className="font-mono text-foreground">{reference}</span>
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  Drafted by Helm AI · review before sending
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5 text-xs" onClick={onClose}>
                    Discard
                  </Button>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 gap-1.5 text-xs font-semibold" onClick={handleSend}>
                    <Send className="h-3.5 w-3.5" />
                    Send to {supplierName}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Sent ── */}
          {step === "sent" && (
            <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CircleCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">Email Dispatched</div>
                <div className="text-sm text-muted-foreground mt-1">Sent to {supplierName} vendor relations</div>
              </div>
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 justify-center">
                  <Building2 className="h-3.5 w-3.5 text-violet-400" />
                  <span>Credit claim: <strong className="text-foreground">${result.expectedAmount.toLocaleString()}</strong> · {result.program?.programCode}</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Mail className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Reference: <strong className="text-foreground">{reference}</strong></span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Paperclip className="h-3.5 w-3.5 text-amber-400" />
                  <span>3 attachments included · {result.totalEligibleLines.toLocaleString()} line items</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 mt-2" onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({ result, onExportToClaim, isExporting, onAIResolver }: { result: RichComputeResult; onExportToClaim: () => void; isExporting: boolean; onAIResolver: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)]" />
      <div className="relative flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Computation Complete</span>
            {result.source === "upload" && (
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[9px] px-1.5">From Uploaded Files</Badge>
            )}
          </div>
          <div className="text-5xl font-black text-emerald-400 tabular-nums mb-1">
            ${result.expectedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Expected Credit · {result.totalEligibleLines.toLocaleString()} eligible of {result.totalInputLines.toLocaleString()} input
            · {result.appliedRate.toFixed(1)}% ({result.appliedTier})
            · <code className="font-mono text-xs text-slate-400">{result.computationVersion}</code>
          </div>
          <div className="flex gap-5 mt-4 text-xs">
            {[
              { label: "Eligible Amount", value: `$${result.totalEligibleAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-foreground" },
              { label: "Applied Rate", value: `${result.appliedRate.toFixed(1)}%`, color: "text-amber-400" },
              { label: "Exclusions", value: `$${result.exclusionsAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-rose-400" },
              { label: "Program", value: result.program?.programName || "—", color: "text-foreground" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-muted-foreground">{s.label}</div>
                <div className={`font-semibold mt-0.5 ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button onClick={onAIResolver} className="bg-violet-600 hover:bg-violet-500 font-semibold rounded-full px-5 gap-2 shadow-lg shadow-violet-500/20 w-full">
            <Sparkles className="h-4 w-4" />
            Helm AI Resolver
          </Button>
          <Button onClick={onExportToClaim} disabled={isExporting} variant="outline" className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 rounded-full px-5 gap-2 w-full">
            <Download className="h-4 w-4" />
            {isExporting ? "Creating Draft…" : "Export to Claim"}
          </Button>
          <div className="text-[10px] text-muted-foreground text-right">Creates draft in Claim Recovery</div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Card ────────────────────────────────────────────────────────────

function PipelineCard({ step, isLast }: { step: RichPipelineStep; isLast: boolean }) {
  const passRate = step.linesIn > 0 ? Math.round((step.linesOut / step.linesIn) * 100) : 100;
  return (
    <div className="flex items-stretch gap-0">
      <div className="flex-1 bg-slate-900/50 border border-border rounded-xl p-4 min-w-[200px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">{step.step}</div>
          <div className="text-xs font-semibold text-foreground leading-tight">{step.name}</div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl font-black text-emerald-400 tabular-nums">{step.linesOut.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">/ {step.linesIn.toLocaleString()} in</span>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${passRate}%` }} />
          </div>
          <span className="text-[10px] text-emerald-400 shrink-0">{passRate}%</span>
        </div>
        {step.dropOff > 0 && (
          <div className="space-y-1">
            {step.dropOffReasons.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="text-slate-400 truncate">{r.reason}</span>
                <span className="text-amber-400 font-semibold shrink-0">{r.count}</span>
              </div>
            ))}
            <div className="mt-1 text-[10px] text-amber-400/80 font-medium">{step.dropOff} dropped</div>
          </div>
        )}
        {step.dropOff === 0 && step.dropOffReasons.length > 0 && (
          <div className="text-[10px] text-emerald-400/70 italic">{step.dropOffReasons[0]?.reason}</div>
        )}
        {step.recoverableNote && (
          <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg flex gap-1.5">
            <Wrench className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300 leading-tight">{step.recoverableNote}</p>
          </div>
        )}
      </div>
      {!isLast && <div className="flex items-center px-1.5"><ArrowRight className="h-4 w-4 text-slate-600" /></div>}
    </div>
  );
}

// ─── Line Level Table ─────────────────────────────────────────────────────────

const STEP_FILTER_OPTIONS = [
  { value: "all", label: "All Lines" },
  { value: "passed", label: "Passed only" },
  { value: "dropped-1", label: "Dropped at Step 1 (Eligibility)" },
  { value: "dropped-5", label: "Dropped at Step 5 (Exclusions)" },
  { value: "dropped", label: "All Dropped" },
];

function LineLevelTable({ lines }: { lines: LineRecord[] }) {
  const [stepFilter, setStepFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const filtered = useMemo(() => {
    if (stepFilter === "all") return lines;
    if (stepFilter === "passed") return lines.filter(l => l.status === "passed");
    if (stepFilter === "dropped") return lines.filter(l => l.status === "dropped");
    if (stepFilter === "dropped-1") return lines.filter(l => l.droppedAtStep === 1);
    if (stepFilter === "dropped-5") return lines.filter(l => l.droppedAtStep === 5);
    return lines;
  }, [lines, stepFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageLines = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const handleFilter = (v: string) => { setStepFilter(v); setPage(1); };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Line-Level Detail</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={stepFilter} onValueChange={handleFilter}>
              <SelectTrigger className="bg-muted/20 border-border h-8 text-xs w-52">
                <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STEP_FILTER_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-[11px] text-muted-foreground">{filtered.length} lines</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/5">
                {["Line ID","SKU","Customer","Date","Qty","Value","Eligibility","Rate","Tier","Excl."].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageLines.map((line, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/10">
                  <td className="px-3 py-2 font-mono text-muted-foreground">{line.lineId}</td>
                  <td className="px-3 py-2 font-mono text-foreground">{line.sku}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[140px] truncate">{line.customer}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{line.date}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{Math.abs(line.qty)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">${Math.abs(line.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="px-3 py-2">
                    {line.status === "passed" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[9px] px-1.5 py-0">passed</Badge>
                    ) : (
                      <div>
                        <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[9px] px-1.5 py-0 mb-0.5">dropped</Badge>
                        <div className="text-[9px] text-muted-foreground leading-tight">{line.reasonCode}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {line.appliedRate !== null ? <span className="text-amber-400">{line.appliedRate}%</span> : <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{line.tier || <span className="text-muted-foreground/40">—</span>}</td>
                  <td className="px-3 py-2 text-center">{line.exclusionFlag ? <span className="text-rose-400 font-bold">✓</span> : <span className="text-muted-foreground/30">—</span>}</td>
                </tr>
              ))}
              {pageLines.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground text-sm">No lines match the selected filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
            <span className="text-[11px] text-muted-foreground">Page {page} of {totalPages} · {filtered.length} total lines</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return <Button key={pg} variant={pg === page ? "default" : "ghost"} size="sm" className={`h-7 w-7 p-0 text-xs ${pg === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}`} onClick={() => setPage(pg)}>{pg}</Button>;
              })}
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExpectedCreditEngine() {
  const [result, setResult] = useState<RichComputeResult | null>(null);
  const [running, setRunning] = useState(false);
  const [aiResolverOpen, setAiResolverOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Upload state
  const [posFile, setPosFile] = useState<ParsedFile | null>(null);
  const [agreementFile, setAgreementFile] = useState<ParsedFile | null>(null);
  const [creditMemosFile, setCreditMemosFile] = useState<ParsedFile | null>(null);

  const hasUploadedFiles = posFile?.status === "ready" || agreementFile?.status === "ready" || creditMemosFile?.status === "ready";
  const allThreeReady = posFile?.status === "ready" && agreementFile?.status === "ready" && creditMemosFile?.status === "ready";

  // Persist the per-VCSC breakdown to expected_credits via /bulk so the next
  // page-load (or another session) picks up the analysis from the seeded
  // /api/expected-credits query rather than vanishing on refresh.
  const persistAnalysis = async (data: AnalyzeResponse) => {
    if (!data.perCodeBreakdown?.length) return;
    // Best-effort period inference: prefer the model's own labels, fall back
    // to a generic Q-of-the-year window if neither is set.
    const period = data.detectedPeriod ?? data.periodLabel ?? "";
    const yearMatch = period.match(/(20\d{2})/);
    const fallbackYear = yearMatch ? yearMatch[1] : "2024";
    const periodStart = `${fallbackYear}-01-01`;
    const periodEnd = `${fallbackYear}-12-31`;

    const items = data.perCodeBreakdown.map(c => ({
      vcsc: c.vcsc,
      salesAmount: c.salesAmount,
      appliedRate: c.appliedRebatePct,
      expectedAmount: c.expectedCredit,
      receivedAmount: c.receivedCredit,
      mismatch: c.mismatch,
      status: c.status,
      programCodes: c.programCodes ?? [],
    }));

    const r = await apiRequest("POST", "/api/expected-credits/bulk", {
      periodStart,
      periodEnd,
      computationVersion: "helm-ai-v1",
      supplierName: data.supplierName ?? null,
      items,
    });
    const persisted = await r.json();
    queryClient.invalidateQueries({ queryKey: ["/api/expected-credits"] });
    toast({
      title: `Saved ${persisted.inserted} credit row${persisted.inserted === 1 ? "" : "s"}`,
      description: persisted.deleted > 0
        ? `Replaced ${persisted.deleted} prior row${persisted.deleted === 1 ? "" : "s"} from a previous run.`
        : "Now visible in Previously Computed Credits.",
    });
  };

  const runEngine = async () => {
    setRunning(true);
    setResult(null);

    // If all three files are uploaded → real AI analysis through the backend.
    if (allThreeReady && posFile && agreementFile && creditMemosFile) {
      try {
        const r = await apiRequest("POST", "/api/ai/expected-credit/analyze", {
          posText: posFile.rawText,
          agreementText: agreementFile.rawText,
          creditMemoText: creditMemosFile.rawText,
          periodLabel: "May–Sep 2024",
        });
        const data: AnalyzeResponse = await r.json();
        const built = buildResultFromAnalysis(data);
        setResult(built);
        // Fire-and-forget persistence — surface a toast on result, don't
        // block the UI on completion. Re-runs of the same period replace
        // prior rows server-side, so this stays idempotent.
        persistAnalysis(data).catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Persistence failed";
          toast({
            title: "Couldn't save analysis",
            description: msg,
            variant: "destructive",
          });
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: "Analysis failed",
          description: `Falling back to demo result. Reason: ${msg}`,
          variant: "destructive",
        });
        setResult(buildDemoResult(true));
      }
      setRunning(false);
      return;
    }

    // No / partial files → demo result with brief simulated delay.
    setTimeout(() => {
      setResult(buildDemoResult(hasUploadedFiles));
      setRunning(false);
    }, 1400);
  };

  const buildDemoResult = (fromUpload: boolean): RichComputeResult => ({
    program: { programName: "Trane FlexPath SPA", programCode: "TRAN-SPA-FLEXPATH-Q1" },
    totalInputLines: 4217,
    totalEligibleLines: 3832,
    totalEligibleAmount: 4694200,
    appliedRate: 5.0,
    appliedTier: "Tier 2 (>$500k)",
    exclusionsAmount: 0,
    expectedAmount: 234710,
    richPipeline: FLEXPATH_RICH_PIPELINE,
    savedCredits: [],
    lineRecords: buildFlexPathLineRecords(),
    computationVersion: "v2.2.0",
    source: fromUpload ? "upload" : "seed",
  });

  // Look up programs + suppliers so we can resolve the AI-ANALYSIS
  // placeholder ids at claim-creation time without hardcoding.
  const { data: allPrograms = [] } = useQuery<any[]>({ queryKey: ["/api/programs"] });
  const { data: allSuppliers = [] } = useQuery<any[]>({ queryKey: ["/api/suppliers"] });

  const exportClaimMutation = useMutation({
    mutationFn: async () => {
      if (!result) return;

      const isUpload = result.source === "upload";
      // Pick (programId, supplierId, claim metadata) based on demo vs upload.
      let programId = 9;          // default: seeded Trane FlexPath SPA
      let supplierId = 2;          // default: Trane Technologies
      let claimNumber = `CLM-DRAFT-TRAN-SPA-FLEXPATH-Q1-${Date.now()}`;
      let periodStart = "2024-01-01";
      let periodEnd = "2024-03-31";

      if (isUpload) {
        const aiProgram = allPrograms.find((p: any) => p.programCode === "AI-ANALYSIS");
        const aiSupplier = allSuppliers.find((s: any) => s.code === "AI-ANALYSIS");
        if (aiProgram) programId = aiProgram.id;
        if (aiSupplier) supplierId = aiSupplier.id;
        claimNumber = `CLM-DRAFT-AI-${(result.supplierName ?? "SUPPLIER").replace(/\s+/g, "-").toUpperCase()}-${Date.now()}`;
        // Best-effort period: detected period might be a label like "May–Sep
        // 2024"; fall back to whole year when we can only infer the year.
        const yearMatch = (result.detectedPeriod ?? "").match(/(20\d{2})/);
        const yr = yearMatch ? yearMatch[1] : "2024";
        periodStart = `${yr}-01-01`;
        periodEnd = `${yr}-12-31`;
      }

      return apiRequest("POST", "/api/claims", {
        claimNumber,
        programId,
        supplierId,
        periodStart,
        periodEnd,
        submittedAmount: String(result.expectedAmount.toFixed(2)),
        expectedAmount: String(result.expectedAmount.toFixed(2)),
        format: "edi_844",
        status: "draft",
        submittedAt: null, acknowledgedAt: null, adjudicatedAt: null,
        approvedAmount: null, rejectedAmount: null, rejectionReasonCodes: null, disputeStatus: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      toast({ title: "Draft claim created", description: "Navigating to Claim Recovery to review the draft." });
      setTimeout(() => navigate("/recovery/claim-recovery"), 800);
    },
    onError: () => toast({ title: "Error", description: "Could not create draft claim.", variant: "destructive" }),
  });

  const { data: existingCredits = [] } = useQuery<any[]>({ queryKey: ["/api/expected-credits"] });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Expected Credit Engine</h1>
      </div>

      {/* ── Data Sources + Run Engine ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4 text-muted-foreground" />
              Data Sources
            </CardTitle>
            {hasUploadedFiles && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {[posFile, agreementFile, creditMemosFile].filter(f => f?.status === "ready").length} file(s) ready
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload zones */}
          <div className="flex gap-4 flex-wrap">
            <FileUploadZone
              label="Sales / POS Data"
              description="Core computation input · CSV, XLS"
              icon={<BarChart3 className="h-4 w-4" />}
              accept=".csv,.xls,.xlsx,.txt"
              file={posFile}
              onFile={setPosFile}
              onClear={() => { setPosFile(null); setResult(null); }}
            />
            <FileUploadZone
              label="Agreement File"
              description="Rates, tiers, eligible SKUs · CSV, PDF"
              icon={<FileText className="h-4 w-4" />}
              accept=".csv,.pdf,.txt,.docx"
              file={agreementFile}
              onFile={setAgreementFile}
              onClear={() => setAgreementFile(null)}
            />
            <FileUploadZone
              label="Credit Memos"
              description="Previously received credits · PDF, CSV, XLS"
              icon={<FileSpreadsheet className="h-4 w-4" />}
              accept=".pdf,.csv,.xls,.xlsx,.txt"
              file={creditMemosFile}
              onFile={setCreditMemosFile}
              onClear={() => setCreditMemosFile(null)}
            />
          </div>

          {/* File analysis summary */}
          {hasUploadedFiles && (
            <div className="p-3 bg-slate-900/60 border border-border rounded-xl">
              <div className="flex items-start gap-4 flex-wrap">
                {posFile?.status === "ready" && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{posFile.rowCount.toLocaleString()} POS lines</div>
                      <div className="text-muted-foreground">{posFile.totalAmount > 0 ? `$${posFile.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} sample value` : "Amount col not detected"}</div>
                    </div>
                  </div>
                )}
                {agreementFile?.status === "ready" && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{agreementFile.name}</div>
                      <div className="text-muted-foreground">{agreementFile.rowCount} rows · rate extraction enabled</div>
                    </div>
                  </div>
                )}
                {creditMemosFile?.status === "ready" && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <FileSpreadsheet className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{creditMemosFile.rowCount} credit memos</div>
                      <div className="text-muted-foreground">{creditMemosFile.totalAmount > 0 ? `$${creditMemosFile.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} total credits` : "Loaded"}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Run Engine button */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {allThreeReady
                ? "All 3 files loaded — Helm AI will analyse rebates and reconcile against the credit memo (≈30s)"
                : hasUploadedFiles
                  ? "Upload all 3 (POS, Agreement, Credit Memo) to run live analysis, or click Run for the demo"
                  : ""}
            </p>
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 px-6"
              onClick={runEngine}
              disabled={running}
            >
              {allThreeReady ? <Sparkles className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
              {running ? (
                <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running Engine…</span>
              ) : "Run Engine"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── POST-COMPUTE REGIONS ── */}
      {running && (
        <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span>Running eligibility filter → UOM → rate → tier → exclusions…</span>
        </div>
      )}

      {result && !running && (
        <div className="space-y-6">
          <HeroBanner result={result} onExportToClaim={() => exportClaimMutation.mutate()} isExporting={exportClaimMutation.isPending} onAIResolver={() => setAiResolverOpen(true)} />

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                Computation Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-stretch overflow-x-auto pb-2 gap-0">
                {result.richPipeline.map((step, i) => (
                  <PipelineCard key={step.step} step={step} isLast={i === result.richPipeline.length - 1} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-6 text-xs flex-wrap">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-slate-500" /><span className="text-muted-foreground">{result.totalInputLines.toLocaleString()} input lines</span></div>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-emerald-400 font-medium">{result.totalEligibleLines.toLocaleString()} passed</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-amber-500" /><span className="text-amber-400">{(result.totalInputLines - result.totalEligibleLines).toLocaleString()} dropped</span></div>
                <div className="ml-auto font-semibold text-emerald-400">Net Credit: ${result.expectedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </CardContent>
          </Card>

          <LineLevelTable lines={result.lineRecords} />
        </div>
      )}

      {/* ── Previously Computed Credits ── */}
      {result?.source === "upload" && (result.perCodeBreakdown?.length ?? 0) > 0 ? (
        // Upload scenario: derive the table from this run's per-VCSC breakdown
        // so the user sees the actual analysis, not the seeded demo records.
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Previously Computed Credits — current run</CardTitle>
              <span className="text-[11px] text-muted-foreground">
                {result.detectedPeriod ?? "Analysed period"}
                {result.creditMemoNumber && ` · Memo #${result.creditMemoNumber}`}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  {["VCSC","Programs","Sales","Rebate %","Expected","Received","Mismatch","Status"].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.perCodeBreakdown!.map((c, i) => {
                  const pct = c.appliedRebatePct < 1 ? c.appliedRebatePct * 100 : c.appliedRebatePct;
                  const statusClass = c.status === "matched"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : c.status === "underpaid"
                      ? "bg-amber-500/20 text-amber-400"
                      : c.status === "unclaimed"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-blue-500/20 text-blue-400";
                  return (
                    <tr key={i} className="border-t border-border hover:bg-muted/10">
                      <td className="px-4 py-2 text-xs font-mono text-foreground">{c.vcsc}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground max-w-[160px] truncate">{(c.programCodes ?? []).join(", ") || "—"}</td>
                      <td className="px-4 py-2 text-sm tabular-nums">${c.salesAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-sm tabular-nums text-amber-400">{pct.toFixed(2)}%</td>
                      <td className="px-4 py-2 text-sm font-semibold tabular-nums text-emerald-400">${c.expectedCredit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-sm tabular-nums">${c.receivedCredit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className={`px-4 py-2 text-sm tabular-nums font-semibold ${c.mismatch > 0 ? "text-rose-400" : c.mismatch < 0 ? "text-blue-400" : "text-muted-foreground"}`}>
                        {c.mismatch > 0 ? "+" : ""}${c.mismatch.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-2">
                        <Badge className={statusClass}>{c.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/10 font-semibold">
                  <td className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground" colSpan={2}>Totals</td>
                  <td className="px-4 py-2 text-sm tabular-nums">${result.totalEligibleAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td></td>
                  <td className="px-4 py-2 text-sm font-bold tabular-nums text-emerald-400">${(result.recoverableAmount !== undefined ? result.totalEligibleAmount * (result.appliedRate / 100) : result.expectedAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-2 text-sm tabular-nums">${(result.totalReceivedCredit ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-2 text-sm tabular-nums text-rose-400 font-bold">${(result.recoverableAmount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      ) : existingCredits.length > 0 ? (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Previously Computed Credits</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  {["Program","Period","Eligible Amount","Expected","Status"].map(h => <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {existingCredits.slice(0, 12).map((ec: any, i: number) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/10">
                    <td className="px-4 py-2 text-xs text-muted-foreground">{ec.program?.programCode || `PROG-${ec.programId}`}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{ec.periodStart} – {ec.periodEnd}</td>
                    <td className="px-4 py-2 text-sm">${parseFloat(ec.eligibleSaleAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-emerald-400">${parseFloat(ec.expectedAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-2">
                      <Badge className={ec.status === "settled" ? "bg-slate-500/20 text-slate-400" : ec.status === "claimed" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}>{ec.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {existingCredits.length > 12 && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">+{existingCredits.length - 12} more credit records</div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* ── AI Resolver Modal ── */}
      {result && (
        <AIResolverModal
          open={aiResolverOpen}
          onClose={() => setAiResolverOpen(false)}
          result={result}
        />
      )}
    </div>
  );
}
