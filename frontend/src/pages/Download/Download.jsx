import React, { useEffect, useState } from 'react';
import '../Home/Home.css';
import './Download.css';
import FooterModals from '../../components/FooterModals';

const Download = ({ onNavigateHome, onNavigateLogin }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [downloadTab, setDownloadTab] = useState('android'); // 'android' | 'qr' | 'ios'

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadApp = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      window.location.href = 'https://apps.apple.com/ph/app/relieflink/id6470000000';
    } else {
      const link = document.createElement('a');
      link.href = '/ReliefLink.apk';
      link.download = 'ReliefLink.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const scrollToInstall = () => {
    const el = document.getElementById('how-to-install');
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const goHome = (hash = '') => {
    if (onNavigateHome) {
      onNavigateHome(hash);
    } else {
      window.location.href = hash ? `/${hash}` : '/';
    }
  };

  return (
    <div className="rl-page dl-page-wrapper">
      {/* Top Navbar */}
      <nav className="rl-nav">
        <div className="rl-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="rl-brand" onClick={() => goHome('')}>
              <div className="rl-logo">
                <img 
                  src="/logo2.png" 
                  alt="ReliefLink Logo" 
                  className="rl-logo-img" 
                  onError={(e) => { e.target.src = '/assets/logo2.png'; }}
                />
              </div>
              <span className="rl-brand-name">
                <span style={{ color: '#ffffff' }}>Relief</span>
                <span style={{ color: '#f59e0b' }}>Link</span>
              </span>
            </div>

            <div className="rl-nav-links" style={{ margin: 0 }}>
              <button className="rl-nav-link" onClick={() => goHome('')}>Home</button>
              <button className="rl-nav-link" onClick={() => goHome('#about')}>About Us</button>
            </div>
          </div>

          <div className="rl-nav-actions">
            <button 
              className="rl-nav-login" 
              onClick={onNavigateLogin}
              style={{
                background: 'transparent',
                color: '#ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                fontSize: '15px',
                fontWeight: '700',
                padding: '8px 20px',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Login
            </button>
            <button className="rl-nav-cta" onClick={handleDownloadApp}>
              Download APK
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="rl-hero dl-hero-enhanced">
        <div className="rl-hero-bg-photo">
          <img 
            src="/church.jpg" 
            alt="Santo Domingo Church Background" 
            className="rl-hero-bg-img"
          />
          <div className="rl-hero-bg-overlay"></div>
        </div>
        <div className="rl-hero-bg-glow"></div>

        <div className="rl-hero-inner dl-hero-grid">
          {/* Left Column: Copy & Actions */}
          <div className="rl-hero-copy">
            <div className="dl-verified-badge">
              <span className="dl-shield-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
              </span>
              Official Sto. Domingo Parish Build • Android APK v1.0.0
            </div>

            <h1 className="rl-hero-title dl-title-large">
              Experience ReliefLink<br />
              <span className="dl-gradient-text">On Your Mobile Phone</span>
            </h1>

            <p className="rl-hero-sub dl-sub-enhanced">
              Empowering donors and parish members with instantaneous GCash / Maya donation receipts, verified Ethereum blockchain audit trails, and live community relief distribution tracking.
            </p>

            {/* Platform Selection Tabs */}
            <div className="dl-platform-tabs">
              <button 
                className={`dl-tab-btn ${downloadTab === 'android' ? 'active' : ''}`}
                onClick={() => setDownloadTab('android')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1556-.269.0634-.613-.2056-.7686-.269-.1556-.613-.0634-.7686.2056l-2.023 3.5038c-1.5273-.6985-3.2385-1.0945-5.0603-1.0945s-3.533.396-5.0603 1.0945l-2.023-3.5038c-.1556-.269-.4996-.3612-.7686-.2056-.269.1556-.3612.4996-.2056.7686l1.996 3.4572C2.688 11.2335.5 15.1118.5 19.5h23c0-4.3882-2.188-8.2665-5.6185-10.1786"/>
                </svg>
                Android APK (Direct)
              </button>
              <button 
                className={`dl-tab-btn ${downloadTab === 'qr' ? 'active' : ''}`}
                onClick={() => setDownloadTab('qr')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Scan QR Code
              </button>
              <button 
                className={`dl-tab-btn ${downloadTab === 'ios' ? 'active' : ''}`}
                onClick={() => setDownloadTab('ios')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.76 1.04-1.82.93-2.87-.9.04-1.99.6-2.63 1.36-.56.65-1.05 1.72-.92 2.74 1.01.08 2.03-.5 2.62-1.23z"/>
                </svg>
                iOS / Web App
              </button>
            </div>

            {/* Tab 1: Android Direct Download */}
            {downloadTab === 'android' && (
              <div className="dl-action-card">
                <div className="dl-action-row">
                  <button className="dl-btn-primary-large" onClick={handleDownloadApp}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <div className="dl-btn-text-group">
                      <span className="dl-btn-sub">Direct Installation File</span>
                      <span className="dl-btn-main">Download ReliefLink.apk</span>
                    </div>
                  </button>

                  <button className="dl-btn-secondary" onClick={scrollToInstall}>
                    Installation Guide
                  </button>
                </div>

                <div className="dl-meta-specs">
                  <div className="dl-meta-item">
                    <span className="dl-meta-lbl">Package:</span>
                    <span className="dl-meta-val">ReliefLink.apk</span>
                  </div>
                  <div className="dl-meta-item">
                    <span className="dl-meta-lbl">Size:</span>
                    <span className="dl-meta-val">48.2 MB</span>
                  </div>
                  <div className="dl-meta-item">
                    <span className="dl-meta-lbl">Target:</span>
                    <span className="dl-meta-val">Android 8.0 to 14+</span>
                  </div>
                  <div className="dl-meta-item">
                    <span className="dl-meta-lbl">Security:</span>
                    <span className="dl-meta-val dl-green">SHA-256 Clean</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: QR Code Scan */}
            {downloadTab === 'qr' && (
              <div className="dl-action-card dl-qr-card">
                <div className="dl-qr-wrap">
                  <div className="dl-qr-code-box">
                    {/* SVG generated QR pattern */}
                    <svg width="120" height="120" viewBox="0 0 29 29" fill="#0f172a">
                      <path d="M0 0h7v7H0V0zm2 2v3h3V2H2zm7 0h2v1H9V2zm3 0h1v1h-1V2zm2 0h1v1h-1V2zm2 0h1v2h-1V2zm2 0h1v1h-1V2zm3 0h7v7h-7V0zm2 2v3h3V2h-3zM0 9h1v1H0V9zm3 0h1v2H3V9zm2 0h1v1H5V9zm3 0h2v1H8V9zm4 0h1v1h-1V9zm2 0h2v1h-2V9zm4 0h1v1h-1V9zm3 0h1v1h-1V9zm4 0h1v1h-1V9zM0 11h2v1H0v-1zm4 0h1v1H4v-1zm5 0h1v2H9v-2zm3 0h2v1h-2v-1zm4 0h2v1h-2v-1zm3 0h1v2h-1v-2zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1zM0 13h1v1H0v-1zm2 0h2v1H2v-1zm5 0h1v1H7v-1zm4 0h2v2h-2v-2zm3 0h1v1h-1v-1zm3 0h2v1h-2v-1zm3 0h1v1h-1v-1zM0 15h1v1H0v-1zm2 0h1v1H2v-1zm3 0h2v1H5v-1zm3 0h1v1H8v-1zm2 0h1v2h-1v-2zm3 0h2v1h-2v-1zm3 0h1v1h-1v-1zm2 0h1v1h-1v-1zm3 0h1v1h-1v-1zm2 0h1v2h-1v-2zM0 17h1v1H0v-1zm3 0h1v1H3v-1zm2 0h2v1H5v-1zm3 0h2v1H8v-1zm3 0h1v1h-1v-1zm3 0h2v1h-2v-1zm4 0h2v1h-2v-1zm3 0h2v1h-2v-1zM0 19h1v1H0v-1zm3 0h1v1H3v-1zm4 0h1v1H7v-1zm3 0h1v1h-1v-1zm3 0h1v1h-1v-1zm3 0h1v1h-1v-1zm2 0h2v1h-2v-1zm3 0h1v1h-1v-1zM0 22h7v7H0v-7zm2 2v3h3v-3H2zm7 0h1v1H9v-1zm3 0h2v1h-2v-1zm4 0h1v1h-1v-1zm2 0h2v1h-2v-1zm3 0h1v1h-1v-1zm2 0h1v2h-1v-2zm2 0h1v1h-1v-1zM9 25h2v1H9v-1zm3 0h1v1h-1v-1zm3 0h2v1h-2v-1zm4 0h1v2h-1v-2zm2 0h1v1h-1v-1z"/>
                    </svg>
                  </div>
                  <div className="dl-qr-info">
                    <h4 className="dl-qr-title">Scan to install directly on phone</h4>
                    <p className="dl-qr-desc">
                      Open your phone camera or QR scanner to download the official ReliefLink APK directly over Wi-Fi.
                    </p>
                    <div className="dl-qr-url">https://relieflink-4w1g.onrender.com/download</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: iOS & Progressive Web App */}
            {downloadTab === 'ios' && (
              <div className="dl-action-card">
                <div className="dl-action-row">
                  <button className="dl-btn-primary-large dl-btn-dark" onClick={() => goHome('')}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                    <div className="dl-btn-text-group">
                      <span className="dl-btn-sub">Universal Browser App</span>
                      <span className="dl-btn-main">Open ReliefLink Web App</span>
                    </div>
                  </button>
                  <button className="dl-btn-secondary" onClick={onNavigateLogin}>
                    Parish Portal Login
                  </button>
                </div>
                <div className="dl-meta-specs">
                  <div className="dl-meta-item">
                    <span className="dl-meta-lbl">iOS Status:</span>
                    <span className="dl-meta-val">Safari PWA Optimized</span>
                  </div>
                  <div className="dl-meta-item">
                    <span className="dl-meta-lbl">Install:</span>
                    <span className="dl-meta-val">Share &gt; Add to Home Screen</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Phone Mockup */}
          <div className="rl-hero-arch-container dl-mockup-wrapper">
            <div className="rl-floating-badge float-top dl-float-top">
              <span className="rl-fstat-val">₱2.8M+</span>
              <span className="rl-fstat-lbl">Relief Delivered</span>
            </div>
            <div className="rl-floating-badge float-bottom dl-float-bottom">
              <span className="rl-fstat-val">100%</span>
              <span className="rl-fstat-lbl">On-Chain Audit</span>
            </div>

            <div className="rl-hero-arch dl-arch-custom">
              <div className="rl-phone dl-phone-frame">
                <div className="rl-phone-notch"></div>
                <div className="rl-phone-screen">
                  {/* Status Bar */}
                  <div className="rl-phone-status">
                    <span className="rl-phone-time">9:41</span>
                    <div className="rl-phone-status-icons">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.17 19.67 10.54 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17 5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-1 16H8v-2h8v2z"/></svg>
                    </div>
                  </div>

                  {/* App Screen Content */}
                  <div className="dl-app-mock-screen">
                    <div className="dl-mock-header">
                      <div className="dl-mock-brand">
                        <img src="/logo2.png" alt="Logo" className="dl-mock-logo" onError={(e) => { e.target.src = '/assets/logo2.png'; }} />
                        <div>
                          <div className="dl-mock-title">ReliefLink</div>
                          <div className="dl-mock-sub">Sto. Domingo Parish</div>
                        </div>
                      </div>
                      <span className="dl-mock-pill">Live On-Chain</span>
                    </div>

                    <div className="dl-mock-balance-card">
                      <div className="dl-mock-balance-lbl">Parish Community Relief Fund</div>
                      <div className="dl-mock-balance-amt">₱2,842,500.00</div>
                      <div className="dl-mock-balance-meta">
                        <span>● Verified Treasury</span>
                        <span>• Besu Block #4812</span>
                      </div>
                    </div>

                    <div className="dl-mock-feed-header">
                      <span>Recent Verified Aid</span>
                      <span className="dl-mock-view-all">View All</span>
                    </div>

                    <div className="dl-mock-feed-list">
                      <div className="dl-mock-feed-item">
                        <div className="dl-mock-avatar blue">DR</div>
                        <div className="dl-mock-feed-info">
                          <div className="dl-mock-feed-title">Disaster Relief Operations</div>
                          <div className="dl-mock-feed-date">Calamity Food Packs • 45 Families</div>
                        </div>
                        <div className="dl-mock-feed-amt">₱67,500</div>
                      </div>

                      <div className="dl-mock-feed-item">
                        <div className="dl-mock-avatar green">SC</div>
                        <div className="dl-mock-feed-info">
                          <div className="dl-mock-feed-title">Senior Citizens Ministry</div>
                          <div className="dl-mock-feed-date">Medical &amp; Grocery Kits</div>
                        </div>
                        <div className="dl-mock-feed-amt">₱32,000</div>
                      </div>

                      <div className="dl-mock-feed-item">
                        <div className="dl-mock-avatar purple">ED</div>
                        <div className="dl-mock-feed-info">
                          <div className="dl-mock-feed-title">Scholar Educational Grant</div>
                          <div className="dl-mock-feed-date">Monthly Academic Allowance</div>
                        </div>
                        <div className="dl-mock-feed-amt">₱15,000</div>
                      </div>
                    </div>

                    <div className="dl-mock-bottom-action">
                      <button className="dl-mock-donate-btn">
                        Give Donation via GCash / Maya
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="rl-hero-wave">
          <svg className="rl-wave-svg" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
            <path fill="#ffffff" d="M0,40 C240,80 480,0 720,30 C960,60 1200,20 1440,45 L1440,80 L0,80 Z"></path>
          </svg>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="fg-dl-section fg-dl-what-you-get">
        <div className="fg-dl-container">
          <div className="fg-dl-section-header">
            <span className="dl-section-tag">Key Mobile Capabilities</span>
            <h2 className="fg-dl-section-title">Everything Built for Parish Relief</h2>
            <p className="fg-dl-section-sub">
              Access transparent church records, donate instantly via mobile payment gateways, and receive official blockchain receipts on your smartphone.
            </p>
          </div>

          <div className="fg-dl-features-grid dl-features-enhanced">
            <div className="fg-dl-feature-card dl-card-glow">
              <div className="fg-dl-icon-box dl-icon-blue">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="fg-dl-feature-title">Instant Mobile Checkouts</h3>
              <p className="fg-dl-feature-desc">
                Seamless GCash, Maya, and QR Ph payments authorize donations in seconds with instant automated ledger verification.
              </p>
            </div>

            <div className="fg-dl-feature-card dl-card-glow">
              <div className="fg-dl-icon-box dl-icon-emerald">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="fg-dl-feature-title">Immutable Blockchain Auditing</h3>
              <p className="fg-dl-feature-desc">
                Every validated disbursement and gift is mined onto our private Ethereum Hyperledger Besu blockchain for permanent proof.
              </p>
            </div>

            <div className="fg-dl-feature-card dl-card-glow">
              <div className="fg-dl-icon-box dl-icon-amber">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="fg-dl-feature-title">Real-Time Parish Broadcasts</h3>
              <p className="fg-dl-feature-desc">
                Receive live updates directly from the Parish Pastoral Council regarding calamity food drives, health missions, and youth scholarships.
              </p>
            </div>

            <div className="fg-dl-feature-card dl-card-glow">
              <div className="fg-dl-icon-box dl-icon-purple">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="fg-dl-feature-title">Public Transparency Reports</h3>
              <p className="fg-dl-feature-desc">
                Review downloadable itemized expense charts, disbursement liquidation statements, and ministry fund balances anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Installation Guide */}
      <section className="fg-dl-section fg-dl-install-section" id="how-to-install">
        <div className="fg-dl-container">
          <div className="fg-dl-section-header">
            <span className="dl-section-tag">Quick Installation</span>
            <h2 className="fg-dl-section-title">How to Install on Android</h2>
            <p className="fg-dl-section-sub">
              ReliefLink is distributed directly by Sto. Domingo Parish. Setup takes less than 60 seconds.
            </p>
          </div>

          <div className="fg-dl-steps-grid dl-steps-enhanced">
            <div className="fg-dl-step-card dl-step-highlight">
              <div className="fg-dl-step-num">01</div>
              <h3 className="fg-dl-step-title">Download APK File</h3>
              <p className="fg-dl-step-desc">
                Click the <strong>"Download ReliefLink.apk"</strong> button above. If prompted by your mobile browser that the file might be dangerous, tap <strong>"Download anyway"</strong>.
              </p>
            </div>

            <div className="fg-dl-step-card dl-step-highlight">
              <div className="fg-dl-step-num">02</div>
              <h3 className="fg-dl-step-title">Enable Package Install</h3>
              <p className="fg-dl-step-desc">
                Open the downloaded file from your notification bar. If Android asks, tap <strong>Settings</strong> and switch on <strong>"Allow from this source"</strong>.
              </p>
            </div>

            <div className="fg-dl-step-card dl-step-highlight">
              <div className="fg-dl-step-num">03</div>
              <h3 className="fg-dl-step-title">Launch &amp; Track Relief</h3>
              <p className="fg-dl-step-desc">
                Tap <strong>Install</strong>, open ReliefLink, and start exploring verified parish donation drives and real-time blockchain relief confirmations.
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="fg-dl-warning-box dl-warning-enhanced">
            <div className="fg-dl-warning-icon">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="fg-dl-warning-text">
              <strong>Official Security Verification:</strong> Only install ReliefLink directly from this official Sto. Domingo Parish portal. All releases are cryptographically signed and authenticated by the parish IT ministry.
            </div>
          </div>
        </div>
      </section>

      {/* App Specifications Section */}
      <section className="fg-dl-section fg-dl-details-section">
        <div className="fg-dl-container">
          <div className="fg-dl-section-header">
            <span className="dl-section-tag">Specifications</span>
            <h2 className="fg-dl-section-title">Technical Release Details</h2>
          </div>

          <div className="fg-dl-details-table dl-details-grid-enhanced">
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">APPLICATION</span>
              <span className="fg-dl-detail-val">ReliefLink Mobile</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">PLATFORM</span>
              <span className="fg-dl-detail-val">Android / Web PWA</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">MINIMUM OS</span>
              <span className="fg-dl-detail-val">Android 8.0+</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">PACKAGE SIZE</span>
              <span className="fg-dl-detail-val">48.2 MB</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">VERSION</span>
              <span className="fg-dl-detail-val">v1.0.0 (Release)</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">LICENSE / PRICE</span>
              <span className="fg-dl-detail-val dl-green">Free / Open Aid</span>
            </div>
          </div>

          {/* Bottom Call To Action Banner */}
          <div className="fg-dl-cta-box dl-cta-enhanced">
            <div className="fg-dl-cta-left">
              <h3 className="fg-dl-cta-title">Ready to support Sto. Domingo Parish?</h3>
              <p className="fg-dl-cta-sub">
                Download ReliefLink now to participate in upcoming community outreach and emergency aid programs.
              </p>
            </div>
            <button className="fg-dl-btn-white dl-btn-cta-glow" onClick={handleDownloadApp}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download ReliefLink.apk</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="rl-footer">
        <div className="rl-footer-inner">
          <div className="rl-footer-brand-wrap">
            <span className="rl-footer-copyright">
              © ReliefLink. All rights reserved. Sto. Domingo Parish Partner.
            </span>
          </div>

          <div className="rl-footer-links">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }}>Terms of Service</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); setActiveModal('contact'); }}>Contact Us</a>
          </div>
        </div>
      </footer>

      {/* Interactive Footer Modals */}
      <FooterModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
};

export default Download;
