import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, ChevronRight, DollarSign, TrendingUp, Calendar, Zap } from "lucide-react";

const kpis = [
  { label: "Eligible for Advance", value: "$204,544", sub: "80% advance available", color: "text-purple-400", icon: DollarSign },
  { label: "Active Advances", value: "$163,635", sub: "1 advance vs Carrier credits", color: "text-emerald-400", icon: TrendingUp },
  { label: "Working Capital Extended", value: "$8.2M", sub: "Term optimization potential", color: "text-blue-400", icon: Calendar },
  { label: "Advance Fee Rate", value: "1.5%", sub: "72-day term", color: "text-foreground", icon: Banknote },
];

const quickLinks = [
  { title: "Recovery Advance", description: "Advance against verified expected credits", href: "/financing/recovery-advance", badge: "$163k active", badgeColor: "bg-purple-500/20 text-purple-400" },
  { title: "Payment Term Extension", description: "Optimize DPO — extend supplier terms", href: "/financing/payment-term-extension", badge: "$8.2M opportunity", badgeColor: "bg-blue-500/20 text-blue-400" },
  { title: "AP BNPL", description: "Buy now, pay later for large invoices", href: "/financing/ap-bnpl", badge: "Available", badgeColor: "bg-emerald-500/20 text-emerald-400" },
];

const advanceSummary = [
  { label: "Expected Credits Backing", value: "$204,544", detail: "Carrier Q2: ContractorPro SPA + Rebate" },
  { label: "Advance Rate", value: "80%", detail: "Standard eligible rate" },
  { label: "Advance Amount", value: "$163,635", detail: "Net advance disbursed" },
  { label: "Fee (1.5%)", value: "$2,455", detail: "Deducted from advance" },
  { label: "Expected Settlement", value: "Jul 19, 2024", detail: "~72 days from advance date" },
  { label: "Annualized Cost", value: "7.6%", detail: "vs working capital rate" },
];

export default function FinancingDashboard() {
  const { data: advances = [] } = useQuery<any[]>({ queryKey: ["/api/recovery-advances"] });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Banknote className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Financing</h1>
            <p className="text-sm text-muted-foreground">Turn verified credits into working capital — advance, extend, and optimize</p>
          </div>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">$163k active advance</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-4">
              <kpi.icon className={`h-4 w-4 ${kpi.color} mb-2`} />
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
              <div className="text-[10px] text-muted-foreground/70 mt-0.5">{kpi.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financing Products</h2>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="border border-border hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground group-hover:text-purple-400 transition-colors">{link.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{link.description}</div>
                      <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1.5 ${link.badgeColor}`}>{link.badge}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                Active Recovery Advance — Carrier Q2 Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {advanceSummary.map((s) => (
                  <div key={s.label} className="p-3 bg-muted/20 rounded-lg border border-border">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">{s.detail}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-300">Advance Status</span>
                  <Badge className="bg-purple-500/20 text-purple-400">Active</Badge>
                </div>
                <div className="mt-2 h-2 bg-muted/30 rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "15%" }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Advanced May 8</span>
                  <span>Expected settlement Jul 19</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
