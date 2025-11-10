import React, { useState, useEffect } from 'react';
import { LoginPage } from './features/auth';
import { DashboardLayout } from './components/DashboardLayout';
import type { User } from './features/auth/types';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { DashboardHome } from './features/dashboard';
import {AlarmConfiguration} from './features/alarms/components/AlarmConfiguration';
// import {LoginPage} from './features/auth/components/LoginPage';
import {FlowCalculations} from './features/flow-calculations/components/FlowCalculations';
import {ReadingsManagement} from './features/readings/components/ReadingsManagement';
import {SitesManagement} from './features/sites/components/SitesManagement';
import {UserManagement} from './features/users/components/UserManagement';
import { getAccessToken, removeAuthCookies } from './shared/utils/cookieService';
// import { AuthResponse } from './shared/utils/apiService'; // No longer needed for App.tsx directly



export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!getAccessToken() && sessionStorage.getItem('isLogged') === 'true';

  useEffect(() => {
    if (isAuthenticated) {
      // Decode JWT token to get user info or fetch from API
      const token = getAccessToken();
      if (token) {
        // This is a simplified example. In a real app, you'd use a library like jwt-decode
        // or make an API call to get user details based on the token.
        const decodedToken = parseJwt(token);
        setCurrentUser({
          id: decodedToken.sub, // Assuming 'sub' is the user ID
          username: decodedToken.userName || decodedToken.email,
          email: decodedToken.email,
          role: decodedToken.role, // Assuming 'role' is in the token
        });
      }
    } else {
      setCurrentUser(null);
    }
  }, [isAuthenticated]);

  // Helper function to decode JWT (simplified, consider a library for robust decoding)
  const parseJwt = (token: string) => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded JWT:', decoded); // Log the decoded token
      return decoded;
    } catch (e) {
      console.error('Error decoding JWT:', e); // Log decoding errors
      return null;
    }
  };


  // const handleLogin = (authResponse: AuthResponse) => {
  //   // In a real app, you would decode the accessToken to get user details
  //   // For now, we'll use mock data or details from authResponse
  //   setCurrentUser({
  //     id: 1, // This should come from the decoded token or API
  //     username: authResponse.userName || authResponse.email,
  //     email: authResponse.email,
  //     role: authResponse.role // Assuming role is available in AuthResponse
  //   });
  //   navigate('/');
  // };

  const handleLogout = () => {
    removeAuthCookies();
    sessionStorage.setItem('isLogged', 'false'); // Clear isLogged in sessionStorage
    setCurrentUser(null);
    navigate('/login');
  };

  // if (!isAuthenticated) {
  //   return <LoginPage onLogin={handleLogin} />;
  // }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/" 
        element={
          isAuthenticated && currentUser ? (
            <DashboardLayout currentUser={currentUser!} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="alarms" element={<AlarmConfiguration />} />
        <Route path="calculations" element={<FlowCalculations />} />
        <Route path="readings" element={<ReadingsManagement />} />
        <Route path="sites" element={<SitesManagement />} />
        <Route path="users" element={<UserManagement />} />
        {/* <Route path="*" element={<PageNotFound />} /> */}
      </Route>
    </Routes>
  );
}
