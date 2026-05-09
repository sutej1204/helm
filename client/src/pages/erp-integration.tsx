import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Link, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Zap,
  ArrowUpDown,
  Building,
  Users,
  DollarSign,
  BarChart3,
  RefreshCw,
  Clock,
  Shield,
  Activity
} from "lucide-react";

// ERP Systems data
const erpSystems = [
  { 
    name: "SAP", 
    logo: "🔷", 
    status: "connected", 
    modules: ["AP", "Procurement", "Finance"], 
    dataSync: "Real-time",
    lastSync: "2 minutes ago",
    suppliers: 1247
  },
  { 
    name: "Oracle ERP Cloud", 
    logo: "🔴", 
    status: "connected", 
    modules: ["Purchasing", "Supplier Management", "Financials"], 
    dataSync: "Real-time",
    lastSync: "5 minutes ago",
    suppliers: 892
  },
  { 
    name: "Microsoft Dynamics 365", 
    logo: "🟦", 
    status: "pending", 
    modules: ["Finance", "Supply Chain"], 
    dataSync: "Hourly",
    lastSync: "Pending setup",
    suppliers: 0
  },
  { 
    name: "NetSuite", 
    logo: "🟠", 
    status: "connected", 
    modules: ["Procurement", "AP", "Vendor Management"], 
    dataSync: "Real-time",
    lastSync: "1 minute ago",
    suppliers: 543
  }
];

const dataFlows = [
  {
    direction: "inbound",
    category: "Supplier Master Data",
    description: "Vendor information, contact details, bank accounts",
    frequency: "Real-time",
    volume: "2,682 suppliers"
  },
  {
    direction: "inbound", 
    category: "Purchase Orders",
    description: "PO data, line items, delivery schedules",
    frequency: "Real-time",
    volume: "15,423 POs/month"
  },
  {
    direction: "inbound",
    category: "Invoice & Payment Data",
    description: "AP invoices, payment terms, payment history",
    frequency: "Real-time", 
    volume: "23,891 invoices/month"
  },
  {
    direction: "outbound",
    category: "Risk Scores",
    description: "Updated supplier risk assessments",
    frequency: "Daily",
    volume: "2,682 supplier updates"
  },
  {
    direction: "outbound",
    category: "Compliance Status",
    description: "KYC, sanctions, ESG compliance flags",
    frequency: "Real-time",
    volume: "Alerts & status updates"
  },
  {
    direction: "outbound",
    category: "Payment Optimization",
    description: "Recommended payment term adjustments",
    frequency: "Weekly",
    volume: "150-200 recommendations"
  }
];

const integrationMetrics = [
  { metric: "Data Accuracy", value: "99.7%", trend: "up" },
  { metric: "Sync Latency", value: "< 30s", trend: "stable" },
  { metric: "API Uptime", value: "99.9%", trend: "up" },
  { metric: "Error Rate", value: "0.03%", trend: "down" }
];

export default function ERPIntegration() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Data Integration</h1>
            <p className="text-gray-500 mt-1">
              Seamless connectivity with your data systems for real-time supplier intelligence
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Link className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Integration Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Connected ERPs</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suppliers Synced</p>
                  <p className="text-2xl font-bold">2,682</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Points/Day</p>
                  <p className="text-2xl font-bold">47K</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sync Health</p>
                  <p className="text-2xl font-bold">99.7%</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="data-flows">Data Flows</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* System Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-500" />
                  Connected ERP Systems
                </CardTitle>
                <CardDescription>Enterprise systems integrated with Helm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {erpSystems.map((erp, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{erp.logo}</div>
                          <div>
                            <h3 className="font-semibold">{erp.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>Modules: {erp.modules.join(", ")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            erp.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          } mb-2`}>
                            {erp.status === 'connected' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            <div>{erp.suppliers} suppliers</div>
                            <div>Last sync: {erp.lastSync}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-500" />
                  Integration Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {integrationMetrics.map((metric, index) => (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{metric.value}</div>
                      <div className="text-sm text-gray-600">{metric.metric}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Flows */}
          <TabsContent value="data-flows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ArrowUpDown className="h-5 w-5 mr-2 text-blue-500" />
                    Inbound Data Flows
                  </CardTitle>
                  <CardDescription>Data flowing from ERP systems to Helm</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataFlows.filter(flow => flow.direction === 'inbound').map((flow, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{flow.category}</h4>
                          <Badge className="bg-blue-100 text-blue-800">{flow.frequency}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{flow.description}</p>
                        <div className="text-sm font-medium text-blue-600">{flow.volume}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ArrowUpDown className="h-5 w-5 mr-2 text-green-500" />
                    Outbound Data Flows
                  </CardTitle>
                  <CardDescription>Insights flowing from Helm to ERP systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataFlows.filter(flow => flow.direction === 'outbound').map((flow, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{flow.category}</h4>
                          <Badge className="bg-green-100 text-green-800">{flow.frequency}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{flow.description}</p>
                        <div className="text-sm font-medium text-green-600">{flow.volume}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="configuration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-purple-500" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>Configure API endpoints and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">SAP REST API</div>
                          <div className="text-sm text-gray-500">https://api.sap.company.com/v2</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="p-3 border rounded bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Oracle Fusion API</div>
                          <div className="text-sm text-gray-500">https://oracle.company.com/fscmRestApi</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="p-3 border rounded bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">NetSuite REST API</div>
                          <div className="text-sm text-gray-500">https://netsuite.company.com/services</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2 text-orange-500" />
                    Sync Settings
                  </CardTitle>
                  <CardDescription>Configure data synchronization parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Supplier Master Data</div>
                        <div className="text-sm text-gray-500">Real-time sync enabled</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Purchase Orders</div>
                        <div className="text-sm text-gray-500">Real-time sync enabled</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Risk Score Updates</div>
                        <div className="text-sm text-gray-500">Daily batch sync</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Real-time Monitoring
                </CardTitle>
                <CardDescription>Live status of all ERP integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">3</div>
                      <div className="text-sm text-gray-600">Active Connections</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-blue-50">
                      <div className="text-2xl font-bold text-blue-600">1,247</div>
                      <div className="text-sm text-gray-600">Records Synced Today</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-orange-50">
                      <div className="text-2xl font-bold text-orange-600">23s</div>
                      <div className="text-sm text-gray-600">Avg Sync Time</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Recent Sync Activity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>SAP supplier data sync completed</span>
                        <span className="text-gray-500">2 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Oracle invoice data batch processed</span>
                        <span className="text-gray-500">5 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>NetSuite purchase order sync completed</span>
                        <span className="text-gray-500">8 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Risk scores pushed to SAP</span>
                        <span className="text-gray-500">15 minutes ago</span>
                      </div>
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