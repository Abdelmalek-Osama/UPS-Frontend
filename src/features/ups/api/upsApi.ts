import { downloadFile, get, post } from "../../../shared/utils/apiService";
import { formatDateForApi, formatDateOnlyForApi } from "../../../lib/utils";
import type {
  DateRange,
  LandingOverview,
  SiteDetails,
  GovernorateOverview,
  MasterOverview,
  ScheduledReport,
  TimeFilter,
  Event,
  EventType,
  EventSeverity,
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
  directorateARName: string;
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

// Site Dashboard Data Response (from /api/v1/Sites/Dashborad/Data)
export interface SiteDashboardDataDto {
  siteNameEn: string;
  siteNameAr: string;
  directorateEn: string;
  directorateAr: string;
  waterLevel: WaterLevelDataDto;
  pumpStation: PumpStationDataDto | null;
}

export interface WaterLevelDataDto {
  timestamps: string[]; // Array of ISO date-time strings
  uswl: number[]; // Upstream water level array
  dswl: number[]; // Downstream water level array
  flow: number[]; // Flow rate array
  metrics: WaterLevelMetricsDto;
}

export interface WaterLevelMetricsDto {
  maxFlow: number;
  minFlow: number;
  avgFlow: number;
  maxUSWL: number;
  maxDSWL: number;
}

export interface PumpStationDataDto {
  numPumps: number;
  pumpDetails: PumpDetailDto[];
}

export interface PumpDetailDto {
  timestamp: string; // ISO date-time
  totalFlow: number;
  p1Time: number;
  p1Flow: number;
  p2Time: number;
  p2Flow: number;
  p3Time: number;
  p3Flow: number;
  p4Time: number;
  p4Flow: number;
  p5Time: number;
  p5Flow: number;
  p6Time: number;
  p6Flow: number;
}

// Site readings API response types
export interface SiteReadingDto {
  siteId: number;
  canalId: number;
  canalOrder: number; // Order within the canal for bar chart display
  siteType: number; // 0 = normal, 1 = pump station
  siteNameEn: string;
  siteNameAr: string;
  status: string; // "Active", "Inactive", etc.
  directorateId?: number; // Directorate ID for filtering
  siteConfiguration: Record<string, unknown>;
  modeMetadata: {
    rangeStart?: string;
    rangeEnd?: string;
    hourStart?: string;
    hourEnd?: string;
  };
  waterAverage?: {
    count: number;
    avgUSWL?: number;
    avgDSWL1?: number;
    avgDSWL2?: number;
    avgCalculatedFlow?: number;
  };
  waterExact?: {
    readingTime: string;
    uswl: number;
    dswL1: number;
    calculatedFlow: number;
  };
  pumpExact?: {
    readingTime: string;
    p1_Flow: number;
    p2_Flow: number;
    p3_Flow: number;
    p4_Flow: number;
    p5_Flow: number;
    p6_Flow: number;
    p7_Flow: number;
    p8_Flow: number;
    p9_Flow: number;
    p10_Flow: number;
  };
  pumpAverage?: {
    count: number;
    avgP1_Flow?: number;
    avgP2_Flow?: number;
    avgP3_Flow?: number;
    avgP4_Flow?: number;
    avgP5_Flow?: number;
    avgP6_Flow?: number;
    avgP7_Flow?: number;
    avgP8_Flow?: number;
    avgP9_Flow?: number;
    avgP10_Flow?: number;
  };
}

export interface SiteReadingsResponse {
  isSuccess: boolean;
  message: string;
  data: SiteReadingDto[];
}

// Lookup Types
export interface LookupItem {
  id: string | number;
  name: string;
  arabicName?: string;
}

export interface LookupResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T[];
}

const UPS_VIEWER_BASE = "/v1/ups-viewer";
const DASHBOARD_BASE = "/v1/dashboard";

const buildTimeParams = (filter: TimeFilter, range?: DateRange) => {
  const params: Record<string, string> = {
    timeFilter: filter,
  };

  if (range?.start) {
    params.startDate = formatDateForApi(range.start);
  }

  if (range?.end) {
    params.endDate = formatDateForApi(range.end);
  }

  if (range?.targetDate) {
    params.targetDate = formatDateForApi(range.targetDate);
  }

  if (range?.targetTime) {
    params.targetTime = range.targetTime;
  }

  return params;
};

// New API: Get dashboard sites for GIS map
export const getDashboardSites = async (): Promise<DashboardSiteDto[]> => {
  const response = await get<UpsApiResponse<DashboardSiteDto[]>>(`${DASHBOARD_BASE}/sites`);
  return response.data;
};

// New API: Get site dashboard data
export const getSiteDashboardData = async (
  siteId: number,
  isLast7Days?: boolean,
  isLast30Days?: boolean,
  startDate?: Date,
  endDate?: Date
): Promise<SiteDashboardDataDto> => {
  const params: Record<string, string> = {
    SiteId: siteId.toString(),
  };

  if (isLast7Days !== undefined) {
    params.IsLast7Days = isLast7Days.toString();
  }
  if (isLast30Days !== undefined) {
    params.IsLast30Days = isLast30Days.toString();
  }
  if (startDate) {
    params.StartDate = formatDateOnlyForApi(startDate);
  }
  if (endDate) {
    params.EndDate = formatDateOnlyForApi(endDate);
  }

  const response = await get<UpsApiResponse<SiteDashboardDataDto>>('/v1/Sites/Dashborad/Data', {
    params,
  });
   console.log("API data for /v1/Sites/Dashborad/Data:", params, response.data);

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

export const getSiteReadingsByCanals = async (
  selectedCanals: number,
  mode: "Average" | "Exact" | "Latest",
  targetDateTime: string,
  startDate: string,
  endDate: string,
): Promise<SiteReadingsResponse> =>
  get<SiteReadingsResponse>('/v1/site-readings/by-canals', {
    params: {
      selectedCanals,
      mode,
      targetDateTime,
      startDate,
      endDate,
    }
  });

export const getScheduledReports = async (): Promise<UpsApiResponse<ScheduledReport[]>> =>
  get<UpsApiResponse<ScheduledReport[]>>(`${UPS_VIEWER_BASE}/reports/schedules`);

export const createScheduledReport = async (
  payload: Omit<ScheduledReport, "id" | "nextRun">,
): Promise<UpsApiResponse<ScheduledReport>> =>
  post<UpsApiResponse<ScheduledReport>>(`${UPS_VIEWER_BASE}/reports/schedules`, payload);

// Lookup API Functions
export const getDirectorates = async (): Promise<LookupItem[]> => {
  const response = await get<LookupItem[]>('/v1/Lookups/Lookup/Directorates');
  return response;
};

export const getSites = async (): Promise<LookupItem[]> => {
  const response = await get<LookupItem[]>('/v1/Lookups/Lookup/Sites');
  return response;
};

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
    params.append("startDate", formatDateForApi(range.start));
  }
  if (range?.end) {
    params.append("endDate", formatDateForApi(range.end));
  }
  if (range?.targetDate) {
    params.append("targetDate", formatDateForApi(range.targetDate));
  }
  if (range?.targetTime) {
    params.append("targetTime", range.targetTime);
  }
  if (siteId) {
    params.append("siteId", siteId);
  }
  if (governorateId) {
    params.append("governorateId", governorateId);
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const filename = `ups-${view}-report-${dateStr}.${format === "pdf" ? "pdf" : "xlsx"}`;
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
    params.append("startDate", formatDateForApi(range.start));
  }
  if (range?.end) {
    params.append("endDate", formatDateForApi(range.end));
  }
  if (range?.targetDate) {
    params.append("targetDate", formatDateForApi(range.targetDate));
  }
  if (range?.targetTime) {
    params.append("targetTime", range.targetTime);
  }
  if (siteIds && siteIds.length > 0) {
    params.append("siteIds", siteIds.join(","));
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const filename = `ups-full-data-${dateStr}.${format === "pdf" ? "pdf" : "xlsx"}`;
  await downloadFile(`${UPS_VIEWER_BASE}/reports/export-full?${params.toString()}`, filename);
};

// New API: Get alarm events for a site with date range filtering
export interface AlarmEventDto {
  id: number;
  alarmId: number;
  alarmName: string;
  siteId: number;
  siteName: string;
  waterLevelReadingId: number;
  fieldName: string;
  thresholdValue: number;
  actualValue?: number; // Optional field
  triggeredAt: string; // ISO date-time string from API
  message: string;
  isResolved: boolean;
  severity: number; // Backend enum: Crisis = 0, Critical = 1, Info = 2
}

// Helper function to map severity number to EventSeverity type
// Backend enum: Crisis = 0, Critical = 1, Info = 2
const mapSeverity = (severity: number): EventSeverity => {
  switch (severity) {
    case 0:
      return 'critical'; // Crisis maps to critical (highest severity)
    case 1:
      return 'high'; // Critical maps to high
    case 2:
      return 'info'; // Info maps to info
    default:
      return 'info';
  }
};

export const getAlarmEventsBySiteAndDateRange = async (
  siteId: number,
  startDate?: Date,
  endDate?: Date
): Promise<Event[]> => {
  const params: Record<string, string> = {};

  if (startDate) {
    params.startDate = formatDateOnlyForApi(startDate);
  }
  if (endDate) {
    params.endDate = formatDateOnlyForApi(endDate);
  }

  try {
    const response = await get<UpsApiResponse<AlarmEventDto[]>>(
      `/v1/alarm-events/site/${siteId}/date-range`,
      { params }
    );
    
    // Check if response.data is an array
    if (!Array.isArray(response.data)) {
      console.error('Expected array but got:', response.data);
      return [];
    }

    // Transform API response to Event type with Date objects
    return response.data.map(event => ({
      id: event.id.toString(),
      siteId: event.siteId.toString(),
      timestamp: new Date(event.triggeredAt),
      type: 'alarm' as EventType, // All events from this endpoint are alarms
      severity: mapSeverity(event.severity),
      message: event.message,
      acknowledged: event.isResolved,
      acknowledgedBy: undefined,
      acknowledgedAt: undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch alarm events:', error);
    return [];
  }
};

// All pump sites daily summary types + API
// timeRangeMode: 0 = Latest (2h), 1 = Last 24h, 2 = Last week, 3 = Last month, 4 = Custom range
export interface AllPumpSitesDailySummaryRequest {
  timeRangeMode: 0 | 1 | 2 | 3 | 4;
  date?: string;
  pageNumber?: number;
  pageSize?: number;
  canalIds?: number[];
  siteIds?: number[];
  unresolvedOnly?: boolean;
  severity?: number;
  wordFilter?: string;
}

export interface PumpSiteDailySummaryItem {
  siteId: number;
  siteName: string;
  siteArabicName?: string;
  numPumps?: number;
  date?: string;
  p1_TimeSum?: number | null;
  p2_TimeSum?: number | null;
  p3_TimeSum?: number | null;
  p4_TimeSum?: number | null;
  p5_TimeSum?: number | null;
  p6_TimeSum?: number | null;
  p7_TimeSum?: number | null;
  p8_TimeSum?: number | null;
  p9_TimeSum?: number | null;
  p10_TimeSum?: number | null;
  totalFlowSum?: number | null;
  readingCount?: number | null;
}

export interface PumpSiteDailySummaryPagedResponse {
  items: PumpSiteDailySummaryItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const getAllPumpSitesDailySummary = async (
  request: AllPumpSitesDailySummaryRequest
): Promise<PumpSiteDailySummaryItem[]> => {
  const params: Record<string, string | number | boolean> = {
    timeRangeMode: request.timeRangeMode,
    pageNumber: request.pageNumber ?? 1,
    pageSize: request.pageSize ?? 100,
  };

  if (request.date) params.date = request.date;
  if (request.canalIds?.length) params.canalIds = request.canalIds.join(',');
  if (request.siteIds?.length) params.siteIds = request.siteIds.join(',');
  if (request.unresolvedOnly !== undefined) params.unresolvedOnly = request.unresolvedOnly;
  if (request.severity !== undefined) params.severity = request.severity;
  if (request.wordFilter) params.wordFilter = request.wordFilter;

  const response = await get<UpsApiResponse<PumpSiteDailySummaryItem[]>>(
    '/v1/readings/pump-station/all-pump-sites/daily-summary',
    { params }
  );
  return response.data ?? [];
};

// New API: Get recent alarm events for landing page
export const getRecentAlarmEvents = async (): Promise<Event[]> => {
  try {
    const response = await get<UpsApiResponse<AlarmEventDto[]>>(
      '/v1/alarm-events/recent'
    );

    console.log('Recent alarm events API response:', response);

    // Check if response.data is an array
    if (!Array.isArray(response.data)) {
      console.error('Expected array but got:', response.data);
      return [];
    }

    // Transform API response to Event type with Date objects
    return response.data.map(event => ({
      id: event.id.toString(),
      siteId: event.siteId.toString(),
      timestamp: new Date(event.triggeredAt),
      type: 'alarm' as EventType,
      severity: mapSeverity(event.severity),
      message: event.message,
      acknowledged: event.isResolved,
      acknowledgedBy: undefined,
      acknowledgedAt: undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch recent alarm events:', error);
    return [];
  }
};
