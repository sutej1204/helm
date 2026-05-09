import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, DollarSign, Percent, FileText, HelpCircle, AlertCircle } from "lucide-react";

// Types for the tariff calculator
interface TariffResult {
  dutyAmount: number;
  mpfAmount: number;
  hmfAmount: number;
  totalDutyAndFees: number;
  landedCost: number;
  effectiveDutyRate: number;
}

export default function TariffCalculator() {
  // Form state
  const [productValue, setProductValue] = useState<string>("");
  const [shippingCost, setShippingCost] = useState<string>("");
  const [insuranceCost, setInsuranceCost] = useState<string>("");
  const [dutyRate, setDutyRate] = useState<string>("");
  const [country, setCountry] = useState<string>("CN");
  const [htsCode, setHtsCode] = useState<string>("");
  
  // Result state
  const [result, setResult] = useState<TariffResult | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Calculate the tariff
  const calculateTariff = () => {
    const productValueNum = parseFloat(productValue) || 0;
    const shippingCostNum = parseFloat(shippingCost) || 0;
    const insuranceCostNum = parseFloat(insuranceCost) || 0;
    const dutyRateNum = parseFloat(dutyRate) || 0;
    
    // Calculate customs value (product + shipping + insurance)
    const customsValue = productValueNum + shippingCostNum + insuranceCostNum;
    
    // Calculate duty amount
    const dutyAmount = customsValue * (dutyRateNum / 100);
    
    // Calculate MPF (Merchandise Processing Fee)
    // MPF is 0.3464% of the customs value, minimum $27.23, maximum $528.33
    const mpfRate = 0.3464 / 100;
    let mpfAmount = customsValue * mpfRate;
    mpfAmount = Math.max(mpfAmount, 27.23);
    mpfAmount = Math.min(mpfAmount, 528.33);
    
    // Calculate HMF (Harbor Maintenance Fee)
    // HMF is 0.125% of the customs value
    const hmfRate = 0.125 / 100;
    const hmfAmount = customsValue * hmfRate;
    
    // Calculate total duty and fees
    const totalDutyAndFees = dutyAmount + mpfAmount + hmfAmount;
    
    // Calculate landed cost
    const landedCost = customsValue + totalDutyAndFees;
    
    // Calculate effective duty rate
    const effectiveDutyRate = (totalDutyAndFees / customsValue) * 100;
    
    // Set the result
    setResult({
      dutyAmount,
      mpfAmount,
      hmfAmount,
      totalDutyAndFees,
      landedCost,
      effectiveDutyRate,
    });
    
    setShowResults(true);
  };

  // Common countries for imports
  const countries = [
    { code: "CN", name: "China" },
    { code: "MX", name: "Mexico" },
    { code: "CA", name: "Canada" },
    { code: "JP", name: "Japan" },
    { code: "DE", name: "Germany" },
    { code: "KR", name: "South Korea" },
    { code: "VN", name: "Vietnam" },
    { code: "IN", name: "India" },
    { code: "TW", name: "Taiwan" },
    { code: "MY", name: "Malaysia" },
    { code: "TH", name: "Thailand" },
    { code: "IT", name: "Italy" },
    { code: "GB", name: "United Kingdom" },
    { code: "FR", name: "France" },
    { code: "BR", name: "Brazil" },
  ];

  // Reset form
  const resetForm = () => {
    setProductValue("");
    setShippingCost("");
    setInsuranceCost("");
    setDutyRate("");
    setCountry("CN");
    setHtsCode("");
    setShowResults(false);
    setResult(null);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tariff Calculator</h1>
            <p className="text-gray-500 mt-1">
              Calculate import duties, fees, and total landed costs for international shipments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Import Duty Calculator</CardTitle>
                <CardDescription>
                  Enter your product details to calculate import duties and fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country of Origin</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="htsCode">
                        <div className="flex items-center">
                          HTS Code
                          <a 
                            href="https://hts.usitc.gov/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-500 hover:text-blue-700"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </a>
                        </div>
                      </Label>
                      <Input
                        id="htsCode"
                        placeholder="e.g. 8471.30.0100"
                        value={htsCode}
                        onChange={(e) => setHtsCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="productValue">Product Value (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="productValue"
                          className="pl-10"
                          placeholder="0.00"
                          value={productValue}
                          onChange={(e) => setProductValue(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingCost">Shipping Cost (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="shippingCost"
                          className="pl-10"
                          placeholder="0.00"
                          value={shippingCost}
                          onChange={(e) => setShippingCost(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceCost">Insurance Cost (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="insuranceCost"
                          className="pl-10"
                          placeholder="0.00"
                          value={insuranceCost}
                          onChange={(e) => setInsuranceCost(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dutyRate">
                      <div className="flex items-center">
                        Duty Rate (%)
                        <a 
                          href="https://dataweb.usitc.gov/tariff/database" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </a>
                      </div>
                    </Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="dutyRate"
                        className="pl-10"
                        placeholder="0.0"
                        value={dutyRate}
                        onChange={(e) => setDutyRate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="button" onClick={calculateTariff}>
                      <Calculator className="mr-2 h-4 w-4" /> Calculate
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
                <CardDescription>
                  Estimated duties, fees, and landed cost
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showResults && (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">Enter your product details and click calculate to see the results</p>
                  </div>
                )}

                {showResults && result && (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="text-xl font-bold text-primary">
                        ${result.landedCost.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total Landed Cost</div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Customs Value</span>
                        <span className="font-medium">
                          ${(parseFloat(productValue) + parseFloat(shippingCost || "0") + parseFloat(insuranceCost || "0")).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Duty ({parseFloat(dutyRate).toFixed(1)}%)</span>
                        <span className="font-medium">${result.dutyAmount.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">MPF (0.3464%)</span>
                        <span className="font-medium">${result.mpfAmount.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">HMF (0.125%)</span>
                        <span className="font-medium">${result.hmfAmount.toFixed(2)}</span>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center font-medium">
                        <span>Total Duties & Fees</span>
                        <span>${result.totalDutyAndFees.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span>Effective Duty Rate</span>
                        <span>{result.effectiveDutyRate.toFixed(2)}%</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        This is an estimate only. Actual duties and fees may vary depending on specific product details, country of origin, and current regulations.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Guide to U.S. Import Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-medium">Duty Rate</h3>
                    <p className="text-gray-600">Varies by product and country. Use the HTS code to find the correct rate.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Merchandise Processing Fee (MPF)</h3>
                    <p className="text-gray-600">0.3464% of the value, minimum $27.23, maximum $528.33.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Harbor Maintenance Fee (HMF)</h3>
                    <p className="text-gray-600">0.125% of the value. Applies to sea shipments only.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
