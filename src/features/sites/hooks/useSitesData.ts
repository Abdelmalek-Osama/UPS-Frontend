import { useState, useEffect } from 'react';
import type { Site, SiteFilters } from '../types';
import apiService from '../../../../src/shared/utils/apiService';

export function useSitesData() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<Site[] | { data: Site[] }>('v1/Sites');
        setSites(Array.isArray(response) ? response : (response as { data: Site[] }).data || []);
      } catch (err) {
        setError('Failed to fetch sites');
        console.error('Error fetching sites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const directorates = Array.from(new Set(sites?.map(site => site.directorateName) || []));

  return { sites, setSites, directorates, loading, error };
}

export function useFilteredSites(sites: Site[], filters: SiteFilters) {
  return sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
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

  useEffect(() => {
    const fetchSite = async () => {
      if (!name || !directorateId || !type) {
        setSite(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const endpoint = `/Site/by-name-directorate-type?name=${name}&directorateId=${directorateId}&type=${type}`;
        const response = await apiService.get<Site>(endpoint);
        setSite(response);
      } catch (err) {
        setError('Failed to fetch site');
        console.error('Error fetching site by name, directorate, type:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [name, directorateId, type]);

  return { site, loading, error };
}

export function useSiteById(id?: string) {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!id) {
        setSite(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const endpoint = `/Site/${id}`;
        const response = await apiService.get<Site>(endpoint);
        setSite(response);
      } catch (err) {
        setError('Failed to fetch site by ID');
        console.error('Error fetching site by ID:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [id]);

  return { site, loading, error };
}
