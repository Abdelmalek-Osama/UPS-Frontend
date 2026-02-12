import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportTableToCSV, exportTableToExcel } from "../utils/exportUtils";

interface PumpFlow {
  pumpNumber: number;
  flowRate: number;
  percentage: number;
}

interface PumpFlowTableProps {
  data: PumpFlow[];
  totalFlow: number;
}

export function PumpFlowTable({ data, totalFlow }: PumpFlowTableProps) {
  const { t } = useTranslation();
  
  const handleExportCSV = () => {
    const columns = [
      { key: 'pumpNumber', header: t("ups.fields.pumpNumber") },
      { key: 'flowRate', header: t("ups.fields.flowRateValue") },
      { key: 'percentage', header: t("ups.fields.percentage") },
    ];

    const exportData = [
      ...data.map(pump => ({
        pumpNumber: `${t("ups.fields.pumpNumber")} ${pump.pumpNumber}`,
        flowRate: pump.flowRate.toFixed(2),
        percentage: `${pump.percentage.toFixed(1)}%`,
      })),
      {
        pumpNumber: t("ups.fields.totalFlow"),
        flowRate: totalFlow.toFixed(2),
        percentage: '100%',
      }
    ];

    exportTableToCSV(exportData, columns, 'pump-flows');
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'pumpNumber', header: t("ups.fields.pumpNumber") },
      { key: 'flowRate', header: t("ups.fields.flowRateValue") },
      { key: 'percentage', header: t("ups.fields.percentage") },
    ];

    const exportData = [
      ...data.map(pump => ({
        pumpNumber: `${t("ups.fields.pumpNumber")} ${pump.pumpNumber}`,
        flowRate: pump.flowRate.toFixed(2),
        percentage: `${pump.percentage.toFixed(1)}%`,
      })),
      {
        pumpNumber: t("ups.fields.totalFlow"),
        flowRate: totalFlow.toFixed(2),
        percentage: '100%',
      }
    ];

    exportTableToExcel(exportData, columns, 'pump-flows');
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("ups.charts.individualPumpFlows")}</CardTitle>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            disabled={data.length === 0}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-gray-600">{t("ups.fields.pumpNumber")}</th>
                <th className="text-left py-2 px-4 text-gray-600">{t("ups.fields.flowRateValue")}</th>
                <th className="text-left py-2 px-4 text-gray-600">{t("ups.fields.percentage")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((pump) => (
                <tr key={pump.pumpNumber} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-gray-900">{t("ups.fields.pumpNumber")} {pump.pumpNumber}</td>
                  <td className="py-2 px-4 text-gray-900">{pump.flowRate.toFixed(2)}</td>
                  <td className="py-2 px-4 text-gray-900">{pump.percentage.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="border-t-2 font-semibold bg-gray-50">
                <td className="py-2 px-4 text-gray-900">{t("ups.fields.totalFlow")}</td>
                <td className="py-2 px-4 text-gray-900">{totalFlow.toFixed(2)}</td>
                <td className="py-2 px-4 text-gray-900">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
