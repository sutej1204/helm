import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShieldCheck, 
  Search, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Building2, 
  GlobeIcon, 
  BarChart3, 
  FileText, 
  Clock,
  Plus,
  Eye,
  TrendingUp,
  Target,
  Shield,
  Activity
} from "lucide-react";

const complianceMetrics = {
  overallCompliance: 84,
  suppliersMonitored: 287,
  activeIssues: 12,
  pendingVerifications: 8,
  criticalAlerts: 3,
  recentChecks: 156
};

const riskCategories = [
  {
    name: "Environmental",
    score: 78,
    status: "Medium Risk",
    trend: "improving",
    suppliers: 45,
    color: "bg-green-500"
  },
  {
    name: "Social",
    score: 65,
    status: "High Risk", 
    trend: "declining",
    suppliers: 23,
    color: "bg-red-500"
  },
  {
    name: "Governance",
    score: 89,
    status: "Low Risk",
    trend: "stable",
    suppliers: 12,
    color: "bg-yellow-500"
  },
  {
    name: "Financial",
    score: 92,
    status: "Low Risk",
    trend: "improving",
    suppliers: 8,
    color: "bg-blue-500"
  }
];

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
    icon: CheckCircle2
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
    icon: Users
  },
  {
    type: "pending",
    title: "TechSolutions verification",
    description: "Sanctions screening in progress",
    time: "8 hours ago",
    icon: Clock
  }
];

function MetricCard({ title, value, subtitle, icon, trend }: { 
  title: string, 
  value: string | number, 
  subtitle?: string, 
  icon: React.ReactNode, 
  trend?: "up" | "down" | "stable" 
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RiskCategoryCard({ category }: { category: typeof riskCategories[0] }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
          </div>
          <Badge className={
            category.status === "Low Risk" ? "bg-green-100 text-green-800" :
            category.status === "Medium Risk" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }>
            {category.status}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Compliance Score</span>
              <span className="font-medium">{category.score}%</span>
            </div>
            <Progress value={category.score} className="h-2" />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{category.suppliers} suppliers</span>
            <span className={`flex items-center ${
              category.trend === 'improving' ? 'text-green-600' :
              category.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {category.trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Compliance() {
  const [_, navigate] = useLocation();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Onboarding Engine</h1>
              <p className="text-blue-100 mt-2">Automated compliance screening and monitoring across your entire supplier network</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                <Plus className="mr-2 h-4 w-4" />
                New Screening
              </Button>
            </div>
          </div>
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Your compliance framework is actively monitoring <strong>{complianceMetrics.suppliersMonitored}</strong> suppliers. 
            Current overall compliance rate: <strong>{complianceMetrics.overallCompliance}%</strong>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <MetricCard 
            title="Overall Compliance"
            value={`${complianceMetrics.overallCompliance}%`}
            icon={<ShieldCheck className="h-5 w-5" />}
            trend="up"
          />
          <MetricCard 
            title="Suppliers Monitored"
            value={complianceMetrics.suppliersMonitored}
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard 
            title="Active Issues"
            value={complianceMetrics.activeIssues}
            subtitle="Requires attention"
            icon={<AlertTriangle className="h-5 w-5" />}
            trend="down"
          />
          <MetricCard 
            title="Pending Verifications"
            value={complianceMetrics.pendingVerifications}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard 
            title="Critical Alerts"
            value={complianceMetrics.criticalAlerts}
            subtitle="Last 24h"
            icon={<Target className="h-5 w-5" />}
          />
          <MetricCard 
            title="Recent Checks"
            value={complianceMetrics.recentChecks}
            subtitle="This week"
            icon={<Activity className="h-5 w-5" />}
            trend="up"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Compliance Dashboard</h2>
            <p className="text-gray-500 text-sm">Monitor and verify supplier compliance status across your network</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate('/screening')}>
              <Eye className="mr-2 h-4 w-4" />
              OFAC & PEP Screening
            </Button>
            <Button variant="outline" onClick={() => navigate('/suppliers')}>
              <Users className="mr-2 h-4 w-4" />
              View All Suppliers
            </Button>
          </div>
        </div>

        <div className="space-y-6">
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
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm">KYC/KYB Verification</span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded-md">
                        <div className="flex items-center">
                          <GlobeIcon className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium">OFAC Sanctions Screening</span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">Priority</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded-md">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium">PEP Verification</span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">Priority</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm">ESG Assessment</span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm">Financial Health</span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">Active</Badge>
                      </div>
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
                    <div className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">EcoPackaging Solutions verified</p>
                        <p className="text-gray-500 text-xs">OFAC & PEP checks passed - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-red-100 p-1 rounded-full mr-2">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">FastLogistics OFAC alert</p>
                        <p className="text-gray-500 text-xs">Potential match with sanctioned entity - 6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-amber-100 p-1 rounded-full mr-2">
                        <Users className="h-3 w-3 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">Global Materials PEP identification</p>
                        <p className="text-gray-500 text-xs">Politically exposed person detected - 8 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-2">
                        <Clock className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">TechSolutions sanctions verification</p>
                        <p className="text-gray-500 text-xs">Screening in progress - 10 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Executive Reports</CardTitle>
                    <CardDescription>High-value reports for decision makers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start text-left" variant="outline">
                      <BarChart3 className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Executive Risk & Cash Dashboard</span>
                        <span className="text-xs text-gray-500">One-page snapshot for Board/C-Suite</span>
                      </div>
                    </Button>
                    <Button className="w-full justify-start text-left" variant="outline">
                      <Shield className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Sanctions Screening Log</span>
                        <span className="text-xs text-gray-500">Full audit trail for regulators</span>
                      </div>
                    </Button>
                    <Button className="w-full justify-start text-left" variant="outline">
                      <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">ESG Performance Scorecard</span>
                        <span className="text-xs text-gray-500">Sustainability metrics & compliance</span>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Operational Reports</CardTitle>
                    <CardDescription>Daily and weekly intelligence</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start text-left" variant="outline">
                      <AlertTriangle className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Adverse Media Digest</span>
                        <span className="text-xs text-gray-500">30-day negative news incidents</span>
                      </div>
                    </Button>
                    <Button className="w-full justify-start text-left" variant="outline">
                      <Target className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Category Risk Heat-Map</span>
                        <span className="text-xs text-gray-500">Risk levels by spend category</span>
                      </div>
                    </Button>
                    <Button className="w-full justify-start text-left" variant="outline">
                      <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Regulatory Compliance Certificate</span>
                        <span className="text-xs text-gray-500">Machine-generated PDF for audits</span>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}