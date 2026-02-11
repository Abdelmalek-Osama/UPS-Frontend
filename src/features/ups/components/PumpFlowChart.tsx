import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

export function PumpFlowChart({ data, activePumps }: PumpFlowChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Pump Flow Rates Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'm³/s', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {activePumps.includes(1) && (
                <Line
                  type="monotone"
                  dataKey="pump1"
                  name="Pump 1"
                  stroke={PUMP_COLORS[0]}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activePumps.includes(2) && (
                <Line
                  type="monotone"
                  dataKey="pump2"
                  name="Pump 2"
                  stroke={PUMP_COLORS[1]}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activePumps.includes(3) && (
                <Line
                  type="monotone"
                  dataKey="pump3"
                  name="Pump 3"
                  stroke={PUMP_COLORS[2]}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activePumps.includes(4) && (
                <Line
                  type="monotone"
                  dataKey="pump4"
                  name="Pump 4"
                  stroke={PUMP_COLORS[3]}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activePumps.includes(5) && (
                <Line
                  type="monotone"
                  dataKey="pump5"
                  name="Pump 5"
                  stroke={PUMP_COLORS[4]}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activePumps.includes(6) && (
                <Line
                  type="monotone"
                  dataKey="pump6"
                  name="Pump 6"
                  stroke={PUMP_COLORS[5]}
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
