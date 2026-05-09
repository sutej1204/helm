import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitMerge, Clock, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

const pipelineStages = [
  { name: "Claim Submitted", count: 2, amount: 214249, color: "border-blue-500/50 bg-blue-500/5" },
  { name: "Adjudicated", count: 1, amount: 118600, color: "border-amber-500/50 bg-amber-500/5" },
  { name: "Credit Memo Issued", count: 2, amount: 124620, color: "border-purple-500/50 bg-purple-500/5" },
  { name: "Applied to Invoice", count: 2, amount: 124620, color: "border-emerald-500/50 bg-emerald-500/5" },
  { name: "Net Paid", count: 6, amount: 1303780, color: "border-slate-500/50 bg-slate-500/5" },
];

const openSettlements = [
  { id: 1, ref: "CM-TRAN-24-0501", supplier: "Trane Technologies", claim: "CLM-TRAN-2024-Q1-001", amount: 118600, stage: "adjudicated", daysOpen: 12, priority: "high" },
  { id: 2, ref: "CM-CARR-24-0421", supplier: "Carrier Global", claim: "CLM-CARR-2024-Q1-001", amount: 79620, stage: "applied", daysOpen: 22, priority: "medium" },
  { id: 3, ref: "CM-CARR-24-0422", supplier: "Carrier Global", claim: "CLM-CARR-2024-Q1-002", amount: 45000, stage: "applied", daysOpen: 20, priority: "medium" },
];

const stageColors: Record<string, string> = {
  submitted: "bg-blue-500/20 text-blue-400",
  adjudicated: "bg-amber-500/20 text-amber-400",
  issued: "bg-purple-500/20 text-purple-400",
  applied: "bg-emerald-500/20 text-emerald-400",
};

export default function SettlementPipeline() {
  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/settlement-events"] });
  const totalOpen = openSettlements.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settlement Pipeline</h1>
          <p className="text-sm text-muted-foreground">Track open credit memos from adjudication through payment application</p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">${totalOpen.toLocaleString()} open</Badge>
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-5 gap-2">
        {pipelineStages.map((stage, i) => (
          <div key={stage.name} className="relative">
            {i < pipelineStages.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
                <div className="w-3 h-0.5 bg-border" />
              </div>
            )}
            <div className={`p-3 rounded-lg border text-center ${stage.color}`}>
              <div className="text-lg font-bold text-foreground">{stage.count}</div>
              <div className="text-[10px] font-semibold text-foreground mt-0.5">{stage.name}</div>
              <div className="text-xs text-muted-foreground mt-1">${(stage.amount/1000).toFixed(0)}k</div>
            </div>
          </div>
        ))}
      </div>

      {/* Open settlements */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-amber-400" />
            Open Settlement Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {openSettlements.map((s) => (
              <div key={s.ref} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-sm font-medium">{s.ref}</div>
                    <div className="text-xs text-muted-foreground">{s.supplier} · {s.claim}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">${s.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{s.daysOpen} days open</div>
                  </div>
                  <Badge className={stageColors[s.stage] || "bg-slate-500/20 text-slate-400"}>{s.stage}</Badge>
                  {s.stage === "adjudicated" && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs">
                      <Zap className="h-3 w-3" /> Apply
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical summary */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Settlement Velocity (trailing 90 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Avg Claim to Credit", value: "18 days", sub: "submit → credit memo" },
              { label: "Avg Credit to Application", value: "4 days", sub: "credit memo → applied" },
              { label: "Total Cycle Time", value: "22 days", sub: "claim → net cleared" },
            ].map(m => (
              <div key={m.label} className="p-3 bg-muted/20 rounded-lg border border-border text-center">
                <div className="text-xl font-bold text-foreground">{m.value}</div>
                <div className="text-xs font-medium text-muted-foreground mt-0.5">{m.label}</div>
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
