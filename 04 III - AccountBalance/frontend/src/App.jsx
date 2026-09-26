import React, { useState } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheckBalance = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5001/api/account-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('API Error:', error);
      setResult({
        success: false,
        error: error.message || 'Failed to connect to the Bunaye backend server'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="header-container">
        <div>
          <h1 className="title">
            <span className="coffee-icon">☕</span> Bunaye Coffee Shop
          </h1>
          <p className="subtitle">Merchant Admin Terminal</p>
        </div>
        <div className="env-status">
          <div className="indicator-pulse"></div>
          <span>Secure M-Pesa Ethiopia API Terminal</span>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="glass-card">
          <h2 className="section-title" style={{ marginBottom: '8px' }}>Register Balance Check</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Query the secure M-Pesa Merchant Short Code account balance. All credentials and configurations are managed securely on the backend server.
          </p>

          <button 
            type="button" 
            className="btn" 
            onClick={handleCheckBalance} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(18,11,8,0.3)',
                  borderLeftColor: '#120b08',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.6s linear infinite'
                }}></span>
                <span>Checking...</span>
              </>
            ) : (
              <span>Check Register Balance</span>
            )}
          </button>

          {isLoading && (
            <div className="spinner-container">
              <div className="spinner"></div>
              <div className="loading-text">Requesting Safaricom Token & Querying...</div>
            </div>
          )}

          {!isLoading && result && (
            <div style={{ marginTop: '32px', textAlign: 'left', animation: 'slideIn 0.3s ease' }}>
              {result.success ? (
                <div className="status-banner status-banner-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <div className="status-banner-title">Query Successful</div>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>
                      Safaricom accepted the query (ResponseCode: {result.data?.ResponseCode || '0'}). Verification detail is shown below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="status-banner status-banner-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <div>
                    <div className="status-banner-title">Query Failed</div>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>
                      {typeof result.error === 'string' ? result.error : result.error?.errorMessage || result.error?.message || 'Verification rejected by API'}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--coffee-gold)' }}>API Response Payload</span>
                  <span className={`badge ${result.success ? 'badge-green' : 'badge-gold'}`}>
                    {result.success ? 'SUCCESS' : 'ERROR'}
                  </span>
                </div>

                <div className="json-viewer-container">
                  <div className="json-viewer-header">
                    <span>JSON Result</span>
                    <span>application/json</span>
                  </div>
                  <pre className="json-viewer-body">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default App;
