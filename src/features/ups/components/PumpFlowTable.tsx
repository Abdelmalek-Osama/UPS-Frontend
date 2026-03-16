import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportTableToCSV, exportTableToExcel } from "../utils/exportUtils";

interface PumpFlow {
  pumpNumber: number;
  flowRate: number;
  percentage: number;
}

interface PumpFlowTimeSeries {
  timestamp: string;
  totalFlow: number;
  pumps: PumpFlow[];
}

interface PumpFlowTableProps {
  data: PumpFlow[] | PumpFlowTimeSeries[];
  totalFlow?: number;
  siteName?: string;
}

export function PumpFlowTable({ data, totalFlow, siteName }: PumpFlowTableProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // Check if data is time-series format
  const isTimeSeries = data.length > 0 && 'timestamp' in data[0];
  
  // Sanitize site name for filename
  const sanitizedSiteName = siteName ? siteName.replace(/[/\\?%*:|"<>]/g, '-') : 'site';
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    return `${hoursStr}:${minutes} ${ampm}`;
  };
  
  const handleExportCSV = () => {
    if (isTimeSeries) {
      const timeSeriesData = data as PumpFlowTimeSeries[];
      const columns = [
        { key: 'date', header: t("common.date") },
        { key: 'time', header: t("common.hour") },
        { key: 'totalFlow', header: t("ups.fields.totalFlow") },
        ...Array.from({ length: 6 }, (_, i) => ({
          key: `pump${i + 1}`,
          header: `${t("ups.fields.pumpNumber")} ${i + 1}`,
        })),
      ];

      const exportData = timeSeriesData.map(entry => {
        const row: Record<string, string> = {
          date: formatDate(entry.timestamp),
          time: formatTime(entry.timestamp),
          totalFlow: entry.totalFlow.toFixed(2),
        };
        entry.pumps.forEach(pump => {
          row[`pump${pump.pumpNumber}`] = `${pump.flowRate.toFixed(2)} (${pump.percentage.toFixed(1)}%)`;
        });
        return row;
      });

      const title = siteName ? `${siteName} Pump Flows (Time Series)` : t("ups.charts.individualPumpFlows");
      exportTableToCSV(exportData, columns, `${sanitizedSiteName}-pump-flows-timeseries`, title);
    } else {
      const aggregatedData = data as PumpFlow[];
      const columns = [
        { key: 'pumpNumber', header: t("ups.fields.pumpNumber") },
        { key: 'flowRate', header: t("ups.fields.flowRateValue") },
        { key: 'percentage', header: t("ups.fields.percentage") },
      ];

      const exportData = [
        ...aggregatedData.map(pump => ({
          pumpNumber: `${t("ups.fields.pumpNumber")} ${pump.pumpNumber}`,
          flowRate: pump.flowRate.toFixed(2),
          percentage: `${pump.percentage.toFixed(1)}%`,
        })),
        {
          pumpNumber: t("ups.fields.totalFlow"),
          flowRate: totalFlow?.toFixed(2) || '0.00',
          percentage: '100%',
        }
      ];

      const title = siteName ? `${siteName} Pump Flows` : t("ups.charts.individualPumpFlows");
      exportTableToCSV(exportData, columns, `${sanitizedSiteName}-pump-flows`, title);
    }
  };

  const handleExportExcel = () => {
    if (isTimeSeries) {
      const timeSeriesData = data as PumpFlowTimeSeries[];
      const columns = [
        { key: 'date', header: t("common.date") },
        { key: 'time', header: t("common.hour") },
        { key: 'totalFlow', header: t("ups.fields.totalFlow") },
        ...Array.from({ length: 6 }, (_, i) => ({
          key: `pump${i + 1}`,
          header: `${t("ups.fields.pumpNumber")} ${i + 1}`,
        })),
      ];

      const exportData = timeSeriesData.map(entry => {
        const row: Record<string, string> = {
          date: formatDate(entry.timestamp),
          time: formatTime(entry.timestamp),
          totalFlow: entry.totalFlow.toFixed(2),
        };
        entry.pumps.forEach(pump => {
          row[`pump${pump.pumpNumber}`] = `${pump.flowRate.toFixed(2)} (${pump.percentage.toFixed(1)}%)`;
        });
        return row;
      });

      const title = siteName ? `${siteName} Pump Flows (Time Series)` : t("ups.charts.individualPumpFlows");
      exportTableToExcel(exportData, columns, `${sanitizedSiteName}-pump-flows-timeseries`, title);
    } else {
      const aggregatedData = data as PumpFlow[];
      const columns = [
        { key: 'pumpNumber', header: t("ups.fields.pumpNumber") },
        { key: 'flowRate', header: t("ups.fields.flowRateValue") },
        { key: 'percentage', header: t("ups.fields.percentage") },
      ];

      const exportData = [
        ...aggregatedData.map(pump => ({
          pumpNumber: `${t("ups.fields.pumpNumber")} ${pump.pumpNumber}`,
          flowRate: pump.flowRate.toFixed(2),
          percentage: `${pump.percentage.toFixed(1)}%`,
        })),
        {
          pumpNumber: t("ups.fields.totalFlow"),
          flowRate: totalFlow?.toFixed(2) || '0.00',
          percentage: '100%',
        }
      ];

      const title = siteName ? `${siteName} Pump Flows` : t("ups.charts.individualPumpFlows");
      exportTableToExcel(exportData, columns, `${sanitizedSiteName}-pump-flows`, title);
    }
  };
  
  if (isTimeSeries) {
    const timeSeriesData = data as PumpFlowTimeSeries[];
    
    // Calculate pagination
    const totalPages = Math.ceil(timeSeriesData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = timeSeriesData.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
                  <th className="text-center py-2 px-4 text-gray-600">{t("common.date")}</th>
                  <th className="text-center py-2 px-4 text-gray-600">{t("common.hour")}</th>
                  <th className="text-center py-2 px-4 text-gray-600">{t("ups.fields.totalFlow")}</th>
                  {Array.from({ length: 6 }, (_, i) => (
                    <th key={i + 1} className="text-center py-2 px-4 text-gray-600">
                      {t("ups.fields.pumpNumber")} {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      {t("common.noData")}
                    </td>
                  </tr>
                ) : (
                  currentData.map((entry, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 text-gray-900 text-center">{formatDate(entry.timestamp)}</td>
                      <td className="py-2 px-4 text-gray-900 text-center">{formatTime(entry.timestamp)}</td>
                      <td className="py-2 px-4 text-gray-900 text-center">{entry.totalFlow.toFixed(2)}</td>
                      {Array.from({ length: 6 }, (_, i) => {
                        const pump = entry.pumps.find(p => p.pumpNumber === i + 1);
                        return (
                          <td key={i + 1} className="py-2 px-4 text-gray-900 text-center">
                            {pump ? `${pump.flowRate.toFixed(2)} (${pump.percentage.toFixed(1)}%)` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {timeSeriesData.length > rowsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                {t("common.showing")} {startIndex + 1} {t("common.to")} {Math.min(endIndex, timeSeriesData.length)} {t("common.of")} {timeSeriesData.length} {t("common.entries")}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("common.previous")}
                </Button>
                <div className="text-sm text-gray-600">
                  {t("common.page")} {currentPage} {t("common.of")} {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  {t("common.next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Aggregated view (fallback)
  const aggregatedData = data as PumpFlow[];
  
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
                <th className="text-center py-2 px-4 text-gray-600">{t("ups.fields.pumpNumber")}</th>
                <th className="text-center py-2 px-4 text-gray-600">{t("ups.fields.flowRateValue")}</th>
                <th className="text-center py-2 px-4 text-gray-600">{t("ups.fields.percentage")}</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedData.map((pump) => (
                <tr key={pump.pumpNumber} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-gray-900 text-center">{t("ups.fields.pumpNumber")} {pump.pumpNumber}</td>
                  <td className="py-2 px-4 text-gray-900 text-center">{pump.flowRate.toFixed(2)}</td>
                  <td className="py-2 px-4 text-gray-900 text-center">{pump.percentage.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="border-t-2 font-semibold bg-gray-50">
                <td className="py-2 px-4 text-gray-900 text-center">{t("ups.fields.totalFlow")}</td>
                <td className="py-2 px-4 text-gray-900 text-center">{totalFlow?.toFixed(2) || '0.00'}</td>
                <td className="py-2 px-4 text-gray-900 text-center">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
