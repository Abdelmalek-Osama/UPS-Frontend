import type { User, Site, SiteData, GovernorateData, Event } from '../types';

/**
 * Role-based filtering utilities for UPS Dashboard
 * Provides centralized logic for filtering data based on user permissions
 */

/**
 * Filter sites based on user access permissions
 */
export function filterSitesByUserAccess(user: User | null, sites: Site[]): Site[] {
  if (!user) return [];
  
  // Admin and SuperAdmin can access all sites
  if (hasAdminAccess(user)) {
    return sites;
  }
  
  // Filter sites based on user's accessible sites
  return sites.filter(site => canUserAccessSite(user, site.id));
}

/**
 * Filter site data based on user access permissions
 */
export function filterSiteDataByUserAccess(user: User | null, siteData: SiteData[]): SiteData[] {
  if (!user) return [];
  
  // Admin and SuperAdmin can access all site data
  if (hasAdminAccess(user)) {
    return siteData;
  }
  
  // Filter site data based on user's accessible sites
  return siteData.filter(data => canUserAccessSite(user, data.siteId));
}

/**
 * Filter governorate data based on user access permissions
 */
export function filterGovernorateDataByUserAccess(user: User | null, governorateData: GovernorateData[]): GovernorateData[] {
  if (!user) return [];
  
  // Admin and SuperAdmin can access all governorate data
  if (hasAdminAccess(user)) {
    return governorateData;
  }
  
  // Filter governorate data based on user's governorate access
  return governorateData.filter(data => canUserAccessGovernorate(user, data.governorate));
}

/**
 * Filter events based on user access to sites
 */
export function filterEventsByUserAccess(user: User | null, events: Event[]): Event[] {
  if (!user) return [];
  
  // Admin and SuperAdmin can access all events
  if (hasAdminAccess(user)) {
    return events;
  }
  
  // Filter events based on user's accessible sites
  return events.filter(event => canUserAccessSite(user, event.siteId));
}

/**
 * Get user's accessible governorates
 */
export function getUserAccessibleGovernorates(user: User | null): string[] {
  if (!user) return [];
  
  // Admin and SuperAdmin can access all governorates
  if (hasAdminAccess(user)) {
    return ['all']; // Special marker indicating access to all governorates
  }
  
  // Return user's specific governorate
  const governorate = user.governorate || user.governorateName;
  return governorate ? [governorate] : [];
}

/**
 * Get user's accessible site IDs
 */
export function getUserAccessibleSiteIds(user: User | null): string[] {
  if (!user) return [];
  
  // Admin and SuperAdmin can access all sites (return empty array to indicate all access)
  if (hasAdminAccess(user)) {
    return []; // Empty array indicates access to all sites
  }
  
  // Return user's specific accessible sites
  return user.accessibleSites || [];
}

/**
 * Check if user has admin-level access (Admin or SuperAdmin)
 */
export function hasAdminAccess(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, 'Admin') || hasRole(user, 'SuperAdmin');
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  return user.roles?.includes(role) || user.role === role;
}

/**
 * Check if user can access specific site
 */
export function canUserAccessSite(user: User | null, siteId: string): boolean {
  if (!user) return false;
  
  // Admin and SuperAdmin can access all sites
  if (hasAdminAccess(user)) return true;
  
  // Check if user has access to specific site
  const numericSiteId = parseInt(siteId);
  return user.accessibleSites?.includes(siteId) || 
         user.siteIds?.includes(numericSiteId) || false;
}

/**
 * Check if user can access specific governorate
 */
export function canUserAccessGovernorate(user: User | null, governorate: string): boolean {
  if (!user) return false;
  
  // Admin and SuperAdmin can access all governorates
  if (hasAdminAccess(user)) return true;
  
  // Check if user's governorate matches
  return user.governorate === governorate || user.governorateName === governorate;
}

/**
 * Check if user can access master view
 */
export function canUserAccessMasterView(user: User | null): boolean {
  if (!user) return false;
  return hasAdminAccess(user);
}

/**
 * Apply read-only restrictions to user actions
 * The UPS Dashboard is read-only, so this always returns false for modification actions
 */
export function canUserModifyData(user: User | null): boolean {
  // UPS Dashboard is read-only for all users
  return false;
}

/**
 * Check if user can export data
 */
export function canUserExportData(user: User | null): boolean {
  // All authenticated users can export data they have access to
  return !!user;
}

/**
 * Check if user can schedule reports
 */
export function canUserScheduleReports(user: User | null): boolean {
  // Only admin users can schedule reports
  return hasAdminAccess(user);
}

/**
 * Get filtered navigation items based on user permissions
 */
export interface NavigationItem {
  path: string;
  label: string;
  requiresAdmin?: boolean;
  requiresGovernorate?: string;
}

export function getFilteredNavigationItems(user: User | null, navigationItems: NavigationItem[]): NavigationItem[] {
  if (!user) return [];
  
  return navigationItems.filter(item => {
    // Check admin requirement
    if (item.requiresAdmin && !hasAdminAccess(user)) {
      return false;
    }
    
    // Check governorate requirement
    if (item.requiresGovernorate && !canUserAccessGovernorate(user, item.requiresGovernorate)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Validate user access to a specific resource
 */
export interface AccessValidationResult {
  hasAccess: boolean;
  reason?: string;
}

export function validateUserAccess(
  user: User | null,
  resourceType: 'site' | 'governorate' | 'master' | 'reports',
  resourceId?: string
): AccessValidationResult {
  if (!user) {
    return { hasAccess: false, reason: 'User not authenticated' };
  }
  
  switch (resourceType) {
    case 'site':
      if (!resourceId) {
        return { hasAccess: false, reason: 'Site ID required' };
      }
      if (!canUserAccessSite(user, resourceId)) {
        return { hasAccess: false, reason: `No access to site ${resourceId}` };
      }
      return { hasAccess: true };
      
    case 'governorate':
      if (!resourceId) {
        return { hasAccess: false, reason: 'Governorate name required' };
      }
      if (!canUserAccessGovernorate(user, resourceId)) {
        return { hasAccess: false, reason: `No access to governorate ${resourceId}` };
      }
      return { hasAccess: true };
      
    case 'master':
      if (!canUserAccessMasterView(user)) {
        return { hasAccess: false, reason: 'Master view requires admin privileges' };
      }
      return { hasAccess: true };
      
    case 'reports':
      if (!canUserExportData(user)) {
        return { hasAccess: false, reason: 'No access to reports' };
      }
      return { hasAccess: true };
      
    default:
      return { hasAccess: false, reason: 'Unknown resource type' };
  }
}