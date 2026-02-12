import type { 
  Site, 
  SiteData, 
  SiteReading,
  GovernorateData, 
  MasterData, 
  Event, 
  TimeRange,
  DemoDataSet,
  SystemKPIs,
  AggregatedMetrics,
  SiteSummary,
  BranchData,
  ExportParams,
  TimeFilterType
} from '../types';
import type { DataService } from './DataService';
import { 
  demoDataSet, 
  generateSiteReadings, 
  calculateSystemKPIs,
  getSiteById,
  getSitesByGovernorate,
  getEventsBySite,
  demoGovernorateConfigs
} from '../data/demoData';

/**
 * Demo data service implementation
 * Provides realistic demo data for development and testing
 */
export class DemoDataService implements DataService {
  private demoData: DemoDataSet;
  private isDemoModeEnabled: boolean = true;

  constructor(demoData?: DemoDataSet) {
    this.demoData = demoData || demoDataSet;
  }

  isDemoMode(): boolean {
    return this.isDemoModeEnabled;
  }

  setDemoMode(enabled: boolean): void {
    this.isDemoModeEnabled = enabled;
  }

  async getSites(userRoles: string[], accessibleSiteIds?: string[]): Promise<Site[]> {
    let sites = this.demoData.sites;

    // Filter by accessible site IDs if provided
    if (accessibleSiteIds && accessibleSiteIds.length > 0) {
      sites = sites.filter(site => accessibleSiteIds.includes(site.id));
    }

    // Additional role-based filtering
    if (!userRoles.includes('admin') && !userRoles.includes('master')) {
      // Non-admin users get filtered sites based on their roles
      if (userRoles.includes('governorate_viewer')) {
        // Filter by governorate if user has governorate restriction
        const user = this.demoData.users.find(u => 
          u.roles.some(role => userRoles.includes(role))
        );
        if (user?.governorate) {
          sites = sites.filter(site => site.governorate === user.governorate);
        }
      }
    }

    return sites.sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  async getSiteData(siteId: string, timeRange: TimeRange): Promise<SiteData> {
    const site = this.demoData.sites.find(s => s.id === siteId);
    if (!site) {
      throw new Error(`Site with ID ${siteId} not found`);
    }

    const readings = await this.getSiteReadings(siteId, timeRange);
    const events = await this.getEventLog(siteId, timeRange);

    return {
      siteId: site.id,
      siteName: site.name,
      governorate: site.governorate,
      branch: site.branch,
      coordinates: site.coordinates,
      status: site.status,
      readings,
      lastUpdated: new Date(),
    };
  }

  async getSiteReadings(siteId: string, timeRange: TimeRange): Promise<SiteReading[]> {
    const { start, end } = this.getTimeRangeDates(timeRange);
    const interval = this.getTimeRangeInterval(timeRange.type);
    
    return generateSiteReadings(siteId, { start, end, interval });
  }

  async getGovernorateData(governorate: string, timeRange: TimeRange, userRoles?: string[]): Promise<GovernorateData> {
    const governorateConfig = demoGovernorateConfigs.find(
      g => g.name.toLowerCase() === governorate.toLowerCase()
    );
    
    if (!governorateConfig) {
      throw new Error(`Governorate ${governorate} not found`);
    }

    // Get sites for this governorate
    const sites = await this.getSites(userRoles || [], governorateConfig.siteIds);
    
    // Group sites by branch
    const branchMap = new Map<string, Site[]>();
    sites.forEach(site => {
      const branch = site.branch;
      if (!branchMap.has(branch)) {
        branchMap.set(branch, []);
      }
      branchMap.get(branch)!.push(site);
    });

    // Create branch data with aggregated metrics
    const branches: BranchData[] = [];
    for (const [branchName, branchSites] of branchMap) {
      const siteIds = branchSites.map(s => s.id);
      const siteSummaries = await this.getSiteSummaries(siteIds, timeRange);
      const metrics = await this.calculateAggregatedMetrics(siteIds, timeRange);
      
      branches.push({
        branchName,
        sites: siteSummaries,
        metrics,
      });
    }

    // Calculate overall summary
    const allSiteIds = sites.map(s => s.id);
    const summary = await this.calculateAggregatedMetrics(allSiteIds, timeRange);

    return {
      governorate,
      branches,
      summary,
      timeRange,
    };
  }

  async getMasterData(timeRange: TimeRange, userRoles?: string[]): Promise<MasterData> {
    // Check if user has master access
    if (userRoles && !userRoles.includes('admin') && !userRoles.includes('master')) {
      throw new Error('Insufficient permissions for master data access');
    }

    const sites = await this.getSites(['admin']); // Get all sites
    const siteIds = sites.map(s => s.id);
    const siteSummaries = await this.getSiteSummaries(siteIds, timeRange);
    const summary = await this.calculateAggregatedMetrics(siteIds, timeRange);

    return {
      sites: siteSummaries,
      summary,
      timeRange,
    };
  }

  async getEventLog(siteId?: string, timeRange?: TimeRange, userRoles?: string[]): Promise<Event[]> {
    let events = this.demoData.events;

    // Filter by site if specified
    if (siteId) {
      events = events.filter(event => event.siteId === siteId);
    }

    // Filter by time range if specified
    if (timeRange) {
      const { start, end } = this.getTimeRangeDates(timeRange);
      events = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= start && eventDate <= end;
      });
    }

    // Filter by user access if roles provided
    if (userRoles && !userRoles.includes('admin') && !userRoles.includes('master')) {
      const accessibleSites = await this.getSites(userRoles);
      const accessibleSiteIds = accessibleSites.map(s => s.id);
      events = events.filter(event => accessibleSiteIds.includes(event.siteId));
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getSystemKPIs(accessibleSiteIds?: string[]): Promise<SystemKPIs> {
    return calculateSystemKPIs(accessibleSiteIds);
  }

  async getSiteSummaries(siteIds?: string[], timeRange?: TimeRange): Promise<SiteSummary[]> {
    let sites = this.demoData.sites;
    
    if (siteIds) {
      sites = sites.filter(site => siteIds.includes(site.id));
    }

    // Convert Site to SiteSummary format with current readings
    const summaries: SiteSummary[] = [];
    
    for (const site of sites) {
      // Get latest reading for current values
      const readings = timeRange 
        ? await this.getSiteReadings(site.id, timeRange)
        : [];
      
      const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
      
      // Use demo site data as base, override with latest reading if available
      const summary: SiteSummary = {
        siteId: site.id,
        siteName: site.name,
        position: site.position || 0,
        upstream: latestReading?.upstream || this.getBaseSiteValue(site.id, 'upstream'),
        downstream: latestReading?.downstream || this.getBaseSiteValue(site.id, 'downstream'),
        batteryVoltage: latestReading?.batteryVoltage || this.getBaseSiteValue(site.id, 'batteryVoltage'),
        flowRate: latestReading?.flowRate || this.getBaseSiteValue(site.id, 'flowRate'),
        status: site.status,
        lastReading: latestReading?.timestamp || new Date(),
        coordinates: site.coordinates,
        governorate: site.governorate,
        branch: site.branch,
      };
      
      summaries.push(summary);
    }

    return summaries.sort((a, b) => a.position - b.position);
  }

  async calculateAggregatedMetrics(siteIds: string[], timeRange?: TimeRange): Promise<AggregatedMetrics> {
    const summaries = await this.getSiteSummaries(siteIds, timeRange);
    
    if (summaries.length === 0) {
      return {
        avgUpstream: 0,
        avgDownstream: 0,
        avgBatteryVoltage: 0,
        totalFlowRate: 0,
        activeSites: 0,
        totalSites: 0,
        alarmCount: 0,
      };
    }

    const activeSites = summaries.filter(s => s.status === 'active').length;
    const alarmSites = summaries.filter(s => s.status === 'alarm').length;
    
    // Calculate averages for levels and battery (arithmetic mean)
    const avgUpstream = summaries.reduce((sum, s) => sum + s.upstream, 0) / summaries.length;
    const avgDownstream = summaries.reduce((sum, s) => sum + s.downstream, 0) / summaries.length;
    const avgBatteryVoltage = summaries.reduce((sum, s) => sum + s.batteryVoltage, 0) / summaries.length;
    
    // Calculate total flow rate (sum/cumulative)
    const totalFlowRate = summaries.reduce((sum, s) => sum + s.flowRate, 0);

    return {
      avgUpstream: Math.round(avgUpstream * 100) / 100,
      avgDownstream: Math.round(avgDownstream * 100) / 100,
      avgBatteryVoltage: Math.round(avgBatteryVoltage * 100) / 100,
      totalFlowRate: Math.round(totalFlowRate * 100) / 100,
      activeSites,
      totalSites: summaries.length,
      alarmCount: alarmSites,
    };
  }

  async exportData(params: ExportParams): Promise<Blob> {
    // Mock export functionality - return empty blob for now
    // Real implementation would generate PDF/Excel files
    const mockData = JSON.stringify({
      exportType: params.type,
      scope: params.scope,
      timeRange: params.timeRange,
      sites: params.sites,
      timestamp: new Date().toISOString(),
    });
    
    return new Blob([mockData], { type: 'application/json' });
  }

  // Helper methods
  private getTimeRangeDates(timeRange: TimeRange): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = timeRange.endDate || now;

    if (timeRange.startDate) {
      start = timeRange.startDate;
    } else {
      switch (timeRange.type) {
        case 'latest':
          start = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
          break;
        case '24h':
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
          break;
        case 'month':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last month
          break;
        default:
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
      }
    }

    return { start, end };
  }

  private getTimeRangeInterval(type: TimeFilterType): 'hourly' | 'daily' {
    switch (type) {
      case 'latest':
      case '24h':
        return 'hourly';
      case 'week':
      case 'month':
      case 'custom':
        return 'daily';
      default:
        return 'hourly';
    }
  }

  private getBaseSiteValue(siteId: string, field: 'upstream' | 'downstream' | 'batteryVoltage' | 'flowRate'): number {
    // Get base values from demo sites data
    const demoSite = getSiteById(siteId);
    if (!demoSite) return 0;
    
    switch (field) {
      case 'upstream': return demoSite.upstream;
      case 'downstream': return demoSite.downstream;
      case 'batteryVoltage': return demoSite.batteryVoltage;
      case 'flowRate': return demoSite.flowRate;
      default: return 0;
    }
  }
}