import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HighRiskSupplier {
  id: number;
  name: string;
  issues: string;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
}

interface HighRiskSuppliersProps {
  data: HighRiskSupplier[];
  isLoading?: boolean;
}

export function HighRiskSuppliers({ data, isLoading = false }: HighRiskSuppliersProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRiskBadgeClasses = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-amber-100 text-amber-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>High Risk Suppliers</CardTitle>
          <div className="tooltip">
            <Info className="h-5 w-5 text-gray-400" />
            <span className="tooltip-text">Suppliers with highest risk factors requiring immediate attention</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
            ))}
            <div className="mt-5 pt-3 border-t border-gray-200">
              <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {data.map((supplier) => (
                <li key={supplier.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Avatar className="bg-red-100">
                        <span className="font-medium text-red-800">{getInitials(supplier.name)}</span>
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {supplier.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {supplier.issues}
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className={cn("rounded-full", getRiskBadgeClasses(supplier.riskLevel))}>
                        {supplier.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-3 border-t border-gray-200">
              <Button variant="outline" className="w-full">
                View All Risk Alerts
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HighRiskSuppliers;
