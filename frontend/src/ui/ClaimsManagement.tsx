import React from 'react';

interface SimpleClaim {
  id: string;
  title: string;
  state: string;
  status: string;
  dateSubmitted: string;
}

const ClaimsManagement: React.FC = () => {
  // Simple mock data for demonstration
  const simpleClaims: SimpleClaim[] = [
    {
      id: "FRA-001",
      title: "Individual Forest Rights - Village A",
      state: "Madhya Pradesh",
      status: "Approved",
      dateSubmitted: "2024-02-15"
    },
    {
      id: "FRA-002",
      title: "Community Forest Rights - Village B",
      state: "Chhattisgarh",
      status: "Pending",
      dateSubmitted: "2024-01-10"
    },
    {
      id: "FRA-003",
      title: "Individual Rights - Village C",
      state: "Maharashtra",
      status: "Under Review",
      dateSubmitted: "2024-03-05"
    },
    {
      id: "FRA-004",
      title: "Community Rights - Village D",
      state: "Odisha",
      status: "Rejected",
      dateSubmitted: "2024-01-20"
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Simple Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          Claims Management
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Simple view of FRA claims
        </p>
      </div>

      {/* Simple Claims List */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Claim ID
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Title
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                State
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Status
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Date Submitted
              </th>
            </tr>
          </thead>
          <tbody>
            {simpleClaims.map((claim) => (
              <tr key={claim.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', color: '#1f2937' }}>
                  {claim.id}
                </td>
                <td style={{ padding: '12px', color: '#1f2937' }}>
                  {claim.title}
                </td>
                <td style={{ padding: '12px', color: '#1f2937' }}>
                  {claim.state}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: 
                      claim.status === 'Approved' ? '#dcfce7' :
                      claim.status === 'Pending' ? '#fef3c7' :
                      claim.status === 'Under Review' ? '#dbeafe' : '#fee2e2',
                    color:
                      claim.status === 'Approved' ? '#166534' :
                      claim.status === 'Pending' ? '#92400e' :
                      claim.status === 'Under Review' ? '#1e40af' : '#dc2626'
                  }}>
                    {claim.status}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#1f2937' }}>
                  {new Date(claim.dateSubmitted).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simple Summary */}
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280' }}>
        <p>Showing {simpleClaims.length} claims</p>
      </div>
    </div>
  );
};

export default ClaimsManagement;
