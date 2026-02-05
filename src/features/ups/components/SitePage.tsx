import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SiteMetricsCards } from "./SiteMetricsCards";
import { SiteReadingsTable } from "./SiteReadingsTable";
import { TimeFilterBar } from "./TimeFilterBar";
import { useSiteDetails } from "../hooks/useSiteDetails";
import { exportReport } from "../api/upsApi";
import { aggregateTimeSeriesPoints, getPeriodType } from "../utils/calculations";
import type { DateRange, TimeFilter } from "../types";
import type { CalculationOptions } from "./TimeFilterBar";

export function SitePage() {
  const navigate = useNavigate();
  const params = useParams();
  const siteId = Number(params.siteId || 1);
  const [filter, setFilter] = useState<TimeFilter>("24h");
  const [range, setRange] = useState<DateRange>({});
  const [calculations, setCalculations] = useState<CalculationOptions>({
    levels: "average",
    battery: "average", 
    flow: "sum"
  });
  const { data } = useSiteDetails(siteId, filter, range);

  // Handle export functionality
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      await exportReport("site", format, filter, range, siteId.toString());
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Process chart data with calculations
  const chartSeries = useMemo(() => {
    const testData = [
      { timestamp: '2026-02-05T10:00:00Z', upstream: 5.5, downstream: 4.8, batteryVoltage: 12.5, flowRate: 18.2, label: '10:00' },
      { timestamp: '2026-02-05T11:00:00Z', upstream: 5.7, downstream: 5.0, batteryVoltage: 12.7, flowRate: 18.8, label: '11:00' },
      { timestamp: '2026-02-05T12:00:00Z', upstream: 5.9, downstream: 5.2, batteryVoltage: 12.9, flowRate: 19.1, label: '12:00' },
      { timestamp: '2026-02-05T13:00:00Z', upstream: 6.1, downstream: 5.4, batteryVoltage: 12.6, flowRate: 19.5, label: '13:00' },
      { timestamp: '2026-02-05T14:00:00Z', upstream: 5.8, downstream: 5.1, batteryVoltage: 12.4, flowRate: 18.9, label: '14:00' },
      { timestamp: '2026-02-05T15:00:00Z', upstream: 5.6, downstream: 4.9, batteryVoltage: 12.3, flowRate: 18.5, label: '15:00' },
      { timestamp: '2026-02-05T16:00:00Z', upstream: 5.4, downstream: 4.7, batteryVoltage: 12.8, flowRate: 18.1, label: '16:00' },
      { timestamp: '2026-02-05T17:00:00Z', upstream: 5.8, downstream: 5.1, batteryVoltage: 12.6, flowRate: 19.0, label: '17:00' },
    ];
    
    // Apply calculations if not latest reading
    if (filter !== "latest") {
      const periodType = getPeriodType(filter);
      const aggregated = aggregateTimeSeriesPoints(testData, calculations, periodType);
      return aggregated.map(point => ({
        ...point,
        label: new Date(point.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));
    }
    
    return testData;
  }, [data, filter, calculations]);

  const tableRows = useMemo(() => {
    if (filter === "latest") {
      const latest = data.hourlyReadings[data.hourlyReadings.length - 1];
      return latest ? [latest] : [];
    }
    return filter === "24h" ? data.hourlyReadings : data.dailyReadings;
  }, [data.dailyReadings, data.hourlyReadings, filter]);

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Overview
          </Button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{data.site.governorate}</span>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-900">{data.site.siteName}</span>
        </div>
      </div>

      {/* Site Title and Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{data.site.siteName}</h1>
          <Badge 
            className={`mt-2 ${
              data.site.status === "active" 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {data.site.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Time Filter and Export Controls */}
      <TimeFilterBar
        value={filter}
        onChange={setFilter}
        range={range}
        onRangeChange={setRange}
        calculations={calculations}
        onCalculationsChange={setCalculations}
        onExport={handleExport}
        showCalculations={filter !== "latest"}
      />

      {/* Metrics Cards */}
      <SiteMetricsCards site={data.site} />

      {/* Water Levels Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Water Levels (Upstream vs Downstream)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="upstream" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="downstream" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Flow Rate and Battery Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Flow Rate Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="flowRate" 
                    stroke="#06b6d4" 
                    fill="#06b6d4" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Battery Voltage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line 
                    type="stepAfter" 
                    dataKey="batteryVoltage" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteReadingsTable rows={tableRows} />
        </CardContent>
      </Card>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex space-x-4 border-b pb-2">
              <button className="text-sm font-medium text-gray-900 border-b-2 border-blue-500 pb-1">
                Recent Readings
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Event Log
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-600">Time</th>
                    <th className="text-left py-2 text-gray-600">Type</th>
                    <th className="text-left py-2 text-gray-600">Message</th>
                    <th className="text-left py-2 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.slice(0, 5).map((event) => (
                    <tr key={event.id} className="border-b">
                      <td className="py-2 text-gray-900">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.type === 'alarm' ? 'bg-red-100 text-red-800' :
                          event.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {event.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 text-gray-900">{event.message}</td>
                      <td className="py-2">
                        <span className={`inline-flex items-center text-xs ${
                          event.acknowledged ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            event.acknowledged ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {event.acknowledged ? 'Acknowledged' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
