import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight, Zap, Download } from "lucide-react";
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
  { id: 2, number: "INV-CARR-2024-002", supplier: "Carrier Global", po: "PO-2024-0002", totalVariance: 5600, matchStatus: "price_variance", priority: "high" },
  { id: 3, number: "INV-TRAN-2024-002", supplier: "Trane Technologies", po: "PO-2024-0011", totalVariance: 0, matchStatus: "matched", priority: "low" },
];

const matchStatusIcon: Record<string, React.ReactNode> = {
  matched: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  price_variance: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  unmatched_po: <XCircle className="h-4 w-4 text-red-400" />,
};

const matchStatusLabel: Record<string, string> = {
  matched: "Matched",
  price_variance: "Price Variance",
  unmatched_po: "PO Not Found",
};

const matchStatusColor: Record<string, string> = {
  matched: "bg-emerald-500/20 text-emerald-400",
  price_variance: "bg-amber-500/20 text-amber-400",
  unmatched_po: "bg-red-500/20 text-red-400",
};

function VarianceRow({ v }: { v: any }) {
  const isOverbilled = v.varianceFlag === "overbilled";
  return (
    <tr className="border-t border-border hover:bg-muted/10">
      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{v.invoiceLine?.manufacturerSku}</td>
      <td className="px-4 py-3 text-sm">{v.invoiceLine?.quantity} ea</td>
      <td className="px-4 py-3 text-sm">${parseFloat(v.invoicePrice || "0").toLocaleString()}</td>
      <td className="px-4 py-3 text-sm">${parseFloat(v.poPrice || "0").toLocaleString()}</td>
      <td className="px-4 py-3 text-sm">${parseFloat(v.contractedPrice || "0").toLocaleString()}</td>
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
        {v.varianceFlag !== "matched" && (
          <Badge className={isOverbilled ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}>
            {isOverbilled ? "Overbilled" : "Underbilled"}
          </Badge>
        )}
      </td>
    </tr>
  );
}

export default function ApMatch() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(2);
  const [expandedReceipts, setExpandedReceipts] = useState(false);

  const { data: matchResult, isLoading } = useQuery<MatchResult>({
    queryKey: ["/api/recon/ap-match", selectedInvoiceId],
    queryFn: async () => {
      const res = await fetch(`/api/recon/ap-match/${selectedInvoiceId}`, { method: "POST" });
      if (!res.ok) throw new Error("Match failed");
      return res.json();
    },
    enabled: !!selectedInvoiceId,
  });

  const matchMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const res = await fetch(`/api/recon/ap-match/${invoiceId}`, { method: "POST" });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/recon/ap-match"] }),
  });

  const acceptMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      return await apiRequest("PATCH", `/api/invoices/${invoiceId}`, { matchStatus: "exception_accepted" });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">AP Match Audit</h1>
          <p className="text-sm text-muted-foreground">3-way match: Invoice × Purchase Order × Goods Receipt</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export Variances
        </Button>
      </div>

      {/* Invoice selector */}
      <div className="grid grid-cols-1 gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoices with Exceptions</h2>
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
                {inv.totalVariance > 0 && (
                  <span className="text-sm font-semibold text-amber-400">+${inv.totalVariance.toLocaleString()} variance</span>
                )}
                <Badge className={matchStatusColor[inv.matchStatus]}>{matchStatusLabel[inv.matchStatus]}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Match Result Detail */}
      {isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Running 3-way match...</CardContent>
        </Card>
      )}

      {matchResult && !isLoading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Invoice Total", value: `$${parseFloat(matchResult.invoice?.totalAmount || "0").toLocaleString()}`, color: "text-foreground" },
              { label: "PO Total", value: `$${parseFloat(matchResult.po?.totalAmount || "0").toLocaleString()}`, color: "text-foreground" },
              { label: "Price Variance", value: `${matchResult.totalVariance > 0 ? "+" : ""}$${matchResult.totalVariance.toLocaleString()}`, color: matchResult.totalVariance > 0 ? "text-amber-400" : "text-emerald-400" },
              { label: "Receipts", value: `${matchResult.receipts?.length || 0} matched`, color: "text-emerald-400" },
            ].map(s => (
              <Card key={s.label} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 3-way match pipeline visualization */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">3-Way Match Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {[
                  { name: "Purchase Order", status: matchResult.po ? "ok" : "missing", detail: matchResult.po?.poNumber },
                  { name: "Goods Receipt", status: matchResult.receipts?.length > 0 ? "ok" : "missing", detail: `${matchResult.receipts?.length || 0} receipts` },
                  { name: "Invoice", status: "ok", detail: matchResult.invoice?.invoiceNumber },
                  { name: "AP Match", status: matchResult.matchStatus, detail: matchResult.matchStatus === "matched" ? "Clean" : `$${matchResult.totalVariance.toLocaleString()} variance` },
                ].map((stage, i) => (
                  <div key={stage.name} className="flex items-center gap-2">
                    {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                    <div className={`flex flex-col items-center px-3 py-2 rounded-lg border text-xs text-center min-w-[100px] ${stage.status === "ok" || stage.status === "matched" ? "border-emerald-500/30 bg-emerald-500/5" : stage.status === "price_variance" ? "border-amber-500/30 bg-amber-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                      {stage.status === "ok" || stage.status === "matched" ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-1" /> : <AlertTriangle className="h-4 w-4 text-amber-400 mb-1" />}
                      <span className="font-medium">{stage.name}</span>
                      <span className="text-muted-foreground text-[10px] mt-0.5">{stage.detail}</span>
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
                  <span>Line-Level Variance Detail</span>
                  {matchResult.hasRecoverableVariance && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => acceptMutation.mutate(selectedInvoiceId!)}>
                        Accept Exception
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
                      {["SKU", "Qty", "Billed Price", "PO Price", "Contracted Price", "Variance", "Flag"].map(h => (
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
                      Supplier billed ${matchResult.totalVariance.toLocaleString()} above contracted SPA price. 
                      Root cause: SPA program CARR-SPA-2024-CONTRACTOR requires price ${parseFloat(matchResult.variances[0]?.contractedPrice || "0").toLocaleString()}/unit.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
