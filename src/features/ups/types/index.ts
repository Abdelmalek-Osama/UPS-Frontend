// ============================================================================
// Core Types and Enums
// ============================================================================

export type TimeFilterType = 'week' | 'month' | 'custom';
export type SiteStatus = 'active' | 'inactive' | 'maintenance' | 'alarm';
export type EventType = 'alarm' | 'warning' | 'info' | 'maintenance' | 'system';
export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ReadingStatus = 'normal' | 'warning' | 'alarm';
export type ExportFormat = 'pdf' | 'excel' | 'csv';
export type ExportScope = 'current-view' | 'full-data';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly';

// ============================================================================
// Authentication and User Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  accessibleSites: string[];
  governorate?: string;
  role?: string; // For backward compatibility
  governorateId?: number; // For backward compatibility
  governorateName?: string; // For backward compatibility
  siteIds?: number[]; // For backward compatibility
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: Date;
}

// ============================================================================
// Time and Date Types
// ============================================================================

export interface TimeRange {
  type: TimeFilterType;
  startDate?: Date;
  endDate?: Date;
}

export interface TimeFilterOption {
  value: TimeFilterType;
  label: string;
  description?: string;
}

// ============================================================================
// Site and Location Types
// ============================================================================

export interface Site {
  id: string;
  name: string;
  coordinates: [number, number];
  status: SiteStatus;
  governorate: string;
  branch: string;
  position?: number; // South-to-north ordering
}

export interface SiteReading {
  timestamp: Date;
  upstream: number;
  downstream: number;
  batteryVoltage: number;
  flowRate: number;
  status: ReadingStatus;
}

export interface SiteData {
  siteId: string;
  siteName: string;
  governorate: string;
  branch: string;
  coordinates: [number, number];
  status: SiteStatus;
  readings: SiteReading[];
  lastUpdated: Date;
}

export interface SiteSummary {
  siteId: string;
  siteName: string;
  siteArabicName?: string;
  position: number; // South-to-north ordering
  upstream: number;
  downstream: number;
  batteryVoltage: number;
  flowRate: number;
  status: SiteStatus;
  lastReading: Date;
  coordinates: [number, number];
  governorate: string;
  governorateArabicName?: string;
  branch: string;
}

// ============================================================================
// Aggregated Data Types
// ============================================================================

export interface AggregatedMetrics {
  avgUpstream: number;
  avgDownstream: number;
  avgBatteryVoltage: number;
  totalFlowRate: number;
  activeSites: number;
  totalSites: number;
  alarmCount: number;
}

export interface BranchData {
  branchName: string;
  sites: SiteSummary[];
  metrics: AggregatedMetrics;
}

export interface GovernorateData {
  governorate: string;
  branches: BranchData[];
  summary: AggregatedMetrics;
  timeRange: TimeRange;
}

export interface MasterData {
  sites: SiteSummary[];
  summary: AggregatedMetrics;
  timeRange: TimeRange;
}

// ============================================================================
// KPI and Dashboard Types
// ============================================================================

export interface SystemKPIs {
  totalSites: number;
  activeSites: number;
  inactiveSites: number;
  urgentAlarms: number;
  lastUpdated: Date;
}

// ============================================================================
// Event and Alarm Types
// ============================================================================

export interface Event {
  id: string;
  siteId: string;
  timestamp: Date;
  type: EventType;
  severity: EventSeverity;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// ============================================================================
// Export and Reporting Types
// ============================================================================

export interface ExportParams {
  type: ExportFormat;
  scope: ExportScope;
  timeRange: TimeRange;
  sites?: string[];
  includeCharts?: boolean;
  includeEvents?: boolean;
}

export interface ScheduledReport {
  id: string;
  name: string;
  sites: string[];
  timeRange: TimeRange;
  frequency: ReportFrequency;
  recipients: string[];
  format: ExportFormat;
  isActive: boolean;
  nextRun: Date;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface MapContainerProps {
  sites: Site[];
  onSiteClick: (siteId: string) => void;
  center: [number, number];
  zoom: number;
  className?: string;
}

export interface SiteMarkerProps {
  site: Site;
  onClick: (siteId: string) => void;
  isSelected?: boolean;
}

export interface TimeSeriesData {
  timestamp: string;
  [key: string]: number | string;
}

export interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  dataKeys: string[];
  colors: string[];
  title: string;
  yAxisLabel: string;
  height?: number;
}

export interface BarChartData {
  [key: string]: number | string;
}

export interface BarChartProps {
  data: BarChartData[];
  xAxisKey: string;
  dataKeys: string[];
  colors: string[];
  title: string;
  height?: number;
  sortOrder?: 'asc' | 'desc' | 'geographic';
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pagination?: boolean;
}

export interface TimeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  options: TimeFilterOption[];
}

// ============================================================================
// Page Props Types
// ============================================================================

export interface LandingPageProps {
  sites: Site[];
  kpis: SystemKPIs;
  onSiteSelect: (siteId: string) => void;
}

export interface SitePageProps {
  siteId: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export interface GovernoratePageProps {
  governorate: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export interface MasterPageProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

// ============================================================================
// Demo Data Types
// ============================================================================

export interface GovernorateConfig {
  name: string;
  branches: string[];
  siteIds: string[];
  coordinates: [number, number];
}

export interface DemoDataSet {
  sites: Site[];
  users: User[];
  readings: Map<string, SiteReading[]>; // siteId -> readings
  events: Event[];
  governorates: GovernorateConfig[];
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

export type TimeFilter = TimeFilterType;
export type AlarmSeverity = EventSeverity;

export interface DateRange {
  start?: Date;
  end?: Date;
}

export interface KpiSummary extends SystemKPIs {}

export interface MapPin extends Site {
  numericId: number; // Legacy numeric ID
  lat: number;
  lng: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  upstream: number;
  downstream: number;
  batteryVoltage: number;
  flowRate: number;
}

export interface ReadingRow extends TimeSeriesPoint {}

export interface AlarmEvent {
  id: number;
  siteId: number;
  siteName: string;
  severity: EventSeverity;
  field: string;
  message: string;
  timestamp: string;
  actualValue?: number;
  thresholdValue?: number;
}

export interface LandingOverview {
  kpis: SystemKPIs;
  sites: SiteSummary[];
  recentEvents: Event[];
}

export interface SiteDetails {
  site: SiteSummary;
  series: TimeSeriesPoint[];
  hourlyReadings: ReadingRow[];
  dailyReadings: ReadingRow[];
  events: Event[];
  pumpStationDetails?: PumpStationDetails;
  pumpFlowTimeSeries?: PumpFlowTimeSeriesPoint[];
}

export interface PumpFlowTimeSeriesPoint {
  timestamp: string;
  totalFlow: number;
  p1Flow: number;
  p2Flow: number;
  p3Flow: number;
  p4Flow: number;
  p5Flow: number;
  p6Flow: number;
}

export interface PumpStationDetails {
  pumps: PumpMetrics[];
}

export interface PumpMetrics {
  pumpNumber: number;
  operatingHours: number;
  totalFlow: number;
}

export interface BranchOverview {
  name: string;
  sites: SiteSummary[];
}

export interface GovernorateOverview {
  governorateName: string;
  branches: BranchOverview[];
}

export interface MasterOverview {
  sites: SiteSummary[];
}
