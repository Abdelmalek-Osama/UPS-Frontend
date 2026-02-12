import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DatePicker } from "../../../components/ui/datepicker";
import { Button } from "../../../components/ui/button";
import type { Event } from "../types";

interface AlarmEventsTableProps {
  events: Event[];
}

export function AlarmEventsTable({ events }: AlarmEventsTableProps) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Filter events based on date range
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.timestamp);
    
    if (startDate && eventDate < startDate) return false;
    if (endDate && eventDate > endDate) return false;
    
    return true;
  });

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ups.charts.alarmEvents")}</CardTitle>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <DatePicker
            placeholder={t("readings.fromDate")}
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            placeholder={t("readings.toDate")}
            value={endDate}
            onChange={setEndDate}
          />
          {(startDate || endDate) && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              {t("common.clearFilters")}
            </Button>
          )}
          <span className="text-sm text-gray-500">
            {t("common.showing")} {filteredEvents.length} {t("common.of")} {events.length} {t("alarms.events")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-center py-2 px-4 text-gray-600">{t("common.date")}</th>
                <th className="text-center py-2 px-4 text-gray-600">{t("common.hour")}</th>
                <th className="text-center py-2 px-4 text-gray-600">{t("alarms.eventDetails")}</th>
                <th className="text-center py-2 px-4 text-gray-600">{t("alarms.severity")}</th>
                <th className="text-center py-2 px-4 text-gray-600">{t("alarms.message")}</th>
                <th className="text-center py-2 px-4 text-gray-600">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {t("alarms.noEventsMatchFilters")}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-900 text-center">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 text-gray-900 text-center">
                      {new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
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
                        {event.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : event.severity === "high"
                            ? "bg-orange-100 text-orange-800"
                            : event.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {event.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-900 text-center">{event.message}</td>
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
                        {event.acknowledged ? t("common.active") : t("common.active")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
