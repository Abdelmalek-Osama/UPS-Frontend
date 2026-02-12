import React, { useRef, useCallback, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import { SiteMarker } from './SiteMarker';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { Site } from '../../types';
import 'leaflet/dist/leaflet.css';

/**
 * Interactive map container component using react-leaflet
 * Displays sites on Egypt map with status-based markers
 */
interface MapContainerProps {
  sites: Site[];
  onSiteClick: (siteId: string) => void;
  center: [number, number];
  zoom: number;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  sites,
  onSiteClick,
  center,
  zoom,
  className = '',
  isLoading = false,
  error = null,
}) => {
  const mapRef = useRef<LeafletMap>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const handleSiteClick = useCallback((siteId: string) => {
    onSiteClick(siteId);
  }, [onSiteClick]);

  const handleMapError = useCallback((errorMessage: string) => {
    setMapError(errorMessage);
  }, []);

  if (isLoading) {
    return (
      <div className={`map-container ${className}`} style={{ height: '100%', width: '100%' }}>
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  if (error || mapError) {
    return (
      <div className={`map-container ${className}`} style={{ height: '100%', width: '100%' }}>
        <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg">
          <Alert className="max-w-md">
            <AlertDescription>
              {error || mapError || "Failed to load map"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`} style={{ height: '100%', width: '100%' }}>
      <LeafletMapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        whenReady={() => {
          // Map is ready, clear any previous errors
          setMapError(null);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={5}
          onError={() => handleMapError("Failed to load map tiles")}
        />
        
        <ZoomControl position="topright" />
        
        {sites.map(site => (
          <SiteMarker
            key={site.id}
            site={site}
            onClick={handleSiteClick}
          />
        ))}
      </LeafletMapContainer>
    </div>
  );
};