import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";

interface RiskChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  isLoading?: boolean;
}

export function RiskChart({ data, isLoading = false }: RiskChartProps) {
  const chartData = data.labels.map((month, index) => {
    const monthData: any = { month };
    
    data.datasets.forEach(dataset => {
      monthData[dataset.label] = dataset.data[index];
    });
    
    return monthData;
  });
  
  const colors = ["#dc2626", "#d97706", "#0369a1"];
  
  return (
    <Card className="col-span-2">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Supply Chain Risk Overview</CardTitle>
            <CardDescription>Past 30 days compared to previous period</CardDescription>
          </div>
          <div className="tooltip">
            <Info className="h-5 w-5 text-gray-400" />
            <span className="tooltip-text">AI-powered overview of supply chain risks based on real-time data and predictive analytics</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="h-[250px] w-full bg-gray-100 animate-pulse rounded"></div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    color: '#f9fafb',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#f3f4f6', fontWeight: 'bold', marginBottom: '5px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#1f2937', fontSize: '12px' }}>{value}</span>} 
                />
                {data.datasets.map((dataset, index) => (
                  <Line
                    key={dataset.label}
                    type="monotone"
                    dataKey={dataset.label}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RiskChart;
