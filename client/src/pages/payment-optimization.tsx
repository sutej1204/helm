import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { 
  AlertTriangle, 
  ArrowRight, 
  Building, 
  Calendar, 
  DollarSign, 
  FileText, 
  Filter, 
  LineChart, 
  Loader2, 
  Plus, 
  Search, 
  Settings, 
  Sparkles, 
  TrendingUp, 
  Download,
  BarChart4,
  ScrollText,
  Briefcase,
  CircleDollarSign,
  CircleCheck,
  MoveUpRight
} from "lucide-react";

// Type definitions for API data
interface Supplier {
  id: number;
  name: string;
  code: string;
  category: string;
  status: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  riskScore: number | null;
  complianceRate: number | null;
  spendAmount: number | null;
  paymentTerms: number | null;
  lastAssessmentDate: Date | null;
}

interface PaymentTerms {
  id: number;
  supplierId: number;
  terms: number;
  discountPercentage: string | null;
  discountDays: number | null;
  annualSpend: string;
  invoiceCount: number;
  averageInvoiceAmount: string | null;
  effectiveDate: string;
  expirationDate: string | null;
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface PaymentHistory {
  id: number;
  supplierId: number;
  paymentTerms: number;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: string;
  paymentDate: string | null;
  paymentAmount: string | null;
  actualPaymentDays: number | null;
  discountTaken: boolean | null;
  discountAmount: string | null;
  createdAt: Date | null;
}

interface PaymentOptimization {
  id: number;
  supplierId: number;
  currentTerms: number;
  recommendedTerms: number;
  annualSpend: string;
  currentWorkingCapitalImpact: string;
  optimizedWorkingCapitalImpact: string;
  savingsOpportunity: string;
  implementationDifficulty: string;
  supplierRelationshipImpact: string;
  industryBenchmark: number | null;
  recommendationRationale: string;
  implementationStatus: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface IndustryBenchmark {
  id: number;
  industryName: string;
  averageDPO: number;
  topQuartileDPO: number;
  bottomQuartileDPO: number;
  region: string | null;
  companySize: string | null;
  year: number;
  source: string | null;
  createdAt: Date | null;
}

interface OptimizationWithSupplier extends PaymentOptimization {
  supplier: Supplier;
  industry?: string;
  riskLevel?: string;
}

// Mock data for supplier optimization opportunities - will be replaced by API data
const mockSupplierOptimizations = [
  {
    id: 1,
    name: "Acme Electronics Ltd.",
    currentTerms: 30,
    recommendedTerms: 60,
    annualSpend: 2450000,
    workingCapitalImprovement: 204167,
    industry: "Electronics Manufacturing",
    country: "Taiwan",
    category: "Raw Materials",
    score: 87,
    riskLevel: "Low",
  },
  {
    id: 2,
    name: "Global Logistics Inc.",
    currentTerms: 15,
    recommendedTerms: 45,
    annualSpend: 1800000,
    workingCapitalImprovement: 150000,
    industry: "Transportation & Logistics",
    country: "Singapore",
    category: "Services",
    score: 92,
    riskLevel: "Low",
  },
  {
    id: 3,
    name: "Stellar Packaging Solutions",
    currentTerms: 45,
    recommendedTerms: 60,
    annualSpend: 950000,
    workingCapitalImprovement: 39583,
    industry: "Packaging",
    country: "United States",
    category: "Components",
    score: 75,
    riskLevel: "Medium",
  },
  {
    id: 4,
    name: "EastAsia Manufacturing Co.",
    currentTerms: 30,
    recommendedTerms: 75,
    annualSpend: 3200000,
    workingCapitalImprovement: 400000,
    industry: "Industrial Manufacturing",
    country: "China",
    category: "Components",
    score: 68,
    riskLevel: "Medium",
  },
  {
    id: 5,
    name: "TechSoft Services Ltd.",
    currentTerms: 30,
    recommendedTerms: 45,
    annualSpend: 780000,
    workingCapitalImprovement: 32500,
    industry: "IT Services",
    country: "India",
    category: "IT & Software",
    score: 81,
    riskLevel: "Low",
  },
];

// Mock summary metrics
const summaryMetrics = {
  totalOpportunities: mockSupplierOptimizations.length,
  totalAnnualSpend: mockSupplierOptimizations.reduce((sum, supplier) => sum + supplier.annualSpend, 0),
  totalImprovement: mockSupplierOptimizations.reduce((sum, supplier) => sum + supplier.workingCapitalImprovement, 0),
  averageCurrentDPO: 30,
  averageOptimizedDPO: 57,
  benchmarkComparison: 78, // percentile compared to industry
};

// Benchmark data for industry comparison
const industryBenchmarks = [
  { industry: 'Electronics Manufacturing', averageDPO: 52, topQuartileDPO: 68 },
  { industry: 'Transportation & Logistics', averageDPO: 43, topQuartileDPO: 60 },
  { industry: 'Packaging', averageDPO: 47, topQuartileDPO: 65 },
  { industry: 'Industrial Manufacturing', averageDPO: 50, topQuartileDPO: 72 },
  { industry: 'IT Services', averageDPO: 35, topQuartileDPO: 45 },
];

// Component for calculating score color
const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

const getBadgeColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
}

// Summary card for displaying top-level metrics
function SummaryCard({ title, value, icon, description }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline mt-1">
              <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
            </div>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface IndustryBenchmarkProps {
  industry: {
    industry: string;
    averageDPO: number;
    topQuartileDPO: number;
  };
}

// Industry benchmark component
function IndustryBenchmark({ industry }: IndustryBenchmarkProps) {
  return (
    <div className="border rounded-md p-4 hover:shadow-sm transition-shadow">
      <h4 className="font-medium text-sm mb-2">{industry.industry}</h4>
      <div className="flex justify-between items-center mb-1 text-xs">
        <span>Average</span>
        <span>Top Quartile</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-1 relative">
        <div 
          className="absolute h-2 bg-blue-500 rounded-full" 
          style={{ width: `${(industry.averageDPO / 90) * 100}%` }}
        ></div>
        <div 
          className="absolute h-3 w-3 bg-blue-500 rounded-full top-1/2 transform -translate-y-1/2 border-2 border-white" 
          style={{ left: `${(industry.topQuartileDPO / 90) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{industry.averageDPO} days</span>
        <span>{industry.topQuartileDPO} days</span>
      </div>
    </div>
  );
}

export default function PaymentOptimization() {
  const [activeTab, setActiveTab] = useState('opportunities');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [, navigate] = useLocation();
  
  // Query hooks for data fetching
  const { data: optimizations = [], isLoading: isLoadingOptimizations } = useQuery<PaymentOptimization[]>({
    queryKey: ['/api/payment-optimization'],
    queryFn: getQueryFn<PaymentOptimization[]>({
      on401: 'returnNull'
    })
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
    queryFn: getQueryFn<Supplier[]>({
      on401: 'returnNull'
    })
  });

  const { data: industryBenchmarksData = [], isLoading: isLoadingBenchmarks } = useQuery<IndustryBenchmark[]>({
    queryKey: ['/api/industry-benchmarks'],
    queryFn: getQueryFn<IndustryBenchmark[]>({
      on401: 'returnNull'
    })
  });

  // Combine optimization data with supplier details
  const optimizationsWithDetails: OptimizationWithSupplier[] = optimizations.map(optimization => {
    const supplier = suppliers.find(s => s.id === optimization.supplierId);
    if (!supplier) {
      return { ...optimization, supplier: { id: optimization.supplierId } as Supplier, industry: 'Unknown', riskLevel: 'Unknown' };
    }
    
    // Determine risk level based on supplier risk score
    let riskLevel = 'Medium';
    if (supplier.riskScore !== null) {
      if (supplier.riskScore >= 80) riskLevel = 'Low';
      else if (supplier.riskScore >= 60) riskLevel = 'Medium';
      else if (supplier.riskScore >= 40) riskLevel = 'High';
      else riskLevel = 'Critical';
    }
    
    return { 
      ...optimization, 
      supplier,
      riskLevel
    };
  });
  
  // Filter suppliers based on search and category
  const filteredOptimizations = optimizationsWithDetails.filter(item => {
    const matchesSearch = item.supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = categoryFilter === 'all' || item.supplier.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate metrics
  const calculatedMetrics = {
    totalOpportunities: optimizationsWithDetails.length,
    totalAnnualSpend: optimizationsWithDetails.reduce((sum, item) => {
      const spend = parseFloat(item.annualSpend) || 0;
      return sum + spend;
    }, 0),
    totalImprovement: optimizationsWithDetails.reduce((sum, item) => {
      const savings = parseFloat(item.savingsOpportunity) || 0;
      return sum + savings;
    }, 0),
    averageCurrentDPO: Math.round(optimizationsWithDetails.reduce((sum, item) => sum + item.currentTerms, 0) / Math.max(1, optimizationsWithDetails.length)),
    averageOptimizedDPO: Math.round(optimizationsWithDetails.reduce((sum, item) => sum + item.recommendedTerms, 0) / Math.max(1, optimizationsWithDetails.length)),
    benchmarkComparison: 78 // This would need to be calculated based on industry data
  };

  // Use real metrics if we have data, otherwise fall back to mock data for UI preview
  const displayMetrics = optimizationsWithDetails.length > 0 ? calculatedMetrics : summaryMetrics;
  
  // Unique categories for filter from real suppliers
  const uniqueCategories = suppliers.map(s => s.category).filter(Boolean) as string[];
  const categories = ['all', ...Array.from(new Set(uniqueCategories))];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Payment Term Optimization</h1>
            <p className="text-gray-500 mt-1">Powered by advanced AI analytics engine</p>
            <div className="mt-2 flex items-center">
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1.5 mr-2">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Analytics
              </Badge>
              <span className="text-xs text-gray-500">Access to 1.2M+ company benchmarks</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800">AI-Powered Analysis Active</AlertTitle>
          <AlertDescription className="text-blue-700">
            SupplierIQ is currently analyzing your payment terms using advanced AI benchmarking technology. Over 1.2 million company profiles are being analyzed for optimal payment terms.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard 
            title="Working Capital Improvement" 
            value={`$${(displayMetrics.totalImprovement).toLocaleString()}`}
            icon={<CircleDollarSign className="h-5 w-5 text-primary" />}
            description="Potential annual improvement"
          />
          <SummaryCard 
            title="Current vs. Optimized DPO" 
            value={`${displayMetrics.averageCurrentDPO} → ${displayMetrics.averageOptimizedDPO} days`}
            icon={<Calendar className="h-5 w-5 text-primary" />}
            description="Average days payable outstanding"
          />
          <SummaryCard 
            title="Industry Benchmark" 
            value={`${displayMetrics.benchmarkComparison}th percentile`}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            description="Your position vs. industry peers"
          />
        </div>

        <Tabs defaultValue="suppliers" onValueChange={setActiveTab} className="mb-8">
          <div className="flex justify-between items-center border-b mb-4">
            <TabsList className="mb-[-1px]">
              <TabsTrigger value="suppliers">All Suppliers</TabsTrigger>
              <TabsTrigger value="opportunities">Optimization Opportunities</TabsTrigger>
              <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="suppliers">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search suppliers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left font-medium py-3 pl-4">Supplier</th>
                          <th className="text-left font-medium py-3">Category</th>
                          <th className="text-left font-medium py-3">Current Terms</th>
                          <th className="text-left font-medium py-3">Annual Spend</th>
                          <th className="text-center font-medium py-3">Risk Score</th>
                          <th className="text-center font-medium py-3">Status</th>
                          <th className="text-right font-medium py-3 pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingSuppliers ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center">
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 mr-2 animate-spin text-primary" />
                                <span>Loading suppliers...</span>
                              </div>
                            </td>
                          </tr>
                        ) : suppliers.length > 0 ? (
                          suppliers
                            .filter(supplier => 
                              (categoryFilter === 'all' || supplier.category === categoryFilter) &&
                              (searchTerm === '' || supplier.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            )
                            .map((supplier) => {
                              // Find the payment terms for this supplier if available
                              const paymentTerms = optimizationsWithDetails.find(opt => opt.supplier.id === supplier.id);
                              
                              return (
                                <tr key={supplier.id} className="border-b hover:bg-gray-50">
                                  <td className="py-3 pl-4">
                                    <div>
                                      <div className="font-medium">{supplier.name}</div>
                                      <div className="text-xs text-gray-500">{supplier.code}</div>
                                    </div>
                                  </td>
                                  <td className="py-3">{supplier.category}</td>
                                  <td className="py-3">{paymentTerms ? `${paymentTerms.currentTerms} days` : 'N/A'}</td>
                                  <td className="py-3">{supplier.spendAmount ? `$${parseFloat(supplier.spendAmount.toString()).toLocaleString()}` : 'N/A'}</td>
                                  <td className="py-3 text-center">
                                    <span className={`font-medium ${getScoreColor(supplier.riskScore || 0)}`}>
                                      {supplier.riskScore || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="py-3 text-center">
                                    <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}>
                                      {supplier.status ? supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1) : 'Unknown'}
                                    </Badge>
                                  </td>
                                  <td className="py-3 pr-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                      Optimize
                                    </Button>
                                  </td>
                                </tr>
                              );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center">
                              <p className="text-gray-500">No suppliers match your search criteria</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-4 py-3 text-sm flex justify-between items-center">
                  <div className="text-gray-500">
                    Showing {suppliers.filter(supplier => 
                      (categoryFilter === 'all' || supplier.category === categoryFilter) &&
                      (searchTerm === '' || supplier.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).length} of {suppliers.length} suppliers
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="opportunities">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search suppliers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left font-medium py-3 pl-4">Supplier</th>
                          <th className="text-left font-medium py-3">Current Terms</th>
                          <th className="text-left font-medium py-3">Recommended</th>
                          <th className="text-left font-medium py-3">Annual Spend</th>
                          <th className="text-left font-medium py-3">Working Capital Improvement</th>
                          <th className="text-center font-medium py-3">Score</th>
                          <th className="text-center font-medium py-3">Risk</th>
                          <th className="text-right font-medium py-3 pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingOptimizations || isLoadingSuppliers ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center">
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 mr-2 animate-spin text-primary" />
                                <span>Loading optimization data...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredOptimizations.length > 0 ? (
                          filteredOptimizations.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 pl-4">
                                <div>
                                  <div className="font-medium">{item.supplier.name}</div>
                                  <div className="text-xs text-gray-500">{item.supplier.category}</div>
                                </div>
                              </td>
                              <td className="py-3">{item.currentTerms} days</td>
                              <td className="py-3 font-medium text-primary">{item.recommendedTerms} days</td>
                              <td className="py-3">${parseFloat(item.annualSpend).toLocaleString()}</td>
                              <td className="py-3">
                                <div className="flex items-center">
                                  <span className="font-medium">${parseFloat(item.savingsOpportunity).toLocaleString()}</span>
                                  <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full">
                                    +{Math.round((item.recommendedTerms - item.currentTerms) / Math.max(1, item.currentTerms) * 100)}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`font-medium ${getScoreColor(item.supplier.riskScore || 70)}`}>
                                  {item.supplier.riskScore || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <Badge className={`${getBadgeColor(item.riskLevel || 'Medium')} border`}>
                                  {item.riskLevel || 'Medium'}
                                </Badge>
                              </td>
                              <td className="py-3 pr-4 text-right">
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                  Details
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-8 text-center">
                              <p className="text-gray-500">No optimization opportunities match your search criteria</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </CardContent>
                <CardFooter className="border-t px-4 py-3 text-sm flex justify-between items-center">
                  <div className="text-gray-500">
                    Showing {filteredOptimizations.length} of {optimizationsWithDetails.length} optimization opportunities
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="benchmarks">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Payment Term Benchmarks</CardTitle>
                  <CardDescription>
                    Compare your payment terms against industry standards using our comprehensive database of over 1.2 million companies
                  </CardDescription>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Data science-driven
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      AI-enhanced analytics
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingBenchmarks ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 mr-2 animate-spin text-primary" />
                      <span>Loading benchmark data...</span>
                    </div>
                  ) : industryBenchmarksData.length > 0 ? (
                    industryBenchmarksData.map((item) => (
                      <IndustryBenchmark 
                        key={item.industryName} 
                        industry={{
                          industry: item.industryName,
                          averageDPO: item.averageDPO,
                          topQuartileDPO: item.topQuartileDPO
                        }} 
                      />
                    ))
                  ) : (
                    // Fallback to mock data if no real data is available
                    industryBenchmarks.map((industry) => (
                      <IndustryBenchmark key={industry.industry} industry={industry} />
                    ))
                  )}
                </CardContent>
                <CardFooter className="border-t flex justify-between">
                  <div className="text-sm text-gray-500">
                    Source: Industry Data Analytics
                  </div>
                  <Button variant="outline" size="sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    View 1.2M+ Benchmarks
                  </Button>
                </CardFooter>
              </Card>

              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Terms Distribution</CardTitle>
                    <CardDescription>Current distribution compared to recommended optimization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current distribution</span>
                        <span>Avg: {displayMetrics.averageCurrentDPO} days</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 mb-3">
                        <div className="h-12 bg-blue-200 rounded-l-md flex items-center justify-center text-xs font-medium">15 days</div>
                        <div className="h-12 bg-blue-300 flex items-center justify-center text-xs font-medium">30 days</div>
                        <div className="h-12 bg-blue-400 flex items-center justify-center text-xs font-medium">45 days</div>
                        <div className="h-12 bg-blue-500 flex items-center justify-center text-xs text-white font-medium">60 days</div>
                        <div className="h-12 bg-blue-600 rounded-r-md flex items-center justify-center text-xs text-white font-medium">75+ days</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Recommended distribution</span>
                        <span>Avg: {displayMetrics.averageOptimizedDPO} days</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        <div className="h-12 bg-green-200 rounded-l-md flex items-center justify-center text-xs font-medium">15 days</div>
                        <div className="h-12 bg-green-300 flex items-center justify-center text-xs font-medium">30 days</div>
                        <div className="h-12 bg-green-400 flex items-center justify-center text-xs font-medium">45 days</div>
                        <div className="h-12 bg-green-500 flex items-center justify-center text-xs text-white font-medium">60 days</div>
                        <div className="h-12 bg-green-600 rounded-r-md flex items-center justify-center text-xs text-white font-medium">75+ days</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Free Cash Flow Impact</CardTitle>
                        <CardDescription>Projected monthly cash flow improvement</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border border-green-200">
                        + ${Math.round(displayMetrics.totalImprovement / 12).toLocaleString()} / month
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[120px] relative flex items-end justify-between px-2">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const height = 50 + Math.random() * 50;
                        return (
                          <div key={i} className="relative" style={{ height: `${height}%` }}>
                            <div className="absolute bottom-0 w-6 bg-primary/80 hover:bg-primary rounded-t-sm" style={{ height: '100%' }}></div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                      <span>Nov</span>
                      <span>Dec</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Analysis Features</CardTitle>
                  <CardDescription>Powered by advanced analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start mb-3">
                        <div className="p-2 rounded-md bg-blue-100 mr-3">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Supplier Scoring</h3>
                          <p className="text-sm text-gray-500">Evaluate suppliers based on financial health metrics</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-md p-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Financial Stability</span>
                          <span>82/100</span>
                        </div>
                        <Progress value={82} className="h-1.5 mb-3" />
                        
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Payment History</span>
                          <span>75/100</span>
                        </div>
                        <Progress value={75} className="h-1.5 mb-3" />
                        
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>ESG Score</span>
                          <span>68/100</span>
                        </div>
                        <Progress value={68} className="h-1.5" />
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start mb-3">
                        <div className="p-2 rounded-md bg-green-100 mr-3">
                          <LineChart className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Benchmarking & Analytics</h3>
                          <p className="text-sm text-gray-500">Compare against 1.2M+ company database</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-gray-50 rounded-md p-2">
                          <span className="text-sm">Industry benchmark</span>
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-200">45 days</Badge>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 rounded-md p-2">
                          <span className="text-sm">Country average</span>
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-200">52 days</Badge>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 rounded-md p-2">
                          <span className="text-sm">Commodity type</span>
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-200">60 days</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start mb-3">
                        <div className="p-2 rounded-md bg-amber-100 mr-3">
                          <CircleDollarSign className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Opportunity Identification</h3>
                          <p className="text-sm text-gray-500">Calculate potential working capital improvements</p>
                        </div>
                      </div>
                      <div className="text-center py-2">
                        <div className="inline-block rounded-full bg-amber-50 p-4 mb-2">
                          <div className="text-3xl font-bold text-amber-600">${Math.round(displayMetrics.totalImprovement / 1000)}K</div>
                          <div className="text-xs text-amber-700 mt-1">Working Capital Opportunity</div>
                        </div>
                        <div className="text-xs text-gray-500">Based on {displayMetrics.totalOpportunities} suppliers with optimization potential</div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start mb-3">
                        <div className="p-2 rounded-md bg-purple-100 mr-3">
                          <ScrollText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Negotiation Support</h3>
                          <p className="text-sm text-gray-500">Data-driven insights for supplier negotiations</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center bg-gray-50 rounded-md p-2 gap-2">
                          <CircleCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Industry-specific negotiation scripts</span>
                        </div>
                        <div className="flex items-center bg-gray-50 rounded-md p-2 gap-2">
                          <CircleCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Supplier financial health justifications</span>
                        </div>
                        <div className="flex items-center bg-gray-50 rounded-md p-2 gap-2">
                          <CircleCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Risk-adjusted approach recommendations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <MoveUpRight className="mr-2 h-4 w-4" />
                    Start New Analysis
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Term Analytics Platform</CardTitle>
                  <CardDescription>AI-Powered Payment Analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-primary pl-3 py-2">
                    <h4 className="font-medium">Cloud-Based Analysis</h4>
                    <p className="text-sm text-gray-500">Science-driven analytics engine using AI to help companies unlock working capital</p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-3 py-2">
                    <h4 className="font-medium">Multiple Data Points</h4>
                    <p className="text-sm text-gray-500">Analyzes supplier size, leverage, relationship length, country, industry, growth, and financial strength</p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-3 py-2">
                    <h4 className="font-medium">Financial Metrics</h4>
                    <p className="text-sm text-gray-500">Evaluates DSO, DPO, and Cash Conversion Cycle (C2C) with key competitor benchmarking</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="flex items-center text-blue-800 font-medium">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Advanced AI Analytics
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">Our system uses advanced statistical methods and a state-of-the-art solution stack to optimize your payment terms for maximum working capital efficiency.</p>
                    <Button variant="link" className="text-blue-600 h-auto p-0 mt-2">
                      Learn more <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
