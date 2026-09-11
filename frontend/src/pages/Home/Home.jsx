import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import { API_URL } from '../../api';
import FooterModals from '../../components/FooterModals';

const Home = ({ onNavigateDownload, onNavigateLogin }) => {
  const [activeCta, setActiveCta] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  // Fetch active announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_URL}/announcements`);
        if (res.data && res.data.success) {
          setAnnouncements(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setAnnouncementsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [announcements]);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const offset = 70;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  const handleGoToStaffPortal = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      window.location.href = '/admin-login';
    }
  };

  const handleDownloadAndroidApp = () => {
    if (onNavigateDownload) {
      onNavigateDownload();
    } else {
      window.location.href = '/download';
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="rl-page">
      {/* TOP NAVBAR (Brand logo with Home and About Us right next to logo) */}
      <nav className="rl-nav">
        <div className="rl-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="rl-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
              <button className="rl-nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
              <button className="rl-nav-link" onClick={() => scrollToSection('about')}>About Us</button>
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
            <button className="rl-nav-cta" onClick={handleDownloadAndroidApp}>
              Download App
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Santo Domingo Church Background with Dark Overlay) */}
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
              Sto. Domingo Church Partnered Relief Hub
            </div>
            <h1 className="rl-hero-title">
              Download The<br />
              ReliefLink Home App
            </h1>
            <p className="rl-hero-sub">
              Download the ReliefLink Home app to access transparent donation tracking, verified parish relief updates, and real-time blockchain receipts.
            </p>
            
            <div className="rl-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button 
                className="rl-btn-android"
                onClick={handleDownloadAndroidApp}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M17.523 15.3414C17.0607 15.3414 16.6872 14.9678 16.6872 14.5056C16.6872 14.0433 17.0607 13.6698 17.523 13.6698C17.9852 13.6698 18.3587 14.0433 18.3587 14.5056C18.3587 14.9678 17.9852 15.3414 17.523 15.3414ZM6.47702 15.3414C6.01477 15.3414 5.64124 14.9678 5.64124 14.5056C5.64124 14.0433 6.01477 13.6698 6.47702 13.6698C6.93928 13.6698 7.31281 14.0433 7.31281 14.5056C7.31281 14.9678 6.93928 15.3414 6.47702 15.3414ZM17.9697 9.87325L19.5768 7.08906C19.7118 6.85532 19.6318 6.55648 19.3981 6.42144C19.1643 6.2864 18.8655 6.36647 18.7305 6.60021L17.087 9.44701C15.5492 8.74602 13.8211 8.35205 12 8.35205C10.1789 8.35205 8.45082 8.74602 6.91302 9.44701L5.26953 6.60021C5.13449 6.36647 4.83565 6.2864 4.60191 6.42144C4.36817 6.55648 4.2881 6.85532 4.42314 7.08906L6.03027 9.87325C2.65609 11.7153 0.364258 15.1114 0 19.0664H24C23.6357 15.1114 21.3439 11.7153 17.9697 9.87325Z"/>
                </svg>
                Download Android App
              </button>
            </div>
          </div>

          {/* Right Column: Arch Cutout holding interactive smartphone preview with Floating Badges */}
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

        {/* Wave Divider */}
        <div className="rl-hero-wave">
          <svg className="rl-wave-svg" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
            <path fill="#ffffff" d="M0,40 C240,80 480,0 720,30 C960,60 1200,20 1440,45 L1440,80 L0,80 Z"></path>
          </svg>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="rl-section rl-about-section" id="about" style={{ padding: '80px 24px', backgroundColor: '#f8fafc' }}>
        <div className="rl-section-inner reveal-on-scroll" style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div className="rl-about-content">
            <div className="rl-about-text">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: '#dbeafe', color: '#1e40af', fontWeight: '800', fontSize: '12px', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '18px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
                ABOUT RELIEFLINK • STO. DOMINGO PARISH
              </div>
              
              <h2 className="rl-section-title" style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', lineHeight: '1.25', letterSpacing: '-0.5px' }}>
                Empowering Parish Relief Ecosystems with Prescriptive Analytics &amp; Immutable Transparency
              </h2>
              
              <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#475569', marginBottom: '20px' }}>
                <strong>ReliefLink</strong> was conceptualized and developed in direct partnership with <strong>Santo Domingo Church (National Shrine of Our Lady of the Holy Rosary)</strong> in Quezon City. Designed to replace paper-based receipt tracking and delayed fund reporting, ReliefLink introduces a modern, cryptographically secured digital platform built for parish leaders, donors, and relief volunteers.
              </p>

              <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#475569', marginBottom: '36px' }}>
                By pairing real-time payment gateway automation with a custom <strong>Ethereum-based Blockchain ledger</strong>, every single donation generates an unalterable transaction record. This provides 100% auditability, eliminating fund misallocation and providing public assurance that relief supplies reach affected communities efficiently.
              </p>

              {/* High-Impact Hero Banner Box */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', padding: '36px 40px', borderRadius: '28px', color: '#ffffff', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#60a5fa', marginBottom: '6px' }}>OUR COMMITMENT</div>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 8px 0', color: '#ffffff' }}>Transparent Disaster Relief for Sto. Domingo Parish</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                    Fostering public trust through automated receipts, cryptographic validation, and accountable community distribution.
                  </p>
                </div>
                <button 
                  onClick={handleDownloadAndroidApp}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 26px', borderRadius: '9999px', background: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
                >
                  <span>Download App</span>
                  <span style={{ fontSize: '16px' }}>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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

export default Home;