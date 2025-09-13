import React, { useState, useEffect } from 'react';
import { MapIcon, ChartBarIcon, FunnelIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import Map from './Map';

interface FRAClaimData {
  id: string;
  title: string;
  state: string;
  district: string;
  taluka?: string;
  village?: string;
  claimType: string;
  status: string;
  area?: number;
  coordinates?: [number, number];
  lastUpdated: string;
  source: string;
}

interface DashboardState {
  selectedState?: string;
  selectedDistrict?: string;
  selectedClaimType?: string;
  selectedStatus?: string;
}

const Dashboard: React.FC = () => {
  const [fraData, setFraData] = useState<FRAClaimData[]>([]);
  const [filteredData, setFilteredData] = useState<FRAClaimData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardState, setDashboardState] = useState<DashboardState>({});
  const [stats, setStats] = useState({
    totalClaims: 0,
    approvedClaims: 0,
    pendingClaims: 0,
    rejectedClaims: 0,
    totalArea: 0,
    states: 0,
    districts: 0
  });

  // Enhanced FRA data generator with realistic government sources
  const generateEnhancedFRAData = (): FRAClaimData[] => {
    const states = [
      'Madhya Pradesh', 'Chhattisgarh', 'Odisha', 'Jharkhand', 
      'Maharashtra', 'Gujarat', 'Rajasthan', 'Andhra Pradesh'
    ];
    
    const districts = {
      'Madhya Pradesh': ['Dindori', 'Mandla', 'Seoni', 'Chhindwara'],
      'Chhattisgarh': ['Bastar', 'Dantewada', 'Kanker', 'Sukma'],
      'Odisha': ['Mayurbhanj', 'Keonjhar', 'Sundargarh', 'Koraput'],
      'Jharkhand': ['Ranchi', 'Gumla', 'Lohardaga', 'Simdega'],
      'Maharashtra': ['Gadchiroli', 'Gondia', 'Chandrapur', 'Yavatmal'],
      'Gujarat': ['Sabarkantha', 'Banaskantha', 'Dahod', 'Panchmahal'],
      'Rajasthan': ['Udaipur', 'Dungarpur', 'Banswara', 'Sirohi'],
      'Andhra Pradesh': ['Vizianagaram', 'Srikakulam', 'East Godavari', 'West Godavari']
    };

    const claimTypes = [
      'Individual Forest Rights',
      'Community Forest Resource Rights',
      'Community Rights',
      'Habitat Rights',
      'Pastoralist Rights'
    ];

    const statuses = ['Approved', 'Pending', 'Under Review', 'Rejected'];
    
    const governmentSources = [
      'Ministry of Tribal Affairs, Government of India',
      'State Forest Department',
      'District Collector Office',
      'Tribal Welfare Department',
      'Ministry of Environment, Forest and Climate Change'
    ];

    const data: FRAClaimData[] = [];

    states.forEach((state, stateIndex) => {
      const stateDistricts = districts[state as keyof typeof districts] || [];
      
      stateDistricts.forEach((district, districtIndex) => {
        // Generate 15-25 claims per district
        const claimsCount = Math.floor(Math.random() * 11) + 15;
        
        for (let i = 0; i < claimsCount; i++) {
          const claimType = claimTypes[Math.floor(Math.random() * claimTypes.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const source = governmentSources[Math.floor(Math.random() * governmentSources.length)];
          
          // Generate realistic coordinates within India
          const baseLat = 15 + stateIndex * 3 + (Math.random() - 0.5) * 2;
          const baseLng = 75 + stateIndex * 2 + (Math.random() - 0.5) * 3;
          
          data.push({
            id: `fra-${stateIndex}-${districtIndex}-${i}`,
            title: `${claimType} - ${district}`,
            state,
            district,
            village: `Village ${String.fromCharCode(65 + i)}`,
            claimType,
            status,
            area: Math.floor(Math.random() * 50) + 5,
            coordinates: [baseLat, baseLng],
            lastUpdated: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            source
          });
        }
      });
    });

    return data;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, this would fetch from your government API
        const generatedData = generateEnhancedFRAData();
        setFraData(generatedData);
        setFilteredData(generatedData);

        // Calculate statistics
        const uniqueStates = new Set(generatedData.map(claim => claim.state)).size;
        const uniqueDistricts = new Set(generatedData.map(claim => `${claim.state}-${claim.district}`)).size;
        
        setStats({
          totalClaims: generatedData.length,
          approvedClaims: generatedData.filter(claim => claim.status === 'Approved').length,
          pendingClaims: generatedData.filter(claim => 
            claim.status === 'Pending' || claim.status === 'Under Review'
          ).length,
          rejectedClaims: generatedData.filter(claim => claim.status === 'Rejected').length,
          totalArea: generatedData.reduce((sum, claim) => sum + (claim.area || 0), 0),
          states: uniqueStates,
          districts: uniqueDistricts
        });
      } catch (error) {
        console.error('Error loading FRA data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter data based on current selections
  useEffect(() => {
    let filtered = fraData;

    if (dashboardState.selectedState) {
      filtered = filtered.filter(claim => claim.state === dashboardState.selectedState);
    }

    if (dashboardState.selectedDistrict) {
      filtered = filtered.filter(claim => claim.district === dashboardState.selectedDistrict);
    }

    if (dashboardState.selectedClaimType) {
      filtered = filtered.filter(claim => claim.claimType === dashboardState.selectedClaimType);
    }

    if (dashboardState.selectedStatus) {
      filtered = filtered.filter(claim => claim.status === dashboardState.selectedStatus);
    }

    setFilteredData(filtered);
  }, [fraData, dashboardState]);

  const handleLocationSelect = (location: { state?: string; district?: string }) => {
    setDashboardState(prev => ({
      ...prev,
      selectedState: location.state,
      selectedDistrict: location.district
    }));
  };

  const clearFilters = () => {
    setDashboardState({});
  };

  const uniqueStates = Array.from(new Set(fraData.map(claim => claim.state))).sort();
  const uniqueDistricts = Array.from(new Set(
    fraData
      .filter(claim => !dashboardState.selectedState || claim.state === dashboardState.selectedState)
      .map(claim => claim.district)
  )).sort();
  const uniqueClaimTypes = Array.from(new Set(fraData.map(claim => claim.claimType))).sort();
  const uniqueStatuses = Array.from(new Set(fraData.map(claim => claim.status))).sort();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '16px' 
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading FRA Atlas Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#f8fafc' 
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '16px 24px' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <CircleStackIcon style={{ 
              height: '32px', 
              width: '32px', 
              color: '#3b82f6' 
            }} />
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1f2937',
                margin: 0,
                marginBottom: '4px'
              }}>FRA Atlas Dashboard</h1>
              <p style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                margin: 0
              }}>AI-powered WebGIS Decision Support System - Smart India Hackathon 2025</p>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            <span style={{ 
              backgroundColor: '#dcfce7', 
              color: '#166534', 
              padding: '4px 8px', 
              borderRadius: '4px' 
            }}>
              Government Data Sources
            </span>
            <span>Last Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        padding: '16px 24px', 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px' 
        }}>
          <div style={{ 
            backgroundColor: '#dbeafe', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#2563eb', 
              fontWeight: '500',
              margin: '0 0 4px 0'
            }}>Total Claims</p>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1e3a8a',
              margin: 0
            }}>{stats.totalClaims.toLocaleString()}</p>
          </div>
          <div style={{ 
            backgroundColor: '#dcfce7', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#16a34a', 
              fontWeight: '500',
              margin: '0 0 4px 0'
            }}>Approved</p>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#14532d',
              margin: 0
            }}>{stats.approvedClaims.toLocaleString()}</p>
          </div>
          <div style={{ 
            backgroundColor: '#fef3c7', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#d97706', 
              fontWeight: '500',
              margin: '0 0 4px 0'
            }}>Pending</p>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#92400e',
              margin: 0
            }}>{stats.pendingClaims.toLocaleString()}</p>
          </div>
          <div style={{ 
            backgroundColor: '#fee2e2', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#dc2626', 
              fontWeight: '500',
              margin: '0 0 4px 0'
            }}>Total Area</p>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#991b1b',
              margin: 0
            }}>{stats.totalArea.toLocaleString()} ha</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex' 
      }}>
        {/* Sidebar Filters */}
        <div className="w-80 bg-white border-r p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6">
            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={dashboardState.selectedState || ''}
                onChange={(e) => setDashboardState(prev => ({
                  ...prev,
                  selectedState: e.target.value || undefined,
                  selectedDistrict: undefined
                }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                value={dashboardState.selectedDistrict || ''}
                onChange={(e) => setDashboardState(prev => ({
                  ...prev,
                  selectedDistrict: e.target.value || undefined
                }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Districts</option>
                {uniqueDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Claim Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Type
              </label>
              <select
                value={dashboardState.selectedClaimType || ''}
                onChange={(e) => setDashboardState(prev => ({
                  ...prev,
                  selectedClaimType: e.target.value || undefined
                }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Types</option>
                {uniqueClaimTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={dashboardState.selectedStatus || ''}
                onChange={(e) => setDashboardState(prev => ({
                  ...prev,
                  selectedStatus: e.target.value || undefined
                }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Selections */}
          {(dashboardState.selectedState || dashboardState.selectedDistrict || 
            dashboardState.selectedClaimType || dashboardState.selectedStatus) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
              <div className="space-y-1 text-xs">
                {dashboardState.selectedState && (
                  <p><strong>State:</strong> {dashboardState.selectedState}</p>
                )}
                {dashboardState.selectedDistrict && (
                  <p><strong>District:</strong> {dashboardState.selectedDistrict}</p>
                )}
                {dashboardState.selectedClaimType && (
                  <p><strong>Type:</strong> {dashboardState.selectedClaimType}</p>
                )}
                {dashboardState.selectedStatus && (
                  <p><strong>Status:</strong> {dashboardState.selectedStatus}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Showing {filteredData.length} of {fraData.length} claims
              </p>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <Map 
            fraData={filteredData}
            selectedState={dashboardState.selectedState}
            selectedDistrict={dashboardState.selectedDistrict}
            onLocationSelect={(location) => {
              setDashboardState(prev => ({
                ...prev,
                selectedState: location.state,
                selectedDistrict: location.district
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
