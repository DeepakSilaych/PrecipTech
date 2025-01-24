import React, { useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import * as d3 from 'd3-contour';

const IsohyetalLayer = ({ stations, bounds }) => {
  const contours = useMemo(() => {
    if (!stations || stations.length < 3) return [];

    try {
      // Create a grid of values using IDW interpolation
      const gridSize = 50;
      const dx = (bounds.maxLng - bounds.minLng) / gridSize;
      const dy = (bounds.maxLat - bounds.minLat) / gridSize;
      const values = new Array(gridSize * gridSize);

      // Generate grid values using IDW
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const lat = bounds.minLat + (i * dy);
          const lng = bounds.minLng + (j * dx);
          values[i * gridSize + j] = calculateIDWValue(stations, lat, lng);
        }
      }

      // Generate contours
      const contourGenerator = d3.contours()
        .size([gridSize, gridSize])
        .thresholds(8); // Number of contour lines

      const contourData = contourGenerator(values);

      // Transform contour coordinates to map coordinates
      return contourData.map(contour => ({
        value: contour.value,
        lines: contour.coordinates.map(line => 
          line[0].map(point => [
            bounds.minLat + (point[1] * dy),
            bounds.minLng + (point[0] * dx)
          ])
        )
      }));
    } catch (error) {
      console.error('Error generating isohyets:', error);
      return [];
    }
  }, [stations, bounds]);

  const getContourColor = (value) => {
    const maxPrecip = Math.max(...stations.map(s => s.precipitation));
    const ratio = value / maxPrecip;
    return ratio < 0.25 ? '#3B82F6' :  // blue
           ratio < 0.5 ? '#10B981' :   // green
           ratio < 0.75 ? '#F59E0B' :  // yellow
           '#EF4444';                  // red
  };

  return (
    <>
      {contours.map((contour, i) => 
        contour.lines.map((line, j) => (
          <Polyline
            key={`${i}-${j}`}
            positions={line}
            pathOptions={{
              color: getContourColor(contour.value),
              weight: 2,
              opacity: 0.8
            }}
          >
          </Polyline>
        ))
      )}
    </>
  );
};

// Helper function to calculate IDW value at a point
function calculateIDWValue(stations, lat, lng) {
  let weightedSum = 0;
  let weightSum = 0;

  stations.forEach(station => {
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    if (distance === 0) return station.precipitation;

    const weight = 1 / Math.pow(distance, 2);
    weightedSum += station.precipitation * weight;
    weightSum += weight;
  });

  return weightedSum / weightSum;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

export default IsohyetalLayer;
