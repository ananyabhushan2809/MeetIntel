/**
 * LoginPage.jsx - Authentication Page
 * ======================================
 * Handles both login and signup with a toggle.
 * Clean, centered card design with form validation.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await signup(name, email, password);
        setSuccess('Account created! You can now log in.');
        setIsLogin(true);
        setName('');
        setPassword('');
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md fade-in">

        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--primary-blue)', color: 'white',
            fontWeight: 700, fontSize: 20, marginBottom: 16,
          }}>MI</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>
            Welcome to MeetIntel
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-gray)' }}>
            Enterprise Meeting Intelligence Platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Tab Toggle */}
          <div style={{
            display: 'flex', borderRadius: 10, padding: 4,
            background: 'var(--bg-primary)', marginBottom: 28,
          }}>
            <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14,
                fontWeight: 500, border: 'none', cursor: 'pointer',
                background: isLogin ? 'white' : 'transparent',
                color: isLogin ? 'var(--primary-blue)' : 'var(--text-gray)',
                boxShadow: isLogin ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }} id="login-tab">Log In</button>
            <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14,
                fontWeight: 500, border: 'none', cursor: 'pointer',
                background: !isLogin ? 'white' : 'transparent',
                color: !isLogin ? 'var(--primary-blue)' : 'var(--text-gray)',
                boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }} id="signup-tab">Sign Up</button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 20,
              fontSize: 13, fontWeight: 500,
              background: 'var(--danger-red-light)', color: '#991B1B',
            }}>{error}</div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 20,
              fontSize: 13, fontWeight: 500,
              background: 'var(--success-green-light)', color: '#065F46',
            }}>{success}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name field (signup only) */}
            {!isLogin && (
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name" className="input-field" id="signup-name" />
              </div>
            )}

            {/* Email field */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" className="input-field" required id="login-email" />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 28 }}>
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" className="input-field" required minLength={6} id="login-password" />
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', padding: '13px 0', fontSize: 15, opacity: loading ? 0.7 : 1 }}
              id="auth-submit-button">
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (isLogin ? 'Log In' : 'Create Account')}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, marginTop: 28, color: 'var(--text-light)' }}>
          MeetIntel — Enterprise Meeting Intelligence Platform
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
