import React from 'react';

const methods = [
  { id: 'arithmetic', name: 'Arithmetic Mean', minStations: 1 },
  { id: 'normal-ratio', name: 'Normal Ratio', minStations: 1 },
  { id: 'idw', name: 'Inverse Distance Weighting', minStations: 1 },
  { id: 'thiessen', name: 'Thiessen Polygon', minStations: 3 },
  { id: 'isohyetal', name: 'Isohyetal Method', minStations: 3 }
];

const MethodSelector = ({ 
  selectedMethod, 
  onMethodChange, 
  normalPrecipitation, 
  onNormalPrecipitationChange,
  stationCount = 0
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Calculation Method</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Method
          </label>
          <select
            value={selectedMethod}
            onChange={(e) => onMethodChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a method...</option>
            {methods.map((method) => (
              <option 
                key={method.id} 
                value={method.id}
                disabled={stationCount < method.minStations}
              >
                {method.name} {method.minStations > 1 ? `(min ${method.minStations} stations)` : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedMethod === 'normal-ratio' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Normal Annual Precipitation (mm)
            </label>
            <input
              type="number"
              value={normalPrecipitation}
              onChange={(e) => onNormalPrecipitationChange(e.target.value)}
              placeholder="Enter normal precipitation"
              className="w-full p-2 border rounded"
              step="any"
              required
            />
          </div>
        )}

        <div className="text-sm text-gray-600">
          {selectedMethod === 'arithmetic' && (
            <p>Simple average of all station precipitation values.</p>
          )}
          {selectedMethod === 'normal-ratio' && (
            <p>Weighted average based on normal annual precipitation at each station.</p>
          )}
          {selectedMethod === 'idw' && (
            <p>Weighted average based on inverse distance from each station.</p>
          )}
          {selectedMethod === 'thiessen' && (
            <p>Area-weighted average using Thiessen polygons. Shows colored polygons on the map representing each station's area of influence.</p>
          )}
          {selectedMethod === 'isohyetal' && (
            <p>Area-weighted average using interpolated contour lines. Shows isohyets (lines of equal precipitation) on the map.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MethodSelector;
