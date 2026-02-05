import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { SiteSummary } from "../types";
import { SitesTable } from "./SitesTable";

interface BranchSectionProps {
  title: string;
  sites: SiteSummary[];
}

export function BranchSection({ title, sites }: BranchSectionProps) {
  const { t } = useTranslation();
  const sortedSites = [...sites].sort((a, b) => a.positionOrder - b.positionOrder);

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">{title}</div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t("ups.tables.siteOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SitesTable sites={sortedSites} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("ups.charts.upstreamDownstream")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[260px]"
              config={{
                upstream: { label: t("ups.fields.upstream"), color: "#2563eb" },
                downstream: { label: t("ups.fields.downstream"), color: "#ef4444" },
              }}
            >
              <BarChart data={sortedSites} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="upstream" fill="var(--color-upstream)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downstream" fill="var(--color-downstream)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
