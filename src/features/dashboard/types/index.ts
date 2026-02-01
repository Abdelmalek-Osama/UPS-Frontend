export interface FlowDataPoint {
  time: string;
  flow: number;
}

export interface DirectorateData {
  name: string;
  sites: number;
  active: number;
}

export interface ActiveAlarm {
  id: number;
  site: string;
  type: 'battery' | 'communication' | 'flow';
  message: string;
  severity: 'Warning' | 'Critical';
  time: string;
}

export interface RecentAlarmEvent {
  id: number;
  alarmName: string;
  siteName: string;
  fieldName: string;
  actualValue?: number;
  thresholdValue?: number;
  severity: 'warning' | 'critical' | 'info';
  colorCode?: string;
  triggeredAt: string;
  message: string;
}

export interface RecentReading {
  site: string;
  type: 'WaterLevel' | 'PumpStation';
  time: string;
  uswl?: number;
  dswl?: number;
  flow?: number;
  totalFlow?: number;
  uptime?: number;
}

export interface ReadingLog {
  id: number;
  site: string;
  type: 'WaterLevel' | 'PumpStation';
  timestamp: string;
  actionType: string;
  uswl?: number;
  dswl?: number;
  calculatedFlow?: number;
  totalFlow?: number;
  uptime?: number;
  isManual?: boolean;
}

export interface DashboardStats {
  totalDirectorates: number;
  totalUsers: number;
  totalSites: number;
  connectedSites: number;
  activeAlarms: number;
  criticalAlarms: number;
  warningAlarms: number;
  totalFlow: number;
  flowChange: number;
  activeStations: number;
  totalStations: number;
  uptimePercentage: number;
}

export interface SiteLookup {
  id: number;
  name: string;
}
