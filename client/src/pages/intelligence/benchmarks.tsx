import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Users, ExternalLink } from "lucide-react";

const benchmarkComparisons = [
  { metric: "SPA Claim Capture Rate", yours: 72, peerMedian: 68, topQuartile: 85, bottomQuartile: 45, unit: "%", higherIsBetter: true, status: "above", opportunity: "Above median — close top quartile gap by fixing end-customer classifications" },
  { metric: "Rebate Utilisation Rate", yours: 64, peerMedian: 78, topQuartile: 92, bottomQuartile: 48, unit: "%", higherIsBetter: true, status: "below", opportunity: "$124k/yr in uncaptured rebates vs peer median" },
  { metric: "Days Payable Outstanding", yours: 38, peerMedian: 42, topQuartile: 60, bottomQuartile: 28, unit: "days", higherIsBetter: true, status: "below", opportunity: "$820k working capital if extended to median" },
  { metric: "Claim Submission Speed", yours: 12, peerMedian: 18, topQuartile: 8, bottomQuartile: 32, unit: "days", higherIsBetter: false, status: "above", opportunity: "Faster than median — top quartile achievable" },
  { metric: "Credit Cycle Time", yours: 22, peerMedian: 28, topQuartile: 16, bottomQuartile: 45, unit: "days", higherIsBetter: false, status: "above", opportunity: "6 days faster than peers" },
  { metric: "Unapplied Cash Rate", yours: 4.2, peerMedian: 2.8, topQuartile: 1.2, bottomQuartile: 8.5, unit: "%", higherIsBetter: false, status: "below", opportunity: "$34k active unapplied — resolve SKU mappings (3 lines)" },
];

const rejectionRatePrograms = [
  {
    program: "ContractorPro SPA (Carrier)",
    code: "CARR-SPA-2024-CONTRACTOR",
    networkCustomers: 14,
    industryAvgRejection: 23,
    yourRejection: 41,
    gap: 18,
    gapDollars: 47_200,
    rootCause: "End-customer classification: 41% of your rejections are 'residential' class rejections on sales that other distributors successfully file as contractor. Root fix: update end-customer master records for 38 customers.",
    link: "/master-data",
    severity: "high",
  },
  {
    program: "Annual Volume Rebate (Carrier)",
    code: "CARR-REB-2024-Q1",
    networkCustomers: 11,
    industryAvgRejection: 8,
    yourRejection: 19,
    gap: 11,
    gapDollars: 28_900,
    rootCause: "Volume threshold calculation: your submissions exclude Q4 carry-over units. Industry leaders include rolling 12-month average per §4.2.",
    link: "/agreements",
    severity: "medium",
  },
  {
    program: "Commercial SPA (Trane)",
    code: "TRAN-SPA-2024-COMM",
    networkCustomers: 9,
    industryAvgRejection: 12,
    yourRejection: 21,
    gap: 9,
    gapDollars: 18_600,
    rootCause: "Customer class mismatches on 6 commercial accounts. Buying group codes not aligned with Trane's eligibility list.",
    link: "/master-data",
    severity: "medium",
  },
  {
    program: "Lennox Contractor SPA",
    code: "LENN-SPA-2024",
    networkCustomers: 7,
    industryAvgRejection: 15,
    yourRejection: 17,
    gap: 2,
    gapDollars: 4_200,
    rootCause: "Marginally above average — minor SKU exclusion list discrepancies.",
    link: "/prevention/claim-studio",
    severity: "low",
  },
];

const chartData = benchmarkComparisons.map(b => ({
  name: b.metric.length > 22 ? b.metric.slice(0, 20) + "…" : b.metric,
  yours: b.yours,
  median: b.peerMedian,
  top: b.topQuartile,
}));

function StatusIcon({ status }: { status: string }) {
  if (status === "above") return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  if (status === "below") return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function RejectionGapBar({ yours, industry }: { yours: number; industry: number }) {
  const max = Math.max(yours, industry, 50);
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex-1 relative h-4 bg-muted/20 rounded overflow-hidden">
        <div className="absolute h-full bg-slate-600/50 rounded" style={{ width: `${(industry / max) * 100}%` }} />
        <div className="absolute h-full bg-red-500 rounded opacity-70" style={{ width: `${(yours / max) * 100}%` }} />
      </div>
      <div className="w-24 text-right">
        <span className="text-red-400 font-semibold">{yours}%</span>
        <span className="text-muted-foreground mx-1">vs</span>
        <span className="text-slate-400">{industry}%</span>
      </div>
    </div>
  );
}

export default function Benchmarks() {
  const aboveMedian = benchmarkComparisons.filter(b => b.status === "above").length;
  const belowMedian = benchmarkComparisons.filter(b => b.status === "below").length;
  const totalRejectionGap = rejectionRatePrograms.reduce((s, r) => s + r.gapDollars, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Industry Benchmarks</h1>
        <p className="text-sm text-muted-foreground">Compare performance against HARDI 2024 HVAC distributor peer group · Helm network data (anonymised)</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Above Peer Median", value: String(aboveMedian), color: "text-emerald-400" },
          { label: "Below Peer Median", value: String(belowMedian), color: "text-red-400" },
          { label: "DPO Opportunity", value: "$820k", color: "text-amber-400" },
          { label: "Rejection Rate Gap", value: `$${(totalRejectionGap / 1000).toFixed(0)}k/yr`, color: "text-red-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rejection rate spotlight */}
      <Card className="bg-red-950/30 border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Program Rejection Rate Analysis — Your rate vs Helm network average
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ContractorPro highlight */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-red-500/20 text-red-300 text-[10px]">CRITICAL GAP</Badge>
                  <span className="text-sm font-semibold text-foreground">ContractorPro SPA (Carrier)</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 14 customers in network use this program</span>
                  <span className="font-mono">CARR-SPA-2024-CONTRACTOR</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-red-400">41% <span className="text-xs text-muted-foreground">your rate</span></div>
                <div className="text-xs text-muted-foreground">vs 23% network avg</div>
                <div className="text-xs text-amber-400 font-semibold">−$47.2k/yr opportunity</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Your rejection rate</span>
                <span>Network average</span>
              </div>
              <div className="relative h-3 bg-muted/20 rounded-full overflow-hidden">
                <div className="absolute h-full bg-slate-600/60 rounded-full" style={{ width: "46%" }} />
                <div className="absolute h-full bg-red-500 rounded-full opacity-80" style={{ width: "82%" }} />
                <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-400/60" style={{ left: "46%" }} />
              </div>
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-slate-400">23% (industry avg)</span>
                <span className="text-red-400 font-semibold">41% (yours)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Root cause:</strong> End-customer classification — 41% of your rejections are "residential" class rejections
              on sales that other distributors successfully file as contractor. Fix: update end-customer master records for 38 accounts.
            </p>
            <div className="flex gap-2 mt-3">
              <Link href="/master-data">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs">
                  Fix in Master Data <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
              <Link href="/prevention/expected-credit-engine">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  Recompute Expected Credits
                </Button>
              </Link>
            </div>
          </div>

          {/* Other programs */}
          <div className="space-y-3">
            {rejectionRatePrograms.slice(1).map((prog) => (
              <div key={prog.code} className="p-3 bg-muted/20 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={prog.severity === "medium" ? "bg-amber-500/20 text-amber-400 text-[10px]" : "bg-slate-500/20 text-slate-400 text-[10px]"}>
                        {prog.severity === "medium" ? "MONITOR" : "LOW"}
                      </Badge>
                      <span className="text-xs font-medium">{prog.program}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{prog.code} · {prog.networkCustomers} customers in network</div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-sm font-semibold text-amber-400">{prog.yourRejection}% <span className="text-[10px] text-muted-foreground">vs {prog.industryAvgRejection}% avg</span></div>
                    <div className="text-[10px] text-muted-foreground">+{prog.gap} pts · ${(prog.gapDollars / 1000).toFixed(1)}k/yr</div>
                  </div>
                </div>
                <RejectionGapBar yours={prog.yourRejection} industry={prog.industryAvgRejection} />
                <p className="text-[10px] text-muted-foreground mt-2">{prog.rootCause}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standard benchmarks chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Operational Performance vs Peer Median</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} width={140} />
              <Tooltip contentStyle={{ background: "rgb(15,23,42)", border: "1px solid rgb(51,65,85)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="yours" fill="rgb(16,185,129)" name="Yours" radius={[0, 3, 3, 0]} />
              <Bar dataKey="median" fill="rgba(255,255,255,0.12)" name="Peer Median" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed list */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Detailed Benchmark Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {benchmarkComparisons.map((b) => (
              <div key={b.metric} className="px-6 py-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={b.status} />
                    <span className="text-sm font-medium">{b.metric}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-bold text-foreground">{b.yours}{b.unit}</div>
                      <div className="text-[10px] text-muted-foreground">Yours</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-muted-foreground">{b.peerMedian}{b.unit}</div>
                      <div className="text-[10px] text-muted-foreground">Median</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-400">{b.topQuartile}{b.unit}</div>
                      <div className="text-[10px] text-muted-foreground">Top 25%</div>
                    </div>
                  </div>
                </div>
                <div className="relative h-1.5 bg-muted/30 rounded-full">
                  <div
                    className={`absolute h-full rounded-full ${b.status === "above" ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${Math.min((b.yours / b.topQuartile) * 100, 100).toFixed(0)}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1.5">{b.opportunity}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
