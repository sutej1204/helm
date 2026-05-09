import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { DollarSign, TrendingUp, Calendar, Clock } from "lucide-react";

const weeklyForecast = [
  { week: "Wk 1 (May 6-10)", carrier: 45000, trane: 0, lennox: 0, rheem: 0, total: 45000, type: "confirmed" },
  { week: "Wk 2 (May 13-17)", carrier: 79620, trane: 0, lennox: 0, rheem: 0, total: 79620, type: "confirmed" },
  { week: "Wk 3 (May 20-24)", carrier: 0, trane: 118600, lennox: 0, rheem: 0, total: 118600, type: "expected" },
  { week: "Wk 4 (May 27-31)", carrier: 0, trane: 0, lennox: 89200, rheem: 0, total: 89200, type: "projected" },
  { week: "Wk 5 (Jun 3-7)", carrier: 0, trane: 124000, lennox: 0, rheem: 38400, total: 162400, type: "projected" },
  { week: "Wk 6 (Jun 10-14)", carrier: 121000, trane: 0, lennox: 0, rheem: 0, total: 121000, type: "projected" },
];

const inflows = [
  { supplier: "Carrier Global", creditMemo: "CM-CARR-24-0421", amount: 79620, week: "May 13-17", status: "confirmed", type: "SPA Credit" },
  { supplier: "Carrier Global", creditMemo: "CM-CARR-24-0422", amount: 45000, week: "May 6-10", status: "confirmed", type: "Rebate Credit" },
  { supplier: "Trane Technologies", creditMemo: "CM-TRAN-24-0501", amount: 118600, week: "May 20-24", status: "expected", type: "SPA Credit" },
  { supplier: "Lennox International", creditMemo: "TBD", amount: 89200, week: "May 27-31", status: "projected", type: "SPA Credit (claim pending)" },
  { supplier: "Trane Technologies", creditMemo: "TBD", amount: 124000, week: "Jun 3-7", status: "projected", type: "Q2 SPA (upon claim)" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-500/20 text-emerald-400",
  expected: "bg-blue-500/20 text-blue-400",
  projected: "bg-amber-500/20 text-amber-400",
};

export default function CashFlowForecast() {
  const totalForecast = weeklyForecast.reduce((sum, w) => sum + w.total, 0);
  const confirmedTotal = weeklyForecast.filter(w => w.type === "confirmed").reduce((sum, w) => sum + w.total, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cash Flow Forecast</h1>
        <p className="text-sm text-muted-foreground">Credit inflow from supplier settlements — by week, by supplier</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "6-Week Forecast", value: `$${(totalForecast/1000).toFixed(0)}k`, color: "text-foreground" },
          { label: "Confirmed (2 weeks)", value: `$${confirmedTotal.toLocaleString()}`, color: "text-emerald-400" },
          { label: "Projected (weeks 3-6)", value: `$${(totalForecast - confirmedTotal).toLocaleString()}`, color: "text-amber-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Weekly Credit Inflow by Supplier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "rgb(15,23,42)", border: "1px solid rgb(51,65,85)", borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine x="Wk 3 (May 20-24)" stroke="rgba(59,130,246,0.4)" strokeDasharray="4 4" label={{ value: "Today", fill: "rgb(100,116,139)", fontSize: 10 }} />
              <Bar dataKey="carrier" stackId="a" fill="rgb(16,185,129)" name="Carrier" />
              <Bar dataKey="trane" stackId="a" fill="rgb(59,130,246)" name="Trane" />
              <Bar dataKey="lennox" stackId="a" fill="rgb(251,191,36)" name="Lennox" radius={[3,3,0,0]} />
              <Bar dataKey="rheem" stackId="a" fill="rgb(168,85,247)" name="Rheem" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${color}`}>{status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Inflow Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                {["Supplier", "Credit Memo", "Amount", "Week", "Type", "Status"].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inflows.map((inf, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/10">
                  <td className="px-4 py-3 text-sm font-medium">{inf.supplier}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{inf.creditMemo}</td>
                  <td className="px-4 py-3 text-sm font-bold text-emerald-400">${inf.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{inf.week}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{inf.type}</td>
                  <td className="px-4 py-3"><Badge className={`${statusColors[inf.status]} text-[10px]`}>{inf.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
