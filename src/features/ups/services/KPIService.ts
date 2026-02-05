import type { SystemKPIs, Site, Event, User } from '../types';
import { authService } from './AuthService';

/**
 * Service for calculating KPIs based on user access and site data
 */
class KPIService {
  /**
   * Calculate system KPIs based on user access permissions
   */
  calculateKPIs(
    sites: Site[], 
    events: Event[], 
    user: User | null
  ): SystemKPIs {
    // Filter sites based on user access
    const accessibleSites = authService.filterAccessibleSites(user, sites);
    
    // Calculate basic site metrics
    const totalSites = accessibleSites.length;
    const activeSites = accessibleSites.filter(site => site.status === 'active').length;
    const inactiveSites = accessibleSites.filter(site => 
      site.status === 'inactive' || site.status === 'maintenance'
    ).length;
    
    // Calculate urgent alarms (critical and high severity, unacknowledged)
    const accessibleSiteIds = accessibleSites.map(site => site.id);
    const urgentAlarms = events.filter(event => 
      accessibleSiteIds.includes(event.siteId) &&
      event.type === 'alarm' &&
      (event.severity === 'critical' || event.severity === 'high') &&
      !event.acknowledged
    ).length;
    
    return {
      totalSites,
      activeSites,
      inactiveSites,
      urgentAlarms,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get KPI configuration for display
   */
  getKPIConfig(kpis: SystemKPIs) {
    return [
      {
        key: 'totalSites',
        label: 'ups.kpis.totalSites',
        value: kpis.totalSites,
        icon: 'MapPin',
        accent: 'text-blue-600',
        subtitle: 'ups.kpis.totalSitesSubtitle',
      },
      {
        key: 'activeSites',
        label: 'ups.kpis.activeSites',
        value: kpis.activeSites,
        icon: 'Signal',
        accent: 'text-green-600',
        subtitle: 'ups.kpis.activeSitesSubtitle',
      },
      {
        key: 'inactiveSites',
        label: 'ups.kpis.inactiveSites',
        value: kpis.inactiveSites,
        icon: 'AlertTriangle',
        accent: 'text-gray-600',
        subtitle: 'ups.kpis.inactiveSitesSubtitle',
      },
      {
        key: 'urgentAlarms',
        label: 'ups.kpis.urgentAlarms',
        value: kpis.urgentAlarms,
        icon: 'ShieldAlert',
        accent: kpis.urgentAlarms > 0 ? 'text-red-600' : 'text-green-600',
        subtitle: 'ups.kpis.urgentAlarmsSubtitle',
      },
    ];
  }

  /**
   * Validate KPI data integrity
   */
  validateKPIs(kpis: SystemKPIs): boolean {
    return (
      typeof kpis.totalSites === 'number' &&
      typeof kpis.activeSites === 'number' &&
      typeof kpis.inactiveSites === 'number' &&
      typeof kpis.urgentAlarms === 'number' &&
      kpis.totalSites >= 0 &&
      kpis.activeSites >= 0 &&
      kpis.inactiveSites >= 0 &&
      kpis.urgentAlarms >= 0 &&
      kpis.activeSites + kpis.inactiveSites <= kpis.totalSites
    );
  }

  /**
   * Get KPI trends (for future enhancement)
   */
  calculateKPITrends(
    currentKPIs: SystemKPIs,
    previousKPIs?: SystemKPIs
  ): Record<string, 'up' | 'down' | 'stable'> {
    if (!previousKPIs) {
      return {
        totalSites: 'stable',
        activeSites: 'stable',
        inactiveSites: 'stable',
        urgentAlarms: 'stable',
      };
    }

    return {
      totalSites: this.getTrend(currentKPIs.totalSites, previousKPIs.totalSites),
      activeSites: this.getTrend(currentKPIs.activeSites, previousKPIs.activeSites),
      inactiveSites: this.getTrend(currentKPIs.inactiveSites, previousKPIs.inactiveSites),
      urgentAlarms: this.getTrend(currentKPIs.urgentAlarms, previousKPIs.urgentAlarms),
    };
  }

  private getTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  }
}

// Export singleton instance
export const kpiService = new KPIService();
export default kpiService;