export interface ValueThresholdAlarm {
  id: number;
  site: string;
  field: string;
  operator: string;
  threshold: number;
  color: string;
  severity: 'Warning' | 'Critical';
  recipients: string[];
}

export interface CommunicationAlarm {
  id: number;
  site: string;
  hours: number;
  recipients: string[];
}
