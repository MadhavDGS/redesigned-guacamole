import React, { useState, useEffect } from 'react';
import { CircleStackIcon, MapIcon, ChartBarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Map from './Map';
import ClaimsManagement from './ClaimsManagement';
import OcrUploadEnhanced from './OcrUploadEnhanced';
import SatelliteAssetMapping from './SatelliteAssetMapping';
import DecisionSupportSystem from './DecisionSupportSystem';
import './App.css';

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
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const views = [
    { id: 'dashboard', label: 'FRA Atlas Dashboard', icon: '🗺️' },
    { id: 'claims', label: 'Claims Management', icon: '📋' },
    { id: 'ocr', label: 'Document Processing', icon: '📄' },
    { id: 'satellite', label: 'Satellite Mapping', icon: '🛰️' },
    { id: 'dss', label: 'Decision Support', icon: '🧠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📑' }
  ];

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

  const renderFRADashboard = () => {
    if (isLoading) {
      return (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading FRA Atlas Dashboard...</p>
        </div>
      );
    }

    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <h1>FRA Atlas Dashboard</h1>
              <p>AI-powered WebGIS Decision Support System - Smart India Hackathon 2025</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px' }}>
              Government Data Sources
            </span>
            <span>Last Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalClaims}</h3>
              <p>Total Claims</p>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.approvedClaims}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingClaims}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">🏞️</div>
            <div className="stat-content">
              <h3>{stats.totalArea}</h3>
              <p>Total Area (ha)</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div style={{ display: 'flex', height: 'calc(100vh - 280px)', gap: '20px' }}>
          {/* Filters Sidebar */}
          <div style={{ width: '260px', backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FunnelIcon style={{ height: '18px', width: '18px' }} />
                Filters
              </h3>
              <button 
                onClick={clearFilters}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '12px', 
                  backgroundColor: '#f3f4f6', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Clear All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>State</label>
                <select 
                  value={dashboardState.selectedState || ''}
                  onChange={(e) => setDashboardState(prev => ({ ...prev, selectedState: e.target.value || undefined }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>District</label>
                <select 
                  value={dashboardState.selectedDistrict || ''}
                  onChange={(e) => setDashboardState(prev => ({ ...prev, selectedDistrict: e.target.value || undefined }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  disabled={!dashboardState.selectedState}
                >
                  <option value="">All Districts</option>
                  {uniqueDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Claim Type</label>
                <select 
                  value={dashboardState.selectedClaimType || ''}
                  onChange={(e) => setDashboardState(prev => ({ ...prev, selectedClaimType: e.target.value || undefined }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">All Types</option>
                  {uniqueClaimTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Status</label>
                <select 
                  value={dashboardState.selectedStatus || ''}
                  onChange={(e) => setDashboardState(prev => ({ ...prev, selectedStatus: e.target.value || undefined }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Claims List */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Recent Claims ({filteredData.length})
              </h4>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredData.map((claim, index) => (
                  <div key={claim.id} style={{
                    padding: '10px',
                    borderBottom: index < filteredData.length - 1 ? '1px solid #e5e7eb' : 'none',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '13px' }}>{claim.title}</div>
                    <div style={{ color: '#6b7280', marginBottom: '4px' }}>{claim.state}, {claim.district}</div>
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '500',
                      backgroundColor: claim.status === 'Approved' ? '#dcfce7' : 
                                     claim.status === 'Pending' || claim.status === 'Under Review' ? '#fef3c7' : '#fee2e2',
                      color: claim.status === 'Approved' ? '#166534' : 
                             claim.status === 'Pending' || claim.status === 'Under Review' ? '#92400e' : '#991b1b'
                    }}>
                      {claim.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Container - Much Larger */}
          <div className="map-container" style={{ flex: 1, minHeight: '600px' }}>
            <div className="map-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', margin: 0 }}>
                <MapIcon style={{ height: '20px', width: '20px' }} />
                Interactive FRA Atlas Map
              </h2>
              <div className="map-controls">
                <button className="control-btn active">Boundaries</button>
                <button className="control-btn">Claims</button>
                <button className="control-btn">Satellite</button>
              </div>
            </div>
            <div className="map" style={{ height: 'calc(100% - 60px)' }}>
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
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderFRADashboard();
      case 'claims':
        return <ClaimsManagement />;
      case 'ocr':
        return <OcrUploadEnhanced />;
      case 'satellite':
        return <SatelliteAssetMapping />;
      case 'dss':
        return <DecisionSupportSystem />;
      case 'analytics':
        return (
          <div className="analytics-content">
            <div className="content-header">
              <h1>Analytics</h1>
              <p>Advanced analytics and insights for FRA data</p>
            </div>
            <p>Analytics dashboard coming soon...</p>
          </div>
        );
      case 'reports':
        return (
          <div className="reports-content">
            <div className="content-header">
              <h1>Reports</h1>
              <p>Generate comprehensive FRA reports</p>
            </div>
            <p>Report generation interface coming soon...</p>
          </div>
        );
      default:
        return renderFRADashboard();
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </button>
          <div className="logo">
            <span className="logo-icon">🌲</span>
            <span className="logo-text">FRA Atlas</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search claims, villages, documents..." 
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
        
        <div className="header-right">
          <button className="notification-btn">🔔</button>
          <div className="user-profile">
            <span className="user-avatar">👤</span>
            <span className="user-name">Admin User</span>
          </div>
        </div>
      </header>

      <div className="app-body">
        <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            {views.map((view) => (
              <button
                key={view.id}
                className={`sidebar-item ${activeView === view.id ? 'active' : ''}`}
                onClick={() => setActiveView(view.id)}
              >
                <span className="sidebar-icon">{view.icon}</span>
                {!sidebarCollapsed && <span className="sidebar-label">{view.label}</span>}
              </button>
            ))}
          </div>
          
          <div className="sidebar-footer">
            <button className="sidebar-item">
              <span className="sidebar-icon">⚙️</span>
              {!sidebarCollapsed && <span className="sidebar-label">Settings</span>}
            </button>
          </div>
        </nav>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
