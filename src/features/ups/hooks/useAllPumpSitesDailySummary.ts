import { useEffect, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import {
  getAllPumpSitesDailySummary,
  type AllPumpSitesDailySummaryRequest,
  type PumpSiteDailySummaryItem,
} from "../api/upsApi";
import { formatDateOnlyForApi } from "../../../lib/utils";

interface UseAllPumpSitesDailySummaryParams {
  timeRangeMode: 0 | 1 | 2 | 3 | 4;
  date?: Date;
  pageNumber?: number;
  pageSize?: number;
  canalIds?: number[];
  siteIds?: number[];
  wordFilter?: string;
}

export const useAllPumpSitesDailySummary = (params: UseAllPumpSitesDailySummaryParams) => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<PumpSiteDailySummaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canalIdsKey = JSON.stringify(params.canalIds);
  const siteIdsKey = JSON.stringify(params.siteIds);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const request: AllPumpSitesDailySummaryRequest = {
          timeRangeMode: params.timeRangeMode,
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 100,
        };

        if (params.date) {
          request.date = formatDateOnlyForApi(params.date);
        }
        if (params.canalIds?.length) {
          request.canalIds = params.canalIds;
        }
        if (params.siteIds?.length) {
          request.siteIds = params.siteIds;
        }
        if (params.wordFilter) {
          request.wordFilter = params.wordFilter;
        }

        const items = await getAllPumpSitesDailySummary(request);
        if (active) setData(items);
      } catch {
        if (active) setError("Failed to load pump summary data");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    params.timeRangeMode,
    params.date?.getTime(),
    params.pageNumber,
    params.pageSize,
    canalIdsKey,
    siteIdsKey,
    params.wordFilter,
  ]);

  return { data, loading, error };
};
