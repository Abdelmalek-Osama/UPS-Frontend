import { Card, CardContent } from "../../../components/ui/card";
import { Activity, BatteryCharging, Droplets, Waves } from "lucide-react";
import type { SiteSummary } from "../types";

interface SiteMetricsCardsProps {
  site: SiteSummary;
}

export function SiteMetricsCards({ site }: SiteMetricsCardsProps) {
  const items = [
    { 
      label: "Upstream Level", 
      value: `${site.upstream.toFixed(2)} m`, 
      icon: Waves,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Downstream Level", 
      value: `${site.downstream.toFixed(2)} m`, 
      icon: Droplets,
      color: "text-blue-600", 
      bgColor: "bg-blue-50"
    },
    { 
      label: "Flow Rate", 
      value: `${site.flowRate.toFixed(0)} m³/s`, 
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      label: "Battery Voltage", 
      value: `${site.batteryVoltage.toFixed(1)} V`, 
      icon: BatteryCharging,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className={`${item.bgColor} border-gray-200`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
