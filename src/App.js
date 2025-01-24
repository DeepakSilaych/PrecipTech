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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Precipitation Calculator
          </h1>
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
