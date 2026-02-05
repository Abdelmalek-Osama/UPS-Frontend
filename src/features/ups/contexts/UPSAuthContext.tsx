import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import type { User, LoginCredentials } from '../types';

/**
 * UPS-specific authentication context
 * Extends the main auth context with UPS-specific functionality
 */
interface UPSAuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  canAccessSite: (siteId: string) => boolean;
  canAccessGovernorate: (governorate: string) => boolean;
  canAccessMasterView: () => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const UPSAuthContext = createContext<UPSAuthContextType | undefined>(undefined);

interface UPSAuthProviderProps {
  children: ReactNode;
}

export const UPSAuthProvider: React.FC<UPSAuthProviderProps> = ({ children }) => {
  const { 
    currentUser, 
    isAuthenticated, 
    loadingAuth, 
    handleLogout,
    login: mainLogin 
  } = useAuth();

  // Convert main auth user to UPS user format
  const user: User | null = useMemo(() => {
    if (!currentUser) return null;
    
    return {
      id: currentUser.id?.toString() || '0', // Handle undefined id
      username: currentUser.username || '',
      email: currentUser.email || '',
      fullName: currentUser.fullName || '',
      roles: [currentUser.role], // Convert single role to array
      accessibleSites: currentUser.siteIds?.map(id => id.toString()) || [],
      governorate: currentUser.governorateName,
      // Backward compatibility fields
      role: currentUser.role,
      governorateId: currentUser.governorateId,
      governorateName: currentUser.governorateName,
      siteIds: currentUser.siteIds,
    };
  }, [currentUser]);

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.roles?.includes(role) || user.role === role;
  }, [user]);

  const canAccessSite = useCallback((siteId: string): boolean => {
    if (!user) return false;
    
    // Admin and SuperAdmin can access all sites
    if (hasRole('Admin') || hasRole('SuperAdmin')) return true;
    
    // Check if user has access to specific site
    const numericSiteId = parseInt(siteId);
    return user.accessibleSites?.includes(siteId) || 
           user.siteIds?.includes(numericSiteId) || false;
  }, [user, hasRole]);

  const canAccessGovernorate = useCallback((governorate: string): boolean => {
    if (!user) return false;
    
    // Admin and SuperAdmin can access all governorates
    if (hasRole('Admin') || hasRole('SuperAdmin')) return true;
    
    // Check if user's governorate matches
    return user.governorate === governorate || user.governorateName === governorate;
  }, [user, hasRole]);

  const canAccessMasterView = useCallback((): boolean => {
    if (!user) return false;
    return hasRole('Admin') || hasRole('SuperAdmin');
  }, [user, hasRole]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    // This would integrate with the main auth system
    // For now, we'll throw an error as login should be handled by the main auth
    throw new Error('Login should be handled through the main authentication system');
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await handleLogout();
  }, [handleLogout]);

  const value: UPSAuthContextType = {
    user,
    login,
    logout,
    hasRole,
    canAccessSite,
    canAccessGovernorate,
    canAccessMasterView,
    isAuthenticated,
    isLoading: loadingAuth,
    error: null, // Could be enhanced to track UPS-specific errors
  };

  return (
    <UPSAuthContext.Provider value={value}>
      {children}
    </UPSAuthContext.Provider>
  );
};

export const useUPSAuth = (): UPSAuthContextType => {
  const context = useContext(UPSAuthContext);
  if (context === undefined) {
    throw new Error('useUPSAuth must be used within a UPSAuthProvider');
  }
  return context;
};