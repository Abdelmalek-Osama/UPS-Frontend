/**
 * Constants for UPS Dashboard
 */

// Time filter options
export const TIME_FILTER_OPTIONS = [
  { value: 'latest', label: 'Latest Reading', description: 'Most recent data point' },
  { value: '24h', label: 'Last 24 Hours', description: 'Hourly data for the past day' },
  { value: 'week', label: 'Last Week', description: 'Daily averages for the past week' },
  { value: 'month', label: 'Last Month', description: 'Daily averages for the past month' },
  { value: 'custom', label: 'Custom Range', description: 'Select specific date range' },
] as const;

// Site status colors
export const SITE_STATUS_COLORS = {
  active: '#22c55e',    // green-500
  inactive: '#6b7280',  // gray-500
  maintenance: '#f59e0b', // amber-500
  alarm: '#ef4444',     // red-500
} as const;

// Chart colors
export const CHART_COLORS = {
  upstream: '#3b82f6',    // blue-500
  downstream: '#ef4444',  // red-500
  battery: '#10b981',     // emerald-500
  flowRate: '#8b5cf6',    // violet-500
} as const;

// Event severity colors
export const EVENT_SEVERITY_COLORS = {
  critical: '#dc2626',  // red-600
  high: '#ea580c',      // orange-600
  medium: '#d97706',    // amber-600
  low: '#65a30d',       // lime-600
  info: '#2563eb',      // blue-600
} as const;

// Map configuration
export const MAP_CONFIG = {
  center: [26.8206, 30.8025] as [number, number], // Egypt center
  zoom: 6,
  minZoom: 5,
  maxZoom: 18,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// Data refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  realtime: 30000,    // 30 seconds
  normal: 300000,     // 5 minutes
  slow: 900000,       // 15 minutes
} as const;

// Export formats
export const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', extension: '.pdf' },
  { value: 'excel', label: 'Excel', extension: '.xlsx' },
  { value: 'csv', label: 'CSV', extension: '.csv' },
] as const;

// Report frequencies
export const REPORT_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  GOVERNORATE: 'Governorate',
  OPERATOR: 'Operator',
  VIEWER: 'Viewer',
} as const;

// Governorates and branches
export const GOVERNORATES = {
  MINIA: {
    name: 'Minia',
    branches: ['Ibrahimiya', 'Bahr Youssef'],
  },
  // Add other governorates as needed
} as const;

// API endpoints (for future backend integration)
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  SITES: '/api/sites',
  READINGS: '/api/readings',
  EVENTS: '/api/events',
  EXPORTS: '/api/exports',
  REPORTS: '/api/reports',
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  MAX_SITES_PER_REQUEST: 100,
  MAX_READINGS_PER_REQUEST: 10000,
  MAX_EXPORT_SIZE_MB: 50,
  MIN_PASSWORD_LENGTH: 8,
} as const;