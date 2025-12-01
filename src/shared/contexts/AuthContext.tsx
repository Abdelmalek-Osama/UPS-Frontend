import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, removeAuthCookies } from '../utils/cookieService';
import apiService from '../utils/apiService'; // Import default export
import { setLogoutCallback } from '../utils/apiService'; // Import named export separately
import type { User } from '../../features/auth/types';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  loadingAuth: boolean;
  userLoaded: boolean;
  handleLogout: () => Promise<void>;
  refreshCurrentUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!getAccessToken() && sessionStorage.getItem('isLogged') === 'true';

  const refreshCurrentUser = useCallback(() => {
    const token = getAccessToken();
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken) {
        setCurrentUser({
          id: decodedToken.sub,
          username: decodedToken.userName || decodedToken.email,
          email: decodedToken.email,
          fullName: decodedToken.FullName || decodedToken.fullName || decodedToken.unique_name || '',
          role: decodedToken.role || decodedToken.Role,
        });
        setUserLoaded(true);
      } else {
        setCurrentUser(null);
        setUserLoaded(false);
      }
    } else {
      setCurrentUser(null);
      setUserLoaded(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    // console.log('AuthContext: handleLogout called.');
    if (!getAccessToken() && sessionStorage.getItem('isLogged') !== 'true') {
      // console.log('AuthContext: Already logged out, navigating to login.');
      navigate('/login');
      return;
    }

    try {
      // console.log('AuthContext: Attempting apiService.logoutUser()...');
      await apiService.logoutUser();
    } catch (error) {
      console.error("Error during logout API call:", error);
    } finally {
      // console.log('AuthContext: Clearing auth cookies and session storage.');
      removeAuthCookies();
      sessionStorage.setItem('isLogged', 'false');
      setCurrentUser(null);
      // console.log('AuthContext: Navigating to login.');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // This effect runs only once on mount to set the initial auth state.
    // Subsequent auth state changes are handled by direct calls to handleLogin/handleLogout
    // or by refreshCurrentUser.
    const checkAuthStatus = () => {
      if (isAuthenticated) {
        refreshCurrentUser();
      } else {
        setCurrentUser(null);
        setUserLoaded(false);
      }
      setLoadingAuth(false);
    };

    checkAuthStatus();
  }, [isAuthenticated, refreshCurrentUser]);

  // Expose logout function to apiService
  useEffect(() => {
    setLogoutCallback(handleLogout);
  }, [handleLogout]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      loadingAuth,
      userLoaded,
      handleLogout,
      refreshCurrentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
