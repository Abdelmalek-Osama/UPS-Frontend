import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { getSiteDetails } from "../api/upsApi";
import { buildDemoSiteDetails } from "../data/demoData";
import type { DateRange, SiteDetails, TimeFilter } from "../types";

export const useSiteDetails = (siteId: number, filter: TimeFilter, range?: DateRange) => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<SiteDetails>(() => buildDemoSiteDetails(siteId));
  const [loading, setLoading] = useState(true);

  const demoData = useMemo(() => buildDemoSiteDetails(siteId), [siteId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      
      // Always use demo data for now
      if (active) {
        setData(demoData);
        setLoading(false);
      }
    };

    if (siteId) {
      load();
    }

    return () => {
      active = false;
    };
  }, [demoData, filter, isAuthenticated, range?.end, range?.start, siteId]);

  return { data, loading };
};
