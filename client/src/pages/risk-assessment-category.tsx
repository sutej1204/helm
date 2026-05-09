import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  FilterX,
  Filter,
  Download,
  Clock,
  ExternalLink,
  BarChart,
  MapPin,
  CheckCircle2,
  XCircle,
  ActivitySquare
} from "lucide-react";

// Map of risk category ids to their details
const riskCategoryDetails = {
  'environmental': {
    name: 'Environmental Risks',
    description: 'Risks related to environmental impact, pollution, and sustainability issues',
    color: 'bg-green-100 text-green-800 border-green-200',
    examples: ['Chemical leakage', 'Deforestation', 'Emission violations', 'Pollution', 'Toxication', 'Waste disposal problems'],
    iconColor: 'text-green-600',
  },
  'social': {
    name: 'Social Risks',
    description: 'Risks related to labor practices, human rights, and community relations',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    examples: ['Child labor', 'Forced labor', 'Discrimination', 'Labor strikes', 'Protests', 'Worker suicides', 'Wage theft'],
    iconColor: 'text-blue-600',
  },
  'governance': {
    name: 'Governance Risks',
    description: 'Risks related to corporate governance, ethical conduct, and compliance with laws',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    examples: ['Corruption', 'Fraud', 'Insider trading', 'Regulatory shutdowns', 'Lawsuits', 'Tax evasion'],
    iconColor: 'text-indigo-600',
  },
  'financial': {
    name: 'Financial & Legal Risks',
    description: 'Risks related to financial stability, legal issues, and economic challenges',
    color: 'bg-red-100 text-red-800 border-red-200',
    examples: ['Insolvency', 'Credit rating downgrades', 'Mass layoffs', 'Accounting fraud', 'Legal procedures', 'Sanctions'],
    iconColor: 'text-red-600',
  },
  'operational': {
    name: 'Operational Risks',
    description: 'Risks related to business operations, production, and supply chain management',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    examples: ['Site closures', 'Supplier issues', 'Product recalls', 'Labor shortages', 'Equipment failures'],
    iconColor: 'text-orange-600',
  },
  'political': {
    name: 'Political & Geopolitical Risks',
    description: 'Risks related to political instability, government actions, and international relations',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    examples: ['Political unrest', 'Sanctions', 'Trade restrictions', 'Military conflicts', 'Policy changes'],
    iconColor: 'text-purple-600',
  },
  'natural': {
    name: 'Natural Disasters',
    description: 'Risks related to natural disasters, extreme weather events, and health crises',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    examples: ['Earthquakes', 'Floods', 'Hurricanes', 'Wildfires', 'Pandemics'],
    iconColor: 'text-yellow-600',
  },
  'cybersecurity': {
    name: 'Cybersecurity Risks',
    description: 'Risks related to cybersecurity threats and digital infrastructure vulnerabilities',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    examples: ['Data breaches', 'Cyberattacks', 'Ransomware incidents', 'IT system failures'],
    iconColor: 'text-cyan-600',
  },
  'market': {
    name: 'Commodity & Market Risks',
    description: 'Risks related to market conditions, pricing, and supply-demand dynamics',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    examples: ['Price volatility', 'Supply shortages', 'Demand fluctuations', 'Market entry barriers'],
    iconColor: 'text-pink-600',
  },
  'regulatory': {
    name: 'Regulatory & Compliance Risks',
    description: 'Risks related to compliance with industry regulations, standards, and legal requirements',
    color: 'bg-stone-100 text-stone-800 border-stone-200',
    examples: ['Non-compliance with regulations', 'Labor law violations', 'Industry standard deviations', 'Trade agreement breaches'],
    iconColor: 'text-stone-600',
  },
};

// Mock incident data - this would come from API in real implementation
const mockIncidents = [
  {
    id: 1,
    title: 'Emission Violations Reported',
    description: 'Multiple emission violations detected at manufacturing facility',
    supplier: 'Acme Electronics Ltd.',
    location: 'Taiwan',
    date: '2023-12-15',
    severity: 'critical',
    status: 'open',
    category: 'environmental',
  },
  {
    id: 2,
    title: 'Chemical Waste Disposal Issue',
    description: 'Improper disposal of chemical waste reported by local authorities',
    supplier: 'Global Materials Inc.',
    location: 'India',
    date: '2023-11-28',
    severity: 'high',
    status: 'investigating',
    category: 'environmental',
  },
  {
    id: 3,
    title: 'Water Pollution Incident',
    description: 'Contamination of local water supply attributed to manufacturing runoff',
    supplier: 'Pacific Manufacturing',
    location: 'Malaysia',
    date: '2023-10-05',
    severity: 'medium',
    status: 'mitigating',
    category: 'environmental',
  },
  {
    id: 4,
    title: 'Deforestation for Facility Expansion',
    description: 'Supplier accused of clearing protected forest for facility expansion',
    supplier: 'Eurotech Manufacturing',
    location: 'Brazil',
    date: '2023-09-18',
    severity: 'high',
    status: 'open',
    category: 'environmental',
  },
  {
    id: 5,
    title: 'Environmental Permit Violation',
    description: 'Operating without required environmental permits',
    supplier: 'American Components LLC',
    location: 'Mexico',
    date: '2023-12-03',
    severity: 'medium',
    status: 'resolved',
    category: 'environmental',
  },
];

type RiskSeverity = 'critical' | 'high' | 'medium' | 'low' | string;
type RiskStatus = 'open' | 'investigating' | 'mitigating' | 'resolved' | string;

interface RiskCategoryDetail {
  name: string;
  description: string;
  color: string;
  examples: string[];
  iconColor: string;
}

interface RiskIncident {
  id: number;
  title: string;
  description: string;
  supplier: string;
  location: string;
  date: string;
  severity: RiskSeverity;
  status: RiskStatus;
  category: string;
}

const getSeverityColor = (severity: RiskSeverity): string => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-300';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low': return 'bg-green-100 text-green-800 border-green-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status: RiskStatus): React.ReactNode => {
  switch (status) {
    case 'open': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'investigating': return <ActivitySquare className="h-4 w-4 text-orange-500" />;
    case 'mitigating': return <Clock className="h-4 w-4 text-blue-500" />;
    case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  }
};

export default function RiskAssessmentCategory() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('incidents');
  
  // Define type-safety for params
  const categoryId = params.categoryId as string || '';
  const category = riskCategoryDetails[categoryId as keyof typeof riskCategoryDetails] || {
    name: 'Unknown Category',
    description: 'Category details not found',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    examples: [],
    iconColor: 'text-gray-600',
  };
  
  // Filter incidents by category
  const incidents = mockIncidents.filter(incident => incident.category === categoryId);
  
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col space-y-2">
          <Button 
            variant="ghost" 
            className="self-start -ml-3 mb-2 text-gray-500 hover:text-gray-700"
            onClick={() => navigate('/risk-assessment')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Risk Assessment
          </Button>
          
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold text-gray-900">{category.name}</h1>
            <Badge className={`${category.color} border`}>
              {incidents.length} incidents
            </Badge>
          </div>
          
          <p className="text-gray-500">{category.description}</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {category.examples.map((example: string, i: number) => (
              <Badge key={i} variant="outline" className="bg-white">{example}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex justify-between items-center border-b mb-4">
            <TabsList className="mb-[-1px]">
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="trends">Trends & Analysis</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <TabsContent value="incidents">
            {incidents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {incidents.map((incident) => (
                  <Card key={incident.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: incident.severity === 'critical' ? '#ef4444' : incident.severity === 'high' ? '#f97316' : '#eab308' }}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-grow p-4">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(incident.status)}
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                            </Badge>
                            <span className="text-xs text-gray-500">{incident.date}</span>
                          </div>
                          <h3 className="text-lg font-medium mb-1">{incident.title}</h3>
                          <p className="text-gray-500 text-sm mb-2">{incident.description}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <BarChart className="h-4 w-4 mr-1" />
                              <span>{incident.supplier}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{incident.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 p-4 md:w-48 lg:w-56">
                          <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="mt-0 md:mt-2">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            News Source
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FilterX className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No incidents found</h3>
                  <p className="text-gray-500 max-w-md text-center mb-6">
                    There are currently no recorded {categoryId} risk incidents for your suppliers.
                  </p>
                  <Button variant="outline">Back to All Categories</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers with {category.name}</CardTitle>
                <CardDescription>Suppliers ranked by {categoryId} risk score</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col items-center justify-center">
                <BarChart2 className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">Supplier risk breakdown will be available soon</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>{category.name} Trends</CardTitle>
                <CardDescription>Historical analysis of {categoryId} risks in your supply chain</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col items-center justify-center">
                <BarChart className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">Trend analysis will be available soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}