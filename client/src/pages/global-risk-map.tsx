import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { SupplierRiskMap } from "@/components/risk-assessment/supplier-risk-map";
import { Globe } from "lucide-react";

export default function GlobalRiskMap() {
  // Query for data
  const { isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    staleTime: 60000, // 1 minute
    enabled: true,
  });
  
  // Force the component to recalculate dimensions
  useEffect(() => {
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'));
    };
    
    // Call resize after component mounts
    setTimeout(handleResize, 500);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Global Risk Map</h1>
            <p className="text-gray-500 mt-1">
              Geographic visualization of trade risks across regions and suppliers
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle>Supplier Risk Distribution</CardTitle>
            <CardDescription>
              Global view of supplier risks by geographic location and risk intensity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[650px]">
              <SupplierRiskMap isLoading={isLoading} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle>Regional Risk Analysis</CardTitle>
            <CardDescription>
              Detailed breakdown of risk factors by geographic region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Asia-Pacific</h3>
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-amber-500 mr-2"></div>
                  <div>
                    <div className="font-semibold">Medium Risk</div>
                    <div className="text-sm text-gray-500">Political instability, natural disasters</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Europe</h3>
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-green-500 mr-2"></div>
                  <div>
                    <div className="font-semibold">Low Risk</div>
                    <div className="text-sm text-gray-500">Regulatory changes, inflation</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">North America</h3>
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-green-500 mr-2"></div>
                  <div>
                    <div className="font-semibold">Low Risk</div>
                    <div className="text-sm text-gray-500">Labor shortages, transportation</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Latin America</h3>
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-orange-500 mr-2"></div>
                  <div>
                    <div className="font-semibold">High Risk</div>
                    <div className="text-sm text-gray-500">Political unrest, currency volatility</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
