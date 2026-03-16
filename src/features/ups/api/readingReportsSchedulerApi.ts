import { get, post, put, del } from "../../../shared/utils/apiService";
import type { UpsApiResponse } from "./upsApi";
import type { 
  ReadingsReportSchedulerResponse, 
  ReadingsReportSchedulerConfigRequest, 
  ReadingsReportSchedulerLogResponse 
} from "../types/readingReportsScheduler";

const BASE_URL = "/v1/readings-report-scheduler";

export const getReadingReportsSchedulers = async (): Promise<UpsApiResponse<ReadingsReportSchedulerResponse[]>> => {
  return get<UpsApiResponse<ReadingsReportSchedulerResponse[]>>(BASE_URL);
};

export const getReadingReportsSchedulerById = async (id: number): Promise<UpsApiResponse<ReadingsReportSchedulerResponse>> => {
  return get<UpsApiResponse<ReadingsReportSchedulerResponse>>(`${BASE_URL}/${id}`);
};

export const createReadingReportsScheduler = async (data: ReadingsReportSchedulerConfigRequest): Promise<UpsApiResponse<ReadingsReportSchedulerResponse>> => {
  return post<UpsApiResponse<ReadingsReportSchedulerResponse>>(BASE_URL, data);
};

export const updateReadingReportsScheduler = async (id: number, data: ReadingsReportSchedulerConfigRequest): Promise<UpsApiResponse<ReadingsReportSchedulerResponse>> => {
  return put<UpsApiResponse<ReadingsReportSchedulerResponse>>(`${BASE_URL}/${id}`, data);
};

export const deleteReadingReportsScheduler = async (id: number): Promise<UpsApiResponse<void>> => {
  return del<UpsApiResponse<void>>(`${BASE_URL}/${id}`);
};

export const testReadingReportsScheduler = async (id: number): Promise<UpsApiResponse<void>> => {
  return post<UpsApiResponse<void>>(`${BASE_URL}/${id}/test`);
};

export const getReadingReportsSchedulerLogs = async (id: number, take: number = 50): Promise<UpsApiResponse<ReadingsReportSchedulerLogResponse[]>> => {
  return get<UpsApiResponse<ReadingsReportSchedulerLogResponse[]>>(`${BASE_URL}/${id}/logs`, {
    params: { take }
  });
};
