import { useState, useEffect } from 'react';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import { Site } from '../types';

export interface SiteDetails {
    id: number;
    code: string;
    name: string;
    siteType: string;
    canal: string;
    longitude: number;
    latitude: number;
    directorateName: string;
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
