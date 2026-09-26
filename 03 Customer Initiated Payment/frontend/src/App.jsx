import { useState } from 'react';
import axios from 'axios';
import { Coffee, Phone, Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    Msisdn: '251945628580'
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:5000/api/pay', formData);
      
      setStatus({
        type: 'success',
        message: 'Payment request initiated successfully!'
      });
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to process payment. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container glass-panel">
      <div className="decoration dec-1"></div>
      <div className="decoration dec-2"></div>
      
      <div className="brand-header">
        <h1 className="brand-title">
          <Coffee size={36} />
          Bunaye
        </h1>
        <p className="brand-subtitle">Premium Coffee Experience</p>
      </div>

      <form className="payment-form" onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label className="form-label">Phone Number (Msisdn)</label>
          <div className="input-wrapper">
            <Phone size={20} className="input-icon" />
            <input
              type="text"
              name="Msisdn"
              value={formData.Msisdn}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. 2519XXXXXXXX"
              required
            />
          </div>
        </div>


        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="spinner" size={24} />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </button>

      </form>

      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

    </div>
  );
}

export default App;
