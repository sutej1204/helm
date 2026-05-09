import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  FileText,
  Search,
  Users,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Plus,
  LayoutGrid,
  List,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const passportSuppliers = [
  { id: "global-tech", name: "Global Tech Solutions Ltd", kyc: "Verified", scf: "Eligible", risk: "Low", riskColor: "text-emerald-400", esg: 93, compliance: "Complete", country: "United Kingdom", sector: "Technology" },
  { id: "pacific-mfg", name: "Pacific Manufacturing Inc", kyc: "Verified", scf: "Eligible", risk: "Medium", riskColor: "text-amber-400", esg: 77, compliance: "Complete", country: "USA", sector: "Manufacturing" },
  { id: "eastern-comp", name: "Eastern Components Ltd", kyc: "Pending", scf: "Under Review", risk: "High", riskColor: "text-red-400", esg: 54, compliance: "Incomplete", country: "China", sector: "Components" },
  { id: "nordic-supply", name: "Nordic Supply Chain AS", kyc: "Verified", scf: "Eligible", risk: "Low", riskColor: "text-emerald-400", esg: 88, compliance: "Complete", country: "Norway", sector: "Logistics" },
  { id: "meridian-trade", name: "Meridian Trade Corp", kyc: "Verified", scf: "Not Eligible", risk: "Medium", riskColor: "text-amber-400", esg: 65, compliance: "Complete", country: "Germany", sector: "Trading" },
  { id: "atlas-mfg", name: "Atlas Manufacturing SA", kyc: "Pending", scf: "Under Review", risk: "Medium", riskColor: "text-amber-400", esg: 71, compliance: "Incomplete", country: "Brazil", sector: "Manufacturing" },
];

export default function SupplierPassport() {
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("All");
  const [scfFilter, setScfFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = passportSuppliers.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (kycFilter !== "All" && s.kyc !== kycFilter) return false;
    if (scfFilter !== "All" && s.scf !== scfFilter) return false;
    if (riskFilter !== "All" && s.risk !== riskFilter) return false;
    return true;
  });

  const verifiedCount = passportSuppliers.filter(s => s.kyc === "Verified").length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Supplier Passport</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Comprehensive supplier profiles with standardized data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground hover:text-foreground")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2 transition-colors", viewMode === "list" ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground hover:text-foreground")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            <Plus className="h-4 w-4" />
            New Supplier Passport
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Suppliers</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{passportSuppliers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">KYC Verified</p>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{verifiedCount}</p>
            <p className="text-[10px] text-muted-foreground">{Math.round((verifiedCount / passportSuppliers.length) * 100)}% of total</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Leakage Identified</p>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-1">$1.2M</p>
            <p className="text-[10px] text-muted-foreground">Annual</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Cash Flow Recovery</p>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-1">$295K</p>
            <p className="text-[10px] text-muted-foreground">5 active actions</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Credits Earned</p>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400 mt-1">$203K</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Avg Margin Leakage</p>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">5.1%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border mb-6">
        <CardContent className="py-4">
          <p className="text-sm font-semibold text-foreground mb-3">Filters</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                className="pl-9 bg-accent/50 border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="bg-accent/50 border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="All">All KYC Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
            <select
              value={scfFilter}
              onChange={(e) => setScfFilter(e.target.value)}
              className="bg-accent/50 border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="All">All SCF Status</option>
              <option value="Eligible">Eligible</option>
              <option value="Not Eligible">Not Eligible</option>
              <option value="Under Review">Under Review</option>
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-accent/50 border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((supplier) => (
            <Card key={supplier.id} className="bg-card border-border hover:border-emerald-500/30 transition-colors">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{supplier.name}</h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0 ml-2",
                      supplier.kyc === "Verified"
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                    )}
                  >
                    {supplier.kyc}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ESG Score:</span>
                    <span className="font-medium text-foreground">{supplier.esg}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compliance:</span>
                    <span className={cn("font-medium", supplier.compliance === "Complete" ? "text-emerald-400" : "text-amber-400")}>{supplier.compliance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className={cn("font-medium", supplier.riskColor)}>{supplier.risk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium text-foreground">{supplier.country}</span>
                  </div>
                </div>
                <Link href={`/supplier-passport/${supplier.id}`}>
                  <Button variant="outline" className="w-full mt-4 border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/30">
                    View Passport
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="space-y-1">
              {filtered.map((supplier) => (
                <Link key={supplier.id} href={`/supplier-passport/${supplier.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-bold">
                        {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.country} · {supplier.sector}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground hidden md:block">ESG: {supplier.esg}</span>
                      <Badge variant="outline" className={cn("text-[10px]", supplier.kyc === "Verified" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-amber-500/30 text-amber-400 bg-amber-500/10")}>{supplier.kyc}</Badge>
                      <Badge variant="outline" className={cn("text-[10px]", supplier.risk === "Low" ? "border-emerald-500/30 text-emerald-400" : supplier.risk === "Medium" ? "border-amber-500/30 text-amber-400" : "border-red-500/30 text-red-400")}>{supplier.risk}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
