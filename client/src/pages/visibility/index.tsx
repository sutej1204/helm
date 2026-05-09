import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, DollarSign, TrendingUp, ChevronRight, BarChart2, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const kpis = [
  { label: "Credit Cash Inflow (4-week)", value: "$340,000", sub: "Trane + Carrier settlements", color: "text-emerald-400", icon: DollarSign },
  { label: "Margin Recovery Rate", value: "94.2%", sub: "vs theoretical rebate", color: "text-blue-400", icon: TrendingUp },
  { label: "Settlement Pipeline", value: "$504,000", sub: "3 open settlements", color: "text-amber-400", icon: BarChart2 },
  { label: "Average Days to Credit", value: "18d", sub: "from claim to credit", color: "text-foreground", icon: PieChart },
];

const quickLinks = [
  { title: "Cash Flow Forecast", description: "4-week credit inflow by supplier", href: "/visibility/cash-flow-forecast", badge: "$340k incoming", badgeColor: "bg-emerald-500/20 text-emerald-400" },
  { title: "Margin Attribution", description: "True margin by supplier, SKU, customer", href: "/visibility/margin-attribution", badge: "3 programs", badgeColor: "bg-blue-500/20 text-blue-400" },
  { title: "Settlement Pipeline", description: "Trane + Carrier open credit memos", href: "/visibility/settlement-pipeline", badge: "$504k open", badgeColor: "bg-amber-500/20 text-amber-400" },
];

const cashFlowData = [
  { week: "Week 1", carrier: 45000, trane: 0, lennox: 0 },
  { week: "Week 2", carrier: 79620, trane: 0, lennox: 0 },
  { week: "Week 3", carrier: 0, trane: 118600, lennox: 0 },
  { week: "Week 4", carrier: 0, trane: 0, lennox: 0 },
];

export default function VisibilityDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Eye className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Visibility</h1>
            <p className="text-sm text-muted-foreground">Full financial picture — cash, margin, and settlement pipeline</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">$340k inflow forecast</Badge>
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
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibility Tools</h2>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="border border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground group-hover:text-amber-400 transition-colors">{link.title}</div>
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
              <CardTitle className="text-sm font-semibold">4-Week Credit Cash Inflow Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "rgb(100,116,139)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "rgb(15,23,42)", border: "1px solid rgb(51,65,85)", borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`]} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "rgb(100,116,139)" }} />
                  <Bar dataKey="carrier" fill="rgb(16,185,129)" name="Carrier" radius={[3,3,0,0]} />
                  <Bar dataKey="trane" fill="rgb(59,130,246)" name="Trane" radius={[3,3,0,0]} />
                  <Bar dataKey="lennox" fill="rgb(251,191,36)" name="Lennox" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
