import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  changeValue?: string;
  changeDirection?: "up" | "down";
  isLoading?: boolean;
}

export function SummaryCard({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  changeValue,
  changeDirection = "up",
  isLoading = false,
}: SummaryCardProps) {
  return (
    <Card className="overflow-hidden shadow h-full">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={cn("flex-shrink-0 rounded-md p-2", iconBgColor)}>
              <div className={cn("h-4 w-4", iconColor)}>{icon}</div>
            </div>
            <div className="ml-3">
              <h3 className="text-xs font-medium text-gray-500 truncate">
                {title}
              </h3>
            </div>
          </div>
          {changeValue && (
            <div
              className={cn(
                "text-xs font-semibold flex items-center",
                changeDirection === "up"
                  ? "text-green-600"
                  : "text-red-600"
              )}
            >
              {changeDirection === "up" ? (
                <ArrowUpIcon className="mr-1 flex-shrink-0 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownIcon className="mr-1 flex-shrink-0 h-3 w-3 text-red-500" />
              )}
              {changeValue}
            </div>
          )}
        </div>
        <div className="mt-1 flex justify-between items-baseline">
          {isLoading ? (
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <div className="text-lg font-semibold text-gray-900">
              {value}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default SummaryCard;
