import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  UserPlus, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Search,
  Plus,
  Download,
  Upload,
  Eye,
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
  BarChart2,
  Star,
  TrendingUp,
  Leaf
} from "lucide-react";

// Compliance dashboard data
const complianceMetrics = {
  overallCompliance: 84,
  suppliersMonitored: 287,
  activeIssues: 12,
  pendingVerifications: 8,
  criticalAlerts: 3,
  recentChecks: 156
};

const complianceFramework = [
  { name: "OFAC Sanctions", status: "Active", priority: "Critical", coverage: "100%" },
  { name: "PEP Screening", status: "Active", priority: "High", coverage: "100%" },
  { name: "KYC/KYB Verification", status: "Active", priority: "High", coverage: "95%" },
  { name: "ESG Assessment", status: "Active", priority: "Medium", coverage: "87%" },
  { name: "Financial Health", status: "Active", priority: "Medium", coverage: "92%" },
  { name: "Cyber Risk Rating", status: "Pending", priority: "Low", coverage: "65%" }
];

const recentActivity = [
  {
    type: "success",
    title: "EcoPackaging Solutions verified",
    description: "All compliance checks passed",
    time: "2 hours ago",
    icon: CheckCircle
  },
  {
    type: "alert",
    title: "FastLogistics OFAC alert",
    description: "Potential sanctions match detected",
    time: "4 hours ago",
    icon: AlertTriangle
  },
  {
    type: "warning",
    title: "Global Materials PEP identification",
    description: "Politically exposed person detected",
    time: "6 hours ago",
    icon: Shield
  },
  {
    type: "pending",
    title: "TechSolutions verification",
    description: "Sanctions screening in progress",
    time: "8 hours ago",
    icon: Clock
  }
];

const onboardingSteps = [
  { step: "Data Collection", status: "complete", automation: "Auto-pull from registries", time: "2 hours" },
  { step: "Sanctions Check", status: "complete", automation: "Real-time API screening", time: "5 minutes" },
  { step: "UBO Verification", status: "in-progress", automation: "AI-powered analysis", time: "30 minutes" },
  { step: "PEP Screening", status: "pending", automation: "Automated triggers", time: "15 minutes" },
  { step: "ESG Assessment", status: "pending", automation: "Data aggregation", time: "1 hour" },
];

export default function OnboardingCompliance() {
  const [activeTab, setActiveTab] = useState("intelligent-selection");

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Onboarding Engine</h1>
            <p className="text-gray-500 mt-1">
              From intake to intelligent selection - Onboard faster, operate efficiently, select better suppliers
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Supplier
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">


        {/* Impact Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Impact Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">87%</div>
                <div className="text-sm text-gray-600">Faster Onboarding</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">99.2%</div>
                <div className="text-sm text-gray-600">Compliance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">94%</div>
                <div className="text-sm text-gray-600">Automation Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">23%</div>
                <div className="text-sm text-gray-600">Better Supplier Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="intelligent-selection">Compliance Dashboard</TabsTrigger>
            <TabsTrigger value="auto-onboarding">Auto Onboarding</TabsTrigger>
            <TabsTrigger value="supplier-passports">Supplier Passports</TabsTrigger>
          </TabsList>

          {/* Compliance Dashboard */}
          <TabsContent value="intelligent-selection" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
                        <p className="text-2xl font-bold text-gray-900">{complianceMetrics.overallCompliance}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Suppliers Monitored</p>
                        <p className="text-2xl font-bold text-gray-900">{complianceMetrics.suppliersMonitored}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Issues</p>
                        <p className="text-2xl font-bold text-gray-900">{complianceMetrics.activeIssues}</p>
                        <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                        <p className="text-2xl font-bold text-gray-900">{complianceMetrics.pendingVerifications}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                        <p className="text-2xl font-bold text-gray-900">{complianceMetrics.criticalAlerts}</p>
                        <p className="text-xs text-gray-500 mt-1">Last 24h</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                        <BarChart2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recent Checks</p>
                        <p className="text-2xl font-bold text-gray-900">{complianceMetrics.recentChecks}</p>
                        <p className="text-xs text-gray-500 mt-1">This week</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Status by Category</CardTitle>
                    <CardDescription>Compliance levels across different supplier categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Electronics</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Raw Materials</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Technology</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Logistics</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Packaging</span>
                          <span>95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Framework</CardTitle>
                    <CardDescription>Key compliance verification areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {complianceFramework.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              item.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              item.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                              item.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                              item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">{item.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`p-1 rounded-full mr-2 ${
                          activity.type === 'success' ? 'bg-green-100' :
                          activity.type === 'alert' ? 'bg-red-100' :
                          activity.type === 'warning' ? 'bg-amber-100' :
                          'bg-blue-100'
                        }`}>
                          <activity.icon className={`h-3 w-3 ${
                            activity.type === 'success' ? 'text-green-600' :
                            activity.type === 'alert' ? 'text-red-600' :
                            activity.type === 'warning' ? 'text-amber-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-gray-500 text-xs">{activity.description} - {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Supplier
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Run OFAC Screening
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Auto Onboarding */}
          <TabsContent value="auto-onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Automated Onboarding Pipeline
                </CardTitle>
                <CardDescription>Streamlined process with intelligent automation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onboardingSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {step.status === 'complete' && <CheckCircle className="h-6 w-6 text-green-500" />}
                        {step.status === 'in-progress' && <Clock className="h-6 w-6 text-yellow-500" />}
                        {step.status === 'pending' && <div className="h-6 w-6 rounded-full border-2 border-gray-300" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{step.step}</h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            <Bot className="h-3 w-3 mr-1" />
                            {step.automation}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Estimated time: {step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Dashboard */}
          <TabsContent value="compliance-dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-red-500" />
                    Real-time Compliance Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded bg-green-50">
                      <div>
                        <div className="font-medium">OFAC Sanctions</div>
                        <div className="text-sm text-gray-500">Real-time screening active</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded bg-green-50">
                      <div>
                        <div className="font-medium">AML Compliance</div>
                        <div className="text-sm text-gray-500">Continuous monitoring</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded bg-yellow-50">
                      <div>
                        <div className="font-medium">PEP Screening</div>
                        <div className="text-sm text-gray-500">2 pending reviews</div>
                      </div>
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Excellent (90-100)</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-24" />
                        <span className="text-sm">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Good (80-89)</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={15} className="w-24" />
                        <span className="text-sm">15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Needs Improvement</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={10} className="w-24" />
                        <span className="text-sm">10%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Supplier Passports */}
          <TabsContent value="supplier-passports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
                  Standardized Supplier Passports
                </CardTitle>
                <CardDescription>Comprehensive supplier profiles with standardized data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">EcoTech Manufacturing</h3>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>ESG Score: <span className="font-medium">89/100</span></div>
                      <div>Compliance: <span className="font-medium">Complete</span></div>
                      <div>Risk Level: <span className="font-medium text-green-600">Low</span></div>
                      <div>Last Updated: <span className="font-medium">2 hours ago</span></div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Passport
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Asian Components Pro</h3>
                      <Badge className="bg-yellow-100 text-yellow-800">In Review</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>ESG Score: <span className="font-medium">72/100</span></div>
                      <div>Compliance: <span className="font-medium">In Progress</span></div>
                      <div>Risk Level: <span className="font-medium text-yellow-600">Medium</span></div>
                      <div>Last Updated: <span className="font-medium">1 day ago</span></div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Passport
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Create New Passport</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}