import React from 'react';
import { render, screen } from '@testing-library/react';
import { UPSAuthProvider, useUPSAuth } from '../UPSAuthContext';
import { AuthProvider } from '../../../../shared/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the main AuthContext
const mockAuthContext = {
  currentUser: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'Admin' as const,
    governorateId: 1,
    governorateName: 'Minia',
    siteIds: [1, 2, 3]
  },
  isAuthenticated: true,
  loadingAuth: false,
  userLoaded: true,
  handleLogout: jest.fn(),
  refreshCurrentUser: jest.fn(),
  login: jest.fn()
};

jest.mock('../../../../shared/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Test component that uses the UPS auth context
const TestComponent: React.FC = () => {
  const { 
    user, 
    hasRole, 
    canAccessSite, 
    canAccessGovernorate, 
    canAccessMasterView,
    isAuthenticated 
  } = useUPSAuth();

  return (
    <div>
      <div data-testid="user-id">{user?.id}</div>
      <div data-testid="user-name">{user?.fullName}</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="is-admin">{hasRole('Admin').toString()}</div>
      <div data-testid="can-access-site-1">{canAccessSite('1').toString()}</div>
      <div data-testid="can-access-minia">{canAccessGovernorate('Minia').toString()}</div>
      <div data-testid="can-access-master">{canAccessMasterView().toString()}</div>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
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

describe('UPSAuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide user information correctly', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('user-id')).toHaveTextContent('1');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('should handle role checks correctly', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
  });

  it('should handle site access checks correctly', () => {
    renderWithProviders(<TestComponent />);
    
    // Admin should have access to all sites
    expect(screen.getByTestId('can-access-site-1')).toHaveTextContent('true');
  });

  it('should handle governorate access checks correctly', () => {
    renderWithProviders(<TestComponent />);
    
    // Admin should have access to all governorates
    expect(screen.getByTestId('can-access-minia')).toHaveTextContent('true');
  });

  it('should handle master view access correctly', () => {
    renderWithProviders(<TestComponent />);
    
    // Admin should have access to master view
    expect(screen.getByTestId('can-access-master')).toHaveTextContent('true');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUPSAuth must be used within a UPSAuthProvider');
    
    consoleSpy.mockRestore();
  });
});

describe('UPSAuthContext with Governorate User', () => {
  beforeEach(() => {
    // Mock a governorate-level user
    mockAuthContext.currentUser = {
      id: 2,
      username: 'govuser',
      email: 'gov@example.com',
      fullName: 'Governorate User',
      role: 'Governorate' as const,
      governorateId: 1,
      governorateName: 'Minia',
      siteIds: [1, 2]
    };
  });

  it('should restrict access for governorate users', () => {
    renderWithProviders(<TestComponent />);
    
    // Governorate user should not have master access
    expect(screen.getByTestId('can-access-master')).toHaveTextContent('false');
    
    // But should have access to their governorate
    expect(screen.getByTestId('can-access-minia')).toHaveTextContent('true');
  });
});

describe('UPSAuthContext with no user', () => {
  beforeEach(() => {
    mockAuthContext.currentUser = null;
    mockAuthContext.isAuthenticated = false;
  });

  it('should handle unauthenticated state', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('user-id')).toHaveTextContent('');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    expect(screen.getByTestId('can-access-site-1')).toHaveTextContent('false');
    expect(screen.getByTestId('can-access-minia')).toHaveTextContent('false');
    expect(screen.getByTestId('can-access-master')).toHaveTextContent('false');
  });
});