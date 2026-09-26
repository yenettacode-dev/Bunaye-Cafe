import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, Coffee } from 'lucide-react';
import axios from 'axios';

function App() {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/transaction-status', {
        transactionId: transactionId.trim()
      });
      
      setResult({
        type: 'success',
        data: response.data
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.error?.message || error.message || 'Verification failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="verification-card glass-panel animate-fade-in">
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '50%' }}>
              <Coffee size={32} color="#3b82f6" />
            </div>
          </div>
          <h1>Bunaye Cafe</h1>
          <p>Verify your M-Pesa transaction securely</p>
        </div>

        <form onSubmit={handleSubmit} className="form-group">
          <div className="form-group">
            <label htmlFor="transactionId">Transaction ID</label>
            <div className="input-wrapper">
              <Search className="input-icon" size={20} />
              <input
                id="transactionId"
                type="text"
                className="form-control"
                placeholder="e.g. UD96QS40Q2"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn-primary ${loading ? 'loading' : ''}`}
            disabled={!transactionId.trim() || loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Verifying...
              </>
            ) : (
              'Verify Transaction'
            )}
          </button>
        </form>

        {result && (
          <div className={`result-container animate-fade-in ${result.type}`}>
            <div className={`result-header ${result.type}`}>
              {result.type === 'success' ? (
                <><CheckCircle2 size={20} /> Transaction Status</>
              ) : (
                <><XCircle size={20} /> Error Occurred</>
              )}
            </div>
            
            {result.type === 'success' ? (
              <div className="result-details">
                {JSON.stringify(result.data.data, null, 2)}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {result.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
