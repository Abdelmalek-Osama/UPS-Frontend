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
import { PumpOperatingHoursTable } from "./PumpOperatingHoursTable";
import { PumpFlowTable } from "./PumpFlowTable";
import { PumpFlowChart } from "./PumpFlowChart";
import { AlarmEventsTable } from "./AlarmEventsTable";
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

  // Determine if this is a pump station site (mock logic - should come from backend)
  const isPumpStation = data.site.siteName.toLowerCase().includes("pump");

  // Mock pump data (should come from backend API)
  const pumpOperatingHours = [
    { pumpNumber: 1, operatingHours: 245.5, status: "running" as const },
    { pumpNumber: 2, operatingHours: 198.2, status: "running" as const },
    { pumpNumber: 3, operatingHours: 312.8, status: "stopped" as const },
    { pumpNumber: 4, operatingHours: 156.4, status: "running" as const },
    { pumpNumber: 5, operatingHours: 89.1, status: "maintenance" as const },
    { pumpNumber: 6, operatingHours: 267.9, status: "running" as const },
  ];

  const pumpFlows = [
    { pumpNumber: 1, flowRate: 3.2, percentage: 18.5 },
    { pumpNumber: 2, flowRate: 2.8, percentage: 16.2 },
    { pumpNumber: 3, flowRate: 0, percentage: 0 },
    { pumpNumber: 4, flowRate: 3.5, percentage: 20.2 },
    { pumpNumber: 5, flowRate: 0, percentage: 0 },
    { pumpNumber: 6, flowRate: 7.8, percentage: 45.1 },
  ];

  const totalPumpFlow = pumpFlows.reduce((sum, pump) => sum + pump.flowRate, 0);

  // Mock pump flow time series data
  const pumpFlowSeries = useMemo(() => {
    return [
      { timestamp: '2026-02-05T10:00:00Z', label: '10:00', pump1: 3.1, pump2: 2.9, pump3: 0, pump4: 3.4, pump5: 0, pump6: 7.5 },
      { timestamp: '2026-02-05T11:00:00Z', label: '11:00', pump1: 3.3, pump2: 2.7, pump3: 0, pump4: 3.6, pump5: 0, pump6: 7.9 },
      { timestamp: '2026-02-05T12:00:00Z', label: '12:00', pump1: 3.2, pump2: 2.8, pump3: 0, pump4: 3.5, pump5: 0, pump6: 7.8 },
      { timestamp: '2026-02-05T13:00:00Z', label: '13:00', pump1: 3.4, pump2: 2.9, pump3: 0, pump4: 3.7, pump5: 0, pump6: 8.1 },
      { timestamp: '2026-02-05T14:00:00Z', label: '14:00', pump1: 3.1, pump2: 2.6, pump3: 0, pump4: 3.3, pump5: 0, pump6: 7.6 },
      { timestamp: '2026-02-05T15:00:00Z', label: '15:00', pump1: 3.0, pump2: 2.8, pump3: 0, pump4: 3.5, pump5: 0, pump6: 7.7 },
      { timestamp: '2026-02-05T16:00:00Z', label: '16:00', pump1: 3.2, pump2: 2.7, pump3: 0, pump4: 3.4, pump5: 0, pump6: 7.9 },
      { timestamp: '2026-02-05T17:00:00Z', label: '17:00', pump1: 3.3, pump2: 2.9, pump3: 0, pump4: 3.6, pump5: 0, pump6: 8.0 },
    ];
  }, []);

  const activePumps = [1, 2, 4, 6]; // Pumps that are currently active

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

   
      {/* 3. Calculation Methods - Water Level Average Only */}
 
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

      {/* 1. Metrics Cards */}
      <SiteMetricsCards site={data.site} />

      {/* 2. Charts Section */}
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

      {/* Flow Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Flow Rate Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
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


      

      {/* Data Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteReadingsTable rows={tableRows} />
        </CardContent>
      </Card>

      {/* Pump Station Details - Only show for pump station sites */}
      {isPumpStation && (
        <>
          {/* Pump Flow Chart */}
          <PumpFlowChart data={pumpFlowSeries} activePumps={activePumps} />

          {/* Pump Tables - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PumpOperatingHoursTable data={pumpOperatingHours} />
            <PumpFlowTable data={pumpFlows} totalFlow={totalPumpFlow} />
          </div>
        </>
      )}

      {/* Alarm Events Table */}
      <AlarmEventsTable events={data.events} />


    </div>
  );
}
