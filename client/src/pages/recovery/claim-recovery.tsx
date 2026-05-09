import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Clock, CheckCircle2, AlertTriangle, Download } from "lucide-react";

const disputeItems = [
  {
    claimNumber: "CLM-TRAN-2024-Q1-001",
    supplier: "Trane Technologies",
    program: "Commercial SPA",
    period: "Q1 2024",
    submittedAmount: 124800,
    approvedAmount: 118600,
    rejectedAmount: 6200,
    rejectionCode: "CUSTOMER-CLASS-MISMATCH",
    disputeStatus: "in_progress",
    deadlineDays: 18,
    evidence: ["Customer PO showing commercial use", "Site inspection report", "Tax records - commercial property"],
    recoveryLikelihood: 78,
  },
];

const statusColors: Record<string, string> = {
  in_progress: "bg-blue-500/20 text-blue-400",
  submitted: "bg-amber-500/20 text-amber-400",
  won: "bg-emerald-500/20 text-emerald-400",
  lost: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  in_progress: "In Progress",
  submitted: "Submitted",
  won: "Won",
  lost: "Lost",
};

export default function ClaimRecovery() {
  const { data: claims = [] } = useQuery<any[]>({ queryKey: ["/api/claims"] });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Claim Recovery</h1>
          <p className="text-sm text-muted-foreground">Dispute rejected claim lines and recover partial payments</p>
        </div>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Zap className="h-3.5 w-3.5" /> New Dispute
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Disputed Amount", value: "$6,200", color: "text-amber-400" },
          { label: "Recovery Likelihood", value: "78%", color: "text-emerald-400" },
          { label: "Expected Recovery", value: "~$4,836", color: "text-foreground" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dispute items */}
      {disputeItems.map((item) => (
        <Card key={item.claimNumber} className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {item.claimNumber}
              </CardTitle>
              <Badge className={statusColors[item.disputeStatus]}>{statusLabels[item.disputeStatus]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Supplier", value: item.supplier },
                { label: "Program", value: item.program },
                { label: "Period", value: item.period },
                { label: "Deadline", value: `${item.deadlineDays} days`, color: item.deadlineDays < 20 ? "text-amber-400" : "text-foreground" },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-xs text-muted-foreground mb-0.5">{f.label}</div>
                  <div className={`text-sm font-medium ${f.color || "text-foreground"}`}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">${item.submittedAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Submitted</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-lg font-bold text-emerald-400">${item.approvedAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">${item.rejectedAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Rejected → Disputing</div>
              </div>
            </div>

            {/* Rejection Code */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <Badge className="bg-amber-500/20 text-amber-400 font-mono text-[10px]">{item.rejectionCode}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                6 lines rejected on grounds of residential customer classification. Distributor records show commercial use — rebuttable with evidence.
              </p>
            </div>

            {/* Evidence */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence Package</div>
              <div className="space-y-1.5">
                {item.evidence.map((ev) => (
                  <div key={ev} className="flex items-center gap-2 p-2 bg-muted/20 rounded border border-border">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-foreground">{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery likelihood */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-emerald-400">Recovery Likelihood</span>
                <span className="text-sm font-bold text-emerald-400">{item.recoveryLikelihood}%</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.recoveryLikelihood}%` }} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 flex-1">
                <Zap className="h-4 w-4" /> Submit Dispute Package
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Historical disputes table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Historical Disputes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                {["Claim Number", "Supplier", "Disputed", "Outcome", "Recovered"].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">CLM-CARR-2023-Q4-003</td>
                <td className="px-4 py-3 text-sm">Carrier Global</td>
                <td className="px-4 py-3 text-sm text-amber-400">$18,400</td>
                <td className="px-4 py-3"><Badge className="bg-emerald-500/20 text-emerald-400">Won</Badge></td>
                <td className="px-4 py-3 text-sm text-emerald-400">$18,400</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">CLM-LENN-2023-Q3-002</td>
                <td className="px-4 py-3 text-sm">Lennox International</td>
                <td className="px-4 py-3 text-sm text-amber-400">$7,200</td>
                <td className="px-4 py-3"><Badge className="bg-emerald-500/20 text-emerald-400">Won</Badge></td>
                <td className="px-4 py-3 text-sm text-emerald-400">$5,800</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
