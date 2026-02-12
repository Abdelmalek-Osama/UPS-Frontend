import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { RoleBasedMap } from '../RoleBasedMap';
import { UPSAuthProvider } from '../../../contexts/UPSAuthContext';
import { AuthProvider } from '../../../../../shared/contexts/AuthContext';
import { filterSitesByUserAccess, canUserAccessSite } from '../../../utils/mapFiltering';
import type { Site, User } from '../../../types';

// Feature: ups-dashboard, Property 5: Map Pin Display Based on User Access
// Feature: ups-dashboard, Property 6: Map Navigation to Site Pages
// **Validates: Requirements 2.1, 2.2**

// Mock react-leaflet components to avoid DOM issues in tests
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="leaflet-map" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, eventHandlers, ...props }: any) => (
    <div 
      data-testid="marker" 
      onClick={eventHandlers?.click}
      {...props}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  ZoomControl: () => <div data-testid="zoom-control" />,
  useMap: () => ({
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    setView: jest.fn(),
  }),
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  DivIcon: jest.fn().mockImplementation((options) => ({ options })),
  Icon: jest.fn().mockImplementation((options) => ({ options })),
}));

// Mock the main AuthContext
const createMockAuthContext = (user: any = null, isAuthenticated = false, loadingAuth = false) => ({
  currentUser: user,
  isAuthenticated,
  loadingAuth,
  userLoaded: true,
  handleLogout: jest.fn(),
  refreshCurrentUser: jest.fn(),
  login: jest.fn()
});

jest.mock('../../../../../shared/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const { useAuth } = require('../../../../../shared/contexts/AuthContext');

// Generators for property-based testing
const userRoleArbitrary = fc.constantFrom('Admin', 'SuperAdmin', 'Governorate', 'Operator', 'Viewer');
const governorateArbitrary = fc.constantFrom('Minia', 'Cairo', 'Giza', 'Alexandria');
const branchArbitrary = fc.constantFrom('Ibrahimiya', 'Bahr Youssef', 'Main Branch');
const siteStatusArbitrary = fc.constantFrom('active', 'inactive', 'maintenance', 'alarm');

const coordinatesArbitrary = fc.tuple(
  fc.float({ min: 22.0, max: 32.0 }), // Egypt latitude range
  fc.float({ min: 25.0, max: 35.0 })  // Egypt longitude range
);

const siteArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 100 }).map(id => id.toString()),
  name: fc.string({ minLength: 5, maxLength: 30 }),
  coordinates: coordinatesArbitrary,
  status: siteStatusArbitrary,
  governorate: governorateArbitrary,
  branch: branchArbitrary,
  position: fc.integer({ min: 1, max: 40 })
});

const userArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  username: fc.string({ minLength: 3, maxLength: 20 }),
  email: fc.emailAddress(),
  fullName: fc.string({ minLength: 5, maxLength: 50 }),
  role: userRoleArbitrary,
  governorateId: fc.integer({ min: 1, max: 10 }),
  governorateName: governorateArbitrary,
  siteIds: fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 10 })
});

const renderWithProviders = (component: React.ReactElement, mockAuthContextValue: any) => {
  useAuth.mockReturnValue(mockAuthContextValue);
  
  return render(
    <BrowserRouter>
      <AuthProvider>
        <UPSAuthProvider>
          {component}
        </UPSAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Map Functionality Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Feature: ups-dashboard, Property 5: Map Pin Display Based on User Access
  // **Validates: Requirements 2.1**
  describe('Property 5: Map Pin Display Based on User Access', () => {
    it('should always display only sites accessible to the user role', () => {
      fc.assert(
        fc.property(
          userArbitrary,
          fc.array(siteArbitrary, { minLength: 1, maxLength: 20 }),
          (user, allSites) => {
            const mockContext = createMockAuthContext(user, true, false);
            const mockOnSiteClick = jest.fn();
            
            renderWithProviders(
              <RoleBasedMap
                sites={allSites}
                onSiteClick={mockOnSiteClick}
                center={[26.8206, 30.8025]}
                zoom={6}
              />,
              mockContext
            );
            
            // Get expected accessible sites using the filtering utility
            const expectedAccessibleSites = filterSitesByUserAccess(allSites, {
              id: user.id.toString(),
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              roles: [user.role],
              accessibleSites: user.siteIds?.map(id => id.toString()) || [],
              governorate: user.governorateName,
              role: user.role,
              governorateId: user.governorateId,
              governorateName: user.governorateName,
              siteIds: user.siteIds,
            });
            
            // Count markers displayed on map
            const markers = screen.getAllByTestId('marker');
            
            // For admin users, should show all sites
            if (user.role === 'Admin' || user.role === 'SuperAdmin') {
              expect(markers).toHaveLength(allSites.length);
            } else {
              // For non-admin users, should show only accessible sites
              expect(markers).toHaveLength(expectedAccessibleSites.length);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should show no sites when user has no access permissions', () => {
      fc.assert(
        fc.property(
          fc.array(siteArbitrary, { minLength: 1, maxLength: 10 }),
          (sites) => {
            // Create user with no site access
            const userWithNoAccess = {
              id: 999,
              username: 'noaccess',
              email: 'noaccess@test.com',
              fullName: 'No Access User',
              role: 'Viewer',
              governorateId: 999,
              governorateName: 'NonExistentGovernorate',
              siteIds: [] // No site access
            };
            
            const mockContext = createMockAuthContext(userWithNoAccess, true, false);
            const mockOnSiteClick = jest.fn();
            
            renderWithProviders(
              <RoleBasedMap
                sites={sites}
                onSiteClick={mockOnSiteClick}
                center={[26.8206, 30.8025]}
                zoom={6}
              />,
              mockContext
            );
            
            // Should show "no accessible sites" message instead of map
            expect(screen.getByText('No accessible sites')).toBeInTheDocument();
            expect(screen.queryByTestId('leaflet-map')).not.toBeInTheDocument();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should always show loading state when user is not loaded', () => {
      fc.assert(
        fc.property(
          fc.array(siteArbitrary, { minLength: 1, maxLength: 5 }),
          (sites) => {
            const mockContext = createMockAuthContext(null, false, true); // Loading state
            const mockOnSiteClick = jest.fn();
            
            renderWithProviders(
              <RoleBasedMap
                sites={sites}
                onSiteClick={mockOnSiteClick}
                center={[26.8206, 30.8025]}
                zoom={6}
              />,
              mockContext
            );
            
            // Should show loading message
            expect(screen.getByText('Loading map...')).toBeInTheDocument();
            expect(screen.queryByTestId('leaflet-map')).not.toBeInTheDocument();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should filter sites by governorate for governorate-level users', () => {
      fc.assert(
        fc.property(
          governorateArbitrary,
          fc.array(siteArbitrary, { minLength: 5, maxLength: 15 }),
          (userGovernorate, allSites) => {
            // Create a governorate-level user
            const governorateUser = {
              id: 123,
              username: 'govuser',
              email: 'gov@test.com',
              fullName: 'Governorate User',
              role: 'Governorate',
              governorateId: 1,
              governorateName: userGovernorate,
              siteIds: [] // No specific site access, but has governorate access
            };
            
            const mockContext = createMockAuthContext(governorateUser, true, false);
            const mockOnSiteClick = jest.fn();
            
            renderWithProviders(
              <RoleBasedMap
                sites={allSites}
                onSiteClick={mockOnSiteClick}
                center={[26.8206, 30.8025]}
                zoom={6}
              />,
              mockContext
            );
            
            // Count sites in user's governorate
            const expectedSites = allSites.filter(site => site.governorate === userGovernorate);
            
            if (expectedSites.length > 0) {
              const markers = screen.getAllByTestId('marker');
              expect(markers).toHaveLength(expectedSites.length);
            } else {
              // Should show no accessible sites message
              expect(screen.getByText('No accessible sites')).toBeInTheDocument();
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Feature: ups-dashboard, Property 6: Map Navigation to Site Pages
  // **Validates: Requirements 2.2**
  describe('Property 6: Map Navigation to Site Pages', () => {
    it('should always call onSiteClick when user clicks an accessible site marker', () => {
      fc.assert(
        fc.property(
          userArbitrary.filter(user => user.role === 'Admin' || user.role === 'SuperAdmin'),
          fc.array(siteArbitrary, { minLength: 1, maxLength: 5 }),
          (adminUser, sites) => {
            const mockContext = createMockAuthContext(adminUser, true, false);
            const mockOnSiteClick = jest.fn();
            
            renderWithProviders(
              <RoleBasedMap
                sites={sites}
                onSiteClick={mockOnSiteClick}
                center={[26.8206, 30.8025]}
                zoom={6}
              />,
              mockContext
            );
            
            // Get all markers and click the first one
            const markers = screen.getAllByTestId('marker');
            expect(markers.length).toBeGreaterThan(0);
            
            fireEvent.click(markers[0]);
            
            // Should call onSiteClick with the site ID
            expect(mockOnSiteClick).toHaveBeenCalledTimes(1);
            expect(mockOnSiteClick).toHaveBeenCalledWith(sites[0].id);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle clicks on multiple site markers correctly', () => {
      fc.assert(
        fc.property(
          userArbitrary.filter(user => user.role === 'Admin' || user.role === 'SuperAdmin'),
          fc.array(siteArbitrary, { minLength: 2, maxLength: 5 }),
          (adminUser, sites) => {
            const mockContext = createMockAuthContext(adminUser, true, false);
            const mockOnSiteClick = jest.fn();
            
            renderWithProviders(
              <RoleBasedMap
                sites={sites}
                onSiteClick={mockOnSiteClick}
                center={[26.8206, 30.8025]}
                zoom={6}
              />,
              mockContext
            );
            
            const markers = screen.getAllByTestId('marker');
            
            // Click multiple markers
            const clickCount = Math.min(3, markers.length);
            for (let i = 0; i < clickCount; i++) {
              fireEvent.click(markers[i]);
            }
            
            // Should call onSiteClick for each click
            expect(mockOnSiteClick).toHaveBeenCalledTimes(clickCount);
            
            // Verify each call has correct site ID
            for (let i = 0; i < clickCount; i++) {
              expect(mockOnSiteClick).toHaveBeenNthCalledWith(i + 1, sites[i].id);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should prevent navigation for sites user cannot access', () => {
      fc.assert(
        fc.property(
          fc.array(siteArbitrary, { minLength: 1, maxLength: 5 }),
          (sites) => {
            // Create user with no access to any sites
            const restrictedUser = {
              id: 456,
              username: 'restricted',
              email: 'restricted@test.com',
              fullName: 'Restricted User',
              role: 'Viewer',
              governorateId: 999,
              governorateName: 'NonExistentGovernorate',
              siteIds: [] // No site access
            };
            
            const mockContext = createMockAuthContext(restrictedUser, true, false);
            const mockOnSiteClick = jest.fn();
            
            renderWithProviders(
              <RoleBasedMap
                sites={sites}
                onSiteClick={mockOnSiteClick}
                center={[26.8206, 30.8025]}
                zoom={6}
              />,
              mockContext
            );
            
            // Should show no accessible sites (no markers to click)
            expect(screen.getByText('No accessible sites')).toBeInTheDocument();
            expect(screen.queryByTestId('marker')).not.toBeInTheDocument();
            
            // onSiteClick should never be called
            expect(mockOnSiteClick).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain consistent navigation behavior across different user roles', () => {
      fc.assert(
        fc.property(
          userArbitrary,
          siteArbitrary,
          (user, site) => {
            const mockContext = createMockAuthContext(user, true, false);
            const mockOnSiteClick = jest.fn();
            
            // Test with single site to ensure consistent behavior
            renderWithProviders(
              <RoleBasedMap
                sites={[site]}
                onSiteClick={mockOnSiteClick}
                center={[26.8206, 30.8025]}
                zoom={6}
              />,
              mockContext
            );
            
            // Check if user can access this site
            const userFormatted = {
              id: user.id.toString(),
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              roles: [user.role],
              accessibleSites: user.siteIds?.map(id => id.toString()) || [],
              governorate: user.governorateName,
              role: user.role,
              governorateId: user.governorateId,
              governorateName: user.governorateName,
              siteIds: user.siteIds,
            };
            
            const canAccess = canUserAccessSite(site.id, userFormatted);
            
            if (canAccess) {
              // Should show marker and allow clicking
              const markers = screen.getAllByTestId('marker');
              expect(markers).toHaveLength(1);
              
              fireEvent.click(markers[0]);
              expect(mockOnSiteClick).toHaveBeenCalledWith(site.id);
            } else {
              // Should not show marker
              expect(screen.queryByTestId('marker')).not.toBeInTheDocument();
              expect(mockOnSiteClick).not.toHaveBeenCalled();
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Additional comprehensive property tests
  describe('Map Component Integration Properties', () => {
    it('should maintain consistent map state across different site configurations', () => {
      fc.assert(
        fc.property(
          userArbitrary.filter(user => user.role === 'Admin'),
          fc.array(siteArbitrary, { minLength: 0, maxLength: 10 }),
          coordinatesArbitrary,
          fc.integer({ min: 1, max: 15 }),
          (adminUser, sites, center, zoom) => {
            const mockContext = createMockAuthContext(adminUser, true, false);
            const mockOnSiteClick = jest.fn();
            
            renderWithProviders(
              <RoleBasedMap
                sites={sites}
                onSiteClick={mockOnSiteClick}
                center={center}
                zoom={zoom}
              />,
              mockContext
            );
            
            if (sites.length > 0) {
              // Should show map with markers
              expect(screen.getByTestId('leaflet-map')).toBeInTheDocument();
              const markers = screen.getAllByTestId('marker');
              expect(markers).toHaveLength(sites.length);
            } else {
              // Should show no accessible sites message for empty array
              expect(screen.getByText('No accessible sites')).toBeInTheDocument();
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});