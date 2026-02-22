import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportTableToCSV, exportTableToExcel } from "../utils/exportUtils";

interface PumpOperatingHours {
  pumpNumber: number;
  operatingHours: number;
  status: "running" | "stopped" | "maintenance";
}

interface PumpOperatingHoursTimeSeries {
  timestamp: string;
  pumps: PumpOperatingHours[];
}

interface PumpOperatingHoursTableProps {
  data: PumpOperatingHours[] | PumpOperatingHoursTimeSeries[];
  siteName?: string;
}

export function PumpOperatingHoursTable({ data, siteName }: PumpOperatingHoursTableProps) {
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
      const timeSeriesData = data as PumpOperatingHoursTimeSeries[];
      const columns = [
        { key: 'date', header: t("common.date") },
        { key: 'time', header: t("common.hour") },
        ...Array.from({ length: 6 }, (_, i) => ({
          key: `pump${i + 1}`,
          header: `${t("ups.fields.pumpNumber")} ${i + 1}`,
        })),
      ];

      const exportData = timeSeriesData.map(entry => {
        const row: Record<string, string> = {
          date: formatDate(entry.timestamp),
          time: formatTime(entry.timestamp),
        };
        entry.pumps.forEach(pump => {
          row[`pump${pump.pumpNumber}`] = `${pump.operatingHours.toFixed(1)} ${t("readings.hour")}`;
        });
        return row;
      });

      exportTableToCSV(exportData, columns, `${sanitizedSiteName}-pump-operating-hours-timeseries`);
    } else {
      const aggregatedData = data as PumpOperatingHours[];
      const columns = [
        { key: 'pumpNumber', header: t("ups.fields.pumpNumber") },
        { key: 'operatingHours', header: t("ups.fields.operatingHours") },
        { key: 'status', header: t("ups.fields.status") },
      ];

      const exportData = aggregatedData.map(pump => ({
        pumpNumber: `${t("ups.fields.pumpNumber")} ${pump.pumpNumber}`,
        operatingHours: `${pump.operatingHours.toFixed(1)} ${t("readings.hour")}`,
        status: pump.status === "running" ? t("ups.status.running") : t("ups.status.stopped"),
      }));

      exportTableToCSV(exportData, columns, `${sanitizedSiteName}-pump-operating-hours`);
    }
  };

  const handleExportExcel = () => {
    if (isTimeSeries) {
      const timeSeriesData = data as PumpOperatingHoursTimeSeries[];
      const columns = [
        { key: 'date', header: t("common.date") },
        { key: 'time', header: t("common.hour") },
        ...Array.from({ length: 6 }, (_, i) => ({
          key: `pump${i + 1}`,
          header: `${t("ups.fields.pumpNumber")} ${i + 1}`,
        })),
      ];

      const exportData = timeSeriesData.map(entry => {
        const row: Record<string, string> = {
          date: formatDate(entry.timestamp),
          time: formatTime(entry.timestamp),
        };
        entry.pumps.forEach(pump => {
          row[`pump${pump.pumpNumber}`] = `${pump.operatingHours.toFixed(1)} ${t("readings.hour")}`;
        });
        return row;
      });

      exportTableToExcel(exportData, columns, `${sanitizedSiteName}-pump-operating-hours-timeseries`);
    } else {
      const aggregatedData = data as PumpOperatingHours[];
      const columns = [
        { key: 'pumpNumber', header: t("ups.fields.pumpNumber") },
        { key: 'operatingHours', header: t("ups.fields.operatingHours") },
        { key: 'status', header: t("ups.fields.status") },
      ];

      const exportData = aggregatedData.map(pump => ({
        pumpNumber: `${t("ups.fields.pumpNumber")} ${pump.pumpNumber}`,
        operatingHours: `${pump.operatingHours.toFixed(1)} ${t("readings.hour")}`,
        status: pump.status === "running" ? t("ups.status.running") : t("ups.status.stopped"),
      }));

      exportTableToExcel(exportData, columns, `${sanitizedSiteName}-pump-operating-hours`);
    }
  };
  
  if (isTimeSeries) {
    const timeSeriesData = data as PumpOperatingHoursTimeSeries[];
    
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
            <CardTitle>{t("ups.charts.pumpOperatingHours")}</CardTitle>
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
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      {t("common.noData")}
                    </td>
                  </tr>
                ) : (
                  currentData.map((entry, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 text-gray-900 text-center">{formatDate(entry.timestamp)}</td>
                      <td className="py-2 px-4 text-gray-900 text-center">{formatTime(entry.timestamp)}</td>
                      {Array.from({ length: 6 }, (_, i) => {
                        const pump = entry.pumps.find(p => p.pumpNumber === i + 1);
                        return (
                          <td key={i + 1} className="py-2 px-4 text-gray-900 text-center">
                            {pump ? `${pump.operatingHours.toFixed(1)} ${t("readings.hour")}` : '-'}
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
  const aggregatedData = data as PumpOperatingHours[];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("ups.charts.pumpOperatingHours")}</CardTitle>
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
                <th className="text-center py-2 px-4 text-gray-600">{t("ups.fields.operatingHours")}</th>
                <th className="text-center py-2 px-4 text-gray-600">{t("ups.fields.status")}</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedData.map((pump) => (
                <tr key={pump.pumpNumber} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-gray-900 text-center">{t("ups.fields.pumpNumber")} {pump.pumpNumber}</td>
                  <td className="py-2 px-4 text-gray-900 text-center">{pump.operatingHours.toFixed(1)} {t("readings.hour")}</td>
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        pump.status === "running"
                          ? "bg-green-100 text-green-800"
                          : pump.status === "stopped"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {pump.status === "running" ? t("ups.status.running") : t("ups.status.stopped")}
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
