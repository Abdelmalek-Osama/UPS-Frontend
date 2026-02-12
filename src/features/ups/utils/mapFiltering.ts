import type { Site, User } from '../types';

/**
 * Utility functions for role-based map filtering
 */

/**
 * Filter sites based on user role and permissions
 */
export const filterSitesByUserAccess = (sites: Site[], user: User | null): Site[] => {
  if (!user) return [];

  // Admin and SuperAdmin can see all sites
  if (user.roles?.includes('Admin') || user.roles?.includes('SuperAdmin') || 
      user.role === 'Admin' || user.role === 'SuperAdmin') {
    return sites;
  }

  // Filter sites based on user's accessible sites
  return sites.filter(site => {
    // Check by site ID (string format)
    if (user.accessibleSites?.includes(site.id)) {
      return true;
    }

    // Check by numeric site ID (backward compatibility)
    const numericSiteId = parseInt(site.id);
    if (user.siteIds?.includes(numericSiteId)) {
      return true;
    }

    // Check by governorate access
    if (user.governorate === site.governorate || user.governorateName === site.governorate) {
      return true;
    }

    return false;
  });
};

/**
 * Check if user can access a specific site
 */
export const canUserAccessSite = (siteId: string, user: User | null): boolean => {
  if (!user) return false;

  // Admin and SuperAdmin can access all sites
  if (user.roles?.includes('Admin') || user.roles?.includes('SuperAdmin') || 
      user.role === 'Admin' || user.role === 'SuperAdmin') {
    return true;
  }

  // Check accessible sites
  if (user.accessibleSites?.includes(siteId)) {
    return true;
  }

  // Check numeric site IDs (backward compatibility)
  const numericSiteId = parseInt(siteId);
  if (user.siteIds?.includes(numericSiteId)) {
    return true;
  }

  return false;
};

/**
 * Get accessible governorates for a user
 */
export const getUserAccessibleGovernorates = (user: User | null): string[] => {
  if (!user) return [];

  // Admin and SuperAdmin can access all governorates
  if (user.roles?.includes('Admin') || user.roles?.includes('SuperAdmin') || 
      user.role === 'Admin' || user.role === 'SuperAdmin') {
    return ['all']; // Special marker for all access
  }

  // Return user's specific governorate
  const governorates: string[] = [];
  if (user.governorate) governorates.push(user.governorate);
  if (user.governorateName && !governorates.includes(user.governorateName)) {
    governorates.push(user.governorateName);
  }

  return governorates;
};

/**
 * Filter sites by governorate access
 */
export const filterSitesByGovernorate = (sites: Site[], user: User | null): Site[] => {
  const accessibleGovernorates = getUserAccessibleGovernorates(user);
  
  if (accessibleGovernorates.includes('all')) {
    return sites;
  }

  return sites.filter(site => 
    accessibleGovernorates.includes(site.governorate)
  );
};