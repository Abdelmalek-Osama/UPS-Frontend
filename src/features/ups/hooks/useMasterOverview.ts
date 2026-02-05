import { useEffect, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { getMasterOverview } from "../api/upsApi";
import { demoMasterOverview } from "../data/demoData";
import type { DateRange, MasterOverview, TimeFilter } from "../types";

export const useMasterOverview = (filter: TimeFilter, range?: DateRange) => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<MasterOverview>(demoMasterOverview);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      if (!isAuthenticated) {
        setData(demoMasterOverview);
        setLoading(false);
        return;
      }

      try {
        const response = await getMasterOverview(filter, range);
        if (active && response?.isSuccess && response.data) {
          setData(response.data);
        } else if (active) {
          setData(demoMasterOverview);
        }
      } catch (error) {
        if (active) {
          setData(demoMasterOverview);
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
  }, [filter, isAuthenticated, range?.end, range?.start]);

  return { data, loading };
};
