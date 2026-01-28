/**
 * Alarm Reports Configuration Types
 */

export interface AlarmReportFilter {
  alarmId?: number | null;
  siteId?: number | null;
  pumpStationId?: number | null;
  fieldName?: string;
  isResolved?: boolean | null;
  severityMin?: string;
  severityMax?: string;
}

export interface AlarmReportConfiguration {
  id: number;
  name: string;
  isEnabled: boolean;
  frequency: 'Daily' | 'Weekly' | 'Hourly';
  scheduledTime?: string; // HH:mm format
  dayOfWeek?: number; // 0-6, only for Weekly
  selectedFields: string[];
  recipients: string[];
  filters: AlarmReportFilter;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlarmReportPayload {
  name: string;
  isEnabled: boolean;
  frequency: 'Daily' | 'Weekly' | 'Hourly';
  scheduledTime: string; // HH:mm format
  dayOfWeek?: number; // 0-6, only for Weekly
  selectedFields: string[];
  recipients: string[];
  filters?: AlarmReportFilter;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export const AVAILABLE_FIELDS = [
  'Id',
  'AlarmId',
  'AlarmName',
  'SiteId',
  'SiteName',
  'WaterLevelReadingId',
  'PumpStationReadingId',
  'FieldName',
  'ActualValue',
  'ThresholdValue',
  'TriggeredAt',
  'Severity',
  'ColorCode',
  'Message',
  'IsResolved'
] as const;

export type AvailableField = typeof AVAILABLE_FIELDS[number];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
] as const;

export const SEVERITY_OPTIONS = ['Critical', 'Warning', 'Info'] as const;
