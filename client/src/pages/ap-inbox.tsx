import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Inbox, CheckCircle2, AlertTriangle, Loader2, ChevronRight, FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { inboxRows } from "@/lib/invoice-match-data";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function StatusPill({ status, varianceAmount }: { status: string; varianceAmount?: number }) {
  if (status === "variance")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
        <AlertTriangle className="h-3 w-3" />
        Variance · {fmt(varianceAmount ?? 0)}
      </span>
    );
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
        <CheckCircle2 className="h-3 w-3" />
        Verified payable
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25">
      <Loader2 className="h-3 w-3 animate-spin" />
      Processing
    </span>
  );
}

export default function ApInbox() {
  const [search, setSearch] = useState("");
  const filtered = inboxRows.filter(
    r =>
      r.supplier.toLowerCase().includes(search.toLowerCase()) ||
      r.ref.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Inbox className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AP Inbox</h1>
            <p className="text-sm text-muted-foreground">Incoming invoices — 4-way match engine</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
          1 variance flagged
        </span>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total invoices", value: "5", color: "text-foreground" },
          { label: "Verified payable", value: "3", color: "text-emerald-400" },
          { label: "Variance flagged", value: "1", color: "text-red-400" },
          { label: "Processing",       value: "1", color: "text-blue-400"  },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-3">
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Incoming Invoices</span>
          <div className="ml-auto">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search supplier or invoice…"
              className="bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-emerald-500/50 w-52"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/10">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoice #</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Match Summary</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const isVariance = row.status === "variance";
              const isClickable = row.id === "INV-44892";
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    isVariance ? "bg-red-500/4" : "",
                    isClickable ? "cursor-pointer hover:bg-muted/15" : ""
                  )}
                >
                  <td className="px-5 py-3.5">
                    {isClickable ? (
                      <Link href={`/matching-engine/${row.id}`}>
                        <span className="font-semibold text-foreground hover:text-emerald-400 transition-colors">
                          {row.supplier}
                        </span>
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{row.supplier}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{row.ref}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-foreground tabular-nums">{fmt(row.amount)}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-xs", isVariance ? "text-red-400 font-medium" : "text-muted-foreground")}>
                      {isVariance && <AlertTriangle className="inline h-3 w-3 mr-1 mb-0.5" />}
                      {row.matchSummary}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={row.status} varianceAmount={(row as any).varianceAmount} />
                  </td>
                  <td className="px-4 py-3.5">
                    {isClickable && (
                      <Link href={`/matching-engine/${row.id}`}>
                        <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
