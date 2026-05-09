import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiInsight {
  id: number;
  category: "trend" | "opportunity" | "risk";
  title: string;
  description: string;
  actionLink: string;
}

interface AiInsightsProps {
  data: AiInsight[];
  isLoading?: boolean;
}

export function AiInsights({ data, isLoading = false }: AiInsightsProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trend':
        return <TrendingUp className="h-6 w-6 text-blue-600" />;
      case 'opportunity':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'risk':
        return <Clock className="h-6 w-6 text-amber-600" />;
      default:
        return <Info className="h-6 w-6 text-gray-600" />;
    }
  };

  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'trend':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          title: 'text-blue-800',
          text: 'text-blue-600',
          link: 'text-blue-700 hover:text-blue-600'
        };
      case 'opportunity':
        return {
          bg: 'bg-green-50',
          border: 'border-green-100',
          title: 'text-green-800',
          text: 'text-green-600',
          link: 'text-green-700 hover:text-green-600'
        };
      case 'risk':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          title: 'text-amber-800',
          text: 'text-amber-600',
          link: 'text-amber-700 hover:text-amber-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-100',
          title: 'text-gray-800',
          text: 'text-gray-600',
          link: 'text-gray-700 hover:text-gray-600'
        };
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Daily AI Powered Insights</CardTitle>
          <div className="tooltip">
            <Info className="h-5 w-5 text-gray-400" />
            <span className="tooltip-text">Intelligent predictions and recommendations to optimize your supply chain</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((insight) => {
              const classes = getCategoryClasses(insight.category);
              
              return (
                <div key={insight.id} className={cn("rounded-lg p-4 border", classes.bg, classes.border)}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="ml-3">
                      <h4 className={cn("text-sm font-semibold", classes.title)}>{insight.title}</h4>
                      <p className={cn("mt-1 text-sm", classes.text)}>{insight.description}</p>
                      <div className="mt-3 flex">
                        <a href={insight.actionLink} className={cn("text-sm font-medium", classes.link)}>
                          {insight.category === 'trend' ? 'View impact analysis' : 
                           insight.category === 'opportunity' ? 'Review recommendation' : 
                           'See mitigation plan'} <span aria-hidden="true">&rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AiInsights;
