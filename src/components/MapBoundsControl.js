import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapBoundsControl = ({ bounds, padding }) => {
  const map = useMap();

  useEffect(() => {
    if (!bounds) return;

    // Convert bounds object to Leaflet bounds
    const leafletBounds = L.latLngBounds([
      [bounds.minLat, bounds.minLng],
      [bounds.maxLat, bounds.maxLng]
    ]);
    
    // Fit map to bounds with padding
    map.fitBounds(leafletBounds, { padding });
  }, [map, bounds, padding]);

  return null;
};

export default MapBoundsControl;
