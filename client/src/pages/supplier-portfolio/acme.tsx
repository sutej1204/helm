import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import {
  Mail,
  Database,
  FileText,
  AlertTriangle,
  ChevronLeft,
  Clock,
  Building2,
  MapPin,
  Phone,
  DollarSign,
  Calendar,
  Brain,
  Zap,
  Heart,
  CheckCircle2,
  CreditCard,
  Loader2,
  X,
  MessageSquare,
  Search,
  TrendingUp,
  Landmark,
  Play,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Radial gauge SVG ─────────────────────────────────────────────────────────
function RadialGauge({
  value, max = 100, size = 140, strokeWidth = 10, color, label, sublabel,
}: {
  value: number; max?: number; size?: number; strokeWidth?: number;
  color: string; label: string; sublabel: string;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -210;
  const sweepAngle = 240;
  const pct = value / max;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcPath = (angle: number) => {
    const a = toRad(startAngle + angle);
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  };
  const totalArc = (sweep: number) => {
    const large = sweep > 180 ? 1 : 0;
    return `M ${arcPath(0)} A ${r} ${r} 0 ${large} 1 ${arcPath(sweep)}`;
  };
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={totalArc(sweepAngle)} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d={totalArc(sweepAngle * pct)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={size / 4.5} fontWeight="700">{value}</text>
        <text x={cx} y={cy + size / 7} textAnchor="middle" fill="#94a3b8" fontSize={size / 11} fontWeight="600" letterSpacing="2">{label}</text>
      </svg>
      <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
    </div>
  );
}

// ─── Feed card ────────────────────────────────────────────────────────────────
function FeedCard({ source, sourceColor, sourceIcon, time, children }: {
  source: string; sourceColor: string; sourceIcon: React.ReactNode;
  time: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1", sourceColor)}>
          {sourceIcon}{source}
        </Badge>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />{time}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────
const LOAD_STEPS = [
  { label: "Ingesting supplier emails & tickets...", source: "Inbox" },
  { label: "Scanning ERP payment records...",        source: "SAP ERP" },
  { label: "Reviewing contract clauses...",          source: "CLM System" },
  { label: "Synthesizing intelligence...",           source: "Helm AI" },
];
const STEP_DELAY = 900; // ms per step

function LoadingScreen() {
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    if (completedSteps >= LOAD_STEPS.length) return;
    const t = setTimeout(() => setCompletedSteps(n => n + 1), STEP_DELAY);
    return () => clearTimeout(t);
  }, [completedSteps]);

  const pct = Math.round((completedSteps / LOAD_STEPS.length) * 100);

  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-7 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Brain className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Intelligence Engine</p>
            <p className="text-xs text-muted-foreground">Processing supplier data across sources</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-1">
          {LOAD_STEPS.map((step, i) => {
            const done = i < completedSteps;
            const active = i === completedSteps;
            return (
              <div
                key={step.label}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
                  active && "bg-emerald-500/8 border border-emerald-500/20",
                  done && "opacity-80"
                )}
              >
                <div className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : active ? (
                    <Loader2 className="h-5 w-5 text-emerald-400 shrink-0 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-border shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm",
                    done || active ? "text-foreground" : "text-muted-foreground/50"
                  )}>
                    {step.label}
                  </span>
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  done || active ? "text-muted-foreground" : "text-muted-foreground/30"
                )}>
                  {step.source}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #10b981, #3b82f6)",
              }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">{pct}% complete</p>
        </div>
      </div>
    </div>
  );
}

// ─── Orchestration Modal ──────────────────────────────────────────────────────
const EXEC_STEPS = [
  {
    title: "Reading supplier email...",
    detail: "Detected frustration about payment terms — tone score 32/100",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Credit note discovered",
    detail: "CN-2026-0091: $50,000 credit note matched against INV-2026-0847",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "Embedded financing triggered",
    detail: "Tradeshift Capital approved $200K facility at 1.5% APR",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    title: "Terms updated & relationship restored",
    detail: "Net-30 → Net-60 shift applied. Sentiment score: 32 → 78",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    highlight: true,
  },
];
const EXEC_STEP_DELAY = 900;

function OrchestrationModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [phase, setPhase] = useState<"preview" | "executing" | "complete">("preview");
  const [completedSteps, setCompletedSteps] = useState(0);

  // Tick through steps when executing
  useEffect(() => {
    if (phase !== "executing") return;
    if (completedSteps >= EXEC_STEPS.length) {
      const t = setTimeout(() => setPhase("complete"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCompletedSteps(n => n + 1), EXEC_STEP_DELAY);
    return () => clearTimeout(t);
  }, [phase, completedSteps]);

  const financialRows = [
    { icon: Search,    label: "Hidden Credit Note",      value: "$50,000",  color: "text-blue-400",    bg: "bg-blue-500/8 border-blue-500/20"     },
    { icon: TrendingUp,label: "Discount Available (2%)", value: "+$2,000",  color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20"},
    { icon: Landmark,  label: "Financing Cost (1.5% APR)",value: "-$1,500", color: "text-red-400",     bg: "bg-red-500/8 border-red-500/20"       },
    { icon: DollarSign,label: "Net Arbitrage Profit",    value: "+$500",    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30"},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={phase === "preview" ? onClose : undefined} />

      <div className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl">
        {/* Rainbow top border */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #a855f7, #3b82f6, #10b981, #f59e0b)" }} />

        <div className="bg-[#0f1623] border border-border border-t-0 rounded-b-2xl p-6 space-y-5">
          {/* Header — same in both phases */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Execute Orchestration</h2>
                <p className="text-xs text-muted-foreground mt-0.5">ACME Manufacturing — Supplier A</p>
              </div>
            </div>
            {phase !== "executing" && (
              <button onClick={phase === "complete" ? onConfirm : onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ── Phase 1: preview ── */}
          {phase === "preview" && (
            <>
              <div className="bg-red-500/8 border border-red-500/25 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-red-400 shrink-0" />
                  <span className="text-sm font-semibold text-red-400">Detected Conflict</span>
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "We've been waiting over 12 days past our agreed terms for the third time this quarter. If this continues, we'll need to reassess our pricing structure and consider other partners."
                </p>
                <p className="text-[11px] text-red-400/80 font-medium">— James Wilson, VP Sales, ACME Manufacturing</p>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 shrink-0" />
                  Outstanding Invoice
                </div>
                <span className="text-sm font-semibold text-foreground">$100,000</span>
              </div>

              <div className="space-y-2">
                {financialRows.map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className={cn("flex items-center justify-between px-4 py-3 rounded-xl border", bg)}>
                    <div className={cn("flex items-center gap-2.5 text-sm font-medium", color)}>
                      <Icon className="h-4 w-4 shrink-0" />{label}
                    </div>
                    <span className={cn("text-sm font-bold", color)}>{value}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setPhase("executing")}
                className="w-full gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-5"
              >
                <Play className="h-4 w-4" />
                Execute Orchestration
              </Button>
            </>
          )}

          {/* ── Phase 2: execution steps ── */}
          {phase === "executing" && (
            <div className="space-y-3">
              {EXEC_STEPS.map((step, i) => {
                const done = i < completedSteps;
                const active = i === completedSteps;
                return (
                  <div
                    key={step.title}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border transition-all duration-300",
                      step.highlight && active
                        ? "bg-emerald-500/8 border-emerald-500/25"
                        : active
                        ? "bg-muted/10 border-border"
                        : done
                        ? "border-transparent"
                        : "border-transparent opacity-40"
                    )}
                  >
                    {/* Step icon */}
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                      done || active ? step.iconBg : "bg-muted/20"
                    )}>
                      {done ? (
                        <CheckCircle2 className={cn("h-5 w-5", step.iconColor)} />
                      ) : active ? (
                        <Loader2 className={cn("h-5 w-5 animate-spin", step.iconColor)} />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-border" />
                      )}
                    </div>
                    {/* Text */}
                    <div className="min-w-0">
                      <p className={cn(
                        "text-sm font-semibold leading-snug",
                        done || active ? "text-foreground" : "text-muted-foreground/40"
                      )}>
                        {step.title}
                      </p>
                      {(done || active) && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.detail}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Phase 3: complete ── */}
          {phase === "complete" && (
            <div className="flex flex-col items-center text-center py-4 space-y-5">
              {/* Big checkmark */}
              <div className="h-20 w-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Orchestration Complete</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Relationship restored. Terms shifted to Net-60. $50K credit applied. Financing secured.
                </p>
              </div>

              {/* 2×2 result grid */}
              <div className="w-full grid grid-cols-2 divide-x divide-y divide-border border border-border rounded-xl overflow-hidden text-left">
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Terms</p>
                  <p className="text-sm font-bold text-foreground">Net-30 → Net-60</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Credit Applied</p>
                  <p className="text-sm font-bold text-blue-400">$50,000</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Financing</p>
                  <p className="text-sm font-bold text-amber-400">$200K @ 1.5%</p>
                </div>
                <div className="p-4 bg-emerald-500/10">
                  <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                  <p className="text-sm font-bold text-emerald-400">32 → 78</p>
                </div>
              </div>

              <Button
                onClick={onConfirm}
                className="w-40 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AcmeDetail() {
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [done, setDone] = useState(false);
  const [payOption, setPayOption] = useState<"now" | "installments" | "later">("installments");
  const [installTerm, setInstallTerm] = useState<2 | 3>(2);
  const [laterTerm, setLaterTerm] = useState<30 | 45 | 60 | 90>(60);

  // Reveal feed after all steps complete + brief pause
  useEffect(() => {
    const t = setTimeout(() => setReady(true), STEP_DELAY * LOAD_STEPS.length + 600);
    return () => clearTimeout(t);
  }, []);

  function handleOrchestrationDone() {
    setShowModal(false);
    setDone(true);
  }

  return (
    <div className="flex min-h-full">
      {/* ── Left panel ── */}
      <div className="w-72 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="px-5 pt-5 pb-3">
          <Link href="/supplier-portfolio">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" /> Supplier Portfolio
            </button>
          </Link>
        </div>

        <div className="flex flex-col items-center px-5 pb-6 border-b border-border">
          <div className="h-20 w-20 rounded-2xl bg-blue-500 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-white">AM</span>
          </div>
          <h2 className="text-base font-bold text-foreground text-center">ACME Manufacturing</h2>
          <p className="text-xs text-muted-foreground mt-0.5 text-center">Industrial Components & Parts</p>
          <div className="mt-5 transition-all duration-700">
            <RadialGauge
              value={done ? 94 : 72}
              color={done ? "#10b981" : "#f59e0b"}
              size={148}
              strokeWidth={11}
              label="HEALTH"
              sublabel="Relationship Health Score"
            />
          </div>
        </div>

        <div className="px-5 py-4 space-y-3 border-b border-border">
          {[
            { icon: Building2,  label: "Industry:",      value: "Manufacturing"          },
            { icon: MapPin,     label: "Location:",      value: "Chicago, IL"            },
            { icon: Phone,      label: "Contact:",       value: "James Wilson"           },
            { icon: DollarSign, label: "Annual Spend:",  value: done ? "$2.4M" : "$3.8M" },
            { icon: Calendar,   label: "Relationship:",  value: "4 years"                },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0" />{label}
              </div>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>

        <div className="px-5 py-5 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Heart className={cn("h-4 w-4", done ? "text-emerald-400" : "text-red-400")} />
            <span className="text-sm font-semibold text-foreground">Sentiment Analysis</span>
          </div>
          <div className="flex flex-col items-center mb-3">
            <RadialGauge
              value={done ? 78 : 32}
              color={done ? "#10b981" : "#ef4444"}
              size={118}
              strokeWidth={9}
              label="SENTIMENT SCORE"
              sublabel="Based on ingested emails & support tickets"
            />
            <p className={cn("text-[11px] font-semibold -mt-1", done ? "text-emerald-400" : "text-red-400")}>
              {done ? "Healthy" : "Frustrated"}
            </p>
          </div>
          {done ? (
            <div className="mt-3 bg-emerald-500/8 border border-emerald-500/25 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">Sentiment Improved</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Score improved from 32 to 78 after orchestration
              </p>
            </div>
          ) : (
            <div className="mt-3 bg-red-500/8 border border-red-500/25 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[11px] font-semibold text-red-400">Frustrated Email Detected</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                "We've been waiting over 12 days past our agreed terms for the third time this quarter..."
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      {!ready ? (
        <LoadingScreen />
      ) : (
        <div className="flex-1 overflow-auto p-6 space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-foreground">Intelligence Feed</h2>
          </div>

          <FeedCard source="Email / Inbox" sourceColor="bg-purple-500/10 border-purple-500/30 text-purple-400" sourceIcon={<Mail className="h-3 w-3" />} time="5 hours ago">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Sentiment Analysis:</span> Communication tone trending negative over last 2 weeks. 3 escalated emails detected.
            </p>
            <div className="bg-muted/20 border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-400">Key Finding:</span>
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "We've been waiting over 12 days past our agreed terms for the third time this quarter. If this continues, we'll need to reassess our pricing structure and consider other partners."
              </p>
              <p className="text-[10px] text-blue-400">Ticket #4892 — Escalated to VP Level</p>
            </div>
          </FeedCard>

          <FeedCard source="ERP System (SAP)" sourceColor="bg-blue-500/10 border-blue-500/30 text-blue-400" sourceIcon={<Database className="h-3 w-3" />} time="Real-time">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Payment History:</span> 12 invoices in last 6 months. Average payment: 32 days (2 days late vs Net 30 terms).
            </p>
            <div className="bg-amber-500/8 border border-amber-500/25 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <p className="text-xs">
                <span className="font-semibold text-amber-400">Upcoming Invoice:</span>
                <span className="text-foreground"> $100,000 (INV-2026-0847) due in 8 days</span>
              </p>
            </div>
          </FeedCard>

          <FeedCard source="Contract (CLM)" sourceColor="bg-emerald-500/10 border-emerald-500/30 text-emerald-400" sourceIcon={<FileText className="h-3 w-3" />} time="Contract scan">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Contract Terms:</span> Master Supply Agreement (MSA-2024-112), renewed Feb 2025.
            </p>
            <div className="space-y-2">
              <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-lg px-3.5 py-2.5 flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs">
                  <span className="font-semibold text-emerald-400">AI Discovery:</span>
                  <span className="text-emerald-300"> 2/10 Net 30 discount clause found — pay within 10 days for 2% discount. Currently unused.</span>
                </p>
              </div>
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-lg px-3.5 py-2.5 flex items-start gap-2">
                <CreditCard className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs">
                  <span className="font-semibold text-blue-400">Hidden Credit:</span>
                  <span className="text-blue-300"> Credit Note CN-2026-0091 ($50,000) matched against INV-2026-0847.</span>
                </p>
              </div>
            </div>
          </FeedCard>

          <div className="bg-card border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Brain className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">AI Recommendation Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Based on cross-source analysis: Execute orchestration to read the frustrated email, apply the $50K credit note, trigger embedded financing, and shift terms to Net-60. This resolves the payment lag and restores the relationship.
            </p>
            <Button
              onClick={() => !done && setShowModal(true)}
              disabled={done}
              className={cn(
                "w-full gap-2 font-semibold transition-all",
                done ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              )}
            >
              {done ? (
                <><CheckCircle2 className="h-4 w-4" /> Orchestration Complete</>
              ) : (
                <><Zap className="h-4 w-4" /> Execute Orchestration</>
              )}
            </Button>
          </div>

          {/* ── Embedded Financing ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Embedded Financing</h3>
            <p className="text-xs text-muted-foreground mb-4">Select payment terms for open invoices across your supplier portfolio.</p>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Orange header strip */}
              <div className="px-5 pt-4 pb-3 border-b border-border">
                <p className="text-[10px] font-bold tracking-widest text-orange-400 mb-1.5">SHORT-TERM FINANCING IN SECONDS</p>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">How would you like to finance this $100,000.00 purchase?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">ACME Manufacturing · INV-2026-0847</p>
                  </div>
                  <button className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition-colors shrink-0 mt-0.5">
                    Review your credit limits <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Pay now */}
              <div
                onClick={() => setPayOption("now")}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 cursor-pointer border-b border-border transition-colors",
                  payOption === "now" ? "bg-orange-500/5 border-l-2 border-l-orange-500" : "hover:bg-muted/10"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                  payOption === "now" ? "border-orange-500" : "border-muted-foreground/40"
                )}>
                  {payOption === "now" && <div className="h-2 w-2 rounded-full bg-orange-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Pay now</span>
                    <span className="text-xs font-semibold text-emerald-400">No interest</span>
                  </div>
                  <p className="text-base font-bold text-foreground mt-0.5">$100,000.00</p>
                  <p className="text-[11px] text-muted-foreground">due today*</p>
                </div>
              </div>

              {/* Pay in installments */}
              <div
                onClick={() => setPayOption("installments")}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 cursor-pointer border-b border-orange-500/30 transition-colors",
                  payOption === "installments" ? "bg-orange-500/5 border border-orange-500/40" : "border-border hover:bg-muted/10"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                  payOption === "installments" ? "border-orange-500" : "border-muted-foreground/40"
                )}>
                  {payOption === "installments" && <div className="h-2 w-2 rounded-full bg-orange-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-semibold text-foreground">Pay in installments</span>
                    <div className="flex items-center gap-1.5">
                      {([2, 3] as const).map(m => (
                        <button
                          key={m}
                          onClick={e => { e.stopPropagation(); setPayOption("installments"); setInstallTerm(m); }}
                          className={cn(
                            "text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-colors",
                            installTerm === m && payOption === "installments"
                              ? "bg-orange-500 text-white"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {m} months
                        </button>
                      ))}
                      <span className="text-[11px] text-orange-400 font-medium">1.5% interest</span>
                    </div>
                  </div>
                  <p className="text-base font-bold text-foreground mt-0.5">$101,500.00</p>
                  <p className="text-[11px] text-muted-foreground">${(101500 / installTerm / 1000 * 1000).toLocaleString("en-US", { minimumFractionDigits: 2 })} down due today*</p>
                </div>
              </div>

              {/* Pay later */}
              <div
                onClick={() => setPayOption("later")}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors",
                  payOption === "later" ? "bg-orange-500/5 border-l-2 border-l-orange-500" : "hover:bg-muted/10"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                  payOption === "later" ? "border-orange-500" : "border-muted-foreground/40"
                )}>
                  {payOption === "later" && <div className="h-2 w-2 rounded-full bg-orange-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-semibold text-foreground">Pay later</span>
                    <div className="flex items-center gap-1.5">
                      {([30, 45, 60, 90] as const).map(n => (
                        <button
                          key={n}
                          onClick={e => { e.stopPropagation(); setPayOption("later"); setLaterTerm(n); }}
                          className={cn(
                            "text-[11px] font-semibold transition-colors",
                            laterTerm === n && payOption === "later"
                              ? "text-foreground underline underline-offset-2"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Net {n}
                        </button>
                      ))}
                      <span className="text-[11px] text-orange-400 font-medium">1.5% interest</span>
                    </div>
                  </div>
                  <p className="text-base font-bold text-foreground mt-0.5">$101,500.00</p>
                  <p className="text-[11px] text-muted-foreground">due in {laterTerm} days*</p>
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 py-4 bg-muted/5 space-y-2">
                <button className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm py-3.5 rounded-xl transition-colors">
                  {payOption === "now"
                    ? "Pay $100,000.00 today"
                    : payOption === "installments"
                    ? `Pay over ${installTerm} months`
                    : `Pay later — Net ${laterTerm}`}
                </button>
                <p className="text-center text-[10px] text-muted-foreground">*Amounts shown do not include payment processing fees.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Orchestration modal */}
      {showModal && (
        <OrchestrationModal
          onClose={() => setShowModal(false)}
          onConfirm={handleOrchestrationDone}
        />
      )}
    </div>
  );
}
