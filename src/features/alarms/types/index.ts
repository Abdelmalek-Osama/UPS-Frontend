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
  recipients: string[];
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
  siteName: string;
  alarmName: string;
  alarmType: number;
  emails: string;
  phones: string;
  method: number;
  communicationLossId: number;
  severity: number;
  numHours: number;
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
  emails: string;
  phones: string;
  method: number;
  communicationLoss: {
    severity: number;
    numHours: number;
  };
}
