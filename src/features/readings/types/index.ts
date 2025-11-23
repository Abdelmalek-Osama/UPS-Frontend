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
  timePerHour?: number;
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

export interface Alarm {
  alarmId: number;
  fieldName: string;
  colorCode: string;
  message: string;
  thresholdValue: number;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface PumpStationReading {
  id: number;
  site: string;
  siteId?: number;
  timestamp: string;
  timePerHour?: number;
  recordNumber: number;
  usLevel?: number;
  ds1Level?: number;
  ds2Level?: number;
  pumps: PumpData[];
  totalUptime: number;
  totalFlow: number;
  hasAlarm: boolean;
  isManual: boolean;
  alarms?: Alarm[];
}

export interface CreatePumpStationReadingRequest {
  siteId: number;
  timestamp: string;
  recordNumber: number;
  timePerHour: number;
  usLevel?: number;
  ds1Level?: number;
  ds2Level?: number;
  p1_Time: number;
  p1_Flow: number;
  p2_Time: number;
  p2_Flow: number;
  p3_Time: number;
  p3_Flow: number;
  p4_Time: number;
  p4_Flow: number;
  p5_Time: number;
  p5_Flow: number;
  p6_Time: number;
  p6_Flow: number;
  p7_Time: number;
  p7_Flow: number;
  p8_Time: number;
  p8_Flow: number;
  p9_Time: number;
  p9_Flow: number;
  p10_Time: number;
  p10_Flow: number;
  totalUptime: number;
  totalFlow: number;
  isManual: boolean;
}

export interface PumpStationApiResponse {
  id: number;
  siteId: number;
  siteName: string;
  timestamp: string;
  timePerHour: number;
  recordNumber: number;
  usLevel?: number;
  ds1Level?: number;
  ds2Level?: number;
  p1_Time: number;
  p1_Flow: number;
  p2_Time: number;
  p2_Flow: number;
  p3_Time: number;
  p3_Flow: number;
  p4_Time: number;
  p4_Flow: number;
  p5_Time: number;
  p5_Flow: number;
  p6_Time: number;
  p6_Flow: number;
  p7_Time: number;
  p7_Flow: number;
  p8_Time: number;
  p8_Flow: number;
  p9_Time: number;
  p9_Flow: number;
  p10_Time: number;
  p10_Flow: number;
  totalUptime: number;
  totalFlow: number;
  isManual: boolean;
  alarms?: Alarm[];
}
