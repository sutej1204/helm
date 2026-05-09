import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// Supplier-passport endpoints aren't part of the thin-slice backend yet —
// loose typing here until they come online.
type SupplierPassport = any;

// Form validation schema
const formSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required"),
  country: z.string().min(1, "Country is required"),
  industry: z.string().min(1, "Industry is required"),
  status: z.enum(["active", "pending", "on_watchlist"]),
  kycStatus: z.enum(["verified", "pending", "expired", "failed"]),
  kycExpiryDate: z.string().nullable(),
  esgRisk: z.enum(["low", "medium", "high", "critical"]),
  forcedLaborRisk: z.enum(["low", "medium", "high"]),
  contractedPaymentTerms: z.coerce.number().min(0).max(365),
  contractedDiscountRate: z.string(),
  contractedRebateRate: z.string(),
  identifiedLeakageAnnualUSD: z.string(),
  actualAveragePaymentDays: z.string(),
  workingCapitalOpportunityScore: z.string(),
  scfEligible: z.boolean(),
  riskBand: z.enum(["AAA", "AA", "A", "BBB", "BB", "B", "C"]),
  indicativeFundingLimitUSD: z.string(),
  indicativeSpreadBps: z.coerce.number().min(0),
  fundingReadinessScore: z.string(),
  supplierCreditsEarnedUSD: z.string(),
  marginLeakageAlertPercent: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SupplierPassportForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: passport, isLoading } = useQuery<SupplierPassport>({
    queryKey: ["/api/supplier-passports", id],
    enabled: isEdit && !!id
  });

  const getDefaultValues = () => {
    if (passport) {
      return {
        supplierName: passport.supplierName || "",
        country: passport.country || "",
        industry: passport.industry || "",
        status: passport.status as any,
        kycStatus: passport.kycStatus as any,
        kycExpiryDate: passport.kycExpiryDate || null,
        esgRisk: passport.esgRisk as any,
        forcedLaborRisk: passport.forcedLaborRisk as any,
        contractedPaymentTerms: Number(passport.contractedPaymentTerms) || 30,
        contractedDiscountRate: String(passport.contractedDiscountRate || "0"),
        contractedRebateRate: String(passport.contractedRebateRate || "0"),
        identifiedLeakageAnnualUSD: String(passport.identifiedLeakageAnnualUSD || "0"),
        actualAveragePaymentDays: String(passport.actualAveragePaymentDays || "0"),
        workingCapitalOpportunityScore: String(passport.workingCapitalOpportunityScore || "50"),
        scfEligible: passport.scfEligible || false,
        riskBand: passport.riskBand as any,
        indicativeFundingLimitUSD: String(passport.indicativeFundingLimitUSD || "0"),
        indicativeSpreadBps: Number(passport.indicativeSpreadBps) || 0,
        fundingReadinessScore: String(passport.fundingReadinessScore || "50"),
        supplierCreditsEarnedUSD: String(passport.supplierCreditsEarnedUSD || "0"),
        marginLeakageAlertPercent: String(passport.marginLeakageAlertPercent || "0"),
      };
    }
    return {
      supplierName: "",
      country: "",
      industry: "",
      status: "pending",
      kycStatus: "pending",
      kycExpiryDate: null,
      esgRisk: "medium",
      forcedLaborRisk: "medium",
      contractedPaymentTerms: 30,
      contractedDiscountRate: "0",
      contractedRebateRate: "0",
      identifiedLeakageAnnualUSD: "0",
      actualAveragePaymentDays: "0",
      workingCapitalOpportunityScore: "50",
      scfEligible: false,
      riskBand: "BBB",
      indicativeFundingLimitUSD: "0",
      indicativeSpreadBps: 0,
      fundingReadinessScore: "50",
      supplierCreditsEarnedUSD: "0",
      marginLeakageAlertPercent: "0",
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
    values: passport ? getDefaultValues() : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        uboVerified: false,
        sanctionsHits: 0,
        pepFlag: false,
        averagePriceDeviationPercent: "0",
        rebateUtilisationPercent: "0",
        earlyPaymentPercent: "0",
        latePaymentPercent: "0",
        onTimePaymentPercent: "0",
        paymentVolatilityScore: "0",
        invoiceFinanceEligible: false,
        dynamicDiscountingEligible: false,
        blockingBarriers: [],
        supplierCreditsPendingUSD: "0",
        rebatesDueUSD: "0",
        cashFlowRecoveryUSD: "0",
        agenticActionFlags: []
      };

      let response;
      if (isEdit) {
        response = await apiRequest("PATCH", `/api/supplier-passports/${id}`, payload);
      } else {
        response = await apiRequest("POST", "/api/supplier-passports", payload);
      }
      
      // Parse JSON from Response object
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-passports"] });
      toast({
        title: isEdit ? "Passport Updated" : "Passport Created",
        description: `Supplier passport has been ${isEdit ? "updated" : "created"} successfully.`,
      });
      // Handle both edit and create redirects
      if (isEdit) {
        setLocation(`/supplier-passports/${id}`);
      } else {
        // For create, use the returned ID from the API response
        const newId = data?.id || data;
        console.log("Created passport with ID:", newId, "Full response:", data);
        setLocation(`/supplier-passports/${newId}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save supplier passport.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    saveMutation.mutate(data);
  };

  if (isEdit && isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Loading passport data...</p>
        </div>
      </div>
    );
  }

  return (
    <div key={passport?.id || "new-form"} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      <div className="mb-6">
        <Link href={isEdit ? `/supplier-passports/${id}` : "/supplier-passports"}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Edit Supplier Passport" : "New Supplier Passport"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit ? "Update supplier information" : "Create a new supplier intelligence profile"}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
            <TabsTrigger value="financing">Financing</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Supplier identity and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierName">Supplier Name *</Label>
                    <Input
                      id="supplierName"
                      {...form.register("supplierName")}
                      data-testid="input-supplier-name"
                    />
                    {form.formState.errors.supplierName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.supplierName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      {...form.register("country")}
                      placeholder="e.g., United Kingdom"
                      data-testid="input-country"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Input
                      id="industry"
                      {...form.register("industry")}
                      placeholder="e.g., Technology"
                      data-testid="input-industry"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(value) => form.setValue("status", value as any)}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="on_watchlist">On Watchlist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Risk</CardTitle>
                <CardDescription>KYC status and risk assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kycStatus">KYC Status</Label>
                    <Select
                      value={form.watch("kycStatus")}
                      onValueChange={(value) => form.setValue("kycStatus", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="kycExpiryDate">KYC Expiry Date</Label>
                    <Input
                      id="kycExpiryDate"
                      type="date"
                      {...form.register("kycExpiryDate")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="esgRisk">ESG Risk</Label>
                    <Select
                      value={form.watch("esgRisk")}
                      onValueChange={(value) => form.setValue("esgRisk", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="forcedLaborRisk">Forced Labor Risk</Label>
                    <Select
                      value={form.watch("forcedLaborRisk")}
                      onValueChange={(value) => form.setValue("forcedLaborRisk", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contract">
            <Card>
              <CardHeader>
                <CardTitle>Contract & Payment Terms</CardTitle>
                <CardDescription>Contracted terms and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contractedPaymentTerms">Payment Terms (days)</Label>
                    <Input
                      id="contractedPaymentTerms"
                      type="number"
                      {...form.register("contractedPaymentTerms")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contractedDiscountRate">Discount Rate (%)</Label>
                    <Input
                      id="contractedDiscountRate"
                      {...form.register("contractedDiscountRate")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contractedRebateRate">Rebate Rate (%)</Label>
                    <Input
                      id="contractedRebateRate"
                      {...form.register("contractedRebateRate")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="identifiedLeakageAnnualUSD">Identified Leakage (USD)</Label>
                    <Input
                      id="identifiedLeakageAnnualUSD"
                      {...form.register("identifiedLeakageAnnualUSD")}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="actualAveragePaymentDays">Actual Average Payment Days</Label>
                    <Input
                      id="actualAveragePaymentDays"
                      {...form.register("actualAveragePaymentDays")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="workingCapitalOpportunityScore">WC Opportunity Score (0-100)</Label>
                    <Input
                      id="workingCapitalOpportunityScore"
                      {...form.register("workingCapitalOpportunityScore")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="marginLeakageAlertPercent">Margin Leakage Alert (%)</Label>
                    <Input
                      id="marginLeakageAlertPercent"
                      {...form.register("marginLeakageAlertPercent")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financing">
            <Card>
              <CardHeader>
                <CardTitle>Financing & Capital Access</CardTitle>
                <CardDescription>Funding eligibility and options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="scfEligible"
                      type="checkbox"
                      {...form.register("scfEligible")}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="scfEligible" className="cursor-pointer">
                      SCF Eligible
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="riskBand">Risk Band</Label>
                    <Select
                      value={form.watch("riskBand")}
                      onValueChange={(value) => form.setValue("riskBand", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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

                  <div>
                    <Label htmlFor="indicativeFundingLimitUSD">Indicative Funding Limit (USD)</Label>
                    <Input
                      id="indicativeFundingLimitUSD"
                      {...form.register("indicativeFundingLimitUSD")}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="indicativeSpreadBps">Indicative Spread (bps)</Label>
                    <Input
                      id="indicativeSpreadBps"
                      type="number"
                      {...form.register("indicativeSpreadBps")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fundingReadinessScore">Funding Readiness Score (0-100)</Label>
                    <Input
                      id="fundingReadinessScore"
                      {...form.register("fundingReadinessScore")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplierCreditsEarnedUSD">Supplier Credits Earned (USD)</Label>
                    <Input
                      id="supplierCreditsEarnedUSD"
                      {...form.register("supplierCreditsEarnedUSD")}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Link href={isEdit ? `/supplier-passports/${id}` : "/supplier-passports"}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={saveMutation.isPending}
            data-testid="button-save"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : isEdit ? "Update Passport" : "Create Passport"}
          </Button>
        </div>
      </form>
    </div>
  );
}
