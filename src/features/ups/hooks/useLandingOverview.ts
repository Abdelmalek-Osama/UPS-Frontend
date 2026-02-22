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
      
      setLoading(true);
      setError(null);

      try {
        if (!isAuthenticated) {

          if (active) {
            setData(emptyLandingOverview);
            setError('Please log in to view data');
          }
        } else {
         
          try {
            // Try to fetch from the new dashboard sites API first
          
            const dashboardSites = await getDashboardSites();
            
            
            if (active && dashboardSites && dashboardSites.length > 0) {
            
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
                  siteArabicName: site.siteArabicName,
                  position: 0, 
                  upstream: site.latestReading?.uswl ?? 0,
                  downstream: site.latestReading?.dswl ?? 0,
                  batteryVoltage: 0, 
                  flowRate: site.latestReading?.flowRate ?? 0,
                  status,
                  lastReading,
                  coordinates: [site.latitude, site.longitude] as [number, number],
                  governorate: site.directorateName,
                  governorateArabicName: site.directorateARName, // API doesn't provide Arabic directorate name in dashboard sites endpoint
                  branch: '', 
                  // Add date and time for map tooltip
                  date: site.latestReading?.date || '',
                  time: site.latestReading?.time || '',
                } as any;
              });

           

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
         
              if (active) {
                setData(apiData);
              }
            } else {
              
              // Fallback to legacy landing overview API
              const response = await getLandingOverview();
              
              if (active && response?.isSuccess && response.data) {
                setData(response.data);
              } else if (active) {
                
                setData(emptyLandingOverview);
                setError('Failed to load data from API');
              }
            }
          } catch (apiError) {
            
            if (active) {
              setData(emptyLandingOverview);
              setError('Failed to load data from API');
            }
          }
        }
      } catch (error) {

        if (active) {
          setError(error instanceof Error ? error.message : 'Failed to load data');
          setData(emptyLandingOverview);
        }
      } finally {
        if (active) {
          setLoading(false);
         
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
