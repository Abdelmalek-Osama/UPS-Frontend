import { useEffect, useState, useCallback } from "react";
import { getDirectorates } from "../api/upsApi";
import type { LookupItem } from "../api/upsApi";

interface UseDirectoratesListReturn {
  directorates: LookupItem[];
  loading: boolean;
  error: string | null;
}

export const useDirectoratesList = (): UseDirectoratesListReturn => {
  const [directorates, setDirectorates] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectorates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDirectorates();
      setDirectorates(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch directorates";
      setError(errorMessage);
      setDirectorates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectorates();
  }, [fetchDirectorates]);

  return { directorates, loading, error };
};
