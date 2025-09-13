import React, { useState, useEffect } from 'react';
import { CircleStackIcon } from '@heroicons/react/24/outline';
import Map from './Map';

interface FRAClaimData {
  id: string;
  title: string;
  state: string;
  district: string;
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
    const mockData: FRAClaimData[] = [
      {
        id: "MTA-FR-2024-001",
        title: "Individual Forest Rights Claim - Khairwani Village",
        state: "Madhya Pradesh",
        district: "Dindori",
        village: "Khairwani",
        claimType: "Individual Forest Rights (IFR)",
        status: "Approved",
        area: 2.5,
        coordinates: [22.7179, 81.0739],
        lastUpdated: "2024-08-20",
        source: "Ministry of Tribal Affairs, Government of India"
      },
      {
        id: "MTA-CFR-2024-002",
        title: "Community Forest Resource Rights - Baiga Community",
        state: "Chhattisgarh",
        district: "Kawardha",
        village: "Lalbarra",
        claimType: "Community Forest Resource Rights (CFR)",
        status: "Under Review",
        area: 150.0,
        coordinates: [22.6093, 81.2615],
        lastUpdated: "2024-09-01",
        source: "Chhattisgarh State Forest Department"
      },
      {
        id: "MTA-CR-2024-003",
        title: "Community Rights Claim - Gond Tribal Settlement",
        state: "Maharashtra",
        district: "Gadchiroli",
        village: "Bhamragad",
        claimType: "Community Rights (CR)",
        status: "Pending",
        area: 85.0,
        coordinates: [20.1809, 80.1636],
        lastUpdated: "2024-08-15",
        source: "Maharashtra Tribal Development Department"
      }
    ];
    return mockData;
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateEnhancedFRAData();
      setFraData(data);
      
      // Calculate statistics
      const newStats = {
        totalClaims: data.length,
        approvedClaims: data.filter(claim => claim.status === 'Approved').length,
        pendingClaims: data.filter(claim => claim.status === 'Pending' || claim.status === 'Under Review').length,
        rejectedClaims: data.filter(claim => claim.status === 'Rejected').length,
        totalArea: data.reduce((sum, claim) => sum + (claim.area || 0), 0),
        states: new Set(data.map(claim => claim.state)).size,
        districts: new Set(data.map(claim => claim.district)).size
      };
      
      setStats(newStats);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Filter data based on dashboard state
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
        {/* Claims List */}
        <div style={{
          width: '400px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>Recent FRA Claims ({filteredData.length})</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredData.map((claim, index) => (
              <div key={claim.id} style={{
                padding: '24px',
                borderBottom: index < filteredData.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>{claim.title}</h4>
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: claim.status === 'Approved' ? '#dcfce7' : 
                                   claim.status === 'Pending' || claim.status === 'Under Review' ? '#fef3c7' : '#fee2e2',
                    color: claim.status === 'Approved' ? '#166534' : 
                           claim.status === 'Pending' || claim.status === 'Under Review' ? '#92400e' : '#991b1b'
                  }}>
                    {claim.status}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px', 
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <div><strong>State:</strong> {claim.state}</div>
                  <div><strong>District:</strong> {claim.district}</div>
                  {claim.village && <div><strong>Village:</strong> {claim.village}</div>}
                  {claim.area && <div><strong>Area:</strong> {claim.area} hectares</div>}
                </div>
                
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: '#6b7280' 
                }}>
                  <div><strong>Type:</strong> {claim.claimType}</div>
                  <div style={{ marginTop: '4px' }}>
                    <strong>Source:</strong> {claim.source}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    Updated: {new Date(claim.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div style={{ flex: 1, position: 'relative' }}>
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
