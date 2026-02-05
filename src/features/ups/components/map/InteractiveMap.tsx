import React, { useCallback } from 'react';
import { MapContainer } from './MapContainer';
import { MapLegend } from './MapLegend';
import { MapControls } from './MapControls';
import { useUPSAuth } from '../../contexts/UPSAuthContext';
import { authService } from '../../services/AuthService';
import type { Site } from '../../types';

/**
 * Complete interactive map with controls and legend
 * Integrates with authentication for role-based site filtering
 */
interface InteractiveMapProps {
  sites: Site[];
  onSiteClick: (siteId: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  showLegend?: boolean;
  showControls?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  sites,
  onSiteClick,
  center = [26.8206, 30.8025],
  zoom = 6,
  className = '',
  showLegend = true,
  showControls = true,
  isLoading = false,
  error = null,
}) => {
  const { user } = useUPSAuth();

  // Filter sites based on user access
  const accessibleSites = authService.filterAccessibleSites(user, sites);

  const handleSiteClick = useCallback((siteId: string) => {
    // Verify user can access this site before navigation
    if (authService.canAccessSite(user, siteId)) {
      onSiteClick(siteId);
    }
  }, [user, onSiteClick]);

  return (
    <div 
      className={`interactive-map ${className}`}
      style={{ 
        position: 'relative', 
        height: '100%', 
        width: '100%',
        minHeight: '400px'
      }}
    >
      <MapContainer
        sites={accessibleSites}
        onSiteClick={handleSiteClick}
        center={center}
        zoom={zoom}
        isLoading={isLoading}
        error={error}
      />
      
      {showControls && !isLoading && !error && (
        <MapControls egyptCenter={center} egyptZoom={zoom} />
      )}
      {showLegend && !isLoading && !error && <MapLegend />}
    </div>
  );
};