import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, AlertTriangle, XCircle, ChevronRight, Zap, Download, BookOpen } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MatchResult {
  invoice: any;
  po: any;
  receipts: any[];
  variances: {
    invoiceLine: any;
    poLine: any;
    invoicePrice: string;
    poPrice: string;
    contractedPrice: string;
    priceVariance: number;
    varianceFlag: string;
    recoverable: boolean;
  }[];
  matchStatus: string;
  totalVariance: number;
  hasRecoverableVariance: boolean;
  summary: any;
}

const exceptionInvoices = [
  { id: 2, number: "INV-CARR-2024-002", supplier: "Carrier Global", po: "PO-2024-0002", totalVariance: 5600, matchStatus: "price_variance", priority: "high", agreementVariance: 5600 },
  { id: 4, number: "INV-TRAN-2024-003", supplier: "Trane Technologies", po: "PO-2024-0010", totalVariance: 2100, matchStatus: "price_variance", priority: "medium", agreementVariance: 2100 },
  { id: 3, number: "INV-TRAN-2024-002", supplier: "Trane Technologies", po: "PO-2024-0011", totalVariance: 0, matchStatus: "matched", priority: "low", agreementVariance: 0 },
];

const matchStatusIcon: Record<string, React.ReactNode> = {
  matched: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  price_variance: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  unmatched_po: <XCircle className="h-4 w-4 text-red-400" />,
};

const matchStatusColor: Record<string, string> = {
  matched: "bg-emerald-500/20 text-emerald-400",
  price_variance: "bg-amber-500/20 text-amber-400",
  unmatched_po: "bg-red-500/20 text-red-400",
};

const legColors: Record<string, string> = {
  ok: "border-emerald-500/40 bg-emerald-500/5",
  price_variance: "border-amber-500/40 bg-amber-500/5",
  missing: "border-red-500/40 bg-red-500/5",
  matched: "border-emerald-500/40 bg-emerald-500/5",
};

const agreementClause = {
  sku: "CARR-25HC",
  programCode: "CARR-SPA-2024-CONTRACTOR",
  programName: "ContractorPro SPA",
  clauseRef: "§3.2(b)",
  contractedPrice: "840.00",
  billedPrice: "896.00",
  delta: 56.00,
  units: 100,
  totalRecoverable: 5600,
  clauseText: "Distributor shall be invoiced at the SPA net price for all eligible end-customers. Eligible end-customer classes: contractor, GPO-registered. Invoice price must reflect SPA rate at time of shipment. Any overbilling against agreed SPA price is recoverable via credit memo request within 90 days of invoice date.",
};

function VarianceRow({ v }: { v: any }) {
  const isOverbilled = v.varianceFlag === "overbilled";
  return (
    <tr className="border-t border-border hover:bg-muted/10">
      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{v.invoiceLine?.manufacturerSku}</td>
      <td className="px-4 py-3 text-sm">{v.invoiceLine?.quantity} ea</td>
      <td className="px-4 py-3 text-sm font-mono">${parseFloat(v.poPrice || "0").toLocaleString()}</td>
      <td className="px-4 py-3 text-sm font-mono">${parseFloat(v.invoicePrice || "0").toLocaleString()}</td>
      <td className="px-4 py-3 text-sm font-mono text-blue-400">${parseFloat(v.contractedPrice || "0").toLocaleString()}</td>
      <td className="px-4 py-3">
        {v.priceVariance !== 0 ? (
          <span className={`text-sm font-semibold ${isOverbilled ? "text-amber-400" : "text-emerald-400"}`}>
            {isOverbilled ? "+" : ""}{v.priceVariance < 0 ? "-" : ""}${Math.abs(v.priceVariance).toLocaleString()}
          </span>
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          {v.varianceFlag !== "matched" ? (
            <Badge className={isOverbilled ? "bg-amber-500/20 text-amber-400 text-[10px]" : "bg-blue-500/20 text-blue-400 text-[10px]"}>
              {isOverbilled ? "Leg 4 variance" : "Underbilled"}
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Clean</Badge>
          )}
          {v.recoverable && (
            <span className="text-[10px] text-emerald-400">Recoverable</span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function FourWayMatch() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(2);
  const [showClause, setShowClause] = useState(false);

  const { data: matchResult, isLoading } = useQuery<MatchResult>({
    queryKey: ["/api/recon/ap-match", selectedInvoiceId],
    queryFn: async () => {
      const res = await fetch(`/api/recon/ap-match/${selectedInvoiceId}`, { method: "POST" });
      if (!res.ok) throw new Error("Match failed");
      return res.json();
    },
    enabled: !!selectedInvoiceId,
  });

  const acceptMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      return await apiRequest("PATCH", `/api/invoices/${invoiceId}`, { matchStatus: "exception_accepted" });
    },
  });

  const selectedInv = exceptionInvoices.find(i => i.id === selectedInvoiceId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">4-Way Invoice Match</h1>
          <p className="text-sm text-muted-foreground">Invoice × Purchase Order × Goods Receipt × Vendor Agreement — the fourth leg is where Helm finds money</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export Variances
        </Button>
      </div>

      {/* The differentiator callout */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <BookOpen className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-blue-300">Why the 4th leg matters</div>
          <p className="text-xs text-muted-foreground mt-1">
            Standard AP automation (Zip, Coupa) does 3-way match: Invoice ↔ PO ↔ Receipt. Helm adds a 4th leg —
            the Vendor Agreement. When a supplier bills above the contracted SPA price, the 3-way match says "clean."
            Helm flags it. Total overcharges detected this quarter: <strong className="text-amber-400">$7,700</strong> across 2 suppliers.
          </p>
        </div>
      </div>

      {/* Invoice selector */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoices Under Review</h2>
        {exceptionInvoices.map((inv) => (
          <Card
            key={inv.id}
            className={`border cursor-pointer transition-all ${selectedInvoiceId === inv.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-slate-600"}`}
            onClick={() => setSelectedInvoiceId(inv.id)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {matchStatusIcon[inv.matchStatus]}
                <div>
                  <div className="text-sm font-medium">{inv.number}</div>
                  <div className="text-xs text-muted-foreground">{inv.supplier} · {inv.po}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {inv.agreementVariance > 0 && (
                  <div className="text-right">
                    <span className="text-sm font-semibold text-amber-400">+${inv.agreementVariance.toLocaleString()}</span>
                    <div className="text-[10px] text-muted-foreground">Leg 4 variance</div>
                  </div>
                )}
                <Badge className={matchStatusColor[inv.matchStatus]}>
                  {inv.matchStatus === "price_variance" ? "Leg 4 Variance" : "Clean"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Running 4-way match...</CardContent>
        </Card>
      )}

      {matchResult && !isLoading && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Invoice Total", value: `$${parseFloat(matchResult.invoice?.totalAmount || "0").toLocaleString()}`, color: "text-foreground" },
              { label: "PO Total", value: `$${parseFloat(matchResult.po?.totalAmount || "0").toLocaleString()}`, color: "text-foreground" },
              { label: "3-Way Result", value: matchResult.matchStatus === "matched" ? "Clean" : "Exception", color: matchResult.matchStatus === "matched" ? "text-emerald-400" : "text-amber-400" },
              { label: "Leg 4 Variance", value: matchResult.totalVariance > 0 ? `+$${matchResult.totalVariance.toLocaleString()}` : "$0", color: matchResult.totalVariance > 0 ? "text-amber-400" : "text-emerald-400" },
            ].map(s => (
              <Card key={s.label} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 4-way pipeline visualization */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">4-Way Match Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-stretch gap-2">
                {[
                  { name: "Purchase Order", leg: "Leg 1", status: matchResult.po ? "ok" : "missing", detail: matchResult.po?.poNumber || "—", sub: "Price reference" },
                  { name: "Goods Receipt", leg: "Leg 2", status: matchResult.receipts?.length > 0 ? "ok" : "missing", detail: `${matchResult.receipts?.length || 0} receipt${matchResult.receipts?.length !== 1 ? "s" : ""}`, sub: "Qty confirmation" },
                  { name: "Invoice", leg: "Leg 3", status: "ok", detail: matchResult.invoice?.invoiceNumber, sub: "Billed amount" },
                  { name: "Vendor Agreement", leg: "Leg 4 — Helm only", status: matchResult.totalVariance > 0 ? "price_variance" : "ok", detail: matchResult.totalVariance > 0 ? `$${matchResult.totalVariance.toLocaleString()} variance` : "Contract price match", sub: "SPA / chargeback rate" },
                ].map((stage, i) => (
                  <div key={stage.name} className="flex items-center gap-2 flex-1">
                    {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />}
                    <div className={`flex flex-col items-center px-3 py-3 rounded-lg border text-xs text-center flex-1 gap-1 ${legColors[stage.status] || legColors["ok"]}`}>
                      {stage.status === "ok" || stage.status === "matched" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      )}
                      <div className="font-semibold text-foreground">{stage.name}</div>
                      <div className="text-[10px] text-muted-foreground">{stage.leg}</div>
                      <div className={`text-[10px] font-medium ${stage.status === "price_variance" ? "text-amber-400" : "text-emerald-400"}`}>{stage.detail}</div>
                      <div className="text-[10px] text-muted-foreground">{stage.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Line-level variances */}
          {matchResult.variances?.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Line-Level Variance — All 4 Legs</span>
                  {matchResult.hasRecoverableVariance && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setShowClause(!showClause)}>
                        <BookOpen className="h-3 w-3" /> View Clause
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => acceptMutation.mutate(selectedInvoiceId!)}>
                        Accept
                      </Button>
                      <Button size="sm" className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                        <Zap className="h-3 w-3" /> Raise Credit Request
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                      {["SKU", "Qty", "PO Price", "Billed Price", "Contract Price", "Leg 4 Variance", "Flag"].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matchResult.variances.map((v, i) => <VarianceRow key={i} v={v} />)}
                  </tbody>
                </table>
                {matchResult.hasRecoverableVariance && (
                  <div className="px-4 py-3 bg-amber-500/5 border-t border-amber-500/20 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-300">
                      Supplier billed <strong>${matchResult.totalVariance.toLocaleString()}</strong> above contracted SPA price per <strong className="font-mono">CARR-SPA-2024-CONTRACTOR §3.2(b)</strong>. 
                      This variance is invisible to standard 3-way match systems. Credit request can be filed within 90 days.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Agreement clause panel */}
          {showClause && matchResult.hasRecoverableVariance && (
            <Card className="bg-blue-950/30 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Agreement Clause — {agreementClause.programName} {agreementClause.clauseRef}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-xs">
                    <div className="text-muted-foreground mb-1">Program Code</div>
                    <div className="font-mono text-foreground">{agreementClause.programCode}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-muted-foreground mb-1">Contracted Price</div>
                    <div className="font-mono text-emerald-400">${agreementClause.contractedPrice}/unit</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-muted-foreground mb-1">Total Recoverable</div>
                    <div className="font-mono text-amber-400">${agreementClause.totalRecoverable.toLocaleString()}</div>
                  </div>
                </div>
                <div className="p-3 bg-muted/20 rounded border border-border text-xs text-muted-foreground leading-relaxed font-mono">
                  "{agreementClause.clauseText}"
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
