import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowUpCircle,
  BarChart3,
  Building2,
  Check,
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
  BarChart
} from "lucide-react";

// Risk categories organized by type
const riskCategories = [
  {
    id: 'environmental',
    name: 'Environmental Risks',
    icon: <Flame className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800',
    examples: ['Chemical leakage', 'Deforestation', 'Emission violations', 'Pollution', 'Toxication', 'Waste disposal problems'],
    description: 'Risks related to environmental impact, pollution, and sustainability issues.'
  },
  {
    id: 'social',
    name: 'Social Risks',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800',
    examples: ['Child labor', 'Forced labor', 'Discrimination', 'Labor strikes', 'Protests', 'Worker suicides', 'Wage theft'],
    description: 'Risks related to labor practices, human rights, and community relations.'
  },
  {
    id: 'governance',
    name: 'Governance Risks',
    icon: <Scale className="h-5 w-5" />,
    color: 'bg-indigo-100 text-indigo-800',
    examples: ['Corruption', 'Fraud', 'Insider trading', 'Regulatory shutdowns', 'Lawsuits', 'Tax evasion'],
    description: 'Risks related to corporate governance, ethical conduct, and compliance with laws.'
  },
  {
    id: 'financial',
    name: 'Financial & Legal Risks',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800',
    examples: ['Insolvency', 'Credit rating downgrades', 'Mass layoffs', 'Accounting fraud', 'Legal procedures', 'Sanctions'],
    description: 'Risks related to financial stability, legal issues, and economic challenges.'
  },
  {
    id: 'operational',
    name: 'Operational Risks',
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-orange-100 text-orange-800',
    examples: ['Site closures', 'Supplier issues', 'Product recalls', 'Labor shortages', 'Equipment failures'],
    description: 'Risks related to business operations, production, and supply chain management.'
  },
  {
    id: 'political',
    name: 'Political & Geopolitical Risks',
    icon: <Landmark className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800',
    examples: ['Political unrest', 'Sanctions', 'Trade restrictions', 'Military conflicts', 'Policy changes'],
    description: 'Risks related to political instability, government actions, and international relations.'
  },
  {
    id: 'natural',
    name: 'Natural Disasters',
    icon: <CloudLightning className="h-5 w-5" />,
    color: 'bg-yellow-100 text-yellow-800',
    examples: ['Earthquakes', 'Floods', 'Hurricanes', 'Wildfires', 'Pandemics'],
    description: 'Risks related to natural disasters, extreme weather events, and health crises.'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Risks',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-cyan-100 text-cyan-800',
    examples: ['Data breaches', 'Cyberattacks', 'Ransomware incidents', 'IT system failures'],
    description: 'Risks related to cybersecurity threats and digital infrastructure vulnerabilities.'
  },
  {
    id: 'market',
    name: 'Commodity & Market Risks',
    icon: <BarChart className="h-5 w-5" />,
    color: 'bg-pink-100 text-pink-800',
    examples: ['Price volatility', 'Supply shortages', 'Demand fluctuations', 'Market entry barriers'],
    description: 'Risks related to market conditions, pricing, and supply-demand dynamics.'
  },
  {
    id: 'regulatory',
    name: 'Regulatory & Compliance Risks',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-stone-100 text-stone-800',
    examples: ['Non-compliance with regulations', 'Labor law violations', 'Industry standard deviations', 'Trade agreement breaches'],
    description: 'Risks related to compliance with industry regulations, standards, and legal requirements.'
  },
];

// Risk level indicators
const riskLevels = [
  { name: 'Critical', color: 'bg-red-500' },
  { name: 'High', color: 'bg-orange-500' },
  { name: 'Medium', color: 'bg-yellow-500' },
  { name: 'Low', color: 'bg-green-500' },
];

// Sample supplier risk data for mock display
const topRiskySuppliers = [
  { id: 1, name: 'Acme Electronics Ltd.', riskScore: 87, primaryRisk: 'Environmental', location: 'Taiwan' },
  { id: 2, name: 'Global Materials Inc.', riskScore: 74, primaryRisk: 'Social', location: 'India' },
  { id: 3, name: 'Pacific Shipping Co.', riskScore: 68, primaryRisk: 'Political', location: 'Singapore' },
  { id: 4, name: 'Eurotech Manufacturing', riskScore: 65, primaryRisk: 'Operational', location: 'Germany' },
  { id: 5, name: 'American Components LLC', riskScore: 62, primaryRisk: 'Cybersecurity', location: 'USA' },
];

interface RiskCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  examples: string[];
  description: string;
}

interface RiskLevel {
  name: string;
  color: string;
}

function RiskCategoryCard({ category }: { category: RiskCategory }) {
  const [, navigate] = useLocation();
  
  return (
    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => navigate(`/risk-assessment/${category.id}`)}>
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

export default function RiskAssessment() {
  const [activeTab, setActiveTab] = useState('categories');
  const [, navigate] = useLocation();

  // Simulating a loading state for a data fetch
  const { isLoading } = useQuery({
    queryKey: ['/api/risk-summary'],
    enabled: false, // Disable actual fetching since we're using mock data
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Risk Assessment</h1>
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

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex justify-between items-center border-b mb-4">
            <TabsList className="mb-[-1px]">
              <TabsTrigger value="categories">Risk Categories</TabsTrigger>
              <TabsTrigger value="suppliers">Risky Suppliers</TabsTrigger>
              <TabsTrigger value="dnb">D&B Assessment</TabsTrigger>
              <TabsTrigger value="compliance">D&B Compliance</TabsTrigger>
              <TabsTrigger value="trends">Trends & Analysis</TabsTrigger>
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
          
          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskCategories.map((category) => (
                <RiskCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>Highest Risk Suppliers</CardTitle>
                <CardDescription>Suppliers with the highest risk scores across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium py-3 pl-4">Supplier</th>
                        <th className="text-left font-medium py-3">Risk Score</th>
                        <th className="text-left font-medium py-3">Primary Risk</th>
                        <th className="text-left font-medium py-3">Location</th>
                        <th className="text-right font-medium py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRiskySuppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 pl-4">{supplier.name}</td>
                          <td className="py-3">
                            <div className="flex items-center">
                              <span className={`inline-block w-2 h-8 ${supplier.riskScore > 75 ? 'bg-red-500' : supplier.riskScore > 65 ? 'bg-orange-500' : 'bg-yellow-500'} mr-2`}></span>
                              <span>{supplier.riskScore}/100</span>
                            </div>
                          </td>
                          <td className="py-3">{supplier.primaryRisk}</td>
                          <td className="py-3">{supplier.location}</td>
                          <td className="py-3 pr-4 text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                              Details <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm" className="text-sm">
                    View All Suppliers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          
          <TabsContent value="compliance">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>D&B Compliance Intelligence</CardTitle>
                      <CardDescription>Comprehensive compliance monitoring and screening powered by D&B</CardDescription>
                    </div>
                    <Badge className="bg-blue-600 text-white">POWERED BY D&B</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-1 lg:col-span-2 flex flex-col">
                      <div className="border rounded-lg p-4 mb-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-700">KYC/KYB Verification Status</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">VERIFIED</Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-500">Identity Verification</span>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm font-medium">Complete</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-500">Beneficial Owner Verification</span>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm font-medium">Complete</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-500">Address Verification</span>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm font-medium">Complete</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-500">Business Registration</span>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm font-medium">Verified</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">D-U-N-S® Number</span>
                            <div className="flex items-center">
                              <span className="text-sm font-medium">84-392-8710</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-white flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-700">Compliance Screening Results</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">PASSED</Badge>
                        </div>
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left font-medium p-2">Screening Type</th>
                                <th className="text-left font-medium p-2">Status</th>
                                <th className="text-left font-medium p-2">Last Updated</th>
                                <th className="text-left font-medium p-2">Risk Level</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2">Sanctions Screening</td>
                                <td className="p-2">
                                  <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Clear
                                  </div>
                                </td>
                                <td className="p-2">May 1, 2025</td>
                                <td className="p-2">Low</td>
                              </tr>
                              <tr className="border-b">
                                <td className="p-2">PEP Screening</td>
                                <td className="p-2">
                                  <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Clear
                                  </div>
                                </td>
                                <td className="p-2">May 1, 2025</td>
                                <td className="p-2">Low</td>
                              </tr>
                              <tr className="border-b">
                                <td className="p-2">Adverse Media</td>
                                <td className="p-2">
                                  <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                    Flagged (Minor)
                                  </div>
                                </td>
                                <td className="p-2">Apr 29, 2025</td>
                                <td className="p-2">Medium</td>
                              </tr>
                              <tr className="border-b">
                                <td className="p-2">Ultimate Beneficial Owners</td>
                                <td className="p-2">
                                  <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Verified
                                  </div>
                                </td>
                                <td className="p-2">Apr 28, 2025</td>
                                <td className="p-2">Low</td>
                              </tr>
                              <tr>
                                <td className="p-2">Regulatory Compliance</td>
                                <td className="p-2">
                                  <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Compliant
                                  </div>
                                </td>
                                <td className="p-2">Apr 25, 2025</td>
                                <td className="p-2">Low</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 flex flex-col space-y-4">
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-700">ESG Risk Assessment</h3>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">MEDIUM</Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Environmental</span>
                              <span className="font-medium">68/100</span>
                            </div>
                            <Progress value={68} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Social</span>
                              <span className="font-medium">72/100</span>
                            </div>
                            <Progress value={72} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Governance</span>
                              <span className="font-medium">81/100</span>
                            </div>
                            <Progress value={81} className="h-1.5" />
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500">ESG Risk factors are monitored continuously across your supplier base</p>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-white flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-700">Cyber Risk Rating</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">SECURE</Badge>
                        </div>
                        <div className="flex items-center justify-center py-6">
                          <div className="relative w-32 h-32">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">A+</div>
                                <div className="text-sm text-gray-500 mt-1">Rating</div>
                              </div>
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-green-500 border-r-transparent border-b-transparent border-l-transparent" style={{ transform: 'rotate(60deg)' }}></div>
                            <div className="absolute inset-0 rounded-full border-4 border-green-300 border-r-transparent border-b-transparent border-l-transparent border-t-transparent" style={{ transform: 'rotate(240deg)' }}></div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center text-sm">
                            <Shield className="h-3.5 w-3.5 text-green-500 mr-2" />
                            <span className="text-gray-500">Strong security posture</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Shield className="h-3.5 w-3.5 text-green-500 mr-2" />
                            <span className="text-gray-500">Minimal vulnerabilities</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Shield className="h-3.5 w-3.5 text-green-500 mr-2" />
                            <span className="text-gray-500">Regular security testing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Policy-driven workflows</span>: Customize compliance processes to align with your risk appetite
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Real-time Alerts</CardTitle>
                    <CardDescription>Automated monitoring and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Continuous Updates</h4>
                          <p className="text-xs text-gray-500">Automated alerts for changes in compliance status and risk profiles</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <FileCheck2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Proactive Monitoring</h4>
                          <p className="text-xs text-gray-500">Detect compliance issues before they become critical problems</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Instant Notifications</h4>
                          <p className="text-xs text-gray-500">Receive alerts via email, SMS, or in-platform notifications</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Customizable Workflows</CardTitle>
                    <CardDescription>Tailored compliance processes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Risk-Based Approach</h4>
                          <p className="text-xs text-gray-500">Configure workflows based on your organization's risk appetite</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <BarChart className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Adaptive Screening</h4>
                          <p className="text-xs text-gray-500">Adjust due diligence levels based on risk categorization</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Approval Chains</h4>
                          <p className="text-xs text-gray-500">Define multi-level approval processes for high-risk suppliers</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Unified Risk Dashboard</CardTitle>
                    <CardDescription>Consolidated risk view across categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Comprehensive Metrics</h4>
                          <p className="text-xs text-gray-500">View financial, ESG, cyber, and compliance risks in one place</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Advanced Analytics</h4>
                          <p className="text-xs text-gray-500">Gain insights with detailed analytical reports and visualizations</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <Globe className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Cross-Domain View</h4>
                          <p className="text-xs text-gray-500">Understand interconnected risk factors across your supplier network</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dnb">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>D&B Business Credit Risk Score</CardTitle>
                      <CardDescription>Comprehensive business credit assessment powered by D&B data</CardDescription>
                    </div>
                    <Badge className="bg-blue-600 text-white">POWERED BY D&B</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">D&B Supplier Evaluation</h3>
                        <Badge variant="outline" className="font-medium">D-U-N-S® Verified</Badge>
                      </div>
                      <div className="flex items-center justify-center py-4">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-8 border-blue-100"></div>
                          <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-r-transparent border-b-transparent"  style={{ transform: 'rotate(45deg)' }}></div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-700">580</div>
                            <div className="text-sm text-gray-500 mt-1">medium-low risk</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Score:</span>
                          <span className="font-medium">580/850</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Percentile:</span>
                          <span className="font-medium">72nd</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Last updated:</span>
                          <span className="font-medium">14 days ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Financial Stress Score</h3>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">CLASS 3</Badge>
                      </div>
                      <div className="space-y-4 mt-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Delinquency Risk:</span>
                            <span className="font-medium">Moderate</span>
                          </div>
                          <Progress value={52} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Probability of Failure:</span>
                            <span className="font-medium">1.1% - 3.0%</span>
                          </div>
                          <Progress value={31} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Payment Performance:</span>
                            <span className="font-medium">Average</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Sources:</span>
                            <span className="text-gray-500">Trade payments, financial statements, public records</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Risk Events & Ratings</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active Monitoring</Badge>
                      </div>
                      <div className="space-y-3 mt-2">
                        <div className="p-2 rounded-md bg-gray-50 border border-gray-100">
                          <div className="flex items-start">
                            <div className="p-1 rounded-full bg-amber-100 mr-2">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="text-xs font-medium">Late Payment Warning</h4>
                                <span className="text-xs text-gray-500">2d ago</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">15% of payments made beyond terms in last 90 days</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 rounded-md bg-gray-50 border border-gray-100">
                          <div className="flex items-start">
                            <div className="p-1 rounded-full bg-blue-100 mr-2">
                              <FileText className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="text-xs font-medium">D&B Rating Updated</h4>
                                <span className="text-xs text-gray-500">7d ago</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">Rating changed from 2A3 to 2A2 (improved)</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 rounded-md bg-gray-50 border border-gray-100">
                          <div className="flex items-start">
                            <div className="p-1 rounded-full bg-green-100 mr-2">
                              <ArrowUpCircle className="h-3.5 w-3.5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="text-xs font-medium">Financial Strength</h4>
                                <span className="text-xs text-gray-500">14d ago</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">Current ratio improved from 1.8 to 2.3</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <Button variant="ghost" size="sm" className="text-xs">
                            View All Events <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 pb-2 flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <FileCheck2 className="mr-2 h-4 w-4 text-blue-500" />
                    Data provided by Dun & Bradstreet, updated May 01, 2025
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>D&B Risk Management Solutions</CardTitle>
                  <CardDescription>Access integrated risk management tools powered by D&B</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer bg-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">Third-Party Risk Assessment</h3>
                          <p className="text-xs text-gray-500">Evaluate and manage third-party risk</p>
                        </div>
                      </div>
                      <div className="ml-11">
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Compliance verification
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Financial stability monitoring
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Continuous risk alerts
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer bg-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-red-50">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">Credit Risk Management</h3>
                          <p className="text-xs text-gray-500">Manage credit risk with real-time data</p>
                        </div>
                      </div>
                      <div className="ml-11">
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Credit limit recommendations
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Payment behavior analytics
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Predictive risk scores
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer bg-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-amber-50">
                          <BarChart3 className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">ESG Risk Monitoring</h3>
                          <p className="text-xs text-gray-500">Monitor environmental and social governance risks</p>
                        </div>
                      </div>
                      <div className="ml-11">
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            ESG compliance verification
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Reputational risk alerts
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Sustainability metrics
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer bg-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-50">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">Global Risk View</h3>
                          <p className="text-xs text-gray-500">Access global risk insights and country intelligence</p>
                        </div>
                      </div>
                      <div className="ml-11">
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Country risk intelligence
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Political stability analysis
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Economic forecasting
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">Historical risk trend analysis will be available soon</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">Geographic risk visualization will be available soon</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
