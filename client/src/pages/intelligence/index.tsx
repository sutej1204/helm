import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronRight, GitBranch, BarChart2, FileText, Zap, TrendingUp } from "lucide-react";

const kpis = [
  { label: "Programs Ingested", value: "24", sub: "10 suppliers, 8 agreement types", color: "text-rose-400", icon: FileText },
  { label: "Knowledge Graph Nodes", value: "847", sub: "SKU, customer, program edges", color: "text-purple-400", icon: GitBranch },
  { label: "Ingestion Accuracy", value: "94.2%", sub: "Avg across all agreements", color: "text-emerald-400", icon: TrendingUp },
  { label: "Benchmark Suppliers", value: "6", sub: "HARDI 2024 peer group", color: "text-blue-400", icon: BarChart2 },
];

const quickLinks = [
  { title: "Rebate Knowledge Graph", description: "Carrier ContractorPro SPA — eligibility graph", href: "/intelligence/rebate-knowledge-graph", badge: "847 nodes", badgeColor: "bg-rose-500/20 text-rose-400" },
  { title: "Industry Benchmarks", description: "Compare DPO, rebate capture vs HARDI peers", href: "/intelligence/benchmarks", badge: "HARDI 2024", badgeColor: "bg-blue-500/20 text-blue-400" },
  { title: "Contract Library", description: "Ingested agreements with confidence scores", href: "/intelligence/contract-library", badge: "10 active", badgeColor: "bg-emerald-500/20 text-emerald-400" },
];

const insights = [
  { id: 1, category: "opportunity", title: "Carrier ContractorPro Tier-2 Threshold", description: "You're $187k below the $500k threshold for tier-2 (7%). Accelerating Q2 purchases could unlock +$12.4k in additional credits.", actionLink: "/intelligence/rebate-knowledge-graph" },
  { id: 2, category: "benchmark", title: "DPO Below Peer Average", description: "Your 38-day average DPO is 4 days below HARDI distributor peer median (42 days). Extending to terms would free $820k working capital.", actionLink: "/intelligence/benchmarks" },
  { id: 3, category: "contract", title: "Trane Agreement Expires Dec 31", description: "Trane 2024 Distributor Agreement expires in 237 days. Initiate renewal negotiations to secure Q1 2025 SPA rates.", actionLink: "/intelligence/contract-library" },
  { id: 4, category: "opportunity", title: "Lennox Rebate Utilisation Gap", description: "Lennox rebate utilisation at 55% vs 78% peer median. $34k/yr in uncaptured credits based on current volume.", actionLink: "/intelligence/contract-library" },
];

const categoryColors: Record<string, string> = {
  opportunity: "bg-emerald-500/20 text-emerald-400",
  benchmark: "bg-blue-500/20 text-blue-400",
  contract: "bg-amber-500/20 text-amber-400",
};

export default function IntelligenceDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Intelligence</h1>
            <p className="text-sm text-muted-foreground">Contract knowledge, industry benchmarks, and AI-driven insights</p>
          </div>
        </div>
        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">4 AI insights</Badge>
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
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intelligence Tools</h2>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="border border-border hover:border-rose-500/30 hover:bg-rose-500/5 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground group-hover:text-rose-400 transition-colors">{link.title}</div>
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
                <Zap className="h-4 w-4 text-rose-400" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <Link key={insight.id} href={insight.actionLink}>
                  <div className="p-3 rounded-lg border border-border hover:border-rose-500/30 hover:bg-rose-500/5 transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${categoryColors[insight.category]} text-[10px]`}>{insight.category}</Badge>
                          <span className="text-xs font-semibold text-foreground">{insight.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
