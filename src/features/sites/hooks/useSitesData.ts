import { useState, useEffect, useCallback } from 'react';
import type { Site, SiteFilters } from '../types';
import apiService from '../../../../src/shared/utils/apiService';
import { useAuth } from '../../../../src/shared/contexts/AuthContext'; // Import useAuth

export function useSitesData() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext

  useEffect(() => {
    const fetchSites = async (signal?: AbortSignal) => {
      if (!isAuthenticated) {
        setSites([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiService.get<Site[] | { data: Site[] }>('v1/Sites/all', { signal });
        if (!signal?.aborted) {
          setSites(Array.isArray(response) ? response : (response as { data: Site[] }).data || []);
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
    };

    const abortController = new AbortController();
    fetchSites(abortController.signal);
    return () => abortController.abort();
  }, [isAuthenticated]); // Add isAuthenticated to dependency array

  const directorates = Array.from(new Set(sites?.map(site => site.directorateName) || []));

  return { sites, setSites, directorates, loading, error };
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
    const matchesDirectorate = filters.directorate === 'all' || site.directorateName === filters.directorate;
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
