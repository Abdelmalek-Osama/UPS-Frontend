export interface SiteLookupOption {
  id: number;
  name: string;
}

export interface SiteConfiguration {
  hasUS: boolean;
  hasDS1: boolean;
  hasDS2: boolean;
  numPumps: number;
}

export interface WaterLevelReading {
  id: number;
  site: string;
  siteId?: number;
  timestamp: string;
  uswl: number;
  dswl: number;
  battery: number;
  calculatedFlow: number;
  hasAlarm: boolean;
  recordNumber?: number;
  isManual?: boolean;
  siteConfiguration?: SiteConfiguration;
}

export interface WaterLevelReadingApiResponse {
  id: number;
  siteId: number;
  siteName: string;
  timestamp: string;
  recordNumber: number;
  uswl: number;
  dswL1: number;
  calculatedFlow: number;
  battery: number;
  isManual: boolean;
  siteConfiguration?: SiteConfiguration;
}

export interface PumpData {
  time: number;
  flow: number;
}

export interface PumpStationReading {
  id: number;
  site: string;
  timestamp: string;
  uswl: number,
  dswl: number,
  battery: number,
  pumps: PumpData[];
  totalUptime: number;
  totalFlow: number;
  hasAlarm: boolean;
}
