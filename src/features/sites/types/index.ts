export interface Site {
  id: number;
  name: string;
  type: 'WaterLevel' | 'PumpStation';
  directorate: string;
  location: string;
  status: 'online' | 'offline';
  flowCalcMethod?: 'Formula' | 'HQCurve';
}

export interface SiteFilters {
  searchTerm: string;
  type: string;
  directorate: string;
}
