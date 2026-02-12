import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { i18n } = useTranslation();
  const siteId = Number(params.siteId || 1);
  const [filter, setFilter] = useState<TimeFilter>("week");
  const [range, setRange] = useState<DateRange>({});
  const [calculations, setCalculations] = useState<CalculationOptions>({
    levels: "average",
    flow: "sum"
  });
  const { data, loading } = useSiteDetails(siteId, filter, range);

  // Get language-appropriate names
  const isArabic = i18n.language === 'ar';
  const siteName = (isArabic && data.site.siteArabicName ? data.site.siteArabicName : data.site.siteName) || `Site ${siteId}`;
  const directorateName = (isArabic && data.site.governorateArabicName ? data.site.governorateArabicName : data.site.governorate) || 'Directorate';
  
  // Debug logging
  console.log('SitePage - Site data:', {
    siteId,
    siteName: data.site.siteName,
    siteArabicName: data.site.siteArabicName,
    governorate: data.site.governorate,
    governorateArabicName: data.site.governorateArabicName,
    isArabic,
    displaySiteName: siteName,
    displayDirectorateName: directorateName,
    loading
  });

  // Determine if this is a pump station site from API data
  const isPumpStation = !!data.pumpStationDetails && data.pumpStationDetails.pumps.length > 0;

  // Transform pump data from API
  const pumpOperatingHours = useMemo(() => {
    if (!data.pumpStationDetails) return [];
    
    return data.pumpStationDetails.pumps.map(pump => ({
      pumpNumber: pump.pumpNumber,
      operatingHours: pump.operatingHours,
      status: pump.operatingHours > 0 ? "running" as const : "stopped" as const,
    }));
  }, [data.pumpStationDetails]);

  const pumpFlows = useMemo(() => {
    if (!data.pumpStationDetails) return [];
    
    const totalFlow = data.pumpStationDetails.pumps.reduce((sum, pump) => sum + pump.totalFlow, 0);
    
    return data.pumpStationDetails.pumps.map(pump => ({
      pumpNumber: pump.pumpNumber,
      flowRate: pump.totalFlow,
      percentage: totalFlow > 0 ? (pump.totalFlow / totalFlow) * 100 : 0,
    }));
  }, [data.pumpStationDetails]);

  const totalPumpFlow = useMemo(() => {
    return pumpFlows.reduce((sum, pump) => sum + pump.flowRate, 0);
  }, [pumpFlows]);

  // Transform pump flow time series data from API
  const pumpFlowSeries = useMemo(() => {
    if (!data.pumpStationDetails) return [];
    
    // Get pump details from API if available
    // Note: This requires the API to provide pumpDetails array with timestamps
    // For now, we'll create a placeholder structure
    // TODO: Update when API provides full pump flow time series
    
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
  }, [data.pumpStationDetails]);

  const activePumps = useMemo(() => {
    return pumpOperatingHours
      .filter(pump => pump.status === "running")
      .map(pump => pump.pumpNumber);
  }, [pumpOperatingHours]);

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
    // Use actual API data from data.series
    const apiData = data.series.map(point => ({
      timestamp: point.timestamp,
      upstream: point.upstream,
      downstream: point.downstream,
      batteryVoltage: point.batteryVoltage,
      flowRate: point.flowRate,
      label: new Date(point.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
    
    // Apply calculations for aggregation
    if (apiData.length > 0) {
      const periodType = getPeriodType(filter);
      const aggregated = aggregateTimeSeriesPoints(apiData, calculations, periodType);
      return aggregated.map(point => ({
        ...point,
        label: new Date(point.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));
    }
    
    return apiData;
  }, [data.series, filter, calculations]);

  const tableRows = useMemo(() => {
    return data.hourlyReadings;
  }, [data.hourlyReadings]);

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
          {loading ? (
            <span className="text-gray-400">Loading...</span>
          ) : (
            <>
              <span className="text-gray-500">{directorateName}</span>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-900">{siteName}</span>
            </>
          )}
        </div>
      </div>

      {/* Site Title and Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {loading ? 'Loading...' : siteName}
          </h1>
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
        showCalculations={true}
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
          <CardTitle>Total Flow</CardTitle>
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
