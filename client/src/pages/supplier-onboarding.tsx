import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle,
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Bot,
  User,
  Send,
  Sparkles,
  FileUp,
  Zap,
  ShieldCheck,
  Building,
  Globe,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  Plus,
  X,
  GripVertical,
  ArrowRight,
  FileCheck,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  AlertTriangle,
  Info
} from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface RequestField {
  id: string;
  label: string;
  type: string;
  value: string;
  required: boolean;
}

interface OnboardingRequest {
  id: string;
  supplierName: string;
  status: "draft" | "in-review" | "approved" | "rejected";
  progress: number;
  fields: RequestField[];
}

export default function SupplierOnboarding() {
  const [activeTab, setActiveTab] = useState("conversational");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm Helm's AI onboarding assistant. I'll help you onboard a new supplier quickly and efficiently. Let's start with the basics - what's the name of the supplier you'd like to onboard?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentRequest, setCurrentRequest] = useState<OnboardingRequest>({
    id: "REQ-001",
    supplierName: "",
    status: "draft",
    progress: 0,
    fields: []
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supplier Passport state - dynamically computed and updated
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  
  // Update timestamp whenever supplier data changes
  useEffect(() => {
    if (currentRequest.supplierName || extractedData) {
      setLastUpdateTime(new Date());
    }
  }, [currentRequest.supplierName, currentRequest.progress, currentRequest.status, extractedData]);

  // Dynamically compute supplier passport metrics from state
  const supplierPassport = {
    supplierName: currentRequest.supplierName || "New Supplier",
    supplierId: currentRequest.id,
    tier: currentRequest.progress >= 80 ? "Tier 1 Supplier" : currentRequest.progress >= 50 ? "Tier 2 Supplier" : "Pending",
    // Compliance score based on progress and extracted data quality
    complianceScore: currentRequest.progress >= 90 ? Math.min(Math.floor(currentRequest.progress * 0.95), 95) :
                     currentRequest.progress >= 75 ? Math.min(Math.floor(currentRequest.progress * 0.88), 88) :
                     currentRequest.progress >= 50 ? Math.min(Math.floor(currentRequest.progress * 0.82), 82) : 0,
    isActive: currentRequest.status === "approved",
    category: extractedData?.country ? 
              (extractedData.country.includes("Kingdom") ? "Technology" : 
               extractedData.country.includes("USA") ? "Manufacturing" : "General") : "General",
    contractValue: extractedData?.annualRevenue || (currentRequest.progress >= 70 ? "$500K - $1M" : "Pending"),
    // Payment metrics derived from progress and actual payment terms
    avgPaymentDays: currentRequest.progress >= 60 ? 
                    (extractedData?.paymentTerms?.includes("30") ? 27 : 
                     extractedData?.paymentTerms?.includes("60") ? 55 : 28) : null,
    onTimePayment: currentRequest.progress >= 60 ? 
                   Math.min(90 + Math.floor(currentRequest.progress / 10), 98) : null,
    // Dynamic compliance checks based on progress
    hasISO27001: currentRequest.progress >= 50,
    hasSOC2: currentRequest.progress >= 50,
    hasGDPR: currentRequest.progress >= 75,
    needsModernSlaveryAct: currentRequest.progress >= 90,
  };

  // Questionnaire builder state
  const [questionnaireFields, setQuestionnaireFields] = useState<any[]>([
    { id: "1", label: "Supplier Name", type: "text", required: true },
    { id: "2", label: "Tax ID", type: "text", required: true },
    { id: "3", label: "Country", type: "select", required: true, options: ["USA", "UK", "Germany", "India", "China"] }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate conversational AI responses
  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (!currentRequest.supplierName) {
      setCurrentRequest(prev => ({ ...prev, supplierName: userMessage, progress: 20 }));
      return `Great! I've noted "${userMessage}" as the supplier name. Now, what category does this supplier fall under? (e.g., Raw Materials, Technology, Logistics, Services)`;
    }
    
    if (lowerMessage.includes("material") || lowerMessage.includes("technology") || lowerMessage.includes("logistic") || lowerMessage.includes("service")) {
      setCurrentRequest(prev => ({ ...prev, progress: 40 }));
      return `Perfect. What's the estimated annual spend with ${currentRequest.supplierName}? This helps us determine the appropriate approval workflow and risk assessment level.`;
    }
    
    if (lowerMessage.match(/\d+/) || lowerMessage.includes("k") || lowerMessage.includes("m")) {
      setCurrentRequest(prev => ({ ...prev, progress: 60 }));
      return `Thanks! Based on the spend level, I recommend a medium-risk approval workflow. Do you have any compliance documents ready? You can upload them in the "Document Extraction" tab, or I can continue gathering information here.`;
    }
    
    if (lowerMessage.includes("yes") || lowerMessage.includes("document") || lowerMessage.includes("upload")) {
      setCurrentRequest(prev => ({ ...prev, progress: 80 }));
      return `Excellent! You can switch to the "Document Extraction" tab to upload contracts or supplier documents. I'll automatically extract relevant information like tax IDs, addresses, and payment terms. Would you like me to continue with a few more questions first?`;
    }
    
    return `I've captured that information. Based on what you've shared, I've identified the key fields we need. You can review and complete the remaining information in the "Smart Form" tab, or continue our conversation here. What would you like to do next?`;
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<{ response: string }> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { response: getAIResponse(message) };
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: messages.length + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputValue);
    setInputValue("");
  };

  // Document extraction simulation
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsExtracting(true);
    setExtractionProgress(0);

    // Simulate AI extraction
    const interval = setInterval(() => {
      setExtractionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExtracting(false);
          // Simulate extracted data
          setExtractedData({
            supplierName: "Global Tech Solutions Ltd.",
            taxId: "GB-123456789",
            address: "123 Tech Street, London, UK",
            contactPerson: "John Smith",
            email: "john.smith@globaltechsolutions.com",
            paymentTerms: "Net 30",
            country: "United Kingdom",
            registrationNumber: "12345678",
            annualRevenue: "$50M"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const applyExtractedData = () => {
    if (!extractedData) return;
    setCurrentRequest(prev => ({
      ...prev,
      supplierName: extractedData.supplierName,
      progress: 90,
      fields: [
        { id: "name", label: "Supplier Name", type: "text", value: extractedData.supplierName, required: true },
        { id: "taxId", label: "Tax ID", type: "text", value: extractedData.taxId, required: true },
        { id: "address", label: "Address", type: "text", value: extractedData.address, required: true },
        { id: "contact", label: "Contact Person", type: "text", value: extractedData.contactPerson, required: true },
        { id: "email", label: "Email", type: "email", value: extractedData.email, required: true },
        { id: "payment", label: "Payment Terms", type: "text", value: extractedData.paymentTerms, required: false },
      ]
    }));
    setActiveTab("smart-form");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="h-7 w-7 text-blue-600" />
              Supplier Portal
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              AI-powered intake management for seamless supplier onboarding
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-blue-500" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {currentRequest.progress}% Complete
            </Badge>
          </div>
        </div>
      </div>

      {/* Onboarding Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Onboarding Progress</span>
            <span className="text-sm text-gray-500">{currentRequest.progress}%</span>
          </div>
          <Progress value={currentRequest.progress} className="h-2" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentRequest.progress >= 25 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-600">Basic Info</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentRequest.progress >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-600">Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentRequest.progress >= 75 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-600">Documents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentRequest.progress >= 100 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-600">Approval</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="conversational" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Conversational Intake</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="document-extraction" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">Document Extraction</span>
            <span className="sm:hidden">Extract</span>
          </TabsTrigger>
          <TabsTrigger value="smart-form" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Smart Form</span>
            <span className="sm:hidden">Form</span>
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Questionnaire Builder</span>
            <span className="sm:hidden">Builder</span>
          </TabsTrigger>
          <TabsTrigger value="passport" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Supplier Passport</span>
            <span className="sm:hidden">Passport</span>
          </TabsTrigger>
        </TabsList>

        {/* Conversational Intake Tab */}
        <TabsContent value="conversational" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        AI Onboarding Assistant
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Natural conversation - just like talking to a procurement expert
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Online
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            message.role === "assistant" ? "bg-blue-100" : "bg-gray-200"
                          }`}>
                            {message.role === "assistant" ? (
                              <Bot className="h-5 w-5 text-blue-600" />
                            ) : (
                              <User className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div className={`flex-1 ${message.role === "user" ? "flex justify-end" : ""}`}>
                            <div
                              className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                                message.role === "assistant"
                                  ? "bg-gray-100 text-gray-900"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <span className="text-xs opacity-70 mt-1 block">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {chatMutation.isPending && (
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="bg-gray-100 rounded-lg px-4 py-2">
                            <div className="flex gap-1">
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={chatMutation.isPending}
                        data-testid="input-chat-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || chatMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Enter to send • Ask me anything about supplier onboarding
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Request Summary Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Request Summary</CardTitle>
                  <CardDescription>Current onboarding status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Supplier Name</Label>
                    <p className="text-sm font-medium">{currentRequest.supplierName || "Not provided yet"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Request ID</Label>
                    <p className="text-sm font-medium">{currentRequest.id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <Badge variant="outline" className="mt-1">
                      {currentRequest.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Completion</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={currentRequest.progress} className="h-2 flex-1" />
                      <span className="text-xs font-medium">{currentRequest.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-blue-50 border-blue-200">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">AI-Powered Features</AlertTitle>
                <AlertDescription className="text-blue-800 text-sm">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Dynamic questioning</li>
                    <li>Auto-field detection</li>
                    <li>Smart recommendations</li>
                    <li>Policy compliance checks</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>

        {/* Document Extraction Tab */}
        <TabsContent value="document-extraction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-purple-600" />
                AI Document Extraction
              </CardTitle>
              <CardDescription>
                Upload supplier contracts, quotes, or documents - Helm AI extracts all relevant information automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  data-testid="input-file-upload"
                />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </div>

              {/* Extraction Progress */}
              {isExtracting && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Extracting data...</span>
                    <span className="text-sm text-gray-500">{extractionProgress}%</span>
                  </div>
                  <Progress value={extractionProgress} />
                  <p className="text-xs text-gray-500">
                    AI is analyzing your document and extracting supplier information
                  </p>
                </div>
              )}

              {/* Extracted Data Preview */}
              {extractedData && !isExtracting && (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">Extraction Complete</AlertTitle>
                    <AlertDescription className="text-green-800">
                      Successfully extracted {Object.keys(extractedData).length} fields from your document
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key}>
                        <Label className="text-xs text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <p className="text-sm font-medium">{value as string}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={applyExtractedData}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      data-testid="button-apply-extracted-data"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Apply to Form
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setExtractedData(null);
                        setUploadedFile(null);
                      }}
                      data-testid="button-discard-extraction"
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Instant Extraction</h4>
                    <p className="text-xs text-gray-600 mt-1">Extract data in seconds, not hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Policy Validation</h4>
                    <p className="text-xs text-gray-600 mt-1">Auto-check against your policies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">99% Accuracy</h4>
                    <p className="text-xs text-gray-600 mt-1">Industry-leading extraction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Form Tab */}
        <TabsContent value="smart-form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Smart Dynamic Form
              </CardTitle>
              <CardDescription>
                Intelligently adapts based on your responses and auto-fills known information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentRequest.fields.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentRequest.fields.map((field) => (
                      <div key={field.id}>
                        <Label className="flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          value={field.value}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="mt-1"
                          data-testid={`input-${field.id}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-submit-form">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit for Approval
                    </Button>
                    <Button variant="outline" data-testid="button-save-draft">
                      Save as Draft
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    No form data yet. Start a conversation or upload a document to auto-populate this form.
                  </p>
                  <div className="flex gap-3 justify-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("conversational")}
                      data-testid="button-start-conversation"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Conversation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("document-extraction")}
                      data-testid="button-upload-document"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questionnaire Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-700" />
                No-Code Questionnaire Builder
              </CardTitle>
              <CardDescription>
                Build custom intake questionnaires with drag-and-drop simplicity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Builder Toolbar */}
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                <Button variant="outline" size="sm" data-testid="button-add-text-field">
                  <Plus className="h-3 w-3 mr-1" />
                  Text Field
                </Button>
                <Button variant="outline" size="sm" data-testid="button-add-dropdown">
                  <Plus className="h-3 w-3 mr-1" />
                  Dropdown
                </Button>
                <Button variant="outline" size="sm" data-testid="button-add-checkbox">
                  <Plus className="h-3 w-3 mr-1" />
                  Checkbox
                </Button>
                <Button variant="outline" size="sm" data-testid="button-add-date">
                  <Plus className="h-3 w-3 mr-1" />
                  Date
                </Button>
                <Button variant="outline" size="sm" data-testid="button-add-number">
                  <Plus className="h-3 w-3 mr-1" />
                  Number
                </Button>
                <Button variant="outline" size="sm" data-testid="button-add-file-upload">
                  <Plus className="h-3 w-3 mr-1" />
                  File Upload
                </Button>
              </div>

              {/* Field List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Form Fields</Label>
                  <span className="text-xs text-gray-500">{questionnaireFields.length} fields</span>
                </div>
                {questionnaireFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-500 transition-colors">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{field.label}</p>
                      <p className="text-xs text-gray-500">
                        Type: {field.type} • {field.required ? 'Required' : 'Optional'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-field-${index}`}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-delete-field-${index}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conditional Logic Builder */}
              <Alert className="bg-orange-50 border-orange-200">
                <Zap className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900">Smart Logic</AlertTitle>
                <AlertDescription className="text-orange-800">
                  Add conditional logic to show/hide fields based on responses. Perfect for creating risk-based workflows.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4 border-t">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-template">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
                <Button variant="outline" data-testid="button-preview-form">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Preview Form
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pre-built Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pre-built Templates</CardTitle>
              <CardDescription>Start with industry best practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Standard Supplier", fields: 12, category: "General" },
                  { name: "High-Risk Vendor", fields: 24, category: "Compliance" },
                  { name: "Technology Provider", fields: 18, category: "IT" }
                ].map((template, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{template.fields} fields • {template.category}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2" data-testid={`button-use-template-${index}`}>
                      Use Template <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Passport Tab */}
        <TabsContent value="passport" className="space-y-6">
          {supplierPassport.supplierName === "New Supplier" ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Supplier Selected</AlertTitle>
              <AlertDescription>
                Start a conversation or upload a document to begin creating a supplier passport.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Passport Header */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileCheck className="h-6 w-6 text-blue-600" />
                        {supplierPassport.supplierName}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Supplier ID: {supplierPassport.supplierId} • Last Updated: {Math.floor((new Date().getTime() - lastUpdateTime.getTime()) / 60000)} minutes ago
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge className={supplierPassport.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                          {currentRequest.status === "approved" ? "Active" : currentRequest.status === "in-review" ? "Under Review" : "Draft"}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 border-blue-200">{supplierPassport.tier}</Badge>
                        <Badge variant="outline" className="bg-purple-50 border-purple-200">{supplierPassport.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{supplierPassport.complianceScore}%</div>
                      <div className="text-xs text-gray-600">Compliance Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compliance Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  Compliance
                </CardTitle>
                <CardDescription>Real-time compliance status and certifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compliance Status */}
                <div className="space-y-3">
                  {currentRequest.progress >= 50 ? (
                    <>
                      {supplierPassport.hasISO27001 && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">ISO 27001</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Valid</Badge>
                        </div>
                      )}
                      {supplierPassport.hasSOC2 && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">SOC 2 Type II</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Valid</Badge>
                        </div>
                      )}
                      {supplierPassport.hasGDPR && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium">GDPR Compliance</span>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Renewing</Badge>
                        </div>
                      )}
                      {supplierPassport.needsModernSlaveryAct && (
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">Modern Slavery Act</span>
                          </div>
                          <Badge className="bg-red-100 text-red-800 text-xs">Action Required</Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600">Compliance checks will be performed once supplier onboarding reaches 50%</p>
                    </div>
                  )}
                </div>

                {/* Recent Checks */}
                <div className="pt-3 border-t">
                  <Label className="text-xs text-gray-500 mb-2 block">Recent Automated Checks</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Sanctions screening</span>
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Clear
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Financial health</span>
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Strong
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Cyber security rating</span>
                      <span className="text-blue-600 flex items-center gap-1">
                        <Info className="h-3 w-3" /> A-
                      </span>
                    </div>
                  </div>
                </div>

                <Alert className="bg-orange-50 border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-sm text-orange-900">Action Required</AlertTitle>
                  <AlertDescription className="text-xs text-orange-800">
                    Modern Slavery Act certificate expired 14 days ago. Request renewal immediately.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Contract Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Contract
                </CardTitle>
                <CardDescription>SLAs, obligations, and renewal tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contract Details */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Contract Value</Label>
                    <p className="text-lg font-bold text-gray-900">{supplierPassport.contractValue}</p>
                    <p className="text-xs text-gray-500">{currentRequest.progress >= 60 ? "Annual" : "Pending review"}</p>
                  </div>
                  {currentRequest.progress >= 70 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Start Date</Label>
                        <p className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">End Date</Label>
                        <p className="text-sm font-medium text-orange-600">
                          {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SLA Tracking */}
                <div className="pt-3 border-t">
                  <Label className="text-xs text-gray-500 mb-2 block">SLA Performance (Last 90 days)</Label>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Delivery Time</span>
                        <span className="font-medium text-green-600">97.5%</span>
                      </div>
                      <Progress value={97.5} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Quality Standards</span>
                        <span className="font-medium text-green-600">99.2%</span>
                      </div>
                      <Progress value={99.2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Response Time</span>
                        <span className="font-medium text-yellow-600">88.3%</span>
                      </div>
                      <Progress value={88.3} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Key Obligations */}
                <div className="pt-3 border-t">
                  <Label className="text-xs text-gray-500 mb-2 block">Key Obligations</Label>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-700">Quarterly business reviews completed</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-700">Annual audit rights maintained</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-700">Insurance certificate renewal due in 30 days</p>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-sm text-blue-900">Renewal Reminder</AlertTitle>
                  <AlertDescription className="text-xs text-blue-800">
                    Contract expires in 42 days. Renewal discussions should begin now.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Payment Terms Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  Payment Terms
                </CardTitle>
                <CardDescription>Terms validation and payment performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Terms */}
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Label className="text-xs text-gray-500">Current Terms</Label>
                    <p className="text-lg font-bold text-purple-900">{extractedData?.paymentTerms || "Net 30"}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {currentRequest.progress >= 60 ? "2% discount if paid within 10 days" : "Terms pending negotiation"}
                    </p>
                  </div>
                  {supplierPassport.avgPaymentDays && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Avg. Payment Days</Label>
                        <p className="text-sm font-medium text-green-600">{supplierPassport.avgPaymentDays} days</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">On-Time %</Label>
                        <p className="text-sm font-medium text-green-600">{supplierPassport.onTimePayment}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment History */}
                <div className="pt-3 border-t">
                  <Label className="text-xs text-gray-500 mb-2 block">Recent Payments</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium">$85,000</p>
                        <p className="text-gray-500">Nov 15, 2024</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs">On-time</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium">$92,500</p>
                        <p className="text-gray-500">Oct 12, 2024</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs">Early</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium">$78,000</p>
                        <p className="text-gray-500">Sep 18, 2024</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Late (2d)</Badge>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="pt-3 border-t">
                  <Label className="text-xs text-gray-500 mb-3 block">Performance Trends</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Discount Capture Rate</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-600">78%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Invoice Disputes</span>
                      <span className="text-xs font-medium text-gray-900">2 (Last 12mo)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Total Spend YTD</span>
                      <span className="text-xs font-medium text-gray-900">$785,000</span>
                    </div>
                  </div>
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <Award className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-sm text-green-900">Strong Performance</AlertTitle>
                  <AlertDescription className="text-xs text-green-800">
                    Excellent payment track record. Consider negotiating better terms.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Intelligent Alerts Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                AI-Powered Insights & Recommendations
              </CardTitle>
              <CardDescription>Continuously monitored and intelligently updated based on supplier progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentRequest.progress < 50 && (
                  <Alert className="bg-white border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-sm">Onboarding In Progress</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Complete the onboarding to {currentRequest.progress >= 50 ? "70%" : "50%"} to unlock compliance monitoring and automated checks.
                    </AlertDescription>
                    <Button size="sm" variant="outline" className="mt-3 text-xs h-7" data-testid="button-continue-onboarding">
                      Continue Onboarding
                    </Button>
                  </Alert>
                )}
                
                {currentRequest.progress >= 90 && (
                  <Alert className="bg-white border-orange-200">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-sm">Compliance Gap Detected</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Modern Slavery Act certificate requires action. Non-compliance risk detected.
                    </AlertDescription>
                    <Button size="sm" variant="outline" className="mt-3 text-xs h-7" data-testid="button-resolve-compliance">
                      Initiate Renewal
                    </Button>
                  </Alert>
                )}

                {currentRequest.progress >= 70 && (
                  <Alert className="bg-white border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-sm">Contract Ready for Review</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Supplier information is {currentRequest.progress}% complete. Contract terms can now be finalized.
                    </AlertDescription>
                    <Button size="sm" variant="outline" className="mt-3 text-xs h-7" data-testid="button-start-renewal">
                      Review Contract
                    </Button>
                  </Alert>
                )}

                {currentRequest.progress >= 60 && (
                  <Alert className="bg-white border-green-200">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-sm">Payment Terms Configured</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Payment terms set to {extractedData?.paymentTerms || "Net 30"}. Performance tracking is now active.
                    </AlertDescription>
                    <Button size="sm" variant="outline" className="mt-3 text-xs h-7" data-testid="button-optimize-terms">
                      Optimize Terms
                    </Button>
                  </Alert>
                )}

                {currentRequest.progress >= 80 && (
                  <Alert className="bg-white border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-sm">High Completion Rate</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Supplier passport is {currentRequest.progress}% complete. All critical information captured successfully.
                    </AlertDescription>
                    <Button size="sm" variant="outline" className="mt-3 text-xs h-7" data-testid="button-finalize">
                      Finalize Onboarding
                    </Button>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
