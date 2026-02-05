import type { 
  Site, 
  SiteData, 
  SiteReading,
  GovernorateData, 
  MasterData, 
  Event, 
  TimeRange, 
  ExportParams,
  SystemKPIs,
  User,
  AggregatedMetrics,
  SiteSummary
} from '../types';

/**
 * Data service interface for UPS Dashboard
 * Provides methods for retrieving and managing UPS system data
 */
export interface DataService {
  /**
   * Get sites accessible to the user based on their roles
   */
  getSites(userRoles: string[], accessibleSiteIds?: string[]): Promise<Site[]>;

  /**
   * Get detailed data for a specific site
   */
  getSiteData(siteId: string, timeRange: TimeRange): Promise<SiteData>;

  /**
   * Get site readings for time series data
   */
  getSiteReadings(siteId: string, timeRange: TimeRange): Promise<SiteReading[]>;

  /**
   * Get aggregated data for a governorate
   */
  getGovernorateData(governorate: string, timeRange: TimeRange, userRoles?: string[]): Promise<GovernorateData>;

  /**
   * Get master data for all sites (admin only)
   */
  getMasterData(timeRange: TimeRange, userRoles?: string[]): Promise<MasterData>;

  /**
   * Get event log for a specific site or all accessible sites
   */
  getEventLog(siteId?: string, timeRange?: TimeRange, userRoles?: string[]): Promise<Event[]>;

  /**
   * Get system KPIs based on accessible sites
   */
  getSystemKPIs(accessibleSiteIds?: string[]): Promise<SystemKPIs>;

  /**
   * Get site summary data for tables and charts
   */
  getSiteSummaries(siteIds?: string[], timeRange?: TimeRange): Promise<SiteSummary[]>;

  /**
   * Calculate aggregated metrics for a set of sites
   */
  calculateAggregatedMetrics(siteIds: string[], timeRange?: TimeRange): Promise<AggregatedMetrics>;

  /**
   * Export data based on parameters
   */
  exportData(params: ExportParams): Promise<Blob>;

  /**
   * Check if service is in demo mode
   */
  isDemoMode(): boolean;

  /**
   * Switch between demo and live data modes
   */
  setDemoMode(enabled: boolean): void;
}