import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingDown, AlertTriangle, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Info } from "lucide-react";

type Grain = "category" | "supplier" | "sku";

interface PortfolioRow {
  id: string;
  name: string;
  revenue: number;
  apparentMarginPct: number;
  trueMarginPct: number;
  gapDollars: number;
  gapPct: number;
  recoverableDollars: number;
  category: string;
}

interface DealTerminalRow {
  label: string;
  pct: number;
  perUnit: number;
  type: "apparent" | "add" | "sub" | "result" | "gap";
  recoverable?: boolean;
  link?: string;
  note?: string;
}

const categoryRows: PortfolioRow[] = [
  { id: "res-split", name: "Residential Split Systems", revenue: 18_400_000, apparentMarginPct: 22.0, trueMarginPct: 19.0, gapDollars: 1_394_000, gapPct: 15.1, recoverableDollars: 920_000, category: "Residential" },
  { id: "comm-rtu", name: "Commercial RTU", revenue: 12_800_000, apparentMarginPct: 26.1, trueMarginPct: 24.2, gapDollars: 419_000, gapPct: 7.4, recoverableDollars: 210_000, category: "Commercial" },
  { id: "heat-pump", name: "Heat Pumps", revenue: 9_200_000, apparentMarginPct: 24.8, trueMarginPct: 23.1, gapDollars: 280_000, gapPct: 7.0, recoverableDollars: 140_000, category: "Residential" },
  { id: "mini-split", name: "Mini-Splits (VRF)", revenue: 6_400_000, apparentMarginPct: 28.4, trueMarginPct: 27.6, gapDollars: 65_000, gapPct: 2.9, recoverableDollars: 28_000, category: "Commercial" },
  { id: "controls", name: "Controls & Thermostats", revenue: 4_800_000, apparentMarginPct: 19.2, trueMarginPct: 18.4, gapDollars: 95_000, gapPct: 4.2, recoverableDollars: 42_000, category: "Controls" },
  { id: "accessories", name: "Accessories & Parts", revenue: 3_200_000, apparentMarginPct: 31.0, trueMarginPct: 30.6, gapDollars: 18_000, gapPct: 1.3, recoverableDollars: 8_000, category: "Parts" },
];

const supplierRows: PortfolioRow[] = [
  { id: "carrier", name: "Carrier Global", revenue: 18_500_000, apparentMarginPct: 23.4, trueMarginPct: 19.8, gapDollars: 1_110_000, gapPct: 15.5, recoverableDollars: 720_000, category: "Supplier" },
  { id: "trane", name: "Trane Technologies", revenue: 14_200_000, apparentMarginPct: 22.1, trueMarginPct: 20.4, gapDollars: 520_000, gapPct: 7.8, recoverableDollars: 310_000, category: "Supplier" },
  { id: "lennox", name: "Lennox International", revenue: 9_800_000, apparentMarginPct: 24.8, trueMarginPct: 23.5, gapDollars: 196_000, gapPct: 5.3, recoverableDollars: 95_000, category: "Supplier" },
  { id: "rheem", name: "Rheem Manufacturing", revenue: 7_600_000, apparentMarginPct: 21.6, trueMarginPct: 20.9, gapDollars: 88_000, gapPct: 3.3, recoverableDollars: 40_000, category: "Supplier" },
  { id: "mitsubishi", name: "Mitsubishi Electric", revenue: 6_200_000, apparentMarginPct: 27.3, trueMarginPct: 26.8, gapDollars: 41_000, gapPct: 1.9, recoverableDollars: 18_000, category: "Supplier" },
  { id: "honeywell", name: "Honeywell Controls", revenue: 4_800_000, apparentMarginPct: 18.9, trueMarginPct: 18.2, gapDollars: 36_000, gapPct: 3.8, recoverableDollars: 15_000, category: "Supplier" },
];

const skuRows: PortfolioRow[] = [
  { id: "24abc636", name: "Carrier 24ABC636A003", revenue: 4_330_000, apparentMarginPct: 24.0, trueMarginPct: 18.0, gapDollars: 1_040_000, gapPct: 25.0, recoverableDollars: 780_000, category: "Residential Split" },
  { id: "25hcc548", name: "Carrier 25HCC548A003", revenue: 3_200_000, apparentMarginPct: 22.8, trueMarginPct: 20.1, gapDollars: 310_000, gapPct: 11.9, recoverableDollars: 180_000, category: "Residential Split" },
  { id: "4twx4024", name: "Trane 4TWX4024E1000A", revenue: 2_800_000, apparentMarginPct: 23.5, trueMarginPct: 21.2, gapDollars: 220_000, gapPct: 9.8, recoverableDollars: 110_000, category: "Residential Split" },
  { id: "ycd240", name: "Lennox YCD240S4", revenue: 2_100_000, apparentMarginPct: 26.4, trueMarginPct: 24.8, gapDollars: 145_000, gapPct: 6.1, recoverableDollars: 62_000, category: "Commercial RTU" },
  { id: "mxz5c42", name: "Mitsubishi MXZ-5C42NAHZ", revenue: 1_900_000, apparentMarginPct: 28.9, trueMarginPct: 28.2, gapDollars: 52_000, gapPct: 2.4, recoverableDollars: 20_000, category: "Mini-Split" },
];

const dealTerminalData: Record<string, { title: string; unitPrice: number; units: number; rows: DealTerminalRow[] }> = {
  "24abc636": {
    title: "Carrier 24ABC636A003",
    unitPrice: 4330,
    units: 1000,
    rows: [
      { label: "Apparent gross margin", pct: 24.0, perUnit: 1039, type: "apparent" },
      { label: "Program credits earned (SPA + rebate)", pct: 2.8, perUnit: 121, type: "add", note: "ContractorPro SPA credits received YTD" },
      { label: "Program credits missed — RECOVERABLE", pct: -4.6, perUnit: -199, type: "sub", recoverable: true, link: "/recovery/settlement-audit", note: "End-customer classification error: 41% of eligible contractor sales filed as residential. Fix in Master Data." },
      { label: "Settlement adjustments", pct: -1.1, perUnit: -48, type: "sub", note: "Partial adjudications Q1–Q3 2024" },
      { label: "AP variances (overbilling)", pct: -0.5, perUnit: -22, type: "sub", link: "/recovery/4-way-match", note: "Leg 4 variance on 3 invoices — credit requests filed" },
      { label: "Operational adjustments (freight, UOM)", pct: -0.8, perUnit: -35, type: "sub", note: "Freight absorption not in standard margin calc" },
      { label: "Capital cost (72 days × 8% CoC)", pct: -1.8, perUnit: -78, type: "sub", note: "Cost of carrying AP 72 days avg before settlement" },
      { label: "True margin", pct: 18.0, perUnit: 778, type: "result" },
      { label: "Gap to apparent", pct: -6.0, perUnit: -261, type: "gap" },
    ],
  },
  "res-split": {
    title: "Residential Split Systems (Category)",
    unitPrice: 3200,
    units: 5750,
    rows: [
      { label: "Apparent gross margin", pct: 22.0, perUnit: 704, type: "apparent" },
      { label: "Program credits earned", pct: 3.1, perUnit: 99, type: "add" },
      { label: "Program credits missed — RECOVERABLE", pct: -3.8, perUnit: -122, type: "sub", recoverable: true, link: "/recovery/settlement-audit", note: "$920k recoverable — primarily end-customer classification issues" },
      { label: "Settlement adjustments", pct: -0.9, perUnit: -29, type: "sub" },
      { label: "AP variances", pct: -0.4, perUnit: -13, type: "sub", link: "/recovery/4-way-match" },
      { label: "Operational adjustments", pct: -0.6, perUnit: -19, type: "sub" },
      { label: "Capital cost (68 days × 8% CoC)", pct: -1.4, perUnit: -45, type: "sub" },
      { label: "True margin", pct: 19.0, perUnit: 575, type: "result" },
      { label: "Gap to apparent", pct: -3.0, perUnit: -129, type: "gap" },
    ],
  },
  "carrier": {
    title: "Carrier Global (Supplier)",
    unitPrice: 3800,
    units: 4868,
    rows: [
      { label: "Apparent gross margin", pct: 23.4, perUnit: 889, type: "apparent" },
      { label: "Program credits earned", pct: 2.9, perUnit: 110, type: "add" },
      { label: "Program credits missed — RECOVERABLE", pct: -4.2, perUnit: -160, type: "sub", recoverable: true, link: "/recovery/settlement-audit" },
      { label: "Settlement adjustments (Q1 underpaid)", pct: -1.3, perUnit: -49, type: "sub", note: "$87k RECON #2 open dispute" },
      { label: "AP variances (4-way match)", pct: -0.5, perUnit: -19, type: "sub", link: "/recovery/4-way-match" },
      { label: "Operational adjustments", pct: -0.7, perUnit: -27, type: "sub" },
      { label: "Capital cost (74 days × 8% CoC)", pct: -1.6, perUnit: -61, type: "sub" },
      { label: "True margin", pct: 19.8, perUnit: 752, type: "result" },
      { label: "Gap to apparent", pct: -3.6, perUnit: -137, type: "gap" },
    ],
  },
};

function getDefaultDealTerminal(row: PortfolioRow): { title: string; unitPrice: number; units: number; rows: DealTerminalRow[] } {
  const unitPrice = Math.round(row.revenue / 1000);
  const units = 1000;
  return {
    title: row.name,
    unitPrice,
    units,
    rows: [
      { label: "Apparent gross margin", pct: row.apparentMarginPct, perUnit: Math.round(unitPrice * row.apparentMarginPct / 100), type: "apparent" },
      { label: "Program credits earned", pct: 2.4, perUnit: Math.round(unitPrice * 0.024), type: "add" },
      { label: "Program credits missed — RECOVERABLE", pct: -(row.gapPct * 0.4), perUnit: -Math.round(row.gapDollars / units * 0.55), type: "sub", recoverable: true, link: "/recovery/settlement-audit" },
      { label: "Settlement adjustments", pct: -(row.gapPct * 0.15), perUnit: -Math.round(row.gapDollars / units * 0.2), type: "sub" },
      { label: "AP variances", pct: -(row.gapPct * 0.08), perUnit: -Math.round(row.gapDollars / units * 0.1), type: "sub", link: "/recovery/4-way-match" },
      { label: "Operational adjustments", pct: -(row.gapPct * 0.1), perUnit: -Math.round(row.gapDollars / units * 0.08), type: "sub" },
      { label: "Capital cost", pct: -(row.gapPct * 0.12), perUnit: -Math.round(row.gapDollars / units * 0.07), type: "sub" },
      { label: "True margin", pct: row.trueMarginPct, perUnit: Math.round(unitPrice * row.trueMarginPct / 100), type: "result" },
      { label: "Gap to apparent", pct: -(row.apparentMarginPct - row.trueMarginPct), perUnit: -Math.round(row.gapDollars / units), type: "gap" },
    ],
  };
}

function DealTerminalPanel({ row }: { row: PortfolioRow | null }) {
  if (!row) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-muted-foreground text-sm">Select a row to open the Deal Terminal</div>
      <div className="text-xs text-muted-foreground mt-2">Drills from apparent margin → true margin with every component explained</div>
    </div>
  );

  const terminal = dealTerminalData[row.id] || getDefaultDealTerminal(row);

  return (
    <div className="p-5 space-y-3 h-full overflow-y-auto">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Deal Terminal</div>
        <div className="text-sm font-bold text-foreground">{terminal.title}</div>
        <div className="text-xs text-muted-foreground">{terminal.units.toLocaleString()} units · TTM</div>
      </div>

      <div className="space-y-1.5">
        {terminal.rows.map((r, i) => {
          const isSeparator = r.type === "result" || r.type === "apparent";
          return (
            <div key={i}>
              {r.type === "result" && <div className="border-t border-border my-2" />}
              <div className={`flex items-start gap-2 px-3 py-2 rounded-lg ${
                r.type === "apparent" ? "bg-muted/20 border border-border" :
                r.type === "result" ? "bg-emerald-500/10 border border-emerald-500/20" :
                r.type === "gap" ? "bg-red-500/10 border border-red-500/20" :
                r.recoverable ? "bg-amber-500/5 border border-amber-500/20" :
                "bg-transparent"
              }`}>
                <div className={`text-[10px] font-bold shrink-0 mt-0.5 w-8 text-right font-mono ${
                  r.type === "add" ? "text-emerald-400" :
                  r.type === "sub" ? "text-red-400" :
                  r.type === "result" ? "text-emerald-400" :
                  r.type === "gap" ? "text-red-400" :
                  "text-foreground"
                }`}>
                  {r.type === "add" ? "+" : r.type === "sub" ? "−" : r.type === "gap" ? "=" : ""}
                  {Math.abs(r.pct).toFixed(1)}%
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium ${
                      r.type === "result" ? "text-emerald-300" :
                      r.type === "gap" ? "text-red-300" :
                      r.type === "apparent" ? "text-foreground" :
                      "text-muted-foreground"
                    }`}>{r.label}</span>
                    {r.recoverable && (
                      <Badge className="bg-amber-500/20 text-amber-400 text-[9px] px-1 py-0">RECOVERABLE</Badge>
                    )}
                  </div>
                  {r.note && <div className="text-[10px] text-muted-foreground mt-0.5">{r.note}</div>}
                  {r.link && (
                    <Link href={r.link} className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 mt-0.5">
                      View in ledger <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
                <div className={`text-xs font-mono font-semibold shrink-0 ${
                  r.type === "add" ? "text-emerald-400" :
                  r.type === "sub" || r.type === "gap" ? "text-red-400" :
                  r.type === "result" ? "text-emerald-400" :
                  "text-foreground"
                }`}>
                  {r.perUnit >= 0 && r.type !== "sub" && r.type !== "gap" ? "+" : ""}
                  {r.type === "sub" || (r.type === "gap" && r.perUnit < 0) ? "-" : ""}
                  ${Math.abs(r.perUnit)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-border space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Total gap ({terminal.units.toLocaleString()} units)</span>
          <span className="font-semibold text-red-400">−${row.gapDollars.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Recoverable portion</span>
          <span className="font-semibold text-amber-400">${row.recoverableDollars.toLocaleString()}</span>
        </div>
        <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 text-xs mt-1">
          <ArrowRight className="h-3 w-3" /> Open Recovery Workflow
        </Button>
      </div>
    </div>
  );
}

function PortfolioTable({ rows, selectedId, onSelect }: { rows: PortfolioRow[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [sortBy, setSortBy] = useState<"gap" | "revenue" | "gapPct">("gap");
  const sorted = [...rows].sort((a, b) => {
    if (sortBy === "gap") return b.gapDollars - a.gapDollars;
    if (sortBy === "revenue") return b.revenue - a.revenue;
    return b.gapPct - a.gapPct;
  });

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
            <th className="px-4 py-2 text-left font-medium">Name</th>
            <th className="px-4 py-2 text-right font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy("revenue")}>TTM Revenue {sortBy === "revenue" && "↓"}</th>
            <th className="px-4 py-2 text-right font-medium">Apparent Margin</th>
            <th className="px-4 py-2 text-right font-medium">True Margin</th>
            <th className="px-4 py-2 text-right font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy("gap")}>Gap $ {sortBy === "gap" && "↓"}</th>
            <th className="px-4 py-2 text-right font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy("gapPct")}>Gap % {sortBy === "gapPct" && "↓"}</th>
            <th className="px-4 py-2 text-right font-medium">Recoverable</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.id}
              className={`border-t border-border cursor-pointer transition-colors ${selectedId === row.id ? "bg-emerald-500/5 border-l-2 border-l-emerald-500" : "hover:bg-muted/10"}`}
              onClick={() => onSelect(row.id === selectedId ? "" : row.id)}
            >
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-foreground">{row.name}</div>
              </td>
              <td className="px-4 py-3 text-right text-sm font-mono text-muted-foreground">${(row.revenue / 1e6).toFixed(1)}M</td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm text-muted-foreground">{row.apparentMarginPct.toFixed(1)}%</span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-foreground">{row.trueMarginPct.toFixed(1)}%</span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-bold text-red-400">−${(row.gapDollars / 1000).toFixed(0)}k</span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(row.gapPct * 3, 100)}%` }} />
                  </div>
                  <span className={`text-xs font-mono ${row.gapPct > 10 ? "text-red-400" : row.gapPct > 5 ? "text-amber-400" : "text-muted-foreground"}`}>{row.gapPct.toFixed(1)}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-xs font-mono text-amber-400">${(row.recoverableDollars / 1000).toFixed(0)}k</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarginAttribution() {
  const [grain, setGrain] = useState<Grain>("category");
  const [selectedId, setSelectedId] = useState<string>("res-split");

  const rows = grain === "category" ? categoryRows : grain === "supplier" ? supplierRows : skuRows;
  const selected = rows.find(r => r.id === selectedId) || null;

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalGap = rows.reduce((s, r) => s + r.gapDollars, 0);
  const totalRecoverable = rows.reduce((s, r) => s + r.recoverableDollars, 0);
  const avgApparent = rows.reduce((s, r) => s + r.apparentMarginPct, 0) / rows.length;
  const avgTrue = rows.reduce((s, r) => s + r.trueMarginPct, 0) / rows.length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Margin Attribution</h1>
          <p className="text-sm text-muted-foreground">Apparent margin vs true margin — every dollar of gap explained and linked to source</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/20 rounded-lg p-1">
          {(["category", "supplier", "sku"] as Grain[]).map((g) => (
            <button
              key={g}
              onClick={() => { setGrain(g); setSelectedId(""); }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize ${grain === g ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {g === "sku" ? "SKU" : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Avg Apparent Margin", value: `${avgApparent.toFixed(1)}%`, color: "text-muted-foreground", sub: "As reported" },
          { label: "Avg True Margin", value: `${avgTrue.toFixed(1)}%`, color: "text-foreground", sub: "After all adjustments" },
          { label: "Total Margin Gap (TTM)", value: `−$${(totalGap / 1e6).toFixed(1)}M`, color: "text-red-400", sub: "Across all programs" },
          { label: "Recoverable", value: `$${(totalRecoverable / 1e6).toFixed(1)}M`, color: "text-amber-400", sub: "Filing opportunity" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo punchline banner */}
      <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-red-300">Residential Split Systems: 22% apparent → 19% true — $1.4M gap across TTM</div>
          <p className="text-xs text-muted-foreground mt-1">
            The largest single SKU driver is <span className="font-mono text-foreground">Carrier 24ABC636A003</span>: apparent 24%, true 18%, gap $250/unit.
            Largest contributor: <strong>missed SPA credits ($180/unit)</strong> caused by end-customer classification error.
            <button onClick={() => { setGrain("sku"); setSelectedId("24abc636"); }} className="ml-1 text-emerald-400 hover:underline text-xs">
              Open Deal Terminal →
            </button>
          </p>
        </div>
      </div>

      {/* Split view: table + Deal Terminal */}
      <div className={`grid gap-4 ${selected ? "grid-cols-[1fr,340px]" : "grid-cols-1"}`}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Portfolio — sorted by gap dollars
              <span className="text-xs text-muted-foreground font-normal">(click row to open Deal Terminal)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PortfolioTable rows={rows} selectedId={selectedId} onSelect={setSelectedId} />
          </CardContent>
        </Card>

        {selected && (
          <Card className="bg-card border-border sticky top-6 max-h-[600px] overflow-hidden flex flex-col">
            <DealTerminalPanel row={selected} />
          </Card>
        )}
      </div>
    </div>
  );
}
