import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";

interface RiskBreakdownChartProps {
  data: {
    labels: string[];
    data: number[];
  };
  isLoading?: boolean;
}

export function RiskBreakdownChart({ data, isLoading = false }: RiskBreakdownChartProps) {
  const chartData = data.labels.map((category, index) => ({
    category,
    value: data.data[index],
  }));

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Risk Category Distribution</CardTitle>
          <div className="tooltip">
            <Info className="h-5 w-5 text-gray-400" />
            <span className="tooltip-text">Breakdown of risk types across your supplier network</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="h-[250px] w-full bg-gray-100 animate-pulse rounded"></div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Risk Score"
                  dataKey="value"
                  stroke="#0f766e"
                  fill="#0f766e"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RiskBreakdownChart;
