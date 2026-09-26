import React, { useState } from 'react';

function App() {
  const [transactionId, setTransactionId] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim() || !phone.trim() || !amount.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/reversal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TransactionID: transactionId.trim(), ReceiverParty: phone.trim(), Amount: amount.trim() })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('API Connection Error:', error);
      setResult({
        success: false,
        error: error.message || 'Failed to connect to the backend server'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="header-container">
        <div className="header-brand">
          <span className="coffee-icon">☕</span>
          <div>
            <h1 className="title">Bunaye Coffee Shop</h1>
            <p className="subtitle">Transaction Reversal Terminal</p>
          </div>
        </div>
        <div className="env-status">
          <div className="indicator-pulse"></div>
          <span>Secure M-Pesa API Connection</span>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="glass-card">
          <div className="card-icon-row">
            <div className="icon-bubble">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
            </div>
            <div>
              <h2 className="section-title">Reverse a Payment</h2>
              <p className="section-desc">
                Enter the M-Pesa transaction ID to initiate a reversal for a customer.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: '28px' }}>
            <div className="form-group">
              <label htmlFor="transaction-id" className="form-label">
                M-Pesa Transaction ID
              </label>
              <input
                type="text"
                id="transaction-id"
                className="form-control"
                placeholder="e.g. UD99QSBJTL"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="receiver-phone" className="form-label">
                Receiver Phone Number
              </label>
              <input
                type="tel"
                id="receiver-phone"
                className="form-control"
                placeholder="e.g. 251723747252"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount" className="form-label">
                Amount (ETB)
              </label>
              <input
                type="number"
                id="amount"
                className="form-control"
                placeholder="e.g. 5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                min="1"
                required
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="btn"
              disabled={isLoading || !transactionId.trim() || !phone.trim() || !amount.trim()}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Processing Reversal...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.51"></path>
                  </svg>
                  <span>Reverse Transaction</span>
                </>
              )}
            </button>
          </form>

          {isLoading && (
            <div className="spinner-container">
              <div className="spinner"></div>
              <div className="loading-text">Contacting Safaricom API...</div>
            </div>
          )}

          {!isLoading && result && (
            <div className="result-area">
              {result.success ? (
                <div className="status-banner status-banner-success">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <div className="status-banner-title">Reversal Submitted!</div>
                    <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.5', opacity: 0.9 }}>
                      Safaricom accepted the request (Code: {result.data?.ResponseCode ?? '0'}). A callback will confirm the outcome.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="status-banner status-banner-error">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <div>
                    <div className="status-banner-title">Reversal Failed</div>
                    <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.5', opacity: 0.9 }}>
                      {typeof result.error === 'string'
                        ? result.error
                        : result.error?.errorMessage || result.error?.message || 'Reversal rejected by the API.'}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>API Response</span>
                  <span className={`badge ${result.success ? 'badge-green' : 'badge-red'}`}>
                    {result.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
                <div className="json-viewer-container">
                  <div className="json-viewer-header">
                    <span>Safaricom Response</span>
                    <span>application/json</span>
                  </div>
                  <pre className="json-viewer-body">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <span>☕ Bunaye Coffee Shop</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>Powered by Safaricom M-Pesa Ethiopia</span>
      </footer>
    </>
  );
}

export default App;
