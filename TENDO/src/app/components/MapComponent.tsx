import React, { useEffect, useRef } from 'react';

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  markers?: { position: [number, number]; label: string; isUser?: boolean; isBus?: boolean; rotation?: number }[];
  route?: [number, number][];
}

declare const L: any;

const ABIDJAN_CENTER: [number, number] = [5.3265, -4.0180]; // Place de la République, Abidjan

export const MapComponent: React.FC<MapComponentProps> = ({ center = ABIDJAN_CENTER, zoom = 14, markers, route }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const routeLayer = useRef<any>(null);
  const routeHaloLayer = useRef<any>(null);

  // Custom Icons
  const createStopIcon = () => L.divIcon({
    html: `<div style="background-color: #F57C00; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-stop-icon',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  const createUserIcon = () => L.divIcon({
    html: `
      <div style="display: flex; align-items: center; justify-content: center; position: relative;">
        <div style="
          position: absolute; 
          width: 30px; 
          height: 30px; 
          background-color: rgba(46, 125, 50, 0.4); 
          border-radius: 50%; 
          animation: map-pulse 2s infinite ease-out;
        "></div>
        <div style="
          background-color: #2E7D32; 
          width: 18px; 
          height: 18px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 0 10px rgba(0,0,0,0.1); 
          position: relative; 
          z-index: 2;
        "></div>
        <style>
          @keyframes map-pulse {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        </style>
      </div>
    `,
    className: 'custom-user-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  const createBusIcon = (label: string) => L.divIcon({
    html: `
      <div class="bus-marker-container" style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div class="bus-pulse" style="position: absolute; width: 32px; height: 32px; background: rgba(245, 124, 0, 0.4); border-radius: 8px; animation: pulse 2s infinite;"></div>
        <div style="background-color: #F57C00; width: 26px; height: 26px; border-radius: 6px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transform: rotate(45deg); position: relative; z-index: 10;">
          <div style="transform: rotate(-45deg); color: white; font-size: 12px; font-weight: 900;">🚌</div>
        </div>
        <div style="position: absolute; top: -18px; background: #1A1A1A; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; box-shadow: 0 4px 8px rgba(0,0,0,0.2); white-space: nowrap; border: 1px solid rgba(255,255,255,0.1); z-index: 20;">
          ${label}
        </div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `,
    className: 'custom-bus-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const lastProps = useRef({ center, zoom });

  // Effect for updating view (center/zoom) - only if they actually change
  useEffect(() => {
    if (mapInstance.current) {
      const centerChanged = lastProps.current.center[0] !== center[0] || lastProps.current.center[1] !== center[1];
      const zoomChanged = lastProps.current.zoom !== zoom;

      if (centerChanged || zoomChanged) {
        mapInstance.current.setView(center, zoom);
        lastProps.current = { center, zoom };
      }
    }
  }, [center, zoom]);

  // Effect for updating route
  useEffect(() => {
    if (mapInstance.current) {
      if (routeLayer.current) {
        mapInstance.current.removeLayer(routeLayer.current);
        routeLayer.current = null;
      }
      if (routeHaloLayer.current) {
        mapInstance.current.removeLayer(routeHaloLayer.current);
        routeHaloLayer.current = null;
      }

      if (route && route.length > 1) {
        // Subtle halo for visibility - DARK GREEN
        routeHaloLayer.current = L.polyline(route, {
          color: '#1B5E20',
          weight: 12,
          opacity: 0.15,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(mapInstance.current);

        // Main PREMIUM DARK GREEN route line
        routeLayer.current = L.polyline(route, {
          color: '#1B5E20',
          weight: 5,
          opacity: 1,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(mapInstance.current);

        // Smoothly zoom to the new route
        mapInstance.current.fitBounds(routeLayer.current.getBounds(), { 
          padding: [50, 50],
          animate: true,
          duration: 1
        });
      }
    }
  }, [route]);

  // Effect for updating markers
  useEffect(() => {
    if (mapInstance.current) {
      // Clear existing markers
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      // Add markers
      markers?.forEach(marker => {
        let icon;
        if (marker.isUser) icon = createUserIcon();
        else if (marker.isBus) icon = createBusIcon(marker.label);
        else icon = createStopIcon();

        L.marker(marker.position, { icon }).addTo(mapInstance.current)
          .bindPopup(`<b style="color: ${marker.isUser ? '#2E7D32' : '#F57C00'}; font-family: Outfit, sans-serif;">${marker.label}</b>`);
      });
    }
  }, [markers]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};
