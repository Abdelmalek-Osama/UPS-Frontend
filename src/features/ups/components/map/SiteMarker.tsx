import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import type { SiteMarkerProps } from '../../types';

/**
 * Site marker component for map pins with status-based styling
 */
export const SiteMarker: React.FC<SiteMarkerProps> = ({
  site,
  onClick,
  isSelected = false,
}) => {
  // Create custom icon based on site status
  const getMarkerIcon = () => {
    const statusColors = {
      active: '#22c55e',
      inactive: '#6b7280', 
      maintenance: '#f59e0b',
      alarm: '#ef4444',
    };

    const color = statusColors[site.status];
    const size = isSelected ? 30 : 24;
    
    return new DivIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: white;
          cursor: pointer;
          ${isSelected ? 'transform: scale(1.2);' : ''}
        ">
          ${site.status === 'alarm' ? '!' : site.status === 'maintenance' ? '⚠' : '●'}
        </div>
      `,
      className: 'custom-site-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const handleClick = () => {
    onClick(site.id);
  };

  return (
    <Marker
      position={site.coordinates}
      icon={getMarkerIcon()}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
        <div>
          <strong>{site.name}</strong><br />
          Status: {site.status}<br />
          {site.governorate} - {site.branch}
        </div>
      </Tooltip>
      
      <Popup>
        <div style={{ minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{site.name}</h3>
          <p style={{ margin: '4px 0' }}>
            <strong>Status:</strong> 
            <span style={{ 
              color: site.status === 'active' ? '#22c55e' : 
                     site.status === 'alarm' ? '#ef4444' : 
                     site.status === 'maintenance' ? '#f59e0b' : '#6b7280',
              fontWeight: 'bold',
              marginLeft: '4px'
            }}>
              {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
            </span>
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Location:</strong> {site.governorate} - {site.branch}
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Coordinates:</strong> {site.coordinates[0].toFixed(4)}, {site.coordinates[1].toFixed(4)}
          </p>
          <button
            onClick={handleClick}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
};