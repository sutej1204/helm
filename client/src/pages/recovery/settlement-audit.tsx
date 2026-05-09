import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, DollarSign, ChevronRight, Zap, FileText } from "lucide-react";

const claimSummaries = [
  { id: 1, claimNumber: "CLM-CARR-2024-Q1-001", supplier: "Carrier Global", program: "ContractorPro SPA", submitted: 87420, settled: 79620, variance: 7800, status: "open", period: "Q1 2024", reasonCodes: ["TIER-CALC-ERROR"] },
  { id: 2, claimNumber: "CLM-CARR-2024-Q1-002", supplier: "Carrier Global", program: "Q1 Volume Rebate", submitted: 55449, settled: 45000, variance: 10449, status: "open", period: "Q1 2024", reasonCodes: ["TIER-CALC-ERROR", "VOLUME-CALC"] },
  { id: 3, claimNumber: "CLM-TRAN-2024-Q1-001", supplier: "Trane Technologies", program: "Commercial SPA", submitted: 124800, settled: 118600, variance: 6200, status: "disputing", period: "Q1 2024", reasonCodes: ["CUSTOMER-CLASS-MISMATCH"] },
];

const rejectionCodeExplanations: Record<string, string> = {
  "TIER-CALC-ERROR": "Supplier applied base tier rate instead of tier-2. Volume exceeded $500k threshold triggering 7% rate, but only 5% was applied.",
  "VOLUME-CALC": "Volume calculation excluded Q4 units; base period should include rolling 12-month average per contract §4.2.",
  "CUSTOMER-CLASS-MISMATCH": "6 lines rejected as residential — distributor records show commercial classification. Requires customer class evidence.",
};

interface AuditResult {
  claim: any;
  fourAmountChain: { owed: number; accrued: number; claimed: number; credited: number };
  variance: number;
  variancePercent: number;
  settlements: any[];
  expectedCredits: any[];
  rejectionReasonCodes: string[];
  hasRecoverableVariance: boolean;
  disputeStatus: string | null;
}

function FourAmountChain({ chain }: { chain: AuditResult["fourAmountChain"] }) {
  const steps = [
    { label: "Owed", value: chain.owed, color: "text-foreground" },
    { label: "Accrued", value: chain.accrued, color: "text-blue-400" },
    { label: "Claimed", value: chain.claimed, color: "text-amber-400" },
    { label: "Credited", value: chain.credited, color: chain.credited < chain.owed ? "text-red-400" : "text-emerald-400" },
  ];
  return (
    <div className="flex items-center gap-2 p-4 bg-muted/20 rounded-lg">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 flex-1">
          {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
          <div className="flex-1 text-center px-3 py-2 bg-card border border-border rounded-lg">
            <div className={`text-xl font-bold ${step.color}`}>${step.value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{step.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettlementAudit() {
  const [selectedClaimId, setSelectedClaimId] = useState<number>(1);

  const { data: auditResult, isLoading } = useQuery<AuditResult>({
    queryKey: ["/api/recon/settlement-audit", selectedClaimId],
    queryFn: async () => {
      const res = await fetch(`/api/recon/settlement-audit/${selectedClaimId}`, { method: "POST" });
      return res.json();
    },
    enabled: !!selectedClaimId,
  });

  const totalVariance = claimSummaries.reduce((sum, c) => sum + c.variance, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settlement Audit</h1>
          <p className="text-sm text-muted-foreground">Reconcile owed vs claimed vs credited — identify systematic underpaids</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            ${totalVariance.toLocaleString()} total underpaids
          </Badge>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Zap className="h-3.5 w-3.5" /> File Disputes
          </Button>
        </div>
      </div>

      {/* RECON #2 Highlight */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-amber-300">RECON #2 — Carrier Q1 Systematic Underpayment</div>
          <div className="text-xs text-muted-foreground mt-1">
            Carrier underpaid $87,249 across 2 programs (SPA + Rebate). Root cause: tier calculation error — 5% base applied instead of 7% tier-2.
            Both claims flagged for formal dispute. Recovery probability: <strong className="text-emerald-400">High (92%)</strong>
          </div>
        </div>
      </div>

      {/* Claim selector */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Claims Under Audit</h2>
        {claimSummaries.map((claim) => (
          <Card
            key={claim.id}
            className={`border cursor-pointer transition-all ${selectedClaimId === claim.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-slate-600"}`}
            onClick={() => setSelectedClaimId(claim.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{claim.claimNumber}</div>
                  <div className="text-xs text-muted-foreground">{claim.supplier} · {claim.program} · {claim.period}</div>
                  <div className="flex gap-1.5 mt-1.5">
                    {claim.reasonCodes.map(code => (
                      <Badge key={code} className="bg-slate-700/50 text-slate-300 text-[10px]">{code}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Variance</div>
                  <div className="text-lg font-bold text-red-400">-${claim.variance.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{claim.submitted.toLocaleString()} → {claim.settled.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Detail */}
      {auditResult && !isLoading && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">4-Amount Chain: Owed → Accrued → Claimed → Credited</CardTitle>
            </CardHeader>
            <CardContent>
              <FourAmountChain chain={auditResult.fourAmountChain} />
              {auditResult.variance > 0 && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  <span className="text-sm text-red-300">
                    Gap of <strong>${auditResult.variance.toLocaleString()}</strong> ({auditResult.variancePercent.toFixed(1)}%) between amount owed and amount credited.
                    {auditResult.hasRecoverableVariance && " Disputable — claim has standing."}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection reason analysis */}
          {auditResult.rejectionReasonCodes?.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Rejection Reason Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditResult.rejectionReasonCodes.map((code) => (
                  <div key={code} className="p-3 bg-muted/20 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="bg-amber-500/20 text-amber-400 font-mono text-[10px]">{code}</Badge>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Disputable</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rejectionCodeExplanations[code] || "See contract for details."}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {auditResult.hasRecoverableVariance && (
            <div className="flex gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Zap className="h-4 w-4" /> File Formal Dispute
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" /> Generate Dispute Letter
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
