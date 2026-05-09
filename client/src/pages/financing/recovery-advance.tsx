import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Banknote, CheckCircle2, Calculator, Zap, AlertTriangle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface QuoteResult {
  supplierId: number;
  selectedCredits: any[];
  totalExpectedCredit: number;
  advanceRate: number;
  advanceAmount: number;
  feePercent: number;
  feeAmount: number;
  netAdvance: number;
  expectedSettlementDays: number;
  expectedSettlementDate: string;
  annualizedCost: number;
}

const eligibleCreditIds = [9, 10, 11];

const eligibleCredits = [
  { id: 9, program: "ContractorPro SPA Q2", expectedAmount: 34104, status: "computed", period: "Q2 2024" },
  { id: 10, program: "ContractorPro SPA Q2", expectedAmount: 86996, status: "computed", period: "Q2 2024" },
  { id: 11, program: "Q2 Volume Rebate", expectedAmount: 83444, status: "computed", period: "Q2 2024" },
];

const existingAdvances = [
  {
    id: 1,
    supplier: "Carrier Global",
    totalExpectedCredit: 204544,
    advanceAmount: 163635,
    advanceRate: 80,
    feePercent: 1.5,
    feeAmount: 2455,
    advanceDate: "2024-05-08",
    expectedSettlementDate: "2024-07-19",
    status: "active",
  },
];

export default function RecoveryAdvancePage() {
  const [advanceRate, setAdvanceRate] = useState(80);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  const quoteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/recovery-advance/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId: 1, expectedCreditIds: eligibleCreditIds, advanceRate: advanceRate / 100 }),
      });
      return res.json();
    },
    onSuccess: (data) => setQuote(data),
  });

  const acceptMutation = useMutation({
    mutationFn: async (q: QuoteResult) => {
      const res = await fetch("/api/recovery-advances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: q.supplierId,
          expectedCreditIdsCovered: eligibleCreditIds,
          totalExpectedCredit: q.totalExpectedCredit.toString(),
          advanceRate: (q.advanceRate / 100).toString(),
          advanceAmount: q.advanceAmount.toString(),
          feePercent: q.feePercent.toString(),
          feeAmount: q.feeAmount.toString(),
          advanceDate: new Date().toISOString().split("T")[0],
          expectedSettlementDate: q.expectedSettlementDate,
          status: "active",
        }),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/recovery-advances"] }),
  });

  const totalEligible = eligibleCredits.reduce((sum, c) => sum + c.expectedAmount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Recovery Advance</h1>
        <p className="text-sm text-muted-foreground">Advance against verified expected credits — get cash now, settle when supplier pays</p>
      </div>

      {/* Active advance */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Advances</h2>
        {existingAdvances.map((adv) => (
          <Card key={adv.id} className="bg-card border-border border-purple-500/30 bg-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold">Carrier Global — Q2 Credit Advance</span>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400">{adv.status}</Badge>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Backing Credits", value: `$${adv.totalExpectedCredit.toLocaleString()}` },
                  { label: "Advance Rate", value: `${adv.advanceRate}%` },
                  { label: "Advanced Amount", value: `$${adv.advanceAmount.toLocaleString()}`, color: "text-purple-400" },
                  { label: "Expected Settlement", value: adv.expectedSettlementDate },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-xs text-muted-foreground">{f.label}</div>
                    <div className={`text-sm font-semibold ${f.color || "text-foreground"}`}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-2 bg-muted/30 rounded-full">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "15%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Advanced {adv.advanceDate}</span>
                <span>Expected close {adv.expectedSettlementDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quote new advance */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            Quote New Advance — Carrier Q2 Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Eligible credits */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">Eligible Credits</div>
            {eligibleCredits.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs">{credit.program} · {credit.period}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400">${credit.expectedAmount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground">Total Eligible</span>
              <span className="text-lg font-bold text-foreground">${totalEligible.toLocaleString()}</span>
            </div>
          </div>

          {/* Advance rate slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground font-medium">Advance Rate</div>
              <span className="text-sm font-bold text-purple-400">{advanceRate}%</span>
            </div>
            <Slider
              value={[advanceRate]}
              min={60}
              max={90}
              step={5}
              onValueChange={([v]) => { setAdvanceRate(v); setQuote(null); }}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>60% (lower risk)</span>
              <span>90% (higher fee)</span>
            </div>
          </div>

          {/* Preview */}
          {!quote && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">${Math.round(totalEligible * advanceRate / 100).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Advance Amount</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-xl font-bold text-foreground">{advanceRate >= 85 ? "2.0%" : "1.5%"}</div>
                <div className="text-xs text-muted-foreground">Fee</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">${Math.round(totalEligible * advanceRate / 100 * (1 - (advanceRate >= 85 ? 0.02 : 0.015))).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Net to You</div>
              </div>
            </div>
          )}

          {quote && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 p-4 bg-purple-500/5 border border-purple-500/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">${quote.advanceAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-xs text-muted-foreground">Advance Amount</div>
                </div>
                <div className="text-center border-x border-purple-500/20">
                  <div className="text-2xl font-bold text-amber-400">${quote.feeAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-xs text-muted-foreground">Fee ({quote.feePercent}%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">${quote.netAdvance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-xs text-muted-foreground">Net to You</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Settlement Date", value: quote.expectedSettlementDate },
                  { label: "Term", value: `${quote.expectedSettlementDays} days` },
                  { label: "Annualized Cost", value: `${quote.annualizedCost.toFixed(1)}%` },
                ].map(f => (
                  <div key={f.label} className="p-2.5 bg-muted/20 rounded-lg text-center">
                    <div className="text-sm font-semibold text-foreground">{f.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.label}</div>
                  </div>
                ))}
              </div>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                onClick={() => acceptMutation.mutate(quote)}
                disabled={acceptMutation.isPending}
              >
                <Zap className="h-4 w-4" />
                {acceptMutation.isPending ? "Activating..." : "Accept & Activate Advance"}
              </Button>
            </div>
          )}

          {!quote && (
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
              onClick={() => quoteMutation.mutate()}
              disabled={quoteMutation.isPending}
            >
              <Calculator className="h-4 w-4" />
              {quoteMutation.isPending ? "Generating Quote..." : "Generate Quote"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
