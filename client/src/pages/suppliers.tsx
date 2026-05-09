import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { SupplierRiskMap } from "@/components/risk-assessment/supplier-risk-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { 
  AlertTriangle,
  ArrowUpRight,
  BarChart,
  Building,
  CheckCircle,
  FileText,
  Globe,
  Network,
  Plus, 
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  XCircle,
} from "lucide-react";

// Mock supplier data
const suppliers = [
  {
    id: 1,
    name: "Acme Electronics Ltd.",
    code: "AEL-001",
    category: "Raw Materials",
    contactName: "John Smith",
    email: "john@acmeelectronics.com",
    phone: "+886 2 1234 5678",
    country: "Taiwan",
    status: "active",
    verificationStatus: "verified",
    riskScore: 87,
    onboardedDate: "2023-12-05",
  },
  {
    id: 2,
    name: "Global Logistics Inc.",
    code: "GLI-001",
    category: "Logistics",
    contactName: "Sarah Lee",
    email: "slee@globallogistics.com",
    phone: "+65 6123 4567",
    country: "Singapore",
    status: "active",
    verificationStatus: "verified",
    riskScore: 92,
    onboardedDate: "2023-11-15",
  },
  {
    id: 3,
    name: "Stellar Packaging Solutions",
    code: "SPS-001",
    category: "Components",
    contactName: "Michael Johnson",
    email: "mjohnson@stellarpackaging.com",
    phone: "+1 212 555 7890",
    country: "United States",
    status: "pending",
    verificationStatus: "in_progress",
    riskScore: 75,
    onboardedDate: "2023-12-18",
  },
  {
    id: 4,
    name: "EastAsia Manufacturing Co.",
    code: "EAM-001",
    category: "Components",
    contactName: "Li Wei",
    email: "wei.li@eastasia-mfg.cn",
    phone: "+86 755 1234 5678",
    country: "China",
    status: "active",
    verificationStatus: "issues",
    riskScore: 68,
    onboardedDate: "2023-10-30",
  },
  {
    id: 5,
    name: "TechSoft Services Ltd.",
    code: "TSS-001",
    category: "IT & Software",
    contactName: "Raj Patel",
    email: "raj.patel@techsoft.com",
    phone: "+91 22 1234 5678",
    country: "India",
    status: "active",
    verificationStatus: "verified",
    riskScore: 81,
    onboardedDate: "2023-11-05",
  },
];

const getVerificationBadge = (status: string) => {
  switch (status) {
    case 'verified':
      return <Badge className="bg-green-100 text-green-800 border border-green-200 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><Network className="h-3 w-3" /> In Progress</Badge>;
    case 'issues':
      return <Badge className="bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Issues Found</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-1">Unverified</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case 'pending':
      return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    case 'inactive':
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
};

export default function Suppliers() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  
  // Get unique categories for filter
  const uniqueCategories = suppliers.map(s => s.category);
  const categories = ['all', ...Array.from(new Set(uniqueCategories))];
  
  // Filter suppliers based on search, category, and verification status
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         supplier.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    const matchesVerification = verificationFilter === 'all' || supplier.verificationStatus === verificationFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && supplier.status === 'active') ||
                      (activeTab === 'pending' && supplier.status === 'pending');
    
    return matchesSearch && matchesCategory && matchesVerification && matchesTab;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
            <p className="text-gray-500 mt-1">Manage and monitor your supplier network with our verification platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => navigate("/supplier-onboarding")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800">Identity Verification Active</AlertTitle>
          <AlertDescription className="text-blue-700">
            Helm has verified {suppliers.filter(s => s.verificationStatus === 'verified').length} of your {suppliers.length} suppliers using our identity verification platform. Continuous monitoring is active.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Supplier Network</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  {suppliers.length} Suppliers
                </Badge>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-[300px]">
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    List View
                  </Button>
                  <Button 
                    variant={viewMode === "map" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className="flex items-center gap-1"
                  >
                    <Globe className="h-4 w-4" />
                    Map View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-t border-b">
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
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={verificationFilter}
                    onValueChange={(value) => setVerificationFilter(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Verification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="issues">Issues Found</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left font-medium py-3 pl-4">Supplier</th>
                        <th className="text-left font-medium py-3">Contact</th>
                        <th className="text-left font-medium py-3">Category</th>
                        <th className="text-center font-medium py-3">Status</th>
                        <th className="text-center font-medium py-3">Verification</th>
                        <th className="text-center font-medium py-3">Risk Score</th>
                        <th className="text-right font-medium py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 pl-4">
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-xs text-gray-500">ID: {supplier.code} • {supplier.country}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="text-sm">{supplier.contactName}</div>
                              <div className="text-xs text-gray-500">{supplier.email}</div>
                            </div>
                          </td>
                          <td className="py-3">{supplier.category}</td>
                          <td className="py-3 text-center">
                            {getStatusBadge(supplier.status)}
                          </td>
                          <td className="py-3 text-center">
                            {getVerificationBadge(supplier.verificationStatus)}
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                                  ${supplier.riskScore >= 80 ? 'bg-green-100 text-green-800' : 
                                  supplier.riskScore >= 70 ? 'bg-blue-100 text-blue-800' :
                                  supplier.riskScore >= 60 ? 'bg-amber-100 text-amber-800' : 
                                  'bg-red-100 text-red-800'}`}
                              >
                                {supplier.riskScore}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                              Details <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredSuppliers.length === 0 && (
                    <div className="py-12 text-center">
                      <XCircle className="mx-auto h-10 w-10 text-gray-300" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No suppliers found</h3>
                      <p className="mt-1 text-sm text-gray-500">No suppliers match your current filters. Try adjusting your search criteria.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[500px] w-full">
                  <SupplierRiskMap isLoading={false} />
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t flex justify-between items-center py-3">
              <div className="text-sm text-gray-500">
                Showing {filteredSuppliers.length} of {suppliers.length} suppliers
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/supplier-onboarding")}>
                <Plus className="mr-2 h-3 w-3" />
                Add New Supplier
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verification Summary</CardTitle>
                <CardDescription>Verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Verified</span>
                    </div>
                    <span className="font-medium">
                      {suppliers.filter(s => s.verificationStatus === 'verified').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">In Progress</span>
                    </div>
                    <span className="font-medium">
                      {suppliers.filter(s => s.verificationStatus === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Issues Found</span>
                    </div>
                    <span className="font-medium">
                      {suppliers.filter(s => s.verificationStatus === 'issues').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Distribution</CardTitle>
                <CardDescription>Supplier risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Low Risk (80-100)</span>
                    </div>
                    <span className="font-medium">
                      {suppliers.filter(s => s.riskScore >= 80).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Medium Risk (70-79)</span>
                    </div>
                    <span className="font-medium">
                      {suppliers.filter(s => s.riskScore >= 70 && s.riskScore < 80).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm">High Risk (60-69)</span>
                    </div>
                    <span className="font-medium">
                      {suppliers.filter(s => s.riskScore >= 60 && s.riskScore < 70).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Critical Risk (Below 60)</span>
                    </div>
                    <span className="font-medium">
                      {suppliers.filter(s => s.riskScore < 60).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Identity Verification</CardTitle>
                  <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                    <Globe className="h-3 w-3" /> API Connected
                  </Badge>
                </div>
                <CardDescription>Identity verification system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-l-4 border-blue-500 pl-3 py-2 mb-3">
                  <h3 className="text-sm font-medium">Identity Verification</h3>
                  <p className="text-xs text-gray-500">Verify supplier identity against 10,000+ data sources</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3 py-2 mb-3">
                  <h3 className="text-sm font-medium">Document Collection</h3>
                  <p className="text-xs text-gray-500">Automate document collection and verification</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3 py-2">
                  <h3 className="text-sm font-medium">Continuous Monitoring</h3>
                  <p className="text-xs text-gray-500">Real-time alerts for supplier risk changes</p>
                </div>
                <Button variant="link" className="text-blue-600 h-auto p-0 mt-4">
                  Verification Settings <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
