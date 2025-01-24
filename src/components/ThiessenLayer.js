import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as d3 from 'd3';

const ThiessenLayer = ({ stations, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (!stations || stations.length < 3 || !bounds) return;

    // Remove existing layer if any
    const existingLayer = map._layers && Object.values(map._layers).find(
      layer => layer.options && layer.options.className === 'thiessen-layer'
    );
    if (existingLayer) {
      map.removeLayer(existingLayer);
    }

    try {
      // Convert stations to pixel coordinates
      const points = stations.map(station => {
        const point = map.latLngToLayerPoint([station.lat, station.lng]);
        return [point.x, point.y];
      });

      // Calculate bounds in pixel coordinates
      const minPoint = map.latLngToLayerPoint([bounds.minLat, bounds.minLng]);
      const maxPoint = map.latLngToLayerPoint([bounds.maxLat, bounds.maxLng]);

      // Ensure bounds are valid (minX < maxX and minY < maxY)
      const voronoiBounds = [
        Math.min(minPoint.x, maxPoint.x),
        Math.min(minPoint.y, maxPoint.y),
        Math.max(minPoint.x, maxPoint.x),
        Math.max(minPoint.y, maxPoint.y)
      ];

      // Add padding to bounds
      const padding = 50;
      voronoiBounds[0] -= padding;
      voronoiBounds[1] -= padding;
      voronoiBounds[2] += padding;
      voronoiBounds[3] += padding;

      // Create Voronoi diagram
      const delaunay = d3.Delaunay.from(points);
      const voronoi = delaunay.voronoi(voronoiBounds);

      // Create polygons for each station
      const polygons = stations.map((station, i) => {
        const cell = voronoi.cellPolygon(i);
        if (!cell) return null;

        // Convert cell points back to LatLng
        const latLngs = cell.map(point => {
          const layerPoint = L.point(point[0], point[1]);
          return map.layerPointToLatLng(layerPoint);
        });

        // Create polygon with station's precipitation value
        const polygon = L.polygon(latLngs, {
          color: '#666',
          weight: 2,
          fillColor: getColorForPrecipitation(station.precipitation),
          fillOpacity: 0.5,
          className: 'thiessen-polygon'
        });

        // Add popup with station info
        polygon.bindPopup(`
          <div>
            <h3 class="font-bold">${station.name || `Station ${i + 1}`}</h3>
            <p>Precipitation: ${station.precipitation} mm</p>
          </div>
        `);

        return polygon;
      }).filter(Boolean);

      // Create layer group and add to map
      const layerGroup = L.layerGroup(polygons, {
        className: 'thiessen-layer'
      }).addTo(map);

      // Update polygons when map is zoomed or moved
      const updatePolygons = () => {
        // Convert stations to new pixel coordinates
        const updatedPoints = stations.map(station => {
          const point = map.latLngToLayerPoint([station.lat, station.lng]);
          return [point.x, point.y];
        });

        // Update bounds
        const updatedMinPoint = map.latLngToLayerPoint([bounds.minLat, bounds.minLng]);
        const updatedMaxPoint = map.latLngToLayerPoint([bounds.maxLat, bounds.maxLng]);

        const updatedBounds = [
          Math.min(updatedMinPoint.x, updatedMaxPoint.x) - padding,
          Math.min(updatedMinPoint.y, updatedMaxPoint.y) - padding,
          Math.max(updatedMinPoint.x, updatedMaxPoint.x) + padding,
          Math.max(updatedMinPoint.y, updatedMaxPoint.y) + padding
        ];

        // Create new Voronoi diagram
        const updatedDelaunay = d3.Delaunay.from(updatedPoints);
        const updatedVoronoi = updatedDelaunay.voronoi(updatedBounds);

        // Update polygon positions
        polygons.forEach((polygon, i) => {
          const cell = updatedVoronoi.cellPolygon(i);
          if (!cell) return;

          const latLngs = cell.map(point => {
            const layerPoint = L.point(point[0], point[1]);
            return map.layerPointToLatLng(layerPoint);
          });

          polygon.setLatLngs(latLngs);
        });
      };

      map.on('zoomend moveend', updatePolygons);

      // Cleanup
      return () => {
        map.removeLayer(layerGroup);
        map.off('zoomend moveend', updatePolygons);
      };
    } catch (error) {
      console.error('Error creating Thiessen polygons:', error);
    }
  }, [map, stations, bounds]);

  return null;
};

// Helper function to get color based on precipitation value
function getColorForPrecipitation(precipitation) {
  if (precipitation < 50) return '#3B82F6';  // blue
  if (precipitation < 100) return '#10B981'; // green
  if (precipitation < 150) return '#F59E0B'; // yellow
  return '#EF4444';                         // red
}

export default ThiessenLayer;
