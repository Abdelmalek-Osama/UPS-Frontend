import React from 'react';

/**
 * Map legend component showing site status indicators
 */
interface MapLegendProps {
  className?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({ className = '' }) => {
  const statusItems = [
    { status: 'active', label: 'Active', color: '#22c55e' },
    { status: 'inactive', label: 'Inactive', color: '#6b7280' },
    { status: 'maintenance', label: 'Maintenance', color: '#f59e0b' },
    { status: 'alarm', label: 'Alarm', color: '#ef4444' },
  ];

  return (
    <div 
      className={`map-legend ${className}`}
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: '1px solid #e5e7eb',
        minWidth: '140px'
      }}
    >
      <h4 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '14px', 
        fontWeight: 'bold',
        color: '#374151'
      }}>
        Site Status
      </h4>
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {statusItems.map(item => (
          <li 
            key={item.status} 
            className="legend-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span 
              className="legend-color" 
              style={{ 
                backgroundColor: item.color,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '1px solid white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                flexShrink: 0
              }}
            />
            <span 
              className="legend-label"
              style={{
                fontSize: '12px',
                color: '#374151',
                fontWeight: '500'
              }}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};