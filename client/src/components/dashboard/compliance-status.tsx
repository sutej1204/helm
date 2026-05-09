import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ComplianceItem {
  compliant: number;
  total: number;
  rate: number;
}

interface ComplianceStatusProps {
  data: {
    regulatory: ComplianceItem;
    ethical: ComplianceItem;
    environmental: ComplianceItem;
  };
  isLoading?: boolean;
}

function ComplianceStatusItem({
  title,
  data,
  icon,
  iconColor,
  iconBgColor,
  badgeColor,
}: {
  title: string;
  data: ComplianceItem;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  badgeColor: string;
}) {
  const percentage = Math.round(data.rate * 100);

  return (
    <div className="flex items-center">
      <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full", iconBgColor)}>
        {icon}
      </div>
      <div className="ml-4">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">
          {data.compliant} out of {data.total} suppliers compliant
        </p>
      </div>
      <div className="ml-auto">
        <Badge variant="outline" className={cn("rounded-full text-xs", badgeColor)}>
          {percentage}%
        </Badge>
      </div>
    </div>
  );
}

export function ComplianceStatus({ data, isLoading = false }: ComplianceStatusProps) {
  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Compliance Status</CardTitle>
          <div className="tooltip">
            <Info className="h-5 w-5 text-gray-400" />
            <span className="tooltip-text">Current compliance status and issues requiring attention</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {isLoading ? (
          <>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="mt-5 pt-5 border-t border-gray-200">
              <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </>
        ) : (
          <>
            <ComplianceStatusItem
              title="Regulatory Compliance"
              data={data.regulatory}
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              badgeColor="bg-green-100 text-green-800"
            />
            <ComplianceStatusItem
              title="Ethical Standards"
              data={data.ethical}
              icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-100"
              badgeColor="bg-amber-100 text-amber-800"
            />
            <ComplianceStatusItem
              title="Environmental Compliance"
              data={data.environmental}
              icon={<X className="h-6 w-6 text-red-600" />}
              iconColor="text-red-600"
              iconBgColor="bg-red-100"
              badgeColor="bg-red-100 text-red-800"
            />
            <div className="mt-5 pt-5 border-t border-gray-200">
              <Button variant="outline" className="w-full">
                View Compliance Details
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ComplianceStatus;
