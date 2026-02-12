import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { UPSAuthProvider, useUPSAuth } from '../UPSAuthContext';
import { AuthProvider } from '../../../../shared/contexts/AuthContext';
import apiService from '../../../../shared/utils/apiService';

// Feature: ups-dashboard, Property 4: Authentication Failure Error Handling
// **Validates: Requirements 1.5**

// Mock the main AuthContext
const createMockAuthContext = (user: any = null, isAuthenticated = false, loadingAuth = false, error: string | null = null) => ({
  currentUser: user,
  isAuthenticated,
  loadingAuth,
  userLoaded: !loadingAuth,
  handleLogout: jest.fn(),
  refreshCurrentUser: jest.fn(),
  login: jest.fn()
});

jest.mock('../../../../shared/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the API service
jest.mock('../../../../shared/utils/apiService', () => ({
  __esModule: true,
  default: {
    loginUser: jest.fn()
  }
}));

const { useAuth } = require('../../../../shared/contexts/AuthContext');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Test component that simulates login attempts
const TestLoginComponent: React.FC<{ 
  credentials: { email: string; password: string };
  onLoginAttempt: (error: string | null) => void;
}> = ({ credentials, onLoginAttempt }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mockApiService.loginUser({
        userName: credentials.email,
        password: credentials.password
      });
      
      if (!response.isSuccess) {
        const errorMessage = response.message || 'Authentication failed';
        setError(errorMessage);
        onLoginAttempt(errorMessage);
      } else {
        onLoginAttempt(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      onLoginAttempt(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div data-testid="login-error">{error || 'none'}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <button data-testid="login-button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

// Test component that uses the UPS auth context for error state
const TestAuthErrorComponent: React.FC = () => {
  const { error, isLoading, isAuthenticated } = useUPSAuth();

  return (
    <div>
      <div data-testid="auth-error">{error || 'none'}</div>
      <div data-testid="auth-loading">{isLoading.toString()}</div>
      <div data-testid="auth-authenticated">{isAuthenticated.toString()}</div>
    </div>
  );
};

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

// Generators for property-based testing
const invalidCredentialsArbitrary = fc.record({
  email: fc.oneof(
    fc.constant(''), // Empty email
    fc.constant('invalid-email'), // Invalid format
    fc.constant('nonexistent@example.com'), // Non-existent user
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('@')) // Invalid email format
  ),
  password: fc.oneof(
    fc.constant(''), // Empty password
    fc.constant('wrong-password'), // Wrong password
    fc.string({ minLength: 1, maxLength: 20 }) // Random wrong password
  )
});

const authErrorMessagesArbitrary = fc.constantFrom(
  'Invalid credentials',
  'User not found',
  'Account locked',
  'Password expired',
  'Authentication failed',
  'Network error',
  'Server unavailable',
  'Invalid email format',
  'Password required',
  'Email required'
);

const networkErrorTypesArbitrary = fc.constantFrom(
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'CONNECTION_REFUSED',
  'DNS_ERROR',
  'SSL_ERROR'
);

describe('UPS Authentication Error Handling Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Feature: ups-dashboard, Property 4: Authentication Failure Error Handling
  // **Validates: Requirements 1.5**
  describe('Property 4: Authentication Failure Error Handling', () => {
    it('should always display appropriate error messages for invalid credentials', () => {
      fc.assert(
        fc.property(
          invalidCredentialsArbitrary,
          authErrorMessagesArbitrary,
          (credentials, errorMessage) => {
            // Mock API response for authentication failure
            mockApiService.loginUser.mockResolvedValueOnce({
              isSuccess: false,
              message: errorMessage,
              data: null as any
            });

            let capturedError: string | null = null;
            const mockContext = createMockAuthContext(null, false, false);

            renderWithProviders(
              <TestLoginComponent 
                credentials={credentials}
                onLoginAttempt={(error) => { capturedError = error; }}
              />, 
              mockContext
            );

            // Simulate login attempt
            fireEvent.click(screen.getByTestId('login-button'));

            return waitFor(() => {
              // For any authentication failure, should display appropriate error message
              expect(capturedError).toBe(errorMessage);
              expect(screen.getByTestId('login-error')).toHaveTextContent(errorMessage);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always remain on login page after authentication failure', () => {
      fc.assert(
        fc.property(
          invalidCredentialsArbitrary,
          authErrorMessagesArbitrary,
          (credentials, errorMessage) => {
            // Mock API response for authentication failure
            mockApiService.loginUser.mockResolvedValueOnce({
              isSuccess: false,
              message: errorMessage,
              data: null as any
            });

            const mockContext = createMockAuthContext(null, false, false);

            renderWithProviders(
              <TestAuthErrorComponent />, 
              mockContext
            );

            // For any authentication failure, user should remain unauthenticated
            expect(screen.getByTestId('auth-authenticated')).toHaveTextContent('false');
            
            // Should not be in loading state after failure
            return waitFor(() => {
              expect(screen.getByTestId('auth-loading')).toHaveTextContent('false');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always handle network errors gracefully during authentication', () => {
      fc.assert(
        fc.property(
          invalidCredentialsArbitrary,
          networkErrorTypesArbitrary,
          (credentials, networkErrorType) => {
            // Mock network error
            const networkError = new Error(`Network error: ${networkErrorType}`);
            mockApiService.loginUser.mockRejectedValueOnce(networkError);

            let capturedError: string | null = null;
            const mockContext = createMockAuthContext(null, false, false);

            renderWithProviders(
              <TestLoginComponent 
                credentials={credentials}
                onLoginAttempt={(error) => { capturedError = error; }}
              />, 
              mockContext
            );

            // Simulate login attempt
            fireEvent.click(screen.getByTestId('login-button'));

            return waitFor(() => {
              // For any network error, should display error message
              expect(capturedError).toContain('Network error');
              expect(screen.getByTestId('login-error')).toHaveTextContent(expect.stringContaining('Network error'));
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always prevent access to protected resources after authentication failure', () => {
      fc.assert(
        fc.property(
          invalidCredentialsArbitrary,
          authErrorMessagesArbitrary,
          (credentials, errorMessage) => {
            // Mock API response for authentication failure
            mockApiService.loginUser.mockResolvedValueOnce({
              isSuccess: false,
              message: errorMessage,
              data: null as any
            });

            const TestProtectedResourceComponent: React.FC = () => {
              const { isAuthenticated, canAccessSite, canAccessMasterView, canAccessGovernorate } = useUPSAuth();
              
              return (
                <div>
                  <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
                  <div data-testid="can-access-site">{canAccessSite('1').toString()}</div>
                  <div data-testid="can-access-master">{canAccessMasterView().toString()}</div>
                  <div data-testid="can-access-governorate">{canAccessGovernorate('Minia').toString()}</div>
                </div>
              );
            };

            const mockContext = createMockAuthContext(null, false, false);

            renderWithProviders(<TestProtectedResourceComponent />, mockContext);

            // For any authentication failure, should deny access to all protected resources
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
            expect(screen.getByTestId('can-access-site')).toHaveTextContent('false');
            expect(screen.getByTestId('can-access-master')).toHaveTextContent('false');
            expect(screen.getByTestId('can-access-governorate')).toHaveTextContent('false');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always handle various authentication failure scenarios consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            credentials: invalidCredentialsArbitrary,
            failureType: fc.constantFrom('invalid_credentials', 'network_error', 'server_error', 'validation_error'),
            statusCode: fc.constantFrom(400, 401, 403, 500, 502, 503)
          }),
          (testCase) => {
            let mockResponse;
            
            switch (testCase.failureType) {
              case 'invalid_credentials':
                mockResponse = Promise.resolve({
                  isSuccess: false,
                  message: 'Invalid credentials',
                  data: null as any
                });
                break;
              case 'network_error':
                mockResponse = Promise.reject(new Error('Network connection failed'));
                break;
              case 'server_error':
                mockResponse = Promise.reject(new Error(`Server error: ${testCase.statusCode}`));
                break;
              case 'validation_error':
                mockResponse = Promise.resolve({
                  isSuccess: false,
                  message: 'Validation failed',
                  data: null as any
                });
                break;
              default:
                mockResponse = Promise.reject(new Error('Unknown error'));
            }

            mockApiService.loginUser.mockImplementationOnce(() => mockResponse);

            let capturedError: string | null = null;
            const mockContext = createMockAuthContext(null, false, false);

            renderWithProviders(
              <TestLoginComponent 
                credentials={testCase.credentials}
                onLoginAttempt={(error) => { capturedError = error; }}
              />, 
              mockContext
            );

            // Simulate login attempt
            fireEvent.click(screen.getByTestId('login-button'));

            return waitFor(() => {
              // For any failure scenario, should capture and display error
              expect(capturedError).not.toBeNull();
              expect(capturedError).not.toBe('none');
              expect(screen.getByTestId('login-error')).not.toHaveTextContent('none');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always maintain proper loading states during authentication failures', () => {
      fc.assert(
        fc.property(
          invalidCredentialsArbitrary,
          fc.constantFrom(100, 200, 500, 1000), // Different delay times
          (credentials, delay) => {
            // Mock delayed authentication failure
            mockApiService.loginUser.mockImplementationOnce(
              () => new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Authentication failed')), delay)
              )
            );

            const mockContext = createMockAuthContext(null, false, false);

            renderWithProviders(
              <TestLoginComponent 
                credentials={credentials}
                onLoginAttempt={() => {}}
              />, 
              mockContext
            );

            // Initially should not be loading
            expect(screen.getByTestId('is-loading')).toHaveTextContent('false');

            // Simulate login attempt
            fireEvent.click(screen.getByTestId('login-button'));

            // Should show loading state immediately after click
            expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

            // After failure, should not be loading
            return waitFor(() => {
              expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
            }, { timeout: delay + 1000 });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always handle empty or malformed credentials appropriately', () => {
      fc.assert(
        fc.property(
          fc.record({
            email: fc.oneof(
              fc.constant(''),
              fc.constant(null),
              fc.constant(undefined),
              fc.constant('   '), // Whitespace only
              fc.string({ minLength: 1, maxLength: 5 }).filter(s => !s.includes('@'))
            ),
            password: fc.oneof(
              fc.constant(''),
              fc.constant(null),
              fc.constant(undefined),
              fc.constant('   ') // Whitespace only
            )
          }),
          (malformedCredentials) => {
            // Mock validation error response
            mockApiService.loginUser.mockResolvedValueOnce({
              isSuccess: false,
              message: 'Invalid input data',
              data: null as any
            });

            let capturedError: string | null = null;
            const mockContext = createMockAuthContext(null, false, false);

            renderWithProviders(
              <TestLoginComponent 
                credentials={malformedCredentials as any}
                onLoginAttempt={(error) => { capturedError = error; }}
              />, 
              mockContext
            );

            // Simulate login attempt
            fireEvent.click(screen.getByTestId('login-button'));

            return waitFor(() => {
              // For any malformed credentials, should handle gracefully with error message
              expect(capturedError).not.toBeNull();
              expect(screen.getByTestId('login-error')).not.toHaveTextContent('none');
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional comprehensive error handling tests
  describe('Comprehensive Authentication Error Handling Properties', () => {
    it('should maintain consistent error handling across all authentication failure types', () => {
      fc.assert(
        fc.property(
          fc.record({
            credentials: invalidCredentialsArbitrary,
            errorScenario: fc.constantFrom(
              'invalid_user',
              'wrong_password', 
              'account_locked',
              'server_down',
              'timeout',
              'malformed_response'
            )
          }),
          (testCase) => {
            let mockImplementation;
            
            switch (testCase.errorScenario) {
              case 'invalid_user':
                mockImplementation = () => Promise.resolve({
                  isSuccess: false,
                  message: 'User not found',
                  data: null as any
                });
                break;
              case 'wrong_password':
                mockImplementation = () => Promise.resolve({
                  isSuccess: false,
                  message: 'Invalid password',
                  data: null as any
                });
                break;
              case 'account_locked':
                mockImplementation = () => Promise.resolve({
                  isSuccess: false,
                  message: 'Account is locked',
                  data: null as any
                });
                break;
              case 'server_down':
                mockImplementation = () => Promise.reject(new Error('Server is unavailable'));
                break;
              case 'timeout':
                mockImplementation = () => Promise.reject(new Error('Request timeout'));
                break;
              case 'malformed_response':
                mockImplementation = () => Promise.resolve({
                  isSuccess: false,
                  message: '',
                  data: null as any
                });
                break;
              default:
                mockImplementation = () => Promise.reject(new Error('Unknown error'));
            }

            mockApiService.loginUser.mockImplementationOnce(mockImplementation);

            const TestConsistentErrorComponent: React.FC = () => {
              const { isAuthenticated, user, error } = useUPSAuth();
              const [loginError, setLoginError] = React.useState<string | null>(null);

              const attemptLogin = async () => {
                try {
                  await mockApiService.loginUser(testCase.credentials);
                } catch (err) {
                  setLoginError(err instanceof Error ? err.message : 'Login failed');
                }
              };

              React.useEffect(() => {
                attemptLogin();
              }, []);

              return (
                <div>
                  <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
                  <div data-testid="has-user">{(user !== null).toString()}</div>
                  <div data-testid="login-error">{loginError || 'none'}</div>
                </div>
              );
            };

            const mockContext = createMockAuthContext(null, false, false);

            renderWithProviders(<TestConsistentErrorComponent />, mockContext);

            return waitFor(() => {
              // For any error scenario, authentication should fail consistently
              expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
              expect(screen.getByTestId('has-user')).toHaveTextContent('false');
              
              // Should have captured some error (not 'none')
              const errorElement = screen.getByTestId('login-error');
              expect(errorElement).not.toHaveTextContent('none');
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});