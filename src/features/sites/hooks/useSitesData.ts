import { useState, useEffect, useCallback, useRef } from 'react';
import type { Site, SiteFilters } from '../types';
import apiService from '../../../../src/shared/utils/apiService';
import { useAuth } from '../../../../src/shared/contexts/AuthContext';

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
  const { isAuthenticated, loadingAuth } = useAuth();
  
  // Use a ref to track if we have already attempted the first fetch
  const hasFetched = useRef(false);

  const fetchSitesWithDirectorates = useCallback(async (signal?: AbortSignal) => {
    // If the auth state is not yet confirmed (still loading), keep the loading spinner active and exit.
    if (loadingAuth) return;

    // If we are definitely not authenticated, stop loading and clear data.
    if (!isAuthenticated) {
      setSites([]);
      setDirectorates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [sitesResponse, directoratesResponse] = await Promise.all([
        apiService.get<any>('v1/Sites/all', { signal }),
        apiService.get<any>('/v1/Lookups/Lookup/Directorates', { signal })
      ]);
      
      if (!signal?.aborted) {
        // Robust extraction logic to prevent "Failed to load" if response shape varies
        const sitesList = Array.isArray(sitesResponse) 
          ? sitesResponse 
          : sitesResponse?.data || sitesResponse?.items || [];
          
        const directoratesList = Array.isArray(directoratesResponse)
          ? directoratesResponse
          : directoratesResponse?.data || directoratesResponse?.items || [];
        
        const sitesWithDirectorateIds = sitesList.map((site: any) => {
          const matchingDirectorate = directoratesList.find(
            (d: any) => d.name === site.directorateName || d.arabicName === site.directorateArabicName
          );
          return {
            ...site,
            directorateId: matchingDirectorate?.id || site.directorateId
          };
        });
        
        setSites(sitesWithDirectorateIds);
        setDirectorates(directoratesList);
        hasFetched.current = true;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load sites');
        console.error('Error fetching sites:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, loadingAuth]);

  useEffect(() => {
    const abortController = new AbortController();
    
    // On hard refresh, isAuthenticated might take a moment to flip to true.
    // We only trigger the fetch once the auth state is confirmed.
    if (!loadingAuth && isAuthenticated) {
      fetchSitesWithDirectorates(abortController.signal);
    }
    
    return () => abortController.abort();
  }, [fetchSitesWithDirectorates, isAuthenticated, loadingAuth]);

  return { sites, setSites, directorates, loading, error, refetch: fetchSitesWithDirectorates };
}

export function useFilteredSites(sites: Site[], filters: SiteFilters) {
  return sites.filter(site => {
    const matchesSearch = (
      site.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (site.arabicName && site.arabicName.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (site.code && site.code.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (site.directorateName && site.directorateName.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (site.directorateArabicName && site.directorateArabicName.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
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
