import { useMemo, useCallback } from 'react';
import { useUPSAuth } from '../contexts/UPSAuthContext';
import { authService } from '../services/AuthService';
import { 
  filterSitesByUserAccess,
  filterSiteDataByUserAccess,
  filterGovernorateDataByUserAccess,
  filterEventsByUserAccess,
  getUserAccessibleGovernorates,
  getUserAccessibleSiteIds,
  hasAdminAccess,
  hasRole,
  canUserAccessSite,
  canUserAccessGovernorate,
  canUserAccessMasterView,
  canUserModifyData,
  canUserExportData,
  canUserScheduleReports,
  validateUserAccess,
  type AccessValidationResult,
  type NavigationItem,
  getFilteredNavigationItems
} from '../utils/roleBasedFiltering';
import type { 
  User, 
  Site, 
  SiteData, 
  GovernorateData, 
  Event,
  LoginCredentials 
} from '../types';

/**
 * Comprehensive UPS authentication hook
 * Provides all authentication-related functionality in a single hook
 */
export function useUPSAuthentication() {
  const {
    user,
    login: contextLogin,
    logout: contextLogout,
    hasRole: contextHasRole,
    canAccessSite: contextCanAccessSite,
    canAccessGovernorate: contextCanAccessGovernorate,
    canAccessMasterView: contextCanAccessMasterView,
    isAuthenticated,
    isLoading,
    error
  } = useUPSAuth();

  // Authentication actions
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    return contextLogin(credentials);
  }, [contextLogin]);

  const logout = useCallback(async (): Promise<void> => {
    return contextLogout();
  }, [contextLogout]);

  // Role and permission checks
  const checkRole = useCallback((role: string): boolean => {
    return hasRole(user, role);
  }, [user]);

  const checkSiteAccess = useCallback((siteId: string): boolean => {
    return canUserAccessSite(user, siteId);
  }, [user]);

  const checkGovernorateAccess = useCallback((governorate: string): boolean => {
    return canUserAccessGovernorate(user, governorate);
  }, [user]);

  const checkMasterAccess = useCallback((): boolean => {
    return canUserAccessMasterView(user);
  }, [user]);

  const checkAdminAccess = useCallback((): boolean => {
    return hasAdminAccess(user);
  }, [user]);

  // Data filtering functions
  const filterSites = useCallback((sites: Site[]): Site[] => {
    return filterSitesByUserAccess(user, sites);
  }, [user]);

  const filterSiteData = useCallback((siteData: SiteData[]): SiteData[] => {
    return filterSiteDataByUserAccess(user, siteData);
  }, [user]);

  const filterGovernorateData = useCallback((governorateData: GovernorateData[]): GovernorateData[] => {
    return filterGovernorateDataByUserAccess(user, governorateData);
  }, [user]);

  const filterEvents = useCallback((events: Event[]): Event[] => {
    return filterEventsByUserAccess(user, events);
  }, [user]);

  // User access information
  const accessibleGovernorates = useMemo(() => {
    return getUserAccessibleGovernorates(user);
  }, [user]);

  const accessibleSiteIds = useMemo(() => {
    return getUserAccessibleSiteIds(user);
  }, [user]);

  // Permission checks for actions
  const canModifyData = useMemo(() => {
    return canUserModifyData(user);
  }, [user]);

  const canExportData = useMemo(() => {
    return canUserExportData(user);
  }, [user]);

  const canScheduleReports = useMemo(() => {
    return canUserScheduleReports(user);
  }, [user]);

  // Navigation filtering
  const getFilteredNavigation = useCallback((navigationItems: NavigationItem[]): NavigationItem[] => {
    return getFilteredNavigationItems(user, navigationItems);
  }, [user]);

  // Access validation
  const validateAccess = useCallback((
    resourceType: 'site' | 'governorate' | 'master' | 'reports',
    resourceId?: string
  ): AccessValidationResult => {
    return validateUserAccess(user, resourceType, resourceId);
  }, [user]);

  // User information getters
  const getUserInfo = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      governorate: user.governorate,
      accessibleSites: user.accessibleSites,
      isAdmin: hasAdminAccess(user),
      canAccessMaster: canUserAccessMasterView(user),
      canExport: canUserExportData(user),
      canScheduleReports: canUserScheduleReports(user)
    };
  }, [user]);

  // Role-specific checks
  const isAdmin = useMemo(() => checkRole('Admin'), [checkRole]);
  const isSuperAdmin = useMemo(() => checkRole('SuperAdmin'), [checkRole]);
  const isGovernorateUser = useMemo(() => checkRole('Governorate'), [checkRole]);
  const isOperator = useMemo(() => checkRole('Operator'), [checkRole]);
  const isViewer = useMemo(() => checkRole('Viewer'), [checkRole]);

  // Site access helpers
  const getAccessibleSites = useCallback((allSites: Site[]): Site[] => {
    return filterSites(allSites);
  }, [filterSites]);

  const canAccessAnySite = useMemo(() => {
    return isAuthenticated && (hasAdminAccess(user) || (user?.accessibleSites?.length || 0) > 0);
  }, [isAuthenticated, user]);

  // Governorate access helpers
  const canAccessAnyGovernorate = useMemo(() => {
    return isAuthenticated && (hasAdminAccess(user) || !!user?.governorate);
  }, [isAuthenticated, user]);

  // Error handling
  const getAuthError = useCallback((): string | null => {
    return error;
  }, [error]);

  // Loading state
  const isAuthLoading = useMemo(() => {
    return isLoading;
  }, [isLoading]);

  return {
    // User state
    user,
    userInfo: getUserInfo,
    isAuthenticated,
    isLoading: isAuthLoading,
    error: getAuthError(),

    // Authentication actions
    login,
    logout,

    // Role checks
    hasRole: checkRole,
    isAdmin,
    isSuperAdmin,
    isGovernorateUser,
    isOperator,
    isViewer,
    hasAdminAccess: checkAdminAccess,

    // Access checks
    canAccessSite: checkSiteAccess,
    canAccessGovernorate: checkGovernorateAccess,
    canAccessMasterView: checkMasterAccess,
    canAccessAnySite,
    canAccessAnyGovernorate,

    // Permission checks
    canModifyData,
    canExportData,
    canScheduleReports,

    // Data filtering
    filterSites,
    filterSiteData,
    filterGovernorateData,
    filterEvents,
    getAccessibleSites,

    // Access information
    accessibleGovernorates,
    accessibleSiteIds,

    // Navigation
    getFilteredNavigation,

    // Validation
    validateAccess,

    // Service access (for advanced use cases)
    authService
  };
}

export default useUPSAuthentication;