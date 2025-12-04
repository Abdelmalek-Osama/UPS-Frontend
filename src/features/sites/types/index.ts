export interface Site {
  id: number;
  name: string;
  siteType: 'WaterLevel' | 'Pumps';
  directorateName: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline';
  flowCalcMethod?: 'Formula' | 'HQCurve';
  code?: string;
  canal?: string;
  hasUS?: boolean;
  hasDS1?: boolean;
  hasDS2?: boolean;
  numPumps?: number;
}

export interface SiteFilters {
  searchTerm: string;
  type: string;
  directorate: string;
  canal: string;
  directorateId?: string;
  siteId?: string;
}
