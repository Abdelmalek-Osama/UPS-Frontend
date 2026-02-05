import React, { useEffect } from 'react';
import { LoginPage } from './features/auth';
import { DashboardLayout } from './components/DashboardLayout';
import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage, SitePage, GovernoratePage, MasterPage, ReportsPage, UPSAuthProvider, ProtectedRoute } from './features/ups';
import { AuthProvider, useAuth } from './shared/contexts/AuthContext';
import { ApiConfig } from './features/ups/utils/apiConfig';

// Initialize API configuration on app startup
ApiConfig.initialize();

export default function App() {
  return (
    <AuthProvider>
      <AuthRoutes />
    </AuthProvider>
  );
}

function AuthRoutes() {
  const { isAuthenticated, currentUser, loadingAuth, userLoaded, handleLogout, refreshCurrentUser } = useAuth();

  // If not authenticated, redirect to login page
  if (!loadingAuth && !isAuthenticated && window.location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutTrigger />} />
      {/* Protected routes wrapped in UPSAuthProvider */}
      <Route 
        path="/*" 
        element={
          loadingAuth ? null : ( // Render null while authentication is loading
            isAuthenticated && userLoaded ? (
              <UPSAuthProvider>
                <Routes>
                  <Route 
                    path="/" 
                    element={<DashboardLayout currentUser={currentUser!} onLogout={handleLogout} refreshCurrentUser={refreshCurrentUser} />}
                  >
                    <Route index element={
                      <ProtectedRoute>
                        <LandingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="sites/:siteId" element={
                      <ProtectedRoute>
                        <SitePage />
                      </ProtectedRoute>
                    } />
                    <Route path="governorates/:governorateId" element={
                      <ProtectedRoute>
                        <GovernoratePage />
                      </ProtectedRoute>
                    } />
                    <Route path="master" element={
                      <ProtectedRoute requireMasterAccess={true}>
                        <MasterPage />
                      </ProtectedRoute>
                    } />
                    <Route path="reports" element={
                      <ProtectedRoute>
                        <ReportsPage />
                      </ProtectedRoute>
                    } />
                  </Route>
                </Routes>
              </UPSAuthProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          )
        }
      />
    </Routes>
  );
}

const LogoutTrigger: React.FC = () => {
  const { handleLogout } = useAuth();
  useEffect(() => {
    handleLogout();
  }, [handleLogout]);
  return null;
};
