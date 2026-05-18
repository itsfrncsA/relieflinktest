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
    <div className="login-container">
      <div className="login-background"></div>
      {onBack && (
        <button 
          onClick={onBack} 
          className="back-button"
          title="Back to home"
        >
          ← Back
        </button>
      )}
      <div className="login-content">
        <div className="login-card">
          <div className="icon-container">
            <img src="/assets/LOGO.PNG" alt="ReliefLink" className="login-logo" />
          </div>
          
          <p className="login-subtitle">Admin Portal</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                placeholder="admin@relieflink.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>
            
            <div className="input-group">
              <label className="label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>
            
            <div className="forgot-password-link">
              <button 
                type="button" 
                onClick={toggleForgotPassword}
                className="forgot-password-btn"
              >
                Forgot Password?
              </button>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-text">
                  <span className="spinner"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="admin-register-section">
            <p className="admin-register-text">
              Need an admin account?
            </p>
            <button 
              type="button" 
              className="admin-register-link"
              onClick={() => window.location.href = '/admin-register'}
            >
              Register as Administrator
            </button>
          </div>

          {showForgotPassword && (
            <div className="forgot-password-form">
              <h3 className="forgot-password-title">Reset Password</h3>
              <p className="forgot-password-subtitle">
                Enter your email address and we'll send you a link to reset your password
              </p>
              <form onSubmit={handleForgotPassword} className="reset-form">
                <div className="input-group">
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@relieflink.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input"
                    disabled={resetLoading}
                  />
                </div>
                
                <button type="submit" className="submit-btn" disabled={resetLoading}>
                  {resetLoading ? (
                    <span className="loading-text">
                      <span className="spinner"></span>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={toggleForgotPassword}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <span className="error-icon">⚠️</span>
              <p className="error-message">{error}</p>
            </div>
          )}
          
          {resetMessage && (
            <div className="success-container">
              <span className="success-icon">✅</span>
              <p className="success-message">{resetMessage}</p>
            </div>
          )}
          
          <p className="login-footer">
            Secure admin portal for donation management
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;