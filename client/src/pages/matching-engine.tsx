import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  GitMerge,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  ShoppingCart,
  ReceiptText,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type MatchStatus = "Full Match" | "Variance" | "No Match";

type MatchRecord = {
  id: string;
  supplier: string;
  lineItem: string;
  contract: { price: string; rebate: string; terms: string };
  salesData: { invoiceId: string; amount: string; date: string };
  supplierAP: { chargedAmount: string; creditApplied: string };
  status: MatchStatus;
  variance: string | null;
  claimOpportunity: string | null;
};

const matches: MatchRecord[] = [
  {
    id: "MTC-001",
    supplier: "Acme Manufacturing",
    lineItem: "Steel Rod — Grade A, 10mm",
    contract: { price: "$4.20/unit", rebate: "2.5% quarterly", terms: "Net 45" },
    salesData: { invoiceId: "INV-84201", amount: "$420,000", date: "Mar 2024" },
    supplierAP: { chargedAmount: "$436,800", creditApplied: "$0" },
    status: "Variance",
    variance: "+$16,800 overcharge (4.0% vs contracted 0%)",
    claimOpportunity: "$16,800",
  },
  {
    id: "MTC-002",
    supplier: "Acme Manufacturing",
    lineItem: "Q1 2024 Quarterly Rebate",
    contract: { price: "—", rebate: "2.5% on $1.05M spend", terms: "Issued quarterly" },
    salesData: { invoiceId: "RBT-Q1-2024", amount: "$26,250 owed", date: "Apr 2024" },
    supplierAP: { chargedAmount: "—", creditApplied: "$0" },
    status: "No Match",
    variance: "Rebate not issued — $26,250 outstanding",
    claimOpportunity: "$26,250",
  },
  {
    id: "MTC-003",
    supplier: "Delta Supplies Co.",
    lineItem: "Packaging Materials — Standard",
    contract: { price: "$12.50/unit", rebate: "1.8% semi-annual", terms: "Net 30" },
    salesData: { invoiceId: "INV-77340", amount: "$187,500", date: "Feb 2024" },
    supplierAP: { chargedAmount: "$187,500", creditApplied: "$3,375" },
    status: "Full Match",
    variance: null,
    claimOpportunity: null,
  },
  {
    id: "MTC-004",
    supplier: "NovaTech Corp",
    lineItem: "Electronic Components — Tier 2",
    contract: { price: "List -6% (Tier 2 >$1M)", rebate: "3% annual", terms: "Net 45" },
    salesData: { invoiceId: "INV-90112", amount: "$1,240,000", date: "Q1 2024" },
    supplierAP: { chargedAmount: "$1,240,000", creditApplied: "$0" },
    status: "Variance",
    variance: "Tier 2 discount not applied — $74,400 undercredited",
    claimOpportunity: "$74,400",
  },
  {
    id: "MTC-005",
    supplier: "Vertex Industries",
    lineItem: "Maintenance Services — Q4",
    contract: { price: "$850/day", rebate: "None", terms: "Net 60" },
    salesData: { invoiceId: "INV-55900", amount: "$68,000", date: "Dec 2023" },
    supplierAP: { chargedAmount: "$68,000", creditApplied: "$0" },
    status: "Full Match",
    variance: null,
    claimOpportunity: null,
  },
  {
    id: "MTC-006",
    supplier: "Pacific Materials",
    lineItem: "Raw Aluminium — Grade 6061",
    contract: { price: "$3.80/kg", rebate: "None", terms: "Net 30" },
    salesData: { invoiceId: "INV-61430", amount: "$190,000", date: "Jan 2024" },
    supplierAP: { chargedAmount: "$203,600", creditApplied: "$0" },
    status: "Variance",
    variance: "+$13,600 overcharge ($4.072/kg vs $3.80/kg contracted)",
    claimOpportunity: "$13,600",
  },
];

const statusConfig: Record<MatchStatus, { className: string; icon: React.ElementType; dot: string }> = {
  "Full Match": { className: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5", icon: CheckCircle2, dot: "bg-emerald-400" },
  Variance: { className: "border-amber-500/30 text-amber-400 bg-amber-500/5", icon: AlertTriangle, dot: "bg-amber-400" },
  "No Match": { className: "border-red-500/30 text-red-400 bg-red-500/5", icon: XCircle, dot: "bg-red-400" },
};

function MatchRow({ match }: { match: MatchRecord }) {
  const [expanded, setExpanded] = useState(false);
  const s = statusConfig[match.status];
  const StatusIcon = s.icon;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-4 bg-card hover:bg-accent/20 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn("h-2 w-2 rounded-full shrink-0", s.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">{match.id}</span>
            <span className="text-sm font-semibold text-foreground">{match.supplier}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{match.lineItem}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {match.claimOpportunity && (
            <span className="text-sm font-semibold text-amber-400">{match.claimOpportunity}</span>
          )}
          <Badge variant="outline" className={cn("text-xs gap-1", s.className)}>
            <StatusIcon className="h-3 w-3" />
            {match.status}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-card/50 px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-card border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-400" />
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Contract Terms</p>
              </div>
              <div className="space-y-2">
                <div><p className="text-[10px] text-muted-foreground">Price</p><p className="text-sm text-foreground font-medium">{match.contract.price}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Rebate</p><p className="text-sm text-foreground font-medium">{match.contract.rebate}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Terms</p><p className="text-sm text-foreground font-medium">{match.contract.terms}</p></div>
              </div>
            </div>
            <div className="bg-card border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="h-4 w-4 text-purple-400" />
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Sales Data</p>
              </div>
              <div className="space-y-2">
                <div><p className="text-[10px] text-muted-foreground">Invoice</p><p className="text-sm text-foreground font-medium">{match.salesData.invoiceId}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Amount</p><p className="text-sm text-foreground font-medium">{match.salesData.amount}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Period</p><p className="text-sm text-foreground font-medium">{match.salesData.date}</p></div>
              </div>
            </div>
            <div className="bg-card border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ReceiptText className="h-4 w-4 text-amber-400" />
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Supplier AP</p>
              </div>
              <div className="space-y-2">
                <div><p className="text-[10px] text-muted-foreground">Charged</p><p className="text-sm text-foreground font-medium">{match.supplierAP.chargedAmount}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Credit Applied</p><p className="text-sm text-foreground font-medium">{match.supplierAP.creditApplied}</p></div>
              </div>
            </div>
          </div>

          {match.variance && (
            <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-4">
              <TrendingDown className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-400">Variance Detected</p>
                <p className="text-sm text-foreground mt-0.5">{match.variance}</p>
              </div>
            </div>
          )}

          {match.claimOpportunity && (
            <div className="flex gap-2">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Create Claim — {match.claimOpportunity}
              </Button>
              <Button size="sm" variant="outline" className="border-border text-foreground">
                Review
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MatchingEngine() {
  const fullMatches = matches.filter((m) => m.status === "Full Match").length;
  const variances = matches.filter((m) => m.status === "Variance").length;
  const noMatches = matches.filter((m) => m.status === "No Match").length;
  const totalOpportunity = matches
    .filter((m) => m.claimOpportunity)
    .reduce((sum, m) => sum + parseFloat(m.claimOpportunity!.replace(/[$,]/g, "")), 0);

  const [filter, setFilter] = useState<MatchStatus | "All">("All");

  const filtered = filter === "All" ? matches : matches.filter((m) => m.status === filter);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Matching Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">Three-way line match — contracts vs. sales data vs. supplier AP</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">{matches.length} records matched</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Full Match", value: fullMatches, color: "text-emerald-400" },
          { label: "Variance", value: variances, color: "text-amber-400" },
          { label: "No Match", value: noMatches, color: "text-red-400" },
          { label: "Claim Opportunity", value: `$${totalOpportunity.toLocaleString()}`, color: "text-foreground" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {(["All", "Variance", "No Match", "Full Match"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className={cn(
              filter === f ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "border-border text-muted-foreground"
            )}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
