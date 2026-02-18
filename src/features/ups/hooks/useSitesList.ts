import { useEffect, useState, useCallback } from "react";
import { getSites } from "../api/upsApi";
import type { LookupItem } from "../api/upsApi";

interface UseSitesListReturn {
  sites: LookupItem[];
  loading: boolean;
  error: string | null;
}

export const useSitesList = (): UseSitesListReturn => {
  const [sites, setSites] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSites();
      setSites(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch sites";
      setError(errorMessage);
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  return { sites, loading, error };
};
