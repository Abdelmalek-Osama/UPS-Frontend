import type {
  User,
  Site,
  SiteSummary,
  SystemKPIs,
  Event,
  SiteReading,
  TimeRange,
  LoginCredentials,
  AuthResponse,
  GovernorateData,
  MasterData,
  AggregatedMetrics,
  ExportParams,
} from "../types";
import type { DataService } from "./DataService";

// Backend API types based on OpenAPI specification
interface BackendSite {
  id: number;
  code: string;
  name: string;
  arabicName: string;
  siteType: number; // SiteTypeEnum: 0 or 1
  longitude: number;
  latitude: number;
  canal: number; // Canal: 0 or 1
  simCardIP: string;
  dataLoggerType: number; // DataLoggerTypeEnum: 0, 1, or 2
  directorateId: number;
  directorate: {
    id: number;
    name: string;
    arabicName: string;
    code: number;
  };
  siteConfiguration: {
    hasUS: boolean;
    hasDS1: boolean;
    hasDS2: boolean;
    numPumps: number;
  };
  hasCommunicationLoss: boolean;
}

interface BackendDashboardStatistics {
  totalSites: number;
  totalDirectorates: number;
  totalUsers: number;
  activeAlarmEvents: number;
  sitesPerDirectorate: Array<{
    directorateId: number;
    directorateName: string;
    directorateArabicName: string;
    totalSiteCount: number;
    activeSiteCount: number;
  }>;
}

interface BackendWaterLevelReading {
  id: number;
  siteId: number;
  timestamp: string;
  recordNumber: number;
  uswl: number; // upstream water level
  dswL1: number; // downstream water level 1
  dswL2?: number; // downstream water level 2
  battery: number;
  timePerHour?: number;
}

interface BackendAlarmEvent {
  id: number;
  siteId: number;
  timestamp: string;
  severity: string;
  message: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface BackendLoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    userName: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    sites: BackendSite[];
  };
  expiresAt: string;
}

export class LiveDataService implements DataService {
  private baseUrl: string;
  private authToken: string | null = null;
  private apiKey?: string;

  constructor(baseUrl: string = '/api/v1', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  isDemoMode(): boolean {
    return false;
  }

  setDemoMode(enabled: boolean): void {
    // Live service doesn't support demo mode
    if (enabled) {
      console.warn('LiveDataService does not support demo mode');
    }
  }

  // DataService interface implementation
  async getSites(userRoles: string[], accessibleSiteIds?: string[]): Promise<Site[]> {
    const allSites = await this.getAllSites();
    
    // Filter sites based on user access
    if (accessibleSiteIds && accessibleSiteIds.length > 0) {
      return allSites.filter(site => accessibleSiteIds.includes(site.id));
    }
    
    return allSites;
  }

  async getSiteData(siteId: string, timeRange: TimeRange): Promise<any> {
    const site = await this.getSiteById(parseInt(siteId));
    const readings = await this.getWaterLevelReadings(parseInt(siteId), {
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });

    return {
      site,
      readings,
      timeRange,
    };
  }

  async getSiteReadings(siteId: string, timeRange: TimeRange): Promise<SiteReading[]> {
    return this.getWaterLevelReadings(parseInt(siteId), {
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });
  }

  async getGovernorateData(governorate: string, timeRange: TimeRange, userRoles?: string[]): Promise<GovernorateData> {
    // This would need to be implemented based on backend API
    // For now, return a basic structure
    const sites = await this.getSites(userRoles || []);
    const governorateSites = sites.filter(site => 
      site.governorate.toLowerCase() === governorate.toLowerCase()
    );

    return {
      governorate,
      branches: [{
        branchName: 'Main Canal',
        sites: governorateSites.map(site => this.siteToSiteSummary(site)),
        metrics: await this.calculateAggregatedMetrics(governorateSites.map(s => s.id)),
      }],
      summary: await this.calculateAggregatedMetrics(governorateSites.map(s => s.id)),
      timeRange,
    };
  }

  async getMasterData(timeRange: TimeRange, userRoles?: string[]): Promise<MasterData> {
    const sites = await this.getSites(userRoles || []);
    
    return {
      sites: sites.map(site => this.siteToSiteSummary(site)),
      summary: await this.calculateAggregatedMetrics(sites.map(s => s.id)),
      timeRange,
    };
  }

  async getEventLog(siteId?: string, timeRange?: TimeRange, userRoles?: string[]): Promise<Event[]> {
    const filters: any = {};
    
    if (siteId) {
      filters.siteId = parseInt(siteId);
    }
    
    if (timeRange?.startDate) {
      filters.startDate = timeRange.startDate;
    }
    
    if (timeRange?.endDate) {
      filters.endDate = timeRange.endDate;
    }

    return this.getAlarmEvents(filters);
  }

  async getSystemKPIs(accessibleSiteIds?: string[]): Promise<SystemKPIs> {
    return this.getDashboardStatistics();
  }

  async getSiteSummaries(siteIds?: string[], timeRange?: TimeRange): Promise<SiteSummary[]> {
    const sites = await this.getSites([]);
    const filteredSites = siteIds ? 
      sites.filter(site => siteIds.includes(site.id)) : 
      sites;
    
    return filteredSites.map(site => this.siteToSiteSummary(site));
  }

  async calculateAggregatedMetrics(siteIds: string[], timeRange?: TimeRange): Promise<AggregatedMetrics> {
    // This would need more sophisticated calculation based on actual readings
    // For now, return basic metrics
    return {
      avgUpstream: 5.5,
      avgDownstream: 4.8,
      avgBatteryVoltage: 12.5,
      totalFlowRate: siteIds.length * 20,
      activeSites: siteIds.length,
      totalSites: siteIds.length,
      alarmCount: 0,
    };
  }

  async exportData(params: ExportParams): Promise<Blob> {
    // This would need to be implemented based on backend export capabilities
    throw new Error('Export functionality not yet implemented for live data service');
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data: BackendLoginResponse = await response.json();
    this.authToken = data.token;

    return {
      accessToken: data.token,
      refreshToken: data.refreshToken,
      user: this.transformBackendUser(data.user),
      expiresAt: new Date(data.expiresAt),
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/Auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data: BackendLoginResponse = await response.json();
    this.authToken = data.token;

    return {
      accessToken: data.token,
      refreshToken: data.refreshToken,
      user: this.transformBackendUser(data.user),
      expiresAt: new Date(data.expiresAt),
    };
  }

  async logout(): Promise<void> {
    if (this.authToken) {
      await fetch(`${this.baseUrl}/Auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    }
    this.authToken = null;
  }

  // Backend-specific data fetching methods
  async getDashboardStatistics(): Promise<SystemKPIs> {
    const response = await fetch(`${this.baseUrl}/LandingPage/statistics`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard statistics');
    }

    const data: BackendDashboardStatistics = await response.json();
    
    return {
      totalSites: data.totalSites,
      activeSites: data.sitesPerDirectorate.reduce((sum, dir) => sum + dir.activeSiteCount, 0),
      inactiveSites: data.totalSites - data.sitesPerDirectorate.reduce((sum, dir) => sum + dir.activeSiteCount, 0),
      urgentAlarms: data.activeAlarmEvents,
      lastUpdated: new Date(),
    };
  }

  async getAllSites(): Promise<Site[]> {
    const response = await fetch(`${this.baseUrl}/Sites/all`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sites');
    }

    const data: BackendSite[] = await response.json();
    return data.map(this.transformBackendSite);
  }

  async getSiteById(siteId: number): Promise<Site> {
    const response = await fetch(`${this.baseUrl}/Sites/${siteId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch site ${siteId}`);
    }

    const data: BackendSite = await response.json();
    return this.transformBackendSite(data);
  }

  async getWaterLevelReadings(
    siteId: number,
    timeRange?: { startDate?: Date; endDate?: Date },
    pagination?: { pageNumber?: number; pageSize?: number }
  ): Promise<SiteReading[]> {
    const params = new URLSearchParams();
    if (timeRange?.startDate) params.append('startDate', timeRange.startDate.toISOString());
    if (timeRange?.endDate) params.append('endDate', timeRange.endDate.toISOString());
    if (pagination?.pageNumber) params.append('PageNumber', pagination.pageNumber.toString());
    if (pagination?.pageSize) params.append('PageSize', pagination.pageSize.toString());

    const endpoint = timeRange ? 
      `${this.baseUrl}/readings/water-level/site/${siteId}/date-range?${params}` :
      `${this.baseUrl}/readings/water-level/site/${siteId}`;

    const response = await fetch(endpoint, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch water level readings for site ${siteId}`);
    }

    const data: BackendWaterLevelReading[] = await response.json();
    return data.map(this.transformBackendWaterLevelReading);
  }

  async getAlarmEvents(filters: {
    unresolvedOnly?: boolean;
    siteId?: number;
    startDate?: Date;
    endDate?: Date;
    pageNumber?: number;
    pageSize?: number;
  } = {}): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters.unresolvedOnly !== undefined) params.append('unresolvedOnly', filters.unresolvedOnly.toString());
    if (filters.siteId) params.append('siteId', filters.siteId.toString());
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters.pageNumber) params.append('PageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params.append('PageSize', filters.pageSize.toString());

    const response = await fetch(`${this.baseUrl}/alarm-events?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch alarm events');
    }

    const data: BackendAlarmEvent[] = await response.json();
    return data.map(this.transformBackendAlarmEvent);
  }

  async resolveAlarmEvent(eventId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alarm-events/${eventId}/resolve`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve alarm event ${eventId}`);
    }
  }

  // Helper methods
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }

  private transformBackendSite(backendSite: BackendSite): Site {
    return {
      id: backendSite.id.toString(),
      name: backendSite.name,
      coordinates: [backendSite.latitude, backendSite.longitude] as [number, number],
      status: this.determineSiteStatus(backendSite),
      governorate: backendSite.directorate.name,
      branch: this.mapCanalToBranch(backendSite.canal),
      position: backendSite.id, // Use ID as position for now
    };
  }

  private siteToSiteSummary(site: Site): SiteSummary {
    return {
      siteId: site.id,
      siteName: site.name,
      position: site.position || 0,
      upstream: 5.5, // Would need to fetch latest reading
      downstream: 4.8, // Would need to fetch latest reading
      batteryVoltage: 12.5, // Would need to fetch latest reading
      flowRate: 20.0, // Would need to fetch latest reading
      status: site.status,
      lastReading: new Date(),
      coordinates: site.coordinates,
      governorate: site.governorate,
      branch: site.branch,
    };
  }

  private transformBackendUser(backendUser: BackendLoginResponse['user']): User {
    return {
      id: backendUser.id,
      username: backendUser.userName,
      email: backendUser.email,
      fullName: backendUser.fullName,
      roles: [backendUser.role],
      accessibleSites: backendUser.sites.map(site => site.id.toString()),
    };
  }

  private transformBackendWaterLevelReading(reading: BackendWaterLevelReading): SiteReading {
    return {
      timestamp: new Date(reading.timestamp),
      upstream: reading.uswl,
      downstream: reading.dswL1,
      batteryVoltage: reading.battery,
      flowRate: 0, // Flow rate would need to be calculated or fetched separately
      status: this.determineReadingStatus(reading),
    };
  }

  private transformBackendAlarmEvent(event: BackendAlarmEvent): Event {
    return {
      id: event.id.toString(),
      siteId: event.siteId.toString(),
      timestamp: new Date(event.timestamp),
      type: 'alarm',
      severity: this.mapSeverity(event.severity),
      message: event.message,
      acknowledged: event.isResolved,
      acknowledgedBy: event.resolvedBy,
      acknowledgedAt: event.resolvedAt ? new Date(event.resolvedAt) : undefined,
    };
  }

  private determineSiteStatus(site: BackendSite): Site['status'] {
    if (site.hasCommunicationLoss) return 'alarm';
    // Add more logic based on site configuration and recent readings
    return 'active';
  }

  private mapCanalToBranch(canal: number): string {
    switch (canal) {
      case 0: return 'Main Canal';
      case 1: return 'Branch Canal';
      default: return 'Unknown';
    }
  }

  private determineReadingStatus(reading: BackendWaterLevelReading): SiteReading['status'] {
    // Add logic to determine status based on reading values
    if (reading.battery < 12.0) return 'alarm';
    if (reading.battery < 12.3) return 'warning';
    return 'normal';
  }

  private mapSeverity(severity: string): Event['severity'] {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'info';
    }
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }
}