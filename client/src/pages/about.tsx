import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign, Shield, TrendingUp, Zap, CheckCircle, Database, Code, Network, Brain, Target, UserPlus, AlertTriangle } from "lucide-react";
import platformArchitectureImage from "@assets/image_1750068440638.png";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 mr-6 shadow-lg">
            <svg className="h-14 w-14 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">
              Helm
            </h1>
            <p className="text-xl text-blue-600 font-medium">AI Native Supply Chain Intelligence</p>
          </div>
        </div>
        
        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Transform fragmented data into real-time intelligence helping supply chain leaders take control of their supply chain's planning and execution all on a single pane of glass.
        </p>
      </div>

      {/* Core Capabilities */}
      <div className="mb-16">
        {/* Connected Pillars Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Integrated Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Capabilities</h2>
          </div>
          
          {/* Connecting Architecture */}
          <div className="hidden md:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <svg className="w-full h-16" viewBox="0 0 800 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Horizontal foundation line */}
              <line x1="100" y1="32" x2="700" y2="32" stroke="#3b82f6" strokeWidth="3" opacity="0.3"/>
              {/* Vertical connectors to each pillar */}
              <line x1="150" y1="32" x2="150" y2="50" stroke="#3b82f6" strokeWidth="2" opacity="0.4"/>
              <line x1="400" y1="32" x2="400" y2="50" stroke="#3b82f6" strokeWidth="2" opacity="0.4"/>
              <line x1="650" y1="32" x2="650" y2="50" stroke="#3b82f6" strokeWidth="2" opacity="0.4"/>
              {/* Connection nodes */}
              <circle cx="150" cy="32" r="5" fill="#3b82f6" opacity="0.7"/>
              <circle cx="400" cy="32" r="5" fill="#3b82f6" opacity="0.7"/>
              <circle cx="650" cy="32" r="5" fill="#3b82f6" opacity="0.7"/>
            </svg>
          </div>
          
          {/* Unified Platform Foundation */}
          <div className="hidden md:block absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-5xl">
            <div className="h-6 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-full opacity-40"></div>
            <div className="h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded-full mt-1 opacity-30"></div>
          </div>
          
          <div className="relative z-10 pt-12 pb-8">
            {/* Desktop Layout - All pillars aligned */}
            <div className="hidden md:flex items-stretch justify-center gap-8">
              {/* Onboarding Engine - Left Side */}
              <div className="flex-1">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <CardHeader className="pb-4 text-center">
                    <div className="flex justify-center items-center mb-3">
                      <Shield className="h-5 w-5 text-purple-600 mr-3" />
                      <CardTitle className="text-xl text-gray-900">Onboarding Engine</CardTitle>
                    </div>
                    <CardDescription className="text-gray-600">
                      Automated regulatory alignment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center flex-1 flex flex-col justify-start">
                    <div className="space-y-3">
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Continuous automated screenings</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Global regulatory alignment</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Trading partner compliance</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk and Intelligence Signals - Center */}
              <div className="flex-1">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <CardHeader className="pb-4 text-center">
                    <div className="flex justify-center items-center mb-3">
                      <Globe className="h-5 w-5 text-blue-600 mr-3" />
                      <CardTitle className="text-xl text-gray-900">Risk and Intelligence Signals</CardTitle>
                    </div>
                    <CardDescription className="text-gray-600">
                      Real-time risk detection and monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center flex-1 flex flex-col justify-start">
                    <div className="space-y-3">
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Live ESG monitoring and alerts</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Real-time sanctions screening</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Reputational risk detection</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Automated onboarding engine</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Continuous compliance screening</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Supply Chain Finance - Right Side */}
              <div className="flex-1">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <CardHeader className="pb-4 text-center">
                    <div className="flex justify-center items-center mb-3">
                      <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                      <CardTitle className="text-xl text-gray-900">Supply Chain Finance</CardTitle>
                    </div>
                    <CardDescription className="text-gray-600">
                      AI-driven working capital optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center flex-1 flex flex-col justify-start">
                    <div className="space-y-3">
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Working Capital Analytics Suite</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Embedded Financing (AP/AR)</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Industry benchmarking</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile Layout - Original Grid */}
            <div className="md:hidden grid grid-cols-1 gap-8">


              {/* Risk and Intelligence Signals */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4 text-center">
                  <div className="flex justify-center items-center mb-3">
                    <Globe className="h-5 w-5 text-blue-600 mr-3" />
                    <CardTitle className="text-xl text-gray-900">Risk and Intelligence Signals</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Real-time risk detection and monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-3">
                    <div className="flex justify-center items-center">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Live ESG monitoring and alerts</span>
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Real-time sanctions screening</span>
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Reputational risk detection</span>
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Automated onboarding engine</span>
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Continuous compliance screening</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supply Chain Finance */}
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="pb-4 text-center">
                  <div className="flex justify-center items-center mb-3">
                    <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <CardTitle className="text-xl text-gray-900">Supply Chain Finance</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    AI-driven working capital optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-3">
                    <div className="flex justify-center items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Working Capital Analytics Suite</span>
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Embedded Financing (AP/AR)</span>
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Industry benchmarking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>



      {/* Trade Insight Platform Architecture */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Helm Platform Architecture</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Helm is the "Palantir for trade"—ingesting your raw data, blending it with proprietary trade records and real-time market signals, producing actionable business intelligence on a single dashboard so you can move from information to action in seconds.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
          <img 
            src={platformArchitectureImage} 
            alt="Helm Platform Architecture"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}