import { useEffect, useState } from "react";
import { getWaterLevelReadings } from "../api/upsApi";
import type { WaterLevelReading } from "../api/upsApi";

export interface UseWaterLevelReadingsResult {
  readings: WaterLevelReading[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWaterLevelReadings(
  siteId: number
): UseWaterLevelReadingsResult {
  const [readings, setReadings] = useState<WaterLevelReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReadings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWaterLevelReadings(siteId);
 
      setReadings(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch water level readings');
      setError(error);
      console.error('Failed to fetch water level readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [siteId]);

  return { readings, loading, error, refetch: fetchReadings };
}
