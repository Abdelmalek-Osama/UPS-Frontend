import { useState, useEffect } from 'react';
import apiService from '../../../shared/utils/apiService';

export interface Directorate {
  id: number;
  name: string;
  arabicName: string;
}

export const useDirectorates = () => {
  const [directorates, setDirectorates] = useState<Directorate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectorates = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get<Directorate[]>('/v1/Lookups/Lookup/Directorates');
        setDirectorates(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching directorates:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch directorates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectorates();
  }, []);

  return { directorates, isLoading, error };
};
