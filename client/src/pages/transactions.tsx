import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { List, Search, ChevronRight, CheckCircle2, AlertTriangle, Clock, Zap } from "lucide-react";

const samplePoNumbers = [
  "PO-2024-0001", "PO-2024-0002", "PO-2024-0003",
  "PO-2024-0010", "PO-2024-0011", "PO-2024-0020",
  "PO-2024-0030", "PO-2024-0040",
];

interface Stage {
  stage: number | string;
  name: string;
  document: any;
  status: string;
}

const stageStatusColor: Record<string, string> = {
  complete: "border-emerald-500/50 bg-emerald-500/5 text-emerald-400",
  pending: "border-border bg-muted/10 text-muted-foreground",
  missing: "border-red-500/30 bg-red-500/5 text-red-400",
  flagged: "border-amber-500/50 bg-amber-500/5 text-amber-400",
  matched: "border-emerald-500/50 bg-emerald-500/5 text-emerald-400",
  price_variance: "border-amber-500/50 bg-amber-500/5 text-amber-400",
};

const stageIcon: Record<string, React.ReactNode> = {
  complete: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
  pending: <Clock className="h-4 w-4 text-muted-foreground shrink-0" />,
  missing: <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />,
  flagged: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
  matched: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
  price_variance: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
};

export default function TransactionsPage() {
  const [selectedPo, setSelectedPo] = useState<string>("PO-2024-0001");
  const [searchInput, setSearchInput] = useState("");

  const { data: txData, isLoading } = useQuery({
    queryKey: ["/api/transactions", selectedPo],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${selectedPo}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!selectedPo,
  });

  const handleSearch = () => {
    if (searchInput.trim()) setSelectedPo(searchInput.trim().toUpperCase());
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Transaction Browser</h1>
        <p className="text-sm text-muted-foreground">Full 12-stage lifecycle — from PO to net payment — with RECON checkpoints</p>
      </div>

      {/* PO search / select */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="w-full bg-muted/20 border border-border rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter PO number (e.g. PO-2024-0001)"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700">Search</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePoNumbers.map(po => (
              <button
                key={po}
                className={`text-xs px-2.5 py-1 rounded border transition-all font-mono ${selectedPo === po ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-border text-muted-foreground hover:border-slate-600"}`}
                onClick={() => { setSelectedPo(po); setSearchInput(po); }}
              >
                {po}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction spine */}
      {isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Loading transaction...</CardContent>
        </Card>
      )}

      {txData && !isLoading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">Transaction Spine: {selectedPo}</h2>
            <span className="text-xs text-muted-foreground">({txData.stages?.length} stages)</span>
          </div>
          {txData.stages?.map((stage: Stage, i: number) => {
            const stageKey = typeof stage.stage === "string" && stage.stage.startsWith("R") ? "recon" : stage.status;
            const isRecon = typeof stage.stage === "string" && stage.stage.startsWith("R");
            return (
              <div key={`${stage.stage}-${i}`}>
                {i > 0 && !isRecon && (
                  <div className="flex justify-center my-0.5">
                    <div className="h-3 w-0.5 bg-border" />
                  </div>
                )}
                <div className={`p-3 rounded-lg border transition-all ${isRecon ? "ml-6 border-l-2 " + (stageStatusColor[stage.status] || "border-border") : stageStatusColor[stage.status] || "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isRecon ? "bg-amber-500/20 text-amber-400" : "bg-muted/40 text-muted-foreground"}`}>
                        {stage.stage}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{stage.name}</div>
                        {stage.document && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {Array.isArray(stage.document)
                              ? `${stage.document.length} records`
                              : stage.document.poNumber || stage.document.invoiceNumber || stage.document.remittanceNumber || stage.document.paymentNumber || stage.document.agreementName || JSON.stringify(stage.document).slice(0, 60)
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {stageIcon[stage.status] || <Clock className="h-4 w-4 text-muted-foreground" />}
                      <Badge className={`text-[10px] ${stage.status === "complete" || stage.status === "matched" ? "bg-emerald-500/20 text-emerald-400" : stage.status === "flagged" || stage.status === "price_variance" ? "bg-amber-500/20 text-amber-400" : "bg-muted/40 text-muted-foreground"}`}>
                        {stage.status}
                      </Badge>
                    </div>
                  </div>

                  {/* RECON insight */}
                  {isRecon && stage.document && (
                    <div className="mt-2 ml-9 text-xs">
                      {stage.stage === "R1" && stage.document.variance !== 0 && (
                        <span className="text-amber-300">Price variance: ${Math.abs(stage.document.variance).toLocaleString()} — {stage.document.matchStatus}</span>
                      )}
                      {stage.stage === "R2" && stage.document.variance > 0 && (
                        <span className="text-amber-300">Post-settlement gap: ${stage.document.variance.toLocaleString()} — dispute {stage.document.status}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
