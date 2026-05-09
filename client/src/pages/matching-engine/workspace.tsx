import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, AlertTriangle, FileText, Package, Receipt, ScrollText,
  ChevronRight, ChevronLeft,
} from "lucide-react";
import { invoices, pos, receipts, agreements, computeVariance } from "@/lib/invoice-match-data";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

interface LegCardProps {
  icon: React.ReactNode;
  label: string;
  ref_: string;
  meta: string[];
  state: "ok" | "warn";
}

function LegCard({ icon, label, ref_, meta, state }: LegCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3",
      state === "ok" ? "border-emerald-500/30 bg-emerald-500/4" : "border-amber-500/40 bg-amber-500/6"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            state === "ok" ? "bg-emerald-500/15" : "bg-amber-500/15"
          )}>
            {icon}
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
        {state === "ok" ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        )}
      </div>
      <p className="font-mono text-sm font-bold text-foreground">{ref_}</p>
      <div className="space-y-1">
        {meta.map((m, i) => (
          <p key={i} className="text-xs text-muted-foreground">{m}</p>
        ))}
      </div>
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        state === "ok"
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-amber-500/15 text-amber-400"
      )}>
        {state === "ok" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
        {state === "ok" ? "Matched" : "Variance detected"}
      </div>
    </div>
  );
}

export default function MatchWorkspace({ params }: { params: { invoiceId: string } }) {
  const invoice = invoices[params.invoiceId];

  if (!invoice) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invoice not found: {params.invoiceId}</p>
      </div>
    );
  }

  const po = pos[invoice.poRef];
  const receipt = receipts[invoice.receiptRef];
  const agreement = invoice.agreementRef ? agreements[invoice.agreementRef] : null;

  // Compute per-line variances
  const lineVariances = invoice.lines.map(line => ({
    line,
    variance: computeVariance(line, invoice.agreementRef),
  }));
  const totalRecoverable = lineVariances.reduce((s, lv) => s + (lv.variance?.totalRecoverable ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/ap-inbox"><span className="hover:text-foreground transition-colors cursor-pointer">AP Inbox</span></Link>
        <ChevronRight className="h-3 w-3" />
        <span>{invoice.supplierName}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{invoice.ref}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">{invoice.supplierName}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span className="font-mono font-semibold text-foreground">{invoice.ref}</span>
            <span>·</span>
            <span>{fmt(invoice.total)}</span>
            <span>·</span>
            <span>Received {invoice.received_date}</span>
            <span>·</span>
            <span>{invoice.lines.length} lines</span>
          </div>
        </div>
        {totalRecoverable > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-red-500/15 text-red-400 border border-red-500/25">
            <AlertTriangle className="h-4 w-4" />
            Variance · {fmt(totalRecoverable)} recoverable
          </span>
        )}
      </div>

      {/* 2×2 Leg grid */}
      <div className="grid grid-cols-2 gap-4">
        <LegCard
          icon={<FileText className="h-4 w-4 text-emerald-400" />}
          label="Purchase Order"
          ref_={invoice.poRef}
          meta={[`Issued ${po?.issuedDate ?? "—"}`, `${po?.lines.length ?? 0} lines · All quantities matched`]}
          state="ok"
        />
        <LegCard
          icon={<Package className="h-4 w-4 text-emerald-400" />}
          label="Goods Receipt"
          ref_={invoice.receiptRef}
          meta={[
            `Received ${receipt?.lines[0]?.received_date ?? "—"}`,
            `${receipt?.lines.length ?? 0} lines · All quantities confirmed`,
          ]}
          state="ok"
        />
        <LegCard
          icon={<Receipt className="h-4 w-4 text-emerald-400" />}
          label="Invoice"
          ref_={invoice.ref}
          meta={[`${fmt(invoice.total)} total`, `${invoice.lines.length} line items · Received ${invoice.received_date}`]}
          state="ok"
        />
        <LegCard
          icon={<ScrollText className="h-4 w-4 text-amber-400" />}
          label="Vendor Agreement"
          ref_={invoice.agreementRef ?? "No agreement linked"}
          meta={[
            agreement ? `Signed ${agreement.signedDate}` : "—",
            totalRecoverable > 0 ? "§4.2(a) price ceiling breached on line 3" : "All clauses satisfied",
          ]}
          state={totalRecoverable > 0 ? "warn" : "ok"}
        />
      </div>

      {/* Line items table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Invoice Line Items</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/10">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Line</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">SKU</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qty</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoice Unit</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agreement Unit</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {lineVariances.map(({ line, variance }, idx) => {
              const hasVariance = !!variance;
              return (
                <tr
                  key={line.id}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    hasVariance ? "bg-amber-500/6 hover:bg-amber-500/10 cursor-pointer" : "hover:bg-muted/10"
                  )}
                  onClick={hasVariance ? () => window.location.href = `/matching-engine/${invoice.id}/variance/${line.id}` : undefined}
                >
                  <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">{idx + 1}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-foreground">{line.sku}</td>
                  <td className="px-4 py-3.5 text-foreground">{line.description}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-foreground">{line.qty}</td>
                  <td className={cn("px-4 py-3.5 text-right tabular-nums font-semibold", hasVariance ? "text-red-400" : "text-foreground")}>
                    {fmt(line.unit_price)}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                    {variance ? fmt(variance.agreementUnit) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {hasVariance ? (
                      <Link href={`/matching-engine/${invoice.id}/variance/${line.id}`}>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors">
                          <AlertTriangle className="h-3 w-3" />
                          −{fmt(variance!.perUnitDelta)}/unit
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Matched
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Back link */}
      <Link href="/ap-inbox">
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to AP Inbox
        </button>
      </Link>
    </div>
  );
}
