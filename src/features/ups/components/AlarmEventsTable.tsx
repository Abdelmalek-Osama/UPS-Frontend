import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DatePicker } from "../../../components/ui/datepicker";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExportDropdown } from "./common/ExportDropdown";
import { exportTableToCSV, exportTableToExcel } from "../utils/exportUtils";
import type { Event } from "../types";

interface AlarmEventsTableProps {
  events: Event[];
  loading?: boolean;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
}

export function AlarmEventsTable({ 
  events, 
  loading = false,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters
}: AlarmEventsTableProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const hoursStr = String(hours).padStart(2, '0');
    return `${hoursStr}:${minutes}`;
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'date', header: t("common.date") },
      { key: 'time', header: t("common.hour") },
      { key: 'type', header: t("alarms.eventDetails") },
      { key: 'severity', header: t("alarms.severityLabel") },
      { key: 'message', header: t("alarms.message") },
      { key: 'status', header: t("common.status") },
    ];

    const data = events.map(event => ({
      date: new Date(event.timestamp).toLocaleDateString(),
      time: formatTime(event.timestamp),
      type: event.type?.toUpperCase() || 'N/A',
      severity: event.severity?.toUpperCase() || 'N/A',
      message: event.message || '-',
      status: event.acknowledged ? t("alarms.fieldIsResolved") : t("alarms.pending"),
    }));

    exportTableToCSV(data, columns, 'alarm-events', t("ups.charts.alarmEvents"));
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'date', header: t("common.date") },
      { key: 'time', header: t("common.hour") },
      { key: 'type', header: t("alarms.eventDetails") },
      { key: 'severity', header: t("alarms.severityLabel") },
      { key: 'message', header: t("alarms.message") },
      { key: 'status', header: t("common.status") },
    ];

    const data = events.map(event => ({
      date: new Date(event.timestamp).toLocaleDateString(),
      time: formatTime(event.timestamp),
      type: event.type?.toUpperCase() || 'N/A',
      severity: event.severity?.toUpperCase() || 'N/A',
      message: event.message || '-',
      status: event.acknowledged ? t("alarms.fieldIsResolved") : t("alarms.pending"),
    }));

    exportTableToExcel(data, columns, 'alarm-events', t("ups.charts.alarmEvents"));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("ups.charts.alarmEvents")}</CardTitle>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            disabled={events.length === 0}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <DatePicker
            placeholder={t("readings.fromDate")}
            value={startDate}
            onChange={onStartDateChange}
          />
          <DatePicker
            placeholder={t("readings.toDate")}
            value={endDate}
            onChange={onEndDateChange}
          />
          {(startDate || endDate) && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              {t("common.clearFilters")}
            </Button>
          )}
          <span className="text-sm text-gray-500">
            {t("common.showing")} {events.length} {t("alarms.events")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            {t("ups.loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-center py-2 px-4 text-gray-600">{t("common.date")}</th>
                  <th className="text-center py-2 px-4 text-gray-600">{t("common.hour")}</th>
                  <th className="text-center py-2 px-4 text-gray-600">{t("alarms.eventDetails")}</th>
                  <th className="text-center py-2 px-4 text-gray-600">{t("alarms.severityLabel")}</th>
                  <th className="text-center py-2 px-4 text-gray-600">{t("alarms.message")}</th>
                  <th className="text-center py-2 px-4 text-gray-600">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {currentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {t("alarms.noEventsMatchFilters")}
                    </td>
                  </tr>
                ) : (
                  currentEvents.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-900 text-center">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 text-gray-900 text-center">
                      {formatTime(event.timestamp)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.type === "alarm"
                            ? "bg-red-100 text-red-800"
                            : event.type === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {event.type ? t(`alarms.type.${event.type}`) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : event.severity === "high"
                            ? "bg-orange-100 text-orange-800"
                            : event.severity === "info"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.severity ? t(`alarms.severity.${event.severity}`) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-900 text-center">{event.message || '-'}</td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={`inline-flex items-center text-xs ${
                          event.acknowledged ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-1 ${
                            event.acknowledged ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        {event.acknowledged ? t("alarms.fieldIsResolved") : t("alarms.pending")}
                      </span>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {events.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t">
                <div className="text-sm text-gray-700">
                  {t("common.showing")} {startIndex + 1} {t("common.to")} {Math.min(endIndex, events.length)} {t("common.of")} {events.length} {t("alarms.events")}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t("common.previous")}
                  </Button>
                  <span className="text-sm text-gray-700">
                    {t("readings.page")} {currentPage} {t("common.of")} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    {t("common.next")}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
