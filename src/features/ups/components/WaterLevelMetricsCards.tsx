import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../../../components/ui/card";
import { TrendingUp, TrendingDown, Activity, Waves, Droplets } from "lucide-react";
import type { WaterLevelMetricsDto } from "../api/upsApi";

interface WaterLevelMetricsCardsProps {
  metrics: WaterLevelMetricsDto;
}

export function WaterLevelMetricsCards({ metrics }: WaterLevelMetricsCardsProps) {
  const { t } = useTranslation();
  
  const items = [
    { 
      label: t("ups.metrics.maxFlow"), 
      value: `${metrics.maxFlow.toFixed(2)} m³/h`, 
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      label: t("ups.metrics.minFlow"), 
      value: `${metrics.minFlow.toFixed(2)} m³/h`, 
      icon: TrendingDown,
      color: "text-blue-600", 
      bgColor: "bg-blue-50"
    },
    { 
      label: t("ups.metrics.avgFlow"), 
      value: `${metrics.avgFlow.toFixed(2)} m³/h`, 
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      label: t("ups.metrics.maxUSWL"), 
      value: `${metrics.maxUSWL.toFixed(2)} m`, 
      icon: Waves,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    { 
      label: t("ups.metrics.maxDSWL"), 
      value: `${metrics.maxDSWL.toFixed(2)} m`, 
      icon: Droplets,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className={`${item.bgColor} border-gray-200`}>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-lg ${item.bgColor} mb-2`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">{item.label}</p>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
