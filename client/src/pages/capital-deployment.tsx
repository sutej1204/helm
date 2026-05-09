import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Landmark,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Zap,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const deployments = [
  { supplier: "Tech Corp Systems", amount: "$50,000", discount: "$1,000", net: "$850", status: "Completed", date: "1 hour ago" },
  { supplier: "ACME Manufacturing", amount: "$75,000", discount: "$1,500", net: "$1,350", status: "Completed", date: "2 days ago" },
  { supplier: "Superior Manufacturing", amount: "$120,000", discount: "$3,600", net: "$3,200", status: "Completed", date: "5 days ago" },
  { supplier: "Eastern Components", amount: "$45,000", discount: "$900", net: "$780", status: "Completed", date: "1 week ago" },
  { supplier: "Global Logistics Inc.", amount: "$200,000", discount: "$2,000", net: "$1,600", status: "Completed", date: "2 weeks ago" },
];

export default function CapitalDeployment() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Capital Deployment</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track early payment deployments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <CardContent className="pt-6 pb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Deployed (YTD)</p>
            <p className="text-2xl font-bold text-foreground mt-1">$2.4M</p>
            <div className="flex items-center mt-1 text-emerald-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span className="text-xs">+18% vs last year</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
          <CardContent className="pt-6 pb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Discounts Captured</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">$48.2K</p>
            <div className="flex items-center mt-1 text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span className="text-xs">Avg 2.01% discount rate</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
          <CardContent className="pt-6 pb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Financing Cost</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">$5.8K</p>
            <div className="flex items-center mt-1 text-muted-foreground">
              <span className="text-xs">Avg 0.24% cost rate</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-blue-400" />
          <CardContent className="pt-6 pb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Gain (YTD)</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">$42.4K</p>
            <div className="flex items-center mt-1 text-emerald-400">
              <Zap className="h-3 w-3 mr-1" />
              <span className="text-xs">87.9% capture rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Link href="/capital-deployment/payment-terms">
        <Card className="bg-card border-border mb-6 cursor-pointer hover:border-emerald-500/30 transition-all group">
          <CardContent className="py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Payment Term Extension</p>
                <p className="text-xs text-muted-foreground mt-0.5">Liquidity optimization & embedded financing</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
          </CardContent>
        </Card>
      </Link>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-400" />
            Recent Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Supplier</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Amount</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Discount</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Net Gain</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-bold">
                          {d.supplier.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{d.supplier}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground font-medium">{d.amount}</td>
                    <td className="py-4 px-4 text-sm text-emerald-400 font-medium">+{d.discount}</td>
                    <td className="py-4 px-4 text-sm text-emerald-400 font-medium">{d.net}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{d.date}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
