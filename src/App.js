import React, { useState, useEffect } from 'react';
import DataPanel from './components/DataPanel';
import MethodSelector from './components/MethodSelector';
import ResultsSection from './components/ResultsSection';
import { 
  calculateArithmeticMean, 
  calculateNormalRatio, 
  calculateIDW,
  calculateThiessenPolygon,
  calculateIsohyetal
} from './utils/calculations';

// Lazy load MapComponent to avoid SSR issues
const MapComponent = React.lazy(() => import('./components/MapComponent'));

function App() {
  const [stations, setStations] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [normalPrecipitation, setNormalPrecipitation] = useState('');
  const [targetPoint, setTargetPoint] = useState(null);
  const [results, setResults] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDataUpload = (data) => {
    // Process CSV data
    const processedData = data.slice(1).map((row, index) => ({
      name: `Station ${stations.length + index + 1}`,
      lat: parseFloat(row[0]),
      lng: parseFloat(row[1]),
      precipitation: parseFloat(row[2])
    }));
    setStations([...stations, ...processedData]);
  };

  const handleManualAdd = (data) => {
    const newStation = {
      name: `Station ${stations.length + 1}`,
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
      precipitation: parseFloat(data.precipitation)
    };
    setStations([...stations, newStation]);
  };

  const handleLocationSelect = (lat, lng) => {
    setSelectedLocation({ lat, lng });
  };

  const handleTargetPointSelect = (lat, lng) => {
    setTargetPoint({ lat, lng });
  };

  const calculateResults = () => {
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
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold text-white">PrecipTech</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/deepaksilaych/preciptech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-100 transition-colors flex items-center space-x-2"
              > Star project on GitHub
                <svg className="h-6 w-6 mx-2"  fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <DataPanel 
              stations={stations} 
              onDataUpload={handleDataUpload}
              onManualAdd={handleManualAdd}
              targetPoint={targetPoint}
              onTargetPointSet={handleTargetPointSelect}
              selectedLocation={selectedLocation}
            />
            <MethodSelector
              selectedMethod={selectedMethod}
              onMethodChange={setSelectedMethod}
              normalPrecipitation={normalPrecipitation}
              onNormalPrecipitationChange={setNormalPrecipitation}
              stationCount={stations.length}
            />
            <button
              onClick={calculateResults}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={!selectedMethod || !targetPoint || stations.length === 0}
            >
              Calculate
            </button>
          </div>
          
          <div className="space-y-6">
            {isClient && (
              <React.Suspense fallback={<div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />}>
                <MapComponent 
                  stations={stations} 
                  onLocationSelect={handleLocationSelect}
                  onTargetPointSelect={handleTargetPointSelect}
                  selectedMethod={results?.visualization}
                  targetPoint={targetPoint}
                />
              </React.Suspense>
            )}
            <ResultsSection results={results} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
