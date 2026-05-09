import { useState, useEffect } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  FileText,
  Mail,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  Building,
  Globe,
  Phone,
  MapPin,
  Loader2,
  Sparkles,
  Send,
  BadgeCheck,
  X,
  ArrowRightLeft,
  Heart,
  MessageSquare,
  CreditCard,
  Landmark,
  Play,
  Search,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SentimentGauge({ value, size = 180 }: { value: number; size?: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const angle = (animatedValue / 100) * 180;
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#eab308" : "#ef4444";
  const label = value >= 70 ? "Healthy" : value >= 40 ? "Cautious" : "Frustrated";

  const startAngle = -90;
  const endAngle = startAngle + angle;
  const radStart = (startAngle * Math.PI) / 180;
  const radEnd = (endAngle * Math.PI) / 180;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size / 2 - 20;

  const x1 = cx + radius * Math.cos(radStart);
  const y1 = cy + radius * Math.sin(radStart);
  const x2 = cx + radius * Math.cos(radEnd);
  const y2 = cy + radius * Math.sin(radEnd);
  const largeArc = angle > 180 ? 1 : 0;

  const bgX1 = cx + radius * Math.cos((-90 * Math.PI) / 180);
  const bgY1 = cy + radius * Math.sin((-90 * Math.PI) / 180);
  const bgX2 = cx + radius * Math.cos((90 * Math.PI) / 180);
  const bgY2 = cy + radius * Math.sin((90 * Math.PI) / 180);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <path
          d={`M ${bgX1} ${bgY1} A ${radius} ${radius} 0 1 1 ${bgX2} ${bgY2}`}
          fill="none"
          stroke="currentColor"
          className="text-muted/20"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {animatedValue > 0 && (
          <path
            d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color}60)`,
              transition: "all 1.5s ease-out",
            }}
          />
        )}
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">{animatedValue}</span>
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Sentiment Score</span>
      </div>
    </div>
  );
}

function RadialProgressBar({ value, size = 140, strokeWidth = 12 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? "#22c55e" : value >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" className="text-muted/30" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="radial-progress-animate transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
}

function AIProcessingAnimation({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { icon: Mail, label: "Ingesting supplier emails & tickets...", source: "Inbox" },
    { icon: FileText, label: "Scanning ERP payment records...", source: "SAP ERP" },
    { icon: Shield, label: "Reviewing contract clauses...", source: "CLM System" },
    { icon: Brain, label: "Synthesizing intelligence...", source: "Helm AI" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        if (stepIndex !== currentStep && stepIndex < steps.length) {
          setCurrentStep(stepIndex);
        }
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return newProgress;
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Brain className="h-5 w-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Intelligence Engine</p>
            <p className="text-xs text-muted-foreground">Processing supplier data across sources</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isComplete = idx < currentStep || progress >= 100;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: isActive || isComplete ? 1 : 0.4 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                  isActive ? "bg-emerald-500/5 border border-emerald-500/20" :
                  isComplete ? "bg-accent/30" : ""
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-md",
                  isComplete ? "bg-emerald-500/10" : isActive ? "bg-blue-500/10" : "bg-muted"
                )}>
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  ) : (
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", isActive || isComplete ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0 border-border text-muted-foreground">
                  {step.source}
                </Badge>
              </motion.div>
            );
          })}
        </div>

        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">{progress}% complete</p>
      </CardContent>
    </Card>
  );
}

function OrchestrationModal({ isOpen, onClose }: { isOpen: boolean; onClose: (resolved: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const steps = [
    { icon: Mail, label: "Reading supplier email...", detail: "Detected frustration about payment terms — tone score 32/100", color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: FileText, label: "Credit note discovered", detail: "CN-2026-0091: $50,000 credit note matched against INV-2026-0847", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Landmark, label: "Embedded financing triggered", detail: "Tradeshift Capital approved $200K facility at 1.5% APR", color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: CheckCircle, label: "Terms updated & relationship restored", detail: "Net-30 → Net-60 shift applied. Sentiment score: 32 → 78", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  const handleExecute = () => {
    setIsRunning(true);
    setStep(0);
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRunning(false);
            setIsComplete(true);
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose(false)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Zap className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Execute Orchestration</h2>
                <p className="text-sm text-muted-foreground">ACME Manufacturing — Supplier A</p>
              </div>
            </div>
            <button onClick={() => onClose(isComplete)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isComplete ? (
            <>
              {!isRunning ? (
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Detected Conflict</p>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          "We've been waiting over 12 days past our agreed terms for the third time this quarter. If this continues, we'll need to reassess our pricing structure and consider other partners."
                        </p>
                        <p className="text-[10px] text-red-400 mt-2">— James Wilson, VP Sales, ACME Manufacturing</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">Outstanding Invoice</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">$100,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-blue-400">Hidden Credit Note</span>
                      </div>
                      <span className="text-sm font-bold text-blue-400">$50,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">Discount Available (2%)</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">+$2,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <Landmark className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-amber-400">Financing Cost (1.5% APR)</span>
                      </div>
                      <span className="text-sm font-bold text-amber-400">-$1,500</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Net Arbitrage Profit</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">+$500</span>
                    </div>
                  </div>

                  <Button onClick={handleExecute} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-base font-semibold">
                    <Play className="mr-2 h-5 w-5" />
                    Execute Orchestration
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {steps.map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={idx <= step ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all",
                        idx < step ? "bg-accent/30 border-border/50" :
                        idx === step ? cn(s.bg, "border-emerald-500/30") :
                        "opacity-20 border-transparent"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg shrink-0", s.bg)}>
                        {idx < step ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : idx === step ? (
                          <Loader2 className={cn("h-4 w-4 animate-spin", s.color)} />
                        ) : (
                          <s.icon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", idx <= step ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
                        {idx <= step && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground mt-1">
                            {s.detail}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <BadgeCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Orchestration Complete</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Relationship restored. Terms shifted to Net-60. $50K credit applied. Financing secured.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/50">
                  <p className="text-[10px] text-muted-foreground">Terms</p>
                  <p className="text-sm font-bold text-foreground">Net-30 → Net-60</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/50">
                  <p className="text-[10px] text-muted-foreground">Credit Applied</p>
                  <p className="text-sm font-bold text-blue-400">$50,000</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/50">
                  <p className="text-[10px] text-muted-foreground">Financing</p>
                  <p className="text-sm font-bold text-amber-400">$200K @ 1.5%</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <p className="text-[10px] text-muted-foreground">Sentiment</p>
                  <p className="text-sm font-bold text-emerald-400">32 → 78</p>
                </div>
              </div>
              <Button onClick={() => onClose(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                Done
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


export default function SupplierIntelligence() {
  const [showProcessing, setShowProcessing] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [intelligenceLoaded, setIntelligenceLoaded] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [sentimentScore, setSentimentScore] = useState(32);
  const [healthScore, setHealthScore] = useState(72);

  const handleProcessingComplete = () => {
    setShowProcessing(false);
    setIntelligenceLoaded(true);
  };

  const handleModalClose = (resolved: boolean) => {
    setShowModal(false);
    if (resolved) {
      setIsResolved(true);
      setSentimentScore(78);
      setHealthScore(94);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">ACME Manufacturing</h1>
            <Badge className={cn(
              isResolved
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}>
              {isResolved ? "Relationship Restored" : "At Risk"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Supplier Intelligence Deep Dive — Supplier A</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className={cn(
            "px-6 py-5 text-sm font-semibold shadow-lg",
            isResolved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
          )}
          disabled={!intelligenceLoaded || isResolved}
        >
          {isResolved ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Orchestration Complete
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Execute Orchestration
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-xl font-bold mb-4">
                  AM
                </div>
                <h2 className="text-lg font-bold text-foreground">ACME Manufacturing</h2>
                <p className="text-sm text-muted-foreground">Industrial Components & Parts</p>
              </div>

              <div className="flex justify-center mb-4">
                <RadialProgressBar value={healthScore} />
              </div>
              <p className="text-xs text-center text-muted-foreground mb-6">Relationship Health Score</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Industry:</span>
                  <span className="text-foreground font-medium ml-auto">Manufacturing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground font-medium ml-auto">Chicago, IL</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="text-foreground font-medium ml-auto">James Wilson</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Annual Spend:</span>
                  <span className="text-foreground font-medium ml-auto">$2.4M</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Relationship:</span>
                  <span className="text-foreground font-medium ml-auto">4 years</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-400" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <SentimentGauge value={sentimentScore} />
              </div>
              <p className="text-xs text-center text-muted-foreground mb-4">Based on ingested emails & support tickets</p>

              {!isResolved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">Frustrated Email Detected</p>
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        "We've been waiting over 12 days past our agreed terms for the third time this quarter..."
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {isResolved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">Sentiment Improved</p>
                      <p className="text-[11px] text-muted-foreground">Score improved from 32 to 78 after orchestration</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Risk</span>
                  <Badge variant="outline" className={cn(
                    isResolved
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                      : "border-amber-500/30 text-amber-400 bg-amber-500/5"
                  )}>
                    {isResolved ? "Low" : "Medium"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Supply Chain Risk</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">Low</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Compliance Risk</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">Low</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sentiment Risk</span>
                  <Badge variant="outline" className={cn(
                    isResolved
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                      : "border-red-500/30 text-red-400 bg-red-500/5"
                  )}>
                    {isResolved ? "Low" : "High"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {showProcessing && (
            <AIProcessingAnimation onComplete={handleProcessingComplete} />
          )}

          {intelligenceLoaded && (
            <>
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Brain className="h-5 w-5 text-emerald-400" />
                    Intelligence Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 rounded-xl bg-accent/30 border border-border"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Mail className="h-4 w-4 text-purple-400" />
                        </div>
                        <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/5">
                          Email / Inbox
                        </Badge>
                        <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                        <span className="text-xs text-muted-foreground">5 hours ago</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">Sentiment Analysis:</span> Communication tone trending negative over last 2 weeks. 3 escalated emails detected.
                        </p>
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-red-400 font-semibold">Key Finding:</p>
                              <p className="text-xs text-muted-foreground italic mt-1">
                                "We've been waiting over 12 days past our agreed terms for the third time this quarter. If this continues, we'll need to reassess our pricing structure and consider other partners."
                              </p>
                              <p className="text-[10px] text-red-400 mt-1.5">Ticket #4892 — Escalated to VP Level</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 rounded-xl bg-accent/30 border border-border"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/5">
                          ERP System (SAP)
                        </Badge>
                        <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                        <span className="text-xs text-muted-foreground">Real-time</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">Payment History:</span> 12 invoices in last 6 months. Average payment: 32 days (2 days late vs Net 30 terms).
                        </p>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                          <p className="text-sm text-amber-400">
                            <span className="font-semibold">Upcoming Invoice:</span> $100,000 (INV-2026-0847) due in 8 days
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 rounded-xl bg-accent/30 border border-border"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <Shield className="h-4 w-4 text-emerald-400" />
                        </div>
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                          Contract (CLM)
                        </Badge>
                        <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                        <span className="text-xs text-muted-foreground">Contract scan</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">Contract Terms:</span> Master Supply Agreement (MSA-2024-112), renewed Feb 2025.
                        </p>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                          <p className="text-sm text-emerald-400">
                            <span className="font-semibold">AI Discovery:</span> 2/10 Net 30 discount clause found — pay within 10 days for 2% discount. Currently unused.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                          <p className="text-sm text-blue-400">
                            <span className="font-semibold">Hidden Credit:</span> Credit Note CN-2026-0091 ($50,000) matched against INV-2026-0847.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 shrink-0">
                      <Brain className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-2">AI Recommendation Summary</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {isResolved
                          ? "Orchestration complete. Net-30 → Net-60 term shift applied via embedded financing. $50K credit note applied. Sentiment score improved from 32 to 78. Relationship restored."
                          : "Based on cross-source analysis: Execute orchestration to read the frustrated email, apply the $50K credit note, trigger embedded financing, and shift terms to Net-60. This resolves the payment lag and restores the relationship."
                        }
                      </p>
                      {!isResolved && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => setShowModal(true)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-5 text-sm font-semibold shadow-lg shadow-emerald-500/20"
                            >
                              <Zap className="mr-2 h-5 w-5" />
                              Execute Orchestration
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Why pay early? To secure long-term capital efficiency and strengthen this 4-year supplier relationship.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {isResolved && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <Heart className="h-5 w-5 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-400">Relationship Restored — All Issues Resolved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Embedded Financing</h2>
        <p className="text-sm text-muted-foreground mb-4">Select payment terms for open invoices across your supplier portfolio.</p>
        <InvoiceFinancingCard supplierName="ACME Manufacturing" invoiceId="INV-2026-0847" amount={100000} />
      </div>

      <OrchestrationModal isOpen={showModal} onClose={handleModalClose} />
    </div>
  );
}

type InvoicePaymentOption = "now" | "installments" | "later";
type InvoiceInstallmentTerm = 2 | 3;
type InvoiceLaterTerm = 30 | 45 | 60 | 90;

function InvoiceFinancingCard({ supplierName, invoiceId, amount }: { supplierName: string; invoiceId: string; amount: number }) {
  const [selected, setSelected] = useState<InvoicePaymentOption>("installments");
  const [installmentTerm, setInstallmentTerm] = useState<InvoiceInstallmentTerm>(2);
  const [laterTerm, setLaterTerm] = useState<InvoiceLaterTerm>(45);

  const installmentInterest = 0.015;
  const installmentTotal = amount * (1 + installmentInterest);
  const downPayment = installmentTotal / installmentTerm;

  const laterInterest = 0.015;
  const laterTotal = amount * (1 + laterInterest);

  const getButtonText = () => {
    if (selected === "now") return `Pay $${amount.toLocaleString()} Now`;
    if (selected === "installments") return `Pay over ${installmentTerm} months`;
    return `Pay in ${laterTerm} days`;
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Short-Term Financing in Seconds</p>
        <h3 className="text-lg font-bold text-foreground mb-0.5">
          How would you like to finance this ${amount.toLocaleString()}.00 purchase?
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{supplierName} · {invoiceId}</p>
          <button className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1">
            Review your credit limits
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <div
          onClick={() => setSelected("now")}
          className={cn(
            "w-full rounded-xl border p-4 text-left transition-all cursor-pointer",
            selected === "now"
              ? "border-orange-500 bg-orange-500/5"
              : "border-border bg-card hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                selected === "now" ? "border-orange-500" : "border-muted-foreground/40"
              )}>
                {selected === "now" && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
              </div>
              <span className="text-sm font-semibold text-foreground">Pay now</span>
            </div>
            <span className="text-xs font-medium text-emerald-400">No interest</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 ml-8">${amount.toLocaleString()}.00</p>
          <p className="text-xs text-muted-foreground ml-8">due today*</p>
        </div>

        <div
          onClick={() => setSelected("installments")}
          className={cn(
            "w-full rounded-xl border p-4 text-left transition-all cursor-pointer",
            selected === "installments"
              ? "border-orange-500 bg-orange-500/5"
              : "border-border bg-card hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                selected === "installments" ? "border-orange-500" : "border-muted-foreground/40"
              )}>
                {selected === "installments" && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
              </div>
              <span className="text-sm font-semibold text-foreground">Pay in installments</span>
            </div>
            <div className="flex items-center gap-1.5">
              {([2, 3] as InvoiceInstallmentTerm[]).map((term) => (
                <button
                  key={term}
                  onClick={(e) => { e.stopPropagation(); setSelected("installments"); setInstallmentTerm(term); }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    installmentTerm === term && selected === "installments"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-border text-muted-foreground hover:border-orange-500/50"
                  )}
                >
                  {term} months
                </button>
              ))}
              <span className="text-xs font-medium text-orange-400 ml-2">{(installmentInterest * 100).toFixed(1)}% interest</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 ml-8">${installmentTotal.toLocaleString()}.00</p>
          <p className="text-xs text-muted-foreground ml-8">${downPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} down due today*</p>
        </div>

        <div
          onClick={() => setSelected("later")}
          className={cn(
            "w-full rounded-xl border p-4 text-left transition-all cursor-pointer",
            selected === "later"
              ? "border-orange-500 bg-orange-500/5"
              : "border-border bg-card hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                selected === "later" ? "border-orange-500" : "border-muted-foreground/40"
              )}>
                {selected === "later" && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
              </div>
              <span className="text-sm font-semibold text-foreground">Pay later</span>
            </div>
            <div className="flex items-center gap-1.5">
              {([30, 45, 60, 90] as InvoiceLaterTerm[]).map((term) => (
                <button
                  key={term}
                  onClick={(e) => { e.stopPropagation(); setSelected("later"); setLaterTerm(term); }}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                    laterTerm === term && selected === "later"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-border text-muted-foreground hover:border-orange-500/50"
                  )}
                >
                  Net {term}
                </button>
              ))}
              <span className="text-xs font-medium text-orange-400 ml-2">{(laterInterest * 100).toFixed(1)}% interest</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 ml-8">${laterTotal.toLocaleString()}.00</p>
          <p className="text-xs text-muted-foreground ml-8">due in {laterTerm} days*</p>
        </div>

        <button className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-4">
          {getButtonText()}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          *Amounts shown do not include payment processing fees.
        </p>
      </div>
    </Card>
  );
}
