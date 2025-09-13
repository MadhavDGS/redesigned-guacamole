// Real Government APIs Configuration
const GOVT_API_BASE = 'https://api.data.gov.in';
const GOVT_API_KEY = '579b464db66ec23bdd0000017bc9e4e43c4543227ae43333ed0a32d3';
const API_BASE = 'http://localhost:8000';

// FRA Claims API endpoints
const FRA_ENDPOINTS = {
  latest: '/resource/54940646-f445-461d-b99c-e8e6a2f3a0b4', // As on 30-06-2024
  historical: '/resource/e4e42046-14e1-487d-880e-405d1257f49c', // As on 31-10-2023
  progress: '/resource/72d78b15-5861-41f6-beb1-e6095674898f' // As on 31-03-2022
};

// Fetch real FRA claims data from Government API
export async function fetchGovernmentFRAData(state?: string) {
  const url = new URL(`${GOVT_API_BASE}${FRA_ENDPOINTS.latest}`);
  url.searchParams.append('api-key', GOVT_API_KEY);
  url.searchParams.append('format', 'json');
  url.searchParams.append('limit', '50');
  
  if (state) {
    url.searchParams.append('filters[state]', state);
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Government API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.records || [];
}

// Fetch FRA data for specific target states
export async function fetchTargetStatesFRAData() {
  const targetStates = ['Madhya Pradesh', 'Odisha', 'Telangana', 'Tripura'];
  const promises = targetStates.map(state => fetchGovernmentFRAData(state));
  
  try {
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error('Error fetching target states data:', error);
    return [];
  }
}

// Transform government data to our application format
export function transformFRAData(govtData: any[]) {
  return govtData.map((record, index) => ({
    id: `FRA_${record.sl__no_}_${Date.now()}`,
    state: record.state,
    individualClaims: {
      received: record.number_of_claims_received_upto_30_06_2024___individual || 0,
      distributed: record.number_of_titles_distributed_upto_30_06_2024___individual || 0
    },
    communityClaims: {
      received: record.number_of_claims_received_upto_30_06_2024___community === 'NA' ? 0 : (record.number_of_claims_received_upto_30_06_2024___community || 0),
      distributed: record.number_of_titles_distributed_upto_30_06_2024___community === 'NA' ? 0 : (record.number_of_titles_distributed_upto_30_06_2024___community || 0)
    },
    totalClaims: {
      received: record.number_of_claims_received_upto_30_06_2024___total || 0,
      distributed: record.number_of_titles_distributed_upto_30_06_2024___total || 0
    },
    approvalRate: record.number_of_claims_received_upto_30_06_2024___total > 0 
      ? ((record.number_of_titles_distributed_upto_30_06_2024___total / record.number_of_claims_received_upto_30_06_2024___total) * 100).toFixed(1)
      : '0',
    lastUpdated: '2024-06-30'
  }));
}

// Legacy API functions (keeping for local backend integration)
export async function fetchStats() {
  const res = await fetch(`${API_BASE}/api/dashboard/stats`);
  return res.json();
}

export async function fetchClaims() {
  try {
    // First try to get real government data
    const govtData = await fetchTargetStatesFRAData();
    if (govtData.length > 0) {
      return {
        source: 'government',
        data: transformFRAData(govtData),
        message: 'Real FRA data from Government of India APIs'
      };
    }
  } catch (error) {
    console.warn('Government API unavailable, falling back to local backend:', error);
  }
  
  // Fallback to local backend
  const res = await fetch(`${API_BASE}/api/claims`);
  const localData = await res.json();
  return {
    source: 'local',
    data: localData,
    message: 'Local backend data'
  };
}

export async function evaluateRules(profile: any) {
  const res = await fetch(`${API_BASE}/api/rules/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return res.json();
}