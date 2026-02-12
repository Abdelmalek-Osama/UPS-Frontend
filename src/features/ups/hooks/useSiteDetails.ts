import { useEffect, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { getSiteDashboardData } from "../api/upsApi";
import type { DateRange, SiteDetails, TimeFilter } from "../types";

// Helper function to convert TimeFilter to API parameters
const getDateRangeFromFilter = (filter: TimeFilter, range?: DateRange) => {
  switch (filter) {
    case "week":
      return { isLast7Days: true, isLast30Days: false };
    case "month":
      return { isLast30Days: true, isLast7Days: false };
    case "custom":
      return {
        startDate: range?.start,
        endDate: range?.end,
        isLast7Days: false,
        isLast30Days: false,
      };
    default:
      return { isLast7Days: true, isLast30Days: false };
  }
};

// Create empty site details for initial state
const createEmptySiteDetails = (siteId: number): SiteDetails => ({
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
});

export const useSiteDetails = (siteId: number, filter: TimeFilter, range?: DateRange) => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<SiteDetails>(() => createEmptySiteDetails(siteId));
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
        
        console.log('Calling API with params:', {
          siteId,
          filter,
          dateParams
        });
        
        const apiData = await getSiteDashboardData(
          siteId,
          dateParams.isLast7Days,
          dateParams.isLast30Days,
          dateParams.startDate,
          dateParams.endDate
        );

        console.log('API response received:', apiData);

        if (active) {
          // Transform API data to SiteDetails format
          // Combine timestamps with water level and flow data
          const timestamps = apiData.waterLevel.timestamps;
          const uswl = apiData.waterLevel.uswl;
          const dswl = apiData.waterLevel.dswl;
          const flow = apiData.waterLevel.flow;

          // Create time series data
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
          
          console.log('useSiteDetails - Pump station data check:', {
            hasPumpStation: !!apiData.pumpStation,
            numPumps: apiData.pumpStation?.numPumps,
            pumpDetailsLength: apiData.pumpStation?.pumpDetails?.length,
            pumpDetails: apiData.pumpStation?.pumpDetails
          });
          
          if (apiData.pumpStation && apiData.pumpStation.pumpDetails.length > 0) {
            // Get the latest pump details (last entry)
            const latestPumpData = apiData.pumpStation.pumpDetails[apiData.pumpStation.pumpDetails.length - 1];
            
            // Create pump metrics for each pump
            const pumps = [];
            for (let i = 1; i <= apiData.pumpStation.numPumps; i++) {
              const pumpKey = `p${i}` as 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6';
              pumps.push({
                pumpNumber: i,
                operatingHours: latestPumpData[`${pumpKey}Time` as keyof typeof latestPumpData] as number || 0,
                totalFlow: latestPumpData[`${pumpKey}Flow` as keyof typeof latestPumpData] as number || 0,
              });
            }

            pumpStationDetails = { pumps };
            
            // Transform pump details time series for the chart
            pumpFlowTimeSeries = apiData.pumpStation.pumpDetails.map(detail => ({
              timestamp: detail.timestamp,
              totalFlow: detail.totalFlow,
              p1Flow: detail.p1Flow,
              p2Flow: detail.p2Flow,
              p3Flow: detail.p3Flow,
              p4Flow: detail.p4Flow,
              p5Flow: detail.p5Flow,
              p6Flow: detail.p6Flow,
            }));
            
            console.log('useSiteDetails - Transformed pump data:', {
              pumpStationDetails,
              pumpFlowTimeSeries
            });
          }

          const transformedData: SiteDetails = {
            site: {
              siteId: siteId.toString(),
              siteName: apiData.siteNameEn,
              siteArabicName: apiData.siteNameAr,
              position: 0, // Not provided by API
              upstream: latestUpstream,
              downstream: latestDownstream,
              batteryVoltage: 12.5, // Not provided by API
              flowRate: latestFlow,
              status: "active", // API doesn't provide alarm events in this response
              lastReading: lastReadingTime,
              coordinates: [0, 0], // Not provided by API
              governorate: apiData.directorateEn,
              governorateArabicName: apiData.directorateAr,
              branch: "Ibrahimiya", // Not provided by API
            },
            series,
            hourlyReadings: series,
            dailyReadings: series,
            events: [], // API doesn't provide alarm events in this response
            pumpStationDetails,
            pumpFlowTimeSeries,
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
