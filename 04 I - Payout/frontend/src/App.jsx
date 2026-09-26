import { useState } from 'react';

// ── Icons (inline SVG helpers) ───────────────────────────────────────────────
const IconCoffee  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>;
const IconUser    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IconPhone   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>;
const IconMoney   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M8.5 9.5A3.5 1.5 0 0 1 12 8a3.5 1.5 0 0 1 3.5 1.5c0 3-7 3-7 5A3.5 1.5 0 0 0 12 16a3.5 1.5 0 0 0 3.5-1.5"/></svg>;
const IconSend    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconHistory = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconUsers   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

export default function App() {
  const [form, setForm] = useState({ employeeName: '', phone: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);   // { success, data, error, sentPayload }
  const [history, setHistory] = useState([]);

  const totalPaid = history
    .filter(h => h.success)
    .reduce((sum, h) => sum + Number(h.amount), 0);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.phone.trim(),
          amount: Number(form.amount),
          employeeName: form.employeeName.trim() || 'Employee'
        })
      });
      const data = await res.json();
      setResult(data);

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        name: form.employeeName.trim() || 'Employee',
        phone: form.phone.trim(),
        amount: form.amount,
        success: data.success,
        time: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);

      if (data.success) {
        setForm({ employeeName: '', phone: '', amount: '' });
      }
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  const isValid = form.phone.trim().length >= 9 && Number(form.amount) > 0;

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-logo">☕</div>
        <div className="header-brand">
          <h1>Bunaye Coffee</h1>
          <p>Employee Payout Portal</p>
        </div>
        <div className="header-badge">M-Pesa Live</div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="main">

        {/* Left stats panel */}
        <aside className="left-panel">
          <div className="stat-card">
            <div className="stat-label">Total Paid Today</div>
            <div className="stat-value">ETB {totalPaid.toLocaleString()}</div>
            <div className="stat-sub">via M-Pesa B2C</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{history.filter(h => h.success).length}</div>
            <div className="stat-sub">successful this session</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Short Code</div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>2005</div>
            <div className="stat-sub">Bunaye Business</div>
          </div>
        </aside>

        {/* ── Payout form card ─────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">Send Employee Payment</div>
          <div className="card-sub">Pay staff directly to their M-Pesa wallet</div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Employee name */}
            <div className="form-group">
              <label className="form-label" htmlFor="employeeName">
                <IconUser /> Employee Name
              </label>
              <input
                id="employeeName"
                name="employeeName"
                className="form-input"
                type="text"
                placeholder="e.g. Abebe Girma"
                value={form.employeeName}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                <IconPhone /> Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="phone"
                name="phone"
                className="form-input"
                type="tel"
                placeholder="e.g. 251712345678"
                value={form.phone}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                <IconMoney /> Amount (ETB) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="amount-wrapper">
                <span className="amount-prefix">ETB</span>
                <input
                  id="amount"
                  name="amount"
                  className="form-input has-prefix"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="divider" />

            <button
              id="btn-submit-payout"
              type="submit"
              className="btn-pay"
              disabled={loading || !isValid}
            >
              {loading ? (
                <><div className="spinner" /><span>Processing...</span></>
              ) : (
                <><IconSend /><span>Send Payout</span></>
              )}
            </button>
          </form>

          {/* ── Result ────────────────────────────────────────────────────── */}
          {result && (
            <div className={`result-box ${result.success ? 'success' : 'error'}`}>
              <div className={`result-header ${result.success ? 'success' : 'error'}`}>
                <div className={`result-icon ${result.success ? 'success' : 'error'}`}>
                  {result.success ? <IconCheck /> : <IconX />}
                </div>
                {result.success ? 'Payment Queued Successfully' : 'Payment Failed'}
              </div>

              {result.success ? (
                <div className="result-detail">
                  <strong>ConversationID:</strong>{' '}
                  {result.data?.ConversationID || result.data?.OriginatorConversationID || '—'}
                  <br />
                  <strong>Response Code:</strong> {result.data?.ResponseCode ?? '—'}
                  <br />
                  <strong>Description:</strong> {result.data?.ResponseDescription || result.data?.CustomerMessage || '—'}
                </div>
              ) : (
                <div className="result-detail">
                  {typeof result.error === 'string'
                    ? result.error
                    : result.error?.errorMessage || result.error?.ResponseDescription || JSON.stringify(result.error)}
                </div>
              )}

              {result.sentPayload && (
                <pre className="result-json">
                  {JSON.stringify(result.sentPayload, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* ── History panel ─────────────────────────────────────────────────── */}
        <aside className="history-panel">
          <div className="history-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconHistory /> Recent Payouts
          </div>
          {history.length === 0 ? (
            <div className="history-empty">No payouts yet this session.</div>
          ) : (
            <div className="history-list">
              {history.map(h => (
                <div key={h.id} className="history-item">
                  <div className="history-item-top">
                    <span className="history-name">{h.name}</span>
                    <span className="history-amount">ETB {Number(h.amount).toLocaleString()}</span>
                  </div>
                  <div className="history-phone">{h.phone}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`history-status ${h.success ? 'ok' : 'err'}`}>
                      {h.success ? 'Sent' : 'Failed'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

      </main>
    </>
  );
}
