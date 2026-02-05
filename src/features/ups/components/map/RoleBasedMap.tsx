import React, { useMemo } from 'react';
import { InteractiveMap } from './InteractiveMap';
import { useUPSAuth } from '../../contexts/UPSAuthContext';
import { filterSitesByUserAccess } from '../../utils/mapFiltering';
import type { Site } from '../../types';

/**
 * Role-based map component that filters sites based on user permissions
 */
interface RoleBasedMapProps {
  sites: Site[];
  onSiteClick: (siteId: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  showLegend?: boolean;
  showControls?: boolean;
}

export const RoleBasedMap: React.FC<RoleBasedMapProps> = ({
  sites,
  onSiteClick,
  center = [26.8206, 30.8025], // Egypt center
  zoom = 6,
  className = '',
  showLegend = true,
  showControls = true,
}) => {
  const { user, canAccessSite } = useUPSAuth();

  // Filter sites based on user access
  const accessibleSites = useMemo(() => {
    return filterSitesByUserAccess(sites, user);
  }, [sites, user]);

  // Enhanced site click handler with access check
  const handleSiteClick = (siteId: string) => {
    if (canAccessSite(siteId)) {
      onSiteClick(siteId);
    } else {
      console.warn(`User does not have access to site: ${siteId}`);
      // Could show a toast notification here
    }
  };

  // Show loading state if user is not loaded
  if (!user) {
    return (
      <div 
        className={`role-based-map loading ${className}`}
        style={{ 
          height: '100%', 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          fontSize: '16px'
        }}
      >
        Loading map...
      </div>
    );
  }

  // Show message if no accessible sites
  if (accessibleSites.length === 0) {
    return (
      <div 
        className={`role-based-map no-access ${className}`}
        style={{ 
          height: '100%', 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          fontSize: '16px',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '8px', fontSize: '18px' }}>
          No accessible sites
        </div>
        <div style={{ fontSize: '14px' }}>
          You don't have permission to view any sites on the map.
        </div>
      </div>
    );
  }

  return (
    <InteractiveMap
      sites={accessibleSites}
      onSiteClick={handleSiteClick}
      center={center}
      zoom={zoom}
      className={className}
      showLegend={showLegend}
      showControls={showControls}
    />
  );
};