import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileSearch,
  GitMerge,
  ClipboardList,
  Shield,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import helmLogo from "@assets/Helm_logo_white-removebg-preview_1769959269995.png";

const stats = [
  { value: "30–70%", label: "of supplier revenue tied up in pricing agreements" },
  { value: "35+ days", label: "average lag before rebates are recognized" },
  { value: "$1M+", label: "in unclaimed credits per $50M spend" },
];

const pipeline = [
  {
    step: "01",
    icon: Upload,
    title: "Data Import",
    desc: "Upload contracts, sales data, supplier AP, and claim outcomes — no integration required.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    step: "02",
    icon: FileSearch,
    title: "Contract Ingestion",
    desc: "AI extracts pricing tiers, rebate structures, and payment terms from every contract.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    step: "03",
    icon: GitMerge,
    title: "Matching Engine",
    desc: "Three-way line match against sales data and supplier AP to surface every discrepancy.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    step: "04",
    icon: ClipboardList,
    title: "Recovery Workflow",
    desc: "Track, age, and file claims. Every dollar owed — accounted for and pursued.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(222,30%,6%)] text-white overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(215,15%,20%) 1px, transparent 0)",
          backgroundSize: "40px 40px",
          opacity: 0.25,
        }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center p-1.5">
            <img src={helmLogo} alt="Helm" className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Helm</span>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm gap-2">
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 md:pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-8">
            <CheckCircle2 className="h-3.5 w-3.5" />
            AI-powered SPA reconciliation
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              Recover every rebate.
            </span>
            <br />
            <span className="bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Pay only what's owed.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Helm automates the full SPA lifecycle — contract ingestion, three-way line matching, and claim submission — so your finance team recovers every dollar without the manual grind.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/dashboard">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-base px-8 h-12 gap-2 rounded-xl shadow-lg shadow-emerald-500/20">
                See the Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/integrations">
              <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-base px-8 h-12 gap-2 rounded-xl">
                <Upload className="h-4 w-4" />
                Upload Your Data
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-0 mb-20 w-full max-w-3xl"
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 text-center px-8 py-6 relative">
              {i < stats.length - 1 && (
                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-white/10" />
              )}
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-white/40 leading-snug max-w-[140px] mx-auto">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Pipeline steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="w-full max-w-5xl"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 text-center mb-8">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 + i * 0.1 }}
                className={`p-5 rounded-2xl border backdrop-blur-sm ${item.bg} hover:brightness-110 transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-[10px] font-mono text-white/20">{item.step}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-16 flex items-center gap-6 text-white/20 text-xs"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <span>No integration required — CSV & PDF upload</span>
          <div className="h-3 w-px bg-white/10" />
          <span>Built for finance teams</span>
        </motion.div>
      </div>
    </div>
  );
}
