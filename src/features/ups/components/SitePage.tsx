import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WaterLevelMetricsCards } from "./WaterLevelMetricsCards";
import { SiteReadingsTable } from "./SiteReadingsTable";
import { TimeFilterBar } from "./TimeFilterBar";
import { PumpOperatingHoursTable } from "./PumpOperatingHoursTable";
import { PumpFlowTable } from "./PumpFlowTable";
import { PumpFlowChart } from "./PumpFlowChart";
import { PumpOperatingHoursChart } from "./PumpOperatingHoursChart";
import { AlarmEventsTable } from "./AlarmEventsTable";
import { ExportDropdown } from "./common/ExportDropdown";
import { SiteSelector } from "./SiteSelector";
import { useSiteDetails } from "../hooks/useSiteDetails";
import { exportReport, getAlarmEventsBySiteAndDateRange } from "../api/upsApi";
import { exportChartAsPNG, exportChartAsSVG } from "../utils/exportUtils";
import type { DateRange, TimeFilter, Event } from "../types";

// Custom Tooltip Components
interface CustomTooltipProps extends TooltipProps<number, string> {
  t: (key: string) => string;
}

// Helper function to format numbers in Western numerals (0-9) regardless of locale
const formatNumberWestern = (value: number): string => {
  return value.toLocaleString('en-US', { useGrouping: false });
};

const WaterLevelsTooltip = ({ active, payload, label, t }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'upstream' ? t("ups.fields.upstream") : t("ups.fields.downstream")}: {entry.value?.toFixed(2)} m
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const FlowRateTooltip = ({ active, payload, label, t }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {t("ups.fields.flowRate")}: {payload[0].value?.toFixed(2)} m³/h
        </p>
      </div>
    );
  }
  return null;
};

export function SitePage() {
  const navigate = useNavigate();
  const params = useParams();
  const { t, i18n } = useTranslation();
  const siteId = Number(params.siteId || 1);
  const [filter, setFilter] = useState<TimeFilter>("24h");
  const [range, setRange] = useState<DateRange>({});
  const { data, loading } = useSiteDetails(siteId, filter, range);

  // Alarm events state - managed separately
  const [alarmEvents, setAlarmEvents] = useState<Event[]>([]);
  const [alarmEventsLoading, setAlarmEventsLoading] = useState(false);
  const [alarmStartDate, setAlarmStartDate] = useState<Date | undefined>();
  const [alarmEndDate, setAlarmEndDate] = useState<Date | undefined>();

  // Fetch alarm events when date filters change
  useEffect(() => {
    const fetchAlarmEvents = async () => {
      setAlarmEventsLoading(true);
      try {
        const events = await getAlarmEventsBySiteAndDateRange(
          siteId,
          alarmStartDate,
          alarmEndDate
        );
        setAlarmEvents(events);
      } catch (error) {
        console.error("Failed to fetch alarm events:", error);
        setAlarmEvents([]);
      } finally {
        setAlarmEventsLoading(false);
      }
    };

    fetchAlarmEvents();
  }, [siteId, alarmStartDate, alarmEndDate]);

  const handleClearAlarmFilters = () => {
    setAlarmStartDate(undefined);
    setAlarmEndDate(undefined);
  };

  // Handle site change from selector
  const handleSiteChange = (newSiteId: number) => {
    navigate(`/sites/${newSiteId}`);
  };

  // Get language-appropriate names
  const isArabic = i18n.language === 'ar';
  const siteName = (isArabic && data.site.siteArabicName ? data.site.siteArabicName : data.site.siteName) || `Site ${siteId}`;
  const directorateName = (isArabic && data.site.governorateArabicName ? data.site.governorateArabicName : data.site.governorate) || 'Directorate';
  
  // Create sanitized filename for exports (remove special characters that might cause issues in filenames)
  const sanitizedSiteName = siteName.replace(/[/\\?%*:|"<>]/g, '-');
  

  // Determine if this is a pump station site from API data
  const isPumpStation = !!data.pumpStationDetails && data.pumpStationDetails.pumps.length > 0;
  
  // Transform pump data from API - now includes time series with timestamps
  const pumpOperatingHoursTimeSeries = useMemo(() => {
    if (!data.pumpFlowTimeSeries || data.pumpFlowTimeSeries.length === 0) return [];
    
    return data.pumpFlowTimeSeries.map(detail => ({
      timestamp: detail.timestamp,
      pumps: [
        { pumpNumber: 1, operatingHours: detail.p1Time || 0, status: (detail.p1Time || 0) > 0 ? "running" as const : "stopped" as const },
        { pumpNumber: 2, operatingHours: detail.p2Time || 0, status: (detail.p2Time || 0) > 0 ? "running" as const : "stopped" as const },
        { pumpNumber: 3, operatingHours: detail.p3Time || 0, status: (detail.p3Time || 0) > 0 ? "running" as const : "stopped" as const },
        { pumpNumber: 4, operatingHours: detail.p4Time || 0, status: (detail.p4Time || 0) > 0 ? "running" as const : "stopped" as const },
        { pumpNumber: 5, operatingHours: detail.p5Time || 0, status: (detail.p5Time || 0) > 0 ? "running" as const : "stopped" as const },
        { pumpNumber: 6, operatingHours: detail.p6Time || 0, status: (detail.p6Time || 0) > 0 ? "running" as const : "stopped" as const },
      ]
    }));
  }, [data.pumpFlowTimeSeries]);

  const pumpFlowsTimeSeries = useMemo(() => {
    if (!data.pumpFlowTimeSeries || data.pumpFlowTimeSeries.length === 0) return [];
    
    return data.pumpFlowTimeSeries.map(detail => {
      const totalFlow = (detail.p1Flow || 0) + (detail.p2Flow || 0) + (detail.p3Flow || 0) + (detail.p4Flow || 0) + (detail.p5Flow || 0) + (detail.p6Flow || 0);
      return {
        timestamp: detail.timestamp,
        totalFlow,
        pumps: [
          { pumpNumber: 1, flowRate: detail.p1Flow || 0, percentage: totalFlow > 0 ? ((detail.p1Flow || 0) / totalFlow) * 100 : 0 },
          { pumpNumber: 2, flowRate: detail.p2Flow || 0, percentage: totalFlow > 0 ? ((detail.p2Flow || 0) / totalFlow) * 100 : 0 },
          { pumpNumber: 3, flowRate: detail.p3Flow || 0, percentage: totalFlow > 0 ? ((detail.p3Flow || 0) / totalFlow) * 100 : 0 },
          { pumpNumber: 4, flowRate: detail.p4Flow || 0, percentage: totalFlow > 0 ? ((detail.p4Flow || 0) / totalFlow) * 100 : 0 },
          { pumpNumber: 5, flowRate: detail.p5Flow || 0, percentage: totalFlow > 0 ? ((detail.p5Flow || 0) / totalFlow) * 100 : 0 },
          { pumpNumber: 6, flowRate: detail.p6Flow || 0, percentage: totalFlow > 0 ? ((detail.p6Flow || 0) / totalFlow) * 100 : 0 },
        ]
      };
    });
  }, [data.pumpFlowTimeSeries]);

  // Transform pump flow time series data for charts
  const pumpFlowSeries = useMemo(() => {
   
      if (!data.pumpFlowTimeSeries || data.pumpFlowTimeSeries.length === 0) {
     
      return [];
    }
    
    // Transform API pump details to chart format
    const transformed = data.pumpFlowTimeSeries.map(detail => {
      const date = new Date(detail.timestamp);
            // Format date as YYYY/MM/DD HH:mm
      const formattedTime = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return {
        timestamp: detail.timestamp,
        label: formattedTime,
        pump1: detail.p1Flow,
        pump2: detail.p2Flow,
        pump3: detail.p3Flow,
        pump4: detail.p4Flow,
        pump5: detail.p5Flow,
        pump6: detail.p6Flow,
      };
    });
    
   
    return transformed;
  }, [data.pumpFlowTimeSeries]);

  const activePumps = useMemo(() => {
    // For the chart, show all pumps that have flow data in the time series
    // Not just the ones currently running
    if (!data.pumpFlowTimeSeries || data.pumpFlowTimeSeries.length === 0) {
      return [];
    }
    
    const pumpsWithData = new Set<number>();
    
    // Check which pumps have any non-zero flow in the time series
    data.pumpFlowTimeSeries.forEach(point => {
      if (point.p1Flow > 0) pumpsWithData.add(1);
      if (point.p2Flow > 0) pumpsWithData.add(2);
      if (point.p3Flow > 0) pumpsWithData.add(3);
      if (point.p4Flow > 0) pumpsWithData.add(4);
      if (point.p5Flow > 0) pumpsWithData.add(5);
      if (point.p6Flow > 0) pumpsWithData.add(6);
    });
    
    return Array.from(pumpsWithData).sort((a, b) => a - b);
  }, [data.pumpFlowTimeSeries]);

  // Handle export functionality
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      await exportReport("site", format, filter, range, siteId.toString());
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Use API data directly without calculations
  const chartSeries = useMemo(() => {
    return data.series.map(point => {
      const date = new Date(point.timestamp);
      // Format date as YYYY/MM/DD HH:mm
    const formattedTime = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
      
      return {
        timestamp: point.timestamp,
        upstream: point.upstream,
        downstream: point.downstream,
        batteryVoltage: point.batteryVoltage,
        flowRate: point.flowRate,
        label: formattedTime
      };
    });
  }, [data.series]);

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
            {t("ups.overview")}
          </Button>
          <span className="text-gray-400">/</span>
          {loading ? (
            <span className="text-gray-400">{t("ups.loading")}</span>
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
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {loading ? t("ups.loading") : siteName}
            </h1>
            <Badge 
              className={`mt-2 ${
                data.site.status === "active" 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {data.site.status === "active" ? t("ups.status.active") : t("ups.status.inactive")}
            </Badge>
          </div>
          
          {/* Site Selector Dropdown */}
          <div className="ml-4">
            <SiteSelector
              selectedSiteId={siteId}
              onSiteChange={handleSiteChange}
            />
          </div>
        </div>
      </div>

   
      {/* 3. Calculation Methods - Water Level Average Only */}
 
       <TimeFilterBar
        value={filter}
        onChange={setFilter}
        range={range}
        onRangeChange={setRange}
        onExport={handleExport}
        showCalculations={false}
        showExport={false}
      /> 



      {/* 2. Water Level Metrics Cards */}
      {data.metrics && <WaterLevelMetricsCards metrics={data.metrics} />}

      {/* 3. Charts Section */}
      {/* Water Levels Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("ups.charts.waterLevels")}</CardTitle>
            <ExportDropdown
              onExportPNG={() => exportChartAsPNG('water-levels-chart', `${sanitizedSiteName}-water-levels`)}
              onExportSVG={() => exportChartAsSVG('water-levels-chart', `${sanitizedSiteName}-water-levels`)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div id="water-levels-chart" className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartSeries} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, direction: 'ltr' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={Math.max(0, Math.floor(chartSeries.length / 5) - 1)}
                  tickMargin={5}
                />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={formatNumberWestern}
                  width={60}
                  tickMargin={25}
                />
                <Tooltip content={<WaterLevelsTooltip t={t} />} />
                <Line 
                  type="monotone" 
                  dataKey="upstream" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name={t("ups.fields.upstream")}
                />
                <Line 
                  type="monotone" 
                  dataKey="downstream" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                  name={t("ups.fields.downstream")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Flow Rate Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("ups.charts.totalFlow")} ({t("ups.waterLevel")})</CardTitle>
            <ExportDropdown
              onExportPNG={() => exportChartAsPNG('flow-rate-chart', `${sanitizedSiteName}-total-flow`)}
              onExportSVG={() => exportChartAsSVG('flow-rate-chart', `${sanitizedSiteName}-total-flow`)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div id="flow-rate-chart">
          {(() => {
            // Always use water level flow data for Total Flow chart
            const chartData = chartSeries;
            
            if (!chartData || chartData.length === 0) {
              return (
                <div className="h-[300px] w-full flex items-center justify-center text-gray-500">
                  {t("ups.noFlowData")}
                </div>
              );
            }
            
            // Calculate Y-axis domain
            const flowRates = chartData.map(d => d.flowRate || 0);
            const minFlow = Math.min(...flowRates);
            const maxFlow = Math.max(...flowRates);
            const yDomain = [Math.floor(minFlow * 0.9), Math.ceil(maxFlow * 1.1)];
            
        
            
            // Debug: Show data points count
            return (
              <>
                <div className="text-sm text-gray-600 mb-2">
                  {t("ups.dataPoints")}: {chartData.length} | {t("ups.using")}: {t("ups.waterLevelData")}
                </div>
                <div style={{ width: '100%', height: '350px' }}>
                  <ResponsiveContainer>
                    <AreaChart 
                      data={chartData} 
                      margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 11, direction: 'ltr' }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={Math.max(0, Math.floor(chartData.length / 5) - 1)}
                        tickMargin={5}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        domain={yDomain}
                        tickFormatter={formatNumberWestern}
                        width={60}
                        tickMargin={25}
                      />
                      <Tooltip content={<FlowRateTooltip t={t} />} />
                      <Area 
                        type="monotone" 
                        dataKey="flowRate" 
                        stroke="#06b6d4" 
                        fill="#06b6d4" 
                        fillOpacity={0.3}
                        isAnimationActive={false}
                        name={t("ups.fields.flowRate")}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            );
          })()}
          </div>
        </CardContent>
      </Card>


      

      {/* Data Tables */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ups.charts.recentReadings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteReadingsTable rows={tableRows} siteName={siteName} />
        </CardContent>
      </Card>

      {/* Pump Station Details - Only show for pump station sites with time series data */}
      {(() => {
        // Only show pump charts if we have at least 2 data points for time series
        const hasPumpTimeSeries = isPumpStation && data.pumpFlowTimeSeries && data.pumpFlowTimeSeries.length >= 1;
        
        return hasPumpTimeSeries ? (
          <>
            {/* Pump Charts - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PumpFlowChart data={pumpFlowSeries} activePumps={activePumps} />
              <PumpOperatingHoursChart 
                data={data.pumpFlowTimeSeries || []} 
                numPumps={data.pumpStationDetails?.pumps.length || 0} 
              />
            </div>

            {/* Pump Tables - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PumpFlowTable data={pumpFlowsTimeSeries} siteName={siteName} />
              <PumpOperatingHoursTable data={pumpOperatingHoursTimeSeries} siteName={siteName} />
            </div>
          </>
        ) : null;
      })()}

      {/* Alarm Events Table */}
      <AlarmEventsTable 
        events={alarmEvents}
        loading={alarmEventsLoading}
        startDate={alarmStartDate}
        endDate={alarmEndDate}
        onStartDateChange={setAlarmStartDate}
        onEndDateChange={setAlarmEndDate}
        onClearFilters={handleClearAlarmFilters}
      />


    </div>
  );
}
