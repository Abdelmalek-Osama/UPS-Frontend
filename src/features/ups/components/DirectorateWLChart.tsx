import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useTranslation } from "react-i18next";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportChartAsPNG, exportChartAsSVG } from "../utils/exportUtils";

interface ChartDataPoint {
  id: string;
  name: string;
  uswl: number | null;
  dswl: number | null;
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
  
  // Create sanitized filename for exports
  const sanitizedBranchName = branchName.replace(/[/\\?%*:|"<>]/g, '-');
  const chartId = `wl-chart-${sanitizedBranchName}`;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>{t("ups.directorate.uswlVsDswl", { branch: branchName })}</CardTitle>
          <ExportDropdown
            onExportPNG={() => exportChartAsPNG(chartId, `${sanitizedBranchName}-water-levels`)}
            onExportSVG={() => exportChartAsSVG(chartId, `${sanitizedBranchName}-water-levels`)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div id={chartId} style={{ width: '100%', height: 350 }}>
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
