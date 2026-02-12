import type { DataService } from './DataService';
import { DemoDataService } from './DemoDataService';
import { LiveDataService } from './LiveDataService';
import { demoDataSet } from '../data/demoData';

/**
 * Configuration for data service
 */
export interface DataServiceConfig {
  mode: 'demo' | 'live';
  apiBaseUrl?: string;
  apiKey?: string;
  enableCaching?: boolean;
  cacheTimeout?: number; // in milliseconds
}

/**
 * Factory for creating data service instances
 * Handles switching between demo and live data modes
 */
export class DataServiceFactory {
  private static instance: DataService | null = null;
  private static config: DataServiceConfig = {
    mode: 'demo',
    enableCaching: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  };

  /**
   * Configure the data service
   */
  static configure(config: Partial<DataServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.instance = null; // Reset instance to apply new config
  }

  /**
   * Get the configured data service instance
   */
  static getInstance(): DataService {
    if (!this.instance) {
      this.instance = this.createService();
    }
    return this.instance;
  }

  /**
   * Switch between demo and live modes
   */
  static switchMode(mode: 'demo' | 'live'): void {
    this.config.mode = mode;
    this.instance = null; // Reset instance to create new service
  }

  /**
   * Check if currently in demo mode
   */
  static isDemoMode(): boolean {
    return this.config.mode === 'demo';
  }

  /**
   * Create a new service instance based on configuration
   */
  private static createService(): DataService {
    if (this.config.mode === 'demo') {
      return new DemoDataService(demoDataSet);
    } else {
      if (!this.config.apiBaseUrl) {
        throw new Error('API base URL is required for live mode');
      }
      return new LiveDataService(this.config.apiBaseUrl, this.config.apiKey);
    }
  }

  /**
   * Create a cached wrapper around the data service
   */
  static createCachedService(baseService: DataService): DataService {
    if (!this.config.enableCaching) {
      return baseService;
    }

    return new CachedDataService(baseService, this.config.cacheTimeout || 5 * 60 * 1000);
  }
}

/**
 * Cached data service wrapper
 * Provides caching layer for performance optimization
 */
class CachedDataService implements DataService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout: number;

  constructor(private baseService: DataService, cacheTimeout: number) {
    this.cacheTimeout = cacheTimeout;
  }

  isDemoMode(): boolean {
    return this.baseService.isDemoMode();
  }

  setDemoMode(enabled: boolean): void {
    this.baseService.setDemoMode(enabled);
    this.clearCache(); // Clear cache when switching modes
  }

  async getSites(userRoles: string[], accessibleSiteIds?: string[]): Promise<any> {
    const key = `sites_${userRoles.join(',')}_${accessibleSiteIds?.join(',') || ''}`;
    return this.getCachedOrFetch(key, () => this.baseService.getSites(userRoles, accessibleSiteIds));
  }

  async getSiteData(siteId: string, timeRange: any): Promise<any> {
    const key = `siteData_${siteId}_${JSON.stringify(timeRange)}`;
    return this.getCachedOrFetch(key, () => this.baseService.getSiteData(siteId, timeRange));
  }

  async getSiteReadings(siteId: string, timeRange: any): Promise<any> {
    const key = `siteReadings_${siteId}_${JSON.stringify(timeRange)}`;
    return this.getCachedOrFetch(key, () => this.baseService.getSiteReadings(siteId, timeRange));
  }

  async getGovernorateData(governorate: string, timeRange: any, userRoles?: string[]): Promise<any> {
    const key = `governorateData_${governorate}_${JSON.stringify(timeRange)}_${userRoles?.join(',') || ''}`;
    return this.getCachedOrFetch(key, () => this.baseService.getGovernorateData(governorate, timeRange, userRoles));
  }

  async getMasterData(timeRange: any, userRoles?: string[]): Promise<any> {
    const key = `masterData_${JSON.stringify(timeRange)}_${userRoles?.join(',') || ''}`;
    return this.getCachedOrFetch(key, () => this.baseService.getMasterData(timeRange, userRoles));
  }

  async getEventLog(siteId?: string, timeRange?: any, userRoles?: string[]): Promise<any> {
    const key = `eventLog_${siteId || 'all'}_${JSON.stringify(timeRange)}_${userRoles?.join(',') || ''}`;
    return this.getCachedOrFetch(key, () => this.baseService.getEventLog(siteId, timeRange, userRoles));
  }

  async getSystemKPIs(accessibleSiteIds?: string[]): Promise<any> {
    const key = `systemKPIs_${accessibleSiteIds?.join(',') || ''}`;
    return this.getCachedOrFetch(key, () => this.baseService.getSystemKPIs(accessibleSiteIds));
  }

  async getSiteSummaries(siteIds?: string[], timeRange?: any): Promise<any> {
    const key = `siteSummaries_${siteIds?.join(',') || ''}_${JSON.stringify(timeRange)}`;
    return this.getCachedOrFetch(key, () => this.baseService.getSiteSummaries(siteIds, timeRange));
  }

  async calculateAggregatedMetrics(siteIds: string[], timeRange?: any): Promise<any> {
    const key = `aggregatedMetrics_${siteIds.join(',')}_${JSON.stringify(timeRange)}`;
    return this.getCachedOrFetch(key, () => this.baseService.calculateAggregatedMetrics(siteIds, timeRange));
  }

  async exportData(params: any): Promise<Blob> {
    // Don't cache export data as it's typically one-time operations
    return this.baseService.exportData(params);
  }

  private async getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  private clearCache(): void {
    this.cache.clear();
  }
}

// Default configuration for development
DataServiceFactory.configure({
  mode: 'demo',
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
});

// Export singleton instance
export const dataService = DataServiceFactory.getInstance();