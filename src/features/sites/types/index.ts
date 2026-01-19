export enum DataLoggerType {
  LORA = 'LORA',
  GSM = 'GSM',
  GPRS = 'GPRS',
  WIFI = 'WIFI',
}

export interface Site {
  id: number;
  name: string;
  siteName?: string;
  siteType: 'WaterLevel' | 'Pumps';
  directorateName: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline';
  flowCalcMethod?: 'Formula' | 'HQCurve';
  code?: string;
  canal?: string;
  location?: string;
  dataLoggerType?: DataLoggerType;
  simId?: string;
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
