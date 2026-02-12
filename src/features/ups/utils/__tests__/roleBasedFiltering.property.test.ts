import * as fc from 'fast-check';
import {
  filterSitesByUserAccess,
  filterSiteDataByUserAccess,
  filterEventsByUserAccess,
  hasAdminAccess,
  hasRole,
  canUserAccessSite,
  canUserAccessGovernorate,
  canUserAccessMasterView,
  canUserModifyData,
  canUserExportData,
  canUserScheduleReports,
  validateUserAccess,
  getUserAccessibleSiteIds,
  getUserAccessibleGovernorates
} from '../roleBasedFiltering';
import type { User, Site, SiteData, Event } from '../../types';

// Feature: ups-dashboard, Property 1: Authentication Success Redirects to Landing Page
// Feature: ups-dashboard, Property 2: Role-Based Data Filtering  
// Feature: ups-dashboard, Property 3: Read-Only Access Enforcement

// Generators for property-based testing
const userRoleArbitrary = fc.constantFrom('Admin', 'SuperAdmin', 'Governorate', 'Operator', 'Viewer');

const governorateArbitrary = fc.constantFrom('Minia', 'Cairo', 'Giza', 'Alexandria');

const branchArbitrary = fc.constantFrom('Ibrahimiya', 'Bahr Youssef', 'Main', 'North', 'South');

const siteStatusArbitrary = fc.constantFrom('active', 'inactive', 'maintenance', 'alarm');

const userArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  username: fc.string({ minLength: 3, maxLength: 20 }),
  email: fc.emailAddress(),
  fullName: fc.string({ minLength: 5, maxLength: 50 }),
  roles: fc.array(userRoleArbitrary, { minLength: 1, maxLength: 2 }),
  accessibleSites: fc.array(fc.integer({ min: 1, max: 100 }).map(id => id.toString()), { minLength: 0, maxLength: 10 }),
  governorate: governorateArbitrary,
  role: userRoleArbitrary,
  governorateId: fc.integer({ min: 1, max: 10 }),
  governorateName: governorateArbitrary,
  siteIds: fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 10 })
});

const siteArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 100 }).map(id => id.toString()),
  name: fc.string({ minLength: 5, maxLength: 30 }),
  coordinates: fc.tuple(
    fc.float({ min: 20, max: 35 }), // Egypt latitude range
    fc.float({ min: 25, max: 35 })  // Egypt longitude range
  ),
  status: siteStatusArbitrary,
  governorate: governorateArbitrary,
  branch: branchArbitrary
});

const siteDataArbitrary = fc.record({
  siteId: fc.integer({ min: 1, max: 100 }).map(id => id.toString()),
  siteName: fc.string({ minLength: 5, maxLength: 30 }),
  governorate: governorateArbitrary,
  branch: branchArbitrary,
  coordinates: fc.tuple(
    fc.float({ min: 20, max: 35 }),
    fc.float({ min: 25, max: 35 })
  ),
  status: siteStatusArbitrary,
  readings: fc.array(fc.record({
    timestamp: fc.date(),
    upstream: fc.float({ min: 0, max: 200 }),
    downstream: fc.float({ min: 0, max: 200 }),
    batteryVoltage: fc.float({ min: 10, max: 15 }),
    flowRate: fc.float({ min: 0, max: 1000 }),
    status: fc.constantFrom('normal', 'warning', 'alarm')
  }), { maxLength: 100 }),
  lastUpdated: fc.date()
});

const eventArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  siteId: fc.integer({ min: 1, max: 100 }).map(id => id.toString()),
  timestamp: fc.date(),
  type: fc.constantFrom('alarm', 'warning', 'info', 'maintenance', 'system'),
  severity: fc.constantFrom('critical', 'high', 'medium', 'low', 'info'),
  message: fc.string({ minLength: 10, maxLength: 100 }),
  acknowledged: fc.boolean(),
  acknowledgedBy: fc.option(fc.string({ minLength: 3, maxLength: 20 })),
  acknowledgedAt: fc.option(fc.date())
});

describe('Role-Based Filtering Property-Based Tests', () => {
  // Feature: ups-dashboard, Property 2: Role-Based Data Filtering
  // **Validates: Requirements 1.2**
  describe('Property 2: Role-Based Data Filtering', () => {
    it('should always allow admin users to access all sites', () => {
      fc.assert(
        fc.property(
          userArbitrary.filter(user => user.role === 'Admin' || user.role === 'SuperAdmin'),
          fc.array(siteArbitrary, { minLength: 1, maxLength: 20 }),
          (adminUser, sites) => {
            const filteredSites = filterSitesByUserAccess(adminUser, sites);
            
            // Admin users should always see all sites
            expect(filteredSites).toHaveLength(sites.length);
            expect(filteredSites).toEqual(sites);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter sites based on user access for non-admin users', () => {
      fc.assert(
        fc.property(
          userArbitrary.filter(user => 
            user.role !== 'Admin' && 
            user.role !== 'SuperAdmin' && 
            !user.roles?.includes('Admin') && 
            !user.roles?.includes('SuperAdmin')
          ),
          fc.array(siteArbitrary, { minLength: 1, maxLength: 20 }),
          (nonAdminUser, sites) => {
            const filteredSites = filterSitesByUserAccess(nonAdminUser, sites);
            
            // Non-admin users should only see sites they have access to
            filteredSites.forEach(site => {
              const hasAccess = nonAdminUser.accessibleSites?.includes(site.id) ||
                              nonAdminUser.siteIds?.includes(parseInt(site.id));
              expect(hasAccess).toBe(true);
            });
            
            // Filtered sites should be a subset of original sites
            expect(filteredSites.length).toBeLessThanOrEqual(sites.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always allow admin users to access all governorates', () => {
      fc.assert(
        fc.property(
          userArbitrary.filter(user => user.role === 'Admin' || user.role === 'SuperAdmin'),
          governorateArbitrary,
          (adminUser, governorate) => {
            const canAccess = canUserAccessGovernorate(adminUser, governorate);
            
            // Admin users should always have access to any governorate
            expect(canAccess).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should restrict governorate access for non-admin users', () => {
      fc.assert(
        fc.property(
          userArbitrary.filter(user => 
            user.role !== 'Admin' && 
            user.role !== 'SuperAdmin' && 
            !user.roles?.includes('Admin') && 
            !user.roles?.includes('SuperAdmin')
          ),
          governorateArbitrary,
          (nonAdminUser, governorate) => {
            const canAccess = canUserAccessGovernorate(nonAdminUser, governorate);
            const shouldHaveAccess = nonAdminUser.governorate === governorate || 
                                   nonAdminUser.governorateName === governorate;
            
            // Non-admin users should only access their own governorate
            expect(canAccess).toBe(shouldHaveAccess);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter site data consistently with site filtering', () => {
      fc.assert(
        fc.property(
          userArbitrary,
          fc.array(siteDataArbitrary, { minLength: 1, maxLength: 20 }),
          (user, siteDataArray) => {
            const filteredSiteData = filterSiteDataByUserAccess(user, siteDataArray);
            
            // Each filtered site data should be accessible by the user
            filteredSiteData.forEach(siteData => {
              const canAccess = canUserAccessSite(user, siteData.siteId);
              expect(canAccess).toBe(true);
            });
            
            // If user is admin, should see all site data
            if (hasAdminAccess(user)) {
              expect(filteredSiteData).toHaveLength(siteDataArray.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter events based on site access', () => {
      fc.assert(
        fc.property(
          userArbitrary,
          fc.array(eventArbitrary, { minLength: 1, maxLength: 20 }),
          (user, events) => {
            const filteredEvents = filterEventsByUserAccess(user, events);
            
            // Each filtered event should be from a site the user can access
            filteredEvents.forEach(event => {
              const canAccess = canUserAccessSite(user, event.siteId);
              expect(canAccess).toBe(true);
            });
            
            // If user is admin, should see all events
            if (hasAdminAccess(user)) {
              expect(filteredEvents).toHaveLength(events.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent role checking', () => {
      fc.assert(
        fc.property(
          userArbitrary,
          userRoleArbitrary,
          (user, roleToCheck) => {
            const hasRoleResult = hasRole(user, roleToCheck);
            const expectedResult = user.roles?.includes(roleToCheck) || user.role === roleToCheck;
            
            // Role checking should be consistent
            expect(hasRoleResult).toBe(expectedResult);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify admin access', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const isAdmin = hasAdminAccess(user);
          const expectedAdmin = user.role === 'Admin' || user.role === 'SuperAdmin' ||
                               user.roles?.includes('Admin') || user.roles?.includes('SuperAdmin');
          
          // Admin access detection should be accurate
          expect(isAdmin).toBe(expectedAdmin);
        }),
        { numRuns: 100 }
      );
    });

    it('should enforce master view access restrictions', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const canAccessMaster = canUserAccessMasterView(user);
          const shouldHaveAccess = hasAdminAccess(user);
          
          // Only admin users should have master view access
          expect(canAccessMaster).toBe(shouldHaveAccess);
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: ups-dashboard, Property 3: Read-Only Access Enforcement
  // **Validates: Requirements 1.3**
  describe('Property 3: Read-Only Access Enforcement', () => {
    it('should always prevent data modification regardless of user role', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const canModify = canUserModifyData(user);
          
          // System should always be read-only, regardless of user role
          expect(canModify).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should prevent modification even for admin users', () => {
      fc.assert(
        fc.property(
          userArbitrary.filter(user => user.role === 'Admin' || user.role === 'SuperAdmin'),
          (adminUser) => {
            const canModify = canUserModifyData(adminUser);
            
            // Even admin users should not be able to modify data
            expect(canModify).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow data export for authenticated users', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const canExport = canUserExportData(user);
          
          // Authenticated users should be able to export data (read-only operation)
          expect(canExport).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should restrict report scheduling to admin users only', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const canScheduleReports = canUserScheduleReports(user);
          const shouldHaveAccess = hasAdminAccess(user);
          
          // Only admin users should be able to schedule reports
          expect(canScheduleReports).toBe(shouldHaveAccess);
        }),
        { numRuns: 100 }
      );
    });
  });

  // Comprehensive validation properties
  describe('Comprehensive Access Validation Properties', () => {
    it('should provide consistent access validation results', () => {
      fc.assert(
        fc.property(
          userArbitrary,
          fc.constantFrom('site', 'governorate', 'master'),
          fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          (user, accessType, resourceId) => {
            const validation = validateUserAccess(user, accessType, resourceId);
            
            let expectedAccess = false;
            switch (accessType) {
              case 'site':
                expectedAccess = resourceId ? canUserAccessSite(user, resourceId) : false;
                break;
              case 'governorate':
                expectedAccess = resourceId ? canUserAccessGovernorate(user, resourceId) : false;
                break;
              case 'master':
                expectedAccess = canUserAccessMasterView(user);
                break;
            }
            
            // Validation result should match individual access checks
            expect(validation.hasAccess).toBe(expectedAccess);
            
            if (!expectedAccess) {
              expect(validation.reason).toBeDefined();
              expect(validation.reason!.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent accessible site IDs', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const accessibleSiteIds = getUserAccessibleSiteIds(user);
          
          if (hasAdminAccess(user)) {
            // Admin users should return empty array (indicating all access)
            expect(accessibleSiteIds).toEqual([]);
          } else {
            // Non-admin users should return their specific site IDs
            const expectedSiteIds = user.accessibleSites || 
              (user.siteIds?.map(id => id.toString()) || []);
            expect(accessibleSiteIds).toEqual(expectedSiteIds);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should return consistent accessible governorates', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const accessibleGovernorates = getUserAccessibleGovernorates(user);
          
          if (hasAdminAccess(user)) {
            // Admin users should return "all" marker
            expect(accessibleGovernorates).toEqual(['all']);
          } else {
            // Non-admin users should return their specific governorate
            const expectedGovernorates = user.governorate ? [user.governorate] : 
              (user.governorateName ? [user.governorateName] : []);
            expect(accessibleGovernorates).toEqual(expectedGovernorates);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  // Edge cases and null handling
  describe('Edge Cases and Null Handling', () => {
    it('should handle null user gracefully', () => {
      fc.assert(
        fc.property(
          fc.array(siteArbitrary, { minLength: 1, maxLength: 10 }),
          fc.array(siteDataArbitrary, { minLength: 1, maxLength: 10 }),
          fc.array(eventArbitrary, { minLength: 1, maxLength: 10 }),
          (sites, siteData, events) => {
            // All filtering functions should return empty arrays for null user
            expect(filterSitesByUserAccess(null, sites)).toEqual([]);
            expect(filterSiteDataByUserAccess(null, siteData)).toEqual([]);
            expect(filterEventsByUserAccess(null, events)).toEqual([]);
            
            // All access checks should return false for null user
            expect(hasRole(null, 'Admin')).toBe(false);
            expect(hasAdminAccess(null)).toBe(false);
            expect(canUserAccessSite(null, '1')).toBe(false);
            expect(canUserAccessGovernorate(null, 'Minia')).toBe(false);
            expect(canUserAccessMasterView(null)).toBe(false);
            expect(canUserModifyData(null)).toBe(false);
            expect(canUserExportData(null)).toBe(false);
            expect(canUserScheduleReports(null)).toBe(false);
            
            // Accessible resources should be empty for null user
            expect(getUserAccessibleSiteIds(null)).toEqual([]);
            expect(getUserAccessibleGovernorates(null)).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty arrays gracefully', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          // Empty arrays should return empty results
          expect(filterSitesByUserAccess(user, [])).toEqual([]);
          expect(filterSiteDataByUserAccess(user, [])).toEqual([]);
          expect(filterEventsByUserAccess(user, [])).toEqual([]);
        }),
        { numRuns: 100 }
      );
    });
  });
});