export interface WaterLevelReading {
  id: number;
  site: string;
  timestamp: string;
  uswl: number;
  dswl: number;
  battery: number;
  calculatedFlow: number;
  hasAlarm: boolean;
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
