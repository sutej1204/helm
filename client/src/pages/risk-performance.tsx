import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SupplierRiskMap } from "@/components/risk-assessment/supplier-risk-map";
import {
  AlertTriangle,
  ArrowUpCircle,
  BarChart3,
  Building2,
  Check,
  CheckCircle,
  ChevronRight,
  CloudLightning,
  DollarSign,
  Download,
  FileCheck2,
  FileText,
  Flame,
  Globe,
  Landmark,
  PlusCircle,
  Scale,
  Shield,
  Users,
  ArrowUpRight,
  AlertCircle,
  BarChart,
  Database,
  Brain,
  Bell,
  TrendingUp,
  ClipboardList,
  Activity,
  MapPin,
  Clock,
  Target
} from "lucide-react";

// Risk categories organized by type (mirroring the reference page structure)
const riskCategories = [
  {
    id: 'environmental',
    name: 'Environmental Risks',
    icon: <Flame className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800',
    examples: ['Chemical leakage', 'Deforestation', 'Emission violations', 'Pollution', 'Toxication', 'Waste disposal problems'],
    description: 'AI monitors environmental impact, pollution, and sustainability issues through real-time news feeds and ESG scoring.',
    impact: 'Early detection of environmental violations before regulatory action'
  },
  {
    id: 'social',
    name: 'Social Risks',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800',
    examples: ['Child labor', 'Forced labor', 'Discrimination', 'Labor strikes', 'Protests', 'Worker suicides', 'Wage theft'],
    description: 'NLP models detect labor practices, human rights violations, and community relations issues from global news sources.',
    impact: '30-day earlier detection of social compliance issues vs manual tracking'
  },
  {
    id: 'governance',
    name: 'Governance Risks',
    icon: <Scale className="h-5 w-5" />,
    color: 'bg-indigo-100 text-indigo-800',
    examples: ['Corruption', 'Fraud', 'Insider trading', 'Regulatory shutdowns', 'Lawsuits', 'Tax evasion'],
    description: 'Live alerting system triggers red/amber/green alerts for corporate governance violations with explainable AI insights.',
    impact: '80% reduction in false-positive governance alerts; faster triage'
  },
  {
    id: 'financial',
    name: 'Financial & Legal Risks',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800',
    examples: ['Insolvency', 'Credit rating downgrades', 'Mass layoffs', 'Accounting fraud', 'Legal procedures', 'Sanctions'],
    description: 'Integrated with credit agencies and sanctions lists (OFAC, EU, HMT) for real-time financial stability monitoring.',
    impact: 'Immediate sanctions screening and financial distress detection'
  },
  {
    id: 'operational',
    name: 'Operational Risks',
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-orange-100 text-orange-800',
    examples: ['Site closures', 'Supplier issues', 'Product recalls', 'Labor shortages', 'Equipment failures'],
    description: 'Scenario analytics forecast operational disruptions and simulate knock-on effects across supply chain tiers.',
    impact: '20-40% cost reduction by acting weeks before operational disruption'
  },
  {
    id: 'political',
    name: 'Political & Geopolitical Risks',
    icon: <Landmark className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800',
    examples: ['Political unrest', 'Sanctions', 'Trade restrictions', 'Military conflicts', 'Policy changes'],
    description: 'Command-centre map with geographic risk visualization and real-time political event monitoring.',
    impact: 'Visual intelligence for strategic geopolitical decision making'
  },
  {
    id: 'natural',
    name: 'Natural Disasters',
    icon: <CloudLightning className="h-5 w-5" />,
    color: 'bg-yellow-100 text-yellow-800',
    examples: ['Earthquakes', 'Floods', 'Hurricanes', 'Wildfires', 'Pandemics'],
    description: 'Time-series models forecast natural disaster impact and probability-weighted cash-flow hits.',
    impact: 'Proactive disaster response planning with supply chain continuity'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Risks',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-cyan-100 text-cyan-800',
    examples: ['Data breaches', 'Cyberattacks', 'Ransomware incidents', 'IT system failures'],
    description: 'Live incident feed tracks cybersecurity threats with severity filtering and one-click explanations.',
    impact: 'Real-time cyber threat awareness across supplier network'
  },
  {
    id: 'market',
    name: 'Commodity & Market Risks',
    icon: <BarChart className="h-5 w-5" />,
    color: 'bg-pink-100 text-pink-800',
    examples: ['Price volatility', 'Supply shortages', 'Demand fluctuations', 'Market entry barriers'],
    description: 'Market intelligence with supplier passport showing linked AP/AR exposure and risk trends.',
    impact: 'Complete market risk profile integration with financial exposure'
  },
  {
    id: 'regulatory',
    name: 'Regulatory & Compliance Risks',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-stone-100 text-stone-800',
    examples: ['Non-compliance with regulations', 'Labor law violations', 'Industry standard deviations', 'Trade agreement breaches'],
    description: 'Workflow & audit trail with automated compliance reporting and regulatory change monitoring.',
    impact: 'Proves compliance to auditors/regulators in minutes, not days'
  }
];

// Risk level indicators
const riskLevels = [
  { name: 'Critical', color: 'bg-red-500' },
  { name: 'High', color: 'bg-orange-500' },
  { name: 'Medium', color: 'bg-yellow-500' },
  { name: 'Low', color: 'bg-green-500' },
];

// Sample live alerts with explainable AI
const liveAlerts = [
  { 
    id: 1, 
    supplier: 'Global Electronics Co', 
    riskScore: 87, 
    change: '+12', 
    riskType: 'Social', 
    location: 'Southeast Asia', 
    time: '2 hours ago', 
    severity: 'high',
    alertLevel: 'red',
    explanation: {
      headline: 'Labor Rights Violation Allegations Surface at Manufacturing Facility',
      source: 'Reuters, Financial Times',
      details: 'New reports of forced labor conditions and excessive overtime at primary manufacturing site. Worker advocacy groups filing formal complaints.',
      esgMetric: 'Social Score decreased from 72 to 60 (-12 points)',
      recommendation: 'Initiate immediate supplier audit and engage with local labor authorities'
    }
  },
  { 
    id: 2, 
    supplier: 'European Materials Ltd', 
    riskScore: 92, 
    change: '+25', 
    riskType: 'Financial', 
    location: 'Eastern Europe', 
    time: '4 hours ago', 
    severity: 'critical',
    alertLevel: 'red',
    explanation: {
      headline: 'Company Added to OFAC Sanctions List Due to Ownership Changes',
      source: 'OFAC Database Update',
      details: 'Entity designated under Executive Order 14024 for having material involvement in sanctioned activities. Immediate contract suspension required.',
      esgMetric: 'Sanctions screening flagged - automatic high-risk classification',
      recommendation: 'Terminate all business relationships immediately per compliance requirements'
    }
  },
  { 
    id: 3, 
    supplier: 'Tech Components Inc', 
    riskScore: 45, 
    change: '-8', 
    riskType: 'Environmental', 
    location: 'North America', 
    time: '6 hours ago', 
    severity: 'medium',
    alertLevel: 'green',
    explanation: {
      headline: 'Company Achieves Carbon Neutral Certification, Implements Renewable Energy',
      source: 'EcoVadis Update, Company Press Release',
      details: 'Successful implementation of comprehensive carbon reduction program with third-party verification. New solar installation reduces emissions by 40%.',
      esgMetric: 'Environmental Score improved from 67 to 75 (+8 points)',
      recommendation: 'Consider expanding partnership and highlighting in sustainability reporting'
    }
  },
  { 
    id: 4, 
    supplier: 'Manufacturing Pro', 
    riskScore: 71, 
    change: '+5', 
    riskType: 'Governance', 
    location: 'South America', 
    time: '8 hours ago', 
    severity: 'high',
    alertLevel: 'amber',
    explanation: {
      headline: 'Regulatory Investigation Launched into Corporate Governance Practices',
      source: 'Local Financial Authority, Bloomberg',
      details: 'Securities regulator investigating potential conflicts of interest and board independence issues. No formal charges filed yet.',
      esgMetric: 'Governance Score decreased from 78 to 73 (-5 points)',
      recommendation: 'Monitor investigation progress and request governance compliance documentation'
    }
  },
  { 
    id: 5, 
    supplier: 'Asian Logistics Ltd', 
    riskScore: 38, 
    change: '-3', 
    riskType: 'Operational', 
    location: 'East Asia', 
    time: '12 hours ago', 
    severity: 'low',
    alertLevel: 'green',
    explanation: {
      headline: 'Supply Chain Efficiency Improvements Reduce Operational Risk',
      source: 'Company Financial Report, Industry Analysis',
      details: 'Q3 results show improved on-time delivery rates and reduced operational disruptions through digital transformation initiatives.',
      esgMetric: 'Operational Risk Score improved from 41 to 38 (-3 points)',
      recommendation: 'Positive trend - continue monitoring performance metrics'
    }
  },
];

interface RiskCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  examples: string[];
  description: string;
  impact: string;
}

interface RiskLevel {
  name: string;
  color: string;
}

function RiskCategoryCard({ category }: { category: RiskCategory }) {
  const [, navigate] = useLocation();
  
  return (
    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => navigate(`/risk-performance/${category.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={`p-2 rounded-lg ${category.color}`}>
            {category.icon}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        <CardTitle className="mt-3 text-lg">{category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{category.description}</p>
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <span className="font-medium">Impact:</span> {category.impact}
        </div>
        <div className="flex flex-wrap gap-1">
          {category.examples.slice(0, 3).map((example: string, i: number) => (
            <Badge key={i} variant="outline" className="text-xs bg-gray-50">{example}</Badge>
          ))}
          {category.examples.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50">+{category.examples.length - 3} more</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RiskLevelIndicator({ level }: { level: RiskLevel }) {
  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ${level.color} mr-2`}></div>
      <span className="text-sm font-medium">{level.name}</span>
    </div>
  );
}

export default function RiskPerformance() {
  const [activeTab, setActiveTab] = useState('ai-layers');
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [, navigate] = useLocation();

  const { isLoading } = useQuery({
    queryKey: ['/api/risk-monitoring'],
    enabled: false,
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Risk and Intelligence Signals</h1>
            <p className="text-gray-500 mt-1">Monitor and manage supply chain risks across multiple categories</p>
            <div className="mt-2 flex items-center">
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1.5 mr-2">
                <FileCheck2 className="h-3.5 w-3.5" />
                D&B Risk Assessment
              </Badge>
              <span className="text-xs text-gray-500">Powered by Dun & Bradstreet business intelligence</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">


        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Risk Monitoring Active</AlertTitle>
          <AlertDescription className="text-amber-700">
            Helm is actively monitoring your trade network for risks across all risk categories. Current risk score: <span className="font-bold">72/100</span> (Moderate).  
          </AlertDescription>
        </Alert>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Command-Centre Map</CardTitle>
              <CardDescription>
                Colour-coded world map with drill-down to supplier clusters showing real-time risk distribution
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[400px] w-full overflow-hidden">
              <SupplierRiskMap isLoading={isLoading} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex justify-between items-center border-b mb-4">
            <TabsList className="mb-[-1px]">
              <TabsTrigger value="ai-layers">Risk Categories</TabsTrigger>
              <TabsTrigger value="live-alerts">Live Alerts</TabsTrigger>
              <TabsTrigger value="dashboard-view">Dashboard View</TabsTrigger>
              <TabsTrigger value="impact-metrics">Impact Metrics</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2 px-2">
              <span className="text-sm text-gray-500">Risk Levels:</span>
              <div className="flex space-x-3">
                {riskLevels.map((level) => (
                  <RiskLevelIndicator key={level.name} level={level} />
                ))}
              </div>
            </div>
          </div>
          
          <TabsContent value="ai-layers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskCategories.map((category) => (
                <RiskCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="live-alerts">
            <Card>
              <CardHeader>
                <CardTitle>Live Alerting & Explainability</CardTitle>
                <CardDescription>Threshold engine triggers red, amber, green alerts with one-click explanations showing news headlines, sanctions notes, and ESG metrics behind score changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveAlerts.map((alert) => (
                    <div key={alert.id}>
                      <Card className={`border-l-4 ${
                        alert.alertLevel === 'red' ? 'border-l-red-500' : 
                        alert.alertLevel === 'amber' ? 'border-l-yellow-500' : 
                        'border-l-green-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className={`w-3 h-3 rounded-full mr-2 ${
                                  alert.alertLevel === 'red' ? 'bg-red-500' : 
                                  alert.alertLevel === 'amber' ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`}></div>
                                <h3 className="text-lg font-semibold text-gray-900 mr-3">{alert.supplier}</h3>
                                <Badge 
                                  variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'destructive' : 'secondary'}
                                  className="text-xs mr-2"
                                >
                                  {alert.severity}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {alert.riskType}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mb-3">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="mr-4">{alert.location}</span>
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{alert.time}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className={`text-2xl font-bold ${
                                alert.change.startsWith('+') ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {alert.change}
                              </div>
                              <p className="text-xs text-gray-500">CRI Change</p>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="mt-2 mr-2"
                                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                              >
                                {expandedAlert === alert.id ? 'Hide' : 'Explain'}
                              </Button>
                            </div>
                          </div>
                          
                          {expandedAlert === alert.id && (
                            <div className="mt-4 pt-4 border-t bg-gray-50 -m-4 p-4 rounded-b-lg">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                    News Headline & Source
                                  </h4>
                                  <p className="text-sm font-medium text-gray-800 mb-1">{alert.explanation.headline}</p>
                                  <p className="text-xs text-gray-600">Source: {alert.explanation.source}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                                    Event Details
                                  </h4>
                                  <p className="text-sm text-gray-700">{alert.explanation.details}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                                    ESG Metric Impact
                                  </h4>
                                  <p className="text-sm text-gray-700">{alert.explanation.esgMetric}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <Target className="h-4 w-4 mr-2 text-green-600" />
                                    AI Recommendation
                                  </h4>
                                  <p className="text-sm text-gray-700">{alert.explanation.recommendation}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard-view">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What the User Actually Sees</CardTitle>
                  <CardDescription>Command-centre interface that turns risk radar into a true "flight deck"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center mb-3">
                          <Globe className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="font-semibold">Command-Centre Map</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Colour-coded world map with drill-down to supplier clusters</p>
                      </div>

                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center mb-3">
                          <Activity className="h-5 w-5 text-red-600 mr-2" />
                          <h3 className="font-semibold">Live Incident Feed</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Real-time ticker of ESG events, sanctions, reputational spikes</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center mb-3">
                          <FileText className="h-5 w-5 text-purple-600 mr-2" />
                          <h3 className="font-semibold">Supplier Passport</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Side-panel with CRI trend, ESG scores, linked AP/AR exposure</p>
                      </div>

                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center mb-3">
                          <ClipboardList className="h-5 w-5 text-orange-600 mr-2" />
                          <h3 className="font-semibold">Risk Backlog</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Kanban board of open mitigations with owner avatars</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="impact-metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    Earlier Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">30 days</div>
                  <p className="text-sm text-gray-600 mb-4">faster risk identification vs manual tracking</p>
                  <Progress value={85} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    False Positive Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">80%</div>
                  <p className="text-sm text-gray-600 mb-4">reduction in false-positive chases</p>
                  <Progress value={80} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-600" />
                    Impact Cost Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">20-40%</div>
                  <p className="text-sm text-gray-600 mb-4">by acting weeks before disruption</p>
                  <Progress value={70} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}