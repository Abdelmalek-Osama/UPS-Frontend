import React from 'react';
import { useMap } from 'react-leaflet';

/**
 * Map controls component for zoom, layers, etc.
 */
interface MapControlsProps {
  className?: string;
  egyptCenter?: [number, number];
  egyptZoom?: number;
}

export const MapControls: React.FC<MapControlsProps> = ({
  className = '',
  egyptCenter = [26.8206, 30.8025], // Egypt center coordinates
  egyptZoom = 6,
}) => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleResetView = () => {
    map.setView(egyptCenter, egyptZoom);
  };

  return (
    <div className={`map-controls ${className}`} style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <button 
        onClick={handleZoomIn} 
        className="control-button"
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'white',
          border: '2px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        title="Zoom In"
      >
        +
      </button>
      <button 
        onClick={handleZoomOut} 
        className="control-button"
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'white',
          border: '2px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        title="Zoom Out"
      >
        -
      </button>
      <button 
        onClick={handleResetView} 
        className="control-button"
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'white',
          border: '2px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        title="Reset View"
      >
        ⌂
      </button>
    </div>
  );
};