import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileBarChart, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  Users,
  Building2,
  Shield,
  TrendingUp,
  AlertTriangle,
  FileText,
  Globe,
  DollarSign,
  Clock,
  Target,
  CheckCircle2,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
  Scale,
  Leaf
} from "lucide-react";

// High-value reports data structure
const reportCategories = [
  {
    id: "executive",
    name: "Executive Reports",
    description: "Board and C-Suite intelligence",
    icon: Users,
    color: "bg-blue-100 text-blue-800",
    reports: [
      {
        id: "executive-risk-dashboard",
        title: "Executive Risk & Cash Dashboard",
        description: "One-page snapshot of composite supplier-risk index, sanctions exposure, and cash unlocked this quarter",
        audience: "Board / C-Suite",
        frequency: "Monthly",
        useCase: "Monthly packs, investor calls",
        lastGenerated: "2024-01-15",
        format: "PDF, Excel",
        priority: "high"
      },
      {
        id: "working-capital-opportunity",
        title: "Working-Capital Opportunity Report",
        description: "Top 20 AR/AP actions (early-pay, term extension) with projected liquidity gain and ROI",
        audience: "Treasury / Finance",
        frequency: "Quarterly",
        useCase: "Treasury planning, funding decisions",
        lastGenerated: "2024-01-10",
        format: "Excel, Dashboard",
        priority: "high"
      }
    ]
  },
  {
    id: "compliance",
    name: "Compliance & Legal",
    description: "Regulatory and legal requirements",
    icon: Shield,
    color: "bg-purple-100 text-purple-800",
    reports: [
      {
        id: "sanctions-screening-log",
        title: "Sanctions & Watch-List Screening Log",
        description: "Full audit trail of hits, false-positive resolutions, and real-time status by supplier",
        audience: "Compliance / Legal",
        frequency: "Daily",
        useCase: "Regulator inquiries, internal audits",
        lastGenerated: "2024-01-16",
        format: "PDF, CSV",
        priority: "critical"
      },
      {
        id: "modern-slavery-compliance",
        title: "Modern-Slavery / Forced-Labour Compliance Report",
        description: "List of suppliers flagged for forced-labour indicators, mitigation steps, and audit status",
        audience: "Compliance / Legal",
        frequency: "Annual",
        useCase: "UK Modern Slavery Act, US Uyghur Forced Labor Prevention Act filings",
        lastGenerated: "2023-12-01",
        format: "PDF",
        priority: "critical"
      },
      {
        id: "regulatory-compliance-certificate",
        title: "Regulatory Compliance Certificate",
        description: "Machine-generated PDF summarising screening coverage, risk classification method, and mitigation actions—time-stamped and immutable",
        audience: "Audit / External Stakeholders",
        frequency: "On-demand",
        useCase: "External audits, customer assurance",
        lastGenerated: "2024-01-12",
        format: "PDF",
        priority: "high"
      }
    ]
  },
  {
    id: "sustainability",
    name: "Sustainability & ESG",
    description: "Environmental and social governance",
    icon: Leaf,
    color: "bg-green-100 text-green-800",
    reports: [
      {
        id: "esg-performance-scorecard",
        title: "ESG Performance Scorecard",
        description: "Average ESG score vs. target, high-risk suppliers, progress on Scope 3 emissions goals",
        audience: "Sustainability / ESG",
        frequency: "Monthly",
        useCase: "Annual sustainability report, customer RFPs",
        lastGenerated: "2024-01-14",
        format: "PDF, Dashboard",
        priority: "medium"
      },
      {
        id: "adverse-media-digest",
        title: "Adverse-Media & Reputational Events Digest",
        description: "All negative-news incidents in the last 30 days with severity score and remediation owner",
        audience: "Risk Management",
        frequency: "Weekly",
        useCase: "Weekly risk committees",
        lastGenerated: "2024-01-16",
        format: "PDF, Email",
        priority: "medium"
      }
    ]
  },
  {
    id: "procurement",
    name: "Procurement & Operations",
    description: "Supplier and operational intelligence",
    icon: Building2,
    color: "bg-orange-100 text-orange-800",
    reports: [
      {
        id: "supplier-360-scorecard",
        title: "Supplier 360° Scorecard",
        description: "For each key vendor: ESG score, delivery reliability, credit health, payment-term history, and current exposure",
        audience: "Procurement",
        frequency: "Quarterly",
        useCase: "Sourcing reviews, contract renewals",
        lastGenerated: "2024-01-13",
        format: "PDF, Dashboard",
        priority: "medium"
      },
      {
        id: "category-risk-heatmap",
        title: "Category Risk Heat-Map",
        description: "Colour-coded view of risk levels by spend category and region",
        audience: "Procurement",
        frequency: "Monthly",
        useCase: "Category strategy workshops",
        lastGenerated: "2024-01-15",
        format: "Dashboard, PDF",
        priority: "medium"
      },
      {
        id: "supply-chain-disruption-forecast",
        title: "Supply-Chain Disruption Forecast",
        description: "Probabilistic risk of shipment delay or stoppage by region (port strikes, weather, geopolitical)",
        audience: "Operations / Continuity",
        frequency: "Weekly",
        useCase: "Contingency planning",
        lastGenerated: "2024-01-16",
        format: "Dashboard, Email",
        priority: "high"
      }
    ]
  },
  {
    id: "finance",
    name: "Treasury & Finance",
    description: "Financial and cash flow optimization",
    icon: DollarSign,
    color: "bg-blue-100 text-blue-800",
    reports: [
      {
        id: "ar-collections-priority",
        title: "AR Aging & Collections Priority List",
        description: "Open invoices ranked by predicted payment delay and cash impact",
        audience: "Treasury / Finance",
        frequency: "Daily",
        useCase: "Daily collections huddles",
        lastGenerated: "2024-01-16",
        format: "Excel, Dashboard",
        priority: "high"
      },
      {
        id: "ap-term-change-impact",
        title: "AP Term-Change Impact Model",
        description: "Simulation of DPO changes on liquidity, supplier health, and discount capture",
        audience: "Treasury / Finance",
        frequency: "Quarterly",
        useCase: "Quarterly cash-optimisation cycles",
        lastGenerated: "2024-01-10",
        format: "Excel, Dashboard",
        priority: "medium"
      }
    ]
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-red-100 text-red-800 border-red-200";
    case "high": return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getFrequencyIcon = (frequency: string) => {
  switch (frequency.toLowerCase()) {
    case "daily": return <Clock className="h-4 w-4" />;
    case "weekly": return <Calendar className="h-4 w-4" />;
    case "monthly": return <BarChart3 className="h-4 w-4" />;
    case "quarterly": return <PieChart className="h-4 w-4" />;
    case "annual": return <Target className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter reports based on search and category
  const filteredReports = reportCategories.flatMap(category => 
    category.reports.map(report => ({ ...report, category: category.name, categoryId: category.id }))
  ).filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || report.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-500 mt-1">Generate decision-ready intelligence for every stakeholder</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Report
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <FileBarChart className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reports..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {reportCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          {/* All Reports Tab */}
          <TabsContent value="all" className="space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {report.audience}
                          </div>
                          <div className="flex items-center gap-1">
                            {getFrequencyIcon(report.frequency)}
                            {report.frequency}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Last: {report.lastGenerated}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {report.format}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                          <Download className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-500 text-center">
                    Try adjusting your search terms or filters to find the reports you're looking for.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* By Category Tab */}
          <TabsContent value="categories" className="space-y-6">
            {reportCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {category.reports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{report.title}</h4>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{report.frequency}</span>
                            <span>Last: {report.lastGenerated}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automated Report Schedule</CardTitle>
                <CardDescription>
                  Configure automatic generation and delivery of critical reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Executive Risk Dashboard", schedule: "1st of every month", nextRun: "2024-02-01", status: "active" },
                    { name: "Sanctions Screening Log", schedule: "Daily at 6:00 AM", nextRun: "2024-01-17", status: "active" },
                    { name: "ESG Performance Scorecard", schedule: "15th of every month", nextRun: "2024-02-15", status: "active" },
                    { name: "Supply Chain Disruption Forecast", schedule: "Every Monday", nextRun: "2024-01-22", status: "paused" }
                  ].map((scheduled, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{scheduled.name}</h4>
                        <p className="text-sm text-gray-600">{scheduled.schedule}</p>
                        <p className="text-xs text-gray-500">Next run: {scheduled.nextRun}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={scheduled.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {scheduled.status}
                        </Badge>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
