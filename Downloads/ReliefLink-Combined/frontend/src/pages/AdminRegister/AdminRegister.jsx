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
    role: 'staff',
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button onClick={() => window.location.href = '/admin-login'} className="back-button">
          ← Back to Login
        </button>
        
        <div className="login-header">
          <img src="/assets/LOGO.PNG" alt="ReliefLink" className="login-logo" />
        </div>
        
        <h2 className="login-title">Admin Registration</h2>
        <p className="login-subtitle">Create an administrator account</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="input-group">
            <label className="label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="admin@relieflink.com"
              required
            />
          </div>

          <div className="input-group">
            <label className="label">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="staff">Staff</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Admin (First admin only)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="+639123456789"
            />
          </div>

          <div className="input-group">
            <label className="label">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input"
              placeholder="Operations, Finance, etc."
            />
          </div>

          <div className="input-group">
            <label className="label">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="input-group">
            <label className="label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register Admin Account'}
          </button>
        </form>
        
        <div className="login-info">
          <p><strong>Note:</strong></p>
          <ul>
            <li>First admin account will be automatically activated</li>
            <li>Subsequent admin registrations require approval</li>
            <li>Staff and volunteer accounts need admin approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;