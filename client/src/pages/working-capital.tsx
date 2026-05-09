import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target, 
  FileText, 
  Download,
  Upload,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  Banknote,
  CreditCard,
  Calculator,
  Zap,
  Users,
  BarChart3
} from "lucide-react";

// Sample data for demonstration
const supplierData = [
  { id: 1, name: "TechCorp Solutions", currentTerms: 30, invoiceValue: 125000, riskRating: "Low", tier: "Strategic", recommendedTerms: 45, potentialSavings: 8750 },
  { id: 2, name: "Global Manufacturing", currentTerms: 60, invoiceValue: 350000, riskRating: "Medium", tier: "Core", recommendedTerms: 75, potentialSavings: 18200 },
  { id: 3, name: "Supply Chain Partners", currentTerms: 30, invoiceValue: 85000, riskRating: "Low", tier: "Preferred", recommendedTerms: 60, potentialSavings: 14200 },
  { id: 4, name: "Industrial Components", currentTerms: 90, invoiceValue: 220000, riskRating: "High", tier: "Core", recommendedTerms: 90, potentialSavings: 0 },
  { id: 5, name: "FastTrack Logistics", currentTerms: 45, invoiceValue: 95000, riskRating: "Medium", tier: "Operational", recommendedTerms: 60, potentialSavings: 4750 },
];

const receivablesData = [
  { id: 1, buyer: "MegaRetail Corp", invoiceValue: 185000, paymentDate: "2025-02-15", creditScore: "A+", factorRate: 2.5 },
  { id: 2, buyer: "Enterprise Solutions", invoiceValue: 95000, paymentDate: "2025-02-28", creditScore: "A", factorRate: 3.2 },
  { id: 3, buyer: "Global Distribution", invoiceValue: 310000, paymentDate: "2025-03-10", creditScore: "A-", factorRate: 3.8 },
  { id: 4, buyer: "TechStart Inc", invoiceValue: 75000, paymentDate: "2025-02-20", creditScore: "B+", factorRate: 4.5 },
];

const payablesFinancingData = [
  { id: 1, supplier: "Premium Parts Ltd", invoiceValue: 145000, currentDate: "2025-02-15", earlyPayDate: "2025-01-25", discount: 2.1, apr: 15.8 },
  { id: 2, supplier: "Quality Components", invoiceValue: 89000, currentDate: "2025-02-20", earlyPayDate: "2025-01-30", discount: 1.8, apr: 13.2 },
  { id: 3, supplier: "Reliable Manufacturing", invoiceValue: 267000, currentDate: "2025-03-01", earlyPayDate: "2025-02-10", discount: 2.4, apr: 17.1 },
];

export default function WorkingCapital() {
  const [activeTab, setActiveTab] = useState("term-optimization");
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [selectedReceivables, setSelectedReceivables] = useState<number[]>([]);
  const [selectedPayables, setSelectedPayables] = useState<number[]>([]);
  const [cashFlowImpact, setCashFlowImpact] = useState([75]);
  const [dsoValue, setDsoValue] = useState(45);
  const [dpoValue, setDpoValue] = useState(60);
  const [financingPercentage, setFinancingPercentage] = useState(25);
  const [executionStatus, setExecutionStatus] = useState<string>("");

  const handleSupplierSelect = (supplierId: number) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const calculateTotalSavings = () => {
    return selectedSuppliers.reduce((total, id) => {
      const supplier = supplierData.find(s => s.id === id);
      return total + (supplier?.potentialSavings || 0);
    }, 0);
  };

  const calculateReceivablesFinancing = () => {
    const selectedInvoices = receivablesData.filter(r => selectedReceivables.includes(r.id));
    const totalValue = selectedInvoices.reduce((sum, inv) => sum + inv.invoiceValue, 0);
    const advanceRate = 0.85; // 85% advance rate
    const funding = totalValue * advanceRate;
    return { totalValue, funding };
  };

  const calculatePayablesFinancing = () => {
    const selectedInvoices = payablesFinancingData.filter(p => selectedPayables.includes(p.id));
    const totalValue = selectedInvoices.reduce((sum, inv) => sum + inv.invoiceValue, 0);
    const totalSavings = selectedInvoices.reduce((sum, inv) => sum + (inv.invoiceValue * inv.discount / 100), 0);
    return { totalValue, totalSavings };
  };

  const simulateAction = (action: string) => {
    setExecutionStatus(`Executing ${action}...`);
    setTimeout(() => {
      setExecutionStatus(`✓ ${action} completed successfully`);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Supply Chain Finance</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">Unlock cash flow through AI-driven payment term optimization and embedded financing</p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button variant="outline" className="flex items-center gap-2 text-xs md:text-sm">
              <Upload className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Import Data</span>
              <span className="sm:hidden">Import</span>
            </Button>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-xs md:text-sm">
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              Available Cash Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">£94K</div>
            <p className="text-xs text-green-600 mt-1">+{cashFlowImpact[0]}% optimization potential</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Current DPO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dpoValue} days</div>
            <p className="text-xs text-blue-600 mt-1">Target: {dpoValue + 15} days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
              DSO Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dsoValue} days</div>
            <p className="text-xs text-purple-600 mt-1">Industry avg: 52 days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2 text-orange-600" />
              Financing Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{financingPercentage}%</div>
            <p className="text-xs text-orange-600 mt-1">of eligible invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Cash Optimization Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-800">AI-Powered Cash Optimization Active</AlertTitle>
        <AlertDescription className="text-blue-700">
          Helm's AI engine is continuously analyzing your supplier network and payment patterns. Current optimization score: <span className="font-bold">87/100</span>. 
          Potential cash release: <span className="font-bold">£94K</span> through intelligent term adjustments.
        </AlertDescription>
      </Alert>

      {/* Main Interface Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="term-optimization" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Calculator className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Term Optimization</span>
            <span className="sm:hidden">Terms</span>
          </TabsTrigger>
          <TabsTrigger value="receivables" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Receivables Financing</span>
            <span className="sm:hidden">Receivables</span>
          </TabsTrigger>
          <TabsTrigger value="payables" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Banknote className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Payables Financing</span>
            <span className="sm:hidden">Payables</span>
          </TabsTrigger>
          <TabsTrigger value="scenario" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Scenario Simulator</span>
            <span className="sm:hidden">Scenario</span>
          </TabsTrigger>
          <TabsTrigger value="execution" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Zap className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Action Center</span>
            <span className="sm:hidden">Actions</span>
          </TabsTrigger>
        </TabsList>

        {/* Term Optimization Engine */}
        <TabsContent value="term-optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                AI-Driven Term Optimization Engine
              </CardTitle>
              <CardDescription>
                Analyze supplier payment terms and identify opportunities to extend payment periods while maintaining supplier relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Cash Flow Impact Slider */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <Label className="text-sm font-medium mb-3 block">Cash Flow Optimization Impact (%)</Label>
                <Slider
                  value={cashFlowImpact}
                  onValueChange={setCashFlowImpact}
                  max={100}
                  step={5}
                  className="mb-3"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Conservative: {cashFlowImpact[0]}%</span>
                  <span>Projected Cash Release: £{(calculateTotalSavings() * cashFlowImpact[0] / 100 / 1000).toFixed(0)}K</span>
                </div>
              </div>

              {/* Suppliers Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[60px]">Select</TableHead>
                    <TableHead className="min-w-[150px]">Supplier</TableHead>
                    <TableHead className="min-w-[100px]">Current Terms</TableHead>
                    <TableHead className="min-w-[120px]">Invoice Value</TableHead>
                    <TableHead className="min-w-[100px]">Risk Rating</TableHead>
                    <TableHead className="min-w-[100px]">Tier</TableHead>
                    <TableHead className="min-w-[120px]">AI Recommended</TableHead>
                    <TableHead className="min-w-[140px]">Potential Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierData.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSuppliers.includes(supplier.id)}
                          onCheckedChange={() => handleSupplierSelect(supplier.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.currentTerms} days</TableCell>
                      <TableCell>£{supplier.invoiceValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.riskRating === "Low" ? "default" : supplier.riskRating === "Medium" ? "secondary" : "destructive"}>
                          {supplier.riskRating}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{supplier.tier}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={supplier.recommendedTerms > supplier.currentTerms ? "text-green-600 font-medium" : "text-gray-500"}>
                          {supplier.recommendedTerms} days
                        </span>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        £{supplier.potentialSavings.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Selected Suppliers: {selectedSuppliers.length}</span>
                  <span className="text-lg font-bold text-green-600">Total Potential Savings: £{calculateTotalSavings().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receivables Financing */}
        <TabsContent value="receivables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Receivables Financing Panel
              </CardTitle>
              <CardDescription>
                Convert outstanding invoices to immediate cash through non-recourse factoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[60px]">Select</TableHead>
                    <TableHead className="min-w-[150px]">Buyer</TableHead>
                    <TableHead className="min-w-[120px]">Invoice Value</TableHead>
                    <TableHead className="min-w-[120px]">Payment Date</TableHead>
                    <TableHead className="min-w-[100px]">Credit Score</TableHead>
                    <TableHead className="min-w-[100px]">Factor Rate</TableHead>
                    <TableHead className="min-w-[120px]">Advance (85%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivablesData.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReceivables.includes(invoice.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReceivables(prev => [...prev, invoice.id]);
                            } else {
                              setSelectedReceivables(prev => prev.filter(id => id !== invoice.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.buyer}</TableCell>
                      <TableCell>£{invoice.invoiceValue.toLocaleString()}</TableCell>
                      <TableCell>{invoice.paymentDate}</TableCell>
                      <TableCell>
                        <Badge variant="default">{invoice.creditScore}</Badge>
                      </TableCell>
                      <TableCell>{invoice.factorRate}%</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        £{(invoice.invoiceValue * 0.85).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Selected Invoice Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">£{calculateReceivablesFinancing().totalValue.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Immediate Funding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-green-600">£{calculateReceivablesFinancing().funding.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">DSO Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-purple-600">-12 days</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payables Financing */}
        <TabsContent value="payables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-green-600" />
                Payables Financing Tool
              </CardTitle>
              <CardDescription>
                Access early payment discounts through third-party funding solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[60px]">Select</TableHead>
                    <TableHead className="min-w-[150px]">Supplier</TableHead>
                    <TableHead className="min-w-[120px]">Invoice Value</TableHead>
                    <TableHead className="min-w-[120px]">Current Due Date</TableHead>
                    <TableHead className="min-w-[120px]">Early Pay Date</TableHead>
                    <TableHead className="min-w-[100px]">Discount %</TableHead>
                    <TableHead className="min-w-[100px]">Effective APR</TableHead>
                    <TableHead className="min-w-[100px]">Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payablesFinancingData.map((payable) => (
                    <TableRow key={payable.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPayables.includes(payable.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPayables(prev => [...prev, payable.id]);
                            } else {
                              setSelectedPayables(prev => prev.filter(id => id !== payable.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{payable.supplier}</TableCell>
                      <TableCell>£{payable.invoiceValue.toLocaleString()}</TableCell>
                      <TableCell>{payable.currentDate}</TableCell>
                      <TableCell className="text-blue-600">{payable.earlyPayDate}</TableCell>
                      <TableCell className="text-green-600">{payable.discount}%</TableCell>
                      <TableCell>{payable.apr}%</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        £{(payable.invoiceValue * payable.discount / 100).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Invoice Value</span>
                    <div className="text-lg font-bold">£{calculatePayablesFinancing().totalValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Savings</span>
                    <div className="text-lg font-bold text-green-600">£{calculatePayablesFinancing().totalSavings.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Simulator */}
        <TabsContent value="scenario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Working Capital Scenario Simulator
              </CardTitle>
              <CardDescription>
                Model the impact of different financing strategies on your cash flow and working capital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label>Days Sales Outstanding (DSO)</Label>
                  <Input
                    type="number"
                    value={dsoValue}
                    onChange={(e) => setDsoValue(parseInt(e.target.value) || 45)}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">Current: {dsoValue} days</span>
                </div>
                <div className="space-y-3">
                  <Label>Days Payable Outstanding (DPO)</Label>
                  <Input
                    type="number"
                    value={dpoValue}
                    onChange={(e) => setDpoValue(parseInt(e.target.value) || 60)}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">Current: {dpoValue} days</span>
                </div>
                <div className="space-y-3">
                  <Label>Financing Utilization (%)</Label>
                  <Input
                    type="number"
                    value={financingPercentage}
                    onChange={(e) => setFinancingPercentage(parseInt(e.target.value) || 25)}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">% of eligible invoices</span>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Free Cash Flow Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      +£{((dpoValue - 45) * 5000 + (45 - dsoValue) * 3000 + financingPercentage * 1000).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">vs baseline scenario</p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Net Working Capital
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      £{(2500000 - (dpoValue - dsoValue) * 15000).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">optimized working capital</p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Risk Exposure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.max(15, 35 - financingPercentage / 5)}%
                    </div>
                    <p className="text-xs text-gray-600 mt-1">supply chain risk level</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Board Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Execution */}
        <TabsContent value="execution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-600" />
                Action Execution Panel
              </CardTitle>
              <CardDescription>
                Execute financing workflows and track implementation status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  size="lg" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => simulateAction("Extend Terms & Notify Suppliers")}
                >
                  <Users className="h-6 w-6" />
                  Extend Terms & Notify Suppliers
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => simulateAction("Request Payables Financing")}
                >
                  <Banknote className="h-6 w-6" />
                  Request Payables Financing
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => simulateAction("Finance Receivables")}
                >
                  <CreditCard className="h-6 w-6" />
                  Finance Receivables
                </Button>
              </div>

              {/* Status */}
              {executionStatus && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Execution Status</AlertTitle>
                  <AlertDescription>{executionStatus}</AlertDescription>
                </Alert>
              )}

              {/* Mock API Console */}
              <Card className="bg-gray-900 text-green-400">
                <CardHeader>
                  <CardTitle className="text-green-400 text-sm">API Console Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono">
{`POST /api/working-capital/extend-terms
{
  "suppliers": [${selectedSuppliers.join(', ')}],
  "new_terms": "45-75 days",
  "notification_method": "email",
  "effective_date": "2025-02-01"
}

Response: 200 OK
{
  "status": "success",
  "suppliers_notified": ${selectedSuppliers.length},
  "estimated_cash_impact": "£${calculateTotalSavings().toLocaleString()}",
  "implementation_timeline": "7-14 days"
}`}
                  </pre>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}