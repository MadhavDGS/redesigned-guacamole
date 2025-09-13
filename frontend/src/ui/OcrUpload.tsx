import React, { useState } from 'react';

const OcrUpload: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    const form = new FormData();
    form.append('file', file);
    
    try {
      const res = await fetch('http://localhost:8000/api/ocr/upload', { 
        method: 'POST', 
        body: form 
      });
      
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, color: '#2563eb' }}>📄 OCR Upload</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
        Upload FRA documents (JPG, PNG, PDF) for automatic data extraction
      </p>
      
      <input 
        type="file" 
        accept="image/*,.pdf" 
        onChange={onChange}
        style={{
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
          marginBottom: '10px'
        }}
      />
      
      {loading && (
        <div style={{ color: '#2563eb', fontWeight: 'bold' }}>
          🔄 Processing document...
        </div>
      )}
      
      {error && (
        <div style={{ 
          color: '#dc2626', 
          background: '#fef2f2', 
          padding: '8px', 
          borderRadius: '4px',
          marginTop: '10px' 
        }}>
          ❌ {error}
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ color: '#059669' }}>✅ Extraction Results:</h4>
          <div style={{ 
            background: '#f0fdf4', 
            padding: '12px', 
            borderRadius: '6px',
            fontSize: '13px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <strong>📁 File:</strong> {result.filename}<br/>
            <strong>🆔 File ID:</strong> {result.file_id}<br/>
            
            {result.extracted && (
              <div style={{ marginTop: '10px' }}>
                <strong>📊 Extracted Data:</strong>
                <ul style={{ marginTop: '5px', paddingLeft: '15px' }}>
                  <li><strong>Village:</strong> {result.extracted.village}</li>
                  <li><strong>State:</strong> {result.extracted.state}</li>
                  <li><strong>Claim Type:</strong> {result.extracted.claim_type}</li>
                  <li><strong>Holder:</strong> {result.extracted.holder}</li>
                </ul>
              </div>
            )}
            
            {result.ocr && (
              <div style={{ marginTop: '10px' }}>
                <strong>📝 OCR Result:</strong>
                <div style={{ 
                  background: '#fff', 
                  padding: '8px', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  marginTop: '5px',
                  fontSize: '12px'
                }}>
                  <strong>Text:</strong> {result.ocr.text}<br/>
                  <strong>Confidence:</strong> {(result.ocr.confidence * 100).toFixed(1)}%<br/>
                  <strong>Engine:</strong> {result.ocr.engine}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OcrUpload;