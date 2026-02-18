import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const isRTL = t('_rtl') === 'rtl';
  
  // For RTL, reverse the data array so sites appear right-to-left
  const chartData = isRTL ? [...data].reverse() : data;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className={isRTL ? 'text-right' : 'text-left'}>{t("ups.directorate.uswlVsDswl", { branch: branchName })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                label={{ 
                  value: t("ups.directorate.waterLevel"), 
                  angle: -90, 
                  position: isRTL ? 'insideRight' : 'insideLeft'
                }} 
                orientation={isRTL ? 'right' : 'left'}
                domain={[0, 'auto']}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="uswl" fill="#3b82f6" name={t("ups.directorate.uswl")} />
              <Bar dataKey="dswl" fill="#ef4444" name={t("ups.directorate.dswl")} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
