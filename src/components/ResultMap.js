import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import ThiessenLayer from './ThiessenLayer';
import IsohyetalLayer from './IsohyetalLayer';
import MapBoundsControl from './MapBoundsControl';
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

const ResultMap = ({ stations, targetPoint, visualization }) => {
  // Validate input
  if (!stations || !stations.length || !targetPoint || 
      typeof targetPoint.lat !== 'number' || typeof targetPoint.lng !== 'number') {
    return null;
  }

  // Calculate map center and bounds
  const points = [...stations, targetPoint];
  const center = [
    points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  ];

  const bounds = {
    minLat: Math.min(...points.map(p => p.lat)),
    maxLat: Math.max(...points.map(p => p.lat)),
    minLng: Math.min(...points.map(p => p.lng)),
    maxLng: Math.max(...points.map(p => p.lng))
  };

  // Calculate zoom level based on bounds
  const latDiff = bounds.maxLat - bounds.minLat;
  const lngDiff = bounds.maxLng - bounds.minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  const zoom = Math.floor(14 - Math.log2(maxDiff));

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
      >
        {/* Add bounds control to show all points */}
        <MapBoundsControl bounds={bounds} padding={[50, 50]} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Visualization Layers */}
        {stations.length >= 3 && (
          visualization === 'thiessen' ? (
            <ThiessenLayer stations={stations} bounds={bounds} />
          ) : visualization === 'isohyetal' ? (
            <IsohyetalLayer stations={stations} bounds={bounds} />
          ) : null
        )}

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
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow-lg text-sm">
        <div className="flex flex-wrap gap-2">
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
            Target
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultMap;
