import React, { useState, useEffect } from 'react';
import { LoginPage } from './features/auth';
import { DashboardLayout } from './components/DashboardLayout';
import type { User } from './features/auth/types';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { DashboardHome } from './features/dashboard';
import {AlarmConfiguration} from './features/alarms/components/AlarmConfiguration';
import { AlarmEvents } from './features/alarms/components/AlarmEvents';
// import {LoginPage} from './features/auth/components/LoginPage';
import {FlowCalculations} from './features/flow-calculations/components/FlowCalculations';
import {ReadingsManagement} from './features/readings/components/ReadingsManagement';
import {ReadingLogs} from './features/readings/components/ReadingLogs';
import {SitesManagement} from './features/sites/components/SitesManagement';
import {UserManagement} from './features/users/components/UserManagement';
import { getAccessToken, removeAuthCookies } from './shared/utils/cookieService';
import apiService from './shared/utils/apiService';
import { AuthProvider, useAuth } from './shared/contexts/AuthContext'; // Import AuthProvider and useAuth
// import { AuthResponse } from './shared/utils/apiService'; // No longer needed for App.tsx directly
import { AlarmReportsConfiguration } from './features/alarm-reports';



export default function App() {
  return (
    <AuthProvider>
      <AuthRoutes />
    </AuthProvider>
  );
}

function AuthRoutes() {
  const { isAuthenticated, currentUser, loadingAuth, userLoaded, handleLogout, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();

  // If not authenticated, redirect to login page
  if (!loadingAuth && !isAuthenticated && window.location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutTrigger />} />
      <Route 
        path="/" 
        element={
          loadingAuth ? null : ( // Render null while authentication is loading
            isAuthenticated && userLoaded ? (
              <DashboardLayout currentUser={currentUser!} onLogout={handleLogout} refreshCurrentUser={refreshCurrentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          )
        }
      >
        <Route index element={
          loadingAuth || !userLoaded ? null : (
            currentUser?.role === 'Admin' ? <DashboardHome /> : <Navigate to="/sites" replace />
          )
        } />
        <Route path="alarms" element={ <AlarmConfiguration />} />
        <Route path="alarms/events" element={<AlarmEvents />} />
        <Route 
          path="alarms/reports" 
          element={
            loadingAuth || !userLoaded ? null : (
              currentUser?.role === 'Admin' ? (
                <AlarmReportsConfiguration />
              ) : (
                <Navigate to="/" replace />
              )
            )
          } 
        />
        <Route path="calculations" element={<FlowCalculations />} />
        <Route path="readings" element={<ReadingsManagement />} />
        <Route 
          path="reading-logs" 
          element={
            loadingAuth || !userLoaded ? null : (
              currentUser?.role === 'Admin' ? (
                <ReadingLogs />
              ) : (
                <Navigate to="/" replace />
              )
            )
          } 
        />
        <Route path="sites" element={<SitesManagement />} />
        <Route 
          path="users" 
          element={
            loadingAuth || !userLoaded ? null : (
              currentUser?.role === 'Admin' ? (
                <UserManagement refreshCurrentUser={refreshCurrentUser} />
              ) : (
                <Navigate to="/" replace />
              )
            )
          } 
        />
        {/* <Route path="*" element={<PageNotFound />} /> */}
      </Route>
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
