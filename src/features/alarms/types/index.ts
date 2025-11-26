export interface ValueThresholdAlarm {
  id: number;
  siteId: number;
  site: string;
  alarmName: string;
  method: number;
  field: string;
  operator: string;
  threshold: number;
  color: string;
  severity: 'Warning' | 'Critical';
  recipients: string[];
}

export interface CommunicationAlarm {
  id: number;
  siteId: number;
  site: string;
  alarmName: string;
  method: number;
  hours: number;
  severity: 'Warning' | 'Critical';
  emails?: string;
  phones?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export enum AlarmMethod {
  Email = 1,
  SMS = 2,
  Both = 3,
}

export enum Severity {
  Critical = 1,
  Major = 2,
  Minor = 3,
  Warning = 4,
}

export interface CommunicationLossDto {
  severity: Severity;
  numHours: number;
}

export interface ThresholdAlarmResponse {
  alarmId: number;
  siteId: number;
  siteName: string;
  alarmName: string;
  alarmType: number;
  emails: string;
  phones: string;
  method: number;
  thresholdId: number;
  fieldName: number;
  operator: number;
  thresholdValue: number;
  colorCode: string;
  severity: number;
}

export interface CommunicationAlarmResponse {
  alarmId: number;
  siteId: number;
  siteName?: string;
  alarmName: string;
  alarmType: "CommunicationLoss";
  emails?: string;
  phones?: string;
  method: AlarmMethod;
  communicationLossId?: number;
  severity?: Severity;
  numHours?: number;
}

export interface ThresholdAlarm extends ValueThresholdAlarm {}
export interface CommunicationLossAlarm extends CommunicationAlarm {}

export interface CreateThresholdAlarmRequest {
  id: number;
  siteId: number;
  alarmName: string;
  emails: string;
  phones: string;
  method: number;
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
  emails?: string;
  phones?: string;
  method: AlarmMethod;
  communicationLoss?: CommunicationLossDto;
}
