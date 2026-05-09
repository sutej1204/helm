import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Clock, Calculator, ChevronRight, Zap, DollarSign, CheckCircle2 } from "lucide-react";

const kpis = [
  { label: "Credits at Risk (Expiring)", value: "$124,000", sub: "Trane Q2 SPA — 3 days", color: "text-red-400", icon: AlertTriangle, urgent: true },
  { label: "Auto-Computed Credits", value: "$204,544", sub: "Ready to claim — Carrier Q2", color: "text-emerald-400", icon: Calculator },
  { label: "Accrual Accuracy", value: "96.2%", sub: "vs prior period settle", color: "text-blue-400", icon: CheckCircle2 },
  { label: "Prevented Leakage (YTD)", value: "$312,000", sub: "Errors caught pre-claim", color: "text-amber-400", icon: DollarSign },
];

const quickLinks = [
  { title: "Expected Credit Engine", description: "Compute SPA/rebate eligibility step-by-step", href: "/prevention/expected-credit-engine", badge: "3 programs ready", badgeColor: "bg-emerald-500/20 text-emerald-400", urgent: false },
  { title: "Claim Studio", description: "Review & submit claims — Trane deadline in 3 days", href: "/prevention/claim-studio", badge: "URGENT — 3 days", badgeColor: "bg-red-500/20 text-red-400", urgent: true },
  { title: "Real-time Accruals", description: "Live credit accruals against open POs", href: "/prevention/accruals", badge: "6 programs live", badgeColor: "bg-blue-500/20 text-blue-400", urgent: false },
  { title: "Pricing Audit", description: "Detect pricing errors before invoice payment", href: "/prevention/pricing-audit", badge: "2 alerts", badgeColor: "bg-amber-500/20 text-amber-400", urgent: false },
];

const atRiskItems = [
  { program: "Trane Commercial SPA Q2", amount: 45180, deadlineDays: 3, status: "critical" },
  { program: "Trane Volume Rebate Q2", amount: 40176, deadlineDays: 3, status: "critical" },
  { program: "Trane Advertising Allowance Q2", amount: 38628, deadlineDays: 3, status: "critical" },
];

export default function PreventionDashboard() {
  const totalAtRisk = atRiskItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Prevention</h1>
            <p className="text-sm text-muted-foreground">Stop leakage before it happens — compute, claim, and accrue proactively</p>
          </div>
        </div>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-sm px-3 py-1">
          ${totalAtRisk.toLocaleString()} at risk — 3 days
        </Badge>
      </div>

      {/* Urgent Alert */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-red-300">Claim Deadline Alert — Trane Q2 SPA</div>
          <div className="text-xs text-muted-foreground mt-1">
            ${totalAtRisk.toLocaleString()} of unclaimed Q2 SPA credits will expire in <strong className="text-red-400">3 days</strong> (deadline per TRAN-SPA-2024-COMM §8.2). 
            Credits are computed and ready for submission.
          </div>
        </div>
        <Link href="/prevention/claim-studio">
          <Button size="sm" className="bg-red-600 hover:bg-red-700 gap-1.5 shrink-0">
            <Zap className="h-3.5 w-3.5" /> Submit Now
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`border ${kpi.urgent ? "border-red-500/30 bg-red-500/5" : "border-border bg-card"}`}>
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
        {/* Quick links */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prevention Workflows</h2>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className={`border cursor-pointer transition-all group ${link.urgent ? "border-red-500/30 hover:border-red-500/50 bg-red-500/5" : "border-border hover:border-blue-500/30 hover:bg-blue-500/5"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`text-sm font-medium group-hover:text-blue-400 transition-colors ${link.urgent ? "text-red-300" : "text-foreground"}`}>{link.title}</div>
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

        {/* At-risk credits */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-400" />
                Credits At Risk — Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {atRiskItems.map((item) => (
                <div key={item.program} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.program}</div>
                    <div className="text-xs text-red-400 mt-0.5">Expires in {item.deadlineDays} days</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-400">${item.amount.toLocaleString()}</div>
                    <Badge className="bg-red-500/20 text-red-400 text-[10px]">CRITICAL</Badge>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total at risk</span>
                <span className="text-xl font-bold text-red-400">${totalAtRisk.toLocaleString()}</span>
              </div>
              <Link href="/prevention/claim-studio">
                <Button className="w-full bg-red-600 hover:bg-red-700 gap-2">
                  <Zap className="h-4 w-4" /> Submit All Trane Q2 Claims Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
