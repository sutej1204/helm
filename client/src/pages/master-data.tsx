import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Search, Users, GitMerge, Plus, CheckCircle2, AlertTriangle } from "lucide-react";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<"sku" | "customers">("sku");
  const { data: skuMappings = [] } = useQuery<any[]>({ queryKey: ["/api/sku-mappings"] });
  const { data: endCustomers = [] } = useQuery<any[]>({ queryKey: ["/api/end-customers"] });
  const { data: suppliers = [] } = useQuery<any[]>({ queryKey: ["/api/suppliers"] });

  const supplierMap = new Map((suppliers as any[]).map((s: any) => [s.id, s]));

  const confidenceColor = (c: string | null) => {
    const n = parseFloat(c || "0");
    if (n >= 90) return "text-emerald-400";
    if (n >= 70) return "text-blue-400";
    return "text-amber-400";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Master Data</h1>
          <p className="text-sm text-muted-foreground">SKU mappings, end customer registry — the foundation of accurate credit computation</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" /> Add Mapping
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "SKU Mappings", value: String(skuMappings.length), color: "text-foreground", icon: GitMerge },
          { label: "End Customers", value: String(endCustomers.length), color: "text-blue-400", icon: Users },
          { label: "Low-Confidence Mappings", value: String(skuMappings.filter((m: any) => parseFloat(m.confidence) < 70).length), color: "text-amber-400", icon: AlertTriangle },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ id: "sku", label: "SKU Mappings" }, { id: "customers", label: "End Customers" }].map(tab => (
          <button
            key={tab.id}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab.id ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:bg-muted/40"}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "sku" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-muted-foreground" />
              Manufacturer → Distributor SKU Mappings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  {["Supplier", "Manufacturer SKU", "Distributor SKU", "UOM", "Confidence", "Status"].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(skuMappings as any[]).map((m: any) => (
                  <tr key={m.id} className="border-t border-border hover:bg-muted/10">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{supplierMap.get(m.supplierId)?.name || `Supplier ${m.supplierId}`}</td>
                    <td className="px-4 py-3 text-xs font-mono">{m.manufacturerSku}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{m.distributorSku}</td>
                    <td className="px-4 py-3 text-xs">{m.uomManufacturer}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${confidenceColor(m.confidence)}`}>{m.confidence}%</span>
                      {parseFloat(m.confidence) < 70 && <AlertTriangle className="h-3.5 w-3.5 text-amber-400 inline-block ml-1" />}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={m.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}>
                        {m.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === "customers" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              End Customer Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  {["Code", "Name", "Classification", "Buying Groups"].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(endCustomers as any[]).map((ec: any) => (
                  <tr key={ec.id} className="border-t border-border hover:bg-muted/10">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{ec.endCustomerCode}</td>
                    <td className="px-4 py-3 text-sm font-medium">{ec.name}</td>
                    <td className="px-4 py-3">
                      <Badge className={ec.classification === "contractor" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}>
                        {ec.classification}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(ec.buyingGroups as string[] || []).map((g: string) => (
                          <span key={g} className="text-[10px] bg-muted/30 border border-border px-1.5 py-0.5 rounded text-muted-foreground">{g}</span>
                        ))}
                        {(!ec.buyingGroups || (ec.buyingGroups as string[]).length === 0) && (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
