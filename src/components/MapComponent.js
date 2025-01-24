import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import ThiessenLayer from './ThiessenLayer';
import IsohyetalLayer from './IsohyetalLayer';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create custom icons for different precipitation ranges
const createPrecipitationIcon = (precipitation) => {
  const size = 30;
  const color = precipitation < 50 ? '#3B82F6' :  // blue
               precipitation < 100 ? '#10B981' :   // green
               precipitation < 150 ? '#F59E0B' :   // yellow
               '#EF4444';                         // red

  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${precipitation}</div>`,
    className: 'precipitation-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Create target point icon
const targetIcon = L.divIcon({
  html: `<div style="
    background-color: #000;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  className: 'target-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map clicks
function MapClickHandler({ onMapClick, mode }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng, mode);
    },
  });
  return null;
}

const MapComponent = ({ 
  stations, 
  onLocationSelect, 
  selectedMethod,
  targetPoint,
  onTargetPointSelect 
}) => {
  const [mode, setMode] = useState('station'); // 'station' or 'target'

  // Calculate map center based on stations or use a default
  const center = useMemo(() => 
    stations.length > 0
      ? [
          stations.reduce((sum, station) => sum + station.lat, 0) / stations.length,
          stations.reduce((sum, station) => sum + station.lng, 0) / stations.length,
        ]
      : [20, 0], // Default center
    [stations]
  );

  // Calculate bounds for visualization methods
  const bounds = useMemo(() => {
    if (stations.length === 0) return null;
    const points = [...stations, ...(targetPoint ? [targetPoint] : [])];
    return {
      minLat: Math.min(...points.map(p => p.lat)),
      maxLat: Math.max(...points.map(p => p.lat)),
      minLng: Math.min(...points.map(p => p.lng)),
      maxLng: Math.max(...points.map(p => p.lng))
    };
  }, [stations, targetPoint]);

  const handleMapClick = (lat, lng, currentMode) => {
    if (currentMode === 'station') {
      onLocationSelect(lat, lng);
    } else {
      onTargetPointSelect(lat, lng);
    }
  };

  if (typeof window === 'undefined') {
    return null; // Return null during server-side rendering
  }

  return (
    <div className="space-y-4">
      <div className="h-[400px] w-full rounded-lg overflow-hidden shadow">
        <MapContainer
          center={center}
          zoom={stations.length > 0 ? 8 : 2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} mode={mode} />
          
          {/* Station Markers */}
          {stations.map((station, index) => (
            <Marker
              key={index}
              position={[station.lat, station.lng]}
              icon={createPrecipitationIcon(station.precipitation)}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{station.name || `Station ${index + 1}`}</h3>
                  <p>Precipitation: {station.precipitation} mm</p>
                  <p>Latitude: {station.lat.toFixed(6)}</p>
                  <p>Longitude: {station.lng.toFixed(6)}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Target Point Marker */}
          {targetPoint && typeof targetPoint.lat === 'number' && typeof targetPoint.lng === 'number' && (
            <Marker
              position={[targetPoint.lat, targetPoint.lng]}
              icon={targetIcon}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">Target Point</h3>
                  <p>Latitude: {targetPoint.lat.toFixed(6)}</p>
                  <p>Longitude: {targetPoint.lng.toFixed(6)}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Mode Selector and Legend */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <button
              onClick={() => setMode('station')}
              className={`px-3 py-1 rounded ${
                mode === 'station' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Add Station
            </button>
            <button
              onClick={() => setMode('target')}
              className={`px-3 py-1 rounded ${
                mode === 'target' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Set Target Point
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {mode === 'station' 
              ? 'Click on the map to add a station'
              : 'Click on the map to set the target point'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="flex items-center">
            <span className="w-3 h-3 inline-block bg-blue-500 rounded-full mr-1"></span>
            &lt;50mm
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 inline-block bg-green-500 rounded-full mr-1"></span>
            50-100mm
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 inline-block bg-yellow-500 rounded-full mr-1"></span>
            100-150mm
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 inline-block bg-red-500 rounded-full mr-1"></span>
            &gt;150mm
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 inline-block bg-black rounded-full mr-1"></span>
            Target Point
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
