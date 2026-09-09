import React, { useEffect } from 'react';
import '../Home/Home.css';
import './Download.css';

const Download = ({ onNavigateHome, onNavigateLogin }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadApk = () => {
    const link = document.createElement('a');
    link.href = '/relieflink-app.apk';
    link.download = 'ReliefLink-v1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="rl-page">
      {/* Top Navbar (Identical to Home page navbar) */}
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
            <button className="rl-nav-cta" onClick={handleDownloadApk}>
              Download App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section (Identical church background, arch frame, floating badges, and wave divider) */}
      <section className="rl-hero">
        <div className="rl-hero-bg-photo">
          <img 
            src="/church.jpg" 
            alt="Santo Domingo Church Background" 
            className="rl-hero-bg-img"
          />
          <div className="rl-hero-bg-overlay"></div>
        </div>
        <div className="rl-hero-bg-glow"></div>

        <div className="rl-hero-inner">
          <div className="rl-hero-copy">
            <div className="rl-hero-badge">
              <span className="rl-pulse-dot"></span>
              Android APK • Free Distribution
            </div>

            <h1 className="rl-hero-title">
              Get ReliefLink<br />
              on your phone
            </h1>

            <p className="rl-hero-sub">
              Direct donation tracking, real-time blockchain receipts, and verified parish relief updates all in one lightweight app built for donors and Sto. Domingo Parish supporters.
            </p>

            <div className="rl-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button 
                className="rl-btn-android"
                onClick={handleDownloadApk}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download APK
              </button>

              <button 
                onClick={scrollToInstall}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  padding: '14px 26px',
                  borderRadius: '999px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                }}
              >
                How to install
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: '600', marginTop: '20px' }}>
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>48 MB</span>
              <span>•</span>
              <span>Android 10+</span>
            </div>
          </div>

          {/* Right Column: Arch Cutout holding phone preview with Floating Badges */}
          <div className="rl-hero-arch-container">
            <div className="rl-floating-badge float-top">
              <span className="rl-fstat-val">₱2.8M+</span>
              <span className="rl-fstat-lbl">Relief Raised</span>
            </div>
            <div className="rl-floating-badge float-bottom">
              <span className="rl-fstat-val">100%</span>
              <span className="rl-fstat-lbl">Ethereum Verified</span>
            </div>
            <div className="rl-hero-arch">
              {/* Clean Interactive Phone Mockup with Logo */}
              <div className="rl-phone">
                <div className="rl-phone-notch"></div>
                <div className="rl-phone-screen">
                  <div className="rl-phone-status">
                    <span className="rl-phone-time">9:41</span>
                    <div className="rl-phone-status-icons">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.17 19.67 10.54 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17 5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-1 16H8v-2h8v2z"/></svg>
                    </div>
                  </div>
                  
                  <div className="rl-phone-content-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)', color: '#0f172a', padding: '24px 16px', textAlign: 'center' }}>
                    <img 
                      src="/assets/logo2.png" 
                      alt="ReliefLink Logo" 
                      style={{ width: '74px', height: '74px', marginBottom: '12px', objectFit: 'contain', filter: 'drop-shadow(0 6px 14px rgba(37,99,235,0.18))' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo2.png';
                      }}
                    />
                    <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                      <span style={{ color: '#1e3a8a' }}>Relief</span>
                      <span style={{ color: '#d97706' }}>Link</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>Transparent Relief Ecosystem</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider (Smooth transition to white page body) */}
        <div className="rl-hero-wave">
          <svg className="rl-wave-svg" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
            <path fill="#ffffff" d="M0,40 C240,80 480,0 720,30 C960,60 1200,20 1440,45 L1440,80 L0,80 Z"></path>
          </svg>
        </div>
      </section>

      {/* What you get Section */}
      <section className="fg-dl-section fg-dl-what-you-get">
        <div className="fg-dl-container">
          <div className="fg-dl-section-header">
            <h2 className="fg-dl-section-title">What you get</h2>
            <p className="fg-dl-section-sub">
              Everything on the platform, plus live updates and transparent verification that reach you wherever you are.
            </p>
          </div>

          <div className="fg-dl-features-grid">
            <div className="fg-dl-feature-card">
              <div className="fg-dl-icon-box">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="fg-dl-feature-title">Instant checkouts</h3>
              <p className="fg-dl-feature-desc">
                Seamless GCash, Maya, QR Ph, and card payment integration authorizes contributions in seconds without manual receipt uploads.
              </p>
            </div>

            <div className="fg-dl-feature-card">
              <div className="fg-dl-icon-box">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="fg-dl-feature-title">Blockchain receipts</h3>
              <p className="fg-dl-feature-desc">
                Every approved donation is mined directly onto our Ethereum-based Hyperledger Besu blockchain with immutable block hashes.
              </p>
            </div>

            <div className="fg-dl-feature-card">
              <div className="fg-dl-icon-box">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="fg-dl-feature-title">Parish updates</h3>
              <p className="fg-dl-feature-desc">
                Receive real-time announcements on relief operations, educational scholarships, and community outreach programs from Sto. Domingo Church.
              </p>
            </div>

            <div className="fg-dl-feature-card">
              <div className="fg-dl-icon-box">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="fg-dl-feature-title">Community reports</h3>
              <p className="fg-dl-feature-desc">
                Access public donation transparency records, expense distribution reports, and financial totals directly from your mobile phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to install Section */}
      <section className="fg-dl-section fg-dl-install-section" id="how-to-install">
        <div className="fg-dl-container">
          <div className="fg-dl-section-header">
            <h2 className="fg-dl-section-title">How to install</h2>
            <p className="fg-dl-section-sub">
              ReliefLink is distributed directly by Sto. Domingo Parish. It takes about a minute to install.
            </p>
          </div>

          <div className="fg-dl-steps-grid">
            <div className="fg-dl-step-card">
              <div className="fg-dl-step-num">1</div>
              <h3 className="fg-dl-step-title">Download the APK</h3>
              <p className="fg-dl-step-desc">
                Tap the download button above. Your browser may warn you about APK files that are installed outside the Google Play Store.
              </p>
            </div>

            <div className="fg-dl-step-card">
              <div className="fg-dl-step-num">2</div>
              <h3 className="fg-dl-step-title">Allow the install</h3>
              <p className="fg-dl-step-desc">
                Open the downloaded file. If Android asks, enable "Install unknown apps" for your browser, then tap install.
              </p>
            </div>

            <div className="fg-dl-step-card">
              <div className="fg-dl-step-num">3</div>
              <h3 className="fg-dl-step-title">Open ReliefLink</h3>
              <p className="fg-dl-step-desc">
                Launch the app, create an account or sign in, and start giving transparently with live blockchain confirmation receipts.
              </p>
            </div>
          </div>

          <div className="fg-dl-warning-box">
            <div className="fg-dl-warning-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="fg-dl-warning-text">
              Only install ReliefLink from this official page. If you got the APK from an unverified group or external link, delete it, we cannot verify that it is the real app.
            </div>
          </div>
        </div>
      </section>

      {/* App details Section */}
      <section className="fg-dl-section fg-dl-details-section">
        <div className="fg-dl-container">
          <div className="fg-dl-section-header">
            <h2 className="fg-dl-section-title">App details</h2>
          </div>

          <div className="fg-dl-details-table">
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">PLATFORM</span>
              <span className="fg-dl-detail-val">Android</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">MINIMUM VERSION</span>
              <span className="fg-dl-detail-val">Android 10+</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">FILE SIZE</span>
              <span className="fg-dl-detail-val">48 MB</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">APP VERSION</span>
              <span className="fg-dl-detail-val">v1.0.0</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">LAST UPDATED</span>
              <span className="fg-dl-detail-val">September 2026</span>
            </div>
            <div className="fg-dl-detail-cell">
              <span className="fg-dl-detail-lbl">PRICE</span>
              <span className="fg-dl-detail-val">Free</span>
            </div>
          </div>

          {/* Bottom Action Banner Box */}
          <div className="fg-dl-cta-box">
            <div className="fg-dl-cta-left">
              <h3 className="fg-dl-cta-title">Ready to support Sto. Domingo Parish?</h3>
              <p className="fg-dl-cta-sub">
                Install ReliefLink before the next community relief operation.
              </p>
            </div>
            <button className="fg-dl-btn-white" onClick={handleDownloadApk}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download APK</span>
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
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a href="#contact" onClick={(e) => e.preventDefault()}>Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Download;
