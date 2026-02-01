export enum DataLoggerType {
  CR350 = 'CR350',
  CR310 = 'CR310',
  CR1000x = 'CR1000x',
}

export interface DataMapping {
  tableName: string;
  folder: string;
  filename: string;
  columnMapping: string;
  headerRowsToSkip?: number;
  priority?: number;
  isActive?: boolean;
}

export interface FlowCalculation {
  formulaConstants: string;
  equationId: number;
}

export interface Site {
  id: number;
  name: string;
  siteName?: string;
  nameAr?: string;
  nameEn?: string;
  siteType: 'WaterLevel' | 'Pumps';
  directorateName: string;
  directorateId?: number;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline';
  flowCalcMethod?: 'Formula' | 'HQCurve';
  code?: string;
  canal?: string;
  location?: string;
  dataLoggerType?: DataLoggerType;
  simId?: string;
  simCardIP?: string;
  hasUS?: boolean;
  hasDS1?: boolean;
  hasDS2?: boolean;
  numPumps?: number;
  dataMappings?: DataMapping[];
  flowCalculation?: FlowCalculation;
}

export interface SiteFilters {
  searchTerm: string;
  type: string;
  directorate: string;
  canal: string;
  directorateId?: string;
  siteId?: string;
}
