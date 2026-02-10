import { downloadFile, get, post } from "../../../shared/utils/apiService";
import type {
  DateRange,
  LandingOverview,
  SiteDetails,
  GovernorateOverview,
  MasterOverview,
  ScheduledReport,
  TimeFilter,
} from "../types";

export interface UpsApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

// Backend API response types based on OpenAPI spec
export interface DashboardSiteDto {
  siteId: number;
  siteName: string;
  siteArabicName: string;
  latitude: number;
  longitude: number;
  directorateName: string;
  latestReading: LatestReadingDto;
}

export interface LatestReadingDto {
  date: string; // ISO date format
  time: string; // ISO time format
  uswl: number | null;
  dswl: number | null;
  flowRate: number | null;
  pumpStatus: string | null;
  hasActiveAlarms: boolean;
}

const UPS_VIEWER_BASE = "/v1/ups-viewer";
const DASHBOARD_BASE = "/v1/dashboard";

const buildTimeParams = (filter: TimeFilter, range?: DateRange) => {
  const params: Record<string, string> = {
    timeFilter: filter,
  };
  
  if (range?.start) {
    params.startDate = range.start.toISOString();
  }
  
  if (range?.end) {
    params.endDate = range.end.toISOString();
  }
  
  return params;
};

// New API: Get dashboard sites for GIS map
export const getDashboardSites = async (): Promise<DashboardSiteDto[]> => {
  const response = await get<UpsApiResponse<DashboardSiteDto[]>>(`${DASHBOARD_BASE}/sites`);
  return response.data;
};

export const getLandingOverview = async (): Promise<UpsApiResponse<LandingOverview>> =>
  get<UpsApiResponse<LandingOverview>>(`${UPS_VIEWER_BASE}/landing`);

export const getSiteDetails = async (
  siteId: number,
  filter: TimeFilter,
  range?: DateRange,
): Promise<UpsApiResponse<SiteDetails>> =>
  get<UpsApiResponse<SiteDetails>>(`${UPS_VIEWER_BASE}/sites/${siteId}`, {
    params: buildTimeParams(filter, range),
  });

export const getGovernorateOverview = async (
  governorateId: string,
  filter: TimeFilter,
  range?: DateRange,
): Promise<UpsApiResponse<GovernorateOverview>> =>
  get<UpsApiResponse<GovernorateOverview>>(`${UPS_VIEWER_BASE}/governorates/${governorateId}`, {
    params: buildTimeParams(filter, range),
  });

export const getMasterOverview = async (
  filter: TimeFilter,
  range?: DateRange,
): Promise<UpsApiResponse<MasterOverview>> =>
  get<UpsApiResponse<MasterOverview>>(`${UPS_VIEWER_BASE}/master`, {
    params: buildTimeParams(filter, range),
  });

export const getScheduledReports = async (): Promise<UpsApiResponse<ScheduledReport[]>> =>
  get<UpsApiResponse<ScheduledReport[]>>(`${UPS_VIEWER_BASE}/reports/schedules`);

export const createScheduledReport = async (
  payload: Omit<ScheduledReport, "id" | "nextRun">,
): Promise<UpsApiResponse<ScheduledReport>> =>
  post<UpsApiResponse<ScheduledReport>>(`${UPS_VIEWER_BASE}/reports/schedules`, payload);

export const exportReport = async (
  view: "landing" | "site" | "governorate" | "master",
  format: "pdf" | "excel",
  filter: TimeFilter,
  range?: DateRange,
  siteId?: string,
  governorateId?: string,
) => {
  const params = new URLSearchParams({
    view,
    format,
    timeFilter: filter,
  });
  
  if (range?.start) {
    params.append("startDate", range.start.toISOString());
  }
  if (range?.end) {
    params.append("endDate", range.end.toISOString());
  }
  if (siteId) {
    params.append("siteId", siteId);
  }
  if (governorateId) {
    params.append("governorateId", governorateId);
  }

  const filename = `ups-${view}-report-${new Date().toISOString().split('T')[0]}.${format === "pdf" ? "pdf" : "xlsx"}`;
  await downloadFile(`${UPS_VIEWER_BASE}/reports/export?${params.toString()}`, filename);
};

export const exportFullData = async (
  format: "pdf" | "excel",
  filter: TimeFilter,
  range?: DateRange,
  siteIds?: string[],
) => {
  const params = new URLSearchParams({
    scope: "full-data",
    format,
    timeFilter: filter,
  });
  
  if (range?.start) {
    params.append("startDate", range.start.toISOString());
  }
  if (range?.end) {
    params.append("endDate", range.end.toISOString());
  }
  if (siteIds && siteIds.length > 0) {
    params.append("siteIds", siteIds.join(","));
  }

  const filename = `ups-full-data-${new Date().toISOString().split('T')[0]}.${format === "pdf" ? "pdf" : "xlsx"}`;
  await downloadFile(`${UPS_VIEWER_BASE}/reports/export-full?${params.toString()}`, filename);
};
