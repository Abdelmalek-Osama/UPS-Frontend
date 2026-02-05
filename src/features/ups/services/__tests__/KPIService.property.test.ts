import * as fc from 'fast-check';
import { kpiService } from '../KPIService';
import type { Site, Event, User, SystemKPIs } from '../../types';

// Feature: ups-dashboard, Property 7: KPI Calculation Accuracy
// **Validates: Requirements 2.3**

describe('KPI Service Property-Based Tests', () => {
  // Generators for test data
  const siteStatusArb = fc.constantFrom('active', 'inactive', 'maintenance', 'alarm');
  const eventTypeArb = fc.constantFrom('alarm', 'warning', 'info', 'maintenance', 'system');
  const eventSeverityArb = fc.constantFrom('critical', 'high', 'medium', 'low', 'info');
  
  const siteArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 10 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    coordinates: fc.tuple(fc.float({ min: 20, max: 35 }), fc.float({ min: 25, max: 37 })) as fc.Arbitrary<[number, number]>,
    status: siteStatusArb,
    governorate: fc.string({ minLength: 1, maxLength: 20 }),
    branch: fc.string({ minLength: 1, maxLength: 20 }),
    position: fc.integer({ min: 1, max: 100 }),
  });

  const eventArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    siteId: fc.string({ minLength: 1, maxLength: 10 }),
    timestamp: fc.date(),
    type: eventTypeArb,
    severity: eventSeverityArb,
    message: fc.string({ minLength: 1, maxLength: 100 }),
    acknowledged: fc.boolean(),
    acknowledgedBy: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    acknowledgedAt: fc.option(fc.date()),
  });

  const userArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 10 }),
    username: fc.string({ minLength: 1, maxLength: 30 }),
    email: fc.emailAddress(),
    fullName: fc.string({ minLength: 1, maxLength: 50 }),
    roles: fc.array(fc.constantFrom('admin', 'governorate_viewer', 'site_viewer'), { minLength: 1, maxLength: 3 }),
    accessibleSites: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 20 }),
    governorate: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  });

  // Feature: ups-dashboard, Property 7: KPI Calculation Accuracy
  // **Validates: Requirements 2.3**
  describe('Property 7: KPI Calculation Accuracy', () => {
    it('should calculate total sites correctly for any set of accessible sites', () => {
      fc.assert(
        fc.property(
          fc.array(siteArb, { minLength: 0, maxLength: 50 }),
          fc.array(eventArb, { maxLength: 100 }),
          userArb,
          (sites, events, user) => {
            const kpis = kpiService.calculateKPIs(sites, events, user);
            
            // Total sites should never be negative
            expect(kpis.totalSites).toBeGreaterThanOrEqual(0);
            
            // Total sites should be less than or equal to all sites
            expect(kpis.totalSites).toBeLessThanOrEqual(sites.length);
            
            // KPIs should be valid numbers
            expect(typeof kpis.totalSites).toBe('number');
            expect(typeof kpis.activeSites).toBe('number');
            expect(typeof kpis.inactiveSites).toBe('number');
            expect(typeof kpis.urgentAlarms).toBe('number');
            
            // All KPI values should be non-negative
            expect(kpis.totalSites).toBeGreaterThanOrEqual(0);
            expect(kpis.activeSites).toBeGreaterThanOrEqual(0);
            expect(kpis.inactiveSites).toBeGreaterThanOrEqual(0);
            expect(kpis.urgentAlarms).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistency between active and inactive site counts', () => {
      fc.assert(
        fc.property(
          fc.array(siteArb, { minLength: 0, maxLength: 50 }),
          fc.array(eventArb, { maxLength: 100 }),
          userArb,
          (sites, events, user) => {
            const kpis = kpiService.calculateKPIs(sites, events, user);
            
            // Active + inactive should be less than or equal to total
            // (some sites might have other statuses like 'alarm')
            expect(kpis.activeSites + kpis.inactiveSites).toBeLessThanOrEqual(kpis.totalSites);
            
            // Individual counts should not exceed total
            expect(kpis.activeSites).toBeLessThanOrEqual(kpis.totalSites);
            expect(kpis.inactiveSites).toBeLessThanOrEqual(kpis.totalSites);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate urgent alarms correctly based on event criteria', () => {
      fc.assert(
        fc.property(
          fc.array(siteArb, { minLength: 1, maxLength: 20 }),
          fc.array(eventArb, { maxLength: 50 }),
          userArb,
          (sites, events, user) => {
            // Ensure events reference existing sites
            const siteIds = sites.map(s => s.id);
            const validEvents = events.map(event => ({
              ...event,
              siteId: fc.sample(fc.constantFrom(...siteIds), 1)[0] || sites[0].id
            }));
            
            const kpis = kpiService.calculateKPIs(sites, validEvents, user);
            
            // Count expected urgent alarms manually
            const accessibleSiteIds = user.roles.includes('admin') 
              ? siteIds 
              : siteIds.filter(id => user.accessibleSites.includes(id));
              
            const expectedUrgentAlarms = validEvents.filter(event =>
              accessibleSiteIds.includes(event.siteId) &&
              event.type === 'alarm' &&
              (event.severity === 'critical' || event.severity === 'high') &&
              !event.acknowledged
            ).length;
            
            // KPI urgent alarms should match manual count
            expect(kpis.urgentAlarms).toBe(expectedUrgentAlarms);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty data sets gracefully', () => {
      fc.assert(
        fc.property(
          userArb,
          (user) => {
            const kpis = kpiService.calculateKPIs([], [], user);
            
            // Empty data should result in zero KPIs
            expect(kpis.totalSites).toBe(0);
            expect(kpis.activeSites).toBe(0);
            expect(kpis.inactiveSites).toBe(0);
            expect(kpis.urgentAlarms).toBe(0);
            
            // Last updated should be a valid date
            expect(kpis.lastUpdated).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect user access permissions for site filtering', () => {
      fc.assert(
        fc.property(
          fc.array(siteArb, { minLength: 5, maxLength: 20 }),
          fc.array(eventArb, { maxLength: 30 }),
          userArb,
          (sites, events, user) => {
            // Ensure some sites are accessible to user
            const accessibleSiteIds = sites.slice(0, Math.min(3, sites.length)).map(s => s.id);
            const testUser = { ...user, accessibleSites: accessibleSiteIds };
            
            const kpis = kpiService.calculateKPIs(sites, events, testUser);
            
            if (!testUser.roles.includes('admin')) {
              // Non-admin users should only see their accessible sites
              expect(kpis.totalSites).toBeLessThanOrEqual(accessibleSiteIds.length);
            } else {
              // Admin users should see all sites
              expect(kpis.totalSites).toBe(sites.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate KPI data integrity', () => {
      fc.assert(
        fc.property(
          fc.array(siteArb, { minLength: 0, maxLength: 30 }),
          fc.array(eventArb, { maxLength: 50 }),
          userArb,
          (sites, events, user) => {
            const kpis = kpiService.calculateKPIs(sites, events, user);
            
            // KPI validation should pass for calculated KPIs
            expect(kpiService.validateKPIs(kpis)).toBe(true);
            
            // Verify specific validation rules
            expect(kpis.totalSites).toBeGreaterThanOrEqual(0);
            expect(kpis.activeSites).toBeGreaterThanOrEqual(0);
            expect(kpis.inactiveSites).toBeGreaterThanOrEqual(0);
            expect(kpis.urgentAlarms).toBeGreaterThanOrEqual(0);
            expect(kpis.activeSites + kpis.inactiveSites).toBeLessThanOrEqual(kpis.totalSites);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle null user gracefully', () => {
      fc.assert(
        fc.property(
          fc.array(siteArb, { minLength: 0, maxLength: 20 }),
          fc.array(eventArb, { maxLength: 30 }),
          (sites, events) => {
            const kpis = kpiService.calculateKPIs(sites, events, null);
            
            // Null user should result in empty KPIs
            expect(kpis.totalSites).toBe(0);
            expect(kpis.activeSites).toBe(0);
            expect(kpis.inactiveSites).toBe(0);
            expect(kpis.urgentAlarms).toBe(0);
            
            // Should still be valid KPIs
            expect(kpiService.validateKPIs(kpis)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('KPI Configuration and Display', () => {
    it('should generate consistent KPI configuration for any valid KPIs', () => {
      fc.assert(
        fc.property(
          fc.record({
            totalSites: fc.integer({ min: 0, max: 100 }),
            activeSites: fc.integer({ min: 0, max: 100 }),
            inactiveSites: fc.integer({ min: 0, max: 100 }),
            urgentAlarms: fc.integer({ min: 0, max: 50 }),
            lastUpdated: fc.date(),
          }),
          (kpis) => {
            // Ensure KPIs are valid
            const validKPIs: SystemKPIs = {
              ...kpis,
              activeSites: Math.min(kpis.activeSites, kpis.totalSites),
              inactiveSites: Math.min(kpis.inactiveSites, kpis.totalSites - kpis.activeSites),
            };
            
            const config = kpiService.getKPIConfig(validKPIs);
            
            // Should return 4 KPI configurations
            expect(config).toHaveLength(4);
            
            // Each config should have required properties
            config.forEach(kpi => {
              expect(typeof kpi.key).toBe('string');
              expect(typeof kpi.label).toBe('string');
              expect(typeof kpi.value).toBe('number');
              expect(typeof kpi.icon).toBe('string');
              expect(typeof kpi.accent).toBe('string');
              expect(typeof kpi.subtitle).toBe('string');
              
              // Values should match input KPIs
              expect(kpi.value).toBeGreaterThanOrEqual(0);
            });
            
            // Verify specific KPI values
            expect(config.find(k => k.key === 'totalSites')?.value).toBe(validKPIs.totalSites);
            expect(config.find(k => k.key === 'activeSites')?.value).toBe(validKPIs.activeSites);
            expect(config.find(k => k.key === 'inactiveSites')?.value).toBe(validKPIs.inactiveSites);
            expect(config.find(k => k.key === 'urgentAlarms')?.value).toBe(validKPIs.urgentAlarms);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('KPI Validation', () => {
    it('should correctly validate valid KPI objects', () => {
      fc.assert(
        fc.property(
          fc.record({
            totalSites: fc.integer({ min: 0, max: 100 }),
            activeSites: fc.integer({ min: 0, max: 50 }),
            inactiveSites: fc.integer({ min: 0, max: 50 }),
            urgentAlarms: fc.integer({ min: 0, max: 20 }),
            lastUpdated: fc.date(),
          }),
          (kpis) => {
            // Ensure mathematical consistency
            const validKPIs: SystemKPIs = {
              ...kpis,
              activeSites: Math.min(kpis.activeSites, kpis.totalSites),
              inactiveSites: Math.min(kpis.inactiveSites, kpis.totalSites - Math.min(kpis.activeSites, kpis.totalSites)),
            };
            
            // Valid KPIs should pass validation
            expect(kpiService.validateKPIs(validKPIs)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid KPI objects', () => {
      // Test negative values
      const invalidKPIs1: SystemKPIs = {
        totalSites: -1,
        activeSites: 5,
        inactiveSites: 3,
        urgentAlarms: 2,
        lastUpdated: new Date(),
      };
      expect(kpiService.validateKPIs(invalidKPIs1)).toBe(false);

      // Test inconsistent counts
      const invalidKPIs2: SystemKPIs = {
        totalSites: 5,
        activeSites: 10, // More active than total
        inactiveSites: 3,
        urgentAlarms: 2,
        lastUpdated: new Date(),
      };
      expect(kpiService.validateKPIs(invalidKPIs2)).toBe(false);

      // Test non-numeric values
      const invalidKPIs3 = {
        totalSites: "5" as any,
        activeSites: 3,
        inactiveSites: 2,
        urgentAlarms: 1,
        lastUpdated: new Date(),
      };
      expect(kpiService.validateKPIs(invalidKPIs3)).toBe(false);
    });
  });
});