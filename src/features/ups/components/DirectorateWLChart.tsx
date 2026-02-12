import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface ChartDataPoint {
  id: string;
  name: string;
  uswl: number;
  dswl: number;
}

interface DirectorateWLChartProps {
  branchName: string;
  data: ChartDataPoint[];
}

export function DirectorateWLChart({ branchName, data }: DirectorateWLChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>USWL vs DSWL Comparison ({branchName})</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="uswl" fill="#3b82f6" name="USWL" />
              <Bar dataKey="dswl" fill="#ef4444" name="DSWL" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
