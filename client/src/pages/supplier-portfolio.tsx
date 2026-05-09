import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  Filter,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────
type RiskLevel = "Low" | "Medium" | "High";
type TrendType = "up" | "stable" | "risk";

interface Supplier {
  id: string;
  initials: string;
  name: string;
  category: string;
  invoices: number;
  spend: string;
  spendRaw: number;
  health: number;
  trend: TrendType;
  risk: RiskLevel;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const suppliers: Supplier[] = [
  { id: "acme",       initials: "AM", name: "ACME Manufacturing",   category: "Manufacturing", invoices: 48, spend: "$3.8M",  spendRaw: 3800000, health: 87, trend: "up",     risk: "Low"    },
  { id: "carrier",    initials: "CA", name: "Carrier Global",       category: "Manufacturing", invoices: 42, spend: "$3.1M",  spendRaw: 3100000, health: 91, trend: "up",     risk: "Low"    },
  { id: "trane",      initials: "TR", name: "Trane Technologies",   category: "Manufacturing", invoices: 36, spend: "$2.4M",  spendRaw: 2400000, health: 83, trend: "up",     risk: "Low"    },
  { id: "lennox",     initials: "LE", name: "Lennox International", category: "Manufacturing", invoices: 24, spend: "$1.8M",  spendRaw: 1800000, health: 72, trend: "stable", risk: "Medium" },
  { id: "rheem",      initials: "RH", name: "Rheem Manufacturing",  category: "Manufacturing", invoices: 31, spend: "$1.5M",  spendRaw: 1500000, health: 68, trend: "stable", risk: "Medium" },
  { id: "mitsubishi", initials: "ME", name: "Mitsubishi Electric",  category: "Manufacturing", invoices: 19, spend: "$1.2M",  spendRaw: 1200000, health: 85, trend: "up",     risk: "Low"    },
  { id: "honeywell",  initials: "HW", name: "Honeywell Building",   category: "Technology",    invoices: 22, spend: "$1.0M",  spendRaw: 1000000, health: 58, trend: "stable", risk: "Medium" },
  { id: "johnson",    initials: "JC", name: "Johnson Controls",     category: "Manufacturing", invoices: 14, spend: "$960K",  spendRaw:  960000, health: 41, trend: "risk",   risk: "High"   },
  { id: "daikin",     initials: "DA", name: "Daikin Industries",    category: "Manufacturing", invoices: 17, spend: "$780K",  spendRaw:  780000, health: 73, trend: "up",     risk: "Low"    },
  { id: "pacific",    initials: "PH", name: "Pacific HVAC Supply",  category: "Distribution",  invoices: 11, spend: "$640K",  spendRaw:  640000, health: 55, trend: "risk",   risk: "High"   },
  { id: "northeast",  initials: "NC", name: "Northeast Coil Co",    category: "Distribution",  invoices: 8,  spend: "$420K",  spendRaw:  420000, health: 79, trend: "up",     risk: "Low"    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function barColor(h: number) {
  if (h >= 75) return "#10b981";
  if (h >= 55) return "#f59e0b";
  return "#ef4444";
}

const riskBadge: Record<RiskLevel, string> = {
  Low:    "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  Medium: "border-amber-500/40  text-amber-400  bg-amber-500/10",
  High:   "border-red-500/40    text-red-400    bg-red-500/10",
};

const riskFilter: Record<RiskLevel, string> = {
  Low:    "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  Medium: "border-amber-500/40  text-amber-400  bg-amber-500/10",
  High:   "border-red-500/40    text-red-400    bg-red-500/10",
};

function TrendIcon({ trend }: { trend: TrendType }) {
  if (trend === "up")   return <ArrowUpRight  className="h-4 w-4 text-emerald-400" />;
  if (trend === "risk") return <AlertTriangle className="h-4 w-4 text-red-400" />;
  return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const totalCount  = suppliers.length;
const avgHealth   = Math.round(suppliers.reduce((s, x) => s + x.health, 0) / totalCount);
const atRiskCount = suppliers.filter(s => s.risk === "High").length;
const totalSpendM = (suppliers.reduce((s, x) => s + x.spendRaw, 0) / 1_000_000).toFixed(1);

const kpis = [
  { label: "TOTAL SUPPLIERS",  value: String(totalCount),    valueClass: "text-foreground"  },
  { label: "AVG HEALTH SCORE", value: `${avgHealth}%`,       valueClass: "text-emerald-400" },
  { label: "AT RISK",          value: String(atRiskCount),   valueClass: "text-red-400"     },
  { label: "TOTAL SPEND",      value: `$${totalSpendM}M`,    valueClass: "text-foreground"  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SupplierPortfolio() {
  const [search,        setSearch]       = useState("");
  const [activeRisk,    setActiveRisk]   = useState<RiskLevel | null>(null);

  const visible = suppliers.filter(s => {
    const q = search.toLowerCase();
    const matchName = s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    const matchRisk = activeRisk ? s.risk === activeRisk : true;
    return matchName && matchRisk;
  });

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Supplier Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalCount} active suppliers across your supply chain</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map(k => (
          <Card key={k.label} className="bg-card border-border">
            <CardContent className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <p className={cn("text-3xl font-bold mt-2 tracking-tight tabular-nums", k.valueClass)}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supplier table card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">

        {/* Table toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-foreground">All Suppliers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search suppliers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 w-52 text-xs bg-background border-border"
              />
            </div>
            {(["Low", "Medium", "High"] as RiskLevel[]).map(r => (
              <button
                key={r}
                onClick={() => setActiveRisk(activeRisk === r ? null : r)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded border transition-colors",
                  activeRisk === r
                    ? riskFilter[r]
                    : "border-border text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {r}
              </button>
            ))}
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Filter className="h-3 w-3" /> Filter
            </Button>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/40">
          {visible.map(s => {
            const color = barColor(s.health);
            return (
              <Link key={s.id} href={`/supplier-portfolio/${s.id}`}>
                <div className="flex items-center gap-5 px-5 py-4 hover:bg-muted/10 cursor-pointer transition-colors group">

                  {/* Initials */}
                  <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-slate-300">{s.initials}</span>
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-emerald-400 transition-colors leading-tight">
                      {s.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{s.category}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="text-[11px] text-muted-foreground">{s.invoices} invoices</span>
                    </div>
                  </div>

                  {/* Spend */}
                  <div className="text-right w-20 shrink-0">
                    <p className="text-sm font-semibold text-foreground tabular-nums">{s.spend}</p>
                    <p className="text-[10px] text-muted-foreground">annual spend</p>
                  </div>

                  {/* Health bar */}
                  <div className="w-28 shrink-0">
                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.health}%`, background: color }} />
                    </div>
                  </div>

                  {/* Health % */}
                  <div className="w-9 text-right shrink-0">
                    <span className="text-sm font-bold tabular-nums" style={{ color }}>{s.health}%</span>
                  </div>

                  {/* Trend */}
                  <div className="w-5 flex justify-center shrink-0">
                    <TrendIcon trend={s.trend} />
                  </div>

                  {/* Risk badge */}
                  <div className="w-[72px] flex justify-end shrink-0">
                    <Badge variant="outline" className={cn("text-[11px] px-2 py-0.5 font-medium", riskBadge[s.risk])}>
                      {s.risk}
                    </Badge>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                </div>
              </Link>
            );
          })}

          {visible.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No suppliers match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
