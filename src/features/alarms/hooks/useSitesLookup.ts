import { useState, useEffect } from 'react';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import { Site } from '../types';

export interface SiteDetails {
    id: number;
    code: string;
    name: string;
    arabicName: string;
    siteType: string;
    canal: string;
    longitude: number;
    latitude: number;
    directorateName: string;
    directorateArabicName: string;
    hasUS: boolean;
    hasDS1: boolean;
    hasDS2: boolean;
    numPumps: number;
}

export const useSitesLookup = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setSitesLoading(true);
        const response = await apiService.get<Site[]>('/v1/Lookups/Lookup/Sites');
        setSites(response);
      } catch (error) {
        setSitesError(error instanceof Error ? error.message : 'Failed to fetch sites');
      } finally {
        setSitesLoading(false);
      }
    };
    fetchSites();
  }, []);

  return { sites, sitesLoading, sitesError };
};

/**
 * Hook to fetch sites with pump filtering capability
 * Combines lookup API (for fast list) with full sites API (for configuration)
 * Filters to only return sites that have pumps (numPumps > 0)
 */
export const useSitesLookupWithPumpFilter = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitesWithPumpFilter = async () => {
      try {
        setSitesLoading(true);
        
        // Fetch both lookup and full sites data in parallel
        const [lookupSites, fullSites] = await Promise.all([
          apiService.get<Site[]>('/v1/Lookups/Lookup/Sites'),
          apiService.get<SiteDetails[] | { data: SiteDetails[] }>('v1/Sites/all')
        ]);

        // Handle both array and {data: array} response formats
        const fullSitesArray = Array.isArray(fullSites) 
          ? fullSites 
          : (fullSites as { data: SiteDetails[] }).data || [];

        // Create a map of site IDs to their pump count
        const sitesPumpMap = new Map<number, number>();
        fullSitesArray.forEach(site => {
          sitesPumpMap.set(site.id, site.numPumps || 0);
        });

        // Filter lookup sites to only include those with pumps
        const filteredSites = lookupSites.filter(site => {
          const numPumps = sitesPumpMap.get(site.id) || 0;
          return numPumps > 0;
        });

        setSites(filteredSites);
      } catch (error) {
        setSitesError(error instanceof Error ? error.message : 'Failed to fetch sites');
        console.error('Error fetching sites with pump filter:', error);
      } finally {
        setSitesLoading(false);
      }
    };
    
    fetchSitesWithPumpFilter();
  }, []);

  return { sites, sitesLoading, sitesError };
};
