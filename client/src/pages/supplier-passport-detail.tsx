import { useState } from "react";
import { Link, useParams } from "wouter";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Shield,
  FileText,
  CreditCard,
  TrendingUp,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const suppliersData: Record<string, {
  name: string; country: string; sector: string; status: string;
  kyc: string; riskBand: string; scf: boolean;
  kycExpiry: string; uboVerified: boolean; sanctionsHits: number; pepFlag: boolean;
  esgScore: number; esgRisk: string; forcedLaborRisk: string;
  contractedTerms: number; discountRate: string; rebateRate: string;
  leakage: string; priceDeviation: string; rebateUtil: string;
  actualPayDays: string; invoicesPaid: number; avgInvoice: string;
  onTimeRate: string; earlyPayRate: string;
  scfLimit: string; scfUtilised: string; financingRate: string;
}> = {
  "global-tech": {
    name: "Global Tech Solutions Ltd", country: "United Kingdom", sector: "Technology", status: "ACTIVE",
    kyc: "verified", riskBand: "A", scf: true,
    kycExpiry: "Dec 30, 2025", uboVerified: true, sanctionsHits: 0, pepFlag: false,
    esgScore: 93, esgRisk: "low", forcedLaborRisk: "low",
    contractedTerms: 30, discountRate: "2.0", rebateRate: "3.5",
    leakage: "$185K", priceDeviation: "3.2", rebateUtil: "72",
    actualPayDays: "24", invoicesPaid: 156, avgInvoice: "$78K",
    onTimeRate: "94", earlyPayRate: "38",
    scfLimit: "$2.5M", scfUtilised: "$890K", financingRate: "1.5",
  },
  "pacific-mfg": {
    name: "Pacific Manufacturing Inc", country: "USA", sector: "Manufacturing", status: "ACTIVE",
    kyc: "verified", riskBand: "B", scf: true,
    kycExpiry: "Mar 15, 2026", uboVerified: true, sanctionsHits: 0, pepFlag: false,
    esgScore: 77, esgRisk: "medium", forcedLaborRisk: "low",
    contractedTerms: 45, discountRate: "1.5", rebateRate: "2.0",
    leakage: "$210K", priceDeviation: "5.8", rebateUtil: "61",
    actualPayDays: "38", invoicesPaid: 98, avgInvoice: "$125K",
    onTimeRate: "87", earlyPayRate: "22",
    scfLimit: "$1.8M", scfUtilised: "$450K", financingRate: "1.5",
  },
  "eastern-comp": {
    name: "Eastern Components Ltd", country: "China", sector: "Components", status: "ON WATCHLIST",
    kyc: "pending", riskBand: "D", scf: false,
    kycExpiry: "Expired", uboVerified: false, sanctionsHits: 2, pepFlag: true,
    esgScore: 54, esgRisk: "high", forcedLaborRisk: "high",
    contractedTerms: 30, discountRate: "1.0", rebateRate: "1.5",
    leakage: "$340K", priceDeviation: "8.1", rebateUtil: "45",
    actualPayDays: "42", invoicesPaid: 64, avgInvoice: "$45K",
    onTimeRate: "68", earlyPayRate: "8",
    scfLimit: "N/A", scfUtilised: "N/A", financingRate: "N/A",
  },
  "nordic-supply": {
    name: "Nordic Supply Chain AS", country: "Norway", sector: "Logistics", status: "ACTIVE",
    kyc: "verified", riskBand: "A", scf: true,
    kycExpiry: "Jun 20, 2026", uboVerified: true, sanctionsHits: 0, pepFlag: false,
    esgScore: 88, esgRisk: "low", forcedLaborRisk: "low",
    contractedTerms: 30, discountRate: "2.0", rebateRate: "3.0",
    leakage: "$95K", priceDeviation: "2.1", rebateUtil: "85",
    actualPayDays: "28", invoicesPaid: 210, avgInvoice: "$52K",
    onTimeRate: "96", earlyPayRate: "45",
    scfLimit: "$3.2M", scfUtilised: "$1.1M", financingRate: "1.5",
  },
  "meridian-trade": {
    name: "Meridian Trade Corp", country: "Germany", sector: "Trading", status: "ACTIVE",
    kyc: "verified", riskBand: "B", scf: false,
    kycExpiry: "Sep 10, 2026", uboVerified: true, sanctionsHits: 0, pepFlag: false,
    esgScore: 65, esgRisk: "medium", forcedLaborRisk: "low",
    contractedTerms: 45, discountRate: "1.5", rebateRate: "2.5",
    leakage: "$178K", priceDeviation: "4.7", rebateUtil: "58",
    actualPayDays: "35", invoicesPaid: 82, avgInvoice: "$92K",
    onTimeRate: "82", earlyPayRate: "15",
    scfLimit: "N/A", scfUtilised: "N/A", financingRate: "N/A",
  },
  "atlas-mfg": {
    name: "Atlas Manufacturing SA", country: "Brazil", sector: "Manufacturing", status: "PENDING",
    kyc: "pending", riskBand: "C", scf: false,
    kycExpiry: "Under Review", uboVerified: false, sanctionsHits: 0, pepFlag: false,
    esgScore: 71, esgRisk: "medium", forcedLaborRisk: "medium",
    contractedTerms: 30, discountRate: "2.0", rebateRate: "2.0",
    leakage: "$220K", priceDeviation: "6.3", rebateUtil: "52",
    actualPayDays: "33", invoicesPaid: 45, avgInvoice: "$110K",
    onTimeRate: "78", earlyPayRate: "12",
    scfLimit: "N/A", scfUtilised: "N/A", financingRate: "N/A",
  },
};

type TabType = "compliance" | "contract" | "payment" | "financing" | "automation";

export default function SupplierPassportDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("compliance");

  const data = suppliersData[id || ""];

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/supplier-passport">
          <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Passports
          </Button>
        </Link>
        <Card className="bg-card border-border">
          <CardContent className="pt-5 py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
            <p className="text-foreground font-semibold">Supplier passport not found</p>
            <p className="text-sm text-muted-foreground mt-1">The requested passport does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Shield }[] = [
    { key: "compliance", label: "Compliance", icon: Shield },
    { key: "contract", label: "Contract", icon: FileText },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "financing", label: "Financing", icon: TrendingUp },
    { key: "automation", label: "Automation", icon: Zap },
  ];

  const statusColor = data.status === "ACTIVE" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
    data.status === "ON WATCHLIST" ? "border-red-500/30 text-red-400 bg-red-500/10" :
    "border-amber-500/30 text-amber-400 bg-amber-500/10";

  const kycColor = data.kyc === "verified" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
    "border-amber-500/30 text-amber-400 bg-amber-500/10";

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/supplier-passport">
        <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Passports
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-7 w-7 text-emerald-400" />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Supplier Passport</h1>
      </div>

      <Card className="bg-card border-border mb-6">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">{data.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{data.country} | {data.sector}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className={statusColor}>{data.status}</Badge>
                <Badge variant="outline" className={kycColor}>KYC: {data.kyc}</Badge>
                <Badge variant="outline" className="border-border text-muted-foreground">Risk Band: {data.riskBand}</Badge>
                {data.scf && <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">SCF Eligible</Badge>}
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.key
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "compliance" && (
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-foreground">Identity & Compliance</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">KYC status, sanctions screening, and ESG risk assessment</p>

              <p className="text-sm font-semibold text-foreground mb-3">KYC & Identity Verification</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-accent/30">
                  <CheckCircle className={cn("h-5 w-5 mt-0.5", data.kyc === "verified" ? "text-emerald-400" : "text-amber-400")} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">KYC Status</p>
                    <p className="text-xs text-muted-foreground">{data.kyc}</p>
                    <p className="text-xs text-muted-foreground mt-1">Expiry: {data.kycExpiry}</p>
                    {data.kycExpiry === "Expired" && (
                      <Badge variant="outline" className="mt-2 border-red-500/30 text-red-400 bg-red-500/10 text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        KYC Refresh Needed
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-accent/30">
                  {data.uboVerified ? <CheckCircle className="h-5 w-5 mt-0.5 text-emerald-400" /> : <Clock className="h-5 w-5 mt-0.5 text-amber-400" />}
                  <div>
                    <p className="text-sm font-semibold text-foreground">UBO Verified</p>
                    <p className="text-xs text-muted-foreground">{data.uboVerified ? "Verified" : "Pending"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-accent/30">
                  {data.sanctionsHits === 0 ? <CheckCircle className="h-5 w-5 mt-0.5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 mt-0.5 text-red-400" />}
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sanctions Screening</p>
                    <p className="text-xs text-muted-foreground">{data.sanctionsHits} hits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-accent/30">
                  {data.pepFlag ? <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-400" /> : <CheckCircle className="h-5 w-5 mt-0.5 text-emerald-400" />}
                  <div>
                    <p className="text-sm font-semibold text-foreground">PEP Flag</p>
                    <p className="text-xs text-muted-foreground">{data.pepFlag ? "Detected" : "Clear"}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm font-semibold text-foreground mb-3">ESG & Forced Labor Risk</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">ESG Score</p>
                  <p className="text-2xl font-bold text-foreground">{data.esgScore}/100</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">ESG Risk</p>
                  <Badge variant="outline" className={cn("mt-1", data.esgRisk === "low" ? "border-emerald-500/30 text-emerald-400" : data.esgRisk === "medium" ? "border-amber-500/30 text-amber-400" : "border-red-500/30 text-red-400")}>{data.esgRisk}</Badge>
                </div>
                <div className="p-4 rounded-lg border border-border bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">Forced Labor Risk</p>
                  <Badge variant="outline" className={cn("mt-1", data.forcedLaborRisk === "low" ? "border-emerald-500/30 text-emerald-400" : data.forcedLaborRisk === "medium" ? "border-amber-500/30 text-amber-400" : "border-red-500/30 text-red-400")}>{data.forcedLaborRisk}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "contract" && (
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-foreground">Contract Performance & Value Leakage</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Contracted terms vs. actual performance</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Contracted Payment Terms</p>
                <p className="text-2xl font-bold text-foreground">{data.contractedTerms} days</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Discount Rate</p>
                <p className="text-2xl font-bold text-foreground">{data.discountRate}%</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Rebate Rate</p>
                <p className="text-2xl font-bold text-foreground">{data.rebateRate}%</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-foreground mb-3">Value Leakage Analysis</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs text-amber-400 mb-1">Identified Leakage (Annual)</p>
                <p className="text-2xl font-bold text-amber-400">{data.leakage}</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Avg Price Deviation</p>
                <p className="text-2xl font-bold text-foreground">{data.priceDeviation}%</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Rebate Utilisation</p>
                <p className="text-2xl font-bold text-foreground">{data.rebateUtil}%</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Why you're leaking</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {parseFloat(data.rebateUtil) < 80 && `Low rebate utilisation - only capturing ${data.rebateUtil}% of available rebates. `}
                    {parseFloat(data.priceDeviation) > 5 && `Price deviations exceed 5%. `}
                    {Number(data.actualPayDays) < data.contractedTerms && "Paying earlier than contracted terms without capturing discounts."}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold text-foreground mb-3">Contracts & SLAs</p>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-border bg-accent/30 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-semibold text-foreground">Master Services Agreement (MSA)</p>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">Active</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><p className="text-muted-foreground">Effective Date</p><p className="font-medium text-foreground mt-0.5">Jan 15, 2023</p></div>
                  <div><p className="text-muted-foreground">Expiry Date</p><p className="font-medium text-foreground mt-0.5">Jan 14, 2026</p></div>
                  <div><p className="text-muted-foreground">Contract Value</p><p className="font-medium text-foreground mt-0.5">$12.5M/year</p></div>
                  <div><p className="text-muted-foreground">Payment Terms</p><p className="font-medium text-foreground mt-0.5">Net 30</p></div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-accent/30 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-semibold text-foreground">Service Level Agreement - IT Support</p>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">Active</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><p className="text-muted-foreground">Effective Date</p><p className="font-medium text-foreground mt-0.5">Mar 1, 2024</p></div>
                  <div><p className="text-muted-foreground">Expiry Date</p><p className="font-medium text-foreground mt-0.5">Feb 28, 2025</p></div>
                  <div><p className="text-muted-foreground">SLA Target</p><p className="font-medium text-foreground mt-0.5">99.9% Uptime</p></div>
                  <div><p className="text-muted-foreground">Response Time</p><p className="font-medium text-foreground mt-0.5">4 hours</p></div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-accent/30 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-semibold text-foreground">Volume Discount Agreement</p>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">Active</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><p className="text-muted-foreground">Effective Date</p><p className="font-medium text-foreground mt-0.5">Jul 1, 2024</p></div>
                  <div><p className="text-muted-foreground">Expiry Date</p><p className="font-medium text-foreground mt-0.5">Jun 30, 2025</p></div>
                  <div><p className="text-muted-foreground">Tier 1 Discount</p><p className="font-medium text-foreground mt-0.5">2% ($5M+)</p></div>
                  <div><p className="text-muted-foreground">Tier 2 Discount</p><p className="font-medium text-foreground mt-0.5">3.5% ($10M+)</p></div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-accent/30 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-semibold text-foreground">Early Payment Discount Program</p>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">Active</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><p className="text-muted-foreground">Effective Date</p><p className="font-medium text-foreground mt-0.5">Jan 1, 2024</p></div>
                  <div><p className="text-muted-foreground">Expiry Date</p><p className="font-medium text-foreground mt-0.5">Dec 31, 2024</p></div>
                  <div><p className="text-muted-foreground">Discount Rate</p><p className="font-medium text-foreground mt-0.5">2.0% (Net 10)</p></div>
                  <div><p className="text-muted-foreground">Standard Terms</p><p className="font-medium text-foreground mt-0.5">Net 30</p></div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-accent/30 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-semibold text-foreground">Annual Rebate Agreement</p>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px]">Expiring Soon</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><p className="text-muted-foreground">Effective Date</p><p className="font-medium text-foreground mt-0.5">Jan 1, 2024</p></div>
                  <div><p className="text-muted-foreground">Expiry Date</p><p className="font-medium text-foreground mt-0.5">Dec 31, 2024</p></div>
                  <div><p className="text-muted-foreground">Rebate Rate</p><p className="font-medium text-foreground mt-0.5">1.5% Annual</p></div>
                  <div><p className="text-muted-foreground">Min. Volume</p><p className="font-medium text-foreground mt-0.5">$8M/year</p></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "payment" && (
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-foreground">Payment Terms & Behavior</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Real-world payment performance tracking</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Actual Avg Pay Days</p>
                <p className="text-2xl font-bold text-foreground">{data.actualPayDays}</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Invoices Paid (12mo)</p>
                <p className="text-2xl font-bold text-foreground">{data.invoicesPaid}</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Avg Invoice Value</p>
                <p className="text-2xl font-bold text-foreground">{data.avgInvoice}</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">On-Time Rate</p>
                <p className="text-2xl font-bold text-emerald-400">{data.onTimeRate}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Early Payment Rate</p>
                <p className="text-2xl font-bold text-blue-400">{data.earlyPayRate}%</p>
                <p className="text-[10px] text-muted-foreground mt-1">of invoices paid before contracted terms</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Payment Term Gap</p>
                <p className="text-2xl font-bold text-foreground">{Number(data.actualPayDays) - data.contractedTerms} days</p>
                <p className="text-[10px] text-muted-foreground mt-1">difference between contracted and actual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "financing" && (
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-foreground">Financing & Capital Access</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Integrated capital and liquidity intelligence</p>

            {data.scf ? (
              <>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-400">Ready for Financing</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This supplier meets all eligibility criteria for supply chain finance programs.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-accent/30">
                    <p className="text-xs text-muted-foreground mb-1">SCF Limit</p>
                    <p className="text-2xl font-bold text-foreground">{data.scfLimit}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-accent/30">
                    <p className="text-xs text-muted-foreground mb-1">Utilised</p>
                    <p className="text-2xl font-bold text-blue-400">{data.scfUtilised}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-accent/30">
                    <p className="text-xs text-muted-foreground mb-1">Financing Rate</p>
                    <p className="text-2xl font-bold text-emerald-400">{data.financingRate}%</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <p className="text-sm font-semibold text-amber-400">Not Eligible for SCF</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">This supplier does not currently meet the eligibility criteria. Complete KYC verification and compliance requirements to unlock financing.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "automation" && (
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-foreground">Automation & AI Actions</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Automated workflows and AI-driven actions for this supplier</p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Auto KYC Refresh</p>
                      <p className="text-xs text-muted-foreground">Automatically triggers KYC refresh 30 days before expiry</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Active</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Invoice Anomaly Detection</p>
                      <p className="text-xs text-muted-foreground">AI flags invoices with pricing deviations exceeding 5%</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Active</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <DollarSign className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Early Payment Optimization</p>
                      <p className="text-xs text-muted-foreground">Recommends early payment when discount exceeds financing cost</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Active</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Risk Escalation</p>
                      <p className="text-xs text-muted-foreground">Alerts when supplier risk band deteriorates by 2+ levels</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">Monitoring</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
