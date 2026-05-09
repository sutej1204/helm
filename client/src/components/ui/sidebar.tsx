import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  RotateCcw,
  Shield,
  Eye,
  Banknote,
  Brain,
  FileText,
  Database,
  List,
  Plug,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Home,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import helmLogo from "@assets/Helm_logo_white-removebg-preview_1769959269995.png";
import { useState } from "react";

interface NavSection {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  children: { name: string; href: string }[];
}

const valueSections: NavSection[] = [
  {
    label: "RECOVERY",
    icon: RotateCcw,
    color: "text-emerald-400",
    href: "/recovery",
    children: [
      { name: "AP Inbox",            href: "/ap-inbox" },
      { name: "Recovery Queue",      href: "/recovery/queue" },
      { name: "4-Way Invoice Match", href: "/recovery/4-way-match" },
      { name: "Settlement Audit",    href: "/recovery/settlement-audit" },
      { name: "Claim Recovery",      href: "/recovery/claim-recovery" },
      { name: "Unapplied Cash",      href: "/recovery/unapplied-cash" },
    ],
  },
  {
    label: "PREVENTION",
    icon: Shield,
    color: "text-blue-400",
    href: "/prevention",
    children: [
      { name: "Expected Credit Engine", href: "/prevention/expected-credit-engine" },
      { name: "Claim Studio", href: "/prevention/claim-studio" },
      { name: "Real-time Accruals", href: "/prevention/accruals" },
      { name: "Pricing Audit", href: "/prevention/pricing-audit" },
    ],
  },
  {
    label: "VISIBILITY",
    icon: Eye,
    color: "text-amber-400",
    href: "/visibility",
    children: [
      { name: "Cash Flow Forecast", href: "/visibility/cash-flow-forecast" },
      { name: "Margin Attribution", href: "/visibility/margin-attribution" },
      { name: "Settlement Pipeline", href: "/visibility/settlement-pipeline" },
    ],
  },
  {
    label: "FINANCING",
    icon: Banknote,
    color: "text-purple-400",
    href: "/financing",
    children: [
      { name: "Recovery Advance", href: "/financing/recovery-advance" },
      { name: "Payment Term Extension", href: "/financing/payment-term-extension" },
      { name: "AP BNPL", href: "/financing/ap-bnpl" },
    ],
  },
  {
    label: "INTELLIGENCE",
    icon: Brain,
    color: "text-rose-400",
    href: "/intelligence",
    children: [
      { name: "Rebate Knowledge Graph", href: "/intelligence/rebate-knowledge-graph" },
      { name: "Industry Benchmarks", href: "/intelligence/benchmarks" },
      { name: "Contract Library", href: "/intelligence/contract-library" },
    ],
  },
];

const adminItems = [
  { name: "Supplier Portfolio", href: "/supplier-portfolio", icon: Users },
  { name: "Master Data", href: "/master-data", icon: Database },
  { name: "Transaction Browser", href: "/transactions", icon: List },
  { name: "Integrations", href: "/integrations", icon: Plug },
];

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Auto-expand the section matching current route
    const initial: Record<string, boolean> = {};
    for (const s of valueSections) {
      if (location.startsWith(s.href)) initial[s.label] = true;
    }
    return initial;
  });

  const toggle = (label: string) => setExpanded(prev => ({ ...prev, [label]: !prev[label] }));

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div className={cn("hidden md:flex md:w-60 md:flex-col", className)}>
      <div className="flex flex-col flex-grow bg-card border-r border-border pb-4 overflow-y-auto scrollbar-hide">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 pt-5 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-1.5 mr-3">
            <img src={helmLogo} alt="Helm" className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">Helm</h1>
        </div>

        {/* Command Center */}
        <div className="px-3 mb-1">
          <Link href="/dashboard">
            <div className={cn(
              "group flex items-center px-3 py-2 text-sm font-semibold rounded-md cursor-pointer transition-all duration-150 border-l-2",
              isActive("/dashboard")
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-400"
                : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent"
            )}>
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Command Center
            </div>
          </Link>
        </div>

        {/* Separator */}
        <div className="px-4 mt-3 mb-2">
          <div className="h-px bg-border" />
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 mt-2">Value Creation</p>
        </div>

        {/* 5 Value Tool Sections */}
        <nav className="flex-1 px-3 space-y-0.5">
          {valueSections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expanded[section.label];
            const isSectionActive = isActive(section.href);

            return (
              <div key={section.label}>
                {/* Section header */}
                <div
                  className={cn(
                    "group flex items-center px-3 py-2 text-xs font-semibold rounded-md cursor-pointer transition-all duration-150 border-l-2 select-none",
                    isSectionActive
                      ? "bg-slate-800/60 border-l-2"
                      : "text-muted-foreground hover:bg-accent border-transparent"
                  )}
                  onClick={() => toggle(section.label)}
                >
                  <SectionIcon className={cn("mr-2 h-4 w-4", section.color)} />
                  <span className={cn("flex-1 tracking-wider", isSectionActive ? section.color : "")}>{section.label}</span>
                  {isExpanded
                    ? <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                    : <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                  }
                </div>

                {/* Children */}
                {isExpanded && (
                  <div className="ml-2 mt-0.5 mb-1 space-y-0.5">
                    {section.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        <div className={cn(
                          "flex items-center pl-7 pr-3 py-1.5 text-xs rounded-md cursor-pointer transition-all duration-150 border-l-2",
                          isActive(child.href)
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-400 font-medium"
                            : "text-muted-foreground/80 hover:bg-accent hover:text-foreground border-transparent"
                        )}>
                          {child.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Separator */}
          <div className="px-1 pt-3 pb-2">
            <div className="h-px bg-border" />
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 mt-2">Admin</p>
          </div>

          {/* Admin items */}
          {adminItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "group flex items-center px-3 py-2 text-xs font-medium rounded-md cursor-pointer transition-all duration-150 border-l-2 uppercase tracking-wide",
                  isActive(item.href)
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent"
                )}>
                  <ItemIcon className="mr-3 h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="flex-shrink-0 px-4 pt-4 border-t border-border mt-2">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                AM
              </div>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">Alex Morgan</div>
              <div className="text-[10px] text-muted-foreground">CFO</div>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto rounded-full text-muted-foreground hover:text-foreground h-7 w-7">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
