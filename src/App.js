import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import DataPanel from './components/DataPanel';
import MethodSelector from './components/MethodSelector';
import ResultsSection from './components/ResultsSection';

function App() {
  const [stations, setStations] = useState([]);
  const [targetPoint, setTargetPoint] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('arithmetic');
  const [results, setResults] = useState(null);

  const handleStationAdd = (data) => {
    const newStation = {
      name: `Station ${stations.length + 1}`,
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
      precipitation: parseFloat(data.precipitation)
    };
    setStations([...stations, newStation]);
  };

  const handleStationRemove = (index) => {
    setStations(stations.filter((station, i) => i !== index));
  };

  const handleTargetPointSelect = (lat, lng) => {
    setTargetPoint({ lat, lng });
  };

  const handleCalculate = () => {
    if (!targetPoint) {
      alert('Please select a target point on the map first');
      return;
    }

    if (!selectedMethod) {
      alert('Please select a calculation method');
      return;
    }

    let value = 0;
    let visualization = null;

    try {
      switch (selectedMethod) {
        case 'arithmetic':
          value = calculateArithmeticMean(stations);
          break;
        case 'normal-ratio':
          if (!normalPrecipitation) {
            alert('Please enter normal precipitation value');
            return;
          }
          value = calculateNormalRatio(stations, parseFloat(normalPrecipitation));
          break;
        case 'idw':
          value = calculateIDW(stations, targetPoint.lat, targetPoint.lng);
          break;
        case 'thiessen':
          if (stations.length < 3) {
            alert('Thiessen method requires at least 3 stations');
            return;
          }
          const bounds = {
            minLat: Math.min(...stations.map(s => s.lat), targetPoint.lat),
            maxLat: Math.max(...stations.map(s => s.lat), targetPoint.lat),
            minLng: Math.min(...stations.map(s => s.lng), targetPoint.lng),
            maxLng: Math.max(...stations.map(s => s.lng), targetPoint.lng)
          };
          const thiessen = calculateThiessenPolygon(stations, bounds);
          value = thiessen.value;
          visualization = 'thiessen';
          break;
        case 'isohyetal':
          if (stations.length < 3) {
            alert('Isohyetal method requires at least 3 stations');
            return;
          }
          const isohyetalBounds = {
            minLat: Math.min(...stations.map(s => s.lat), targetPoint.lat),
            maxLat: Math.max(...stations.map(s => s.lat), targetPoint.lat),
            minLng: Math.min(...stations.map(s => s.lng), targetPoint.lng),
            maxLng: Math.max(...stations.map(s => s.lng), targetPoint.lng)
          };
          const isohyetal = calculateIsohyetal(stations, isohyetalBounds);
          value = isohyetal.value;
          visualization = 'isohyetal';
          break;
        default:
          alert('Invalid method selected');
          return;
      }

      setResults({
        method: selectedMethod,
        value: value,
        stations: stations,
        targetPoint: targetPoint,
        visualization: visualization
      });
    } catch (error) {
      console.error('Error calculating results:', error);
      alert('Error calculating results. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Logo */}
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <h1 className="ml-3 text-2xl font-bold text-white">PrecipTech</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/yourusername/preciptech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-200 transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to PrecipTech</h2>
          <p className="text-gray-600">
            Calculate and visualize precipitation patterns using advanced interpolation methods:
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Thiessen Polygon</h3>
              <p className="text-sm text-blue-700">Area-weighted method using polygons of influence</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Isohyetal</h3>
              <p className="text-sm text-green-700">Contour-based method for smooth transitions</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900">Other Methods</h3>
              <p className="text-sm text-yellow-700">Arithmetic Mean, Normal Ratio, and IDW</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <DataPanel 
              stations={stations} 
              onStationAdd={handleStationAdd}
              onStationRemove={handleStationRemove}
              targetPoint={targetPoint}
              onTargetPointSet={handleTargetPointSelect}
            />
            <MethodSelector
              selectedMethod={selectedMethod}
              onMethodSelect={setSelectedMethod}
              onCalculate={handleCalculate}
              disabled={!stations.length || !targetPoint}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <MapComponent
                stations={stations}
                targetPoint={targetPoint}
                onStationAdd={handleStationAdd}
                onTargetPointSelect={handleTargetPointSelect}
                selectedMethod={selectedMethod}
              />
            </div>
            {results && <ResultsSection results={results} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              2025 PrecipTech. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              <h3 className="text-white font-semibold mb-2">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://en.wikipedia.org/wiki/Thiessen_polygons" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    About Thiessen Polygons
                  </a>
                </li>
                <li>
                  <a href="https://en.wikipedia.org/wiki/Isohyet" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    About Isohyetal Method
                  </a>
                </li>
              </ul>
            </div>
            <div className="mt-4 md:mt-0">
              <h3 className="text-white font-semibold mb-2">Contact</h3>
              <p className="text-gray-400 text-sm">
                Have questions? Email us at:<br />
                <a href="mailto:contact@preciptech.com" className="hover:text-white">
                  contact@preciptech.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
