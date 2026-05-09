import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Globe,
  Filter,
  Inbox,
  Cpu,
  Database,
  Building2,
  ChevronRight,
  Activity,
  Search,
  FileText,
  Banknote,
  ShieldCheck,
  Zap,
  RotateCcw,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

// ─── KPI Data ────────────────────────────────────────────────────────────────
const kpiCards = [
  {
    label: "Total Owed",
    value: "$4,821,340",
    delta: "+$312K this month",
    icon: DollarSign,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    description: "Identified underpayments & overcharges",
  },
  {
    label: "Total Filed",
    value: "$2,194,780",
    delta: "+$89K this week",
    icon: TrendingUp,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    description: "Claims submitted to suppliers",
  },
  {
    label: "Total Recovered",
    value: "$1,037,220",
    delta: "+$44K this week",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    description: "Cash collected from suppliers",
  },
  {
    label: "Recovery Rate",
    value: "22%",
    delta: "+3pts vs last quarter",
    icon: Activity,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    description: "Of total owed recovered",
  },
];

// ─── Orchestration Flow ───────────────────────────────────────────────────────
const orchSteps = [
  {
    icon: Inbox,
    label: "Inbox",
    sub: "Email & EDI",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/25",
    active: true,
  },
  {
    icon: Cpu,
    label: "Helm AI",
    sub: "Agent Engine",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/25",
    active: true,
  },
  {
    icon: Database,
    label: "ERP",
    sub: "NetSuite / SAP",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/25",
    active: true,
  },
  {
    icon: Building2,
    label: "Suppliers",
    sub: "10 manufacturers",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/25",
    active: false,
  },
];

// ─── Map Data ─────────────────────────────────────────────────────────────────
type SupplierStatus = "Healthy" | "Stable" | "Negotiating" | "At Risk";

const supplierMarkers: { name: string; coords: [number, number]; status: SupplierStatus; spend: string }[] = [
  { name: "Carrier Global", coords: [-72.7, 41.8], status: "Healthy", spend: "$18.5M" },
  { name: "Trane Technologies", coords: [-80.8, 35.5], status: "Healthy", spend: "$14.2M" },
  { name: "Lennox International", coords: [-96.7, 32.9], status: "Stable", spend: "$9.8M" },
  { name: "Rheem Manufacturing", coords: [-84.4, 33.7], status: "Stable", spend: "$7.6M" },
  { name: "Mitsubishi Electric", coords: [135.5, 34.7], status: "Healthy", spend: "$6.2M" },
  { name: "Honeywell", coords: [-76.2, 36.8], status: "Negotiating", spend: "$4.8M" },
  { name: "Johnson Controls", coords: [-87.9, 43.0], status: "At Risk", spend: "$4.1M" },
  { name: "Daikin Industries", coords: [135.4, 34.5], status: "Stable", spend: "$3.9M" },
  { name: "Pacific HVAC Supply", coords: [-118.2, 34.1], status: "Healthy", spend: "$2.8M" },
  { name: "Northeast Coil Co", coords: [-71.0, 42.4], status: "Stable", spend: "$1.6M" },
];

const statusColors: Record<SupplierStatus, string> = {
  Healthy: "#10b981",
  Stable: "#3b82f6",
  Negotiating: "#f59e0b",
  "At Risk": "#ef4444",
};

const statusLegend: { status: SupplierStatus; color: string }[] = [
  { status: "Healthy", color: "#10b981" },
  { status: "Stable", color: "#3b82f6" },
  { status: "Negotiating", color: "#f59e0b" },
  { status: "At Risk", color: "#ef4444" },
];

const GEO_URL = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// ─── Agent Feed ───────────────────────────────────────────────────────────────
type AgentTag = "success" | "alert" | "discovery" | "info";

const agentIconMap = {
  RotateCcw,
  ShieldCheck,
  Search,
  Brain,
  FileText,
  Banknote,
  Zap,
} as const;

type AgentIconKey = keyof typeof agentIconMap;

interface AgentEvent {
  id: number;
  agent: string;
  tag: AgentTag;
  message: string;
  time: string;
  iconKey: AgentIconKey;
}

const agentTagStyles: Record<AgentTag, string> = {
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  alert: "bg-red-500/20 text-red-400 border-red-500/30",
  discovery: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  info: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const agentIconStyles: Record<AgentTag, string> = {
  success: "bg-emerald-500/15 text-emerald-400",
  alert: "bg-red-500/15 text-red-400",
  discovery: "bg-blue-500/15 text-blue-400",
  info: "bg-slate-500/15 text-slate-400",
};

const seedEvents: AgentEvent[] = [
  { id: 1, agent: "Recovery Agent", tag: "alert", message: "Carrier Q1 rebate underpaid by $87,249 — tier-2 mis-applied. Dispute package ready.", time: "Just now", iconKey: "RotateCcw" },
  { id: 2, agent: "Prevention Agent", tag: "alert", message: "Trane SPA deadline in 3 days — $123,984 in eligible credits unclaimed. Auto-drafting claim.", time: "Just now", iconKey: "ShieldCheck" },
  { id: 3, agent: "Match Agent", tag: "success", message: "4-way match complete: INV-CARR-2024-002 flagged $5,600 Leg 4 variance vs ContractorPro SPA.", time: "2m ago", iconKey: "Search" },
  { id: 4, agent: "Intelligence Agent", tag: "discovery", message: "ContractorPro SPA rejection rate 41% vs 23% network avg — end-customer classification root cause.", time: "4m ago", iconKey: "Brain" },
  { id: 5, agent: "Settlement Agent", tag: "alert", message: "RECON #2 open: Carrier credited $79,620 vs $87,420 expected. $7,800 gap — filing dispute.", time: "6m ago", iconKey: "FileText" },
  { id: 6, agent: "Financing Agent", tag: "success", message: "$163,635 recovery advance funded against verified Carrier Q2 credits. Net to distributor $161,181.", time: "9m ago", iconKey: "Banknote" },
  { id: 7, agent: "Accrual Agent", tag: "info", message: "Real-time accrual updated: +$34,180 Trane Commercial SPA Q2. Journal entry preview ready.", time: "12m ago", iconKey: "Zap" },
  { id: 8, agent: "Match Agent", tag: "success", message: "3 unapplied Lennox remittance lines resolved — SKU map updated for LENN-PARTS-009.", time: "15m ago", iconKey: "Search" },
  { id: 9, agent: "Contract Agent", tag: "discovery", message: "Rheem 2024 agreement re-ingested — new 4% chargeback tier at $300k threshold found.", time: "18m ago", iconKey: "FileText" },
  { id: 10, agent: "Recovery Agent", tag: "success", message: "CLM-TRAN-2024-Q1-001 resubmitted with corrected customer class data. Expected approval: 14 days.", time: "22m ago", iconKey: "RotateCcw" },
];

function AgentFeedItem({ event, isNew }: { event: AgentEvent; isNew?: boolean }) {
  const Icon = agentIconMap[event.iconKey];
  return (
    <div className={cn(
      "px-4 py-3 border-b border-border/50 hover:bg-muted/10 transition-colors",
      isNew && "animate-in fade-in slide-in-from-top-2 duration-300"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0", agentIconStyles[event.tag])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-xs font-semibold text-foreground">{event.agent}</span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", agentTagStyles[event.tag])}>
              {event.tag}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{event.message}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-2.5 w-2.5 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground/60">{event.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [hoveredSupplier, setHoveredSupplier] = useState<(typeof supplierMarkers)[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState<SupplierStatus | null>(null);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>(seedEvents.slice(0, 5));
  const feedRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(seedEvents.length + 1);

  // Simulate live agent feed updates
  useEffect(() => {
    const remaining = seedEvents.slice(5);
    let i = 0;
    const interval = setInterval(() => {
      if (i < remaining.length) {
        setAgentEvents(prev => [{ ...remaining[i], id: nextIdRef.current++, time: "Just now" }, ...prev.slice(0, 14)]);
        i++;
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const visibleMarkers = filterStatus ? supplierMarkers.filter(m => m.status === filterStatus) : supplierMarkers;

  return (
    <div className="h-full flex flex-col">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-4 gap-3 p-5 pb-0 shrink-0">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1.5 tracking-tight tabular-nums">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    <span className="text-[11px] font-medium text-emerald-400">{kpi.delta}</span>
                  </div>
                </div>
                <div className={cn("p-2.5 rounded-xl", kpi.bgColor)}>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main two-column layout ── */}
      <div className="flex-1 grid grid-cols-[1fr_340px] gap-3 p-5 min-h-0">

        {/* Left column: Orchestration Flow + Map */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* Orchestration Flow */}
          <Card className="bg-card border-border shrink-0">
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm font-semibold text-foreground">Orchestration Flow</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-center gap-0">
                {orchSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className={cn(
                      "flex-1 flex flex-col items-center px-4 py-4 rounded-xl border text-center gap-2",
                      step.bg
                    )}>
                      <step.icon className={cn("h-6 w-6", step.color)} />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{step.label}</div>
                        <div className="text-[11px] text-muted-foreground">{step.sub}</div>
                      </div>
                    </div>
                    {i < orchSteps.length - 1 && (
                      <div className="flex items-center px-1 shrink-0">
                        <div className="h-px w-6 bg-border" />
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 -mx-1" />
                        <div className="h-px w-6 bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All agents active — processing 142 documents
              </div>
            </CardContent>
          </Card>

          {/* Global Risk Map */}
          <Card className="bg-card border-border flex-1 min-h-0 overflow-hidden flex flex-col">
            <CardHeader className="pb-2 pt-4 px-5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-sm font-semibold text-foreground">Global Risk Map</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  {statusLegend.map(({ status, color }) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(filterStatus === status ? null : status)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-colors",
                        filterStatus === status ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
                      {status}
                    </button>
                  ))}
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 ml-1" onClick={() => setFilterStatus(null)}>
                    <Filter className="h-3 w-3" /> Filter
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Geographic distribution of supplier risks</p>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-0">
              <ComposableMap
                projectionConfig={{ scale: 147, rotate: [-10, 0, 0], center: [10, 10] }}
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#1e293b"
                        stroke="#0f172a"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#263548", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
                {visibleMarkers.map((s) => {
                  const hovered = hoveredSupplier?.name === s.name;
                  const color = statusColors[s.status];
                  return (
                    <Marker key={s.name} coordinates={s.coords} onMouseEnter={() => setHoveredSupplier(s)} onMouseLeave={() => setHoveredSupplier(null)}>
                      {hovered && <circle r={10} fill={color} opacity={0.2} />}
                      <circle r={hovered ? 5.5 : 4} fill={color} stroke={hovered ? "#fff" : "rgba(0,0,0,0.5)"} strokeWidth={hovered ? 1.5 : 0.7} style={{ cursor: "pointer" }} />
                    </Marker>
                  );
                })}
              </ComposableMap>

              {/* Hover tooltip */}
              {hoveredSupplier && (
                <div className="absolute top-3 left-4 bg-slate-900/95 border border-border rounded-lg px-3 py-2 text-xs pointer-events-none shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: statusColors[hoveredSupplier.status] }} />
                    <span className="font-semibold text-foreground">{hoveredSupplier.name}</span>
                  </div>
                  <div className="text-muted-foreground mt-0.5">{hoveredSupplier.spend} annual spend · <span style={{ color: statusColors[hoveredSupplier.status] }}>{hoveredSupplier.status}</span></div>
                </div>
              )}

              {/* Bottom legend */}
              <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-4">
                  {statusLegend.map(({ status, color }) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                      <span className="text-[10px] text-muted-foreground">{status}</span>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">{visibleMarkers.length} suppliers shown</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Live Agent Feed */}
        <Card className="bg-card border-border flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="pb-0 pt-4 px-4 shrink-0 border-b border-border">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm font-semibold text-foreground">Live Agent Feed</CardTitle>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
          </CardHeader>
          <div ref={feedRef} className="flex-1 overflow-y-auto min-h-0">
            {agentEvents.map((event, i) => (
              <AgentFeedItem key={event.id} event={event} isNew={i === 0} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
