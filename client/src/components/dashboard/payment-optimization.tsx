import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentOptimizationProps {
  data: {
    currentDPO: number;
    optimizedDPO: number;
    workingCapitalImprovement: number;
    supplierCount: number;
  };
  isLoading?: boolean;
}

export function PaymentOptimization({ data, isLoading = false }: PaymentOptimizationProps) {
  const formattedWorkingCapital = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(data.workingCapitalImprovement);

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Payment Term Optimization</CardTitle>
          <div className="tooltip">
            <Info className="h-5 w-5 text-gray-400" />
            <span className="tooltip-text">AI suggestions for optimizing payment terms with suppliers</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mt-4"></div>
            <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-28 bg-gray-200 animate-pulse rounded mt-4"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Current Days Payable Outstanding</span>
                <span className="text-sm font-medium text-gray-900">{data.currentDPO} days</span>
              </div>
              <Progress value={data.currentDPO} className="h-2" indicatorClassName="bg-secondary" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Optimized Potential</span>
                <span className="text-sm font-medium text-green-600">{data.optimizedDPO} days</span>
              </div>
              <Progress value={data.optimizedDPO} className="h-2" indicatorClassName="bg-green-500" />
            </div>
            <div className="bg-green-50 p-3 rounded-md mt-2">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Potential Working Capital Improvement</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{formattedWorkingCapital} additional working capital by extending payment terms with {data.supplierCount} suppliers.</p>
                  </div>
                  <div className="mt-3">
                    <a href="#" className="text-sm font-medium text-green-700 hover:text-green-600">
                      View detailed analysis <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentOptimization;
