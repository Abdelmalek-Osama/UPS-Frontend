import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PumpFlowTimeSeriesPoint } from "../types";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportChartAsPNG, exportChartAsSVG } from "../utils/exportUtils";

interface PumpOperatingHoursChartProps {
  data: PumpFlowTimeSeriesPoint[];
  numPumps: number;
}

// Colors for each pump line
const PUMP_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
];

export function PumpOperatingHoursChart({ data, numPumps }: PumpOperatingHoursChartProps) {
  const { t } = useTranslation();
  
  // Helper function to format date without timezone shifts
  const formatDateTimeLabel = (timestamp: string): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };
  
  // Transform data to include pump operating hours
  const chartData = data.map((point) => {
    const dataPoint: any = {
      timestamp: formatDateTimeLabel(point.timestamp),
      fullTimestamp: point.timestamp,
    };

    // Add each pump's operating hours
    for (let i = 1; i <= numPumps; i++) {
      const pumpKey = `p${i}Time` as keyof PumpFlowTimeSeriesPoint;
      dataPoint[`pump${i}`] = point[pumpKey] || 0;
    }

    return dataPoint;
  });

  // Calculate Y-axis domain with padding
  const allHours: number[] = [];
  chartData.forEach(point => {
    for (let i = 1; i <= numPumps; i++) {
      allHours.push(point[`pump${i}`] || 0);
    }
  });

  const minHours = Math.min(...allHours);
  const maxHours = Math.max(...allHours);
  const yDomain = [Math.floor(minHours * 0.9), Math.ceil(maxHours * 1.1)];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {new Date(payload[0].payload.fullTimestamp).toLocaleString()}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} {t("common.hour")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const title = t("ups.charts.pumpOperatingHours");

  const handleExportPNG = () => {
    exportChartAsPNG('pump-operating-hours-chart', 'pump-operating-hours', title);
  };

  const handleExportSVG = () => {
    exportChartAsSVG('pump-operating-hours-chart', 'pump-operating-hours', title);
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("ups.charts.pumpOperatingHours")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            {t("ups.noActivePumps")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("ups.charts.pumpOperatingHours")}</CardTitle>
          <ExportDropdown
            onExportPNG={handleExportPNG}
            onExportSVG={handleExportSVG}
            disabled={chartData.length === 0}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div id="pump-operating-hours-chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timestamp"
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 8, direction: 'ltr' }}
                tickMargin={0}
              />
              <YAxis
                 tick={{ fontSize: 8, direction: 'ltr' }}
                        domain={yDomain}
                        width={60}
                        tickMargin={10}
                label={{
                  value: t("ups.fields.operatingHours"),
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
            
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => value}
              />
              {Array.from({ length: numPumps }, (_, i) => i + 1).map((pumpNum, index) => (
                <Line
                  key={pumpNum}
                  type="monotone"
                  dataKey={`pump${pumpNum}`}
                  name={`${t("readings.pumpNumber")} ${pumpNum}`}
                  stroke={PUMP_COLORS[index % PUMP_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
