import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard,
  MapPin,
  Globe2,
  LogOut,
  Menu,
  Droplets,
} from 'lucide-react';
import { Button } from './ui/button';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLandingOverview } from '../features/ups/hooks/useLandingOverview';
import type { User } from '../features/auth';

interface DashboardLayoutProps {
  currentUser: User;
  onLogout: () => void;
  refreshCurrentUser: () => void;
}

export function DashboardLayout({ currentUser, onLogout, refreshCurrentUser }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { data: landingOverview } = useLandingOverview();

  const governorateSlug = currentUser.governorateName
    ? encodeURIComponent(currentUser.governorateName.toLowerCase().replace(/\s+/g, '-'))
    : 'minia';

  const firstSiteId = landingOverview.sites?.[0]?.siteId;
  const firstSitePath = firstSiteId ? `/sites/${firstSiteId}` : '/';

  type MenuItem = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    roles: string[];
    matchPrefix?: string;
  };

  const allMenuItems: MenuItem[] = [
    { id: 'overview', label: t('navigation.overview'), icon: LayoutDashboard, path: '/', roles: ['Admin', 'Operator', 'Viewer', 'Governorate', 'SuperAdmin'] },
    { id: 'directorate', label: t('navigation.directorate'), icon: MapPin, path: `/governorates/${governorateSlug}`, roles: ['Admin', 'Operator', 'Viewer', 'Governorate', 'SuperAdmin'] },
    { id: 'sites', label: t('navigation.sites'), icon: Globe2, path: firstSitePath, roles: ['Admin', 'Operator', 'Viewer', 'Governorate', 'SuperAdmin'], matchPrefix: '/sites/' },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => item.roles.includes(currentUser.role));

  

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 w-full">
        <div className="flex items-center justify-between px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-sm sm:text-base truncate">{t('ups.appName')}</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{t('ups.appTagline')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
       
            <LanguageSwitcher />
            <div className="text-right hidden sm:block" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <p className="text-sm font-medium" style={{ unicodeBidi: 'plaintext' }}>
                {currentUser.fullName}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser.role === 'SuperAdmin'
                  ? t('users.superAdmin')
                  : currentUser.role === 'Admin'
                    ? t('users.admin')
                    : currentUser.role === 'Governorate'
                      ? t('users.governorate')
                      : currentUser.role === 'Operator'
                        ? t('users.operator')
                        : t('users.viewer')}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} className="flex-shrink-0">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex overflow-x-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-48 sm:w-56 lg:w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px] flex-shrink-0">
            <nav className="p-2 sm:p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.matchPrefix
                  ? location.pathname.startsWith(item.matchPrefix)
                  : (item.path === location.pathname ||
                    (item.path === '/' && location.pathname === '/'));
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden">
          <Outlet context={{ currentUser, refreshCurrentUser }} />
        </main>
      </div>
    </div>
  );
}
