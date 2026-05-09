import { useState } from "react";
import { Zap, AlertCircle, ClipboardList, Mail, Check, Copy, Bot, ArrowUpRight, AlertTriangle, Clock, CheckCircle2, Play, FileText, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ExceptionTask {
  id: number;
  type: string;
  category: "rebate" | "volume_tier" | "early_pay" | "duplicate" | "mismatch";
  supplier: string;
  description: string;
  expected?: number;
  received?: number;
  amount: number;
  severity: "critical" | "warning" | "info";
  status: "pending" | "ai_resolving" | "reconciled" | "auto_reconciled";
  resolved: boolean;
}

interface AIAgentTask {
  id: number;
  action: string;
  supplier: string;
  amount: number;
  status: "running" | "pending" | "reconciled";
}

export default function FinancialOS() {
  const { toast } = useToast();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState({ type: "", supplier: "", amount: 0 });
  
  const [aiAgentTasks] = useState<AIAgentTask[]>([
    {
      id: 1,
      action: "Composing claim to Denso on $52,500 Variance",
      supplier: "Denso",
      amount: 52500,
      status: "pending"
    },
    {
      id: 2,
      action: "Reconciling Spectra Premium credit memo to eligible invoices by program",
      supplier: "Spectra Premium",
      amount: 0,
      status: "running"
    },
    {
      id: 3,
      action: "Matched Spectra Premium credit memo to 143 invoice line items",
      supplier: "Spectra Premium",
      amount: 0,
      status: "reconciled"
    }
  ]);

  const [exceptions, setExceptions] = useState<ExceptionTask[]>([
    {
      id: 1,
      type: "2% Loyalty Rebate Program",
      category: "rebate",
      supplier: "3M",
      description: "Underpayment detected - AI Agent preparing correspondence",
      expected: 119872,
      received: 93411,
      amount: 26461,
      severity: "critical",
      status: "ai_resolving",
      resolved: false
    },
    {
      id: 2,
      type: "Volume Tier Credit",
      category: "volume_tier",
      supplier: "Bosch",
      description: "Eligible but not yet claimed based on Q4 volume thresholds",
      amount: 45320,
      severity: "warning",
      status: "pending",
      resolved: false
    },
    {
      id: 3,
      type: "Early Pay Discount",
      category: "early_pay",
      supplier: "Dana",
      description: "Auto-reconciled - 2% discount applied correctly",
      amount: 8450,
      severity: "info",
      status: "auto_reconciled",
      resolved: false
    },
    {
      id: 4,
      type: "Quarterly Rebate Variance",
      category: "rebate",
      supplier: "Dorman",
      description: "Variance: -$21,242.29. Recommendation: Request short-pay correction.",
      expected: 122620,
      received: 101378,
      amount: 21242,
      severity: "critical",
      status: "pending",
      resolved: false
    },
    {
      id: 5,
      type: "Missing Credit Memo",
      category: "mismatch",
      supplier: "Gates",
      description: "3 eligible sales lines without corresponding credit memo",
      amount: 3591,
      severity: "warning",
      status: "pending",
      resolved: false
    }
  ]);

  const openExceptions = exceptions.filter(e => !e.resolved);
  const totalRecovered = 2437800;
  const creditsOutstanding = 684200;
  const vendorPrograms = 12;

  const draftEmail = (exceptionType: string, supplier: string, amount: number) => {
    setCurrentEmail({ type: exceptionType, supplier, amount });
    setEmailModalOpen(true);
  };

  const resolveTask = (id: number) => {
    setExceptions(prev => prev.map(e => 
      e.id === id ? { ...e, resolved: true } : e
    ));
    toast({
      title: "Task Resolved",
      description: "Exception has been marked as resolved.",
    });
  };

  const copyToClipboard = () => {
    const emailText = `Dear ${currentEmail.supplier} Team,

Helm's Financial OS has identified a variance in the recent credit memo processing related to your account.

Exception Type: ${currentEmail.type}
Discrepancy Amount: -$${currentEmail.amount.toLocaleString()}

Our records show an expected rebate based on our mutual program agreements and verified sales data. Please review and process the necessary correction.

Best regards,
Helm Financial Operations`;

    navigator.clipboard.writeText(emailText);
    toast({
      title: "Copied!",
      description: "Email content copied to clipboard.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-blue-100 text-blue-700 border-0"><Play className="h-3 w-3 mr-1" />RUNNING</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-0"><Clock className="h-3 w-3 mr-1" />PENDING</Badge>;
      case "reconciled":
      case "auto_reconciled":
        return <Badge className="bg-blue-100 text-blue-700 border-0"><CheckCircle2 className="h-3 w-3 mr-1" />RECONCILED</Badge>;
      case "ai_resolving":
        return <Badge className="bg-purple-100 text-purple-700 border-0"><Bot className="h-3 w-3 mr-1" />AI-RESOLVING</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-600" />
          Supply Chain Financial Control
        </h1>
        <p className="text-gray-600 mt-2">
          AI Financial Intelligence for Supply Chain - Capturing every dollar, simplifying complex agreements
        </p>
      </div>

      {/* Control Center Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Cash Recovered (YTD)</p>
                <p className="text-3xl font-bold text-blue-800 mt-1">
                  ${(totalRecovered / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center mt-2 text-blue-600 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +4.2% vs last year
                </div>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Credits Outstanding</p>
                <p className="text-3xl font-bold text-amber-800 mt-1">
                  ${(creditsOutstanding / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center mt-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {vendorPrograms} vendor programs
                </div>
              </div>
              <div className="bg-amber-500 p-3 rounded-full">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">AI Agent Queue</p>
                <p className="text-3xl font-bold text-purple-800 mt-1">
                  {aiAgentTasks.length} Tasks
                </p>
                <div className="flex items-center mt-2 text-purple-600 text-sm">
                  <Bot className="h-4 w-4 mr-1" />
                  {aiAgentTasks.filter(t => t.status === "running").length} running
                </div>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Agent Queue */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            AI Agent Queue
          </CardTitle>
          <CardDescription>
            Autonomous tasks being processed by Helm's AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiAgentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{task.action}</p>
                    <p className="text-sm text-gray-500">
                      {task.status === "pending" ? "Awaiting your review" : 
                       task.status === "running" ? "Processing automatically" : "Completed"}
                    </p>
                  </div>
                </div>
                {getStatusBadge(task.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exception Queue */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-500" />
                Exception Queue
              </CardTitle>
              <CardDescription>
                {openExceptions.length} items require attention
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              ${openExceptions.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {openExceptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Check className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                <p className="font-medium">All exceptions resolved!</p>
                <p className="text-sm">No pending tasks at this time.</p>
              </div>
            ) : (
              openExceptions.map((exception) => (
                <div
                  key={exception.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(exception.severity)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{exception.supplier}</span>
                          {getStatusBadge(exception.status)}
                        </div>
                        <p className="text-sm font-medium text-gray-700">{exception.type}</p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${exception.severity === "info" ? "text-blue-600" : "text-red-600"}`}>
                      {exception.severity === "info" ? "+" : "-"}${exception.amount.toLocaleString()}
                    </span>
                  </div>
                  
                  {exception.expected && exception.received && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Expected</p>
                          <p className="font-semibold text-gray-900">${exception.expected.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Received</p>
                          <p className="font-semibold text-gray-900">${exception.received.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Variance</p>
                          <p className="font-semibold text-red-600">
                            -${exception.amount.toLocaleString()} ({((exception.amount / exception.expected) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-3">{exception.description}</p>
                  
                  {exception.status === "ai_resolving" && (
                    <div className="flex items-center gap-2 text-sm text-purple-600 mb-3">
                      <Bot className="h-4 w-4" />
                      <span>AI Agent preparing correspondence →</span>
                      <Badge variant="outline" className="text-purple-600 border-purple-300">Pending approval</Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {exception.status !== "auto_reconciled" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => draftEmail(exception.type, exception.supplier, exception.amount)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Draft Email
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveTask(exception.id)}
                    >
                      {exception.status === "auto_reconciled" ? "Acknowledge" : "Resolve"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Protection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Revenue Slippage Prevention
          </CardTitle>
          <CardDescription>
            Never miss revenue opportunities again
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-4xl font-bold text-blue-600">97.2%</p>
              <p className="text-sm text-gray-600 mt-1">Credits Captured</p>
              <Progress value={97.2} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-4xl font-bold text-amber-600">$126K</p>
              <p className="text-sm text-gray-600 mt-1">Recovered This Quarter</p>
              <Progress value={72} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-4xl font-bold text-purple-600">89%</p>
              <p className="text-sm text-gray-600 mt-1">Auto-Reconciled</p>
              <Progress value={89} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Draft Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              AI Drafted Vendor Email
            </DialogTitle>
          </DialogHeader>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b text-sm">
              <p><span className="font-medium">TO:</span> {currentEmail.supplier} Team</p>
              <p><span className="font-medium">Subject:</span> {currentEmail.type} Reconciliation</p>
            </div>
            <div className="p-4 bg-white text-sm text-gray-700 max-h-60 overflow-y-auto">
              <p>Hi Team,</p>
              <br />
              <p>Our records show an expected credit of ${currentEmail.amount.toLocaleString()} for the {currentEmail.type}, but we have not yet received the corresponding amount.</p>
              <br />
              <p>Helm's Financial OS has verified this against our mutual program agreements and sales data. Please review and process the necessary adjustment.</p>
              <br />
              <p>Best regards,</p>
              <p>Helm Financial Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <Bot className="h-4 w-4" />
            <span>AI preparing correspondence</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              Close
            </Button>
            <Button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700">
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
