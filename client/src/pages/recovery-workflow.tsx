import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Send,
  Download,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ClaimStatus = "Open" | "Filed" | "Pending Response" | "Recovered" | "Denied" | "Aged";

type Claim = {
  id: string;
  supplier: string;
  claimType: string;
  amount: string;
  status: ClaimStatus;
  filedDate: string | null;
  ageDays: number;
  notes: string;
  matchRef: string;
};

const claims: Claim[] = [
  { id: "CLM-0091", supplier: "Acme Manufacturing", claimType: "Overcharge", amount: "$16,800", status: "Recovered", filedDate: "Apr 2, 2024", ageDays: 3, notes: "Supplier issued credit memo CMR-441. Cash received.", matchRef: "MTC-001" },
  { id: "CLM-0090", supplier: "Delta Supplies Co.", claimType: "Rebate Shortfall", amount: "$210,750", status: "Filed", filedDate: "Apr 28, 2024", ageDays: 5, notes: "Claim submitted via email. Awaiting supplier acknowledgment.", matchRef: "MTC-003" },
  { id: "CLM-0089", supplier: "Vertex Industries", claimType: "Pricing Discrepancy", amount: "$37,480", status: "Open", filedDate: null, ageDays: 8, notes: "Match confirmed. Ready to file — review contract clause 4.2 first.", matchRef: "MTC-005" },
  { id: "CLM-0088", supplier: "NovaTech Corp", claimType: "Tier Discount Not Applied", amount: "$74,400", status: "Pending Response", filedDate: "Apr 20, 2024", ageDays: 14, notes: "Supplier disputed. Escalated to their VP of Finance on Apr 22.", matchRef: "MTC-004" },
  { id: "CLM-0087", supplier: "Pacific Materials", claimType: "Overcharge", amount: "$13,600", status: "Filed", filedDate: "Apr 18, 2024", ageDays: 14, notes: "Filed. Standard 30-day resolution window.", matchRef: "MTC-006" },
  { id: "CLM-0086", supplier: "Acme Manufacturing", claimType: "Rebate Not Issued", amount: "$26,250", status: "Pending Response", filedDate: "Apr 10, 2024", ageDays: 24, notes: "Second follow-up sent Apr 22. No response yet.", matchRef: "MTC-002" },
  { id: "CLM-0085", supplier: "Horizon Logistics", claimType: "SLA Penalty", amount: "$8,400", status: "Denied", filedDate: "Mar 15, 2024", ageDays: 48, notes: "Supplier denied — citing force majeure. Counter-argument in progress.", matchRef: "—" },
  { id: "CLM-0084", supplier: "Summit Raw Co.", claimType: "Volume Rebate", amount: "$31,200", status: "Aged", filedDate: "Jan 20, 2024", ageDays: 102, notes: "No response after 3 follow-ups. Escalate or write off.", matchRef: "—" },
];

const statusConfig: Record<ClaimStatus, { className: string; icon: React.ElementType; dot: string }> = {
  Open: { className: "border-slate-500/30 text-slate-400 bg-slate-500/5", icon: ClipboardList, dot: "bg-slate-400" },
  Filed: { className: "border-blue-500/30 text-blue-400 bg-blue-500/5", icon: Send, dot: "bg-blue-400" },
  "Pending Response": { className: "border-amber-500/30 text-amber-400 bg-amber-500/5", icon: Clock, dot: "bg-amber-400" },
  Recovered: { className: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5", icon: CheckCircle2, dot: "bg-emerald-400" },
  Denied: { className: "border-red-500/30 text-red-400 bg-red-500/5", icon: XCircle, dot: "bg-red-400" },
  Aged: { className: "border-orange-500/30 text-orange-400 bg-orange-500/5", icon: AlertTriangle, dot: "bg-orange-400" },
};

function ClaimRow({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false);
  const s = statusConfig[claim.status];
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
            <span className="text-xs font-mono text-muted-foreground">{claim.id}</span>
            <span className="text-sm font-semibold text-foreground">{claim.supplier}</span>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">{claim.claimType}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{claim.notes}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-foreground tabular-nums">{claim.amount}</span>
          <span className="text-xs text-muted-foreground hidden sm:block flex items-center gap-1">
            {claim.ageDays}d old
          </span>
          <Badge variant="outline" className={cn("text-xs gap-1", s.className)}>
            <StatusIcon className="h-3 w-3" />
            {claim.status}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-card/50 px-5 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Claim Amount", value: claim.amount, icon: TrendingUp },
              { label: "Supplier", value: claim.supplier, icon: Building2 },
              { label: "Filed Date", value: claim.filedDate ?? "Not yet filed", icon: Calendar },
              { label: "Age", value: `${claim.ageDays} days`, icon: Clock },
            ].map((f) => (
              <div key={f.label} className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <f.icon className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-3 mb-4">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Notes</p>
            </div>
            <p className="text-sm text-foreground">{claim.notes}</p>
            {claim.matchRef !== "—" && (
              <p className="text-xs text-muted-foreground mt-1">Match reference: <span className="font-mono">{claim.matchRef}</span></p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {claim.status === "Open" && (
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Send className="mr-1.5 h-3.5 w-3.5" /> File Claim
              </Button>
            )}
            {(claim.status === "Filed" || claim.status === "Pending Response") && (
              <Button size="sm" variant="outline" className="border-border text-foreground">
                <Send className="mr-1.5 h-3.5 w-3.5" /> Send Follow-up
              </Button>
            )}
            {claim.status === "Recovered" && (
              <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> View Credit Memo
              </Button>
            )}
            {claim.status === "Aged" && (
              <Button size="sm" variant="outline" className="border-orange-500/30 text-orange-400">
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Escalate
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecoveryWorkflow() {
  const [filter, setFilter] = useState<ClaimStatus | "All">("All");

  const statusCounts = Object.fromEntries(
    (["Open", "Filed", "Pending Response", "Recovered", "Denied", "Aged"] as ClaimStatus[]).map((s) => [
      s,
      claims.filter((c) => c.status === s).length,
    ])
  ) as Record<ClaimStatus, number>;

  const totalOwed = claims.reduce((sum, c) => sum + parseFloat(c.amount.replace(/[$,]/g, "")), 0);
  const totalRecovered = claims
    .filter((c) => c.status === "Recovered")
    .reduce((sum, c) => sum + parseFloat(c.amount.replace(/[$,]/g, "")), 0);

  const filtered = filter === "All" ? claims : claims.filter((c) => c.status === filter);

  const filters: (ClaimStatus | "All")[] = ["All", "Open", "Filed", "Pending Response", "Recovered", "Denied", "Aged"];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Recovery Workflow</h1>
          <p className="text-sm text-muted-foreground mt-1">Track, age, and export supplier claims</p>
        </div>
        <Button variant="outline" className="border-border text-foreground">
          <Download className="mr-2 h-4 w-4" />
          Export All Claims
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Claims", value: claims.length, color: "text-foreground" },
          { label: "Open + Filed", value: (statusCounts["Open"] + statusCounts["Filed"]), color: "text-blue-400" },
          { label: "Total Owed", value: `$${totalOwed.toLocaleString()}`, color: "text-amber-400" },
          { label: "Recovered", value: `$${totalRecovered.toLocaleString()}`, color: "text-emerald-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map((f) => (
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
            {f !== "All" && statusCounts[f as ClaimStatus] > 0 && (
              <span className="ml-1.5 text-xs opacity-70">{statusCounts[f as ClaimStatus]}</span>
            )}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((claim) => (
          <ClaimRow key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
}
