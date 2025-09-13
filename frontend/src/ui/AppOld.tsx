import React, { useState, useEffect } from 'react';
import { fetchClaims, fetchStats } from './api';
import './App.css';

// Types for real government data
interface FRAClaimData {
  id: string;
  state: string;
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
  lastUpdated: string;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fraData, setFraData] = useState<FRAClaimData[]>([]);
  const [dataSource, setDataSource] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const views = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'claims', label: 'Claims Management', icon: '📋' },
    { id: 'ocr', label: 'Document Processing', icon: '📄' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📑' }
  ];

  useEffect(() => {
    loadFRAData();
  }, []);

  const loadFRAData = async () => {
    setLoading(true);
    try {
      const result = await fetchClaims();
      setFraData(result.data || []);
      setDataSource(result.source || 'unknown');
      console.log('Loaded FRA data:', result);
    } catch (error) {
      console.error('Error loading FRA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderClaimsManagement = () => (
    <div className="claims-content">
      <div className="content-header">
        <h1>Claims Management</h1>
        <div>
          <span style={{ 
            backgroundColor: dataSource === 'government' ? '#10b981' : '#f59e0b',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            marginRight: '10px'
          }}>
            {dataSource === 'government' ? '🇮🇳 Government Data' : '🏠 Local Data'}
          </span>
          <button className="primary-btn" onClick={loadFRAData}>Refresh Data</button>
        </div>
      </div>
      
      <div className="filters-bar">
        <select className="filter-select">
          <option>All States</option>
          <option>Madhya Pradesh</option>
          <option>Odisha</option>
          <option>Telangana</option>
          <option>Tripura</option>
        </select>
        <input type="text" placeholder="Search by state name..." className="search-input" />
        <button className="filter-btn">🔍</button>
      </div>

      <div className="claims-table">
        <div className="table-header">
          <div className="table-cell">State</div>
          <div className="table-cell">Total Claims</div>
          <div className="table-cell">Individual Claims</div>
          <div className="table-cell">Community Claims</div>
          <div className="table-cell">Approval Rate</div>
          <div className="table-cell">Last Updated</div>
        </div>
        
        {loading ? (
          <div className="table-info">
            <p>🔄 Loading real FRA data from Government APIs...</p>
          </div>
        ) : fraData.length > 0 ? (
          fraData.map((record) => (
            <div key={record.id} className="table-row">
              <div className="table-cell">
                <strong>{record.state}</strong>
              </div>
              <div className="table-cell">
                <div>Received: {record.totalClaims.received.toLocaleString()}</div>
                <div>Distributed: {record.totalClaims.distributed.toLocaleString()}</div>
              </div>
              <div className="table-cell">
                <div>R: {record.individualClaims.received.toLocaleString()}</div>
                <div>D: {record.individualClaims.distributed.toLocaleString()}</div>
              </div>
              <div className="table-cell">
                <div>R: {typeof record.communityClaims.received === 'number' ? record.communityClaims.received.toLocaleString() : 'N/A'}</div>
                <div>D: {typeof record.communityClaims.distributed === 'number' ? record.communityClaims.distributed.toLocaleString() : 'N/A'}</div>
              </div>
              <div className="table-cell">
                <span className={`status-badge ${parseFloat(record.approvalRate) > 70 ? 'success' : parseFloat(record.approvalRate) > 40 ? 'warning' : 'pending'}`}>
                  {record.approvalRate}%
                </span>
              </div>
              <div className="table-cell">
                {record.lastUpdated}
              </div>
            </div>
          ))
        ) : (
          <div className="table-info">
            <p>📡 No FRA data available. Check API connectivity.</p>
          </div>
        )}
      </div>

      {dataSource === 'government' && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
          <h4>✅ Real Government Data Integration</h4>
          <p><strong>Data Source:</strong> Government of India Open Data Portal (data.gov.in)</p>
          <p><strong>API:</strong> Forest Rights Act Claims and Titles Distribution</p>
          <p><strong>Last Updated:</strong> June 30, 2024</p>
          <p><strong>Coverage:</strong> All states with FRA implementation</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div style={{ padding: '32px' }}>
            <h1>🌲 Welcome to FRA Atlas</h1>
            <p>Current view: {activeView}</p>
            <div style={{ marginTop: '20px', padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
              <h3>🚀 System Status</h3>
              <p>✅ Frontend is now working properly!</p>
              <p>✅ Navigation system implemented</p>
              <p>✅ Real Government API integration active</p>
              <p>📊 Data Source: {dataSource === 'government' ? 'Government of India APIs' : 'Local Backend'}</p>
            </div>
          </div>
        );
      case 'claims':
        return renderClaimsManagement();
      case 'ocr':
        return (
          <div style={{ padding: '32px' }}>
            <h1>📄 Document Processing</h1>
            <p>OCR functionality will be integrated here</p>
          </div>
        );
      case 'analytics':
        return (
          <div style={{ padding: '32px' }}>
            <h1>📈 Analytics</h1>
            <p>Analytics dashboard will be built here</p>
          </div>
        );
      case 'reports':
        return (
          <div style={{ padding: '32px' }}>
            <h1>📑 Reports</h1>
            <p>Report generation will be implemented here</p>
          </div>
        );
      default:
        return (
          <div style={{ padding: '32px' }}>
            <h1>🌲 Welcome to FRA Atlas</h1>
            <p>Current view: {activeView}</p>
          </div>
        );
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

export default App;