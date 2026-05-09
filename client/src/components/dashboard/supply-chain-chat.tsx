import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatResponse {
  response: string;
}

// Demo responses for professional presentations
const DEMO_RESPONSES: { [key: string]: string } = {
  "risk": "Based on your current portfolio, I've identified 12 high-risk suppliers across 3 regions. The primary concerns are: ESG compliance gaps in Southeast Asia (affecting 40% of your spend), sanctions exposure in Eastern Europe, and financial instability indicators for 3 Tier-1 suppliers. I recommend immediate diversification for suppliers showing combined risk scores above 7.5.",
  
  "compliance": "Your compliance rate stands at 94.2% across all active suppliers. Key gaps: 15 suppliers pending updated certifications, 8 suppliers require enhanced due diligence for sanctions screening, and 23 suppliers need ESG documentation updates. Automated screening has flagged 3 suppliers for immediate review due to recent regulatory changes.",
  
  "working capital": "Current analysis shows £2.4M in working capital optimization opportunities. Key findings: Early payment discounts could generate £460K annually, extended payment terms with 12 strategic suppliers could improve cash flow by £1.8M, and receivables factoring for 5 major customers could unlock £850K immediately. Average DSO reduction potential: 8.3 days.",
  
  "suppliers": "You're managing 287 active suppliers with £45.2M under management. Performance highlights: 156 suppliers rated 'Excellent' (>95% on-time delivery), 98 rated 'Good', 28 requiring improvement, and 5 flagged for immediate action. Top 10 suppliers represent 68% of total spend, indicating healthy diversification with room for strategic consolidation.",
  
  "cash": "AI-powered cash optimization has identified £94K in immediate release opportunities. This includes: £38K from payment term renegotiations, £31K from early payment discount optimization, £18K from currency hedging adjustments, and £7K from invoice processing acceleration. Total potential annual impact: £1.2M.",
  
  "tariff": "25 suppliers have tier 1 and 2 exposure to India",
  
  "default": "I can provide detailed insights on risk assessment (287 suppliers monitored), compliance status (94.2% rate), working capital optimization (£2.4M opportunities), supplier performance analysis, cash flow management, or any specific supply chain metrics. What would you like to explore?"
};

export default function SupplyChainChat() {
  const [demoMode, setDemoMode] = useState(true); // Enable demo mode by default for presentations
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: demoMode ? 
        "Hello! I'm your Helm AI assistant. I have instant access to your complete supply chain data - 287 active suppliers, £45.2M under management, and real-time risk monitoring. I can provide detailed insights on risk assessment, compliance status, working capital optimization, and supplier performance. What would you like to explore?" :
        "Hello! I'm your Helm AI assistant. I can help you analyze your supply chain data, answer questions about risk assessments, compliance status, working capital optimization, and more. What would you like to know?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to get demo response based on input keywords
  const getDemoResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Check for specific tariff question first (most specific)
    if (lowerInput.includes('tariff') && lowerInput.includes('india') && lowerInput.includes('25')) {
      return DEMO_RESPONSES.tariff;
    }
    if (lowerInput.includes('tariff') || lowerInput.includes('india') || lowerInput.includes('exposure')) {
      return DEMO_RESPONSES.tariff;
    }
    if (lowerInput.includes('risk') || lowerInput.includes('supplier risk') || lowerInput.includes('high risk')) {
      return DEMO_RESPONSES.risk;
    }
    if (lowerInput.includes('compliance') || lowerInput.includes('compliant') || lowerInput.includes('sanctions')) {
      return DEMO_RESPONSES.compliance;
    }
    if (lowerInput.includes('working capital') || lowerInput.includes('cash flow') || lowerInput.includes('payment') || lowerInput.includes('financing')) {
      return DEMO_RESPONSES['working capital'];
    }
    if (lowerInput.includes('supplier') || lowerInput.includes('vendors') || lowerInput.includes('performance')) {
      return DEMO_RESPONSES.suppliers;
    }
    if (lowerInput.includes('cash') || lowerInput.includes('optimization') || lowerInput.includes('£') || lowerInput.includes('money')) {
      return DEMO_RESPONSES.cash;
    }
    
    return DEMO_RESPONSES.default;
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      if (demoMode) {
        // Simulate API delay for realistic demo experience
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { response: getDemoResponse(message) };
      }
      
      const response = await fetch("/api/chat/supply-chain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gray-900 flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-blue-600" />
          AI Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about your supply chain data and get intelligent insights
          {demoMode && <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">DEMO MODE</span>}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="h-[400px] flex flex-col">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    } items-start space-x-2`}
                  >
                    <div
                      className={`rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white ml-2' 
                          : 'bg-gray-200 text-gray-600 mr-2'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 bg-blue-100 mr-2">
                      <Bot className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-900 flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Analyzing your supply chain data...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your supply chain..."
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || chatMutation.isPending}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {demoMode ? (
                <>Try asking: "What are my highest risks?" • "Show me compliance status" • "How can I optimize working capital?" • "What's my cash optimization potential?"</>
              ) : (
                <>Ask about risk assessments, compliance, working capital, or supplier analysis</>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}