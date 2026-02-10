import { useState, useEffect, useCallback } from 'react';
import type { Site, SiteFilters } from '../types';
import apiService from '../../../../src/shared/utils/apiService';
import { useAuth } from '../../../../src/shared/contexts/AuthContext'; // Import useAuth

interface Directorate {
  id: number;
  name: string;
  arabicName: string;
}

export function useSitesData() {
  const [sites, setSites] = useState<Site[]>([]);
  const [directorates, setDirectorates] = useState<Directorate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext

  const fetchSitesWithDirectorates = useCallback(async (signal?: AbortSignal) => {
    if (!isAuthenticated) {
      setSites([]);
      setDirectorates([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      
      // Fetch both sites and directorates in parallel
      const [sitesResponse, directoratesResponse] = await Promise.all([
        apiService.get<Site[] | { data: Site[] }>('v1/Sites/all', { signal }),
        apiService.get<Directorate[]>('/v1/Lookups/Lookup/Directorates', { signal })
      ]);
      
      if (!signal?.aborted) {
        const sitesList = Array.isArray(sitesResponse) ? sitesResponse : (sitesResponse as { data: Site[] }).data || [];
        const directoratesList = directoratesResponse || [];
        
        // Map directorate names to IDs
        const sitesWithDirectorateIds = sitesList.map(site => {
          const matchingDirectorate = directoratesList.find(
            d => d.name === site.directorateName || d.arabicName === site.directorateArabicName
          );
          return {
            ...site,
            directorateId: matchingDirectorate?.id || site.directorateId
          };
        });
        
        setSites(sitesWithDirectorateIds);
        setDirectorates(directoratesList);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Fetch aborted
      } else {
        setError((err as Error).message);
        console.error('Error fetching sites:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchSitesWithDirectorates(abortController.signal);
    return () => abortController.abort();
  }, [fetchSitesWithDirectorates]);

  return { sites, setSites, directorates, loading, error, refetch: fetchSitesWithDirectorates };
}

export function useFilteredSites(sites: Site[], filters: SiteFilters) {
  return sites.filter(site => {
    const matchesSearch = (
      site.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (site.code && site.code.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (site.directorateName && site.directorateName.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (site.canal && site.canal.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    );
    const matchesType = filters.type === 'all' || site.siteType === filters.type;
    const matchesDirectorate = filters.directorate === 'all' || site.directorateId?.toString() === filters.directorate;
    const matchesCanal = filters.canal === 'all' || (site.canal && site.canal === filters.canal);
    return matchesSearch && matchesType && matchesDirectorate && matchesCanal;
  });
}

export function useSiteByNameDirectorateType(name?: string, directorateId?: string, type?: string) {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext

  useEffect(() => {
    const fetchSite = async (signal?: AbortSignal) => {
      if (!isAuthenticated || !name || !directorateId || !type) {
        setSite(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const endpoint = `/Site/by-name-directorate-type?name=${name}&directorateId=${directorateId}&type=${type}`;
        const response = await apiService.get<Site>(endpoint, { signal });
        if (!signal?.aborted) {
          setSite(response);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Fetch aborted
        } else {
          setError((err as Error).message);
          console.error('Error fetching site by name, directorate, type:', err);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    };

    const abortController = new AbortController();
    fetchSite(abortController.signal);
    return () => abortController.abort();
  }, [name, directorateId, type, isAuthenticated]); // Add isAuthenticated to dependency array

  return { site, loading, error };
}

export function useSiteById(id?: string) {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext

  useEffect(() => {
    const fetchSite = async (signal?: AbortSignal) => {
      if (!isAuthenticated || !id) {
        setSite(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const endpoint = `/Site/${id}`;
        const response = await apiService.get<Site>(endpoint, { signal });
        if (!signal?.aborted) {
          setSite(response);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Fetch aborted
        } else {
          setError((err as Error).message);
          console.error('Error fetching site by ID:', err);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    };

    const abortController = new AbortController();
    fetchSite(abortController.signal);
    return () => abortController.abort();
  }, [id, isAuthenticated]); // Add isAuthenticated to dependency array

  return { site, loading, error };
}
