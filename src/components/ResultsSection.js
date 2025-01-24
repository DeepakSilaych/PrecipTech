import React from 'react';
import ResultMap from './ResultMap';

const ResultsSection = ({ results }) => {
  if (!results || !results.targetPoint || typeof results.targetPoint.lat !== 'number' || typeof results.targetPoint.lng !== 'number') return null;

  const methodNames = {
    'arithmetic': 'Arithmetic Mean',
    'normal-ratio': 'Normal Ratio',
    'idw': 'Inverse Distance Weighting',
    'thiessen': 'Thiessen Polygon',
    'isohyetal': 'Isohyetal Method'
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold">Results</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Method</h3>
          <p className="text-gray-700">{methodNames[results.method]}</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">Target Point</h3>
          <p className="text-gray-700">
            Latitude: {results.targetPoint.lat.toFixed(6)}<br />
            Longitude: {results.targetPoint.lng.toFixed(6)}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">Calculated Precipitation</h3>
          <p className="text-2xl font-bold text-blue-600">
            {results.value.toFixed(2)} mm
          </p>
        </div>

        {/* Result Map */}
        {results.visualization && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Visualization</h3>
            <ResultMap
              stations={results.stations}
              targetPoint={results.targetPoint}
              visualization={results.visualization}
            />
            <p className="mt-2 text-sm text-gray-600">
              {results.visualization === 'thiessen' ? (
                'Colored polygons show areas influenced by each station.'
              ) : results.visualization === 'isohyetal' ? (
                'Contour lines show areas of equal precipitation.'
              ) : null}
            </p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-lg">Stations Used</h3>
          <div className="max-h-40 overflow-y-auto mt-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precipitation</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.stations.map((station, index) => {
                  // Calculate distance from target point
                  const distance = calculateDistance(
                    results.targetPoint.lat,
                    results.targetPoint.lng,
                    station.lat,
                    station.lng
                  );
                  
                  return (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm">{station.name || `Station ${index + 1}`}</td>
                      <td className="px-3 py-2 text-sm">{station.precipitation} mm</td>
                      <td className="px-3 py-2 text-sm">{distance.toFixed(2)} km</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate distance between two points
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

export default ResultsSection;
