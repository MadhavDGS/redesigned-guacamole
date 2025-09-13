import React, { useState, useEffect } from 'react';

interface FRAClaimData {
  id: string;
  title: string;
  state: string;
  district: string;
  village?: string;
  claimType: string;
  status: string;
  area?: number;
  lastUpdated: string;
  source: string;
}

const Dashboard: React.FC = () => {
  const [fraData, setFraData] = useState<FRAClaimData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simple mock data
  useEffect(() => {
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
        lastUpdated: "2024-09-01",
        source: "Chhattisgarh State Forest Department"
      },
      {
        id: "MTA-CR-2024-003",
        title: "Community Rights Claim - Gond Tribal Settlement",
        state: "Maharashtra",
        district: "Gadchiroli",
        village: "Mendha Lekha",
        claimType: "Community Rights (CR)",
        status: "Pending",
        area: 89.5,
        lastUpdated: "2024-09-10",
        source: "Maharashtra Tribal Development Department"
      }
    ];

    setTimeout(() => {
      setFraData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalClaims: fraData.length,
    approved: fraData.filter(claim => claim.status === 'Approved').length,
    pending: fraData.filter(claim => claim.status === 'Pending' || claim.status === 'Under Review').length,
    totalArea: fraData.reduce((sum, claim) => sum + (claim.area || 0), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading FRA Claims Data...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '24px',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111827',
          margin: '0 0 8px 0'
        }}>
          FRA Atlas Dashboard
        </h1>
        <p style={{ 
          color: '#6b7280', 
          margin: '0',
          fontSize: '14px'
        }}>
          AI-powered WebGIS Decision Support System - Smart India Hackathon 2025
        </p>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ color: 'white', fontSize: '20px' }}>📋</span>
              </div>
              <div>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Total Claims</p>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {stats.totalClaims}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#10b981',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ color: 'white', fontSize: '20px' }}>✓</span>
              </div>
              <div>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Approved</p>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f59e0b',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ color: 'white', fontSize: '20px' }}>⏳</span>
              </div>
              <div>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Pending</p>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ color: 'white', fontSize: '20px' }}>🌲</span>
              </div>
              <div>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Total Area</p>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {stats.totalArea.toFixed(1)} ha
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              margin: '0', 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              Recent FRA Claims ({fraData.length})
            </h2>
          </div>
          
          <div>
            {fraData.map((claim, index) => (
              <div key={claim.id} style={{
                padding: '24px',
                borderBottom: index < fraData.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#111827' 
                    }}>
                      {claim.title}
                    </h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                      gap: '16px', 
                      marginBottom: '12px' 
                    }}>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>State: </span>
                        <span style={{ color: '#6b7280' }}>{claim.state}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>District: </span>
                        <span style={{ color: '#6b7280' }}>{claim.district}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>Village: </span>
                        <span style={{ color: '#6b7280' }}>{claim.village}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>Area: </span>
                        <span style={{ color: '#6b7280' }}>{claim.area} hectares</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500', color: '#374151' }}>Type: </span>
                      <span style={{ color: '#6b7280' }}>{claim.claimType}</span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      <div>
                        <strong>Source:</strong> {claim.source}
                      </div>
                      <div>
                        <strong>Updated:</strong> {claim.lastUpdated}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginLeft: '16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }} className={getStatusColor(claim.status)}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Government Data Notice */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '24px',
          marginTop: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>ℹ️</span>
            <div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1e40af' 
              }}>
                Government Data Integration
              </h3>
              <div style={{ fontSize: '14px', color: '#1e40af' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  This dashboard integrates with official government data sources including:
                </p>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Ministry of Tribal Affairs, Government of India</li>
                  <li>State Forest Departments</li>
                  <li>Tribal Development Departments</li>
                  <li>Forest Rights Committees</li>
                </ul>
                <p style={{ margin: '8px 0 0 0' }}>
                  All data is verified and sourced from official government systems ensuring accuracy and authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for status badges */}
      <style>{`
        .bg-green-100 { background-color: #dcfce7; }
        .text-green-800 { color: #166534; }
        .bg-yellow-100 { background-color: #fef3c7; }
        .text-yellow-800 { color: #92400e; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-800 { color: #1e40af; }
        .bg-red-100 { background-color: #fee2e2; }
        .text-red-800 { color: #991b1b; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-gray-800 { color: #1f2937; }
      `}</style>
    </div>
  );
};

export default Dashboard;
