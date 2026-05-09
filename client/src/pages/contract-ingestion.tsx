import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  FileSearch,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Cpu,
  Tag,
  Percent,
  Calendar,
  Building2,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

type ContractStatus = "Extracted" | "Pending Review" | "Reviewed" | "Failed";

type Contract = {
  id: string;
  filename: string;
  supplier: string;
  contractType: string;
  status: ContractStatus;
  extractedAt: string;
  extracted: {
    effectiveDate: string;
    expiryDate: string;
    pricingTiers: string;
    rebateRate: string;
    paymentTerms: string;
    totalValue: string;
    keyTerms: string[];
  } | null;
};

const contracts: Contract[] = [
  {
    id: "CTR-001",
    filename: "Acme_Manufacturing_MSA_2024.pdf",
    supplier: "Acme Manufacturing",
    contractType: "Master Supply Agreement",
    status: "Reviewed",
    extractedAt: "Today, 09:14",
    extracted: {
      effectiveDate: "Jan 1, 2024",
      expiryDate: "Dec 31, 2025",
      pricingTiers: "Tier 1: <$500K @ list; Tier 2: $500K–$2M @ -8%; Tier 3: >$2M @ -14%",
      rebateRate: "2.5% quarterly on spend exceeding $1M",
      paymentTerms: "Net 45",
      totalValue: "$3,200,000",
      keyTerms: ["Most Favored Nation", "Volume Rebate", "Price Escalation Cap 3%"],
    },
  },
  {
    id: "CTR-002",
    filename: "Delta_Supplies_Framework_2024.pdf",
    supplier: "Delta Supplies Co.",
    contractType: "Framework Agreement",
    status: "Extracted",
    extractedAt: "Today, 08:52",
    extracted: {
      effectiveDate: "Mar 1, 2024",
      expiryDate: "Feb 28, 2026",
      pricingTiers: "Fixed price list with quarterly reviews",
      rebateRate: "1.8% semi-annual rebate on total spend",
      paymentTerms: "Net 30",
      totalValue: "$1,800,000",
      keyTerms: ["Fixed Pricing", "Semi-Annual Rebate", "Early Payment Discount 1%"],
    },
  },
  {
    id: "CTR-003",
    filename: "Vertex_Industries_SLA_2023.pdf",
    supplier: "Vertex Industries",
    contractType: "Service Level Agreement",
    status: "Pending Review",
    extractedAt: "Yesterday, 16:40",
    extracted: {
      effectiveDate: "Jun 1, 2023",
      expiryDate: "May 31, 2025",
      pricingTiers: "Standard rate card — no volume tiers",
      rebateRate: "No rebate clause",
      paymentTerms: "Net 60",
      totalValue: "$640,000",
      keyTerms: ["SLA Penalties", "Termination for Convenience", "IP Ownership"],
    },
  },
  {
    id: "CTR-004",
    filename: "NovaTech_Supply_Agreement_2024.xlsx",
    supplier: "NovaTech Corp",
    contractType: "Supply Agreement",
    status: "Pending Review",
    extractedAt: "Yesterday, 14:20",
    extracted: {
      effectiveDate: "Apr 15, 2024",
      expiryDate: "Apr 14, 2026",
      pricingTiers: "Tier 1: <$1M @ list; Tier 2: >$1M @ -6%",
      rebateRate: "3% annual rebate",
      paymentTerms: "Net 45",
      totalValue: "$2,100,000",
      keyTerms: ["Annual Rebate", "Price Protection", "Exclusivity Clause"],
    },
  },
  {
    id: "CTR-005",
    filename: "Pacific_Materials_PO_Terms.pdf",
    supplier: "Pacific Materials",
    contractType: "Purchase Order Terms",
    status: "Failed",
    extractedAt: "2 days ago",
    extracted: null,
  },
];

const statusConfig: Record<ContractStatus, { className: string; icon: React.ElementType }> = {
  Reviewed: { className: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5", icon: CheckCircle2 },
  Extracted: { className: "border-blue-500/30 text-blue-400 bg-blue-500/5", icon: Cpu },
  "Pending Review": { className: "border-amber-500/30 text-amber-400 bg-amber-500/5", icon: Clock },
  Failed: { className: "border-red-500/30 text-red-400 bg-red-500/5", icon: AlertCircle },
};

interface ExtractedTermsResponse {
  effectiveDate?: string | null;
  expiryDate?: string | null;
  pricingTiers?: string | null;
  rebateRate?: string | null;
  paymentTerms?: string | null;
  totalValue?: string | null;
  keyTerms?: string[];
  confidence?: number | null;
  summary?: string | null;
}

const SAMPLE_CONTRACT = `MASTER SUPPLY AGREEMENT — Acme Manufacturing
Effective Date: January 1, 2024
Expiration Date: December 31, 2025
Total Estimated Value: $3,200,000

Pricing Schedule:
  Tier 1 (annual spend below $500,000): list price
  Tier 2 ($500,000–$2,000,000): list less 8%
  Tier 3 (above $2,000,000): list less 14%

Rebate: 2.5% quarterly rebate on annual spend exceeding $1,000,000.

Payment Terms: Net 45 from invoice date.
Other clauses: Most-Favored-Nation, Volume Rebate, Price Escalation Cap 3% per year.`;

function ContractExtractor() {
  const [text, setText] = useState(SAMPLE_CONTRACT);
  const [filename, setFilename] = useState("Acme_Manufacturing_MSA_2024.pdf");
  const [result, setResult] = useState<ExtractedTermsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extract = useMutation({
    mutationFn: async (): Promise<ExtractedTermsResponse> => {
      setError(null);
      const r = await apiRequest("POST", "/api/ai/contracts/extract", { text, filename });
      return r.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (err: Error) => setError(err.message),
  });

  return (
    <Card className="bg-card border-violet-500/30 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Extract with Claude — paste any contract excerpt
          </CardTitle>
          <Badge className="bg-violet-500/20 text-violet-300 border-0 text-[10px]">LIVE</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="text-xs text-muted-foreground">Filename (optional)</label>
            <input
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-muted/30 border border-border rounded-md text-foreground"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex items-end justify-end">
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-500 gap-1.5"
              onClick={() => extract.mutate()}
              disabled={extract.isPending || text.trim().length < 30}
            >
              {extract.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {extract.isPending ? "Extracting…" : "Extract Terms"}
            </Button>
          </div>
        </div>
        <textarea
          className="w-full min-h-[120px] px-3 py-2 text-xs font-mono bg-muted/20 border border-border rounded-md text-foreground"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste contract text here…"
        />

        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 inline-block mr-1" />
            {error}
          </div>
        )}

        {result && !error && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Extracted by Claude
              </span>
              {typeof result.confidence === "number" && (
                <span className="text-[10px] text-muted-foreground">
                  Confidence: <strong className="text-foreground">{(result.confidence * 100).toFixed(0)}%</strong>
                </span>
              )}
            </div>
            {result.summary && <p className="text-xs text-muted-foreground italic">{result.summary}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { label: "Effective Date", value: result.effectiveDate, icon: Calendar },
                { label: "Expiry Date", value: result.expiryDate, icon: Calendar },
                { label: "Payment Terms", value: result.paymentTerms, icon: Clock },
                { label: "Total Value", value: result.totalValue, icon: Tag },
                { label: "Pricing Tiers", value: result.pricingTiers, icon: Percent },
                { label: "Rebate Rate", value: result.rebateRate, icon: Percent },
              ].map((f) => f.value ? (
                <div key={f.label} className="bg-muted/30 rounded p-2">
                  <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">
                    <f.icon className="h-3 w-3" />
                    {f.label}
                  </div>
                  <div className="text-foreground">{f.value}</div>
                </div>
              ) : null)}
            </div>
            {result.keyTerms && result.keyTerms.length > 0 && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Key Terms</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.keyTerms.map((t) => (
                    <Badge key={t} className="bg-violet-500/15 text-violet-300 text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContractRow({ contract }: { contract: Contract }) {
  const [expanded, setExpanded] = useState(false);
  const s = statusConfig[contract.status];
  const StatusIcon = s.icon;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-4 bg-card hover:bg-accent/20 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-2 rounded-lg bg-muted/30 shrink-0">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">{contract.id}</span>
            <span className="text-sm font-semibold text-foreground">{contract.supplier}</span>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
              {contract.contractType}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{contract.filename}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">{contract.extractedAt}</span>
          <Badge variant="outline" className={cn("text-xs gap-1", s.className)}>
            <StatusIcon className="h-3 w-3" />
            {contract.status}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && contract.extracted && (
        <div className="border-t border-border bg-card/50 px-5 py-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5" /> LLM Extracted Fields
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {[
              { label: "Effective Date", value: contract.extracted.effectiveDate, icon: Calendar },
              { label: "Expiry Date", value: contract.extracted.expiryDate, icon: Calendar },
              { label: "Total Contract Value", value: contract.extracted.totalValue, icon: Tag },
              { label: "Payment Terms", value: contract.extracted.paymentTerms, icon: Clock },
              { label: "Rebate Rate", value: contract.extracted.rebateRate, icon: Percent },
              { label: "Supplier", value: contract.supplier, icon: Building2 },
            ].map((field) => (
              <div key={field.label} className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <field.icon className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{field.label}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{field.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-lg p-3 mb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pricing Tiers</p>
            <p className="text-sm text-foreground">{contract.extracted.pricingTiers}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">Key Terms:</p>
            {contract.extracted.keyTerms.map((term) => (
              <Badge key={term} variant="outline" className="text-xs border-border text-muted-foreground">{term}</Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="border-border text-foreground">
              Edit Fields
            </Button>
          </div>
        </div>
      )}

      {expanded && !contract.extracted && (
        <div className="border-t border-border bg-card/50 px-5 py-5">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Extraction failed — file may be corrupted or unsupported format. Please re-upload.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContractIngestion() {
  const counts = {
    total: contracts.length,
    reviewed: contracts.filter((c) => c.status === "Reviewed").length,
    pending: contracts.filter((c) => c.status === "Pending Review").length,
    extracted: contracts.filter((c) => c.status === "Extracted").length,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Contract Ingestion</h1>
          <p className="text-sm text-muted-foreground mt-1">LLM extraction and human review of supplier contracts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">AI extraction active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Contracts", value: counts.total, color: "text-foreground" },
          { label: "Extracted", value: counts.extracted, color: "text-blue-400" },
          { label: "Pending Review", value: counts.pending, color: "text-amber-400" },
          { label: "Reviewed", value: counts.reviewed, color: "text-emerald-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ContractExtractor />

      <div className="space-y-3">
        {contracts.map((contract) => (
          <ContractRow key={contract.id} contract={contract} />
        ))}
      </div>
    </div>
  );
}
