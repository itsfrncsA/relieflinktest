import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';  
import './Register.css';

const Register = ({ onRegister, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.phone && !/^[+]?[0-9]{10,15}$/.test(formData.phone)) {
      setError('Please enter a valid phone number (e.g., +63 XXX XXX XXXX)');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone
      });

      if (response.data.user) {
        if (response.data.user.status === 'pending') {
          setSuccess('Registration successful! Your account is pending approval from administrators. You will be notified once approved.');
          setTimeout(() => {
            onBack();
          }, 3000);
        } else {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setSuccess('Account created successfully! Redirecting to dashboard...');
          
          // Only redirect to dashboard if user is active
          if (response.data.user.status === 'active') {
            setTimeout(() => {
              onRegister(response.data.user);
            }, 2000);
          }
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
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

      <div className="rl-auth-content wide">
        <div className="rl-auth-card">
          {/* Brand Header */}
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

          <h2 className="rl-auth-title">Create Admin Account</h2>
          <p className="rl-auth-subtitle">Register for administrator portal access</p>
          
          {error && (
            <div className="rl-auth-alert error">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rl-auth-alert success">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="rl-auth-form" style={{ marginTop: '16px' }}>
            <div className="rl-auth-form-row">
              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="rl-auth-input"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@relieflink.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="rl-auth-input"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="rl-auth-form-row">
              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="rl-auth-input"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="rl-auth-input"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="rl-auth-form-row">
              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="rl-auth-input"
                  disabled={loading}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">SuperAdmin</option>
                </select>
              </div>
              
              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+63 912 345 6789"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rl-auth-input"
                  disabled={loading}
                />
              </div>
            </div>
            
            <button type="submit" className="rl-auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="rl-auth-spinner"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="rl-auth-divider">
            <span>or</span>
          </div>

          <button 
            type="button" 
            className="rl-auth-secondary-btn"
            onClick={() => window.location.href = '/admin-login'}
          >
            <span>Already have an account? Sign In</span>
            <span style={{ fontSize: '15px' }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
