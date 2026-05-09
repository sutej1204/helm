import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Database,
  Network,
  Brain,
  Shield,
  Zap,
  GitBranch,
  Users,
  BarChart3,
  Globe,
  Lock,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  ArrowRight,
  Workflow,
  Target,
  TrendingUp,
  Layers,
  Search,
  Code,
  Boxes
} from "lucide-react";

// Helm's native ontology-driven capabilities
const vantagePointCapabilities = {
  dataOntology: {
    status: "active",
    progress: 100,
    entities: ["Suppliers", "Transactions", "Risks", "Compliance", "Geopolitical Events", "Financial Metrics"]
  },
  intelligenceWorkflows: {
    status: "active", 
    progress: 95,
    pipelines: ["Risk Detection", "Compliance Automation", "Payment Intelligence", "ESG Monitoring"]
  },
  knowledgeGraph: {
    status: "active",
    progress: 90,
    connections: ["Supplier Networks", "Risk Propagation", "Financial Flows", "Regulatory Links"]
  }
};

// Core platform capabilities built on Foundry principles
const platformCapabilities = [
  {
    id: 1,
    title: "Unified Supply Chain Ontology",
    description: "Every supplier, transaction, and risk event mapped in a semantic knowledge graph for instant intelligence",
    icon: Layers,
    features: ["Real-time entity resolution", "Semantic relationship mapping", "Cross-domain analytics"],
    businessValue: "Single source of truth across all supply chain data",
    foundryPrinciple: "Ontology-driven data modeling"
  },
  {
    id: 2,
    title: "Intelligent Workflow Orchestration",
    description: "AI-powered workflows that automatically detect, analyze, and respond to supply chain events",
    icon: Workflow,
    features: ["Event-driven automation", "Smart decision trees", "Continuous optimization"],
    businessValue: "Automated risk response and compliance actions",
    foundryPrinciple: "Code-optional workflow building"
  },
  {
    id: 3,
    title: "Collaborative Intelligence Network",
    description: "Secure multi-party analytics enabling insights across your entire supplier ecosystem",
    icon: Network,
    features: ["Privacy-preserving computation", "Federated analytics", "Secure data sharing"],
    businessValue: "Network-wide intelligence without data exposure",
    foundryPrinciple: "Multi-party computation"
  },
  {
    id: 4,
    title: "Continuous Intelligence Engine",
    description: "Always-on AI that learns from every transaction, risk event, and market signal",
    icon: Brain,
    features: ["Real-time model updates", "Anomaly detection", "Predictive insights"],
    businessValue: "Proactive risk management and optimization",
    foundryPrinciple: "Continuous machine learning"
  }
];

// Helm intelligence applications
const intelligenceApplications = [
  {
    title: "Always-On Risk Radar",
    description: "Continuous monitoring of 140+ risk types across your entire supplier network with automatic alert prioritization",
    vantageFeatures: ["Semantic Risk Modeling", "Real-time Event Processing", "Intelligent Alert Scoring"],
    businessOutcome: "85% faster risk detection and response",
    pillar: "Risk and Intelligence Signals"
  },
  {
    title: "Predictive Working Capital",
    description: "AI-driven optimization of payment terms and cash flow based on supplier behavior patterns and market conditions",
    vantageFeatures: ["Dynamic Payment Modeling", "Behavioral Analytics", "Market Intelligence"],
    businessOutcome: "£30M+ working capital improvement",
    pillar: "Supply Chain Finance"
  },
  {
    title: "Autonomous Compliance",
    description: "Self-executing compliance workflows that automatically screen, monitor, and remediate compliance issues",
    vantageFeatures: ["Automated Screening Pipelines", "Regulatory Change Detection", "Smart Remediation"],
    businessOutcome: "99.5% compliance accuracy with 80% less manual effort",
    pillar: "Onboarding Engine"
  }
];

// Integration status for the dashboard
const integrationStatus = {
  dataIngestion: {
    status: "active",
    progress: 100,
    sources: ["SAP", "Oracle", "NetSuite", "Financial APIs"]
  },
  ontologyMapping: {
    status: "active",
    progress: 95,
    entities: ["Suppliers", "Transactions", "Risks", "Compliance", "Payments", "Contracts"]
  },
  workflowAutomation: {
    status: "active",
    progress: 90,
    workflows: ["Risk Detection", "Compliance Automation", "Payment Intelligence", "ESG Monitoring"]
  }
};

// Foundry capabilities for display
const foundryCapabilities = [
  {
    id: 1,
    title: "Unified Supply Chain Ontology",
    description: "Every supplier, transaction, and risk event mapped in a semantic knowledge graph",
    icon: Layers,
    benefits: ["Real-time entity resolution", "Semantic relationship mapping", "Cross-domain analytics"],
    implementation: "Active",
    impact: "High"
  },
  {
    id: 2,
    title: "Intelligent Workflow Orchestration",
    description: "AI-powered workflows that detect, analyze, and respond to supply chain events",
    icon: Workflow,
    benefits: ["Event-driven automation", "Smart decision trees", "Continuous optimization"],
    implementation: "Active",
    impact: "High"
  },
  {
    id: 3,
    title: "Collaborative Intelligence Network",
    description: "Secure multi-party analytics across your supplier ecosystem",
    icon: Network,
    benefits: ["Privacy-preserving computation", "Federated analytics", "Secure data sharing"],
    implementation: "Building",
    impact: "Medium"
  },
  {
    id: 4,
    title: "Continuous Intelligence Engine",
    description: "Always-on AI that learns from transactions, events, and market signals",
    icon: Brain,
    benefits: ["Real-time model updates", "Anomaly detection", "Predictive insights"],
    implementation: "Active",
    impact: "High"
  }
];

// Use cases for display
const useCases = [
  {
    title: "Always-On Risk Radar",
    description: "Continuous monitoring of 140+ risk types across your entire supplier network",
    foundryFeatures: ["Semantic Risk Modeling", "Real-time Event Processing", "Intelligent Alert Scoring"],
    businessValue: "85% faster risk detection",
    timeline: "Phase 1"
  },
  {
    title: "Predictive Working Capital",
    description: "AI-driven optimization of payment terms based on supplier behavior patterns",
    foundryFeatures: ["Dynamic Payment Modeling", "Behavioral Analytics", "Market Intelligence"],
    businessValue: "£30M+ improvement",
    timeline: "Phase 2"
  },
  {
    title: "Autonomous Compliance",
    description: "Self-executing compliance workflows that automatically screen and remediate issues",
    foundryFeatures: ["Automated Screening Pipelines", "Regulatory Change Detection", "Smart Remediation"],
    businessValue: "99.5% accuracy",
    timeline: "Phase 1"
  }
];

// Architecture components for display
const architectureComponents = [
  {
    layer: "Intelligence Layer",
    components: ["Supply Chain Ontology", "Real-time Event Streams", "Knowledge Graph"],
    description: "Semantic foundation that understands every entity and relationship"
  },
  {
    layer: "Analytics Layer",
    components: ["AI Risk Models", "Predictive Workflows", "Optimization Engines"],
    description: "Continuous machine learning that improves with every transaction"
  },
  {
    layer: "Automation Layer",
    components: ["Smart Workflows", "Decision Engines", "Action Orchestration"],
    description: "Code-optional workflow building for complex decisions"
  },
  {
    layer: "Experience Layer",
    components: ["Helm UI", "Mobile Apps", "API Gateway"],
    description: "Intuitive interfaces that surface intelligence at the right moment"
  }
];

// Helm's technical architecture
const vantageArchitecture = [
  {
    layer: "Intelligence Layer",
    components: ["Supply Chain Ontology", "Real-time Event Streams", "Knowledge Graph"],
    description: "Semantic foundation that understands every entity, relationship, and event in your supply chain"
  },
  {
    layer: "Analytics Layer", 
    components: ["AI Risk Models", "Predictive Workflows", "Optimization Engines"],
    description: "Continuous machine learning that gets smarter with every transaction and event"
  },
  {
    layer: "Automation Layer",
    components: ["Smart Workflows", "Decision Engines", "Action Orchestration"],
    description: "Code-optional workflow building that automates complex supply chain decisions"
  },
  {
    layer: "Experience Layer",
    components: ["Helm UI", "Mobile Apps", "API Gateway"],
    description: "Intuitive interfaces that surface the right intelligence at the right moment"
  }
];

export default function PalantirIntegration() {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "building": return <Clock className="h-4 w-4 text-blue-600" />;
      case "planned": return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "building": return "bg-blue-100 text-blue-800 border-blue-200";
      case "planned": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Palantir Foundry Integration</h1>
            <p className="text-gray-500 mt-1">Enterprise-grade data platform powering advanced risk and intelligence signals</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Enterprise AI Platform
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Data Integration Active
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Target className="mr-2 h-4 w-4" />
              Deploy Workflow
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Database className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800">Foundry Integration Status</AlertTitle>
          <AlertDescription className="text-blue-700">
            Data ontology is actively processing supplier intelligence across {integrationStatus.dataIngestion.sources.length} major data sources. 
            Real-time analytics and ML pipelines are operational.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Platform Overview</TabsTrigger>
            <TabsTrigger value="capabilities">Core Capabilities</TabsTrigger>
            <TabsTrigger value="usecases">Use Cases</TabsTrigger>
            <TabsTrigger value="architecture">Technical Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Database className="h-5 w-5 mr-2 text-blue-600" />
                    Data Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      {getStatusIcon(integrationStatus.dataIngestion.status)}
                    </div>
                    <Progress value={integrationStatus.dataIngestion.progress} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {integrationStatus.dataIngestion.sources.length} data sources connected
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <GitBranch className="h-5 w-5 mr-2 text-green-600" />
                    Ontology Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      {getStatusIcon(integrationStatus.ontologyMapping.status)}
                    </div>
                    <Progress value={integrationStatus.ontologyMapping.progress} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {integrationStatus.ontologyMapping.entities.length} entity types mapped
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Workflow className="h-5 w-5 mr-2 text-purple-600" />
                    Workflow Automation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      {getStatusIcon(integrationStatus.workflowAutomation.status)}
                    </div>
                    <Progress value={integrationStatus.workflowAutomation.progress} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {integrationStatus.workflowAutomation.workflows.length} workflows planned
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Integration Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Immediate Benefits</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Unified data model across all systems</li>
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Real-time supplier intelligence updates</li>
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Advanced graph-based risk analysis</li>
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Automated compliance monitoring</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Advanced Capabilities</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center"><TrendingUp className="h-4 w-4 text-blue-600 mr-2" />Predictive risk modeling with ML</li>
                      <li className="flex items-center"><TrendingUp className="h-4 w-4 text-blue-600 mr-2" />Multi-party computation for secure analytics</li>
                      <li className="flex items-center"><TrendingUp className="h-4 w-4 text-blue-600 mr-2" />Dynamic workflow orchestration</li>
                      <li className="flex items-center"><TrendingUp className="h-4 w-4 text-blue-600 mr-2" />Enterprise-grade security and governance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-6">
            <div className="grid gap-6">
              {foundryCapabilities.map((capability) => (
                <Card key={capability.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg mr-4">
                          <capability.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{capability.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{capability.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(capability.implementation.toLowerCase())}>
                          {capability.implementation}
                        </Badge>
                        <Badge variant="outline" className={
                          capability.impact === 'High' ? 'border-red-200 text-red-800' : 'border-amber-200 text-amber-800'
                        }>
                          {capability.impact} Impact
                        </Badge>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {capability.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <ArrowRight className="h-3 w-3 text-green-600 mr-2" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usecases" className="space-y-6">
            <div className="grid gap-6">
              {useCases.map((useCase, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                        <p className="text-gray-600 mb-4">{useCase.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 mb-2">
                          {useCase.timeline}
                        </Badge>
                        <div className="text-sm font-medium text-green-600">
                          {useCase.businessValue}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Foundry Features Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.foundryFeatures.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {architectureComponents.map((layer, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{layer.layer}</h4>
                        <div className="flex gap-2">
                          {layer.components.map((component, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{layer.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Flow Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="p-4 bg-blue-50 rounded-lg mb-2">
                        <Database className="h-8 w-8 text-blue-600 mx-auto" />
                      </div>
                      <h5 className="font-medium">Data Sources</h5>
                      <p className="text-xs text-gray-600">ERP, Financial, External</p>
                    </div>
                    <div className="text-center">
                      <div className="p-4 bg-green-50 rounded-lg mb-2">
                        <GitBranch className="h-8 w-8 text-green-600 mx-auto" />
                      </div>
                      <h5 className="font-medium">Foundry Ontology</h5>
                      <p className="text-xs text-gray-600">Semantic Layer</p>
                    </div>
                    <div className="text-center">
                      <div className="p-4 bg-purple-50 rounded-lg mb-2">
                        <Brain className="h-8 w-8 text-purple-600 mx-auto" />
                      </div>
                      <h5 className="font-medium">AI Analytics</h5>
                      <p className="text-xs text-gray-600">ML Pipelines</p>
                    </div>
                    <div className="text-center">
                      <div className="p-4 bg-orange-50 rounded-lg mb-2">
                        <BarChart3 className="h-8 w-8 text-orange-600 mx-auto" />
                      </div>
                      <h5 className="font-medium">SupplierIQ UI</h5>
                      <p className="text-xs text-gray-600">Business Interface</p>
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