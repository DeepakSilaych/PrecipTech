import React, { useState, useEffect } from 'react';

const DataPanel = ({ 
  onDataUpload, 
  onManualAdd, 
  stations, 
  selectedLocation, 
  targetPoint,
  onTargetPointSet
}) => {
  const [stationData, setStationData] = useState({
    latitude: '',
    longitude: '',
    precipitation: '',
  });

  const [targetData, setTargetData] = useState({
    lat: '',
    lng: ''
  });

  // Update input fields when a location is selected on the map
  useEffect(() => {
    if (selectedLocation) {
      setStationData(prev => ({
        ...prev,
        latitude: selectedLocation.lat.toFixed(6),
        longitude: selectedLocation.lng.toFixed(6)
      }));
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (targetPoint) {
      setTargetData({
        lat: targetPoint.lat.toFixed(6),
        lng: targetPoint.lng.toFixed(6)
      });
    }
  }, [targetPoint]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          // Split into lines and filter out empty lines
          const lines = text.split(/\r\n|\n/).filter(line => line.trim());
          
          // Parse each line into an array and filter out invalid rows
          const parsedData = lines.map(line => {
            const [lat, lng, precip] = line.split(',').map(val => val.trim());
            return [lat, lng, precip];
          }).filter(row => {
            // Validate each row has 3 numeric values
            return row.length === 3 && 
                   row.every(val => !isNaN(parseFloat(val)) && isFinite(val));
          });

          if (parsedData.length === 0) {
            throw new Error('No valid data found in CSV');
          }

          onDataUpload(parsedData);
          event.target.value = ''; // Reset file input
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please ensure the file contains valid data in the format: latitude,longitude,precipitation');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stationData.latitude || !stationData.longitude || !stationData.precipitation) {
      alert('Please fill in all fields');
      return;
    }
    onManualAdd(stationData);
    setStationData({
      latitude: '',
      longitude: '',
      precipitation: '',
    });
  };

  const handleTargetSubmit = (e) => {
    e.preventDefault();
    if (!targetData.lat || !targetData.lng) {
      alert('Please enter both latitude and longitude for the target point');
      return;
    }

    onTargetPointSet({
      lat: parseFloat(targetData.lat),
      lng: parseFloat(targetData.lng)
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Station Data</h2>
      
      {/* File Upload Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Upload CSV</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="w-full p-2 border rounded"
        />
        <p className="mt-1 text-sm text-gray-500">
          CSV format: latitude,longitude,precipitation (one station per line)
        </p>
      </div>

      {/* Station Input Form */}
      <form onSubmit={handleSubmit}>
        <h3 className="font-semibold mb-2">Add Station</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              value={stationData.latitude}
              onChange={(e) => setStationData({...stationData, latitude: e.target.value})}
              className="w-full p-2 border rounded"
              step="any"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              value={stationData.longitude}
              onChange={(e) => setStationData({...stationData, longitude: e.target.value})}
              className="w-full p-2 border rounded"
              step="any"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precipitation (mm)
            </label>
            <input
              type="number"
              value={stationData.precipitation}
              onChange={(e) => setStationData({...stationData, precipitation: e.target.value})}
              className="w-full p-2 border rounded"
              step="any"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Station
          </button>
        </div>
      </form>

      {/* Target Point Input Form */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Target Point</h3>
        <form onSubmit={handleTargetSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Latitude*
              </label>
              <input
                type="number"
                value={targetData.lat}
                onChange={(e) => setTargetData({ ...targetData, lat: e.target.value })}
                placeholder="Enter latitude"
                step="any"
                required
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Longitude*
              </label>
              <input
                type="number"
                value={targetData.lng}
                onChange={(e) => setTargetData({ ...targetData, lng: e.target.value })}
                placeholder="Enter longitude"
                step="any"
                required
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Set Target Point
          </button>
        </form>
      </div>

      {/* Stations List */}
      {stations.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Added Stations</h3>
          <div className="max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lat</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Long</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precip</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stations.map((station, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{station.name}</td>
                    <td className="px-3 py-2">{station.lat.toFixed(6)}</td>
                    <td className="px-3 py-2">{station.lng.toFixed(6)}</td>
                    <td className="px-3 py-2">{station.precipitation} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPanel;
