import type { TimeRange, Site, SiteReading } from '../types';

/**
 * Validation utilities for UPS Dashboard
 */

/**
 * Validate time range parameters
 */
export function validateTimeRange(timeRange: TimeRange): boolean {
  if (!timeRange.type) return false;

  const validTypes = ['latest', '24h', 'week', 'month', 'custom'];
  if (!validTypes.includes(timeRange.type)) return false;

  if (timeRange.type === 'custom') {
    if (!timeRange.startDate) return false;
    if (timeRange.endDate && timeRange.startDate > timeRange.endDate) return false;
  }

  return true;
}

/**
 * Validate site coordinates
 */
export function validateCoordinates(coordinates: [number, number]): boolean {
  const [lat, lng] = coordinates;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Validate site data
 */
export function validateSite(site: Site): boolean {
  if (!site.id || !site.name) return false;
  if (!validateCoordinates(site.coordinates)) return false;
  if (!site.governorate || !site.branch) return false;
  
  const validStatuses = ['active', 'inactive', 'maintenance', 'alarm'];
  if (!validStatuses.includes(site.status)) return false;

  return true;
}

/**
 * Validate site reading data
 */
export function validateSiteReading(reading: SiteReading): boolean {
  if (!reading.timestamp) return false;
  
  // Check if numeric values are valid
  const numericFields = ['upstream', 'downstream', 'batteryVoltage', 'flowRate'];
  for (const field of numericFields) {
    const value = reading[field as keyof SiteReading] as number;
    if (typeof value !== 'number' || isNaN(value)) return false;
  }

  const validStatuses = ['normal', 'warning', 'alarm'];
  if (!validStatuses.includes(reading.status)) return false;

  return true;
}

/**
 * Validate user permissions for site access
 */
export function validateSiteAccess(
  siteId: string, 
  userSiteIds?: number[], 
  userRole?: string
): boolean {
  // Admin and SuperAdmin have access to all sites
  if (userRole === 'Admin' || userRole === 'SuperAdmin') return true;
  
  // Check if user has specific site access
  if (userSiteIds) {
    return userSiteIds.includes(parseInt(siteId));
  }

  return false;
}

/**
 * Validate governorate access
 */
export function validateGovernorateAccess(
  governorate: string,
  userGovernorate?: string,
  userRole?: string
): boolean {
  // Admin and SuperAdmin have access to all governorates
  if (userRole === 'Admin' || userRole === 'SuperAdmin') return true;
  
  // Check if user's governorate matches
  return userGovernorate === governorate;
}

/**
 * Validate master view access
 */
export function validateMasterAccess(userRole?: string): boolean {
  return userRole === 'Admin' || userRole === 'SuperAdmin';
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumericValue(value: any): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) return false;
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
  return startDate <= endDate;
}