import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { getSiteReadingsByCanals } from "../api/upsApi";
import type { DateRange, GovernorateOverview, TimeFilter, SiteSummary } from "../types";

const toGovernorateName = (value: string) => {
  const decoded = decodeURIComponent(value).replace(/-/g, " ");
  return decoded
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
};

const getCanalName = (canalId: number): string => {
  return canalId === 0 ? "Ibrahimiya" : "Bahr Youssef";
};

const getDateRange = (filter: TimeFilter, range?: DateRange): { startDate: Date; endDate: Date } => {
  const today = new Date();
  
  switch (filter) {
    case "latest":
      return { startDate: today, endDate: today };
    case "24h": {
      const start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { startDate: start, endDate: today };
    }
    case "specific":
      if (range?.targetDate) {
        return { startDate: range.targetDate, endDate: range.targetDate };
      }
      return { startDate: today, endDate: today };
    case "week": {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return { startDate: start, endDate: today };
    }
    case "month": {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return { startDate: start, endDate: today };
    }
    case "custom":
      if (range?.start && range?.end) {
        return { startDate: range.start, endDate: range.end };
      }
      return { startDate: today, endDate: today };
    default:
      return { startDate: today, endDate: today };
  }
};

const buildDateTime = (date: Date, time?: string): string => {
  // Use local date components to avoid timezone conversion issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const timeStr = time || "00:00";
  return `${dateStr}T${timeStr}:00.000Z`;
};

export const useGovernorateOverview = (governorateId: string, filter: TimeFilter, range?: DateRange) => {
  const { isAuthenticated } = useAuth();
  const governorateName = useMemo(() => toGovernorateName(governorateId || "Minia"), [governorateId]);
  const [data, setData] = useState<GovernorateOverview>({
    governorateName,
    branches: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        if (active) {
          setError("User not authenticated");
          setLoading(false);
        }
        return;
      }

      try {
        const { startDate, endDate } = getDateRange(filter, range);
        
        // Build date/time strings for API
        const mode = (filter === "latest" || filter === "specific") ? "Exact" : "Average";
        
        // Time selection based on filter type
        let startTime: string | undefined;
        let endTime: string | undefined;
        
        if (filter === "specific") {
          // Use the specific date and time selected by the user
          startTime = range?.targetTime || "00:00";
          endTime = range?.targetTime || "00:00";
        } else if (filter === "custom") {
          // Use the custom range times
          startTime = range?.startTime || "00:00";
          endTime = range?.endTime || "23:59";
        } else {
          // For latest, week, month
          startTime = "00:00";
          endTime = "23:59";
        }
        
        const targetDateTime = buildDateTime(startDate, startTime);
        const startDateStr = buildDateTime(startDate, startTime);
        const endDateStr = buildDateTime(endDate, endTime);

        // Fetch data for both canals separately
        const [response0, response1] = await Promise.all([
          getSiteReadingsByCanals(0, mode, targetDateTime, startDateStr, endDateStr),
          getSiteReadingsByCanals(1, mode, targetDateTime, startDateStr, endDateStr)
        ]);

        // Combine responses from both canals
        const response = {
          isSuccess: response0.isSuccess && response1.isSuccess,
          message: response0.isSuccess && response1.isSuccess ? 'Success' : 'One or more requests failed',
          data: [...(response0.data || []), ...(response1.data || [])]
        };

        if (active && response.isSuccess && response.data) {
          
          // Log pump stations specifically
          const pumpStations = response.data.filter((s: any) => s.siteType === 1);
          if (pumpStations.length > 0) {
            console.log('=== Pump Stations Data ===');
            pumpStations.forEach((ps: any) => {
              console.log(`${ps.siteNameEn}:`, {
                siteId: ps.siteId,
                siteType: ps.siteType,
                pumpExact: ps.pumpExact,
                pumpAverage: ps.pumpAverage
              });
            });
          }
          
          // Transform API response to GovernorateOverview structure
          const branches = [0, 1].map(canalId => {
            const canalSites = (response.data || [])
              .filter((site: any) => {
                const matches = site.canalId === canalId;
                return matches;
              })
              .map((site): SiteSummary => {
                // Get water data based on mode
                const waterData = mode === "Exact" ? site.waterExact : site.waterAverage;
                
                // Log pump station data for debugging
                if (site.siteType === 1) {
                  console.log(`Pump Station ${site.siteNameEn}:`, {
                    siteType: site.siteType,
                    pumpExact: site.pumpExact,
                    pumpAverage: site.pumpAverage,
                    mode: mode
                  });
                }
                
                // Extract values with proper field names based on mode
                let upstream = 0;
                let downstream = 0;
                let flowRate = 0;
                
                if (mode === "Exact") {
                  // Exact mode uses direct field names
                  upstream = (waterData as any)?.uswl ?? 0;
                  downstream = (waterData as any)?.dswL1 ?? 0;
                  flowRate = (waterData as any)?.calculatedFlow ?? 0;
                } else {
                  // Average mode uses avg-prefixed field names
                  upstream = (waterData as any)?.avgUSWL ?? 0;
                  downstream = (waterData as any)?.avgDSWL1 ?? 0;
                  flowRate = (waterData as any)?.avgCalculatedFlow ?? 0;
                }

                // For average mode, check if data exists
                const hasData = mode === "Average" ? (waterData as any)?.count > 0 : true;
                
                // Get last reading time from waterData
                const readingTimeStr = (waterData as any)?.readingTime;
                const lastReadingTime = readingTimeStr ? new Date(readingTimeStr) : null;

                return {
                  siteId: site.siteId.toString(),
                  siteName: site.siteNameEn,
                  siteArabicName: site.siteNameAr,
                  position: site.siteId, // Use siteId as position, could be customized
                  canalOrder: site.canalOrder, // Order within the canal for bar chart display
                  upstream: hasData ? upstream : 0,
                  downstream: hasData ? downstream : 0,
                  batteryVoltage: 0, // Not provided by API
                  flowRate: hasData ? flowRate : 0,
                  status: site.status.toLowerCase() === "active" ? "active" : "inactive",
                  lastReading: lastReadingTime,
                  coordinates: [0, 0], // Not provided by API
                  governorate: governorateName,
                  branch: getCanalName(canalId),
                  directorateId: site.directorateId, // Include directorateId from API
                  // Store site configuration for pump detection
                  siteConfiguration: site.siteConfiguration,
                  // Store pump data if available - check both exact and average modes
                  pumpData: (() => {
                    if (mode === "Exact" && site.pumpExact) {
                      return {
                        readingTime: site.pumpExact.readingTime,
                        flows: [
                          site.pumpExact.p1_Flow,
                          site.pumpExact.p2_Flow,
                          site.pumpExact.p3_Flow,
                          site.pumpExact.p4_Flow,
                          site.pumpExact.p5_Flow,
                          site.pumpExact.p6_Flow,
                          site.pumpExact.p7_Flow,
                          site.pumpExact.p8_Flow,
                          site.pumpExact.p9_Flow,
                          site.pumpExact.p10_Flow,
                        ].filter(f => f !== null && f !== undefined && f > 0),
                      };
                    } else if (mode === "Average" && site.pumpAverage) {
                      // Handle average mode pump data if available
                      const pumpAvg = site.pumpAverage;
                      const flows = [
                        pumpAvg.avgP1_Flow,
                        pumpAvg.avgP2_Flow,
                        pumpAvg.avgP3_Flow,
                        pumpAvg.avgP4_Flow,
                        pumpAvg.avgP5_Flow,
                        pumpAvg.avgP6_Flow,
                        pumpAvg.avgP7_Flow,
                        pumpAvg.avgP8_Flow,
                        pumpAvg.avgP9_Flow,
                        pumpAvg.avgP10_Flow,
                      ].filter(f => f !== null && f !== undefined && f > 0);
                      return flows.length > 0 ? {
                        readingTime: new Date().toISOString(),
                        flows
                      } : undefined;
                    }
                    return undefined;
                  })(),
                } as any;
              });

            return {
              name: getCanalName(canalId),
              sites: canalSites,
            };
          });

         

          if (active) {
            setData({ governorateName, branches });
          }
        } else if (active) {
          setError("Failed to fetch site readings");
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to fetch governorate overview");
          console.error("Error fetching site readings:", err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      load();
    }

    return () => {
      active = false;
    };
  }, [governorateId, isAuthenticated, filter, range]);

  return { data, loading, error, governorateName };
};
