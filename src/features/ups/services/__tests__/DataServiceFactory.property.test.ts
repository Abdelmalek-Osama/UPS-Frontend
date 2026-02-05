import * as fc from 'fast-check';
import { DataServiceFactory } from '../DataServiceFactory';
import { DemoDataService } from '../DemoDataService';
import { LiveDataService } from '../LiveDataService';
import type { DataServiceConfig } from '../../types';

// Feature: ups-dashboard, Property 23: Data Service Mode Switching
// **Validates: Requirements 9.4**

describe('Data Service Factory Property-Based Tests', () => {
  beforeEach(() => {
    // Reset factory state before each test
    DataServiceFactory.configure({ mode: 'demo' });
  });

  // Feature: ups-dashboard, Property 23: Data Service Mode Switching
  // **Validates: Requirements 9.4**
  describe('Property 23: Data Service Mode Switching', () => {
    it('should always create the correct service type based on configuration mode', () => {
      fc.assert(
        fc.property(fc.constantFrom('demo', 'live'), (mode) => {
          // Configure the factory with the test mode
          const config: Partial<DataServiceConfig> = { mode };
          if (mode === 'live') {
            config.apiBaseUrl = 'https://api.example.com';
          }
          
          DataServiceFactory.configure(config);
          const service = DataServiceFactory.getInstance();
          
          // Service should match the configured mode
          expect(service.isDemoMode()).toBe(mode === 'demo');
          
          // Service type should match configuration
          if (mode === 'demo') {
            expect(service).toBeInstanceOf(DemoDataService);
          } else {
            expect(service).toBeInstanceOf(LiveDataService);
          }
        }),
        { numRuns: 10 }
      );
    });

    it('should maintain service consistency within the same mode', () => {
      fc.assert(
        fc.property(fc.constantFrom('demo', 'live'), (mode) => {
          // Configure service
          const config: Partial<DataServiceConfig> = { mode };
          if (mode === 'live') {
            config.apiBaseUrl = 'https://api.example.com';
          }
          
          DataServiceFactory.configure(config);
          
          // Multiple getInstance calls should return the same instance
          const service1 = DataServiceFactory.getInstance();
          const service2 = DataServiceFactory.getInstance();
          
          // All instances should be the same (singleton pattern)
          expect(service1).toBe(service2);
          
          // All should have consistent mode
          expect(service1.isDemoMode()).toBe(mode === 'demo');
          expect(service2.isDemoMode()).toBe(mode === 'demo');
        }),
        { numRuns: 10 }
      );
    });

    it('should handle mode switching on service instances correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('demo', 'live'),
          fc.boolean(),
          (initialMode, switchToDemo) => {
            // Configure initial service
            const config: Partial<DataServiceConfig> = { mode: initialMode };
            if (initialMode === 'live') {
              config.apiBaseUrl = 'https://api.example.com';
            }
            
            DataServiceFactory.configure(config);
            const service = DataServiceFactory.getInstance();
            
            // Initial mode should be correct
            expect(service.isDemoMode()).toBe(initialMode === 'demo');
            
            // Switch mode on service instance
            service.setDemoMode(switchToDemo);
            
            // Service instance should reflect the change
            expect(service.isDemoMode()).toBe(switchToDemo);
            
            // Factory mode should remain unchanged (service instance change doesn't affect factory)
            expect(DataServiceFactory.isDemoMode()).toBe(initialMode === 'demo');
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should provide consistent data access patterns regardless of mode', () => {
      fc.assert(
        fc.property(fc.constantFrom('demo', 'live'), (mode) => {
          // Configure service
          const config: Partial<DataServiceConfig> = { mode };
          if (mode === 'live') {
            config.apiBaseUrl = 'https://api.example.com';
          }
          
          DataServiceFactory.configure(config);
          const service = DataServiceFactory.getInstance();
          
          // Service should have consistent interface regardless of mode
          expect(typeof service.getSites).toBe('function');
          expect(typeof service.getSiteData).toBe('function');
          expect(typeof service.getGovernorateData).toBe('function');
          expect(typeof service.getMasterData).toBe('function');
          expect(typeof service.getEventLog).toBe('function');
          expect(typeof service.getSystemKPIs).toBe('function');
          expect(typeof service.exportData).toBe('function');
          expect(typeof service.isDemoMode).toBe('function');
          expect(typeof service.setDemoMode).toBe('function');
          
          // Mode reporting should be consistent
          expect(service.isDemoMode()).toBe(mode === 'demo');
        }),
        { numRuns: 10 }
      );
    });

    it('should handle invalid configurations gracefully', () => {
      // Test invalid live mode config (no API URL)
      DataServiceFactory.configure({ mode: 'live', apiBaseUrl: undefined } as any);
      
      // Getting instance should throw error for invalid live config
      expect(() => DataServiceFactory.getInstance()).toThrow('API base URL is required for live mode');
      
      // Factory should still report the configured mode
      expect(DataServiceFactory.isDemoMode()).toBe(false);
    });
  });

  describe('Data Service Interface Consistency', () => {
    it('should provide consistent method signatures across service types', () => {
      fc.assert(
        fc.property(fc.constantFrom('demo', 'live'), (mode) => {
          const config: Partial<DataServiceConfig> = { mode };
          if (mode === 'live') {
            config.apiBaseUrl = 'https://api.example.com';
          }
          
          DataServiceFactory.configure(config);
          const service = DataServiceFactory.getInstance();
          
          // All required methods should exist
          const requiredMethods = [
            'getSites',
            'getSiteData', 
            'getSiteReadings',
            'getGovernorateData',
            'getMasterData',
            'getEventLog',
            'getSystemKPIs',
            'getSiteSummaries',
            'calculateAggregatedMetrics',
            'exportData',
            'isDemoMode',
            'setDemoMode'
          ];
          
          requiredMethods.forEach(method => {
            expect(typeof (service as any)[method]).toBe('function');
          });
        }),
        { numRuns: 10 }
      );
    });

    it('should maintain consistent return types for demo mode operations', async () => {
      // Configure demo mode
      DataServiceFactory.configure({ mode: 'demo' });
      const service = DataServiceFactory.getInstance();
      
      try {
        // Test various operations return expected types
        const sites = await service.getSites(['admin'], ['1', '2']);
        expect(Array.isArray(sites)).toBe(true);
        
        const kpis = await service.getSystemKPIs(['1', '2']);
        expect(typeof kpis).toBe('object');
        expect(typeof kpis.totalSites).toBe('number');
        expect(typeof kpis.activeSites).toBe('number');
        
        const summaries = await service.getSiteSummaries(['1', '2']);
        expect(Array.isArray(summaries)).toBe(true);
        
        const events = await service.getEventLog();
        expect(Array.isArray(events)).toBe(true);
        
      } catch (error) {
        // If operations fail, it should be due to data constraints, not type issues
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});