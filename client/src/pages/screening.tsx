import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Globe as GlobeIcon,
  Info,
  RefreshCw,
  Search,
  Shield,
  SlidersHorizontal,
  Users,
  Zap
} from "lucide-react";

interface ScreeningResult {
  id: number;
  name: string;
  type: 'individual' | 'entity';
  matchType: 'ofac' | 'pep' | 'both';
  matchStrength: number;
  status: 'pending' | 'reviewing' | 'cleared' | 'flagged';
  dateDetected: string;
  lastUpdated: string;
  details: {
    address?: string;
    country?: string;
    identifiers?: string[];
    lists?: string[];
    position?: string;
    additionalInfo?: string;
  };
}

interface WatchlistAlert {
  id: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  date: string;
  isNew: boolean;
}

function SeverityBadge({ severity }: { severity: WatchlistAlert['severity'] }) {
  switch (severity) {
    case 'critical':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>;
    case 'low':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
    default:
      return null;
  }
}

function StatusBadge({ status }: { status: ScreeningResult['status'] }) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>;
    case 'reviewing':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reviewing</Badge>;
    case 'cleared':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Cleared</Badge>;
    case 'flagged':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Flagged</Badge>;
    default:
      return null;
  }
}

function MatchTypeBadge({ matchType }: { matchType: ScreeningResult['matchType'] }) {
  switch (matchType) {
    case 'ofac':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">OFAC</Badge>;
    case 'pep':
      return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">PEP</Badge>;
    case 'both':
      return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">OFAC & PEP</Badge>;
    default:
      return null;
  }
}

function MatchStrengthIndicator({ value }: { value: number }) {
  let colorClass = "bg-green-500";
  if (value > 70) colorClass = "bg-red-500";
  else if (value > 40) colorClass = "bg-amber-500";

  return (
    <div className="flex items-center gap-2">
      <Progress value={value} className={`h-2 ${colorClass}`} />
      <span className="text-sm font-medium">{value}%</span>
    </div>
  );
}

export default function ScreeningDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [listFilter, setListFilter] = useState("all");
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [matchThreshold, setMatchThreshold] = useState([60]);
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  // Demo data
  const screeningResults: ScreeningResult[] = [
    {
      id: 1,
      name: "Global Trading Partners LLC",
      type: "entity",
      matchType: "ofac",
      matchStrength: 82,
      status: "flagged",
      dateDetected: "2023-04-28",
      lastUpdated: "2023-04-29",
      details: {
        address: "123 Commerce St, Emirates Tower, Dubai, UAE",
        country: "United Arab Emirates",
        identifiers: ["Tax ID: 87654321", "Reg: DUB-87654"],
        lists: ["OFAC SDN List", "EU Consolidated List"],
        additionalInfo: "Possible match with sanctioned entity 'Global Trade Networks'"
      }
    },
    {
      id: 2,
      name: "Alexander Petrov",
      type: "individual",
      matchType: "pep",
      matchStrength: 75,
      status: "reviewing",
      dateDetected: "2023-04-27",
      lastUpdated: "2023-04-30",
      details: {
        country: "Russia",
        position: "Former Regional Minister of Finance",
        lists: ["Global PEP Database"],
        additionalInfo: "Left office in 2021, still considered PEP due to 5-year cooling period"
      }
    },
    {
      id: 3,
      name: "Strategic Materials Corporation",
      type: "entity",
      matchType: "both",
      matchStrength: 91,
      status: "flagged",
      dateDetected: "2023-04-25",
      lastUpdated: "2023-04-28",
      details: {
        address: "567 Industry Blvd, Beijing, China",
        country: "China",
        identifiers: ["Reg: CHN-78945-X"],
        lists: ["OFAC Non-SDN Chinese Military-Industrial Complex Companies List", "PEP Associated Entities"],
        additionalInfo: "Entity is controlled by multiple politically exposed persons and is on export restriction list"
      }
    },
    {
      id: 4,
      name: "Cargo Express International",
      type: "entity",
      matchType: "ofac",
      matchStrength: 45,
      status: "reviewing",
      dateDetected: "2023-04-26",
      lastUpdated: "2023-04-27",
      details: {
        address: "789 Logistics Way, Panama City, Panama",
        country: "Panama",
        identifiers: ["Reg: PAN-456123"],
        lists: ["OFAC Alert List"],
        additionalInfo: "Partial name match with entity on watchlist; additional information needed"
      }
    },
    {
      id: 5,
      name: "Maria Gonzalez",
      type: "individual",
      matchType: "pep",
      matchStrength: 35,
      status: "cleared",
      dateDetected: "2023-04-20",
      lastUpdated: "2023-04-25",
      details: {
        country: "Mexico",
        position: "Name match with State Official",
        lists: ["Local PEP List"],
        additionalInfo: "False positive - verified as different individual with same name"
      }
    },
    {
      id: 6,
      name: "Oriental Shipping Ltd",
      type: "entity",
      matchType: "ofac",
      matchStrength: 68,
      status: "pending",
      dateDetected: "2023-04-30",
      lastUpdated: "2023-04-30",
      details: {
        address: "123 Harbor Road, Singapore",
        country: "Singapore",
        identifiers: ["Reg: SGP-789456"],
        lists: ["OFAC SSI List"],
        additionalInfo: "Possible connection to sanctioned shipping network; awaiting additional verification"
      }
    }
  ];

  const watchlistAlerts: WatchlistAlert[] = [
    {
      id: 1,
      severity: "critical",
      title: "New Additions to OFAC SDN List",
      description: "15 entities and 23 individuals added to the OFAC SDN list under Iran sanctions program",
      source: "U.S. Department of Treasury",
      date: "2023-04-30",
      isNew: true
    },
    {
      id: 2,
      severity: "high",
      title: "Updates to PEP Database",
      description: "Major update to global PEP database following elections in multiple countries",
      source: "Global PEP Monitor",
      date: "2023-04-29",
      isNew: true
    },
    {
      id: 3,
      severity: "medium",
      title: "EU Sanctions Package Amended",
      description: "European Union has amended its Russia sanctions package with additional restrictions",
      source: "European Commission",
      date: "2023-04-25",
      isNew: false
    },
    {
      id: 4,
      severity: "high",
      title: "OFAC Issues New General License",
      description: "New general license issued for certain transactions related to pandemic response",
      source: "U.S. Department of Treasury",
      date: "2023-04-22",
      isNew: false
    },
    {
      id: 5,
      severity: "medium",
      title: "UN Updates Consolidated Sanctions List",
      description: "United Nations Security Council has updated its consolidated sanctions list",
      source: "United Nations",
      date: "2023-04-20",
      isNew: false
    },
    {
      id: 6,
      severity: "low",
      title: "UK OFSI Guidance Updated",
      description: "UK Office of Financial Sanctions Implementation has released updated guidance",
      source: "UK Treasury",
      date: "2023-04-15",
      isNew: false
    }
  ];

  const filteredResults = screeningResults.filter(result => {
    // Apply search filter
    if (searchTerm && !result.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !result.details.country?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Apply status filter
    if (statusFilter !== "all" && result.status !== statusFilter) {
      return false;
    }

    // Apply list filter
    if (listFilter !== "all") {
      if (listFilter === "ofac" && result.matchType !== "ofac" && result.matchType !== "both") {
        return false;
      }
      if (listFilter === "pep" && result.matchType !== "pep" && result.matchType !== "both") {
        return false;
      }
    }

    // Apply threshold filter
    if (result.matchStrength < matchThreshold[0]) {
      return false;
    }

    return true;
  });

  // Simulate a screening scan
  const startScan = () => {
    setIsScanning(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prevProgress + 5;
      });
    }, 200);
  };

  useEffect(() => {
    // Simulate auto-refresh every 30 seconds if enabled
    if (isAutoRefreshEnabled) {
      const refreshInterval = setInterval(() => {
        console.log("Auto-refreshing data...");
        // In a real implementation, this would fetch fresh data from the API
      }, 30000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [isAutoRefreshEnabled]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">OFAC & PEP Screening Dashboard</h1>
        <p className="text-gray-600">Interactive sanctions and politically exposed persons monitoring system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">OFAC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-bold text-indigo-600">42</div>
              <p className="text-gray-500 mt-1">Active screenings</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">3 Alerts</Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">2 Pending</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-3">Last updated: 4 minutes ago</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">PEP Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-bold text-purple-600">27</div>
              <p className="text-gray-500 mt-1">Active screenings</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">1 Alert</Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">4 Pending</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-3">Last updated: 4 minutes ago</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Screening Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-bold text-teal-600">98.2<span className="text-xl">%</span></div>
              <p className="text-gray-500 mt-1">Compliance score</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">5 Cleared</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">3 Reviewing</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-3">Based on 69 screenings this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="screening">Screening Results</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist Alerts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <Button disabled={isScanning} onClick={startScan} className="gap-2">
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Run New Scan
                </>
              )}
            </Button>
          </div>

          {isScanning && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Scanning suppliers and stakeholders...</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Detections</CardTitle>
                  <CardDescription>Latest screening matches requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {screeningResults
                      .filter(result => result.status === "flagged" || result.status === "reviewing")
                      .slice(0, 3)
                      .map(result => (
                        <div key={result.id} className="flex items-start p-3 border rounded-md hover:bg-gray-50">
                          <div className={`p-2 mr-3 rounded-full ${
                            result.matchStrength > 70 ? 'bg-red-100' : 
                            result.matchStrength > 40 ? 'bg-amber-100' : 'bg-blue-100'
                          }`}>
                            {result.matchStrength > 70 ? (
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            ) : result.matchStrength > 40 ? (
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                            ) : (
                              <Info className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{result.name}</h4>
                                <p className="text-sm text-gray-500">{result.type === 'individual' ? 'Individual' : 'Entity'} from {result.details.country}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <MatchTypeBadge matchType={result.matchType} />
                                <span className="text-xs text-gray-500 mt-1">{result.dateDetected}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">{result.details.additionalInfo}</p>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <div className="w-48">
                                <MatchStrengthIndicator value={result.matchStrength} />
                              </div>
                              <Button variant="outline" size="sm" className="text-xs h-8">Review</Button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("screening")}>
                    View All Results
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>Latest updates to sanctions and PEP lists</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {watchlistAlerts
                      .filter(alert => alert.isNew)
                      .map(alert => (
                        <div key={alert.id} className="p-3 border rounded-md hover:bg-gray-50">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <SeverityBadge severity={alert.severity} />
                              {alert.isNew && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{alert.date}</span>
                          </div>
                          <h4 className="font-medium mt-2">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Source: {alert.source}</span>
                            <Button variant="ghost" size="sm" className="h-8 text-xs">Details</Button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("watchlist")}>
                    View All Alerts
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="screening">
            <Card>
              <CardHeader>
                <CardTitle>Screening Results</CardTitle>
                <CardDescription>All detected OFAC and PEP matches</CardDescription>
                <div className="mt-4 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search by name or country..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="cleared">Cleared</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={listFilter} onValueChange={setListFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="List filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Lists</SelectItem>
                        <SelectItem value="ofac">OFAC</SelectItem>
                        <SelectItem value="pep">PEP</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="match-threshold" className="text-sm">Match Threshold: {matchThreshold}%</Label>
                    <Slider 
                      id="match-threshold" 
                      max={100} 
                      step={5}
                      value={matchThreshold} 
                      onValueChange={setMatchThreshold} 
                      className="w-[200px]" 
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium py-2">Name</th>
                        <th className="text-left font-medium py-2">Type</th>
                        <th className="text-left font-medium py-2">Country</th>
                        <th className="text-center font-medium py-2">Match</th>
                        <th className="text-center font-medium py-2">Strength</th>
                        <th className="text-center font-medium py-2">Status</th>
                        <th className="text-left font-medium py-2">Date</th>
                        <th className="text-right font-medium py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.length > 0 ? (
                        filteredResults.map(result => (
                          <tr key={result.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 font-medium">{result.name}</td>
                            <td className="py-2">{result.type === 'individual' ? 'Individual' : 'Entity'}</td>
                            <td className="py-2">{result.details.country}</td>
                            <td className="py-2 text-center">
                              <MatchTypeBadge matchType={result.matchType} />
                            </td>
                            <td className="py-2 text-center">
                              <div className="w-24 mx-auto">
                                <MatchStrengthIndicator value={result.matchStrength} />
                              </div>
                            </td>
                            <td className="py-2 text-center">
                              <StatusBadge status={result.status} />
                            </td>
                            <td className="py-2 text-sm text-gray-500">{result.dateDetected}</td>
                            <td className="py-2 text-right">
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            No matching results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-3 flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {filteredResults.length} of {screeningResults.length} results
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist">
            <Card>
              <CardHeader>
                <CardTitle>Watchlist Alerts</CardTitle>
                <CardDescription>Latest updates to sanctions and PEP lists worldwide</CardDescription>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <div className="flex items-center">
                      <Label htmlFor="show-new-only" className="mr-2 text-sm">Show new only</Label>
                      <Switch id="show-new-only" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Bell className="h-4 w-4" /> Manage Notifications
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {watchlistAlerts.map(alert => (
                    <Card key={alert.id} className="border overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between border-b pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={alert.severity} />
                            {alert.isNew && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{alert.date}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
                        <p className="text-gray-700 mb-3">{alert.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Source: {alert.source}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Mark as Read</Button>
                            <Button variant="default" size="sm">Full Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-3 flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {watchlistAlerts.length} alerts from the past 30 days
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Alerts
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Screening Settings</CardTitle>
                <CardDescription>Configure your OFAC and PEP screening parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Data Sources</h3>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 border p-3 rounded-md">
                      <div className="mt-0.5">
                        <Switch id="ofac-sdn" defaultChecked />
                      </div>
                      <div>
                        <Label htmlFor="ofac-sdn" className="font-medium">OFAC SDN List</Label>
                        <p className="text-sm text-gray-500">Specially Designated Nationals and Blocked Persons</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 border p-3 rounded-md">
                      <div className="mt-0.5">
                        <Switch id="ofac-ssi" defaultChecked />
                      </div>
                      <div>
                        <Label htmlFor="ofac-ssi" className="font-medium">OFAC SSI List</Label>
                        <p className="text-sm text-gray-500">Sectoral Sanctions Identifications List</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 border p-3 rounded-md">
                      <div className="mt-0.5">
                        <Switch id="eu-list" defaultChecked />
                      </div>
                      <div>
                        <Label htmlFor="eu-list" className="font-medium">EU Consolidated List</Label>
                        <p className="text-sm text-gray-500">European Union financial sanctions list</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 border p-3 rounded-md">
                      <div className="mt-0.5">
                        <Switch id="un-list" defaultChecked />
                      </div>
                      <div>
                        <Label htmlFor="un-list" className="font-medium">UN Sanctions List</Label>
                        <p className="text-sm text-gray-500">United Nations Security Council consolidated list</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 border p-3 rounded-md">
                      <div className="mt-0.5">
                        <Switch id="global-pep" defaultChecked />
                      </div>
                      <div>
                        <Label htmlFor="global-pep" className="font-medium">Global PEP Database</Label>
                        <p className="text-sm text-gray-500">Worldwide politically exposed persons</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 border p-3 rounded-md">
                      <div className="mt-0.5">
                        <Switch id="pep-relatives" defaultChecked />
                      </div>
                      <div>
                        <Label htmlFor="pep-relatives" className="font-medium">PEP Relatives & Associates</Label>
                        <p className="text-sm text-gray-500">Close connections to politically exposed persons</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Screening Configuration</h3>
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-refresh" className="font-medium">Automatic Data Refresh</Label>
                        <p className="text-sm text-gray-500">Automatically check for watchlist updates</p>
                      </div>
                      <Switch 
                        id="auto-refresh" 
                        checked={isAutoRefreshEnabled}
                        onCheckedChange={setIsAutoRefreshEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-screening" className="font-medium">Automatic Re-screening</Label>
                        <p className="text-sm text-gray-500">Re-run checks when watchlists are updated</p>
                      </div>
                      <Switch id="auto-screening" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="real-time-alerts" className="font-medium">Real-time Alerts</Label>
                        <p className="text-sm text-gray-500">Receive instant notifications for critical matches</p>
                      </div>
                      <Switch id="real-time-alerts" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="fuzzy-matching" className="font-medium">Fuzzy Name Matching</Label>
                        <p className="text-sm text-gray-500">Detect similar names with spelling variations</p>
                      </div>
                      <Switch id="fuzzy-matching" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="email-notifications">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Alerts</SelectItem>
                            <SelectItem value="high">High Priority Only</SelectItem>
                            <SelectItem value="daily">Daily Summary</SelectItem>
                            <SelectItem value="off">Off</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipients" className="font-medium">Alert Recipients</Label>
                        <Input id="recipients" placeholder="Enter email addresses" defaultValue="compliance@company.com" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t flex justify-between">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
