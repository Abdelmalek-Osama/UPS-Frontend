import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../../../components/ui/card";
import { Activity, Droplets, Waves } from "lucide-react";
import type { SiteSummary } from "../types";

interface SiteMetricsCardsProps {
  site: SiteSummary;
}

export function SiteMetricsCards({ site }: SiteMetricsCardsProps) {
  const { t } = useTranslation();
  
  const items = [
    { 
      label: t("ups.fields.upstream"), 
      value: `${site.upstream.toFixed(2)} m`, 
      icon: Waves,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: t("ups.fields.downstream"), 
      value: `${site.downstream.toFixed(2)} m`, 
      icon: Droplets,
      color: "text-blue-600", 
      bgColor: "bg-blue-50"
    },
    { 
      label: t("ups.fields.flowRate"), 
      value: `${site.flowRate.toFixed(0)} m³/s`, 
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
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
