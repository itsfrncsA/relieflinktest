import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';
import './Login.css';

const Login = ({ onLogin, onBack }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'forgot'
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'code'
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password & reset fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
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

  const validatePassword = (p) => {
    if (!p) return 'Password is required.';
    if (p.length < 8) return 'Use at least 8 characters.';
    if (!/[A-Z]/.test(p)) return 'Add an uppercase letter.';
    if (!/[a-z]/.test(p)) return 'Add a lowercase letter.';
    if (!/\d/.test(p)) return 'Add a number.';
    if (!/[@$!%*#?&]/.test(p)) return 'Add a special character (@, $, !, %, *, #, ?, &).';
    if (/[<>"':;\/|{}\[\]()\-\+= ]/.test(p)) {
      return 'Cannot contain spaces or forbidden symbols (< > " : ; \' / | { } [ ] ( ) - + =)';
    }
    return null;
  };

  const getFriendlyError = (err, defaultMsg) => {
    const rawMsg = err.response?.data?.message || err.response?.data?.error || err.message || '';
    const lower = rawMsg.toLowerCase();
    if (lower.includes('network') || lower.includes('timeout') || lower.includes('connection refused')) {
      return 'Please check your internet connection and try again.';
    }
    if (lower.includes('not found') || lower.includes('no account') || lower.includes('user not found')) {
      return 'No account was found for this email address.';
    }
    if (lower.includes('expired')) {
      return 'This verification code has expired. Please request a new code.';
    }
    if (lower.includes('invalid') || lower.includes('incorrect')) {
      return 'The verification code is invalid. Please check it and try again.';
    }
    return rawMsg || defaultMsg;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setResetMessage('');

    const trimmed = resetEmail.trim();
    if (!trimmed) {
      setError('Email is required.');
      return;
    }

    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }

    setResetLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: trimmed
      });
      setForgotStep('code');
      setResendCooldown(30);
      setResetOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setResetMessage('OTP sent. Check your email for the 6-digit code.');
    } catch (err) {
      setError(getFriendlyError(err, 'Failed to send reset code. Please try again.'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resetLoading) return;
    setError('');
    setResetMessage('');
    setResetLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: resetEmail.trim()
      });
      setResendCooldown(30);
      setResetOtp('');
      setResetMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(getFriendlyError(err, 'Failed to resend verification code.'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    const cleanOtp = resetOtp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Enter the complete 6-digit OTP.');
      return;
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      setError(passErr);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        email: resetEmail.trim(),
        otp: cleanOtp,
        newPassword
      });

      setAuthMode('login');
      setForgotStep('email');
      setEmail(resetEmail);
      setPassword('');
      setResetOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setResetMessage(res.data?.message || 'Password reset successfully! You can now sign in.');
    } catch (err) {
      setError(getFriendlyError(err, 'Failed to reset password. Please check your verification code.'));
    } finally {
      setResetLoading(false);
    }
  };

  const switchToForgot = () => {
    setAuthMode('forgot');
    setForgotStep('email');
    setError('');
    setResetMessage('');
    setResetEmail(email || '');
    setResetOtp('');
  };

  const switchToLogin = () => {
    setAuthMode('login');
    setForgotStep('email');
    setError('');
    setResetMessage('');
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

          {authMode === 'login' && (
            <>
              <h2 className="rl-auth-title">Admin Portal</h2>
              <p className="rl-auth-subtitle">Sign in to access disaster relief operations</p>
              
              <form onSubmit={handleLogin} className="rl-auth-form">
                <div className="rl-auth-input-group">
                  <label className="rl-auth-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
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
                    onClick={switchToForgot}
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
            </>
          )}

          {authMode === 'forgot' && forgotStep === 'email' && (
            <>
              <h2 className="rl-auth-title">Forgot Password</h2>
              <p className="rl-auth-subtitle">
                Enter your registered email address to receive a 6-digit verification code.
              </p>

              <form onSubmit={handleSendOtp} className="rl-auth-form">
                <div className="rl-auth-input-group">
                  <label className="rl-auth-label">Registered Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="rl-auth-input"
                    disabled={resetLoading}
                    required
                    autoFocus
                  />
                </div>
                
                <button type="submit" className="rl-auth-submit-btn" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <span className="rl-auth-spinner"></span>
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                <div className="rl-auth-divider">
                  <span>OR</span>
                </div>

                <button 
                  type="button" 
                  onClick={switchToLogin}
                  className="rl-auth-secondary-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Sign In</span>
                </button>
              </form>
            </>
          )}

          {authMode === 'forgot' && forgotStep === 'code' && (
            <>
              <h2 className="rl-auth-title">Reset Password</h2>
              <p className="rl-auth-subtitle">
                Enter the 6-digit code sent to <strong>{resetEmail}</strong> and your new password.
              </p>

              <form onSubmit={handleConfirmResetPassword} className="rl-auth-form">
                <div className="rl-auth-input-group">
                  <label className="rl-auth-label">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    className="rl-auth-input"
                    style={{
                      letterSpacing: '6px',
                      fontSize: '18px',
                      fontWeight: '700',
                      textAlign: 'center',
                      fontFamily: 'monospace'
                    }}
                    disabled={resetLoading}
                    required
                    autoFocus
                  />
                </div>

                <div className="rl-auth-input-group">
                  <label className="rl-auth-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters (Uppercase, Lowercase, Number, Symbol)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rl-auth-input"
                      style={{ paddingRight: '56px' }}
                      disabled={resetLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="rl-auth-input-group">
                  <label className="rl-auth-label">Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rl-auth-input"
                    disabled={resetLoading}
                    required
                  />
                </div>

                {/* Password Strength Criteria (Matching Mobile App) */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  margin: '12px 0 16px 0',
                  fontSize: '12px'
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Password Strength Criteria:</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px' }}>
                    {[
                      { label: 'Minimum 8 characters', valid: newPassword.length >= 8 },
                      { label: 'At least 1 uppercase letter (A-Z)', valid: /[A-Z]/.test(newPassword) },
                      { label: 'At least 1 lowercase letter (a-z)', valid: /[a-z]/.test(newPassword) },
                      { label: 'At least 1 number (0-9)', valid: /\d/.test(newPassword) },
                      { label: 'At least 1 special character (@, $, !, %, *, #, ?, &)', valid: /[@$!%*#?&]/.test(newPassword) },
                      { label: 'Rejects forbidden symbols & spaces (< > " : ; \' / | { } [ ] ( ) - + =)', valid: newPassword.length > 0 && !/[<>"':;\/|{}\[\]()\-\+= ]/.test(newPassword) },
                      { label: 'Password and Confirm Password match confirmation', valid: newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword }
                    ].map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        color: item.valid ? '#16a34a' : '#64748b',
                        fontWeight: item.valid ? '600' : '400',
                        fontSize: '11.5px',
                        transition: 'all 0.2s ease'
                      }}>
                        {item.valid ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: '#cbd5e1',
                            display: 'inline-block',
                            marginLeft: '4px',
                            marginRight: '4px',
                            flexShrink: 0
                          }} />
                        )}
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="rl-auth-submit-btn" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <span className="rl-auth-spinner"></span>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resetLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendCooldown > 0 ? '#94a3b8' : '#2563eb',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      padding: 0
                    }}
                  >
                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('email');
                      setError('');
                      setResetMessage('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Change Email
                  </button>
                </div>

                <div className="rl-auth-divider">
                  <span>OR</span>
                </div>

                <button 
                  type="button" 
                  onClick={switchToLogin}
                  className="rl-auth-secondary-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Sign In</span>
                </button>
              </form>
            </>
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