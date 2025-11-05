import React from 'react';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Database, 
  Bell, 
  Calculator, 
  Users,
  LogOut,
  Menu,
  Droplets
} from 'lucide-react';
import { Button } from './ui/button';
import { DashboardHome } from './DashboardHome';
import { SitesManagement } from './SitesManagement';
import { ReadingsManagement } from './ReadingsManagement';
import { AlarmConfiguration } from './AlarmConfiguration';
import { FlowCalculations } from './FlowCalculations';
import { UserManagement } from './UserManagement';

interface DashboardLayoutProps {
  currentUser: {
    id: number;
    username: string;
    email: string;
    role: 'Admin' | 'Operator';
  };
  onLogout: () => void;
}

type Page = 'dashboard' | 'sites' | 'readings' | 'alarms' | 'calculations' | 'users';

export function DashboardLayout({ currentUser, onLogout }: DashboardLayoutProps) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'sites', label: 'إدارة المواقع', icon: MapPin },
    { id: 'readings', label: 'القراءات', icon: Database },
    { id: 'alarms', label: 'تكوين التنبيهات', icon: Bell },
    { id: 'calculations', label: 'حسابات التدفق', icon: Calculator },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'sites':
        return <SitesManagement />;
      case 'readings':
        return <ReadingsManagement />;
      case 'alarms':
        return <AlarmConfiguration />;
      case 'calculations':
        return <FlowCalculations />;
      case 'users':
        return <UserManagement />;
      default:
        return <DashboardHome />;
    }
  };

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
            <div className="text-right">
              <p className="text-sm">{currentUser.username}</p>
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
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as Page)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
