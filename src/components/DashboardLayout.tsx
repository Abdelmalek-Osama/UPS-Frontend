import React, {useState} from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Database, 
  Bell, 
  Calculator, 
  Users,
  LogOut,
  Menu,
  Droplets,
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { DashboardHome } from '../features/dashboard';
import { SitesManagement } from '../features/sites';
import { ReadingsManagement } from '../features/readings';
import { AlarmConfiguration } from '../features/alarms';
import { FlowCalculations } from '../features/flow-calculations';
import { UserManagement } from '../features/users';
import type { User } from '../features/auth';

interface DashboardLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

export function DashboardLayout({ currentUser, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const allMenuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, path: '/', roles: ['Admin', 'Operator'] },
    { id: 'sites', label: 'إدارة المواقع', icon: MapPin, path: '/sites', roles: ['Admin', 'Operator'] },
    { id: 'readings', label: 'القراءات', icon: Database, path: '/readings', roles: ['Admin', 'Operator'] },
    { id: 'alarms', label: 'تكوين التنبيهات', icon: Bell, path: '/alarms', roles: ['Admin', 'Operator'] },
    { id: 'alarm-events', label: 'أحداث التنبيهات', icon: AlertTriangle, path: '/alarms/events', roles: ['Admin', 'Operator'] },
    { id: 'calculations', label: 'حسابات التدفق', icon: Calculator, path: '/calculations', roles: ['Admin', 'Operator'] },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, path: '/users', roles: ['Admin'] }, // Only Admin can see this
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => item.roles.includes(currentUser.role));

  

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">نظام مراقبة الري</h1>
                <p className="text-sm text-gray-500">وزارة الموارد المائية والري</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right" dir="rtl">
              <p className="text-sm font-medium" style={{ unicodeBidi: 'plaintext' }}>
                {currentUser.fullName}
              </p>
              <p className="text-xs text-gray-500">{currentUser.role === 'Admin' ? 'مسؤول' : 'مشغل'}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                // const isActive = currentPage === item.id;
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      (item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path)
                      )
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}