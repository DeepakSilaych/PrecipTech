import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import DataPanel from './components/DataPanel';
import MethodSelector from './components/MethodSelector';
import ResultsSection from './components/ResultsSection';
import { FaGithub } from 'react-icons/fa';

function App() {
  const [stations, setStations] = useState([]);
  const [targetPoint, setTargetPoint] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('arithmetic');
  const [results, setResults] = useState(null);

  const handleStationAdd = (station) => {
    setStations([...stations, station]);
  };

  const handleStationRemove = (index) => {
    setStations(stations.filter((_, i) => i !== index));
  };

  const handleTargetPointSelect = (point) => {
    setTargetPoint(point);
  };

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
  };

  const calculatePrecipitation = () => {
    if (!targetPoint || stations.length === 0) {
      alert('Please add stations and select a target point');
      return;
    }

    if (selectedMethod === 'thiessen' && stations.length < 3) {
      alert('Thiessen method requires at least 3 stations');
      return;
    }

    let value = 0;
    switch (selectedMethod) {
      case 'arithmetic':
        value = stations.reduce((sum, s) => sum + s.precipitation, 0) / stations.length;
        break;
      case 'thiessen':
        // Simplified Thiessen calculation for demo
        value = stations.reduce((sum, s) => sum + s.precipitation, 0) / stations.length;
        break;
      case 'isohyetal':
        // Simplified Isohyetal calculation for demo
        value = stations.reduce((sum, s) => sum + s.precipitation, 0) / stations.length;
        break;
      default:
        value = 0;
    }

    setResults({
      method: selectedMethod,
      value,
      stations,
      targetPoint,
      visualization: ['thiessen', 'isohyetal'].includes(selectedMethod) ? selectedMethod : null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <h1 className="text-3xl font-bold">PrecipTech</h1>
            </div>
            <a 
              href="https://github.com/yourusername/preciptech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            >
              <FaGithub className="h-6 w-6" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to PrecipTech</h2>
          <p className="text-gray-600">
            Calculate precipitation at any point using various methods including Thiessen Polygon and Isohyetal analysis.
            Add stations, select your target point, and choose a calculation method to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Map and Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <MapComponent
                stations={stations}
                targetPoint={targetPoint}
                onStationAdd={handleStationAdd}
                onTargetPointSelect={handleTargetPointSelect}
                selectedMethod={selectedMethod}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <MethodSelector
                selectedMethod={selectedMethod}
                onMethodChange={handleMethodChange}
              />
              <button
                onClick={calculatePrecipitation}
                className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Calculate Precipitation
              </button>
            </div>
          </div>

          {/* Right Column: Data Panel and Results */}
          <div className="space-y-6">
            <DataPanel
              stations={stations}
              onStationAdd={handleStationAdd}
              onStationRemove={handleStationRemove}
              targetPoint={targetPoint}
              onTargetPointSet={handleTargetPointSelect}
            />
            {results && <ResultsSection results={results} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold">PrecipTech</h3>
              <p className="text-sm">Precipitation Analysis Made Easy</p>
            </div>
            <div className="flex space-x-6">
              <a href="https://github.com/yourusername/preciptech" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <FaGithub className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
