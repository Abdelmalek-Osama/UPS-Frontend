/**
 * Formatting utilities for UPS Dashboard
 */

/**
 * Format numbers with appropriate decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format voltage values
 */
export function formatVoltage(voltage: number): string {
  return `${formatNumber(voltage, 1)}V`;
}

/**
 * Format flow rate values
 */
export function formatFlowRate(flowRate: number): string {
  return `${formatNumber(flowRate, 2)} m³/s`;
}

/**
 * Format water level values
 */
export function formatWaterLevel(level: number): string {
  return `${formatNumber(level, 2)} m`;
}

/**
 * Format timestamps for display
 */
export function formatTimestamp(timestamp: Date | string, format: 'short' | 'long' = 'short'): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  if (format === 'long') {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time range for display
 */
export function formatTimeRange(timeRange: { type: string; startDate?: Date; endDate?: Date }): string {
  switch (timeRange.type) {
    case 'latest':
      return 'Latest Reading';
    case '24h':
      return 'Last 24 Hours';
    case 'week':
      return 'Last Week';
    case 'month':
      return 'Last Month';
    case 'custom':
      if (timeRange.startDate && timeRange.endDate) {
        return `${formatDate(timeRange.startDate)} - ${formatDate(timeRange.endDate)}`;
      }
      return 'Custom Range';
    default:
      return 'Unknown Range';
  }
}

/**
 * Format site status for display
 */
export function formatSiteStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'maintenance':
      return 'Maintenance';
    case 'alarm':
      return 'Alarm';
    default:
      return 'Unknown';
  }
}

/**
 * Format event severity for display
 */
export function formatEventSeverity(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    case 'info':
      return 'Info';
    default:
      return 'Unknown';
  }
}