import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useTranslation } from "react-i18next";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportChartAsPNG, exportChartAsSVG } from "../utils/exportUtils";

const PUMP_COLORS = [
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
];

interface PumpSite {
  siteId: string;
  siteName: string;
  siteArabicName?: string;
  siteConfiguration?: { numPumps?: number };
  pumpData?: { operatingTimes?: (number | null)[] };
}

interface PumpOperatingTimesChartProps {
  sites: PumpSite[];
}

export function PumpOperatingTimesChart({ sites }: PumpOperatingTimesChartProps) {
  const { t } = useTranslation();
  const isRTL = t("_rtl") === "rtl";

  // Find the maximum number of pumps across all sites
  const maxPumps = sites.reduce(
    (max, site) => Math.max(max, site.siteConfiguration?.numPumps ?? 0),
    0
  );
  const pumpCount = Math.min(maxPumps, 6);

  const chartData = sites.map((site) => {
    const times = site.pumpData?.operatingTimes ?? [];
    const numPumps = site.siteConfiguration?.numPumps ?? 0;
    const name = isRTL ? (site.siteArabicName || site.siteName) : site.siteName;
    const entry: Record<string, string | number | null> = { name };
    for (let i = 1; i <= pumpCount; i++) {
      entry[`pump${i}`] = i <= numPumps ? (times[i - 1] ?? null) : null;
    }
    return entry;
  });

  const displayData = isRTL ? [...chartData].reverse() : chartData;

  if (pumpCount === 0 || sites.length === 0) return null;

  const chartId = "pump-operating-times-chart";

  const title = t("ups.directorate.pumpTimesChart") || "Pump Operating Times (Hours)";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={isRTL ? "text-right" : "text-left"}>
            {title}
          </CardTitle>
          <ExportDropdown
            onExportPNG={() => exportChartAsPNG(chartId, "pump-operating-times", title)}
            onExportSVG={() => exportChartAsSVG(chartId, "pump-operating-times", title)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div id={chartId} style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 16, right: 24, left: 16, bottom: 64 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-40}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
                reversed={isRTL}
              />
              <YAxis
                orientation={isRTL ? "right" : "left"}
                label={{
                  value: t("common.hours") || "hrs",
                  angle: -90,
                  position: isRTL ? "insideRight" : "insideLeft",
                  offset: isRTL ? 12 : -4,
                }}
                tick={{ fontSize: 11 }}
                domain={[0, "auto"]}
              />
              <Tooltip
                formatter={(value, name: string) => [
                  value != null ? `${Number(value).toFixed(0)} ${t("common.hours") || "hrs"}` : "—",
                  name,
                ]}
              />
              <Legend verticalAlign="top" />
              {Array.from({ length: pumpCount }, (_, i) => (
                <Bar
                  key={`pump${i + 1}`}
                  dataKey={`pump${i + 1}`}
                  name={`${t("ups.directorate.pump") || "Pump"} ${i + 1}`}
                  fill={PUMP_COLORS[i]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
