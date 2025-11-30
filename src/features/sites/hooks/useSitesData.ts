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
  console.log('--- Debugging useFilteredSites ---');
  console.log('Search Term (raw):', filters.searchTerm);

  const lowerCaseSearchTerm = filters.searchTerm.toLowerCase();
  console.log('Search Term (lowercase):', lowerCaseSearchTerm);

  return sites.filter(site => {
    // Log individual site properties and their lowercased versions
    console.log('  Processing Site ID:', site.id, 'Name:', site.name);
    const siteNameLower = site.name.toLowerCase();
    const siteCodeLower = site.code?.toLowerCase(); // Use optional chaining for safety
    const directorateNameLower = site.directorateName?.toLowerCase(); // Use optional chaining for safety
    const canalLower = site.canal?.toLowerCase(); // Use optional chaining for safety

    console.log('    Site Name Lowercased:', siteNameLower);
    console.log('    Site Code Lowercased:', site.code, '->', siteCodeLower);
    console.log('    Directorate Name Lowercased:', site.directorateName, '->', directorateNameLower);
    console.log('    Canal Lowercased:', site.canal, '->', canalLower);

    const matchesSearch = (
      siteNameLower.includes(lowerCaseSearchTerm) ||
      (siteCodeLower && siteCodeLower.includes(lowerCaseSearchTerm)) ||
      (directorateNameLower && directorateNameLower.includes(lowerCaseSearchTerm)) ||
      (canalLower && canalLower.includes(lowerCaseSearchTerm))
    );

    const matchesType = filters.type === 'all' || site.siteType === filters.type;
    const matchesDirectorate = filters.directorate === 'all' || site.directorateName === filters.directorate;
    const matchesCanal = filters.canal === 'all' || (site.canal && site.canal === filters.canal);

    console.log('    Condition: matches name:', siteNameLower.includes(lowerCaseSearchTerm));
    console.log('    Condition: matches code:', (siteCodeLower && siteCodeLower.includes(lowerCaseSearchTerm)));
    console.log('    Condition: matches directorate:', (directorateNameLower && directorateNameLower.includes(lowerCaseSearchTerm)));
    console.log('    Condition: matches canal:', (canalLower && canalLower.includes(lowerCaseSearchTerm)));

    console.log('    Matches Search (any field):', matchesSearch);
    console.log('    Matches Type Filter:', matchesType);
    console.log('    Matches Directorate Filter:', matchesDirectorate);
    console.log('    Matches Canal Filter:', matchesCanal);
    console.log('    Overall Site Match:', matchesSearch && matchesType && matchesDirectorate && matchesCanal);

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
