import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUPSAuth } from '../contexts/UPSAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';

/**
 * Protected route component for UPS Dashboard
 * Handles authentication and role-based access control
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredSiteAccess?: string;
  requiredGovernorateAccess?: string;
  requireMasterAccess?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Loading component for authentication checks
 */
const AuthLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Verifying access permissions...</p>
      </CardContent>
    </Card>
  </div>
);

/**
 * Access denied component
 */
const AccessDeniedFallback: React.FC<{ reason: string }> = ({ reason }) => {
  const { logout } = useUPSAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">{reason}</p>
          </div>
          <p className="text-gray-600 text-sm">
            You don't have the required permissions to access this page.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="text-sm"
            >
              Go Back
            </Button>
            <Button 
              variant="outline" 
              onClick={() => logout()}
              className="text-sm"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredSiteAccess,
  requiredGovernorateAccess,
  requireMasterAccess = false,
  fallback,
}) => {
  const { 
    user, 
    hasRole, 
    canAccessSite, 
    canAccessGovernorate, 
    canAccessMasterView, 
    isAuthenticated,
    isLoading 
  } = useUPSAuth();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return fallback || <AuthLoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <AccessDeniedFallback 
        reason={`This page requires ${requiredRole} role access.`} 
      />
    );
  }

  // Check site-specific access
  if (requiredSiteAccess && !canAccessSite(requiredSiteAccess)) {
    return (
      <AccessDeniedFallback 
        reason={`You don't have access to site ${requiredSiteAccess}.`} 
      />
    );
  }

  // Check governorate-specific access
  if (requiredGovernorateAccess && !canAccessGovernorate(requiredGovernorateAccess)) {
    return (
      <AccessDeniedFallback 
        reason={`You don't have access to ${requiredGovernorateAccess} governorate.`} 
      />
    );
  }

  // Check master view access
  if (requireMasterAccess && !canAccessMasterView()) {
    return (
      <AccessDeniedFallback 
        reason="This page requires administrator privileges." 
      />
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};