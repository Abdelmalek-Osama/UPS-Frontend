import apiService, { AuthResponse as MainAuthResponse } from '../../../shared/utils/apiService';
import type { LoginCredentials, AuthResponse, User } from '../types';

/**
 * UPS-specific authentication service
 * Integrates with the main authentication system while providing UPS-specific functionality
 */
class UPSAuthService {
  /**
   * Authenticate user with credentials
   * Integrates with the main authentication system
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.loginUser({
        userName: credentials.email,
        password: credentials.password
      });

      if (!response.isSuccess) {
        throw new Error(response.message || 'Authentication failed');
      }

      const { accessToken, refreshToken, accessTokenExpiryDate } = response.data;
      
      // Parse user data from JWT token
      const user = this.parseUserFromToken(accessToken);
      
      return {
        accessToken,
        refreshToken,
        user,
        expiresAt: new Date(accessTokenExpiryDate)
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Authentication failed');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    try {
      // This would integrate with the main auth system's token refresh
      // For now, we'll throw an error as this should be handled by the main auth
      throw new Error('Token refresh should be handled by the main authentication system');
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      await apiService.logoutUser();
    } catch (error) {
      // Even if logout API fails, we should clear local data
      console.error('Logout API call failed:', error);
    }
  }

  /**
   * Validate authentication token
   */
  async validateToken(token: string): Promise<User> {
    try {
      const user = this.parseUserFromToken(token);
      if (!user) {
        throw new Error('Invalid token');
      }
      return user;
    } catch (error) {
      throw new Error('Token validation failed');
    }
  }

  /**
   * Parse user data from JWT token
   */
  private parseUserFromToken(token: string): User {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decodedToken = JSON.parse(jsonPayload);
      
      // Parse site IDs
      const rawSiteIds = decodedToken.siteIds || decodedToken.SiteIds;
      const parsedSiteIds = Array.isArray(rawSiteIds)
        ? rawSiteIds
        : typeof rawSiteIds === 'string'
          ? rawSiteIds.split(',').map((id: string) => Number(id.trim())).filter((id: number) => !Number.isNaN(id))
          : [];

      return {
        id: decodedToken.sub || decodedToken.id,
        username: decodedToken.userName || decodedToken.email,
        email: decodedToken.email,
        fullName: decodedToken.FullName || decodedToken.fullName || decodedToken.unique_name || '',
        roles: [decodedToken.role || decodedToken.Role], // Convert single role to array
        accessibleSites: parsedSiteIds.map(id => id.toString()),
        governorate: decodedToken.governorateName || decodedToken.GovernorateName,
        // Backward compatibility fields
        role: decodedToken.role || decodedToken.Role,
        governorateId: decodedToken.governorateId || decodedToken.GovernorateId,
        governorateName: decodedToken.governorateName || decodedToken.GovernorateName,
        siteIds: parsedSiteIds,
      };
    } catch (error) {
      throw new Error('Failed to parse user data from token');
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: User | null, role: string): boolean {
    if (!user) return false;
    return user.roles?.includes(role) || user.role === role;
  }

  /**
   * Check if user can access specific site
   */
  canAccessSite(user: User | null, siteId: string): boolean {
    if (!user) return false;
    
    // Admin and SuperAdmin can access all sites
    if (this.hasRole(user, 'Admin') || this.hasRole(user, 'SuperAdmin')) {
      return true;
    }
    
    // Check if user has access to specific site
    const numericSiteId = parseInt(siteId);
    return user.accessibleSites?.includes(siteId) || 
           user.siteIds?.includes(numericSiteId) || false;
  }

  /**
   * Check if user can access specific governorate
   */
  canAccessGovernorate(user: User | null, governorate: string): boolean {
    if (!user) return false;
    
    // Admin and SuperAdmin can access all governorates
    if (this.hasRole(user, 'Admin') || this.hasRole(user, 'SuperAdmin')) {
      return true;
    }
    
    // Check if user's governorate matches
    return user.governorate === governorate || user.governorateName === governorate;
  }

  /**
   * Check if user can access master view
   */
  canAccessMasterView(user: User | null): boolean {
    if (!user) return false;
    return this.hasRole(user, 'Admin') || this.hasRole(user, 'SuperAdmin');
  }

  /**
   * Filter sites based on user access
   */
  filterAccessibleSites<T extends { id: string }>(user: User | null, sites: T[]): T[] {
    if (!user) return [];
    
    // Admin and SuperAdmin can access all sites
    if (this.hasRole(user, 'Admin') || this.hasRole(user, 'SuperAdmin')) {
      return sites;
    }
    
    // Filter sites based on user access
    return sites.filter(site => this.canAccessSite(user, site.id));
  }

  /**
   * Get user's accessible governorates
   */
  getAccessibleGovernorates(user: User | null): string[] {
    if (!user) return [];
    
    // Admin and SuperAdmin can access all governorates
    if (this.hasRole(user, 'Admin') || this.hasRole(user, 'SuperAdmin')) {
      return ['all']; // Special marker for all access
    }
    
    // Return user's specific governorate
    const governorate = user.governorate || user.governorateName;
    return governorate ? [governorate] : [];
  }
}

// Export singleton instance
export const authService = new UPSAuthService();

// Export the interface for dependency injection
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  refreshToken(): Promise<string>;
  logout(): Promise<void>;
  validateToken(token: string): Promise<User>;
  hasRole(user: User | null, role: string): boolean;
  canAccessSite(user: User | null, siteId: string): boolean;
  canAccessGovernorate(user: User | null, governorate: string): boolean;
  canAccessMasterView(user: User | null): boolean;
  filterAccessibleSites<T extends { id: string }>(user: User | null, sites: T[]): T[];
  getAccessibleGovernorates(user: User | null): string[];
}

export default authService;