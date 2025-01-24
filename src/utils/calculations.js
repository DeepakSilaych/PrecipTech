import { Delaunay } from 'd3-delaunay';
import * as d3 from 'd3-contour';

// Arithmetic Mean Method
export const calculateArithmeticMean = (stations) => {
  if (!stations || stations.length === 0) return 0;
  const sum = stations.reduce((acc, station) => acc + station.precipitation, 0);
  return sum / stations.length;
};

// Normal Ratio Method
export const calculateNormalRatio = (stations, normalPrecipitation) => {
  if (!stations || stations.length === 0 || !normalPrecipitation) return 0;
  
  // Calculate weighted sum based on normal precipitation ratios
  let weightedSum = 0;
  stations.forEach(station => {
    // Weight each station's precipitation by the ratio of normal precipitation
    weightedSum += (station.precipitation * normalPrecipitation) / stations.length;
  });
  
  return weightedSum;
};

// Inverse Distance Weighting Method
export const calculateIDW = (stations, targetLat, targetLng, power = 2) => {
  if (!stations || stations.length === 0) return 0;

  let weightedSum = 0;
  let weightSum = 0;

  stations.forEach(station => {
    const distance = calculateDistance(targetLat, targetLng, station.lat, station.lng);
    if (distance === 0) return station.precipitation;

    const weight = 1 / Math.pow(distance, power);
    weightedSum += station.precipitation * weight;
    weightSum += weight;
  });

  return weightedSum / weightSum;
};

// Thiessen Polygon Method
export const calculateThiessenPolygon = (stations, bounds) => {
  if (!stations || stations.length < 3) return null;

  try {
    // Convert stations to points array
    const points = stations.map(s => [s.lat, s.lng]);
    
    // Create Delaunay triangulation
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([
      bounds.minLat,
      bounds.minLng,
      bounds.maxLat,
      bounds.maxLng
    ]);

    // Calculate areas and weighted precipitation
    let totalArea = 0;
    let weightedSum = 0;

    for (let i = 0; i < points.length; i++) {
      const cell = voronoi.cellPolygon(i);
      if (cell) {
        const area = calculatePolygonArea(cell);
        weightedSum += area * stations[i].precipitation;
        totalArea += area;
      }
    }

    return {
      value: weightedSum / totalArea,
      polygons: Array.from({ length: points.length }, (_, i) => voronoi.cellPolygon(i)).filter(Boolean)
    };
  } catch (error) {
    console.error('Error calculating Thiessen polygons:', error);
    return null;
  }
};

// Isohyetal Method
export const calculateIsohyetal = (stations, bounds, intervals = 5) => {
  if (!stations || stations.length < 3) return null;

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
        values[i * gridSize + j] = calculateIDW(stations, lat, lng);
      }
    }

    // Generate contours
    const contours = d3.contours()
      .size([gridSize, gridSize])
      .thresholds(intervals)
      (values);

    // Calculate area-weighted average
    let totalArea = 0;
    let weightedSum = 0;

    for (let i = 0; i < contours.length - 1; i++) {
      const area = calculateContourArea(contours[i]);
      const avgValue = (contours[i].value + contours[i + 1].value) / 2;
      weightedSum += area * avgValue;
      totalArea += area;
    }

    return {
      value: weightedSum / totalArea,
      contours: contours.map(contour => ({
        value: contour.value,
        coordinates: contour.coordinates
      }))
    };
  } catch (error) {
    console.error('Error calculating isohyets:', error);
    return null;
  }
};

// Helper Functions
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

function calculatePolygonArea(polygon) {
  if (!polygon || polygon.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i][0] * polygon[j][1];
    area -= polygon[j][0] * polygon[i][1];
  }
  return Math.abs(area) / 2;
}

function calculateContourArea(contour) {
  let totalArea = 0;
  contour.coordinates.forEach(polygon => {
    totalArea += calculatePolygonArea(polygon[0]); // Use outer ring only
  });
  return totalArea;
}
