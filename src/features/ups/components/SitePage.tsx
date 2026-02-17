import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SiteMetricsCards } from "./SiteMetricsCards";
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
import { aggregateTimeSeriesPoints, getPeriodType } from "../utils/calculations";
import type { DateRange, TimeFilter, Event } from "../types";

// Custom Tooltip Components
interface CustomTooltipProps extends TooltipProps<number, string> {
  t: (key: string) => string;
}

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
   
      if (!data.pumpFlowTimeSeries || data.pumpFlowTimeSeries.length === 0) {
     
      return [];
    }
    
    // Transform API pump details to chart format
    const transformed = data.pumpFlowTimeSeries.map(detail => {
      const date = new Date(detail.timestamp);
      return {
        timestamp: detail.timestamp,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
    
    // Apply default calculations for aggregation
    if (apiData.length > 0) {
      const periodType = getPeriodType(filter);
      const defaultCalculations = { levels: "average" as const, flow: "sum" as const };
      const aggregated = aggregateTimeSeriesPoints(apiData, defaultCalculations, periodType);
      return aggregated.map(point => ({
        ...point,
        label: new Date(point.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));
    }
    
    return apiData;
  }, [data.series, filter]);

  // For pump stations, create a separate chart series using pump total flow
  const pumpTotalFlowSeries = useMemo(() => {

    if (!data.pumpFlowTimeSeries || data.pumpFlowTimeSeries.length === 0) {
     
      return [];
    }
    
    const series = data.pumpFlowTimeSeries.map(point => {
      const date = new Date(point.timestamp);
      return {
        timestamp: point.timestamp,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        flowRate: point.totalFlow,
      };
    });

    return series;
  }, [data.pumpFlowTimeSeries]);

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

      {/* 1. Metrics Cards */}
      <SiteMetricsCards site={data.site} />

      {/* 2. Charts Section */}
      {/* Water Levels Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("ups.charts.waterLevels")}</CardTitle>
            <ExportDropdown
              onExportPNG={() => exportChartAsPNG('water-levels-chart', 'water-levels-chart')}
              onExportSVG={() => exportChartAsSVG('water-levels-chart', 'water-levels-chart')}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div id="water-levels-chart" className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
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
            <CardTitle>{t("ups.charts.totalFlow")} {isPumpStation && pumpTotalFlowSeries.length > 0 ? `(${t("ups.pumpStation")})` : `(${t("ups.waterLevel")})`}</CardTitle>
            <ExportDropdown
              onExportPNG={() => exportChartAsPNG('flow-rate-chart', 'flow-rate-chart')}
              onExportSVG={() => exportChartAsSVG('flow-rate-chart', 'flow-rate-chart')}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div id="flow-rate-chart">
          {(() => {
            const chartData = isPumpStation && pumpTotalFlowSeries.length > 0 ? pumpTotalFlowSeries : chartSeries;
            
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
                  {t("ups.dataPoints")}: {chartData.length} | {t("ups.using")}: {isPumpStation && pumpTotalFlowSeries.length > 0 ? t("ups.pumpData") : t("ups.waterLevelData")}
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <AreaChart 
                      data={chartData} 
                      margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        domain={yDomain}
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
          <SiteReadingsTable rows={tableRows} />
        </CardContent>
      </Card>

      {/* Pump Station Details - Only show for pump station sites */}
      {(() => {

        return isPumpStation ? (
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
              <PumpFlowTable data={pumpFlows} totalFlow={totalPumpFlow} />
              <PumpOperatingHoursTable data={pumpOperatingHours} />
              
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
