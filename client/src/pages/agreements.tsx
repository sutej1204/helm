import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, Plus, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function AgreementsPage() {
  const { data: agreements = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/agreements"] });

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    expired: "bg-red-500/20 text-red-400",
    draft: "bg-amber-500/20 text-amber-400",
  };

  const confidenceColor = (c: string | null) => {
    const n = parseFloat(c || "0");
    if (n >= 95) return "text-emerald-400";
    if (n >= 85) return "text-blue-400";
    return "text-amber-400";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Vendor Agreements</h1>
          <p className="text-sm text-muted-foreground">Master distribution agreements — ingested, parsed, and linked to programs</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" /> Upload Agreement
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Agreements", value: agreements.filter(a => a.status === "active").length, color: "text-emerald-400" },
          { label: "Total Programs", value: agreements.reduce((sum: number, a: any) => sum + (a.programs?.length || 0), 0), color: "text-blue-400" },
          { label: "Avg Confidence", value: agreements.length > 0 ? `${Math.round(agreements.reduce((sum: number, a: any) => sum + parseFloat(a.ingestionConfidence || "0"), 0) / agreements.length)}%` : "—", color: "text-foreground" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agreements list */}
      {isLoading ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading agreements...</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {agreements.map((ag: any) => (
            <Card key={ag.id} className="bg-card border-border hover:border-slate-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{ag.agreementName}</div>
                      <div className="text-xs text-muted-foreground">{ag.supplier?.name || `Supplier ${ag.supplierId}`} · {ag.effectiveDate} → {ag.expirationDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {ag.programs?.length > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-medium">{ag.programs.length} programs</div>
                        <div className="text-xs text-muted-foreground">{ag.programs.map((p: any) => p.programType).join(", ")}</div>
                      </div>
                    )}
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${confidenceColor(ag.ingestionConfidence)}`}>{ag.ingestionConfidence}%</div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                    <Badge className={statusColors[ag.status] || "bg-slate-500/20 text-slate-400"}>{ag.status}</Badge>
                    <Badge className="bg-slate-700/50 text-slate-300 text-[10px]">{ag.ingestionStatus}</Badge>
                  </div>
                </div>

                {/* Programs list */}
                {ag.programs?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ag.programs.map((p: any) => (
                      <span key={p.id} className="text-[10px] bg-muted/30 border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                        {p.programName} ({(parseFloat(p.baseRate) || 0).toFixed(1)}%)
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
