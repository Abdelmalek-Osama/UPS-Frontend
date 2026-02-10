import { useEffect, useState } from "react";
import { useUPSAuth } from "../contexts/UPSAuthContext";
import { getDashboardSites } from "../api/upsApi";
import type { SiteSummary, SiteStatus } from "../types";

/**
 * Hook to fetch dashboard sites for GIS map
 * Transforms backend DashboardSiteDto to frontend SiteSummary format
 */
export const useDashboardSites = () => {
  const { isAuthenticated } = useUPSAuth();
  const [sites, setSites] = useState<SiteSummary[]>([]);
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
            setSites([]);
            setError('Please log in to view sites');
          }
        } else {
          try {
            const dashboardSites = await getDashboardSites();
            
            if (active && dashboardSites) {
              // Transform DashboardSiteDto to SiteSummary
              const transformedSites: SiteSummary[] = dashboardSites.map((site) => {
                // Determine site status based on latest reading
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
                  branch: ''
                };
              });

              setSites(transformedSites);
            } else if (active) {
              setSites([]);
              setError('Failed to load sites from API');
            }
          } catch (apiError) {
            console.error('Error fetching dashboard sites:', apiError);
            if (active) {
              setSites([]);
              setError('Failed to load sites from API');
            }
          }
        }
      } catch (error) {
        if (active) {
          setError(error instanceof Error ? error.message : 'Failed to load sites');
          setSites([]);
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
  }, [isAuthenticated]);

  return { sites, loading, error };
};
