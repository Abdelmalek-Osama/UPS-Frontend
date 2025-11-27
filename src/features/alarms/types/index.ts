export interface Site {
  id: number;
  name: string;
}

export interface ThresholdAlarmForm {
  id: number;
  siteId: number | null;
  alarmName: string;
  site: string;
  field: string;
  operator: string;
  threshold: number;
  color: string;
  severity: 'Warning' | 'Critical';
  emails: string[];
  phones: string[];
}

export interface CommunicationAlarmForm {
  id: number;
  siteId: number | null;
  alarmName: string;
  site: string;
  severity: 'Warning' | 'Critical';
  hours: number;
  emails: string[];
  phones: string[];
}

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

export enum AlarmMethod {
  Email = 0,
  SMS = 1,
}

export enum Severity {
  Warning = 0,
  Critical = 1,
}

export interface CreateThresholdAlarmRequest {
  id: number;
  siteId: number;
  alarmName: string;
  emails: string;
  phones: string;
  method: AlarmMethod;
  valueThreshold: {
    fieldName: number;
    operator: number;
    thresholdValue: number;
    colorCode: string;
    severity: number;
  };
}

export interface CreateCommunicationAlarmRequest {
  id: number;
  siteId: number;
  alarmName: string;
  emails: string;
  phones: string;
  method: AlarmMethod;
  communicationLoss: {
    severity: number;
    numHours: number;
  };
}

export interface EditCommunicationAlarmDialogProps extends AddCommunicationAlarmDialogProps {
  currentAlarm: CommunicationAlarmForm | null;
  hasChanges: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface CommunicationAlarmResponse {
  alarmId: number;
  siteId: number;
  alarmName: string;
  siteName: string;
  severity: Severity;
  numHours: number;
  emails: string;
  phones: string;
}

export interface ValueThresholdAlarm {
  id: number;
  siteId: number;
  alarmName: string;
  site: string;
  field: number;
  operator: number;
  threshold: number;
  color: string;
  severity: string; // Assuming it's a string like 'Warning' or 'Critical'
  recipients: string[]; // Assuming recipients can be an array of strings
}