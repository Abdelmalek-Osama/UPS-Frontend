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
  getFilteredNavigationItems
} from '../roleBasedFiltering';
import type { User, Site, SiteData, GovernorateData, Event } from '../../types';

// Mock data
const mockAdminUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  fullName: 'Admin User',
  roles: ['Admin'],
  accessibleSites: [],
  governorate: 'Minia',
  role: 'Admin',
  governorateId: 1,
  governorateName: 'Minia',
  siteIds: [1, 2, 3]
};

const mockGovernorateUser: User = {
  id: '2',
  username: 'govuser',
  email: 'gov@example.com',
  fullName: 'Governorate User',
  roles: ['Governorate'],
  accessibleSites: ['1', '2'],
  governorate: 'Minia',
  role: 'Governorate',
  governorateId: 1,
  governorateName: 'Minia',
  siteIds: [1, 2]
};

const mockViewerUser: User = {
  id: '3',
  username: 'viewer',
  email: 'viewer@example.com',
  fullName: 'Viewer User',
  roles: ['Viewer'],
  accessibleSites: ['1'],
  governorate: 'Minia',
  role: 'Viewer',
  governorateId: 1,
  governorateName: 'Minia',
  siteIds: [1]
};

const mockSites: Site[] = [
  { id: '1', name: 'Site 1', coordinates: [30.0, 31.0], status: 'active', governorate: 'Minia', branch: 'Ibrahimiya' },
  { id: '2', name: 'Site 2', coordinates: [30.1, 31.1], status: 'active', governorate: 'Minia', branch: 'Bahr Youssef' },
  { id: '3', name: 'Site 3', coordinates: [30.2, 31.2], status: 'inactive', governorate: 'Cairo', branch: 'Main' }
];

const mockSiteData: SiteData[] = [
  {
    siteId: '1',
    siteName: 'Site 1',
    governorate: 'Minia',
    branch: 'Ibrahimiya',
    coordinates: [30.0, 31.0],
    status: 'active',
    readings: [],
    lastUpdated: new Date()
  },
  {
    siteId: '2',
    siteName: 'Site 2',
    governorate: 'Minia',
    branch: 'Bahr Youssef',
    coordinates: [30.1, 31.1],
    status: 'active',
    readings: [],
    lastUpdated: new Date()
  }
];

const mockGovernorateData: GovernorateData[] = [
  {
    governorate: 'Minia',
    branches: [],
    summary: {
      avgUpstream: 100,
      avgDownstream: 90,
      avgBatteryVoltage: 12.5,
      totalFlowRate: 1000,
      activeSites: 2,
      totalSites: 2,
      alarmCount: 0
    },
    timeRange: { type: 'latest' }
  }
];

const mockEvents: Event[] = [
  {
    id: '1',
    siteId: '1',
    timestamp: new Date(),
    type: 'alarm',
    severity: 'high',
    message: 'Test alarm',
    acknowledged: false
  },
  {
    id: '2',
    siteId: '2',
    timestamp: new Date(),
    type: 'warning',
    severity: 'medium',
    message: 'Test warning',
    acknowledged: false
  }
];

describe('Role-based filtering utilities', () => {
  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      expect(hasRole(mockAdminUser, 'Admin')).toBe(true);
      expect(hasRole(mockGovernorateUser, 'Governorate')).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      expect(hasRole(mockViewerUser, 'Admin')).toBe(false);
      expect(hasRole(mockGovernorateUser, 'Admin')).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(hasRole(null, 'Admin')).toBe(false);
    });
  });

  describe('hasAdminAccess', () => {
    it('should return true for Admin users', () => {
      expect(hasAdminAccess(mockAdminUser)).toBe(true);
    });

    it('should return true for SuperAdmin users', () => {
      const superAdminUser = { ...mockAdminUser, roles: ['SuperAdmin'], role: 'SuperAdmin' as const };
      expect(hasAdminAccess(superAdminUser)).toBe(true);
    });

    it('should return false for non-admin users', () => {
      expect(hasAdminAccess(mockGovernorateUser)).toBe(false);
      expect(hasAdminAccess(mockViewerUser)).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(hasAdminAccess(null)).toBe(false);
    });
  });

  describe('canUserAccessSite', () => {
    it('should allow admin users to access any site', () => {
      expect(canUserAccessSite(mockAdminUser, '1')).toBe(true);
      expect(canUserAccessSite(mockAdminUser, '999')).toBe(true);
    });

    it('should allow users to access sites in their accessible list', () => {
      expect(canUserAccessSite(mockGovernorateUser, '1')).toBe(true);
      expect(canUserAccessSite(mockGovernorateUser, '2')).toBe(true);
    });

    it('should deny users access to sites not in their accessible list', () => {
      expect(canUserAccessSite(mockViewerUser, '2')).toBe(false);
      expect(canUserAccessSite(mockViewerUser, '999')).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(canUserAccessSite(null, '1')).toBe(false);
    });
  });

  describe('canUserAccessGovernorate', () => {
    it('should allow admin users to access any governorate', () => {
      expect(canUserAccessGovernorate(mockAdminUser, 'Minia')).toBe(true);
      expect(canUserAccessGovernorate(mockAdminUser, 'Cairo')).toBe(true);
    });

    it('should allow users to access their own governorate', () => {
      expect(canUserAccessGovernorate(mockGovernorateUser, 'Minia')).toBe(true);
    });

    it('should deny users access to other governorates', () => {
      expect(canUserAccessGovernorate(mockGovernorateUser, 'Cairo')).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(canUserAccessGovernorate(null, 'Minia')).toBe(false);
    });
  });

  describe('canUserAccessMasterView', () => {
    it('should allow admin users to access master view', () => {
      expect(canUserAccessMasterView(mockAdminUser)).toBe(true);
    });

    it('should deny non-admin users access to master view', () => {
      expect(canUserAccessMasterView(mockGovernorateUser)).toBe(false);
      expect(canUserAccessMasterView(mockViewerUser)).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(canUserAccessMasterView(null)).toBe(false);
    });
  });

  describe('filterSitesByUserAccess', () => {
    it('should return all sites for admin users', () => {
      const filtered = filterSitesByUserAccess(mockAdminUser, mockSites);
      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(mockSites);
    });

    it('should filter sites based on user access', () => {
      const filtered = filterSitesByUserAccess(mockViewerUser, mockSites);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should return empty array when user is null', () => {
      const filtered = filterSitesByUserAccess(null, mockSites);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterSiteDataByUserAccess', () => {
    it('should return all site data for admin users', () => {
      const filtered = filterSiteDataByUserAccess(mockAdminUser, mockSiteData);
      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(mockSiteData);
    });

    it('should filter site data based on user access', () => {
      const filtered = filterSiteDataByUserAccess(mockViewerUser, mockSiteData);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].siteId).toBe('1');
    });
  });

  describe('filterEventsByUserAccess', () => {
    it('should return all events for admin users', () => {
      const filtered = filterEventsByUserAccess(mockAdminUser, mockEvents);
      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(mockEvents);
    });

    it('should filter events based on user site access', () => {
      const filtered = filterEventsByUserAccess(mockViewerUser, mockEvents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].siteId).toBe('1');
    });
  });

  describe('getUserAccessibleGovernorates', () => {
    it('should return "all" marker for admin users', () => {
      const governorates = getUserAccessibleGovernorates(mockAdminUser);
      expect(governorates).toEqual(['all']);
    });

    it('should return user specific governorate for non-admin users', () => {
      const governorates = getUserAccessibleGovernorates(mockGovernorateUser);
      expect(governorates).toEqual(['Minia']);
    });

    it('should return empty array when user is null', () => {
      const governorates = getUserAccessibleGovernorates(null);
      expect(governorates).toEqual([]);
    });
  });

  describe('getUserAccessibleSiteIds', () => {
    it('should return empty array for admin users (indicating all access)', () => {
      const siteIds = getUserAccessibleSiteIds(mockAdminUser);
      expect(siteIds).toEqual([]);
    });

    it('should return user specific site IDs for non-admin users', () => {
      const siteIds = getUserAccessibleSiteIds(mockGovernorateUser);
      expect(siteIds).toEqual(['1', '2']);
    });

    it('should return empty array when user is null', () => {
      const siteIds = getUserAccessibleSiteIds(null);
      expect(siteIds).toEqual([]);
    });
  });

  describe('Permission checks', () => {
    it('should always return false for canUserModifyData (read-only system)', () => {
      expect(canUserModifyData(mockAdminUser)).toBe(false);
      expect(canUserModifyData(mockGovernorateUser)).toBe(false);
      expect(canUserModifyData(null)).toBe(false);
    });

    it('should return true for canUserExportData when user is authenticated', () => {
      expect(canUserExportData(mockAdminUser)).toBe(true);
      expect(canUserExportData(mockGovernorateUser)).toBe(true);
      expect(canUserExportData(null)).toBe(false);
    });

    it('should return true for canUserScheduleReports only for admin users', () => {
      expect(canUserScheduleReports(mockAdminUser)).toBe(true);
      expect(canUserScheduleReports(mockGovernorateUser)).toBe(false);
      expect(canUserScheduleReports(null)).toBe(false);
    });
  });

  describe('validateUserAccess', () => {
    it('should validate site access correctly', () => {
      const result1 = validateUserAccess(mockAdminUser, 'site', '1');
      expect(result1.hasAccess).toBe(true);

      const result2 = validateUserAccess(mockViewerUser, 'site', '999');
      expect(result2.hasAccess).toBe(false);
      expect(result2.reason).toBe('No access to site 999');
    });

    it('should validate governorate access correctly', () => {
      const result1 = validateUserAccess(mockGovernorateUser, 'governorate', 'Minia');
      expect(result1.hasAccess).toBe(true);

      const result2 = validateUserAccess(mockGovernorateUser, 'governorate', 'Cairo');
      expect(result2.hasAccess).toBe(false);
      expect(result2.reason).toBe('No access to governorate Cairo');
    });

    it('should validate master access correctly', () => {
      const result1 = validateUserAccess(mockAdminUser, 'master');
      expect(result1.hasAccess).toBe(true);

      const result2 = validateUserAccess(mockGovernorateUser, 'master');
      expect(result2.hasAccess).toBe(false);
      expect(result2.reason).toBe('Master view requires admin privileges');
    });

    it('should handle unauthenticated users', () => {
      const result = validateUserAccess(null, 'site', '1');
      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('User not authenticated');
    });
  });

  describe('getFilteredNavigationItems', () => {
    const navigationItems = [
      { path: '/', label: 'Dashboard' },
      { path: '/master', label: 'Master View', requiresAdmin: true },
      { path: '/minia', label: 'Minia', requiresGovernorate: 'Minia' }
    ];

    it('should return all items for admin users', () => {
      const filtered = getFilteredNavigationItems(mockAdminUser, navigationItems);
      expect(filtered).toHaveLength(3);
    });

    it('should filter out admin-only items for non-admin users', () => {
      const filtered = getFilteredNavigationItems(mockGovernorateUser, navigationItems);
      expect(filtered).toHaveLength(2);
      expect(filtered.find(item => item.path === '/master')).toBeUndefined();
    });

    it('should filter based on governorate requirements', () => {
      const cairoUser = { ...mockGovernorateUser, governorate: 'Cairo', governorateName: 'Cairo' };
      const filtered = getFilteredNavigationItems(cairoUser, navigationItems);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].path).toBe('/');
    });

    it('should return empty array for null user', () => {
      const filtered = getFilteredNavigationItems(null, navigationItems);
      expect(filtered).toHaveLength(0);
    });
  });
});