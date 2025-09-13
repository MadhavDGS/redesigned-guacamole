import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GlobeAltIcon, 
  MapIcon, 
  CalendarIcon, 
  ChartBarIcon,
  CpuChipIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  CloudIcon,
  SunIcon,
  WaterDropIcon
} from '@heroicons/react/24/outline';

interface SatelliteLayer {
  id: string;
  name: string;
  type: 'landsat' | 'sentinel' | 'modis' | 'custom';
  description: string;
  resolution: string;
  temporalRange: string;
  active: boolean;
}

interface AssetClassification {
  id: string;
  type: 'forest' | 'agriculture' | 'water' | 'settlement' | 'barren';
  confidence: number;
  area: number;
  coordinates: [number, number];
  detected: string;
  details: {
    ndvi?: number;
    ndwi?: number;
    elevation?: number;
    slope?: number;
    canopyCover?: number;
    soilMoisture?: number;
  };
}

interface TemporalAnalysis {
  date: string;
  changes: {
    forestLoss: number;
    forestGain: number;
    agriculturalExpansion: number;
    waterBodyChanges: number;
    settlementGrowth: number;
  };
  totalArea: number;
  alertLevel: 'low' | 'medium' | 'high';
}

const SatelliteAssetMapping: React.FC = () => {
  // State management
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: '2020-01-01',
    end: new Date().toISOString().split('T')[0]
  });
  const [activeLayers, setActiveLayers] = useState<string[]>(['landsat8']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [assetClassifications, setAssetClassifications] = useState<AssetClassification[]>([]);
  const [temporalAnalysis, setTemporalAnalysis] = useState<TemporalAnalysis[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetClassification | null>(null);
  const [isTimelapseMode, setIsTimelapseMode] = useState(false);
  const [timelapseIndex, setTimelapseIndex] = useState(0);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  // Available satellite layers
  const satelliteLayers: SatelliteLayer[] = [
    {
      id: 'landsat8',
      name: 'Landsat 8-9 OLI',
      type: 'landsat',
      description: 'High-resolution multispectral imagery for land-use analysis',
      resolution: '30m',
      temporalRange: '2013-Present',
      active: true
    },
    {
      id: 'sentinel2',
      name: 'Sentinel-2 MSI',
      type: 'sentinel',
      description: 'European Space Agency multispectral imaging for vegetation monitoring',
      resolution: '10-20m',
      temporalRange: '2015-Present',
      active: false
    },
    {
      id: 'modis',
      name: 'MODIS Terra/Aqua',
      type: 'modis',
      description: 'Daily global coverage for rapid change detection',
      resolution: '250-1000m',
      temporalRange: '2000-Present',
      active: false
    },
    {
      id: 'planetscope',
      name: 'PlanetScope',
      type: 'custom',
      description: 'Ultra-high resolution daily imagery for detailed analysis',
      resolution: '3-5m',
      temporalRange: '2016-Present',
      active: false
    }
  ];

  // Indian states for region selection
  const indianStates = [
    'Madhya Pradesh', 'Chhattisgarh', 'Odisha', 'Jharkhand', 'Maharashtra',
    'Gujarat', 'Rajasthan', 'Karnataka', 'Andhra Pradesh', 'Telangana',
    'Tamil Nadu', 'Kerala', 'West Bengal', 'Assam', 'Meghalaya',
    'Manipur', 'Nagaland', 'Tripura', 'Mizoram', 'Arunachal Pradesh'
  ];

  // Generate mock satellite analysis data
  const generateMockAssetData = useCallback((region: string): AssetClassification[] => {
    const mockAssets: AssetClassification[] = [
      {
        id: 'forest_001',
        type: 'forest',
        confidence: 94.2,
        area: 2847.5,
        coordinates: [22.5726, 88.3639],
        detected: '2024-09-15',
        details: {
          ndvi: 0.82,
          canopyCover: 87.5,
          elevation: 245
        }
      },
      {
        id: 'water_001',
        type: 'water',
        confidence: 98.7,
        area: 156.3,
        coordinates: [22.5826, 88.3739],
        detected: '2024-09-15',
        details: {
          ndwi: 0.75,
          elevation: 12
        }
      },
      {
        id: 'agri_001',
        type: 'agriculture',
        confidence: 91.8,
        area: 1245.8,
        coordinates: [22.5626, 88.3539],
        detected: '2024-09-15',
        details: {
          ndvi: 0.65,
          soilMoisture: 45.2,
          slope: 2.1
        }
      },
      {
        id: 'settlement_001',
        type: 'settlement',
        confidence: 89.3,
        area: 423.7,
        coordinates: [22.5926, 88.3839],
        detected: '2024-09-15',
        details: {
          elevation: 67
        }
      }
    ];

    return mockAssets.map(asset => ({
      ...asset,
      coordinates: [
        asset.coordinates[0] + (Math.random() - 0.5) * 0.1,
        asset.coordinates[1] + (Math.random() - 0.5) * 0.1
      ] as [number, number]
    }));
  }, []);

  // Generate temporal analysis data
  const generateTemporalAnalysis = useCallback((region: string): TemporalAnalysis[] => {
    const analysis: TemporalAnalysis[] = [];
    const startDate = new Date(selectedDateRange.start);
    const endDate = new Date(selectedDateRange.end);
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth());

    for (let i = 0; i <= Math.min(monthsDiff, 24); i += 3) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      const baseForestLoss = Math.random() * 50;
      const alertLevel = baseForestLoss > 30 ? 'high' : baseForestLoss > 15 ? 'medium' : 'low';
      
      analysis.push({
        date: date.toISOString().split('T')[0],
        changes: {
          forestLoss: baseForestLoss,
          forestGain: Math.random() * 20,
          agriculturalExpansion: Math.random() * 30,
          waterBodyChanges: (Math.random() - 0.5) * 20,
          settlementGrowth: Math.random() * 10
        },
        totalArea: 5000 + Math.random() * 1000,
        alertLevel
      });
    }

    return analysis;
  }, [selectedDateRange]);

  // Process satellite imagery
  const processSatelliteImagery = async () => {
    if (!selectedRegion) {
      alert('Please select a region first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      console.log('🛰️ Starting satellite analysis for:', selectedRegion);
      
      // Simulate processing steps
      const steps = [
        'Fetching satellite imagery...',
        'Preprocessing image data...',
        'Running land-use classification...',
        'Detecting water bodies...',
        'Analyzing forest cover...',
        'Calculating indices (NDVI, NDWI)...',
        'Performing temporal analysis...',
        'Generating change detection maps...',
        'Finalizing results...'
      ];

      for (let i = 0; i < steps.length; i++) {
        console.log(`Step ${i + 1}: ${steps[i]}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingProgress(((i + 1) / steps.length) * 100);
      }

      // Generate results
      const assets = generateMockAssetData(selectedRegion);
      const temporal = generateTemporalAnalysis(selectedRegion);
      
      setAssetClassifications(assets);
      setTemporalAnalysis(temporal);
      
      console.log('✅ Satellite analysis completed');
      alert(`✅ Analysis completed! Found ${assets.length} classified assets with temporal data for ${temporal.length} time periods.`);
      
    } catch (error) {
      console.error('Satellite processing error:', error);
      alert('❌ Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // Export analysis results
  const exportResults = (format: 'geojson' | 'csv' | 'pdf') => {
    if (format === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        features: assetClassifications.map(asset => ({
          type: 'Feature',
          properties: {
            id: asset.id,
            type: asset.type,
            confidence: asset.confidence,
            area: asset.area,
            detected: asset.detected,
            ...asset.details
          },
          geometry: {
            type: 'Point',
            coordinates: [asset.coordinates[1], asset.coordinates[0]]
          }
        }))
      };
      
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `satellite_analysis_${selectedRegion}_${new Date().toISOString().split('T')[0]}.geojson`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Timelapse controls
  const playTimelapse = () => {
    setIsTimelapseMode(true);
    const interval = setInterval(() => {
      setTimelapseIndex(prev => {
        if (prev >= temporalAnalysis.length - 1) {
          clearInterval(interval);
          setIsTimelapseMode(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const pauseTimelapse = () => {
    setIsTimelapseMode(false);
  };

  // Component styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          fontSize: '28px', 
          fontWeight: '700', 
          margin: '0 0 8px 0' 
        }}>
          <GlobeAltIcon style={{ width: '32px', height: '32px' }} />
          AI-Based Satellite Asset Mapping
        </h1>
        <p style={{ 
          fontSize: '16px', 
          opacity: 0.9, 
          margin: '0 0 16px 0' 
        }}>
          Google Earth Engine integration for land-use classification and temporal analysis
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap' 
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <CpuChipIcon style={{ width: '16px', height: '16px' }} />
            Machine Learning Classification
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <CalendarIcon style={{ width: '16px', height: '16px' }} />
            Temporal Change Detection
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <ChartBarIcon style={{ width: '16px', height: '16px' }} />
            Real-time Monitoring
          </span>
        </div>
      </div>

      {/* Control Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Region Selection */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937'
          }}>
            <MapIcon style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            Region Selection
          </h3>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '12px'
            }}
          >
            <option value="">Select a state for analysis</option>
            {indianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Select a region to begin satellite analysis and asset classification
          </div>
        </div>

        {/* Date Range */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937'
          }}>
            <CalendarIcon style={{ width: '20px', height: '20px', color: '#10b981' }} />
            Temporal Range
          </h3>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
              Start Date:
            </label>
            <input
              type="date"
              value={selectedDateRange.start}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
              End Date:
            </label>
            <input
              type="date"
              value={selectedDateRange.end}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Processing Controls */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937'
          }}>
            <CpuChipIcon style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
            Analysis Controls
          </h3>
          
          <button
            onClick={processSatelliteImagery}
            disabled={isProcessing || !selectedRegion}
            style={{
              width: '100%',
              padding: '12px',
              background: isProcessing || !selectedRegion ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isProcessing || !selectedRegion ? 'not-allowed' : 'pointer',
              marginBottom: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {isProcessing ? `🛰️ Processing... ${Math.round(processingProgress)}%` : '🚀 Start Satellite Analysis'}
          </button>
          
          {isProcessing && (
            <div style={{
              width: '100%',
              height: '6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                width: `${processingProgress}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Satellite Layers Panel */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>🛰️ Satellite Data Layers</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px'
        }}>
          {satelliteLayers.map(layer => (
            <div key={layer.id} style={{
              border: `2px solid ${activeLayers.includes(layer.id) ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} onClick={() => toggleLayer(layer.id)}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{layer.name}</h4>
                <input
                  type="checkbox"
                  checked={activeLayers.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                  style={{ marginLeft: '8px' }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                {layer.description}
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#9ca3af' }}>
                <span>📏 {layer.resolution}</span>
                <span>📅 {layer.temporalRange}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {assetClassifications.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: showAnalysisPanel ? '1fr 350px' : '1fr',
          gap: '20px'
        }}>
          {/* Main Map/Visualization Area */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            minHeight: '600px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3>📊 Asset Classification Results</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => exportResults('geojson')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} />
                  Export GeoJSON
                </button>
                <button
                  onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
                  style={{
                    padding: '6px 12px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {showAnalysisPanel ? 'Hide' : 'Show'} Panel
                </button>
              </div>
            </div>

            {/* Mock Satellite Map Visualization */}
            <div ref={mapRef} style={{
              width: '100%',
              height: '500px',
              background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Asset Markers */}
              {assetClassifications.map((asset, index) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  style={{
                    position: 'absolute',
                    left: `${20 + (index % 4) * 20}%`,
                    top: `${20 + Math.floor(index / 4) * 20}%`,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: asset.type === 'forest' ? '#10b981' : 
                               asset.type === 'water' ? '#3b82f6' :
                               asset.type === 'agriculture' ? '#f59e0b' : 
                               asset.type === 'settlement' ? '#ef4444' : '#6b7280',
                    border: '2px solid white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s',
                    transform: selectedAsset?.id === asset.id ? 'scale(1.5)' : 'scale(1)'
                  }}
                  title={`${asset.type} - ${asset.confidence}% confidence`}
                />
              ))}

              {/* Map Legend */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Asset Types</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                    Forest
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }}></div>
                    Water
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    Agriculture
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                    Settlement
                  </div>
                </div>
              </div>
            </div>

            {/* Timelapse Controls */}
            {temporalAnalysis.length > 0 && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>📹 Temporal Analysis</h4>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setTimelapseIndex(Math.max(0, timelapseIndex - 1))}
                      disabled={timelapseIndex === 0}
                      style={{
                        padding: '4px 8px',
                        background: timelapseIndex === 0 ? '#f3f4f6' : '#3b82f6',
                        color: timelapseIndex === 0 ? '#9ca3af' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: timelapseIndex === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <BackwardIcon style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button
                      onClick={isTimelapseMode ? pauseTimelapse : playTimelapse}
                      style={{
                        padding: '4px 8px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {isTimelapseMode ? 
                        <PauseIcon style={{ width: '14px', height: '14px' }} /> :
                        <PlayIcon style={{ width: '14px', height: '14px' }} />
                      }
                    </button>
                    <button
                      onClick={() => setTimelapseIndex(Math.min(temporalAnalysis.length - 1, timelapseIndex + 1))}
                      disabled={timelapseIndex === temporalAnalysis.length - 1}
                      style={{
                        padding: '4px 8px',
                        background: timelapseIndex === temporalAnalysis.length - 1 ? '#f3f4f6' : '#3b82f6',
                        color: timelapseIndex === temporalAnalysis.length - 1 ? '#9ca3af' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: timelapseIndex === temporalAnalysis.length - 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ForwardIcon style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Current: {temporalAnalysis[timelapseIndex]?.date} ({timelapseIndex + 1}/{temporalAnalysis.length})
                </div>
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          {showAnalysisPanel && (
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{ marginBottom: '16px' }}>📋 Analysis Details</h3>

              {/* Asset Statistics */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Asset Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(
                    assetClassifications.reduce((acc, asset) => {
                      acc[asset.type] = (acc[asset.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      padding: '4px 8px',
                      background: '#f9fafb',
                      borderRadius: '4px'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{type}</span>
                      <span style={{ fontWeight: '600' }}>{count} assets</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Asset Details */}
              {selectedAsset && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Selected Asset: {selectedAsset.type}
                  </h4>
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Confidence:</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {selectedAsset.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Area:</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {selectedAsset.area.toFixed(1)} ha
                      </span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Detected:</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {selectedAsset.detected}
                      </span>
                    </div>
                    
                    {/* Asset-specific details */}
                    {Object.entries(selectedAsset.details).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>
                          {key}:
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '500', marginLeft: '8px' }}>
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Temporal Changes */}
              {temporalAnalysis.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Recent Changes
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {temporalAnalysis.slice(-5).map((analysis, index) => (
                      <div key={index} style={{
                        padding: '8px',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {analysis.date}
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          Forest Loss: {analysis.changes.forestLoss.toFixed(1)} ha
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          Alert Level: 
                          <span style={{
                            marginLeft: '4px',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: '500',
                            background: analysis.alertLevel === 'high' ? '#fee2e2' :
                                       analysis.alertLevel === 'medium' ? '#fef3c7' : '#dcfce7',
                            color: analysis.alertLevel === 'high' ? '#991b1b' :
                                   analysis.alertLevel === 'medium' ? '#92400e' : '#166534'
                          }}>
                            {analysis.alertLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SatelliteAssetMapping;
