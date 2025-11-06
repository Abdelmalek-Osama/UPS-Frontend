import { useState } from 'react';
import { LoginPage } from './features/auth';
import { DashboardLayout } from './components/DashboardLayout';
import type { User } from './features/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in production, this would call an API
    setCurrentUser({
      id: 1,
      username: 'أحمد محمود',
      email: email,
      role: 'Admin'
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <DashboardLayout currentUser={currentUser!} onLogout={handleLogout} />;
}
