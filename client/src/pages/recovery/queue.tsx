import { useState, useEffect } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  RotateCcw, DollarSign, Clock, TrendingUp, CheckCircle2, FileText, AlertTriangle,
} from "lucide-react";
import { seedRecoveryItems, recoverySession, RecoveryItem } from "@/lib/invoice-match-data";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function StatusPill({ status, routedToday }: { status: RecoveryItem["status"]; routedToday: boolean }) {
  if (routedToday)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
        New · routed today
      </span>
    );
  if (status === "credit_memo_pending")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25">
        <Clock className="h-3 w-3" />
        Credit memo pending
      </span>
    );
  if (status === "recovered")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
        <CheckCircle2 className="h-3 w-3" />
        Recovered
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/25">
      New
    </span>
  );
}

export default function RecoveryQueue() {
  const [items, setItems] = useState<RecoveryItem[]>([]);

  useEffect(() => {
    // Merge session-routed items (at the top) with seed items
    setItems([...recoverySession.routedItems, ...seedRecoveryItems]);
  }, []);

  const openRecoverable = items.filter(i => i.status !== "recovered").reduce((s, i) => s + i.amount, 0);
  const openCount = items.filter(i => i.status !== "recovered").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <RotateCcw className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Recovery Queue</h1>
          <p className="text-sm text-muted-foreground">SPA & contract variance recovery pipeline</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Open recoverable</span>
          </div>
          <p className="text-2xl font-bold text-red-400 tabular-nums">{fmt(24892)}</p>
          <p className="text-xs text-muted-foreground">{openCount} open items</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recovered MTD</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">$61,230</p>
          <p className="text-xs text-muted-foreground">+14% vs last month</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg cycle</span>
          </div>
          <p className="text-2xl font-bold text-blue-400 tabular-nums">14 days</p>
          <p className="text-xs text-muted-foreground">Variance → credit received</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Variance Items</span>
          <span className="ml-auto text-xs text-muted-foreground">{items.length} total</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/10">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variance Type</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-border last:border-0 transition-colors",
                  item.routedToday ? "bg-amber-500/5" : "hover:bg-muted/10"
                )}
              >
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">{item.invoiceRef}</td>
                <td className="px-4 py-3.5 text-foreground">{item.supplier}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-foreground">{fmt(item.amount)}</td>
                <td className="px-4 py-3.5">
                  <StatusPill status={item.status} routedToday={item.routedToday} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Link back */}
      <Link href="/ap-inbox">
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to AP Inbox
        </button>
      </Link>
    </div>
  );
}
