import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { UPSAuthProvider } from '../../contexts/UPSAuthContext';
import { AuthProvider } from '../../../../shared/contexts/AuthContext';

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

const mockAdminUser = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'Admin' as const,
  governorateId: 1,
  governorateName: 'Minia',
  siteIds: [1, 2, 3]
};

const mockGovernorateUser = {
  id: 2,
  username: 'govuser',
  email: 'gov@example.com',
  fullName: 'Governorate User',
  role: 'Governorate' as const,
  governorateId: 1,
  governorateName: 'Minia',
  siteIds: [1, 2]
};

const mockViewerUser = {
  id: 3,
  username: 'viewer',
  email: 'viewer@example.com',
  fullName: 'Viewer User',
  role: 'Viewer' as const,
  governorateId: 1,
  governorateName: 'Minia',
  siteIds: [1]
};

jest.mock('../../../../shared/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const { useAuth } = require('../../../../shared/contexts/AuthContext');

const TestContent: React.FC = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithProviders = (
  component: React.ReactElement,
  mockAuthContextValue: any,
  initialEntries = ['/']
) => {
  useAuth.mockReturnValue(mockAuthContextValue);
  
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <UPSAuthProvider>
          {component}
        </UPSAuthProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication checks', () => {
    it('should show loading state when authentication is loading', () => {
      const mockContext = createMockAuthContext(null, false, true);
      
      renderWithProviders(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByText('Verifying access permissions...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
      const mockContext = createMockAuthContext(null, false, false);
      
      renderWithProviders(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      // Should not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render protected content when user is authenticated', () => {
      const mockContext = createMockAuthContext(mockAdminUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Role-based access control', () => {
    it('should allow access when user has required role', () => {
      const mockContext = createMockAuthContext(mockAdminUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute requiredRole="Admin">
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should deny access when user lacks required role', () => {
      const mockContext = createMockAuthContext(mockViewerUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute requiredRole="Admin">
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('This page requires Admin role access.')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Site access control', () => {
    it('should allow access when user can access required site', () => {
      const mockContext = createMockAuthContext(mockAdminUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute requiredSiteAccess="1">
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should deny access when user cannot access required site', () => {
      const mockContext = createMockAuthContext(mockViewerUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute requiredSiteAccess="999">
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText("You don't have access to site 999.")).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Governorate access control', () => {
    it('should allow access when user can access required governorate', () => {
      const mockContext = createMockAuthContext(mockGovernorateUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute requiredGovernorateAccess="Minia">
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should deny access when user cannot access required governorate', () => {
      const mockContext = createMockAuthContext(mockGovernorateUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute requiredGovernorateAccess="Cairo">
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText("You don't have access to Cairo governorate.")).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Master view access control', () => {
    it('should allow master access for admin users', () => {
      const mockContext = createMockAuthContext(mockAdminUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute requireMasterAccess={true}>
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should deny master access for non-admin users', () => {
      const mockContext = createMockAuthContext(mockGovernorateUser, true, false);
      
      renderWithProviders(
        <ProtectedRoute requireMasterAccess={true}>
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('This page requires administrator privileges.')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Custom fallback', () => {
    it('should render custom fallback during loading', () => {
      const mockContext = createMockAuthContext(null, false, true);
      const customFallback = <div data-testid="custom-loading">Custom Loading...</div>;
      
      renderWithProviders(
        <ProtectedRoute fallback={customFallback}>
          <TestContent />
        </ProtectedRoute>,
        mockContext
      );
      
      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
      expect(screen.queryByText('Verifying access permissions...')).not.toBeInTheDocument();
    });
  });
});