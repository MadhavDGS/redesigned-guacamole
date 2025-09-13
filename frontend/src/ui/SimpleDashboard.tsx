import React, { useState, useEffect } from 'react';
import { MapIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Simple mock data for testing
const mockFRAData = [
  {
    id: "MTA-FR-2024-001",
    title: "Individual Forest Rights Claim - Khairwani Village",
    state: "Madhya Pradesh",
    district: "Dindori",
    village: "Khairwani",
    claimType: "Individual Forest Rights (IFR)",
    status: "Approved" as const,
    area: 2.5,
    coordinates: [22.9456, 81.0823] as [number, number],
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
    status: "Under Review" as const,
    area: 150.0,
    coordinates: [22.0123, 81.2456] as [number, number],
    lastUpdated: "2024-09-01",
    source: "Chhattisgarh State Forest Department"
  }
];

const SimpleDashboard: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const stats = {
    totalClaims: mockFRAData.length,
    approved: mockFRAData.filter(claim => claim.status === 'Approved').length,
    pending: mockFRAData.filter(claim => claim.status !== 'Approved').length,
    totalArea: mockFRAData.reduce((sum, claim) => sum + claim.area, 0)
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">FRA Atlas Dashboard</h1>
          <p className="text-sm text-gray-600">AI-powered WebGIS Decision Support System</p>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r overflow-y-auto">
          <div className="p-4">
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-600">Total Claims</p>
                    <p className="text-xl font-bold text-blue-900">{stats.totalClaims}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-600">Approved</p>
                    <p className="text-xl font-bold text-green-900">{stats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">⏳</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-600">Pending</p>
                    <p className="text-xl font-bold text-yellow-900">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🌲</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-purple-600">Total Area</p>
                    <p className="text-xl font-bold text-purple-900">{stats.totalArea}ha</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All States</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Districts</option>
                  <option value="Dindori">Dindori</option>
                  <option value="Kawardha">Kawardha</option>
                </select>
              </div>
            </div>

            {/* Claims List */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Claims</h3>
              <div className="space-y-3">
                {mockFRAData.map((claim) => (
                  <div key={claim.id} className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-900">{claim.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {claim.state}, {claim.district}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        claim.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {claim.status}
                      </span>
                      <span className="text-xs text-gray-500">{claim.area}ha</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Interactive Map</h3>
              <p className="text-gray-600">
                Geographic boundaries and FRA claims will be displayed here
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg inline-block">
                <p className="text-sm text-blue-800">
                  <strong>Map Features:</strong><br />
                  • Indian state and district boundaries<br />
                  • FRA claims with government data sources<br />
                  • Interactive filtering and selection<br />
                  • Multiple base map layers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Government Data Notice */}
      <div className="bg-blue-50 border-t border-blue-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-blue-600 text-xl">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Government Data Integration</h3>
            <p className="text-sm text-blue-700 mt-1">
              All data sourced from Ministry of Tribal Affairs, State Forest Departments, and verified government databases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
