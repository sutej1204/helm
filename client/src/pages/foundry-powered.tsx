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

// Helm's ontology-driven intelligence status
const intelligenceStatus = {
  dataOntology: {
    status: "active",
    progress: 100,
    entities: 6,
    relationships: 45
  },
  workflowEngine: {
    status: "active", 
    progress: 95,
    automatedPipelines: 12,
    decisionsPerDay: 1500
  },
  knowledgeGraph: {
    status: "active",
    progress: 90,
    connectedEntities: 287000,
    riskConnections: 15600
  }
};

// Core Foundry-inspired capabilities native to Helm
const foundryPoweredCapabilities = [
  {
    id: 1,
    title: "Semantic Trade Intelligence Ontology",
    description: "Every supplier, transaction, and risk mapped in an intelligent knowledge graph that understands context and relationships",
    icon: Layers,
    capabilities: ["Entity resolution across systems", "Automatic relationship discovery", "Context-aware analytics"],
    businessImpact: "Single source of truth eliminates data silos",
    foundryInspiration: "Ontology-driven data modeling",
    status: "active"
  },
  {
    id: 2,
    title: "Code-Optional Intelligence Workflows",
    description: "Business users build sophisticated AI workflows through visual interfaces, no coding required",
    icon: Workflow,
    capabilities: ["Visual workflow builder", "Event-driven automation", "Smart decision logic"],
    businessImpact: "Business teams create AI solutions independently",
    foundryInspiration: "No-code workflow orchestration",
    status: "active"
  },
  {
    id: 3,
    title: "Collaborative Trade Intelligence",
    description: "Secure multi-party analytics that enable insights across your supplier network without exposing sensitive data",
    icon: Network,
    capabilities: ["Privacy-preserving computation", "Federated analytics", "Secure insight sharing"],
    businessImpact: "Network-wide intelligence with data privacy",
    foundryInspiration: "Multi-party computation frameworks",
    status: "building"
  },
  {
    id: 4,
    title: "Continuous Learning Intelligence",
    description: "AI models that continuously learn from every transaction, event, and outcome to improve predictions",
    icon: Brain,
    capabilities: ["Real-time model updates", "Adaptive algorithms", "Outcome feedback loops"],
    businessImpact: "Intelligence that gets smarter over time",
    foundryInspiration: "Continuous machine learning pipelines",
    status: "active"
  }
];

// How Helm applies Foundry principles to trade intelligence
const vantageApplications = [
  {
    title: "Always-On Risk Intelligence",
    description: "Continuous monitoring of 140+ risk types with semantic understanding of how risks propagate through your network",
    vantageFeatures: ["Semantic risk modeling", "Real-time event processing", "Intelligent alert prioritization"],
    foundryPrinciple: "Ontology-driven real-time analytics",
    businessOutcome: "85% faster risk detection with 60% fewer false alerts",
    pillar: "Risk and Intelligence Signals"
  },
  {
    title: "Intelligent Working Capital Optimization",
    description: "AI-powered payment term optimization that learns from supplier behavior and market conditions",
    vantageFeatures: ["Dynamic payment modeling", "Behavioral pattern recognition", "Market signal integration"],
    foundryPrinciple: "Continuous learning and optimization",
    businessOutcome: "£30M+ working capital improvement through AI insights",
    pillar: "Supply Chain Finance"
  },
  {
    title: "Autonomous Compliance Engine",
    description: "Self-executing compliance workflows that automatically screen, monitor, and remediate compliance issues",
    vantageFeatures: ["Automated screening pipelines", "Regulatory change detection", "Smart remediation workflows"],
    foundryPrinciple: "Workflow automation and orchestration",
    businessOutcome: "99.5% compliance accuracy with 80% less manual effort",
    pillar: "Onboarding Engine"
  }
];

// Technical architecture inspired by Foundry
const foundryInspiredArchitecture = [
  {
    layer: "Ontology Foundation",
    components: ["Trade Intelligence Semantic Model", "Entity Resolution Engine", "Relationship Graph"],
    description: "Foundry-inspired semantic layer that understands every entity and relationship in your trade network",
    foundryPrinciple: "Ontology as the foundation of all analytics"
  },
  {
    layer: "Intelligence Pipeline", 
    components: ["Continuous ML Models", "Real-time Analytics", "Predictive Engines"],
    description: "Always-on intelligence that processes events and updates models in real-time",
    foundryPrinciple: "Continuous computation and model updates"
  },
  {
    layer: "Workflow Orchestration",
    components: ["Visual Workflow Builder", "Event Processing", "Decision Automation"],
    description: "Code-optional workflow creation that enables business users to build sophisticated automations",
    foundryPrinciple: "Democratized workflow building"
  },
  {
    layer: "Collaborative Intelligence",
    components: ["Multi-party Analytics", "Secure Computation", "Federated Insights"],
    description: "Privacy-preserving analytics that enable insights across your entire supplier ecosystem",
    foundryPrinciple: "Secure multi-party computation"
  }
];

export default function FoundryPowered() {
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

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case "Risk and Intelligence Signals": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Supply Chain Finance": return "bg-green-100 text-green-800 border-green-200";
      case "Onboarding Engine": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Foundry-Powered Intelligence</h1>
            <p className="text-gray-500 mt-1">Helm built on proven enterprise AI platform principles</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Ontology-Driven
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Continuous Intelligence
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                No-Code Workflows
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Code className="mr-2 h-4 w-4" />
              Build Workflow
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Brain className="mr-2 h-4 w-4" />
              Deploy Intelligence
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Layers className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800">Foundry-Inspired Intelligence Active</AlertTitle>
          <AlertDescription className="text-blue-700">
            Helm's ontology engine is processing {intelligenceStatus.knowledgeGraph.connectedEntities.toLocaleString()} connected entities 
            across your trade network with {intelligenceStatus.workflowEngine.automatedPipelines} active AI workflows.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Intelligence Overview</TabsTrigger>
            <TabsTrigger value="capabilities">Core Capabilities</TabsTrigger>
            <TabsTrigger value="applications">Business Applications</TabsTrigger>
            <TabsTrigger value="architecture">Technical Foundation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Layers className="h-5 w-5 mr-2 text-blue-600" />
                    Semantic Ontology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      {getStatusIcon(intelligenceStatus.dataOntology.status)}
                    </div>
                    <Progress value={intelligenceStatus.dataOntology.progress} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {intelligenceStatus.dataOntology.entities} entity types, {intelligenceStatus.dataOntology.relationships} relationship types
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Workflow className="h-5 w-5 mr-2 text-green-600" />
                    Intelligence Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      {getStatusIcon(intelligenceStatus.workflowEngine.status)}
                    </div>
                    <Progress value={intelligenceStatus.workflowEngine.progress} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {intelligenceStatus.workflowEngine.automatedPipelines} active pipelines, {intelligenceStatus.workflowEngine.decisionsPerDay.toLocaleString()} daily decisions
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Network className="h-5 w-5 mr-2 text-purple-600" />
                    Knowledge Graph
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      {getStatusIcon(intelligenceStatus.knowledgeGraph.status)}
                    </div>
                    <Progress value={intelligenceStatus.knowledgeGraph.progress} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {intelligenceStatus.knowledgeGraph.connectedEntities.toLocaleString()} entities, {intelligenceStatus.knowledgeGraph.riskConnections.toLocaleString()} risk relationships
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


          </TabsContent>

          <TabsContent value="capabilities" className="space-y-6">
            <div className="grid gap-6">
              {foundryPoweredCapabilities.map((capability) => (
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
                        <Badge className={getStatusColor(capability.status)}>
                          {capability.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      {capability.capabilities.map((cap, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <ArrowRight className="h-3 w-3 text-green-600 mr-2" />
                          {cap}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-xs text-gray-500">Foundry Inspiration:</span>
                        <p className="text-sm font-medium text-blue-600">{capability.foundryInspiration}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Business Impact:</span>
                        <p className="text-sm font-medium text-green-600">{capability.businessImpact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid gap-6">
              {vantageApplications.map((application, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{application.title}</h3>
                          <Badge className={getPillarColor(application.pillar)}>
                            {application.pillar}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{application.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {application.businessOutcome}
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Helm Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.vantageFeatures.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Foundry Principle:</h4>
                        <p className="text-sm text-blue-600 italic">{application.foundryPrinciple}</p>
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
                <CardTitle>Foundry-Inspired Technical Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {foundryInspiredArchitecture.map((layer, index) => (
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
                      <p className="text-sm text-gray-600 mb-2">{layer.description}</p>
                      <div className="text-xs text-blue-600 italic">
                        Foundry Principle: {layer.foundryPrinciple}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intelligence Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="p-4 bg-blue-50 rounded-lg mb-2">
                        <Database className="h-8 w-8 text-blue-600 mx-auto" />
                      </div>
                      <h5 className="font-medium">Raw Data</h5>
                      <p className="text-xs text-gray-600">Multi-source ingestion</p>
                    </div>
                    <div className="text-center">
                      <div className="p-4 bg-green-50 rounded-lg mb-2">
                        <Layers className="h-8 w-8 text-green-600 mx-auto" />
                      </div>
                      <h5 className="font-medium">Semantic Layer</h5>
                      <p className="text-xs text-gray-600">Ontology resolution</p>
                    </div>
                    <div className="text-center">
                      <div className="p-4 bg-purple-50 rounded-lg mb-2">
                        <Brain className="h-8 w-8 text-purple-600 mx-auto" />
                      </div>
                      <h5 className="font-medium">AI Analytics</h5>
                      <p className="text-xs text-gray-600">Continuous learning</p>
                    </div>
                    <div className="text-center">
                      <div className="p-4 bg-orange-50 rounded-lg mb-2">
                        <Target className="h-8 w-8 text-orange-600 mx-auto" />
                      </div>
                      <h5 className="font-medium">Actionable Intelligence</h5>
                      <p className="text-xs text-gray-600">Business outcomes</p>
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