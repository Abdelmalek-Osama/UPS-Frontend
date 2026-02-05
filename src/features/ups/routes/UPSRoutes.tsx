import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { UPS_ROUTES } from './routeConfig';

// Import page components
import { LandingPage } from '../components/LandingPage';
import { SitePage } from '../components/SitePage';
import { GovernoratePage } from '../components/GovernoratePage';
import { MasterPage } from '../components/MasterPage';
import { ReportsPage } from '../components/ReportsPage';

/**
 * UPS Dashboard routing configuration
 * Defines all routes with appropriate protection and access control
 */
export const UPSRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing Page - Main dashboard */}
      <Route 
        index 
        element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        } 
      />

      {/* Site-specific page */}
      <Route 
        path="sites/:siteId" 
        element={
          <ProtectedRoute>
            <SitePage />
          </ProtectedRoute>
        } 
      />

      {/* Governorate aggregated view */}
      <Route 
        path="governorates/:governorateId" 
        element={
          <ProtectedRoute>
            <GovernoratePage />
          </ProtectedRoute>
        } 
      />

      {/* Master view - Admin only */}
      <Route 
        path="master" 
        element={
          <ProtectedRoute requireMasterAccess={true}>
            <MasterPage />
          </ProtectedRoute>
        } 
      />

      {/* Reports page */}
      <Route 
        path="reports" 
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};