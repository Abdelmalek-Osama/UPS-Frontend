import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DatePicker } from "../../../components/ui/datepicker";
import { Button } from "../../../components/ui/button";
import type { Event } from "../types";

interface AlarmEventsTableProps {
  events: Event[];
}

export function AlarmEventsTable({ events }: AlarmEventsTableProps) {
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
        <CardTitle>Alarm Events</CardTitle>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <DatePicker
            placeholder="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            placeholder="End Date"
            value={endDate}
            onChange={setEndDate}
          />
          {(startDate || endDate) && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
          <span className="text-sm text-gray-500">
            Showing {filteredEvents.length} of {events.length} events
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-center py-2 px-4 text-gray-600">Date</th>
                <th className="text-center py-2 px-4 text-gray-600">Hour</th>
                <th className="text-center py-2 px-4 text-gray-600">Type</th>
                <th className="text-center py-2 px-4 text-gray-600">Severity</th>
                <th className="text-center py-2 px-4 text-gray-600">Message</th>
                <th className="text-center py-2 px-4 text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No alarm events found for the selected date range
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
                        {event.acknowledged ? "Acknowledged" : "Active"}
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
