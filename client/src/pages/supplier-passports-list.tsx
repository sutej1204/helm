import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Search,
  Plus,
  FileCheck,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Users,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Supplier-passport endpoints aren't part of the thin-slice backend yet.
type SupplierPassport = any;

export default function SupplierPassportsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [scfFilter, setScfFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const { data: passports = [], isLoading } = useQuery<SupplierPassport[]>({
    queryKey: ["/api/supplier-passports"],
  });

  // Compute aggregation metrics
  const metrics = useMemo(() => {
    const totalSuppliers = passports.length;
    const verifiedKyc = passports.filter(p => p.kycStatus === "verified").length;
    const totalLeakage = passports.reduce((sum, p) => 
      sum + (parseFloat(p.identifiedLeakageAnnualUSD || "0")), 0
    );
    const totalCredits = passports.reduce((sum, p) => 
      sum + (parseFloat(p.supplierCreditsEarnedUSD || "0")), 0
    );
    const totalCashFlow = passports.reduce((sum, p) => 
      sum + (parseFloat(p.cashFlowRecoveryUSD || "0")), 0
    );
    const activeActions = passports.filter(p => 
      p.agenticActionFlags && p.agenticActionFlags.length > 0
    ).length;
    const avgMarginLeakage = totalSuppliers > 0
      ? passports.reduce((sum, p) => sum + (parseFloat(p.marginLeakageAlertPercent || "0")), 0) / totalSuppliers
      : 0;

    return {
      totalSuppliers,
      verifiedKyc,
      totalLeakage,
      totalCredits,
      totalCashFlow,
      activeActions,
      avgMarginLeakage
    };
  }, [passports]);

  // Filter passports
  const filteredPassports = useMemo(() => {
    return passports.filter(passport => {
      const matchesSearch = passport.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKyc = kycFilter === "all" || passport.kycStatus === kycFilter;
      const matchesScf = scfFilter === "all" || 
        (scfFilter === "yes" ? passport.scfEligible : !passport.scfEligible);
      const matchesRisk = riskFilter === "all" || 
        passport.esgRisk === riskFilter || 
        passport.riskBand === riskFilter;
      
      return matchesSearch && matchesKyc && matchesScf && matchesRisk;
    });
  }, [passports, searchTerm, kycFilter, scfFilter, riskFilter]);

  const formatCurrency = (value: string | null) => {
    if (!value) return "$0";
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      on_watchlist: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getKycBadge = (kyc: string) => {
    const colors = {
      verified: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800"
    };
    return colors[kyc as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[risk as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getComplianceStatus = (passport: SupplierPassport) => {
    if (passport.kycStatus === "verified" && !passport.sanctionsHits && !passport.pepFlag) {
      return "Complete";
    }
    if (passport.kycStatus === "pending") {
      return "In Progress";
    }
    return "Incomplete";
  };

  const getESGScore = (passport: SupplierPassport) => {
    // Deterministic ESG score based on risk level and working capital opportunity score
    const baseScore = passport.esgRisk === "low" ? 85 : 
                      passport.esgRisk === "medium" ? 70 : 50;
    // Use WC opportunity score as a modifier for consistency
    const wcScore = passport.workingCapitalOpportunityScore 
      ? parseInt(passport.workingCapitalOpportunityScore.toString(), 10)
      : 0;
    const modifier = Math.floor(wcScore / 10);
    return Math.min(100, Math.max(0, baseScore + modifier));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="h-8 w-8 text-blue-600" />
              Supplier Passport
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive supplier profiles with standardized data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                data-testid="button-view-cards"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                data-testid="button-view-table"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
            <Link href="/supplier-passports/new">
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-passport">
                <Plus className="h-4 w-4 mr-2" />
                New Supplier Passport
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Aggregation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalSuppliers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KYC Verified</p>
                <p className="text-2xl font-bold text-green-600">{metrics.verifiedKyc}</p>
                <p className="text-xs text-gray-500">
                  {metrics.totalSuppliers > 0 ? Math.round((metrics.verifiedKyc / metrics.totalSuppliers) * 100) : 0}% of total
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leakage Identified</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.totalLeakage.toString())}</p>
                <p className="text-xs text-gray-500">Annual</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cash Flow Recovery</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalCashFlow.toString())}</p>
                <p className="text-xs text-gray-500">{metrics.activeActions} active actions</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Supplier Credits Earned</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalCredits.toString())}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Margin Leakage</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgMarginLeakage.toFixed(1)}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>

            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger data-testid="select-kyc-filter">
                <SelectValue placeholder="KYC Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scfFilter} onValueChange={setScfFilter}>
              <SelectTrigger data-testid="select-scf-filter">
                <SelectValue placeholder="SCF Eligible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SCF Status</SelectItem>
                <SelectItem value="yes">SCF Eligible</SelectItem>
                <SelectItem value="no">Not Eligible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger data-testid="select-risk-filter">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low ESG Risk</SelectItem>
                <SelectItem value="medium">Medium ESG Risk</SelectItem>
                <SelectItem value="high">High ESG Risk</SelectItem>
                <SelectItem value="AAA">AAA</SelectItem>
                <SelectItem value="AA">AA</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="BBB">BBB</SelectItem>
                <SelectItem value="BB">BB</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards View */}
      {viewMode === "cards" && (
        <div>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading passports...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPassports.map((passport) => {
                const esgScore = getESGScore(passport);
                const complianceStatus = getComplianceStatus(passport);
                const riskLevel = passport.esgRisk === "low" ? "Low" : 
                                  passport.esgRisk === "medium" ? "Medium" : "High";
                const statusBadge = passport.kycStatus === "verified" ? "Verified" : 
                                   passport.kycStatus === "pending" ? "In Review" : "Pending";

                return (
                  <Card 
                    key={passport.id} 
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      passport.kycStatus === "verified" 
                        ? "bg-green-50/30 border-green-100" 
                        : "bg-yellow-50/30 border-yellow-100"
                    }`}
                    data-testid={`card-passport-${passport.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{passport.supplierName}</CardTitle>
                        <Badge 
                          className={
                            passport.kycStatus === "verified" 
                              ? "bg-green-100 text-green-700 border-green-200" 
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }
                        >
                          {statusBadge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">ESG Score: <span className="font-semibold text-gray-900">{esgScore}/100</span></p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Compliance: <span className="font-semibold text-gray-900">{complianceStatus}</span></p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Risk Level: <span className={`font-semibold ${
                            passport.esgRisk === "low" ? "text-green-600" : 
                            passport.esgRisk === "medium" ? "text-yellow-600" : "text-orange-600"
                          }`}>{riskLevel}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Country: <span className="font-semibold text-gray-900">{passport.country}</span>
                        </p>
                      </div>
                      <Link href={`/supplier-passports/${passport.id}`}>
                        <Button 
                          className="w-full mt-2" 
                          variant="outline"
                          data-testid={`button-view-passport-${passport.id}`}
                        >
                          View Passport
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Create New Passport Card */}
              <Link href="/supplier-passports/new">
                <Card 
                  className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer h-full flex items-center justify-center min-h-[280px]"
                  data-testid="card-create-passport"
                >
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plus className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Create New Passport</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier Passports ({filteredPassports.length})</CardTitle>
            <CardDescription>
              Click on a row to view detailed passport information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading passports...</p>
              </div>
            ) : filteredPassports.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <FileCheck className="h-12 w-12 mb-3" />
                <p>No supplier passports found</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>ESG Risk</TableHead>
                    <TableHead>Risk Band</TableHead>
                    <TableHead className="text-right">Leakage (Annual)</TableHead>
                    <TableHead className="text-right">WC Opportunity</TableHead>
                    <TableHead>SCF Eligible</TableHead>
                    <TableHead className="text-right">Margin Leakage %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPassports.map((passport) => (
                    <TableRow
                      key={passport.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => window.location.href = `/supplier-passports/${passport.id}`}
                      data-testid={`row-passport-${passport.id}`}
                    >
                      <TableCell className="font-medium">{passport.supplierName}</TableCell>
                      <TableCell>{passport.country}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(passport.status)}>
                          {passport.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getKycBadge(passport.kycStatus)}>
                          {passport.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskBadge(passport.esgRisk)}>
                          {passport.esgRisk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{passport.riskBand}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-orange-600">
                        {formatCurrency(passport.identifiedLeakageAnnualUSD)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{passport.workingCapitalOpportunityScore}</span>/100
                      </TableCell>
                      <TableCell>
                        {passport.scfEligible ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {passport.marginLeakageAlertPercent}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
