import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, ChevronRight, FileText, ScrollText, Package, Receipt,
  ArrowRight, CheckCircle2, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { invoices, agreements, pos, receipts, computeVariance, routeToRecovery } from "@/lib/invoice-match-data";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

interface MetricCellProps { label: string; value: string; highlight?: boolean; sub?: string }
function MetricCell({ label, value, highlight, sub }: MetricCellProps) {
  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-1",
      highlight ? "border-red-500/30 bg-red-500/6" : "border-border bg-card"
    )}>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className={cn("text-xl font-bold tabular-nums", highlight ? "text-red-400" : "text-foreground")}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

interface EvidenceCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  ref_: string;
  lines: { key: string; value: string }[];
}
function EvidenceCard({ icon, iconBg, label, ref_, lines }: EvidenceCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconBg)}>{icon}</div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="font-mono text-sm font-bold text-foreground">{ref_}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {lines.map(l => (
          <div key={l.key} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{l.key}</span>
            <span className="font-medium text-foreground text-right">{l.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VarianceEvidence({ params }: { params: { invoiceId: string; lineId: string } }) {
  const [, navigate] = useLocation();
  const [routed, setRouted] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);

  const invoice = invoices[params.invoiceId];
  const line = invoice?.lines.find(l => l.id === params.lineId);

  if (!invoice || !line) {
    return <div className="p-6"><p className="text-muted-foreground">Evidence not found.</p></div>;
  }

  const variance = computeVariance(line, invoice.agreementRef);
  const agreement = invoice.agreementRef ? agreements[invoice.agreementRef] : null;
  const po = pos[invoice.poRef];
  const receipt = receipts[invoice.receiptRef];
  const poLine = po?.lines.find(l => l.sku === line.sku);
  const receiptLine = receipt?.lines.find(l => l.sku === line.sku);

  function handleRouteToRecovery() {
    routeToRecovery(invoice.ref, invoice.supplierName, variance?.totalRecoverable ?? 0);
    setRouted(true);
    setTimeout(() => navigate("/recovery/queue"), 800);
  }

  if (!variance) {
    return <div className="p-6"><p className="text-muted-foreground">No variance found for this line.</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/ap-inbox"><span className="hover:text-foreground transition-colors cursor-pointer">AP Inbox</span></Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/matching-engine/${invoice.id}`}><span className="hover:text-foreground transition-colors cursor-pointer">{invoice.ref}</span></Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Variance · {line.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-foreground">Variance Evidence</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{line.sku}</span>
            <span className="mx-2">·</span>
            <span>{line.description}</span>
            <span className="mx-2">·</span>
            <span>Qty {line.qty}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-red-500/15 text-red-400 border border-red-500/25">
          <AlertTriangle className="h-3.5 w-3.5" />
          SPA Price Breach
        </span>
      </div>

      {/* 4 metric cells */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCell label="Invoice unit price"  value={fmt(variance.invoiceUnit)}       highlight />
        <MetricCell label="Agreement unit price" value={fmt(variance.agreementUnit)}     />
        <MetricCell label="Per-unit delta"       value={`+${fmt(variance.perUnitDelta)}`} highlight sub="above contracted ceiling" />
        <MetricCell
          label="Total recoverable"
          value={fmt(variance.totalRecoverable)}
          highlight
          sub={`${line.qty} units × ${fmt(variance.perUnitDelta)}`}
        />
      </div>

      {/* 2×2 evidence grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* SPA Clause */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <ScrollText className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">SPA Clause</p>
              <p className="font-mono text-sm font-bold text-foreground">{variance.clause.ref}</p>
            </div>
          </div>
          <blockquote className="text-xs text-amber-200/80 italic leading-relaxed border-l-2 border-amber-500/40 pl-3">
            "{variance.clause.text}"
          </blockquote>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Max unit price</span>
            <span className="font-semibold text-foreground">{fmt(variance.clause.max_unit_price)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Valid through</span>
            <span className="font-semibold text-foreground">31 Dec 2026</span>
          </div>
        </div>

        {/* Signed Agreement */}
        <EvidenceCard
          icon={<FileText className="h-4 w-4 text-blue-400" />}
          iconBg="bg-blue-500/15"
          label="Signed Agreement"
          ref_={agreement?.ref ?? "—"}
          lines={[
            { key: "Counterparty", value: agreement?.counterparty ?? "—" },
            { key: "Signed date",  value: agreement?.signedDate ?? "—" },
            { key: "File ref",     value: agreement?.fileRef ?? "—" },
            { key: "Status",       value: "Active · In force" },
          ]}
        />

        {/* PO Line */}
        <EvidenceCard
          icon={<FileText className="h-4 w-4 text-emerald-400" />}
          iconBg="bg-emerald-500/15"
          label="PO Line"
          ref_={invoice.poRef}
          lines={[
            { key: "SKU",        value: line.sku },
            { key: "PO qty",     value: String(poLine?.qty ?? line.qty) },
            { key: "PO unit price", value: fmt(poLine?.unit_price ?? variance.agreementUnit) },
            { key: "Match",      value: "✓ Quantity matched" },
          ]}
        />

        {/* Receipt Line */}
        <EvidenceCard
          icon={<Package className="h-4 w-4 text-emerald-400" />}
          iconBg="bg-emerald-500/15"
          label="Receipt Line"
          ref_={invoice.receiptRef}
          lines={[
            { key: "SKU",           value: line.sku },
            { key: "Qty received",  value: String(receiptLine?.qty_received ?? line.qty) },
            { key: "Received date", value: receiptLine?.received_date ?? "—" },
            { key: "Match",         value: "✓ Quantity confirmed" },
          ]}
        />
      </div>

      {/* Action row */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleRouteToRecovery}
          disabled={routed}
          className={cn(
            "gap-2 font-semibold px-6",
            routed
              ? "bg-emerald-600 hover:bg-emerald-600 text-white"
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
          )}
        >
          {routed ? (
            <><CheckCircle2 className="h-4 w-4" /> Routed to Recovery</>
          ) : (
            <><RotateCcw className="h-4 w-4" /> Route to Recovery</>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setOverrideOpen(true)}
          className="gap-2 text-muted-foreground"
        >
          Override with reason
        </Button>
      </div>

      {/* Override placeholder modal */}
      {overrideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverrideOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-foreground">Override with Reason</h3>
            <p className="text-sm text-muted-foreground">Provide a business justification to approve this variance without recovery routing.</p>
            <textarea
              rows={3}
              placeholder="Enter override reason…"
              className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setOverrideOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setOverrideOpen(false)} className="bg-amber-500 hover:bg-amber-400 text-slate-950">Submit override</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
