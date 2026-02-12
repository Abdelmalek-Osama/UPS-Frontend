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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Pump Flows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-gray-600">Pump #</th>
                <th className="text-left py-2 px-4 text-gray-600">Flow Rate (m³/s)</th>
                <th className="text-left py-2 px-4 text-gray-600">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((pump) => (
                <tr key={pump.pumpNumber} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-gray-900">Pump {pump.pumpNumber}</td>
                  <td className="py-2 px-4 text-gray-900">{pump.flowRate.toFixed(2)}</td>
                  <td className="py-2 px-4 text-gray-900">{pump.percentage.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="border-t-2 font-semibold bg-gray-50">
                <td className="py-2 px-4 text-gray-900">Total Flow</td>
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
