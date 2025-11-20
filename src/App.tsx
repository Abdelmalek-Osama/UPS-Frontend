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
import {SitesManagement} from './features/sites/components/SitesManagement';
import {UserManagement} from './features/users/components/UserManagement';
import { getAccessToken, removeAuthCookies } from './shared/utils/cookieService';
// import { AuthResponse } from './shared/utils/apiService'; // No longer needed for App.tsx directly



export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!getAccessToken() && sessionStorage.getItem('isLogged') === 'true';
  const [loadingAuth, setLoadingAuth] = useState(true); // New loading state for auth
  const [userLoaded, setUserLoaded] = useState(false); // New state to track if currentUser is loaded

  useEffect(() => {
    console.log('App.tsx: useEffect triggered');
    console.log('App.tsx: isAuthenticated initially:', isAuthenticated);
    const checkAuthStatus = async () => {
      console.log('App.tsx: checkAuthStatus started');
      if (isAuthenticated) {
        console.log('App.tsx: User is authenticated, checking token...');
        const token = getAccessToken();
        if (token) {
          console.log('App.tsx: Token found, decoding...');
          const decodedToken = parseJwt(token);
          if (decodedToken) {
            console.log('App.tsx: Decoded token:', decodedToken);
            setCurrentUser({
              id: decodedToken.sub, // Assuming 'sub' is the user ID
              username: decodedToken.userName || decodedToken.email,
              email: decodedToken.email,
              fullName: decodedToken.FullName || decodedToken.fullName || decodedToken.unique_name || '',
              role: decodedToken.role || decodedToken.Role, // Assuming 'role' is in the token
            });
            setUserLoaded(true); // User data has been successfully loaded
            console.log('App.tsx: currentUser set, userLoaded true');
          } else {
            console.log('App.tsx: Failed to decode token.');
            setCurrentUser(null);
            setUserLoaded(false);
          }
        } else {
          console.log('App.tsx: No token found.');
          setCurrentUser(null);
          setUserLoaded(false);
        }
      } else {
        console.log('App.tsx: User is NOT authenticated.');
        setCurrentUser(null);
        setUserLoaded(false);
        setLoadingAuth(false);
      }
    };
    
    checkAuthStatus();
    setLoadingAuth(false); // Ensure loading state is always resolved

    // Navigate to dashboard after successful login if on login page
    if (isAuthenticated && userLoaded && window.location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, userLoaded, navigate]); // Add userLoaded to dependency array

  console.log('App.tsx: Render - isAuthenticated:', isAuthenticated, 'currentUser:', currentUser, 'loadingAuth:', loadingAuth, 'userLoaded:', userLoaded, 'path:', window.location.pathname);
  
  // Helper function to decode JWT with proper UTF-8 support for Arabic characters
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Properly decode UTF-8 characters (including Arabic)
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
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
          loadingAuth ? null : ( // Render null while authentication is loading
            isAuthenticated && userLoaded ? (
              <DashboardLayout currentUser={currentUser!} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          )
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="alarms" element={<AlarmConfiguration />} />
        <Route path="alarms/events" element={<AlarmEvents />} />
        <Route path="calculations" element={<FlowCalculations />} />
        <Route path="readings" element={<ReadingsManagement />} />
        <Route path="sites" element={<SitesManagement />} />
        <Route 
          path="users" 
          element={
            currentUser?.role === 'Admin' ? (
              <UserManagement />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        {/* <Route path="*" element={<PageNotFound />} /> */}
      </Route>
    </Routes>
  );
}
