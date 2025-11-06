import { useState } from 'react';
import type { Site, SiteFilters } from '../types';

export function useSitesData() {
  const [sites, setSites] = useState<Site[]>([
    { id: 1, name: 'مستوى المياه - القاهرة 01', type: 'WaterLevel', directorate: 'القاهرة', location: '30.0444, 31.2357', status: 'online', flowCalcMethod: 'Formula' },
    { id: 2, name: 'محطة الضخ - الجيزة 01', type: 'PumpStation', directorate: 'الجيزة', location: '30.0131, 31.2089', status: 'online' },
    { id: 3, name: 'مستوى المياه - الإسكندرية 01', type: 'WaterLevel', directorate: 'الإسكندرية', location: '31.2001, 29.9187', status: 'offline', flowCalcMethod: 'HQCurve' },
    { id: 4, name: 'محطة الضخ - الدقهلية 02', type: 'PumpStation', directorate: 'الدقهلية', location: '31.0409, 31.3785', status: 'online' },
  ]);

  const directorates = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الفيوم', 'المنيا'];

  return { sites, setSites, directorates };
}

export function useFilteredSites(sites: Site[], filters: SiteFilters) {
  return sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         site.location.includes(filters.searchTerm);
    const matchesType = filters.type === 'all' || site.type === filters.type;
    const matchesDirectorate = filters.directorate === 'all' || site.directorate === filters.directorate;
    return matchesSearch && matchesType && matchesDirectorate;
  });
}
