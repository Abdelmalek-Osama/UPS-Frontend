import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ups.charts.individualPumpFlows")}</CardTitle>
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
