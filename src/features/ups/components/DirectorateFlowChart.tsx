import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useTranslation } from "react-i18next";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportChartAsPNG, exportChartAsSVG } from "../utils/exportUtils";

interface FlowChartDataPoint {
  id: string;
  name: string;
  calculatedFlow: number | null;
}

interface DirectorateFlowChartProps {
  branchName: string;
  data: FlowChartDataPoint[];
}

export function DirectorateFlowChart({ branchName, data }: DirectorateFlowChartProps) {
  const { t } = useTranslation();
  const isRTL = t('_rtl') === 'rtl';
  
  // For RTL, reverse the data array so sites appear right-to-left
  const chartData = isRTL ? [...data].reverse() : data;
  
  // Create sanitized filename for exports
  const sanitizedBranchName = branchName.replace(/[/\\?%*:|"<>]/g, '-');
  const chartId = `flow-chart-${sanitizedBranchName}`;
  
  const title = t("ups.directorate.calculatedFlow", { branch: branchName });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          {isRTL ? (
            <>
              <ExportDropdown
                onExportPNG={() => exportChartAsPNG(chartId, `${sanitizedBranchName}-flow-rates`, title)}
                onExportSVG={() => exportChartAsSVG(chartId, `${sanitizedBranchName}-flow-rates`, title)}
              />
              <CardTitle className='text-right'>{title}</CardTitle>
            </>
          ) : (
            <>
              <CardTitle className='text-left'>{title}</CardTitle>
              <ExportDropdown
                onExportPNG={() => exportChartAsPNG(chartId, `${sanitizedBranchName}-flow-rates`, title)}
                onExportSVG={() => exportChartAsSVG(chartId, `${sanitizedBranchName}-flow-rates`, title)}
              />
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div id={chartId} style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: isRTL ? 90 : 30, left: isRTL ? 30 : 90, bottom: 60 }}>
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
                  value: t("ups.directorate.flowRate"), 
                  angle: -90,
                  position: 'center',
                  dx: isRTL ? 60 : -60
                }} 
                orientation={isRTL ? 'right' : 'left'}
                domain={[0, 'auto']}
              />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="calculatedFlow" 
                fill="#06b6d4" 
                name={t("ups.directorate.calculatedFlow", { branch: "" }).replace(" ()", "")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
