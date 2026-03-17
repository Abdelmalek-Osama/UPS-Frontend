export interface ReadingsReportSchedulerResponse {
  id: number;
  name: string;
  isEnabled: boolean;
  directorateId: number;
  siteIds: number[];
  startTime: string;
  intervalHours: number;
  recipients: string[];
  createdAt?: string;
}

export interface ReadingsReportSchedulerConfigRequest {
  id?: number;
  name: string;
  isEnabled: boolean;
  directorateId: number;
  siteIds: number[];
  startTime: string;
  intervalHours: number;
  recipients: string[];
}

export interface ReadingsReportSchedulerLogResponse {
  id: number;
  schedulerId: number;
  status: string;
  message: string;
  executionTime: string;
}
