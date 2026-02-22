import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, TooltipProps } from "recharts";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportChartAsPNG, exportChartAsSVG } from "../utils/exportUtils";

interface PumpFlowDataPoint {
  timestamp: string;
  label: string;
  pump1?: number;
  pump2?: number;
  pump3?: number;
  pump4?: number;
  pump5?: number;
  pump6?: number;
}

interface PumpFlowChartProps {
  data: PumpFlowDataPoint[];
  activePumps: number[];
}

const PUMP_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
];

// Custom Tooltip for Pump Flow Chart
interface CustomTooltipProps extends TooltipProps<number, string> {
  t: (key: string) => string;
}

const PumpFlowTooltip = ({ active, payload, label, t }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => {
          const pumpNumber = entry.dataKey?.toString().replace('pump', '');
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {t("readings.pumpNumber")} {pumpNumber}: {entry.value?.toFixed(2)} m³/s
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function PumpFlowChart({ data, activePumps }: PumpFlowChartProps) {
  const { t } = useTranslation();
  
  console.log('PumpFlowChart - Rendering with:', {
    dataLength: data.length,
    activePumps,
    data
  });
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("ups.charts.individualPumpFlow")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full flex items-center justify-center text-gray-500">
            {t("ups.noPumpFlowData")}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!activePumps || activePumps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("ups.charts.individualPumpFlow")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full flex items-center justify-center text-gray-500">
            {t("ups.noActivePumps")}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate Y-axis domain from all pump flow values
  const allFlowValues: number[] = [];
  data.forEach(point => {
    if (point.pump1) allFlowValues.push(point.pump1);
    if (point.pump2) allFlowValues.push(point.pump2);
    if (point.pump3) allFlowValues.push(point.pump3);
    if (point.pump4) allFlowValues.push(point.pump4);
    if (point.pump5) allFlowValues.push(point.pump5);
    if (point.pump6) allFlowValues.push(point.pump6);
  });
  
  const minFlow = Math.min(...allFlowValues);
  const maxFlow = Math.max(...allFlowValues);
  const yDomain = [Math.floor(minFlow * 0.9), Math.ceil(maxFlow * 1.1)];
  
  console.log('PumpFlowChart - Y-axis domain:', { minFlow, maxFlow, yDomain, allFlowValues });
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("ups.charts.individualPumpFlow")}</CardTitle>
          <ExportDropdown
            onExportPNG={() => exportChartAsPNG('pump-flow-chart', 'pump-flow-chart')}
            onExportSVG={() => exportChartAsSVG('pump-flow-chart', 'pump-flow-chart')}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div id="pump-flow-chart">
        <div className="text-sm text-gray-600 mb-2">
          {t("ups.dataPoints")}: {data.length} | {t("ups.activePumps")}: {activePumps.join(', ')}
        </div>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis                dataKey="label" 
                  tick={{ fontSize: 8, direction: 'ltr' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tickMargin={0} />
              <YAxis 
                 tick={{ fontSize: 8, direction: 'ltr' }} 
                  width={60}
                  tickMargin={10}
                label={{ value: 'm³/s', angle: -90, position: 'insideLeft' }}
                domain={yDomain}
              />
              <Tooltip content={<PumpFlowTooltip t={t} />} />
              <Legend />
              {activePumps.includes(1) && (
                <Line
                  type="monotone"
                  dataKey="pump1"
                  name={`${t("readings.pumpNumber")} 1`}
                  stroke={PUMP_COLORS[0]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activePumps.includes(2) && (
                <Line
                  type="monotone"
                  dataKey="pump2"
                  name={`${t("readings.pumpNumber")} 2`}
                  stroke={PUMP_COLORS[1]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activePumps.includes(3) && (
                <Line
                  type="monotone"
                  dataKey="pump3"
                  name={`${t("readings.pumpNumber")} 3`}
                  stroke={PUMP_COLORS[2]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activePumps.includes(4) && (
                <Line
                  type="monotone"
                  dataKey="pump4"
                  name={`${t("readings.pumpNumber")} 4`}
                  stroke={PUMP_COLORS[3]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activePumps.includes(5) && (
                <Line
                  type="monotone"
                  dataKey="pump5"
                  name={`${t("readings.pumpNumber")} 5`}
                  stroke={PUMP_COLORS[4]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activePumps.includes(6) && (
                <Line
                  type="monotone"
                  dataKey="pump6"
                  name={`${t("readings.pumpNumber")} 6`}
                  stroke={PUMP_COLORS[5]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
