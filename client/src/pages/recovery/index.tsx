import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, AlertTriangle, DollarSign, Search, FileText, ChevronRight, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const kpis = [
  { label: "Total Recovery Opportunity", value: "$267,000", sub: "12 open items", color: "text-emerald-400", icon: DollarSign, trend: "+18% vs last month" },
  { label: "AP Match Variances", value: "$5,600", sub: "2 invoices flagged", color: "text-amber-400", icon: AlertTriangle, trend: "1 critical" },
  { label: "Settlement Underpaids", value: "$87,000", sub: "Carrier Q1 rebate", color: "text-red-400", icon: AlertTriangle, trend: "RECON #2 open" },
  { label: "Unapplied Cash", value: "$34,000", sub: "Lennox deduction", color: "text-blue-400", icon: Search, trend: "SKU mismatch root cause" },
];

const quickLinks = [
  { title: "AP Match Audit", description: "3-way match: Invoice × PO × Receipt", href: "/recovery/ap-match", badge: "2 variances", badgeColor: "bg-amber-500/20 text-amber-400", icon: FileText },
  { title: "Settlement Audit", description: "Carrier Q1 rebate underpaids $87k", href: "/recovery/settlement-audit", badge: "Open dispute", badgeColor: "bg-red-500/20 text-red-400", icon: AlertTriangle },
  { title: "Claim Recovery", description: "Adjudicated claim line disputes", href: "/recovery/claim-recovery", badge: "1 in dispute", badgeColor: "bg-amber-500/20 text-amber-400", icon: FileText },
  { title: "Unapplied Cash", description: "Lennox $34k deduction — SKU mismatch", href: "/recovery/unapplied-cash", badge: "Action needed", badgeColor: "bg-blue-500/20 text-blue-400", icon: Search },
];

const trendData = [
  { month: "Nov", opportunity: 112000, recovered: 95000 },
  { month: "Dec", opportunity: 98000, recovered: 88000 },
  { month: "Jan", opportunity: 145000, recovered: 120000 },
  { month: "Feb", opportunity: 187000, recovered: 165000 },
  { month: "Mar", opportunity: 234000, recovered: 198000 },
  { month: "Apr", opportunity: 267000, recovered: 0 },
];

const recentItems = [
  { id: "RECON-2", type: "Settlement Audit", supplier: "Carrier Global", amount: "$87,000", status: "open", urgency: "high", date: "May 2024" },
  { id: "RECON-1a", type: "AP Match", supplier: "Carrier Global", amount: "$5,600", status: "flagged", urgency: "medium", date: "Feb 2024" },
  { id: "RECON-3", type: "Unapplied Cash", supplier: "Lennox International", amount: "$34,000", status: "in_review", urgency: "medium", date: "Apr 2024" },
  { id: "RECON-4", type: "Claim Recovery", supplier: "Trane Technologies", amount: "$6,200", status: "disputing", urgency: "low", date: "May 2024" },
];

const urgencyColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-blue-500/20 text-blue-400",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  flagged: "Flagged",
  in_review: "In Review",
  disputing: "Disputing",
};

export default function RecoveryDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <RotateCcw className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Recovery</h1>
            <p className="text-sm text-muted-foreground">Find and recover money already owed — but not yet paid</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm px-3 py-1">
          $267k opportunity
        </Badge>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">{kpi.trend}</span>
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
              <div className="text-[10px] text-muted-foreground/70 mt-0.5">{kpi.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recovery Workflows</h2>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="bg-card border-border hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-150 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded bg-muted/40 flex items-center justify-center shrink-0">
                        <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors">{link.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{link.description}</div>
                        <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1.5 ${link.badgeColor}`}>{link.badge}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-400 transition-colors mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Recovery Trend (6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "rgb(15,23,42)", border: "1px solid rgb(51,65,85)", borderRadius: 8 }}
                    labelStyle={{ color: "rgb(148,163,184)" }}
                    formatter={(v: number) => [`$${(v/1000).toFixed(0)}k`]}
                  />
                  <Bar dataKey="opportunity" fill="rgba(16,185,129,0.3)" name="Opportunity" radius={[3,3,0,0]} />
                  <Bar dataKey="recovered" fill="rgb(16,185,129)" name="Recovered" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" /><span className="text-xs text-muted-foreground">Opportunity</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /><span className="text-xs text-muted-foreground">Recovered</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Recovery Items */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Active Recovery Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-muted-foreground/60 w-20">{item.id}</span>
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.type}</span>
                    <span className="text-xs text-muted-foreground ml-2">— {item.supplier}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-foreground">{item.amount}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${urgencyColors[item.urgency]}`}>{statusLabels[item.status]}</span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
