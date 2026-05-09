import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp } from "lucide-react";

const accrualData = [
  { week: "W1 Apr", carrier: 48200, trane: 38400, lennox: 22100, total: 108700 },
  { week: "W2 Apr", carrier: 51400, trane: 41200, lennox: 24300, total: 116900 },
  { week: "W3 Apr", carrier: 53800, trane: 43100, lennox: 25800, total: 122700 },
  { week: "W4 Apr", carrier: 58200, trane: 47600, lennox: 27200, total: 133000 },
  { week: "W1 May", carrier: 62400, trane: 51800, lennox: 29400, total: 143600 },
  { week: "W2 May", carrier: 67100, trane: 55200, lennox: 31600, total: 153900 },
];

const liveAccruals = [
  { supplier: "Carrier Global", program: "ContractorPro SPA Q2", accrualToDate: 67100, projectedTotal: 121000, rate: "7.0%", tier: "Tier-2", lastUpdate: "2 min ago" },
  { supplier: "Carrier Global", program: "Q2 Volume Rebate", accrualToDate: 38200, projectedTotal: 83400, rate: "4.5%", tier: "Tier-2", lastUpdate: "2 min ago" },
  { supplier: "Trane Technologies", program: "Commercial SPA Q2", accrualToDate: 55200, projectedTotal: 124000, rate: "6.0%", tier: "Tier-2", lastUpdate: "5 min ago" },
  { supplier: "Trane Technologies", program: "Volume Rebate Q2", accrualToDate: 31600, projectedTotal: 71200, rate: "3.5%", tier: "Base", lastUpdate: "5 min ago" },
  { supplier: "Lennox International", program: "Contractor SPA Q2", accrualToDate: 29400, projectedTotal: 66000, rate: "5.0%", tier: "Base", lastUpdate: "12 min ago" },
  { supplier: "Rheem Manufacturing", program: "Volume Rebate Q2", accrualToDate: 18200, projectedTotal: 38400, rate: "3.5%", tier: "Base", lastUpdate: "18 min ago" },
];

const totalAccrual = liveAccruals.reduce((sum, a) => sum + a.accrualToDate, 0);
const totalProjected = liveAccruals.reduce((sum, a) => sum + a.projectedTotal, 0);

export default function Accruals() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Real-time Accruals</h1>
          <p className="text-sm text-muted-foreground">Live credit accruals by program — updated every transaction</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Accrued YTD", value: `$${totalAccrual.toLocaleString()}`, color: "text-emerald-400" },
          { label: "Projected Q2 Total", value: `$${totalProjected.toLocaleString()}`, color: "text-blue-400" },
          { label: "Accrual Accuracy", value: "96.2%", color: "text-foreground" },
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
            Accrual Trend by Supplier (6 weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={accrualData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "rgb(15,23,42)", border: "1px solid rgb(51,65,85)", borderRadius: 8 }} formatter={(v: number) => [`$${(v/1000).toFixed(1)}k`]} />
              <Area type="monotone" dataKey="carrier" stackId="1" stroke="rgb(16,185,129)" fill="rgba(16,185,129,0.3)" name="Carrier" />
              <Area type="monotone" dataKey="trane" stackId="1" stroke="rgb(59,130,246)" fill="rgba(59,130,246,0.3)" name="Trane" />
              <Area type="monotone" dataKey="lennox" stackId="1" stroke="rgb(251,191,36)" fill="rgba(251,191,36,0.3)" name="Lennox" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Live Accruals by Program
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                {["Supplier", "Program", "Accrued", "Projected", "Rate / Tier", "Updated"].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveAccruals.map((a) => (
                <tr key={a.program} className="border-t border-border hover:bg-muted/10">
                  <td className="px-4 py-3 text-sm font-medium">{a.supplier}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.program}</td>
                  <td className="px-4 py-3 text-sm font-bold text-emerald-400">${a.accrualToDate.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-blue-400">${a.projectedTotal.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{a.rate}</div>
                    <Badge className="bg-slate-700/50 text-slate-300 text-[10px]">{a.tier}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground/60">{a.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
