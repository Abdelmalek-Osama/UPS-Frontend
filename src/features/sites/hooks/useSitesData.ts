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
        const response = await apiService.get<Site[]>('/Site/all');
        setSites(response);
      } catch (err) {
        setError('Failed to fetch sites');
        console.error('Error fetching sites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const directorates = Array.from(new Set(sites.map(site => site.directorateName)));

  return { sites, setSites, directorates, loading, error };
}

export function useFilteredSites(sites: Site[], filters: SiteFilters) {
  return sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         site.location.includes(filters.searchTerm);
    const matchesType = filters.type === 'all' || site.siteType === filters.type;
    const matchesDirectorate = filters.directorate === 'all' || site.directorateName === filters.directorate;
    const matchesCanal = filters.canal === 'all' || (site.canal && site.canal === filters.canal);
    return matchesSearch && matchesType && matchesDirectorate && matchesCanal;
  });
}
