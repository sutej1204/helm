import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Zap, Search } from "lucide-react";

const pricingAlerts = [
  {
    invoiceNumber: "INV-CARR-2024-002",
    supplier: "Carrier Global",
    sku: "CARR-25HC",
    billedPrice: 1960,
    contractedPrice: 1800,
    variance: 160,
    quantity: 35,
    totalVariance: 5600,
    varType: "overbilled",
    spaProgram: "CARR-SPA-2024-CONTRACTOR",
    confidence: 99,
  },
];

const cleanInvoices = [
  { invoiceNumber: "INV-CARR-2024-001", supplier: "Carrier Global", totalAmount: 285000, lines: 2, status: "matched" },
  { invoiceNumber: "INV-TRAN-2024-001", supplier: "Trane Technologies", totalAmount: 312000, lines: 2, status: "matched" },
  { invoiceNumber: "INV-TRAN-2024-002", supplier: "Trane Technologies", totalAmount: 198000, lines: 1, status: "matched" },
  { invoiceNumber: "INV-LENN-2024-001", supplier: "Lennox International", totalAmount: 145000, lines: 1, status: "matched" },
  { invoiceNumber: "INV-RHEE-2024-001", supplier: "Rheem Manufacturing", totalAmount: 98000, lines: 1, status: "paid" },
];

export default function PricingAudit() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pricing Audit</h1>
          <p className="text-sm text-muted-foreground">Catch pricing errors before invoices are paid — compare billed vs contracted SPA price</p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          {pricingAlerts.length} active alert{pricingAlerts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Flagged Amount", value: `$${pricingAlerts.reduce((s, a) => s + a.totalVariance, 0).toLocaleString()}`, color: "text-amber-400" },
          { label: "Invoices Audited", value: String(cleanInvoices.length + pricingAlerts.length), color: "text-foreground" },
          { label: "Clean Rate", value: `${Math.round(cleanInvoices.length / (cleanInvoices.length + pricingAlerts.length) * 100)}%`, color: "text-emerald-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pricing Alerts</h2>
        {pricingAlerts.map((alert) => (
          <Card key={alert.invoiceNumber} className="bg-card border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">{alert.invoiceNumber} — Price Overbilling</span>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400">{alert.confidence}% confidence</Badge>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                {[
                  { label: "SKU", value: alert.sku },
                  { label: "Billed Price", value: `$${alert.billedPrice.toLocaleString()}`, color: "text-red-400" },
                  { label: "Contracted Price", value: `$${alert.contractedPrice.toLocaleString()}`, color: "text-emerald-400" },
                  { label: "Variance / Unit", value: `+$${alert.variance.toLocaleString()}`, color: "text-amber-400" },
                  { label: "Total Overbilled", value: `$${alert.totalVariance.toLocaleString()}`, color: "text-amber-400" },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-xs text-muted-foreground">{f.label}</div>
                    <div className={`text-sm font-semibold ${f.color || "text-foreground"}`}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                SPA Program: <code className="text-foreground">{alert.spaProgram}</code> — contracted {alert.quantity} units × ${alert.contractedPrice} = ${(alert.quantity * alert.contractedPrice).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Raise Credit Request
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Search className="h-3.5 w-3.5" /> View Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clean invoices */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Clean Invoices — No Pricing Exceptions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                {["Invoice Number", "Supplier", "Amount", "Lines", "Status"].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cleanInvoices.map((inv) => (
                <tr key={inv.invoiceNumber} className="border-t border-border hover:bg-muted/10">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm">{inv.supplier}</td>
                  <td className="px-4 py-3 text-sm">${inv.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{inv.lines}</td>
                  <td className="px-4 py-3"><Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" />{inv.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
