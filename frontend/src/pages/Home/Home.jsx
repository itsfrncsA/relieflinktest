import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [activeCta, setActiveCta] = useState(null);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const offset = 80; // Account for any fixed header
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const handleCtaClick = (ctaKey, action) => {
    setActiveCta(ctaKey);
    window.setTimeout(() => {
      setActiveCta(null);
      action();
    }, 220);
  };

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className="navbar">
          <div className="nav-content">
            <div className="logo">
              <img src="/assets/LOGO.PNG" alt="ReliefLink" className="logo-img" />
            </div>
            <div className="nav-menu">
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('about-us')}
              >
                About Us
              </button>
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('stories')}
              >
                Stories
              </button>
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('features')}
              >
                Why Choose ReliefLink
              </button>
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('mobile-download')}
              >
                Download App
              </button>
            </div>
          </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Transform Lives with ReliefLink</h1>
          <p className="hero-subtitle">
            Join thousands of Filipinos making a difference through secure, transparent donations. 
            Download our mobile app and start your journey of giving today.
          </p>
          <div className="hero-buttons">
            <button
              className={`primary-cta-button ${activeCta === 'download' ? 'cta-pressed' : ''}`}
              type="button"
              onClick={() => handleCtaClick('download', () => scrollToSection('mobile-download'))}
            >
              Download Mobile App
            </button>
            <button
              className={`secondary-cta-button ${activeCta === 'learn' ? 'cta-pressed' : ''}`}
              type="button"
              onClick={() => handleCtaClick('learn', () => scrollToSection('about-us'))}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image">
       
          
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section" id="about-us">
        <div className="about-content">
          <div className="about-text">
            <h2 className="about-title">About Us</h2>
            <p className="about-subtitle">
              Empowering Filipino communities through technology-driven compassion
            </p>
            <div className="about-description">
              <p>
            ReliefLink is a secure donation management platform built to improve transparency and trust in charitable giving. 
            Using blockchain technology, we ensure that every cash donation and fund disbursement is accurately recorded 
            and verifiable.
              </p>
              <p>
                Our system combines immutable transaction records with receipt-based verification, allowing organizations and donors 
                to track how funds are used from contribution to utilization. With built-in analytics, 
                ReliefLink also helps organizations make smarter, data-driven decisions to distribute resources efficiently and 
                respond to community needs. At ReliefLink, we believe every donation should be transparent, accountable, and impactful.
              </p>
            </div>
            <div className="about-values">
              <div className="value-item">
                <div className="value-icon-text"></div>
                <div>
                  <h4>Mission-Driven</h4>
                  <p>Every donation creates meaningful change</p>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon-text"></div>
                <div>
                  <h4>Trust & Security</h4>
                  <p>Your donations are safe and transparent</p>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon-text"></div>
                <div>
                  <h4>Impact-Focused</h4>
                  <p>Real results for Filipino communities</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-image">
            <div className="about-visual">
              
           
              
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stories Section */}
      <section className="testimonials-section" id="stories">
        <h2 className="section-title">Impact Stories</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="testimonial-text">
                "ReliefLink helped me support my hometown in Bicol after the typhoon. Seeing real-time updates of how my donation bought school supplies for kids brought tears to my eyes."
              </p>
              <div className="testimonial-author">
                <img
                  src="/assets/donor1.jpg"
                  alt="Maria Santos"
                  className="author-avatar"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjgiIHI9IjQiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwIDEzQzEwIDEzIDYgMTYgNiAyMFYyMEgxNFYyMEMxNCAxNiAxMCAxMyAxMCAxM1oiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                  }}
                />
                <div>
                  <div className="author-name">Maria Santos</div>
                  <div className="author-role">OFW in Singapore</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="testimonial-text">
                "As a small business owner, I love how transparent ReliefLink is. I can see exactly how my monthly donations are helping families rebuild their lives."
              </p>
              <div className="testimonial-author">
                <img
                  src="/assets/donor2.jpg"
                  alt="Carlos Reyes"
                  className="author-avatar"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjgiIHI9IjQiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwIDEzQzEwIDEzIDYgMTYgNiAyMFYyMEgxNFYyMEMxNCAxNiAxMCAxMyAxMCAxM1oiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                  }}
                />
                <div>
                  <div className="author-name">Carlos Reyes</div>
                  <div className="author-role">Business Owner</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="testimonial-text">
                "The app makes giving so easy! I set up recurring donations and get beautiful updates showing the impact. It's like being connected to my community even from abroad."
              </p>
              <div className="testimonial-author">
                <img
                  src="/assets/donor3.jpg"
                  alt="Anna Lee"
                  className="author-avatar"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjgiIHI9IjQiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwIDEzQzEwIDEzIDYgMTYgNiAyMFYyMEgxNFYyMEMxNCAxNiAxMCAxMyAxMCAxM1oiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                  }}
                />
                <div>
                  <div className="author-name">Anna Lee</div>
                  <div className="author-role">Nurse in Canada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2 className="section-title">Why Choose ReliefLink?</h2>
        <div className="features-grid">
          <div className="feature-card">
            
            <h3 className="feature-title">Easy Donations</h3>
            <p className="feature-desc">Simple and secure donation process in just a few clicks</p>
          </div>
          <div className="feature-card">
          
            <h3 className="feature-title">Secure & Safe</h3>
            <p className="feature-desc">Your information is protected with industry-standard encryption</p>
          </div>
          <div className="feature-card">
          
            <h3 className="feature-title">Transparent Tracking</h3>
            <p className="feature-desc">Track where your donations go and the impact they make</p>
          </div>
          <div className="feature-card">
           
            <h3 className="feature-title">Nationwide Impact</h3>
            <p className="feature-desc">Help communities across the Philippines</p>
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section className="mobile-download-section" id="mobile-download">
        <div className="download-content">
          <div className="download-text">
            <h2 className="download-title">Take ReliefLink Everywhere</h2>
            <p className="download-subtitle">
              Experience the power of giving at your fingertips. Our mobile app brings 
              charitable giving closer to you than ever before.
            </p>
            <div className="app-features-list">
              <div className="app-feature">
                
                <div>
                  <h4>Real-Time Updates</h4>
                  <p>Get notified about urgent campaigns and donation impacts</p>
                </div>
              </div>
              <div className="app-feature">
               
                <div>
                  <h4>Track Impact</h4>
                  <p>See exactly how your donations are making a difference</p>
                </div>
              </div>
              <div className="app-feature">
               
                <div>
                  <h4>Donor Rewards</h4>
                  <p>Earn badges and recognition for your generosity</p>
                </div>
              </div>
            </div>
            <div className="download-buttons">
              <button className="download-btn app-store">
                <div className="btn-icon-text">Apple</div>
                <div className="btn-text">
                  <div className="btn-small">Download on the</div>
                  <div className="btn-large">App Store</div>
                </div>
              </button>
              <button className="download-btn play-store">
                <div className="btn-icon-text">Android</div>
                <div className="btn-text">
                  <div className="btn-small">Get it on</div>
                  <div className="btn-large">Google Play</div>
                </div>
              </button>
            </div>
          </div>
          <div className="download-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="app-interface">
                  <div className="app-header">
                    <img src="/assets/LOGO.PNG" alt="ReliefLink" className="app-logo" />
                    <span className="app-name">ReliefLink</span>
                  </div>
                  <div className="app-content">
                    <div className="campaign-card">
                      <div className="campaign-progress"></div>
                      <div className="campaign-text">Typhoon Relief Fund</div>
                    </div>
                    <div className="donation-button">Donate Now</div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          <div className="download-logo-design">
            <div className="logo-showcase">
              <img src="/assets/LOGO.PNG" alt="ReliefLink" className="showcase-logo" />
              <div className="logo-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Counter Section */}
      <section className="impact-section">
        <div className="impact-content">
          <h2 className="impact-title">Together, We're Making a Difference</h2>
          <div className="impact-stats">
            <div className="impact-stat">
              <div className="stat-number" data-target="50000">0</div>
              <div className="stat-label">Active Donors</div>
              <div className="stat-desc">Filipinos giving back</div>
            </div>
            <div className="impact-stat">
              <div className="stat-number" data-target="100000000">0</div>
              <div className="stat-label">Pesos Raised</div>
              <div className="stat-desc">For communities in need</div>
            </div>
            <div className="impact-stat">
              <div className="stat-number" data-target="1000">0</div>
              <div className="stat-label">Communities Helped</div>
              <div className="stat-desc">Across the Philippines</div>
            </div>
            <div className="impact-stat">
              <div className="stat-number" data-target="95">0</div>
              <div className="stat-label">Transparency Rate</div>
              <div className="stat-desc">Of donations tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="app-section">
        <div className="app-content">
          <div className="app-text-section">
            <h2 className="app-title">Download Our Mobile App</h2>
            <p className="app-desc">
              Donate anytime, anywhere with the ReliefLink mobile app. Stay updated on campaigns, 
              track your donations, and make a difference on the go.
            </p>
            <div className="app-features">
              <div className="app-feature-item">✅ One-click donations</div>
              <div className="app-feature-item">✅ Real-time notifications</div>
              <div className="app-feature-item">✅ Donation history & receipts</div>
            </div>
            <div className="app-buttons">
              <button className="app-store-btn">
                <span className="button-icon"></span> App Store
              </button>
              <button className="play-store-btn">
                <span className="button-icon"></span> Play Store
              </button>
            </div>
          
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="final-cta-content">
          <div className="cta-visual">
       
          </div>
          <div className="cta-text">
            <h2 className="cta-title">Start Your Journey of Giving Today</h2>
            <p className="cta-subtitle">
              Join thousands of Filipinos who are already making a difference. 
              Download ReliefLink and be part of something bigger.
            </p>
            <div className="cta-buttons">
              <button className="cta-primary-btn">
                <span className="btn-icon"></span>
                Download ReliefLink App
              </button>
              <button className="cta-secondary-btn">Learn How It Works</button>
            </div>
            <div className="cta-trust">
              <span className="trust-badge"> 100% Secure</span>
              <span className="trust-badge"> Verified Campaigns</span>
              <span className="trust-badge"> Transparent Impact</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">About ReliefLink</h4>
            <p className="footer-text">Connecting donors with those in need since 2024</p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">How It Works</a></li>
              <li><a href="#" className="footer-link">Campaigns</a></li>
              <li><a href="#" className="footer-link">About Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Follow Us</h4>
            <div className="social-links">
              <span className="social-icon"></span>
              <span className="social-icon"></span>
              <span className="social-icon"></span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 ReliefLink. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
