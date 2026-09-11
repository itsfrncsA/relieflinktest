import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';
import '../Login/Login.css';
import './AdminRegister.css';

const AdminRegister = ({ onRegister, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    phone: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    if (!formData.name || !formData.email || !formData.password) {
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

    if (/[<>"':;\/|{}\[\]()\-\+= ]/.test(formData.password)) {
      setError("Password cannot contain spaces or forbidden characters (< > \" : ; ' / | { } [ ] ( ) - + =)");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/register-admin`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        department: formData.department
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onRegister(res.data.user);
      } else {
        setSuccess(res.data.message);
        setLoading(false);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      if (message.toLowerCase().includes('already exist') || message.toLowerCase().includes('duplicate')) {
        alert('An account with this email address already exists. Please use a different email address.');
      }
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

      <button 
        onClick={onBack || (() => window.location.href = '/admin-login')} 
        className="rl-auth-back-btn"
        title="Back to login"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Login</span>
      </button>

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
            Administrator Enrollment
          </div>

          <h2 className="rl-auth-title">Admin Registration</h2>
          <p className="rl-auth-subtitle">Create an administrator account for relief operations</p>
          
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
                  value={formData.name}
                  onChange={handleChange}
                  className="rl-auth-input"
                  placeholder="Juan dela Cruz"
                  required
                />
              </div>

              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="rl-auth-input"
                  placeholder="Enter email address"
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
                  value={formData.phone}
                  onChange={handleChange}
                  className="rl-auth-input"
                  placeholder="+63 912 345 6789"
                />
              </div>
            </div>

            <div className="rl-auth-input-group">
              <label className="rl-auth-label">Department / Unit</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="rl-auth-input"
                placeholder="Logistics, Parish Council, Finance, etc."
              />
            </div>

            <div className="rl-auth-form-row">
              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="rl-auth-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="rl-auth-input-group">
                <label className="rl-auth-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="rl-auth-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="rl-auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="rl-auth-spinner"></span>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Administrator Account</span>
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

export default AdminRegister;