import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface FlowChartDataPoint {
  id: string;
  name: string;
  calculatedFlow: number;
}

interface DirectorateFlowChartProps {
  branchName: string;
  data: FlowChartDataPoint[];
}

export function DirectorateFlowChart({ branchName, data }: DirectorateFlowChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculated Flow ({branchName})</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis label={{ value: 'Flow Rate (m³/s)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="calculatedFlow" 
                stroke="#06b6d4" 
                strokeWidth={2}
                name="Calculated Flow"
                dot={{ fill: "#06b6d4", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
