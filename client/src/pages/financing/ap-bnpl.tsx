import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Banknote, Calendar, Zap, CheckCircle2, DollarSign } from "lucide-react";

const largeInvoices = [
  { invoice: "INV-CARR-2024-003", supplier: "Carrier Global", amount: 341000, dueDate: "2024-04-22", daysUntilDue: -16, eligible: true },
  { invoice: "INV-TRAN-2024-001", supplier: "Trane Technologies", amount: 312000, dueDate: "2024-02-27", daysUntilDue: -71, eligible: false },
  { invoice: "INV-CARR-2024-005", supplier: "Carrier Global", amount: 274000, dueDate: "2024-06-22", daysUntilDue: 45, eligible: true },
];

const installmentPlans = [
  { term: "30/60/90", payments: [0.34, 0.33, 0.33], label: "3-part equal", rate: 0.8 },
  { term: "50/50", payments: [0.50, 0.50], label: "2-part equal", rate: 0.6 },
  { term: "25/25/25/25", payments: [0.25, 0.25, 0.25, 0.25], label: "4-part equal", rate: 1.0 },
];

export default function ApBnpl() {
  const [selectedInvoice, setSelectedInvoice] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const invoice = largeInvoices[selectedInvoice];
  const plan = installmentPlans[selectedPlan];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">AP Buy Now, Pay Later</h1>
        <p className="text-sm text-muted-foreground">Split large supplier invoices into installments — preserve working capital while maintaining supplier relationships</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Eligible Invoices", value: "2", color: "text-foreground" },
          { label: "Max Eligible Amount", value: "$615k", color: "text-emerald-400" },
          { label: "Rate Range", value: "0.6–1.0%", color: "text-muted-foreground" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoice selector */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Invoice</h2>
        {largeInvoices.map((inv, i) => (
          <Card
            key={inv.invoice}
            className={`border cursor-pointer transition-all ${inv.eligible ? (selectedInvoice === i ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-slate-600") : "border-border opacity-50 cursor-not-allowed"}`}
            onClick={() => inv.eligible && setSelectedInvoice(i)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{inv.invoice}</div>
                <div className="text-xs text-muted-foreground">{inv.supplier} · Due {inv.dueDate}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">${inv.amount.toLocaleString()}</span>
                {inv.eligible ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400">Eligible</Badge>
                ) : (
                  <Badge className="bg-slate-500/20 text-slate-400">Past Due</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan selector */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Select Installment Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {installmentPlans.map((p, i) => (
            <div
              key={p.term}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPlan === i ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-slate-600"}`}
              onClick={() => setSelectedPlan(i)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full border-2 ${selectedPlan === i ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground"}`} />
                  <span className="text-sm font-medium">{p.label} ({p.term} days)</span>
                </div>
                <Badge className="bg-slate-700/50 text-slate-300 text-[10px]">Fee: {p.rate}%</Badge>
              </div>
              <div className="flex gap-2">
                {p.payments.map((pct, j) => (
                  <div key={j} className="flex-1 text-center p-1.5 bg-muted/30 rounded text-xs">
                    <div className="font-semibold">${Math.round(invoice.amount * pct).toLocaleString()}</div>
                    <div className="text-muted-foreground text-[10px]">Day {p.term.split("/")[j]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Total fee: ${Math.round(invoice.amount * p.rate / 100).toLocaleString()} · 
                Net savings vs full payment: ${Math.round(invoice.amount * (1 - p.rate/100)).toLocaleString()} retained today
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/20 rounded-lg mb-3">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">${invoice.amount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Invoice Total</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-xl font-bold text-emerald-400">${Math.round(invoice.amount * installmentPlans[selectedPlan].payments[0]).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">First Payment</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-400">${Math.round(invoice.amount * installmentPlans[selectedPlan].rate / 100).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Financing Fee</div>
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Zap className="h-4 w-4" /> Activate BNPL Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
