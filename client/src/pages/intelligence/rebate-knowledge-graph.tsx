import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Zap, Filter } from "lucide-react";

// Carrier ContractorPro SPA eligibility graph — visual representation
const programDetails = {
  code: "CARR-SPA-2024-CONTRACTOR",
  name: "ContractorPro SPA",
  supplier: "Carrier Global",
  rate: "5% base / 7% tier-2 (>$500k)",
  cap: "$250,000",
  deadline: "45 days post-period",
  ingestionConfidence: 97,
};

const eligibilityNodes = [
  {
    id: "root",
    type: "program",
    label: "ContractorPro SPA",
    subLabel: "CARR-SPA-2024-CONTRACTOR",
    color: "border-rose-500/50 bg-rose-500/5",
    textColor: "text-rose-400",
  },
];

const skuNodes = [
  { sku: "CARR-25HC", desc: "Comfort 25HC Unit", eligible: true, units: 85, volume: 153000 },
  { sku: "CARR-38HD", desc: "38HD Heat Pump", eligible: true, units: 63, volume: 132300 },
  { sku: "CARR-40RU", desc: "40RU Rooftop", eligible: true, units: 5, volume: 20500 },
  { sku: "CARR-PARTS-001", desc: "Filter Kit", eligible: false, reason: "Excluded: parts prefix" },
  { sku: "CARR-PARTS-002", desc: "Thermostat Wire", eligible: false, reason: "Excluded: parts prefix" },
];

const customerClassNodes = [
  { class: "contractor", eligible: true, customers: ["Apex Mechanical", "BlueSky HVAC", "StarAir Solutions", "Peak HVAC"], salesVolume: 246800 },
  { class: "commercial", eligible: false, reason: "Customer class not in eligible list", customers: ["Metro Commercial", "Crestwood Buildings", "Harbor Climate"] },
  { class: "residential", eligible: false, reason: "Excluded: residential class", customers: [] },
];

const tierStructure = [
  { threshold: 0, rate: 5.0, label: "Base (0 – $499,999)", current: true, currentVolume: 246800 },
  { threshold: 500000, rate: 7.0, label: "Tier-2 ($500k+)", current: false, delta: 253200 },
];

const exclusionRules = [
  { rule: "No SKU prefix CARR-PARTS", impact: "2 SKUs excluded", source: "Agreement §3.1(b)" },
  { rule: "Customer class must be 'contractor'", impact: "Commercial & residential excluded", source: "Agreement §3.1(a)" },
  { rule: "Per-unit cap: $250,000 program cap", impact: "Capped at $250k total", source: "Agreement §4.5" },
];

const qaResults = [
  { question: "Which SKUs qualify for ContractorPro SPA?", answer: "CARR-25HC, CARR-38HD, CARR-40RU — parts (CARR-PARTS-*) are excluded per §3.1(b).", confidence: 97 },
  { question: "What customer classes are eligible?", answer: "Only 'contractor' class. Commercial and residential are excluded. GPO-Northeast customers qualify as contractors.", confidence: 95 },
  { question: "At what volume does tier-2 kick in?", answer: "Tier-2 (7%) activates when eligible sales exceed $500k in the program period. Current Q2 volume: $246,800 — $253,200 short.", confidence: 98 },
  { question: "What is the claim deadline?", answer: "45 days from program period end (§8.2). Q2 closes Jun 30 → deadline Aug 14, 2024.", confidence: 99 },
];

export default function RebateKnowledgeGraph() {
  const [selectedTab, setSelectedTab] = useState<"graph" | "qa" | "extraction">("graph");
  const [qaInput, setQaInput] = useState("");
  const [qaAnswer, setQaAnswer] = useState<typeof qaResults[0] | null>(null);

  const handleQa = () => {
    const lower = qaInput.toLowerCase();
    const match = qaResults.find(q =>
      lower.includes("sku") && q.question.includes("SKU") ||
      lower.includes("customer") && q.question.includes("customer") ||
      lower.includes("tier") && q.question.includes("tier") ||
      lower.includes("deadline") && q.question.includes("deadline")
    ) || qaResults[Math.floor(Math.random() * qaResults.length)];
    setQaAnswer(match);
  };

  const eligibleSkuVolume = skuNodes.filter(s => s.eligible).reduce((sum, s) => sum + (s.volume || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Rebate Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground">Contract terms ingested into a queryable eligibility graph — ask questions, get answers</p>
        </div>
        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">{programDetails.ingestionConfidence}% confidence</Badge>
      </div>

      {/* Program header */}
      <Card className="bg-card border-border border-rose-500/30 bg-rose-500/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Program", value: programDetails.name },
              { label: "Code", value: programDetails.code },
              { label: "Rate", value: programDetails.rate },
              { label: "Deadline", value: programDetails.deadline },
            ].map(f => (
              <div key={f.label}>
                <div className="text-xs text-muted-foreground">{f.label}</div>
                <div className="text-xs font-medium text-foreground mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "graph", label: "Eligibility Graph" },
          { id: "qa", label: "Q&A Interface" },
          { id: "extraction", label: "Extraction Detail" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedTab === tab.id ? "bg-rose-500/20 text-rose-400" : "text-muted-foreground hover:bg-muted/40"}`}
            onClick={() => setSelectedTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === "graph" && (
        <div className="space-y-4">
          {/* Graph visualization */}
          <div className="grid grid-cols-3 gap-6">
            {/* SKU eligibility */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  SKU Eligibility Layer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {skuNodes.map((sku) => (
                  <div key={sku.sku} className={`flex items-start gap-2 p-2 rounded border ${sku.eligible ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    {sku.eligible ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-medium truncate">{sku.sku}</div>
                      <div className="text-[10px] text-muted-foreground">{sku.eligible ? `${sku.units} units · $${sku.volume?.toLocaleString()}` : sku.reason}</div>
                    </div>
                  </div>
                ))}
                <div className="pt-1 border-t border-border flex justify-between text-xs">
                  <span className="text-muted-foreground">Eligible volume</span>
                  <span className="font-semibold text-emerald-400">${eligibleSkuVolume.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer class layer */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  Customer Class Layer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {customerClassNodes.map((cc) => (
                  <div key={cc.class} className={`p-2 rounded border ${cc.eligible ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {cc.eligible ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                      <code className="text-xs font-semibold">{cc.class}</code>
                    </div>
                    {cc.eligible ? (
                      <div className="text-[10px] text-muted-foreground">{cc.customers.slice(0, 3).join(", ")}</div>
                    ) : (
                      <div className="text-[10px] text-red-400">{cc.reason}</div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tier structure */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                  Rate / Tier Layer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tierStructure.map((tier) => (
                  <div key={tier.label} className={`p-2.5 rounded border ${tier.current ? "border-emerald-500/30 bg-emerald-500/5" : "border-blue-500/20 bg-blue-500/5"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{tier.rate}% rate</span>
                      {tier.current ? <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Active</Badge> : <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">Next</Badge>}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{tier.label}</div>
                    {!tier.current && tier.delta && (
                      <div className="text-[10px] text-blue-400 mt-0.5">+${tier.delta.toLocaleString()} needed to unlock</div>
                    )}
                    {tier.current && (
                      <div className="mt-1.5 h-1.5 bg-muted/30 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(eligibleSkuVolume / 500000 * 100, 100).toFixed(0)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
                <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded text-[10px] text-amber-300">
                  Unlock tier-2: +$253,200 more eligible sales = +$5,300 in additional credits
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exclusion rules */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Exclusion Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exclusionRules.map((rule) => (
                <div key={rule.rule} className="flex items-center justify-between p-2.5 bg-muted/20 rounded border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs text-foreground">{rule.rule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{rule.impact}</span>
                    <code className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-muted-foreground">{rule.source}</code>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "qa" && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Ask the Knowledge Graph</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-muted/20 border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder='e.g., "Which SKUs qualify?" or "What is the tier-2 threshold?"'
                  value={qaInput}
                  onChange={e => setQaInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleQa()}
                />
                <Button onClick={handleQa} className="bg-rose-600 hover:bg-rose-700 gap-2">
                  <Zap className="h-4 w-4" /> Ask
                </Button>
              </div>
              {qaAnswer && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-rose-300">{qaAnswer.question}</span>
                    <Badge className="bg-rose-500/20 text-rose-400 text-[10px]">{qaAnswer.confidence}% confidence</Badge>
                  </div>
                  <p className="text-sm text-foreground">{qaAnswer.answer}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold">Suggested Questions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {qaResults.map((q) => (
                <button key={q.question} onClick={() => { setQaInput(q.question); setQaAnswer(q); }} className="w-full text-left p-2.5 rounded border border-border hover:border-rose-500/30 hover:bg-rose-500/5 transition-all">
                  <div className="text-xs text-foreground">{q.question}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground truncate">{q.answer.slice(0, 80)}…</span>
                    <Badge className="bg-slate-700/50 text-slate-300 text-[10px] shrink-0">{q.confidence}%</Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "extraction" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold">Raw Extraction from Agreement PDF</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs font-mono">
              {[
                { section: "§3.1(a)", text: "Eligible Products: CARR-25HC, CARR-38HD, CARR-40RU. Parts and accessories (prefix CARR-PARTS) are expressly excluded.", confidence: 97 },
                { section: "§3.1(b)", text: "Eligible Customer Classes: 'contractor' only. Commercial accounts and residential end-users are not eligible for Special Pricing Agreement credits.", confidence: 98 },
                { section: "§4.2", text: "Rate Structure: Base rate 5.0% on eligible net sales. Volume tier: 7.0% on eligible net sales exceeding $500,000 in the program period.", confidence: 96 },
                { section: "§4.5", text: "Program cap: Maximum credit payout shall not exceed $250,000 per program year regardless of eligible volume.", confidence: 99 },
                { section: "§8.2", text: "Claim submission deadline: All claims must be submitted within 45 days of program period end. Late submissions will not be accepted.", confidence: 99 },
              ].map((item) => (
                <div key={item.section} className="p-3 bg-muted/20 rounded border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-rose-400">{item.section}</code>
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">{item.confidence}% confidence</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
