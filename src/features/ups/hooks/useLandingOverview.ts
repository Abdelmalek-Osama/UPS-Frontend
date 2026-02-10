import { useEffect, useState } from "react";
import { useUPSAuth } from "../contexts/UPSAuthContext";
import { getLandingOverview, getDashboardSites } from "../api/upsApi";
import { kpiService } from "../services/KPIService";
import type { LandingOverview, SiteSummary, SiteStatus } from "../types";

const emptyLandingOverview: LandingOverview = {
  kpis: {
    totalSites: 0,
    activeSites: 0,
    inactiveSites: 0,
    urgentAlarms: 0,
    totalAlarms: 0,
    avgFlowRate: 0,
    totalFlowRate: 0,
    avgBatteryLevel: 0,
    lastUpdated: new Date(),
  },
  sites: [],
  recentEvents: [],
};

export const useLandingOverview = () => {
  const { user, isAuthenticated } = useUPSAuth();
  const [data, setData] = useState<LandingOverview>(emptyLandingOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      console.log('useLandingOverview - Starting load, isAuthenticated:', isAuthenticated);
      setLoading(true);
      setError(null);

      try {
        if (!isAuthenticated) {
          console.log('useLandingOverview - User not authenticated');
          if (active) {
            setData(emptyLandingOverview);
            setError('Please log in to view data');
          }
        } else {
          console.log('useLandingOverview - User authenticated, fetching data');
          try {
            // Try to fetch from the new dashboard sites API first
            console.log('useLandingOverview - Calling getDashboardSites()');
            const dashboardSites = await getDashboardSites();
            console.log('useLandingOverview - getDashboardSites response:', dashboardSites);
            console.log('useLandingOverview - Response type:', typeof dashboardSites);
            console.log('useLandingOverview - Is array?', Array.isArray(dashboardSites));
            console.log('useLandingOverview - Response keys:', dashboardSites ? Object.keys(dashboardSites) : 'null');
            
            if (active && dashboardSites && dashboardSites.length > 0) {
              console.log('useLandingOverview - Transforming', dashboardSites.length, 'sites');
              // Transform dashboard sites to SiteSummary format
              const transformedSites: SiteSummary[] = dashboardSites.map((site) => {
                // Determine site status
                let status: SiteStatus = 'inactive';
                if (site.latestReading) {
                  if (site.latestReading.hasActiveAlarms) {
                    status = 'alarm';
                  } else if (site.latestReading.uswl !== null || site.latestReading.dswl !== null) {
                    status = 'active';
                  }
                }

                // Combine date and time for lastReading
                const lastReading = site.latestReading?.date && site.latestReading?.time
                  ? new Date(`${site.latestReading.date}T${site.latestReading.time}`)
                  : new Date();

                return {
                  siteId: site.siteId.toString(),
                  siteName: site.siteName,
                  position: 0, 
                  upstream: site.latestReading?.uswl ?? 0,
                  downstream: site.latestReading?.dswl ?? 0,
                  batteryVoltage: 0, 
                  flowRate: site.latestReading?.flowRate ?? 0,
                  status,
                  lastReading,
                  coordinates: [site.latitude, site.longitude] as [number, number],
                  governorate: site.directorateName,
                  branch: '', 
                  // Add date and time for map tooltip
                  date: site.latestReading?.date || '',
                  time: site.latestReading?.time || '',
                } as any;
              });

              console.log('useLandingOverview - Transformed sites:', transformedSites);

              // Calculate KPIs from transformed sites
              const sitesForKPI = transformedSites.map(site => ({
                id: site.siteId,
                name: site.siteName,
                coordinates: site.coordinates,
                status: site.status,
                governorate: site.governorate,
                branch: site.branch,
                position: site.position,
              }));
              const calculatedKPIs = kpiService.calculateKPIs(sitesForKPI, [], user);
              
              const apiData: LandingOverview = {
                kpis: calculatedKPIs,
                sites: transformedSites,
                recentEvents: [],
              };
              
              console.log('useLandingOverview - Setting data with', transformedSites.length, 'sites');
              if (active) {
                setData(apiData);
              }
            } else {
              console.log('useLandingOverview - No sites from dashboard API, trying legacy API');
              // Fallback to legacy landing overview API
              const response = await getLandingOverview();
              console.log('useLandingOverview - Legacy API response:', response);
              if (active && response?.isSuccess && response.data) {
                setData(response.data);
              } else if (active) {
                console.log('useLandingOverview - Legacy API failed, setting empty data');
                setData(emptyLandingOverview);
                setError('Failed to load data from API');
              }
            }
          } catch (apiError) {
            console.error('useLandingOverview - API Error:', apiError);
            if (active) {
              setData(emptyLandingOverview);
              setError('Failed to load data from API');
            }
          }
        }
      } catch (error) {
        console.error('useLandingOverview - Unexpected error:', error);
        if (active) {
          setError(error instanceof Error ? error.message : 'Failed to load data');
          setData(emptyLandingOverview);
        }
      } finally {
        if (active) {
          setLoading(false);
          console.log('useLandingOverview - Load complete');
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, user]);

  return { data, loading, error };
};
