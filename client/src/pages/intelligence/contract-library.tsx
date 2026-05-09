import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Search, CheckCircle2, AlertTriangle, Clock, Download } from "lucide-react";

const agreements = [
  { id: 1, name: "Carrier 2024 Master Distribution Agreement", supplier: "Carrier Global", status: "active", confidence: 97, programs: 3, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 3, 2024", pages: 48 },
  { id: 2, name: "Trane 2024 Distributor Agreement", supplier: "Trane Technologies", status: "active", confidence: 94, programs: 3, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 5, 2024", pages: 52 },
  { id: 3, name: "Lennox Annual Distributor Program", supplier: "Lennox International", status: "active", confidence: 91, programs: 1, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 8, 2024", pages: 34 },
  { id: 4, name: "Rheem Distribution Agreement 2024", supplier: "Rheem Manufacturing", status: "active", confidence: 95, programs: 1, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 10, 2024", pages: 41 },
  { id: 5, name: "Mitsubishi Electric Distributor Program", supplier: "Mitsubishi Electric", status: "active", confidence: 98, programs: 1, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 12, 2024", pages: 58 },
  { id: 6, name: "Honeywell Controls Partnership Agreement", supplier: "Honeywell Controls", status: "active", confidence: 96, programs: 1, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 15, 2024", pages: 29 },
  { id: 7, name: "Johnson Controls 2024 Distributor Agreement", supplier: "Johnson Controls", status: "active", confidence: 93, programs: 1, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 18, 2024", pages: 44 },
  { id: 8, name: "Daikin Applied Distribution Program", supplier: "Daikin Applied", status: "active", confidence: 97, programs: 1, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 20, 2024", pages: 38 },
  { id: 9, name: "Pacific HVAC Supply Agreement", supplier: "Pacific HVAC Supply", status: "active", confidence: 88, programs: 1, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 22, 2024", pages: 18 },
  { id: 10, name: "Northeast Coil Distribution Terms", supplier: "Northeast Coil Co.", status: "active", confidence: 85, programs: 1, expiry: "Dec 31, 2024", daysToExpiry: 237, uploadedAt: "Jan 24, 2024", pages: 14 },
];

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence >= 95) return <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">{confidence}% ✓</Badge>;
  if (confidence >= 88) return <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">{confidence}%</Badge>;
  return <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">{confidence}% — review</Badge>;
}

export default function ContractLibrary() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = agreements.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const selected = agreements.find(a => a.id === selectedId);
  const avgConfidence = Math.round(agreements.reduce((sum, a) => sum + a.confidence, 0) / agreements.length);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Contract Library</h1>
          <p className="text-sm text-muted-foreground">AI-ingested agreements with extracted terms, programs, and eligibility rules</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <FileText className="h-4 w-4" /> Upload Agreement
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Agreements", value: String(agreements.length), color: "text-foreground" },
          { label: "Avg Confidence", value: `${avgConfidence}%`, color: "text-emerald-400" },
          { label: "Total Programs", value: String(agreements.reduce((sum, a) => sum + a.programs, 0)), color: "text-blue-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full bg-muted/20 border border-border rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Search agreements..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {filtered.map((ag) => (
              <Card
                key={ag.id}
                className={`border cursor-pointer transition-all ${selectedId === ag.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-slate-600"}`}
                onClick={() => setSelectedId(selectedId === ag.id ? null : ag.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="text-sm font-medium">{ag.name}</div>
                        <div className="text-xs text-muted-foreground">{ag.supplier} · {ag.pages} pages · Uploaded {ag.uploadedAt}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">{ag.programs} programs</Badge>
                      <ConfidenceBadge confidence={ag.confidence} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <Card className="bg-card border-border sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold">{selected.supplier}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {[
                    { label: "Status", value: <Badge className="bg-emerald-500/20 text-emerald-400">{selected.status}</Badge> },
                    { label: "Confidence", value: <ConfidenceBadge confidence={selected.confidence} /> },
                    { label: "Programs", value: <span className="text-sm font-medium">{selected.programs}</span> },
                    { label: "Expiry", value: <span className="text-sm font-medium text-amber-400">{selected.expiry}</span> },
                    { label: "Days to Expiry", value: <span className="text-sm font-medium">{selected.daysToExpiry}</span> },
                    { label: "Pages", value: <span className="text-sm font-medium">{selected.pages}</span> },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{f.label}</span>
                      {f.value}
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border space-y-2">
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Search className="h-3.5 w-3.5" /> Open Knowledge Graph
                  </Button>
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </Button>
                </div>
                {selected.daysToExpiry < 270 && (
                  <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded text-[10px] text-amber-300 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 shrink-0" />
                    Renewal recommended {selected.daysToExpiry - 60} days ahead
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">Select an agreement to see details</div>
          )}
        </div>
      </div>
    </div>
  );
}
