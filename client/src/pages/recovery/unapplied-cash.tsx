import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Search, Zap, GitMerge, Link2 } from "lucide-react";

const unappliedItems = [
  {
    id: "DED-LENN-24-SKU-001",
    supplier: "Lennox International",
    remittance: "REM-LENN-2024-04",
    amount: 34000,
    type: "deduction",
    rootCause: "sku_mismatch",
    rootCauseLabel: "SKU Mismatch",
    detail: "Lennox references manufacturer SKU 'LENN-EL296V-OLD'. Distributor system only has 'HV-LENN-EL296'. Invoice reconciliation failed — credit could not be applied.",
    skuMapping: { mfrSku: "LENN-EL296V-OLD", distSku: "HV-LENN-EL296", confidence: 45, suggestedFix: "LENN-EL296V" },
    suggestedMatch: { invoiceNumber: "INV-LENN-2024-001", amount: 145000, confidence: 94 },
    daysPending: 23,
    priority: "high",
  },
];

const rootCauseColors: Record<string, string> = {
  sku_mismatch: "bg-amber-500/20 text-amber-400",
  amount_mismatch: "bg-red-500/20 text-red-400",
  duplicate: "bg-purple-500/20 text-purple-400",
  no_match: "bg-slate-500/20 text-slate-400",
};

export default function UnappliedCash() {
  const { data: remittances = [] } = useQuery<any[]>({ queryKey: ["/api/remittances"] });
  const { data: skuMappings = [] } = useQuery<any[]>({ queryKey: ["/api/sku-mappings"] });

  const totalUnapplied = unappliedItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Unapplied Cash</h1>
          <p className="text-sm text-muted-foreground">Identify and resolve deductions that couldn't be applied due to matching failures</p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm px-3">
          ${totalUnapplied.toLocaleString()} unresolved
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Unapplied Amount", value: `$${totalUnapplied.toLocaleString()}`, color: "text-amber-400" },
          { label: "Open Items", value: String(unappliedItems.length), color: "text-foreground" },
          { label: "Avg Days Pending", value: `${unappliedItems[0]?.daysPending || 0}d`, color: "text-red-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {unappliedItems.map((item) => (
        <Card key={item.id} className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Search className="h-4 w-4 text-amber-400" />
                {item.id}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={rootCauseColors[item.rootCause]}>{item.rootCauseLabel}</Badge>
                <Badge className="bg-red-500/20 text-red-400">{item.daysPending} days pending</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div><div className="text-xs text-muted-foreground">Supplier</div><div className="text-sm font-medium">{item.supplier}</div></div>
              <div><div className="text-xs text-muted-foreground">Remittance</div><div className="text-sm font-medium font-mono">{item.remittance}</div></div>
              <div><div className="text-xs text-muted-foreground">Amount</div><div className="text-sm font-bold text-amber-400">${item.amount.toLocaleString()}</div></div>
            </div>

            {/* Root cause */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">Root Cause: {item.rootCauseLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>

            {/* SKU mapping resolution */}
            {item.skuMapping && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU Mapping Issue</div>
                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Remittance References</div>
                    <code className="text-xs bg-slate-800 px-2 py-1 rounded text-amber-300">{item.skuMapping.mfrSku}</code>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <GitMerge className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                      <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">{item.skuMapping.confidence}% confidence</Badge>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Distributor Has</div>
                    <code className="text-xs bg-slate-800 px-2 py-1 rounded text-foreground">{item.skuMapping.distSku}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-300">
                    Suggested fix: Add mapping <code className="font-mono">{item.skuMapping.mfrSku}</code> → <code className="font-mono">{item.skuMapping.suggestedFix}</code>
                  </span>
                </div>
              </div>
            )}

            {/* Suggested match */}
            {item.suggestedMatch && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Invoice Match</div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Link2 className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-sm font-medium">{item.suggestedMatch.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">${item.suggestedMatch.amount.toLocaleString()} invoice</div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">{item.suggestedMatch.confidence}% match</Badge>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 flex-1">
                <Zap className="h-4 w-4" /> Apply Fix & Match
              </Button>
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" /> Manual Match
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
