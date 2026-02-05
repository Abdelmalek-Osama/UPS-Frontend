/**
 * Route configuration for UPS Dashboard
 */

export const UPS_ROUTES = {
  // Main dashboard routes
  LANDING: '/',
  SITE: '/sites/:siteId',
  GOVERNORATE: '/governorates/:governorateId',
  MASTER: '/master',
  REPORTS: '/reports',
  
  // Authentication routes
  LOGIN: '/login',
  LOGOUT: '/logout',
} as const;

export const UPS_ROUTE_PATHS = {
  LANDING: '/',
  SITE: (siteId: string) => `/sites/${siteId}`,
  GOVERNORATE: (governorateId: string) => `/governorates/${governorateId}`,
  MASTER: '/master',
  REPORTS: '/reports',
  LOGIN: '/login',
  LOGOUT: '/logout',
} as const;

/**
 * Route metadata for navigation and access control
 */
export interface RouteMetadata {
  path: string;
  title: string;
  description: string;
  requiresAuth: boolean;
  requiredRoles?: string[];
  icon?: string;
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  LANDING: {
    path: UPS_ROUTES.LANDING,
    title: 'Dashboard',
    description: 'Main dashboard with system overview',
    requiresAuth: true,
    icon: 'dashboard',
  },
  SITE: {
    path: UPS_ROUTES.SITE,
    title: 'Site Details',
    description: 'Detailed view of individual site data',
    requiresAuth: true,
    icon: 'location',
  },
  GOVERNORATE: {
    path: UPS_ROUTES.GOVERNORATE,
    title: 'Governorate View',
    description: 'Aggregated view of governorate data',
    requiresAuth: true,
    icon: 'map',
  },
  MASTER: {
    path: UPS_ROUTES.MASTER,
    title: 'Master View',
    description: 'System-wide view of all sites',
    requiresAuth: true,
    requiredRoles: ['Admin', 'SuperAdmin'],
    icon: 'globe',
  },
  REPORTS: {
    path: UPS_ROUTES.REPORTS,
    title: 'Reports',
    description: 'Export and scheduled reporting',
    requiresAuth: true,
    icon: 'document',
  },
  LOGIN: {
    path: UPS_ROUTES.LOGIN,
    title: 'Login',
    description: 'User authentication',
    requiresAuth: false,
    icon: 'login',
  },
};