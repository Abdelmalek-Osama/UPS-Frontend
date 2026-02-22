import { useEffect, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { getSiteDashboardData } from "../api/upsApi";
import type { DateRange, SiteDetails, TimeFilter } from "../types";
import type { WaterLevelMetricsDto } from "../api/upsApi";

// Helper function to convert TimeFilter to API parameters
const getDateRangeFromFilter = (filter: TimeFilter, range?: DateRange) => {
  switch (filter) {
    case "24h":
      // For last 24 hours, don't send any params (API default)
      return { isLast7Days: undefined, isLast30Days: undefined, startDate: undefined, endDate: undefined };
    case "week":
      return { isLast7Days: true, isLast30Days: undefined, startDate: undefined, endDate: undefined };
    case "month":
      return { isLast30Days: true, isLast7Days: undefined, startDate: undefined, endDate: undefined };
    case "custom":
      return {
        startDate: range?.start,
        endDate: range?.end,
        isLast7Days: undefined,
        isLast30Days: undefined,
      };
    default:
      // Default to no params (last 24 hours)
      return { isLast7Days: undefined, isLast30Days: undefined, startDate: undefined, endDate: undefined };
  }
};

// Create empty site details for initial state
const createEmptySiteDetails = (siteId: number): SiteDetails & { metrics?: WaterLevelMetricsDto } => ({
  site: {
    siteId: siteId.toString(),
    siteName: "",
    position: 0,
    upstream: 0,
    downstream: 0,
    batteryVoltage: 0,
    flowRate: 0,
    status: "inactive",
    lastReading: new Date(),
    coordinates: [0, 0],
    governorate: "",
    branch: "",
  },
  series: [],
  hourlyReadings: [],
  dailyReadings: [],
  events: [],
  metrics: undefined,
});

export const useSiteDetails = (siteId: number, filter: TimeFilter, range?: DateRange) => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<SiteDetails & { metrics?: WaterLevelMetricsDto }>(() => createEmptySiteDetails(siteId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isAuthenticated) {
        if (active) {
          setData(createEmptySiteDetails(siteId));
          setLoading(false);
          setError("Please log in to view site details");
        }
        return;
      }

      // For custom filter, wait until both dates are selected
      if (filter === "custom" && (!range?.start || !range?.end)) {
        if (active) {
          setLoading(false);
          setError("Please select both start and end dates");
        }
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const dateParams = getDateRangeFromFilter(filter, range);
        
        const apiData = await getSiteDashboardData(
          siteId,
          dateParams.isLast7Days,
          dateParams.isLast30Days,
          dateParams.startDate,
          dateParams.endDate
        );

        if (active) {
          // Use API data directly without calculations
          const timestamps = apiData.waterLevel.timestamps;
          const uswl = apiData.waterLevel.uswl;
          const dswl = apiData.waterLevel.dswl;
          const flow = apiData.waterLevel.flow;

          // Create time series data directly from API
          const series = timestamps.map((timestamp, index) => ({
            timestamp,
            upstream: uswl[index] || 0,
            downstream: dswl[index] || 0,
            batteryVoltage: 12.5, // Not provided by API
            flowRate: flow[index] || 0,
          }));
          
          // Get latest reading (last item in arrays)
          const lastIndex = timestamps.length - 1;
          const latestUpstream = lastIndex >= 0 ? (uswl[lastIndex] || 0) : 0;
          const latestDownstream = lastIndex >= 0 ? (dswl[lastIndex] || 0) : 0;
          const latestFlow = lastIndex >= 0 ? (flow[lastIndex] || 0) : 0;
          const lastReadingTime = lastIndex >= 0 ? new Date(timestamps[lastIndex]) : new Date();

          // Transform pump station data if available
          let pumpStationDetails = undefined;
          let pumpFlowTimeSeries = undefined;
          let hourlyReadings = series; // Default to water level data
          
          if (apiData.pumpStation && apiData.pumpStation.pumpDetails.length > 0) {
            // Get the latest pump details (last entry)
            const latestPumpData = apiData.pumpStation.pumpDetails[apiData.pumpStation.pumpDetails.length - 1];
            
            // Detect all pumps that have data (p1-p6)
            // Check which pumps exist in the API response
            const pumps = [];
            const pumpKeys = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] as const;
            
            for (let i = 0; i < pumpKeys.length; i++) {
              const pumpKey = pumpKeys[i];
              const timeKey = `${pumpKey}Time` as keyof typeof latestPumpData;
              const flowKey = `${pumpKey}Flow` as keyof typeof latestPumpData;
              
              // Only include pump if it has data in the response
              if (latestPumpData[timeKey] !== undefined || latestPumpData[flowKey] !== undefined) {
                pumps.push({
                  pumpNumber: i + 1,
                  operatingHours: (latestPumpData[timeKey] as number) || 0,
                  totalFlow: (latestPumpData[flowKey] as number) || 0,
                });
              }
            }

            pumpStationDetails = { pumps };
            
            // Transform pump details time series for the chart
            pumpFlowTimeSeries = apiData.pumpStation.pumpDetails.map(detail => ({
              timestamp: detail.timestamp,
              totalFlow: detail.totalFlow,
              p1Flow: detail.p1Flow,
              p1Time: detail.p1Time,
              p2Flow: detail.p2Flow,
              p2Time: detail.p2Time,
              p3Flow: detail.p3Flow,
              p3Time: detail.p3Time,
              p4Flow: detail.p4Flow,
              p4Time: detail.p4Time,
              p5Flow: detail.p5Flow,
              p5Time: detail.p5Time,
              p6Flow: detail.p6Flow,
              p6Time: detail.p6Time,
            }));

            // Create a map of pump totalFlow by timestamp for quick lookup
            const pumpFlowMap = new Map<string, number>();
            apiData.pumpStation.pumpDetails.forEach(detail => {
              pumpFlowMap.set(detail.timestamp, detail.totalFlow);
            });

            // Merge water level data with pump totalFlow for Recent Readings table
            // Use pump totalFlow if available for matching timestamp, otherwise use water level flow
            hourlyReadings = timestamps.map((timestamp, index) => ({
              timestamp,
              upstream: uswl[index] || 0,
              downstream: dswl[index] || 0,
              batteryVoltage: 12.5,
              flowRate: pumpFlowMap.get(timestamp) ?? flow[index] ?? 0, // Use pump totalFlow if available, otherwise water level flow
            }));
          }

          const transformedData: SiteDetails & { metrics?: WaterLevelMetricsDto } = {
            site: {
              siteId: siteId.toString(),
              siteName: apiData.siteNameEn,
              siteArabicName: apiData.siteNameAr,
              position: 0,
              upstream: latestUpstream,
              downstream: latestDownstream,
              batteryVoltage: 12.5,
              flowRate: latestFlow,
              status: "active",
              lastReading: lastReadingTime,
              coordinates: [0, 0],
              governorate: apiData.directorateEn,
              governorateArabicName: apiData.directorateAr,
              branch: "Ibrahimiya",
            },
            series,
            hourlyReadings,
            dailyReadings: series,
            events: [],
            pumpStationDetails,
            pumpFlowTimeSeries,
            metrics: apiData.waterLevel.metrics, // Add metrics from API
          };

          setData(transformedData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching site dashboard data:", err);
        if (active) {
          setError("Failed to load site data from API");
          setData(createEmptySiteDetails(siteId));
          setLoading(false);
        }
      }
    };

    if (siteId) {
      load();
    }

    return () => {
      active = false;
    };
  }, [filter, isAuthenticated, range?.end, range?.start, siteId]);

  return { data, loading, error };
};
