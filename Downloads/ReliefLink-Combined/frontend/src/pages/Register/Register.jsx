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
    role: 'staff',
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
    <div className="register-container">
      <div className="register-background"></div>
      {onBack && (
        <button 
          onClick={onBack} 
          className="back-button"
          title="Back to home"
        >
          ← Back
        </button>
      )}
      <div className="register-content">
        <div className="register-card">
          <div className="icon-container">
            <img src="/assets/LOGO.PNG" alt="ReliefLink" className="register-logo" />
          </div>
          
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">ReliefLink Admin Portal Registration</p>
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="input-group">
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="input-group">
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@relieflink.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="label">Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="input-group">
                <label className="label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="label">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                  disabled={loading}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              
              <div className="input-group">
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+63XXXXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  disabled={loading}
                />
              </div>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-text">
                  <span className="spinner"></span>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {error && (
            <div className="error-container">
              <span className="error-icon">⚠️</span>
              <p className="error-message">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="success-container">
              <span className="success-icon">✅</span>
              <p className="success-message">{success}</p>
            </div>
          )}
          
          <div className="register-info">
            <h4>Account Permissions:</h4>
            <ul>
              <li><strong>Admin:</strong> Full access to all features (requires approval)</li>
              <li><strong>Staff:</strong> Manage donations, expenses, inventory</li>
              <li><strong>Volunteer:</strong> View-only access to donations and inventory</li>
            </ul>
            <div className="admin-notice">
              <p><strong>🔒 Security Notice:</strong></p>
              <p>New admin registrations require approval from existing administrators. If you're the first admin, you'll get immediate access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
