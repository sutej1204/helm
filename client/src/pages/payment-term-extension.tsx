import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  BarChart3,
  Percent,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Available Cash Impact", value: "£94K", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Current DPO", value: "60 days", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "DSO Performance", value: "45 days", icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Financing Utilization", value: "25%", icon: Percent, color: "text-amber-400", bg: "bg-amber-500/10" },
];

const suppliers = [
  { name: "TechCorp Solutions", current: "Net 30", invoice: "£125,000", risk: "Low", riskColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", tier: "Strategic", recommended: "Net 45", savings: "£8,750" },
  { name: "Meridian Supply Co.", current: "Net 45", invoice: "£89,000", risk: "Medium", riskColor: "bg-amber-500/10 text-amber-400 border-amber-500/30", tier: "Preferred", recommended: "Net 60", savings: "£5,340" },
  { name: "Atlas Manufacturing", current: "Net 30", invoice: "£210,000", risk: "Low", riskColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", tier: "Strategic", recommended: "Net 60", savings: "£18,900" },
  { name: "Pinnacle Logistics", current: "Net 60", invoice: "£67,500", risk: "High", riskColor: "bg-red-500/10 text-red-400 border-red-500/30", tier: "Standard", recommended: "Net 60", savings: "£0" },
  { name: "Nordic Components", current: "Net 30", invoice: "£145,000", risk: "Low", riskColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", tier: "Preferred", recommended: "Net 45", savings: "£10,150" },
  { name: "Quantum Electronics", current: "Net 45", invoice: "£98,000", risk: "Medium", riskColor: "bg-amber-500/10 text-amber-400 border-amber-500/30", tier: "Standard", recommended: "Net 60", savings: "£4,900" },
];

type PaymentOption = "now" | "installments" | "later";
type InstallmentTerm = 2 | 3;
type LaterTerm = 30 | 45 | 60 | 90;

interface FinancingCardProps {
  supplierName: string;
  invoiceId: string;
  amount: number;
}

function FinancingCard({ supplierName, invoiceId, amount }: FinancingCardProps) {
  const [selected, setSelected] = useState<PaymentOption>("installments");
  const [installmentTerm, setInstallmentTerm] = useState<InstallmentTerm>(2);
  const [laterTerm, setLaterTerm] = useState<LaterTerm>(45);

  const installmentInterest = 0.015;
  const installmentTotal = amount * (1 + installmentInterest);
  const downPayment = installmentTotal / installmentTerm;

  const laterInterestMap: Record<LaterTerm, number> = { 30: 0.015, 45: 0.015, 60: 0.015, 90: 0.015 };
  const laterInterest = laterInterestMap[laterTerm];
  const laterTotal = amount * (1 + laterInterest);

  const getButtonText = () => {
    if (selected === "now") return `Pay $${amount.toLocaleString()} Now`;
    if (selected === "installments") return `Pay over ${installmentTerm} months`;
    return `Pay in ${laterTerm} days`;
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Short-Term Financing in Seconds</p>
        <h3 className="text-lg font-bold text-foreground mb-0.5">
          How would you like to finance this ${amount.toLocaleString()}.00 purchase?
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{supplierName} · {invoiceId}</p>
          <button className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1">
            Review your credit limits
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <div
          onClick={() => setSelected("now")}
          className={cn(
            "w-full rounded-xl border p-4 text-left transition-all cursor-pointer",
            selected === "now"
              ? "border-orange-500 bg-orange-500/5"
              : "border-border bg-card hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                selected === "now" ? "border-orange-500" : "border-muted-foreground/40"
              )}>
                {selected === "now" && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
              </div>
              <span className="text-sm font-semibold text-foreground">Pay now</span>
            </div>
            <span className="text-xs font-medium text-emerald-400">No interest</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 ml-8">${amount.toLocaleString()}.00</p>
          <p className="text-xs text-muted-foreground ml-8">due today*</p>
        </div>

        <div
          onClick={() => setSelected("installments")}
          className={cn(
            "w-full rounded-xl border p-4 text-left transition-all cursor-pointer",
            selected === "installments"
              ? "border-orange-500 bg-orange-500/5"
              : "border-border bg-card hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                selected === "installments" ? "border-orange-500" : "border-muted-foreground/40"
              )}>
                {selected === "installments" && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
              </div>
              <span className="text-sm font-semibold text-foreground">Pay in installments</span>
            </div>
            <div className="flex items-center gap-1.5">
              {([2, 3] as InstallmentTerm[]).map((term) => (
                <button
                  key={term}
                  onClick={(e) => { e.stopPropagation(); setSelected("installments"); setInstallmentTerm(term); }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    installmentTerm === term && selected === "installments"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-border text-muted-foreground hover:border-orange-500/50"
                  )}
                >
                  {term} months
                </button>
              ))}
              <span className="text-xs font-medium text-orange-400 ml-2">{(installmentInterest * 100).toFixed(0)}% interest</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 ml-8">${installmentTotal.toLocaleString()}.00</p>
          <p className="text-xs text-muted-foreground ml-8">${downPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} down due today*</p>
        </div>

        <div
          onClick={() => setSelected("later")}
          className={cn(
            "w-full rounded-xl border p-4 text-left transition-all cursor-pointer",
            selected === "later"
              ? "border-orange-500 bg-orange-500/5"
              : "border-border bg-card hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                selected === "later" ? "border-orange-500" : "border-muted-foreground/40"
              )}>
                {selected === "later" && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
              </div>
              <span className="text-sm font-semibold text-foreground">Pay later</span>
            </div>
            <div className="flex items-center gap-1.5">
              {([30, 45, 60, 90] as LaterTerm[]).map((term) => (
                <button
                  key={term}
                  onClick={(e) => { e.stopPropagation(); setSelected("later"); setLaterTerm(term); }}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                    laterTerm === term && selected === "later"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-border text-muted-foreground hover:border-orange-500/50"
                  )}
                >
                  Net {term}
                </button>
              ))}
              <span className="text-xs font-medium text-orange-400 ml-2">{(laterInterest * 100).toFixed(1)}% interest</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 ml-8">${laterTotal.toLocaleString()}.00</p>
          <p className="text-xs text-muted-foreground ml-8">due in {laterTerm} days*</p>
        </div>

        <button className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-4">
          {getButtonText()}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          *Amounts shown do not include payment processing fees.
        </p>
      </div>
    </Card>
  );
}

export default function PaymentTermExtension() {
  const [sliderValue, setSliderValue] = useState(50);

  const sliderLabel = sliderValue < 33 ? "Conservative" : sliderValue < 66 ? "Balanced" : "Aggressive";

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/capital-deployment">
          <button className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Payment Term Extension</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Liquidity & Term Optimization Suite</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-card border-border overflow-hidden relative">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", m.bg)}>
                  <m.icon className={cn("h-4 w-4", m.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-foreground">Cash Flow Optimization Impact</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Adjust the optimization level to see projected cash flow impact across your supplier portfolio.</p>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conservative</span>
              <span className={cn(
                "text-sm font-semibold px-3 py-1 rounded-full",
                sliderValue < 33 ? "bg-emerald-500/10 text-emerald-400" :
                sliderValue < 66 ? "bg-amber-500/10 text-amber-400" :
                "bg-orange-500/10 text-orange-400"
              )}>
                {sliderLabel}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aggressive</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${sliderValue}%, hsl(223,47%,11%) ${sliderValue}%, hsl(223,47%,11%) 100%)`,
              }}
            />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="rounded-lg border border-border p-4 text-center bg-card">
                <p className="text-xs text-muted-foreground mb-1">Projected Savings</p>
                <p className="text-xl font-bold text-foreground">£{(48040 * (0.4 + sliderValue / 100 * 0.6) / 1000).toFixed(1)}K</p>
              </div>
              <div className="rounded-lg border border-border p-4 text-center bg-card">
                <p className="text-xs text-muted-foreground mb-1">Cash Released</p>
                <p className="text-xl font-bold text-emerald-400">£{(94000 * (0.3 + sliderValue / 100 * 0.7) / 1000).toFixed(0)}K</p>
              </div>
              <div className="rounded-lg border border-border p-4 text-center bg-card">
                <p className="text-xs text-muted-foreground mb-1">Suppliers Impacted</p>
                <p className="text-xl font-bold text-foreground">{Math.round(2 + sliderValue / 100 * 4)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden mb-8">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-lg font-semibold text-foreground">Supplier Term Optimization Grid</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">AI-recommended payment term extensions across your portfolio</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Supplier</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Current Terms</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Invoice Value</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Risk Rating</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Tier</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">AI Recommended</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Potential Savings</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-bold">
                          {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{s.current}</td>
                    <td className="py-4 px-4 text-sm text-foreground font-medium text-right">{s.invoice}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", s.riskColor)}>
                        {s.risk}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-medium text-muted-foreground bg-accent px-2.5 py-1 rounded-full border border-border">
                        {s.tier}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">{s.current}</span>
                        <ChevronRight className="h-3 w-3 text-orange-400" />
                        <span className="text-sm font-semibold text-orange-400">{s.recommended}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={cn("text-sm font-bold", s.savings === "£0" ? "text-muted-foreground" : "text-emerald-400")}>
                        {s.savings === "£0" ? "—" : s.savings}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Embedded Financing</h2>
        <p className="text-sm text-muted-foreground">Select payment terms for open invoices across your supplier portfolio.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancingCard supplierName="ACME Manufacturing" invoiceId="INV-2026-0847" amount={100000} />
        <FinancingCard supplierName="GlobalParts Inc." invoiceId="INV-2026-0912" amount={78500} />
      </div>
    </div>
  );
}
