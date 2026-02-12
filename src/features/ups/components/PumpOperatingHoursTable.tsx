import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface PumpOperatingHours {
  pumpNumber: number;
  operatingHours: number;
  status: "running" | "stopped" | "maintenance";
}

interface PumpOperatingHoursTableProps {
  data: PumpOperatingHours[];
}

export function PumpOperatingHoursTable({ data }: PumpOperatingHoursTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pump Operating Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-gray-600">Pump #</th>
                <th className="text-left py-2 px-4 text-gray-600">Operating Hours</th>
                <th className="text-left py-2 px-4 text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((pump) => (
                <tr key={pump.pumpNumber} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-gray-900">Pump {pump.pumpNumber}</td>
                  <td className="py-2 px-4 text-gray-900">{pump.operatingHours.toFixed(1)} hrs</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        pump.status === "running"
                          ? "bg-green-100 text-green-800"
                          : pump.status === "stopped"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {pump.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
