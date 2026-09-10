import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';
import './Login.css';

const Login = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (!res.data.user || !res.data.token) {
        setError('Login successful but data missing. Please try again.');
        setLoading(false);
        return;
      }

      // Check if user role is allowed to access web app
      if (res.data.user.role === 'user') {
        setError('Mobile app users cannot access the web dashboard. Please use the mobile app instead.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    setResetLoading(true);

    if (!resetEmail) {
      setResetMessage('Please enter your email address');
      setResetLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: resetEmail
      });
      setResetMessage('Password reset link has been sent to your email');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setResetMessage(message);
    } finally {
      setResetLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setError('');
    setResetMessage('');
    setResetEmail('');
  };

  return (
    <div className="rl-auth-container">
      {/* Santo Domingo Church Background with Royal Navy Overlay */}
      <div className="rl-auth-bg-photo">
        <img 
          src="/church.jpg" 
          alt="Santo Domingo Church Background" 
          className="rl-auth-bg-img"
        />
        <div className="rl-auth-bg-overlay"></div>
      </div>
      <div className="rl-auth-bg-glow"></div>

      {onBack && (
        <button 
          onClick={onBack} 
          className="rl-auth-back-btn"
          title="Back to home"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </button>
      )}

      <div className="rl-auth-content">
        <div className="rl-auth-card">
          {/* Brand Logo & Title */}
          <div className="rl-auth-brand">
            <img 
              src="/logo2.png" 
              alt="ReliefLink Logo" 
              className="rl-auth-logo-img" 
              onError={(e) => { e.target.src = '/assets/logo2.png'; }}
            />
            <div className="rl-auth-brand-text">
              <span className="relief">Relief</span>
              <span className="link">Link</span>
            </div>
          </div>

          <div className="rl-auth-badge">
            <span className="rl-pulse-dot"></span>
            Sto. Domingo Church Partner
          </div>
          
          <h2 className="rl-auth-title">Admin Portal</h2>
          <p className="rl-auth-subtitle">Sign in to access disaster relief operations</p>
          
          <form onSubmit={handleLogin} className="rl-auth-form">
            <div className="rl-auth-input-group">
              <label className="rl-auth-label">Email Address</label>
              <input
                type="email"
                placeholder="admin@relieflink.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rl-auth-input"
                disabled={loading}
                required
              />
            </div>
            
            <div className="rl-auth-input-group">
              <label className="rl-auth-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rl-auth-input"
                disabled={loading}
                required
              />
            </div>
            
            <div className="rl-auth-forgot-wrap">
              <button 
                type="button" 
                onClick={toggleForgotPassword}
                className="rl-auth-forgot-btn"
              >
                Forgot Password?
              </button>
            </div>
            
            <button type="submit" className="rl-auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="rl-auth-spinner"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Reset Section */}
          {showForgotPassword && (
            <div className="rl-auth-reset-box">
              <h3 className="rl-auth-reset-title">Reset Password</h3>
              <p className="rl-auth-reset-sub">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleForgotPassword} className="rl-auth-form">
                <div className="rl-auth-input-group">
                  <label className="rl-auth-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@relieflink.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="rl-auth-input"
                    disabled={resetLoading}
                    required
                  />
                </div>
                
                <button type="submit" className="rl-auth-submit-btn" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <span className="rl-auth-spinner"></span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={toggleForgotPassword}
                  className="rl-auth-cancel-btn"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="rl-auth-alert error">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Success Message */}
          {resetMessage && (
            <div className="rl-auth-alert success">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{resetMessage}</span>
            </div>
          )}
          
          <p className="rl-auth-footer-note">
            Secure admin portal for donation management & disaster relief
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;