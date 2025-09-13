import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FRAClaimData {
  id: string;
  title: string;
  state: string;
  district: string;
  village?: string;
  claimType: 'Individual' | 'Community';
  status: 'Approved' | 'Pending' | 'Under Review' | 'Rejected';
  coordinates: [number, number];
  lastUpdated: string;
  source: string;
  individualClaims: {
    received: number;
    distributed: number;
  };
  communityClaims: {
    received: number;
    distributed: number;
  };
  totalClaims: {
    received: number;
    distributed: number;
  };
  approvalRate: string;
  area?: number;
  // Additional properties for different datasets
  year?: string;
  fireAlerts2017?: number;
  fireAlerts2018?: number;
  fireAlerts2019?: number;
  fireAlerts2020?: number;
  fireAlerts2021?: number;
  rejected2014?: number;
  rejected2015?: number;
  rejected2016?: number;
  rejected2017?: number;
  rejected2018?: number;
  generalData?: boolean;
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    DISTRICT?: string;
    ST_NM?: string;
    name?: string;
    [key: string]: any;
  };
  geometry: any;
}

interface GeoBoundaryData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface MapProps {
  fraData?: FRAClaimData[];
  selectedState?: string;
  selectedDistrict?: string;
  onLocationSelect?: (location: { state?: string; district?: string }) => void;
}

const Map: React.FC<MapProps> = ({ 
  fraData = [],
  selectedState, 
  selectedDistrict, 
  onLocationSelect 
}) => {
  const [statesBoundaries, setStatesBoundaries] = useState<GeoBoundaryData | null>(null);
  const [districtsBoundaries, setDistrictsBoundaries] = useState<GeoBoundaryData | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.5, 78.0]); // Center of India
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);
  const [realFRAData, setRealFRAData] = useState<FRAClaimData[]>([]);
  const [showClusters, setShowClusters] = useState(true);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('osm');
  
  // Additional state for popup functionality
  const [selectedClaim, setSelectedClaim] = useState<FRAClaimData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filteredData, setFilteredData] = useState<FRAClaimData[]>([]);
  const [focusedArea, setFocusedArea] = useState<FRAClaimData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Government API configuration (same as ClaimsManagement)
  const GOVT_API_KEY = '579b464db66ec23bdd0000017bc9e4e43c4543227ae43333ed0a32d3';
  const GOVT_API_BASE = 'https://api.data.gov.in';

  // API endpoints for ALL available FRA data - fetching maximum historical data
  const API_ENDPOINTS = {
    latest2024: '/resource/54940646-f445-461d-b99c-e8e6a2f3a0b4', // Latest 2024 data
    claims2023: '/resource/e4e42046-14e1-487d-880e-405d1257f49c', // 2023 data  
    progress2022: '/resource/72d78b15-5861-41f6-beb1-e6095674898f', // 2022 data
    landPattas2019_2021: '/resource/3209e177-db5f-4a32-9639-c826ad4dd018', // 2019-2021 data
    claims2017: '/resource/dcf9aaac-c3df-4eb8-b3bd-c23dc580a7af', // 2017 data
    forestLand2014_2019: '/resource/ad768903-b71d-4636-9559-8b7225f07881', // 2014-2019 data
    rejectedClaims2014_2018: '/resource/068eeda4-8a74-4815-952a-1d0222dc87cc', // Rejected claims data
    forestFireAlerts: '/resource/f1a4466f-8386-4b86-8710-3ff3d888e3bc', // Forest fire data
    approvalRates2018: '/resource/f55d3181-a8bc-477f-bb51-f14910355e31', // Approval rates
    utClaims2022: '/resource/70cf2239-5635-46d0-8210-05864ea10f37' // UT claims data
  };

  // Fetch ALL government FRA data from multiple endpoints
  const fetchAllGovernmentFRAData = async () => {
    try {
      console.log('Fetching ALL available FRA data from multiple government APIs...');
      const allDataPromises = Object.entries(API_ENDPOINTS).map(async ([key, endpoint]) => {
        try {
          const url = new URL(`${GOVT_API_BASE}${endpoint}`);
          url.searchParams.append('api-key', GOVT_API_KEY);
          url.searchParams.append('format', 'json');
          url.searchParams.append('limit', '200'); // Increased limit for more data
          url.searchParams.append('offset', '0');

          const response = await fetch(url.toString());
          if (!response.ok) {
            console.warn(`API ${key} failed:`, response.status);
            return { key, data: [] };
          }
          
          const data = await response.json();
          const records = data.records || [];
          console.log(`Fetched ${records.length} records from ${key}`);
          return { key, data: records };
        } catch (error) {
          console.error(`Error fetching ${key}:`, error);
          return { key, data: [] };
        }
      });

      const allResults = await Promise.all(allDataPromises);
      
      // Process and combine all data
      let combinedData: FRAClaimData[] = [];
      let dataCounter = 0;

      allResults.forEach(({ key, data }) => {
        if (data.length === 0) return;

        data.forEach((record: any, index: number) => {
          if (!record.state && !record.states && !record.states_ut) return;
          
          const state = record.state || record.states || record.states_ut || 'Unknown';
          if (state === 'Total' || state === 'Grand Total' || state === 'Sub Total') return;

          // Generate coordinates for every state with some variation
          const stateCoordinates: { [key: string]: [number, number][] } = {
            'Madhya Pradesh': [[23.2599, 77.4126], [22.9734, 78.6569], [23.8143, 77.5985], [24.0975, 77.7295]],
            'Chhattisgarh': [[21.2787, 81.8661], [20.5937, 81.9629], [21.6637, 81.5685], [22.0797, 82.1409]],
            'Maharashtra': [[19.7515, 75.7139], [18.5204, 73.8567], [20.5937, 78.9629], [19.0760, 72.8777]],
            'Odisha': [[20.9517, 85.0985], [20.2961, 85.8245], [21.5156, 84.8893], [19.3149, 84.7941]],
            'Telangana': [[18.1124, 79.0193], [17.3850, 78.4867], [18.7747, 79.5037], [17.7231, 83.3219]],
            'Jharkhand': [[23.6102, 85.2799], [22.9734, 86.4304], [24.5854, 85.0685], [23.2599, 85.3094]],
            'Andhra Pradesh': [[15.9129, 79.7400], [14.4426, 79.9865], [16.5062, 80.6480], [15.8281, 78.0373]],
            'Karnataka': [[15.3173, 75.7139], [12.2958, 76.6394], [14.5203, 75.7223], [15.8497, 74.4977]],
            'West Bengal': [[22.9868, 87.8550], [22.5726, 88.3639], [23.6850, 87.8492], [22.3511, 87.3206]],
            'Gujarat': [[23.0225, 72.5714], [22.2587, 71.1924], [23.7337, 72.8324], [21.1702, 72.8311]],
            'Rajasthan': [[27.0238, 74.2179], [26.9124, 75.7873], [28.0229, 73.3119], [27.3914, 73.4321]],
            'Uttarakhand': [[30.0668, 79.0193], [29.9457, 78.1642], [30.3165, 78.0322], [30.7268, 79.5937]],
            'Assam': [[26.2006, 92.9376], [26.1445, 91.7362], [26.7499, 93.3662], [25.5788, 91.8933]],
            'Kerala': [[10.8505, 76.2711], [9.9312, 76.2673], [11.2588, 75.7804], [8.2904, 76.9212]],
            'Tamil Nadu': [[11.1271, 78.6569], [13.0827, 80.2707], [10.7905, 78.7047], [11.9416, 79.8083]],
            'Himachal Pradesh': [[31.1048, 77.1734], [32.1024, 77.1734], [31.6040, 76.4194], [31.8947, 77.5910]],
            'Uttar Pradesh': [[26.8467, 80.9462], [25.5941, 85.1376], [27.5706, 80.0982], [26.4499, 80.3319]],
            'Bihar': [[25.0961, 85.3131], [25.5941, 85.1376], [25.7850, 87.4799], [24.7914, 85.0002]],
            'Haryana': [[29.0588, 76.0856], [28.4595, 77.0266], [29.3803, 76.7794], [28.7041, 76.9877]],
            'Punjab': [[31.1471, 75.3412], [30.9010, 75.8573], [31.6340, 74.8723], [30.7388, 76.7794]],
            'Tripura': [[23.9408, 91.9882], [23.8315, 91.2868], [24.0625, 92.1746], [23.7957, 91.1153]],
            'Mizoram': [[23.1645, 92.9376], [23.7307, 92.7173], [22.9734, 92.6271], [23.9739, 93.3262]],
            'Manipur': [[24.6637, 93.9063], [24.8170, 93.9368], [24.3259, 93.8090], [25.0807, 94.1745]],
            'Meghalaya': [[25.4670, 91.3662], [25.5788, 91.8933], [25.2047, 90.7473], [25.6751, 92.2593]],
            'Nagaland': [[26.1584, 94.5624], [26.1844, 94.1077], [26.3650, 94.9258], [25.6751, 94.1104]],
            'Sikkim': [[27.5330, 88.5122], [27.6006, 88.4370], [27.3953, 88.6077], [27.7172, 88.7876]],
            'Arunachal Pradesh': [[28.2180, 94.7278], [27.8731, 95.0542], [28.5479, 94.3621], [27.1006, 93.6164]],
            'Goa': [[15.2993, 74.1240], [15.3004, 74.0855], [15.6000, 73.7997], [15.1776, 73.9190]]
          };

          const baseCoords = stateCoordinates[state] || [[23.5, 78.0]];
          const coordSet = baseCoords[dataCounter % baseCoords.length];
          
          // Add more variation to avoid clustering
          const lat = coordSet[0] + (Math.random() - 0.5) * 1.5;
          const lng = coordSet[1] + (Math.random() - 0.5) * 1.5;

          // Extract different data based on API endpoint
          let claimData: any = {};
          
          switch (key) {
            case 'latest2024':
              claimData = {
                individualReceived: parseInt(record.number_of_claims_received_upto_30_06_2024___individual) || 0,
                individualDistributed: parseInt(record.number_of_titles_distributed_upto_30_06_2024___individual) || 0,
                communityReceived: record.number_of_claims_received_upto_30_06_2024___community === 'NA' ? 0 : 
                                 parseInt(record.number_of_claims_received_upto_30_06_2024___community) || 0,
                communityDistributed: record.number_of_titles_distributed_upto_30_06_2024___community === 'NA' ? 0 :
                                    parseInt(record.number_of_titles_distributed_upto_30_06_2024___community) || 0,
                year: '2024'
              };
              break;
            case 'claims2023':
              claimData = {
                individualReceived: parseInt(record.number_of_claims_received_upto_31_10_2023___individual) || 0,
                individualDistributed: parseInt(record.number_of_titles_distributed_upto_31_10_2023___individual) || 0,
                communityReceived: record.number_of_claims_received_upto_31_10_2023___community === 'NA' ? 0 : 
                                 parseInt(record.number_of_claims_received_upto_31_10_2023___community) || 0,
                communityDistributed: record.number_of_titles_distributed_upto_31_10_2023___community === 'NA' ? 0 :
                                    parseInt(record.number_of_titles_distributed_upto_31_10_2023___community) || 0,
                year: '2023'
              };
              break;
            case 'progress2022':
              claimData = {
                individualReceived: parseInt(record.no__of_claims_received_upto_31_03_2022___individual) || 0,
                individualDistributed: parseInt(record.no__of_titles_distributed_upto_31_03_2022___individual) || 0,
                communityReceived: parseInt(record.no__of_claims_received_upto_31_03_2022___community) || 0,
                communityDistributed: parseInt(record.no__of_titles_distributed_upto_31_03_2022___community) || 0,
                year: '2022'
              };
              break;
            case 'claims2017':
              claimData = {
                individualReceived: parseInt(record.no__of_claims_received_upto_30_11_2017___individual) || 0,
                individualDistributed: parseInt(record.claims_recognized_upto_30_11_2017___individual) || 0,
                communityReceived: parseInt(record.no__of_claims_received_upto_30_11_2017___community) || 0,
                communityDistributed: parseInt(record.claims_recognized_upto_30_11_2017___community) || 0,
                year: '2017'
              };
              break;
            case 'approvalRates2018':
              claimData = {
                approvalRate: parseFloat(record.percentage_of_claims_approved_over_number_of_claims_received__as_on_31_10_2018_) || 0,
                year: '2018'
              };
              break;
            case 'forestFireAlerts':
              claimData = {
                fireAlerts2017: parseInt(record.jan_2017_to_june_2017) || 0,
                fireAlerts2018: parseInt(record.jan_2018_to_june_2018) || 0,
                fireAlerts2019: parseInt(record.nov_2018_to_june_2019) || 0,
                fireAlerts2020: parseInt(record.nov_2019_to_june_2020) || 0,
                fireAlerts2021: parseInt(record.nov_2020_to_june_2021) || 0,
                year: 'Fire Data'
              };
              break;
            case 'rejectedClaims2014_2018':
              claimData = {
                rejected2014: parseInt(record.__2014) || 0,
                rejected2015: parseInt(record._2015) || 0,
                rejected2016: parseInt(record._2016) || 0,
                rejected2017: parseInt(record._2017) || 0,
                rejected2018: parseInt(record._2018__upto_31_10_2018_) || 0,
                year: 'Rejected Claims'
              };
              break;
            default:
              claimData = {
                year: key,
                generalData: true
              };
          }

          const totalReceived = claimData.individualReceived + claimData.communityReceived || 0;
          const totalDistributed = claimData.individualDistributed + claimData.communityDistributed || 0;
          const approvalRate = claimData.approvalRate || (totalReceived > 0 ? ((totalDistributed / totalReceived) * 100).toFixed(1) : '0');
          
          // Determine status based on various factors
          let status: 'Approved' | 'Pending' | 'Under Review' | 'Rejected';
          const rate = parseFloat(approvalRate.toString());
          if (key === 'rejectedClaims2014_2018') status = 'Rejected';
          else if (rate >= 70) status = 'Approved';
          else if (rate >= 40) status = 'Under Review';
          else if (rate >= 10) status = 'Pending';
          else status = 'Rejected';

          const transformedClaim: FRAClaimData = {
            id: `${key}_${record.sl__no_ || record._s_no_ || record.s__no_ || dataCounter}_${Date.now()}_${Math.random()}`,
            title: `FRA ${claimData.year} - ${state}`,
            state: state,
            district: record.district || 'Multiple Districts',
            village: record.village || undefined,
            claimType: totalReceived > 0 ? (claimData.individualReceived > claimData.communityReceived ? 'Individual' : 'Community') : 'Individual',
            status: status,
            coordinates: [lat, lng],
            lastUpdated: claimData.year === '2024' ? '2024-06-30' : 
                        claimData.year === '2023' ? '2023-10-31' :
                        claimData.year === '2022' ? '2022-03-31' :
                        claimData.year === '2017' ? '2017-11-30' :
                        claimData.year === '2018' ? '2018-10-31' : '2019-01-01',
            source: `Ministry of Tribal Affairs - ${claimData.year} Dataset`,
            individualClaims: {
              received: claimData.individualReceived || 0,
              distributed: claimData.individualDistributed || 0
            },
            communityClaims: {
              received: claimData.communityReceived || 0,
              distributed: claimData.communityDistributed || 0
            },
            totalClaims: {
              received: totalReceived,
              distributed: totalDistributed
            },
            approvalRate: approvalRate.toString(),
            area: totalDistributed * 2.5,
            // Add special data for different datasets
            ...claimData
          };

          combinedData.push(transformedClaim);
          dataCounter++;
        });
      });

      console.log(`✅ Combined ${combinedData.length} total FRA data points from ${allResults.length} government APIs`);
      return combinedData;

    } catch (error) {
      console.error('Error fetching all government FRA data:', error);
      return [];
    }
  };

  // Button functionality handlers
  const handleFocusOnArea = (claim: FRAClaimData) => {
    console.log('🎯 Focusing on area:', claim.state, claim.district);
    setFocusedArea(claim);
    setMapCenter(claim.coordinates);
    setMapZoom(10);
    
    // Highlight the focused area
    if (mapRef.current) {
      mapRef.current.setView(claim.coordinates, 10, {
        animate: true,
        duration: 1.5
      });
    }
    
    // Show success message
    alert(`🎯 Focused on ${claim.state} - ${claim.district}!\n\nShowing FRA data for ${claim.title}\nTotal Claims: ${claim.totalClaims.received}\nApproval Rate: ${claim.approvalRate}%`);
  };

  const handleViewDetails = (claim: FRAClaimData) => {
    console.log('📊 Viewing details for:', claim.title);
    setSelectedClaim(claim);
    setShowDetails(true);
    
    // Create detailed popup with all claim information
    const detailsContent = `
      📊 DETAILED FRA INFORMATION 📊
      
      🏛️ ${claim.title}
      📍 Location: ${claim.state}, ${claim.district}
      ${claim.village ? `🏘️ Village: ${claim.village}` : ''}
      
      📊 CLAIMS DATA:
      👤 Individual Claims: ${claim.individualClaims.received} received, ${claim.individualClaims.distributed} distributed
      👥 Community Claims: ${claim.communityClaims.received} received, ${claim.communityClaims.distributed} distributed
      📈 Total Claims: ${claim.totalClaims.received} received, ${claim.totalClaims.distributed} distributed
      ✅ Approval Rate: ${claim.approvalRate}%
      
      📅 Last Updated: ${claim.lastUpdated}
      🔗 Source: ${claim.source}
      📋 Status: ${claim.status}
      🌲 Estimated Area: ${claim.area?.toFixed(2)} hectares
      
      ${claim.fireAlerts2017 ? `🔥 Fire Alerts Data Available` : ''}
      ${claim.rejected2014 ? `❌ Rejection Data Available` : ''}
      ${claim.approvalRate ? `📊 Historical Trends Available` : ''}
    `;
    
    alert(detailsContent);
  };

  const applyFilters = (data: FRAClaimData[]) => {
    let filtered = [...data];
    
    if (yearFilter !== 'all') {
      filtered = filtered.filter(claim => 
        claim.lastUpdated?.includes(yearFilter) || 
        claim.source?.includes(yearFilter) ||
        (claim as any).year === yearFilter
      );
    }
    
    if (stateFilter !== 'all') {
      filtered = filtered.filter(claim => claim.state === stateFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }
    
    return filtered;
  };

  // Update filtered data when filters change
  useEffect(() => {
    const filtered = applyFilters(realFRAData);
    setFilteredData(filtered);
  }, [realFRAData, yearFilter, stateFilter, statusFilter]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load real government FRA data from ALL endpoints
        const governmentData = await fetchAllGovernmentFRAData();
        setRealFRAData(governmentData);
        
        console.log(`Loaded ${governmentData.length} real FRA records from Government APIs`);
        
        // Load boundary data
        try {
          const statesResponse = await fetch('/geojson/states.geojson');
          if (statesResponse.ok) {
            const statesData = await statesResponse.json();
            setStatesBoundaries(statesData);
          }
        } catch (error) {
          console.log('States boundaries not available:', error);
        }

        try {
          const districtsResponse = await fetch('/geojson/districts.geojson');
          if (districtsResponse.ok) {
            const districtsData = await districtsResponse.json();
            setDistrictsBoundaries(districtsData);
          }
        } catch (error) {
          console.log('Districts boundaries not available:', error);
        }
        
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Focus map on selected state/district with proper functionality
  useEffect(() => {
    if (selectedState && statesBoundaries && mapRef.current) {
      const stateFeature = statesBoundaries.features.find(
        feature => feature.properties.ST_NM && 
                  feature.properties.ST_NM.toLowerCase() === selectedState.toLowerCase()
      );
      
      if (stateFeature && stateFeature.geometry) {
        try {
          const bounds = L.geoJSON(stateFeature).getBounds();
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
          setMapZoom(7);
        } catch (error) {
          console.error('Error focusing on state:', error);
        }
      }
    }
  }, [selectedState, statesBoundaries]);

  // Handle location selection with proper callback
  const handleLocationSelect = useCallback((location: { state?: string; district?: string }) => {
    console.log('Location selected:', location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    // Also focus map on the selected location
    if (location.state && statesBoundaries) {
      const stateFeature = statesBoundaries.features.find(
        feature => feature.properties.ST_NM && 
                  feature.properties.ST_NM.toLowerCase() === location.state!.toLowerCase()
      );
      
      if (stateFeature && mapRef.current) {
        try {
          const bounds = L.geoJSON(stateFeature).getBounds();
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        } catch (error) {
          console.error('Error focusing on selected location:', error);
        }
      }
    }
  }, [onLocationSelect, statesBoundaries]);

  // Generate FRA claim markers with enhanced visualization using REAL DATA
  const generateFRAMarkers = () => {
    // Use filtered data for display - shows ALL historical data by default
    const dataToUse = filteredData.length > 0 ? filteredData : realFRAData;
    
    console.log(`Generating markers for ${dataToUse.length} FRA claims`);
    
    return dataToUse.map((claim) => {
      if (!claim.coordinates) return null;

      const [lat, lng] = claim.coordinates;
      
      // Create enhanced icons based on claim status and data
      const getMarkerIcon = (claim: FRAClaimData) => {
        let color = '#3b82f6'; // Default blue
        let size = 12;
        
        switch (claim.status) {
          case 'Approved':
            color = '#10b981'; // Green
            size = 16;
            break;
          case 'Pending':
            color = '#f59e0b'; // Orange
            size = 14;
            break;
          case 'Under Review':
            color = '#6366f1'; // Indigo
            size = 14;
            break;
          case 'Rejected':
            color = '#ef4444'; // Red
            size = 12;
            break;
        }

        // Government source gets special styling
        const isGovtSource = claim.source.includes('Government') || claim.source.includes('Ministry');
        if (isGovtSource) {
          size += 4;
        }
        
        return L.divIcon({
          className: 'custom-fra-marker',
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: ${size > 14 ? '10px' : '8px'};
              ${isGovtSource ? 'animation: pulse 2s infinite;' : ''}
            ">
              ${claim.claimType === 'Individual' ? 'I' : 'C'}
            </div>
          `,
          iconSize: [size + 6, size + 6],
          iconAnchor: [(size + 6)/2, (size + 6)/2]
        });
      };

      return (
        <Marker
          key={claim.id}
          position={[lat, lng]}
          icon={getMarkerIcon(claim)}
          eventHandlers={{
            click: () => {
              console.log('Marker clicked:', claim.title);
              handleLocationSelect({ state: claim.state, district: claim.district });
            }
          }}
        >
          <Popup maxWidth={400} className="custom-fra-popup">
            <div className="fra-popup-content">
              <div className="popup-header">
                <h3 className="popup-title">{claim.title}</h3>
                <span className={`status-badge ${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {claim.status}
                </span>
              </div>
              
              <div className="popup-body">
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-icon">📍</span>
                    <div className="info-content">
                      <strong>Location:</strong> {claim.state}
                      {claim.district && claim.district !== 'Multiple Districts' && (
                        <><br /><span className="district-name">District: {claim.district}</span></>
                      )}
                      {claim.village && (
                        <><br /><span className="village-name">Village: {claim.village}</span></>
                      )}
                    </div>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-icon">📋</span>
                    <div className="info-content">
                      <strong>Claim Type:</strong> {claim.claimType}
                      {claim.area && <><br /><strong>Area:</strong> {claim.area.toFixed(1)} hectares</>}
                    </div>
                  </div>

                  {/* Real government data display */}
                  {claim.totalClaims && (
                    <div className="info-row">
                      <span className="info-icon">📊</span>
                      <div className="info-content">
                        <strong>Claims Data:</strong>
                        <br />Total Received: {claim.totalClaims.received.toLocaleString()}
                        <br />Total Distributed: {claim.totalClaims.distributed.toLocaleString()}
                        {claim.approvalRate && (
                          <>
                            <br />Approval Rate: <span className="approval-rate">{claim.approvalRate}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {claim.individualClaims && claim.communityClaims && (
                    <div className="info-row">
                      <span className="info-icon">👥</span>
                      <div className="info-content">
                        <strong>Breakdown:</strong>
                        <br />Individual: {claim.individualClaims.distributed}/{claim.individualClaims.received}
                        <br />Community: {claim.communityClaims.distributed}/{claim.communityClaims.received}
                      </div>
                    </div>
                  )}
                  
                  <div className="info-row">
                    <span className="info-icon">🏛️</span>
                    <div className="info-content">
                      <strong>Data Source:</strong><br />
                      <span className="source-name">{claim.source}</span>
                    </div>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-icon">📅</span>
                    <div className="info-content">
                      <strong>Last Updated:</strong> {new Date(claim.lastUpdated).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="popup-actions">
                <button 
                  className="popup-btn primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFocusOnArea(claim);
                  }}
                >
                  Focus on Area
                </button>
                <button 
                  className="popup-btn secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(claim);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    }).filter(Boolean);
  };

  // Style functions for boundaries
  const getStateStyle = (feature: GeoJSONFeature) => {
    const isSelected = selectedState === feature.properties.ST_NM;
    
    return {
      fillColor: isSelected ? '#3b82f6' : '#e0e7ff',
      weight: isSelected ? 3 : 2,
      opacity: 1,
      color: isSelected ? '#1d4ed8' : '#6366f1',
      dashArray: '',
      fillOpacity: isSelected ? 0.3 : 0.1
    };
  };

  const getDistrictStyle = (feature: GeoJSONFeature) => {
    const isSelected = selectedDistrict === feature.properties.DISTRICT;
    
    return {
      fillColor: isSelected ? '#10b981' : '#ecfdf5',
      weight: isSelected ? 2 : 1,
      opacity: 1,
      color: isSelected ? '#059669' : '#10b981',
      dashArray: '',
      fillOpacity: isSelected ? 0.4 : 0.1
    };
  };

  // Enhanced event handlers for boundaries with working buttons
  const onStateClick = useCallback((feature: GeoJSONFeature, layer: L.Layer) => {
    const stateName = feature.properties.ST_NM;
    console.log('State clicked:', stateName);
    if (stateName) {
      handleLocationSelect({ state: stateName });
      
      // Focus map on clicked state
      if (mapRef.current) {
        try {
          const bounds = L.geoJSON(feature).getBounds();
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        } catch (error) {
          console.error('Error focusing on clicked state:', error);
        }
      }
    }
  }, [handleLocationSelect]);

  const onDistrictClick = useCallback((feature: GeoJSONFeature, layer: L.Layer) => {
    const districtName = feature.properties.DISTRICT;
    console.log('District clicked:', districtName);
    if (districtName) {
      handleLocationSelect({ district: districtName });
      
      // Focus map on clicked district
      if (mapRef.current) {
        try {
          const bounds = L.geoJSON(feature).getBounds();
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        } catch (error) {
          console.error('Error focusing on clicked district:', error);
        }
      }
    }
  }, [handleLocationSelect]);

  const onEachStateFeature = useCallback((feature: GeoJSONFeature, layer: L.Layer) => {
    layer.on({
      click: (e) => {
        e.originalEvent.stopPropagation();
        onStateClick(feature, layer);
      },
      mouseover: (e) => {
        const targetLayer = e.target;
        targetLayer.setStyle({
          weight: 3,
          color: '#1d4ed8',
          fillOpacity: 0.3
        });
        targetLayer.bringToFront();
      },
      mouseout: (e) => {
        const targetLayer = e.target;
        targetLayer.setStyle(getStateStyle(feature));
      }
    });

    // Enhanced popup with working buttons
    const stateData = realFRAData.find(claim => claim.state === feature.properties.ST_NM);
    const popupContent = `
      <div class="boundary-popup">
        <h4 style="margin: 0 0 8px 0; color: #1f2937;">${feature.properties.ST_NM}</h4>
        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">State of India</p>
        ${stateData ? `
          <div style="background: #f3f4f6; padding: 8px; border-radius: 4px; margin-bottom: 12px;">
            <div style="font-size: 12px; color: #374151;">
              <strong>FRA Claims:</strong> ${stateData.totalClaims?.received.toLocaleString() || 'N/A'}<br/>
              <strong>Distributed:</strong> ${stateData.totalClaims?.distributed.toLocaleString() || 'N/A'}<br/>
              <strong>Approval Rate:</strong> ${stateData.approvalRate || 'N/A'}%
            </div>
          </div>
        ` : ''}
        <button 
          onclick="window.focusOnState('${feature.properties.ST_NM}')" 
          style="
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 12px;
            margin-right: 8px;
          "
        >
          Focus State
        </button>
        <button 
          onclick="window.filterByState('${feature.properties.ST_NM}')" 
          style="
            background: #10b981; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 12px;
          "
        >
          Filter Claims
        </button>
      </div>
    `;
    
    layer.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'enhanced-boundary-popup'
    });
  }, [onStateClick, realFRAData]);

  const onEachDistrictFeature = useCallback((feature: GeoJSONFeature, layer: L.Layer) => {
    layer.on({
      click: (e) => {
        e.originalEvent.stopPropagation();
        onDistrictClick(feature, layer);
      },
      mouseover: (e) => {
        const targetLayer = e.target;
        targetLayer.setStyle({
          weight: 2,
          color: '#059669',
          fillOpacity: 0.4
        });
        targetLayer.bringToFront();
      },
      mouseout: (e) => {
        const targetLayer = e.target;
        targetLayer.setStyle(getDistrictStyle(feature));
      }
    });

    const popupContent = `
      <div class="boundary-popup">
        <h4 style="margin: 0 0 8px 0; color: #1f2937;">${feature.properties.DISTRICT}</h4>
        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">District</p>
        <button 
          onclick="window.focusOnDistrict('${feature.properties.DISTRICT}')" 
          style="
            background: #059669; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 12px;
          "
        >
          Focus District
        </button>
      </div>
    `;
    
    layer.bindPopup(popupContent, {
      maxWidth: 250,
      className: 'enhanced-boundary-popup'
    });
  }, [onDistrictClick]);

  // Add global functions for popup buttons
  useEffect(() => {
    (window as any).focusOnState = (stateName: string) => {
      console.log('Global focus on state:', stateName);
      handleLocationSelect({ state: stateName });
    };
    
    (window as any).filterByState = (stateName: string) => {
      console.log('Global filter by state:', stateName);
      handleLocationSelect({ state: stateName });
      // You can add filtering logic here
      alert(`Filtering claims for ${stateName}`);
    };
    
    (window as any).focusOnDistrict = (districtName: string) => {
      console.log('Global focus on district:', districtName);
      handleLocationSelect({ district: districtName });
    };

    return () => {
      delete (window as any).focusOnState;
      delete (window as any).filterByState;
      delete (window as any).focusOnDistrict;
    };
  }, [handleLocationSelect]);

  if (isLoading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading FRA Atlas with Real Government Data...</p>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          Fetching data from Ministry of Tribal Affairs APIs...
        </div>
      </div>
    );
  }

  return (
    <div className="fra-map-container">
      {/* Enhanced Map Controls Panel */}
      <div className="map-controls-panel">
        <div className="controls-header">
          <h4>FRA Atlas Controls</h4>
          <div className="data-source-badge">
            <span style={{ 
              backgroundColor: '#dcfce7', 
              color: '#166534', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              LIVE GOVT DATA
            </span>
          </div>
        </div>

        <div className="legend">
          <h5>Claim Status Legend</h5>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color approved"></div>
              <span>Approved (&gt;70%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color review"></div>
              <span>Under Review (40-70%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color pending"></div>
              <span>Pending (10-40%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color rejected"></div>
              <span>Needs Attention (&lt;10%)</span>
            </div>
          </div>
        </div>

        {/* Data Filtering Controls */}
        <div className="filter-controls">
          <h5>Data Filters</h5>
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? '#059669' : '#374151',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            {showFilters ? '🔍 Hide Filters' : '🔍 Show Filters'}
          </button>
          
          {showFilters && (
            <div className="filter-options" style={{ marginTop: '8px' }}>
              <div className="filter-group">
                <label>Year:</label>
                <select 
                  value={yearFilter} 
                  onChange={(e) => setYearFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '11px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                >
                  <option value="all">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2018">2018</option>
                  <option value="2017">2017</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '11px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="filter-group">
                <label>State:</label>
                <select 
                  value={stateFilter} 
                  onChange={(e) => setStateFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '11px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="all">All States</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Assam">Assam</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Data Summary */}
        <div className="data-summary" style={{
          backgroundColor: '#f3f4f6',
          padding: '8px',
          borderRadius: '4px',
          margin: '8px 0',
          fontSize: '11px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📊 Data Summary</div>
          <div>Total Available: {realFRAData.length} records</div>
          <div>Currently Showing: {filteredData.length} records</div>
          <div style={{ color: '#059669', fontWeight: 'bold' }}>
            From {Object.keys(API_ENDPOINTS).length} Government APIs
          </div>
        </div>

        <div className="map-controls-buttons">
          <button 
            className={`control-btn ${showClusters ? 'active' : ''}`}
            onClick={() => {
              setShowClusters(!showClusters);
              console.log('Toggle clusters:', !showClusters);
            }}
          >
            📍 {showClusters ? 'Hide' : 'Show'} Clusters
          </button>
          
          <button 
            className="control-btn"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([23.5, 78.0], 5);
                console.log('Reset to India view');
              }
            }}
          >
            🏠 Reset View
          </button>
          
          <button 
            className="control-btn"
            onClick={() => {
              const nextLayer = selectedBaseLayer === 'osm' ? 'satellite' : 'osm';
              setSelectedBaseLayer(nextLayer);
              console.log('Switch to:', nextLayer);
            }}
          >
            🛰️ Switch Layer
          </button>
        </div>

        <div className="data-summary">
          <h5>Data Summary</h5>
          <div className="summary-stats">
            <div className="stat-item">
              <strong>{realFRAData.length}</strong>
              <span>States/Regions</span>
            </div>
            <div className="stat-item">
              <strong>
                {realFRAData.reduce((sum, item) => sum + (item.totalClaims?.received || 0), 0).toLocaleString()}
              </strong>
              <span>Total Claims</span>
            </div>
            <div className="stat-item">
              <strong>
                {realFRAData.reduce((sum, item) => sum + (item.totalClaims?.distributed || 0), 0).toLocaleString()}
              </strong>
              <span>Distributed</span>
            </div>
          </div>
          <div className="data-source-info">
            <small>Source: Ministry of Tribal Affairs</small>
            <br />
            <small>Last Updated: June 30, 2024</small>
          </div>
        </div>
      </div>

      {/* Main Map with Enhanced Features */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
        whenReady={() => {
          console.log('Map initialized with real FRA data');
        }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked={selectedBaseLayer === 'osm'} name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer checked={selectedBaseLayer === 'satellite'} name="Satellite View">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          
          {statesBoundaries && (
            <LayersControl.Overlay checked name="State Boundaries">
              <GeoJSON
                data={statesBoundaries}
                style={getStateStyle}
                onEachFeature={onEachStateFeature}
              />
            </LayersControl.Overlay>
          )}
          
          {districtsBoundaries && (
            <LayersControl.Overlay name="District Boundaries">
              <GeoJSON
                data={districtsBoundaries}
                style={getDistrictStyle}
                onEachFeature={onEachDistrictFeature}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>

        {/* Real FRA Claim Markers */}
        {generateFRAMarkers()}
      </MapContainer>
    </div>
  );
};

export default Map;
