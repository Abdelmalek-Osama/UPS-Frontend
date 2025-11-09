import { useState } from 'react';
import { LoginPage } from './features/auth';
import { DashboardLayout } from './components/DashboardLayout';
import type { User } from './features/auth';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { DashboardHome } from './features/dashboard';
import {AlarmConfiguration} from './features/alarms/components/AlarmConfiguration';
// import {LoginPage} from './features/auth/components/LoginPage';
import {FlowCalculations} from './features/flow-calculations/components/FlowCalculations';
import {ReadingsManagement} from './features/readings/components/ReadingsManagement';
import {SitesManagement} from './features/sites/components/SitesManagement';
import {UserManagement} from './features/users/components/UserManagement';



export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in production, this would call an API
    setCurrentUser({
      id: 1,
      username: 'أحمد محمود',
      email: email,
      role: 'Admin'
    });
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  // if (!isAuthenticated) {
  //   return <LoginPage onLogin={handleLogin} />;
  // }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
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
