import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { getGovernorateOverview } from "../api/upsApi";
import { buildDemoGovernorateOverview } from "../data/demoData";
import type { DateRange, GovernorateOverview, TimeFilter } from "../types";

const toGovernorateName = (value: string) => {
  const decoded = decodeURIComponent(value).replace(/-/g, " ");
  return decoded
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
};

export const useGovernorateOverview = (governorateId: string, filter: TimeFilter, range?: DateRange) => {
  const { isAuthenticated } = useAuth();
  const governorateName = useMemo(() => toGovernorateName(governorateId || "Minia"), [governorateId]);
  const [data, setData] = useState<GovernorateOverview>(() => buildDemoGovernorateOverview(governorateName));
  const [loading, setLoading] = useState(true);

  const demoData = useMemo(() => buildDemoGovernorateOverview(governorateName), [governorateName]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      // TODO: Remove this when backend API is ready
      // For now, use demo data - backend endpoint not available yet
      if (active) {
        setData(demoData);
        setLoading(false);
      }
      return;

      // Production code - uncomment when backend is ready
      /*
      if (!isAuthenticated) {
        if (active) {
          setData(demoData);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getGovernorateOverview(governorateId, filter, range);
        if (active && response?.isSuccess && response.data) {
          setData(response.data);
        } else if (active) {
          setData(demoData);
        }
      } catch (error) {
        console.warn("Error fetching governorate overview, using demo data:", error);
        if (active) {
          setData(demoData);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
      */
    };

    if (governorateId) {
      load();
    }

    return () => {
      active = false;
    };
  }, [demoData, governorateId]);

  return { data, loading, governorateName };
};
