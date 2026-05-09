import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Clock, CheckCircle2, AlertTriangle, Download, Code2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const draftClaims = [
  {
    id: 6,
    claimNumber: "CLM-TRAN-2024-Q2-001",
    supplier: "Trane Technologies",
    program: "Commercial SPA",
    period: "Q2 2024",
    totalAmount: 45180,
    lineCount: 8,
    format: "edi_844",
    readiness: 100,
    deadlineDays: 3,
    issues: [],
  },
  {
    id: 7,
    claimNumber: "CLM-TRAN-2024-Q2-002",
    supplier: "Trane Technologies",
    program: "Annual Volume Rebate",
    period: "Q2 2024",
    totalAmount: 40176,
    lineCount: 5,
    format: "edi_844",
    readiness: 100,
    deadlineDays: 3,
    issues: [],
  },
  {
    id: 8,
    claimNumber: "CLM-TRAN-2024-Q2-003",
    supplier: "Trane Technologies",
    program: "Co-op Advertising",
    period: "Q2 2024",
    totalAmount: 38628,
    lineCount: 6,
    format: "portal",
    readiness: 87,
    deadlineDays: 3,
    issues: ["Portal credentials need verification"],
  },
];

const ediPayloadExample = `ISA*00*          *00*          *ZZ*HELM-DIST        *ZZ*MFR-TRANE        *240510*1200*^*00501*000000001*0*P*>~
GS*CN*HELM-DIST*MFR-TRANE*20240510*1200*1*X*005010~
ST*844*0001~
BQ*00*CLM-TRAN-2024-Q2-001*20240401*20240630~
N1*SE*Helm Distribution Inc.*ZZ*HV-DIST-001~
CID*SB*Commercial SPA Q2 2024*45180.00~
CID*SB*TRAN-4TWX - 30 units @ $2550.00*76500.00~
CID*SB*TRAN-XB15 - 12 units @ $3400.00*40800.00~
CID*SB*TRAN-XR17 - 9 units @ $3800.00*34200.00~
SE*8*0001~
GE*1*1~
IEA*1*000000001~`;

export default function ClaimStudio() {
  const [selectedClaim, setSelectedClaim] = useState<number>(6);
  const [showEdi, setShowEdi] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());

  const submitMutation = useMutation({
    mutationFn: async (claimId: number) => {
      const res = await fetch(`/api/claims/${claimId}/submit`, { method: "POST" });
      return res.json();
    },
    onSuccess: (_, claimId) => {
      setSubmittedIds(prev => new Set([...prev, claimId]));
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
    },
  });

  const submitAllMutation = useMutation({
    mutationFn: async () => {
      const readyClaims = draftClaims.filter(c => c.readiness === 100);
      const results = await Promise.allSettled(
        readyClaims.map(c => fetch(`/api/claims/${c.id}/submit`, { method: "POST" }).then(r => r.json()))
      );
      return results;
    },
    onSuccess: () => {
      draftClaims.filter(c => c.readiness === 100).forEach(c => setSubmittedIds(prev => new Set([...prev, c.id])));
    },
  });

  const totalAtRisk = draftClaims.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Claim Studio</h1>
          <p className="text-sm text-muted-foreground">Review, validate, and submit claims — with EDI 844 generation</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Deadline: 3 days</Badge>
          <Button
            className="bg-red-600 hover:bg-red-700 gap-2"
            onClick={() => submitAllMutation.mutate()}
            disabled={submitAllMutation.isPending}
          >
            <Zap className="h-4 w-4" />
            {submitAllMutation.isPending ? "Submitting..." : `Submit All Ready Claims`}
          </Button>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-semibold text-red-300">
            ${totalAtRisk.toLocaleString()} in Trane Q2 credits expire in 3 days.
          </span>
          <span className="text-xs text-muted-foreground ml-2">All credits computed. 2 of 3 claims are 100% ready.</span>
        </div>
        <span className="text-xs font-mono text-red-400">Per §8.2: 45-day claim window from period end</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Claim list */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Claim Drafts</h2>
          {draftClaims.map((claim) => (
            <Card
              key={claim.id}
              className={`border cursor-pointer transition-all ${selectedClaim === claim.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-slate-600"}`}
              onClick={() => setSelectedClaim(claim.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs font-mono text-muted-foreground">{claim.claimNumber}</div>
                  {submittedIds.has(claim.id) ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Submitted</Badge>
                  ) : (
                    <Badge className={`text-[10px] ${claim.readiness === 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {claim.readiness}% ready
                    </Badge>
                  )}
                </div>
                <div className="text-sm font-medium text-foreground">{claim.program}</div>
                <div className="text-xs text-muted-foreground">{claim.period}</div>
                <div className="text-lg font-bold text-foreground mt-1">${claim.totalAmount.toLocaleString()}</div>
                <div className="h-1.5 bg-muted/30 rounded-full mt-2">
                  <div className={`h-full rounded-full ${claim.readiness === 100 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${claim.readiness}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Claim detail */}
        {(() => {
          const claim = draftClaims.find(c => c.id === selectedClaim);
          if (!claim) return null;
          const isSubmitted = submittedIds.has(claim.id);
          return (
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {claim.claimNumber}
                    </div>
                    {isSubmitted ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Submitted
                      </Badge>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setShowEdi(!showEdi)}>
                          <Code2 className="h-3 w-3" /> {showEdi ? "Hide" : "Preview"} EDI
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => submitMutation.mutate(claim.id)}
                          disabled={submitMutation.isPending}
                        >
                          <Zap className="h-3 w-3" /> Submit
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Supplier", value: claim.supplier },
                      { label: "Program", value: claim.program },
                      { label: "Format", value: claim.format.toUpperCase() },
                      { label: "Deadline", value: `${claim.deadlineDays} days`, color: "text-red-400" },
                    ].map(f => (
                      <div key={f.label}>
                        <div className="text-xs text-muted-foreground">{f.label}</div>
                        <div className={`text-sm font-medium ${f.color || "text-foreground"}`}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">${claim.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Claim Amount</div>
                    </div>
                    <div className="text-center border-x border-border">
                      <div className="text-2xl font-bold text-foreground">{claim.lineCount}</div>
                      <div className="text-xs text-muted-foreground">Credit Lines</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{claim.readiness}%</div>
                      <div className="text-xs text-muted-foreground">Readiness</div>
                    </div>
                  </div>
                  {claim.issues.length > 0 && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      {claim.issues.map(issue => (
                        <div key={issue} className="flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="text-xs text-amber-300">{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {showEdi && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2"><Code2 className="h-4 w-4" /> EDI 844 Preview</span>
                      <Button size="sm" variant="outline" className="text-xs gap-1"><Download className="h-3 w-3" /> Download</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-[10px] font-mono text-emerald-300 bg-slate-950 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {ediPayloadExample}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
