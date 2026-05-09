import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Building,
  Globe,
  Phone,
  Mail,
  Zap,
  Bot,
  Database,
  Link,
  Scan,
  CreditCard,
  BarChart2
} from "lucide-react";

// Sample data for compliance tracking
const complianceItems = [
  { id: 1, supplier: "Acme Electronics", status: "Complete", score: 95, lastUpdated: "2024-01-15", items: ["KYC", "AML", "OFAC", "ESG"] },
  { id: 2, supplier: "Global Materials", status: "In Progress", score: 78, lastUpdated: "2024-01-14", items: ["KYC", "AML", "OFAC"] },
  { id: 3, supplier: "Pacific Shipping", status: "Pending", score: 45, lastUpdated: "2024-01-13", items: ["KYC"] },
  { id: 4, supplier: "Eurotech Manufacturing", status: "Complete", score: 92, lastUpdated: "2024-01-12", items: ["KYC", "AML", "OFAC", "ESG"] },
];

// Sample data for onboarding pipeline
const onboardingPipeline = [
  { id: 1, supplier: "New Tech Solutions", stage: "Documentation Review", progress: 75, contact: "John Smith", email: "john@newtech.com", country: "USA" },
  { id: 2, supplier: "Asian Components Ltd", stage: "Compliance Check", progress: 50, contact: "Li Wei", email: "li.wei@asiancomp.com", country: "China" },
  { id: 3, supplier: "European Logistics", stage: "Contract Negotiation", progress: 90, contact: "Maria Garcia", email: "maria@eurolog.com", country: "Spain" },
  { id: 4, supplier: "African Mining Co", stage: "Initial Screening", progress: 25, contact: "David Okafor", email: "david@africamining.com", country: "Nigeria" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Complete": return "bg-green-100 text-green-800 border-green-200";
    case "In Progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Pending": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case "Contract Negotiation": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Documentation Review": return "bg-purple-100 text-purple-800 border-purple-200";
    case "Compliance Check": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Initial Screening": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function SupplierComplianceOnboarding() {
  const [activeTab, setActiveTab] = useState("compliance");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Supplier Compliance & Onboarding</h1>
            <p className="text-gray-500 mt-1">
              Manage supplier compliance requirements and streamline onboarding processes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Suppliers</p>
                  <p className="text-2xl font-bold">287</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                  <p className="text-2xl font-bold">94.2%</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Onboarding</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <UserPlus className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compliance">Compliance Monitoring</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding Pipeline</TabsTrigger>
            <TabsTrigger value="automation">Automation Workflows</TabsTrigger>
            <TabsTrigger value="requirements">Requirements Management</TabsTrigger>
          </TabsList>

          {/* Compliance Monitoring Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Compliance Status Overview</CardTitle>
                    <CardDescription>Monitor compliance status across all suppliers</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold">{item.supplier}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Score: {item.score}%</span>
                            <span>Updated: {item.lastUpdated}</span>
                            <div className="flex space-x-1">
                              {item.items.map((reqItem) => (
                                <Badge key={reqItem} variant="outline" className="text-xs">
                                  {reqItem}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.score} className="w-24" />
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Workflows Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Supplier Referral Automation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5 text-blue-500" />
                    <CardTitle>Supplier Referral</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Zap className="h-3 w-3 mr-1" />
                      Automated
                    </Badge>
                  </div>
                  <CardDescription>Digital referral workflow with approval tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded bg-green-50">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Buyer Referral System</div>
                          <div className="text-sm text-gray-500">Automated approval workflow active</div>
                        </div>
                      </div>
                      <Bot className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-sm space-y-2">
                      <div>• Digital referral submission portal</div>
                      <div>• Automated approval routing</div>
                      <div>• Real-time status tracking</div>
                      <div>• Integration with buyer systems</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Corporate Documentation Collection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <CardTitle>Corporate Documentation</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Zap className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                  </div>
                  <CardDescription>Auto-request and extract data using OCR/AI parsing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded bg-purple-50">
                      <div className="flex items-center space-x-3">
                        <Scan className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium">Document Processing</div>
                          <div className="text-sm text-gray-500">OCR + AI extraction active</div>
                        </div>
                      </div>
                      <Bot className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-sm space-y-2">
                      <div>• Articles of Incorporation</div>
                      <div>• Annual Returns</div>
                      <div>• Registry Extracts</div>
                      <div>• Companies House / SEC EDGAR integration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sanctions & Risk Screening */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    <CardTitle>Sanctions & Risk Screening</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Zap className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                  </div>
                  <CardDescription>API-based continuous monitoring through third-party providers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded bg-red-50">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium">Multi-Source Screening</div>
                          <div className="text-sm text-gray-500">Continuous monitoring active</div>
                        </div>
                      </div>
                      <Link className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-sm space-y-2">
                      <div>• OFAC sanctions screening</div>
                      <div>• AML compliance checks</div>
                      <div>• UN/EU sanctions monitoring</div>
                      <div>• Terrorism watchlist verification</div>
                      <div>• Adverse media scanning</div>
                    </div>
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <strong>Integrated Providers:</strong> Dow Jones Risk & Compliance, World-Check, ComplyAdvantage
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PEP Checks */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-orange-500" />
                    <CardTitle>PEP Checks</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Zap className="h-3 w-3 mr-1" />
                      Triggered
                    </Badge>
                  </div>
                  <CardDescription>Automated PEP screening for beneficial owners ({'>'}25% shareholding)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded bg-orange-50">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-orange-500" />
                        <div>
                          <div className="font-medium">Beneficial Owner Analysis</div>
                          <div className="text-sm text-gray-500">Auto-triggered after ownership capture</div>
                        </div>
                      </div>
                      <Bot className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-sm space-y-2">
                      <div>• Ownership threshold monitoring ({'>'}25%)</div>
                      <div>• Automated PEP database queries</div>
                      <div>• Risk classification scoring</div>
                      <div>• Compliance alert generation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Account Verification */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <CardTitle>Bank Account Verification</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Zap className="h-3 w-3 mr-1" />
                      Automated
                    </Badge>
                  </div>
                  <CardDescription>OCR + API-based bank verification within 90 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded bg-blue-50">
                      <div className="flex items-center space-x-3">
                        <Scan className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Document & API Verification</div>
                          <div className="text-sm text-gray-500">OCR + Plaid/Trulioo integration</div>
                        </div>
                      </div>
                      <Link className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-sm space-y-2">
                      <div>• Voided check processing</div>
                      <div>• Bank statement validation (90-day rule)</div>
                      <div>• Deposit slip verification</div>
                      <div>• Real-time account ownership confirmation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Automation Analytics */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="h-5 w-5 text-green-500" />
                    <CardTitle>Automation Analytics</CardTitle>
                  </div>
                  <CardDescription>Performance metrics for automated compliance workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">94%</div>
                      <div className="text-sm text-gray-600">Automation Rate</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">2.3</div>
                      <div className="text-sm text-gray-600">Days Avg Processing</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">99.7%</div>
                      <div className="text-sm text-gray-600">Accuracy Rate</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">87%</div>
                      <div className="text-sm text-gray-600">Cost Reduction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onboarding Pipeline Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Supplier Onboarding Pipeline</CardTitle>
                    <CardDescription>Track new suppliers through the onboarding process</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Supplier
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onboardingPipeline.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold">{supplier.supplier}</h3>
                            <Badge className={getStageColor(supplier.stage)}>
                              {supplier.stage}
                            </Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{supplier.contact}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{supplier.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Globe className="h-4 w-4" />
                              <span>{supplier.country}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{supplier.progress}%</div>
                            <Progress value={supplier.progress} className="w-24 mt-1" />
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requirements Management Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Requirements</CardTitle>
                  <CardDescription>Configure compliance requirements by supplier category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">KYC Verification</div>
                        <div className="text-sm text-gray-500">Know Your Customer documentation</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">AML Screening</div>
                        <div className="text-sm text-gray-500">Anti-Money Laundering checks</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">OFAC Sanctions</div>
                        <div className="text-sm text-gray-500">Office of Foreign Assets Control screening</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">ESG Assessment</div>
                        <div className="text-sm text-gray-500">Environmental, Social, and Governance evaluation</div>
                      </div>
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Templates</CardTitle>
                  <CardDescription>Manage onboarding document templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Supplier Agreement</div>
                          <div className="text-sm text-gray-500">Standard contract template</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Compliance Checklist</div>
                          <div className="text-sm text-gray-500">Required documentation list</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Data Privacy Agreement</div>
                          <div className="text-sm text-gray-500">GDPR compliance template</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
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