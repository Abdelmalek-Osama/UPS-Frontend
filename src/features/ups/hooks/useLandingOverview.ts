import { useEffect, useState } from "react";
import { useUPSAuth } from "../contexts/UPSAuthContext";
import { getLandingOverview } from "../api/upsApi";
import { demoLandingOverview, demoSites, demoEvents } from "../data/demoData";
import { kpiService } from "../services/KPIService";
import type { LandingOverview } from "../types";

export const useLandingOverview = () => {
  const { user, isAuthenticated } = useUPSAuth();
  const [data, setData] = useState<LandingOverview>(demoLandingOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!isAuthenticated) {
          // Use demo data with calculated KPIs for unauthenticated users
          const sitesForKPI = demoSites.map(site => ({
            id: site.siteId,
            name: site.siteName,
            coordinates: site.coordinates,
            status: site.status,
            governorate: site.governorate,
            branch: site.branch,
            position: site.position,
          }));
          const calculatedKPIs = kpiService.calculateKPIs(sitesForKPI, demoEvents, null);
          const demoData: LandingOverview = {
            kpis: calculatedKPIs,
            sites: demoSites,
            recentEvents: demoEvents.slice(0, 10),
          };
          if (active) {
            setData(demoData);
          }
        } else {
          try {
            const response = await getLandingOverview();
            if (active && response?.isSuccess && response.data) {
              setData(response.data);
            } else {
              // Fallback to demo data with user-specific KPIs
              const sitesForKPI = demoSites.map(site => ({
                id: site.siteId,
                name: site.siteName,
                coordinates: site.coordinates,
                status: site.status,
                governorate: site.governorate,
                branch: site.branch,
                position: site.position,
              }));
              const calculatedKPIs = kpiService.calculateKPIs(sitesForKPI, demoEvents, user);
              const fallbackData: LandingOverview = {
                kpis: calculatedKPIs,
                sites: demoSites,
                recentEvents: demoEvents.slice(0, 10),
              };
              if (active) {
                setData(fallbackData);
              }
            }
          } catch (apiError) {
            // Use demo data with user-specific KPIs on API failure
            const sitesForKPI = demoSites.map(site => ({
              id: site.siteId,
              name: site.siteName,
              coordinates: site.coordinates,
              status: site.status,
              governorate: site.governorate,
              branch: site.branch,
              position: site.position,
            }));
            const calculatedKPIs = kpiService.calculateKPIs(sitesForKPI, demoEvents, user);
            const fallbackData: LandingOverview = {
              kpis: calculatedKPIs,
              sites: demoSites,
              recentEvents: demoEvents.slice(0, 10),
            };
            if (active) {
              setData(fallbackData);
              setError('Using demo data - API unavailable');
            }
          }
        }
      } catch (error) {
        if (active) {
          setError(error instanceof Error ? error.message : 'Failed to load data');
          setData(demoLandingOverview);
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
