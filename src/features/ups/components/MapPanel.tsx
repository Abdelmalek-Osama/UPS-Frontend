import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, CircleMarker, TileLayer } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Skeleton } from "../../../components/ui/skeleton";
import type { SiteSummary, Site } from "../types";

// Custom CSS for tooltips and hover effects
const tooltipStyles = `
  .leaflet-tooltip {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    pointer-events: auto !important;
  }
  .leaflet-tooltip-top:before,
  .leaflet-tooltip-bottom:before,
  .leaflet-tooltip-left:before,
  .leaflet-tooltip-right:before {
    display: none !important;
  }
  .leaflet-popup-content-wrapper {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    padding: 0 !important;
  }
  .leaflet-popup-tip {
    display: none !important;
  }
  .hover-pin {
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }
  .hover-pin:hover {
    transform: scale(1.1) !important;
  }
`;

// Inject custom styles only once
if (typeof document !== 'undefined' && !document.getElementById('leaflet-custom-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'leaflet-custom-styles';
  styleSheet.innerText = tooltipStyles;
  document.head.appendChild(styleSheet);
}

// Fix for Leaflet default markers in bundled applications
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getStatusColor = (status: SiteSummary["status"] | Site["status"]): string => {
  switch (status) {
    case "active":
      return "#2563eb"; // blue-600 (matches screenshot)
    case "inactive":
      return "#dc2626"; // gray-400
    case "maintenance":
      return "#f59e0b"; // amber-500
    case "alarm":
      return "#dc2626"; // red-600
    default:
      return "#9ca3af";
  }
};

const egyptBounds: LatLngBoundsExpression = [
  [22.0, 25.0], // Southwest corner (Aswan area)
  [31.7, 35.0], // Northeast corner (Mediterranean coast)
];

interface MapPanelProps {
  pins: (SiteSummary | Site | any)[]; // Allow flexible pin format
  onPinClick?: (siteId: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function MapPanel({ pins, onPinClick, isLoading = false, error = null }: MapPanelProps) {
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const { t, i18n } = useTranslation();
  const center = useMemo(() => [26.5, 30.5] as [number, number], []); // Center of Egypt along the Nile
  
  // Get language-appropriate names
  const isArabic = i18n.language === 'ar';

  // Debug logging
  useEffect(() => {

    
    // Log first few pins for debugging
    if (pins && pins.length > 0) {
   
    }
  }, [pins, isLoading, error, hoveredPin, mousePosition]);

  const handleMapError = (errorMessage: string) => {
    console.error('Map error:', errorMessage);
    setMapError(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="h-[600px] w-full">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  if (error || mapError) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            {error || mapError || "Failed to load map"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Add a fallback if pins is empty or undefined
  if (!pins || pins.length === 0) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            No site data available to display on map
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full overflow-hidden relative">
      <MapContainer
        center={center}
        zoom={6}
        minZoom={5}
        maxZoom={12}
        maxBounds={egyptBounds}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: "600px", width: "100%" }}
        whenReady={() => {
          console.log('Map is ready');
          setMapError(null);
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: (e) => {
              console.error('Tile error:', e);
              handleMapError("Failed to load map tiles");
            },
            tileload: () => {
              console.log('Tiles loaded successfully');
            }
          }}
        />
        {pins.map((pin) => {
          // Handle both coordinate formats: coordinates array or lat/lng properties
          let lat: number, lng: number;
          
          if (pin.coordinates && Array.isArray(pin.coordinates) && pin.coordinates.length >= 2) {
            [lat, lng] = pin.coordinates;
          } else if ('lat' in pin && 'lng' in pin && typeof pin.lat === 'number' && typeof pin.lng === 'number') {
            lat = pin.lat;
            lng = pin.lng;
          } else {
            console.warn('Pin missing coordinates:', pin);
            return null;
          }
          
          // Get the site ID - handle both siteId (string) and id (string/number)
          const siteId = pin.siteId || pin.id;
          const siteName = pin.siteName || pin.name;
          
          return (
            <CircleMarker
              key={siteId}
              center={[lat, lng]}
              radius={8}
              pathOptions={{
                fillColor: getStatusColor(pin.status),
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
                // Add hover effect
                className: 'hover-pin'
              }}
              eventHandlers={{
                click: () => {
                  console.log('Pin clicked:', siteName);
                  // Convert siteId to number for onPinClick
                  const numericSiteId = typeof siteId === 'string' ? parseInt(siteId) : siteId;
                  onPinClick?.(numericSiteId);
                },
                mouseover: (e) => {
                  console.log('Pin hovered:', siteName);
                  console.log('Pin data:', pin);
                  setHoveredPin(pin);
                  // Get mouse position relative to the map container
                  try {
                    const mapContainer = e.target._map.getContainer();
                    const rect = mapContainer.getBoundingClientRect();
                    const mousePos = { 
                      x: e.originalEvent.clientX - rect.left, 
                      y: e.originalEvent.clientY - rect.top 
                    };
                    console.log('Mouse position:', mousePos);
                    setMousePosition(mousePos);
                  } catch (error) {
                    console.error('Error getting mouse position:', error);
                    // Use a default position if we can't get mouse position
                    setMousePosition({ x: 200, y: 100 });
                  }
                  // Add visual feedback
                  e.target.setStyle({ 
                    weight: 3, 
                    fillOpacity: 0.8,
                    radius: 10 // Make pin slightly larger on hover
                  });
                },
                mouseout: (e) => {
                  console.log('Pin unhovered');
                  setHoveredPin(null);
                  setMousePosition(null);
                  // Reset visual feedback
                  e.target.setStyle({ 
                    weight: 2, 
                    fillOpacity: 1,
                    radius: 8 // Reset to original size
                  });
                }
              }}
            >
            </CircleMarker>
          );
        }).filter(Boolean)}
        
        {/* Custom Hover Tooltip */}
        {hoveredPin && mousePosition && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(mousePosition.x + 15, window.innerWidth - 300),
              top: Math.max(mousePosition.y - 140, 10),
              zIndex: 2000,
              pointerEvents: 'none',
              maxWidth: '280px'
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                minWidth: '220px',
                maxWidth: '280px'
              }}
            >
              {/* Header with site name */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#111827', lineHeight: '1.2' }}>
                  {isArabic && hoveredPin.governorateArabicName ? hoveredPin.governorateArabicName : hoveredPin.governorate} • {isArabic && hoveredPin.siteArabicName ? hoveredPin.siteArabicName : hoveredPin.siteName}
                </div>
              </div>
            
              {/* Last Reading */}
              {hoveredPin.lastReading && (
                <div style={{ fontSize: '14px', color: '#000000ff', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>{t("ups.map.lastReading")}: </span>
                  {new Date(hoveredPin.lastReading).toLocaleString()}
                </div>
              )}
              
              {/* Flow Rate */}
              {hoveredPin.flowRate !== undefined && hoveredPin.flowRate !== null && (
                <div style={{ fontSize: '14px', color: '#000000ff', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>{t("ups.fields.flowRate")}: </span>
                  {hoveredPin.flowRate.toFixed(2)} m³/s
                </div>
              )}
              
              {/* Upstream */}
              <div style={{ fontSize: '14px', color: '#000000ff', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600' }}>{t("ups.fields.upstream")}: </span>
                {hoveredPin.upstream?.toFixed(2) || 'N/A'} m
              </div>
              
              {/* Downstream */}
              <div style={{ fontSize: '14px', color: '#000000ff', marginBottom: '12px' }}>
                <span style={{ fontWeight: '600' }}>{t("ups.fields.downstream")}: </span>
                {hoveredPin.downstream?.toFixed(2) || 'N/A'} m
              </div>
              
              {/* Status badge */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  backgroundColor: hoveredPin.status === 'active' ? '#3b82f6' : 
                                 hoveredPin.status === 'alarm' ? '#ef4444' :
                                 hoveredPin.status === 'maintenance' ? '#f59e0b' : '#dc2626',
                  color: 'white',
                  textTransform: 'uppercase'
                }}>
                  {t("common.status")}: {hoveredPin.status === 'active' ? t("ups.map.active") : 
                                         hoveredPin.status === 'alarm' ? t("ups.map.alarm") :
                                         hoveredPin.status === 'maintenance' ? t("ups.map.maintenance") : 
                                         t("ups.map.inactive")}
                </span>
              </div>
              

            </div>
          </div>
        )}
        
        {/* Map Legend - Fixed positioning */}
        <div 
          className="leaflet-control leaflet-control-custom"
          style={{ 
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            pointerEvents: 'auto',
            minWidth: '140px'
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', color: '#111827' }}>
            {t("ups.map.legend")}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: '#2563eb',
                flexShrink: 0
              }}></div>
              <span style={{ fontSize: '14px', color: '#374151' }}>{t("ups.map.activeSite")}</span>
            </div>
            {/* <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: '#dc2626',
                flexShrink: 0
              }}></div>
              <span style={{ fontSize: '14px', color: '#374151' }}>{t("ups.map.alarmState")}</span>
            </div> */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: '#dc2626',
                flexShrink: 0
              }}></div>
              <span style={{ fontSize: '14px', color: '#374151' }}>{t("ups.map.inactiveOffline")}</span>
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
}
