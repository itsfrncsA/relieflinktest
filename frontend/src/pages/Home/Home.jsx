import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [activeCta, setActiveCta] = useState(null);
  
  // Phone Mockup interactive states
  const [phoneScreen, setPhoneScreen] = useState('home'); // 'home', 'donate', 'transparency'
  const [customDonationAmount, setCustomDonationAmount] = useState('1000');
  const [customDonorName, setCustomDonorName] = useState('Maria');
  const [lastPhoneDonation, setLastPhoneDonation] = useState(null);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const offset = 64;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  const handleCtaClick = (ctaKey, action) => {
    setActiveCta(ctaKey);
    window.setTimeout(() => { setActiveCta(null); action(); }, 220);
  };

  // Handles simulated submission from interactive phone mockup
  const handlePhoneSubmitDonation = (e) => {
    e.preventDefault();
    const amt = parseFloat(customDonationAmount);
    if (!customDonorName.trim() || isNaN(amt) || amt <= 0) return;

    setLastPhoneDonation({
      name: customDonorName,
      amount: amt,
      time: 'Just now'
    });

    setPhoneScreen('transparency');
  };

  const handleGoToStaffPortal = () => {
    window.location.href = '/admin-login';
  };

  // Gallery item definitions using Dono1-Dono5 event photos
  const galleryItems = [
    {
      photo: '/assets/Dono1.JPEG',
      title: 'Supplies Packaging Center',
      description: 'Sto. Domingo Parish staff and youth volunteers packaging hygiene kits, canned goods, and essential medicines.',
      location: 'Sto. Domingo Church, Quezon City',
      date: 'May 28, 2026',
      campaign: 'Typhoon Relief Northern Luzon'
    },
    {
      photo: '/assets/Dono2.JPEG',
      title: 'Logistics Deployment',
      description: 'Distribution trucks loading relief packs and transporting verified provisions to partner regional distribution cells.',
      location: 'Sto. Domingo Parish Grounds',
      date: 'June 02, 2026',
      campaign: 'Bicol Community Outreach'
    },
    {
      photo: '/assets/Dono3.JPEG',
      title: 'On-Ground Handover',
      description: 'Direct distribution of verified food supplies and clean water to local leaders and evacuees in Camarines Sur.',
      location: 'Camarines Sur, Bicol Region',
      date: 'May 15, 2026',
      campaign: 'Shelter Rebuild — Bicol'
    },
    {
      photo: '/assets/Dono4.JPEG',
      title: 'Learning Materials Kit Drive',
      description: 'Handing out school bags, notebooks, and learning toolkits to children displaced by regional volcanic activity.',
      location: 'Albay Elementary School Center',
      date: 'June 18, 2026',
      campaign: 'School Supplies Drive'
    },
    {
      photo: '/assets/Dono5.JPEG',
      title: 'Community Health Support',
      description: 'Parish partners offering basic medical care, clinical guidance, and free healthcare supplies to families.',
      location: 'Sto. Domingo Parish Clinic',
      date: 'July 01, 2026',
      campaign: 'Evacuations Health & Support'
    }
  ];

  return (
    <div className="rl-page">
      {/* Glow elements */}
      <div className="rl-glow rl-glow-1"></div>
      <div className="rl-glow rl-glow-2"></div>
      <div className="rl-grid-overlay"></div>

      {/* NAV */}
      <nav className="rl-nav">
        <div className="rl-nav-inner">
          <div className="rl-brand">
            <div className="rl-logo">
              <img src="/assets/LOGO.png" alt="" className="rl-logo-img" onError={e => e.target.style.display='none'} />
            </div>
            <span className="rl-brand-name">Relief<span>Link</span></span>
          </div>
          <div className="rl-nav-links">
            <button className="rl-nav-link" onClick={() => scrollToSection('features')}>Features</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('gallery')}>Impact Gallery</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('context')}>Context</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('about')}>About</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('stories')}>Stories</button>
          </div>
          <div className="rl-nav-actions">
            <button className="rl-nav-portal-link" onClick={handleGoToStaffPortal}>Staff Portal</button>
            <button className="rl-nav-cta" onClick={() => scrollToSection('download')}>Get the App</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="rl-hero">
        <div className="rl-hero-inner">
          <div className="rl-hero-copy">
            <div className="rl-badge">
              <span className="rl-badge-dot" />
              Sto. Domingo Church Partnership
            </div>
            <h1 className="rl-hero-title">
              RELIEFLINK<br />
              <span>Cryptographic Trust</span> &amp; <span>Analytics Engine</span>
            </h1>
            <p className="rl-hero-sub">
              A state-of-the-art Blockchain Enabled Donation Management System with Prescriptive Analytics. Restoring donor trust with immutable records and data-driven fund allocation.
            </p>
            <div className="rl-hero-actions">
              <button
                className={`rl-btn-primary ${activeCta === 'download' ? 'rl-pressed' : ''}`}
                onClick={() => handleCtaClick('download', () => scrollToSection('download'))}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3m0 14-4-4m4 4 4-4M3 21h18"/></svg>
                Download Mobile App
              </button>
              <button
                className={`rl-btn-ghost ${activeCta === 'gallery' ? 'rl-pressed' : ''}`}
                onClick={() => handleCtaClick('gallery', () => scrollToSection('gallery'))}
              >
                View Impact Gallery
              </button>
            </div>
            <div className="rl-trust-row">
              {['Verified campaigns', 'Secure payments', 'Blockchain receipts'].map(t => (
                <div className="rl-trust-chip" key={t}>
                  <span className="rl-check-icon">
                    <svg viewBox="0 0 12 12" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Phone Mockup */}
          <div className="rl-phone-wrap">
            <div className="rl-phone-glow"></div>
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
                
                <div className="rl-phone-header">
                  <div className="rl-phone-brand">
                    <div className="rl-phone-logo" />
                    <span>ReliefLink</span>
                  </div>
                </div>

                <div className="rl-phone-content-area">
                  {phoneScreen === 'home' && (
                    <div className="rl-phone-body">
                      <div className="rl-phone-greeting">Welcome back, <strong>Maria Santos</strong></div>
                      <div className="rl-phone-campaign">
                        <div className="rl-pc-label">Active Cause</div>
                        <div className="rl-pc-title">Typhoon Relief Fund — Northern Luzon</div>
                        <div className="rl-pc-track"><div className="rl-pc-fill" /></div>
                        <div className="rl-pc-meta"><span>₱2.1M raised</span><span>68% of goal</span></div>
                      </div>
                      <div className="rl-phone-stats">
                        <div className="rl-ps-card">
                          <div className="rl-ps-val">₱5,512</div>
                          <div className="rl-ps-lab">Total Contributed</div>
                        </div>
                        <div className="rl-ps-card">
                          <div className="rl-ps-val">4</div>
                          <div className="rl-ps-lab">Active Receipts</div>
                        </div>
                      </div>
                      <button className="rl-phone-donate" onClick={() => setPhoneScreen('donate')}>Simulate Direct Donation</button>
                    </div>
                  )}

                  {phoneScreen === 'donate' && (
                    <form className="rl-phone-form" onSubmit={handlePhoneSubmitDonation}>
                      <div className="rl-phone-form-title">Scan GCash QR to Donate</div>
                      
                      <div className="rl-phone-qr-container">
                        <img 
                          src="/assets/QR.jpeg" 
                          alt="GCash QR Ph" 
                          className="rl-phone-qr-img"
                          onError={(e) => {
                            e.target.src = '/assets/LOGO.png'; 
                          }}
                        />
                      </div>
                      
                      <div className="rl-phone-input-group">
                        <label>Your Name</label>
                        <input 
                          type="text" 
                          value={customDonorName} 
                          onChange={(e) => setCustomDonorName(e.target.value)} 
                          placeholder="Donor Name"
                          required 
                        />
                      </div>

                      <div className="rl-phone-input-group">
                        <label>Amount (PHP)</label>
                        <input 
                          type="number" 
                          value={customDonationAmount} 
                          onChange={(e) => setCustomDonationAmount(e.target.value)} 
                          placeholder="Amount in ₱"
                          required 
                        />
                      </div>

                      <div className="rl-phone-form-buttons">
                        <button type="submit" className="rl-phone-donate">Submit Receipt Proof</button>
                        <button type="button" className="rl-phone-btn-cancel" onClick={() => setPhoneScreen('home')}>Cancel</button>
                      </div>
                    </form>
                  )}

                  {phoneScreen === 'transparency' && (
                    <div className="rl-phone-body">
                      <div className="rl-phone-verified-tick">
                        <div className="rl-phone-tick-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h3>Cryptographically Verified</h3>
                        <p>Your donation has been added to the immutable ledger.</p>
                      </div>

                      <div className="rl-phone-receipt-stub">
                        <div className="rl-stub-row"><span>Donor:</span><strong>{lastPhoneDonation?.name || 'Maria Santos'}</strong></div>
                        <div className="rl-stub-row"><span>Amount:</span><strong>₱{(lastPhoneDonation?.amount || 1000).toLocaleString()}</strong></div>
                        <div className="rl-stub-row"><span>Ledger Status:</span><span className="rl-badge-verified">SECURED ON POLYGON</span></div>
                      </div>

                      <button className="rl-phone-donate" style={{ backgroundColor: '#4b5563' }} onClick={() => setPhoneScreen('home')}>Back to Home</button>
                    </div>
                  )}
                </div>
                
                {/* Phone Bottom Tab Bar */}
                <div className="rl-phone-tabs">
                  <button className={`rl-phone-tab-btn ${phoneScreen === 'home' ? 'active' : ''}`} onClick={() => setPhoneScreen('home')}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    <span>Home</span>
                  </button>
                  <button className={`rl-phone-tab-btn ${phoneScreen === 'donate' ? 'active' : ''}`} onClick={() => setPhoneScreen('donate')}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>Donate</span>
                  </button>
                  <button className={`rl-phone-tab-btn ${phoneScreen === 'transparency' ? 'active' : ''}`} onClick={() => setPhoneScreen('transparency')}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span>Ledger</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="rl-section rl-features-section" id="features">
        <div className="rl-section-inner">
          <div className="rl-section-tag">Why ReliefLink</div>
          <h2 className="rl-section-title">Built for trust,<br />designed for impact</h2>
          <p className="rl-section-sub">Our donation system ensures complete transparency — from the moment you contribute to when your donation creates real impact in communities.</p>
          <div className="rl-features-grid">
            <div className="rl-feature-card">
              <div className="rl-feat-icon rl-feat-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Verified campaigns only</h3>
              <p>Every campaign is reviewed before going live. Organizations are vetted so you know exactly who receives your funds.</p>
            </div>
            <div className="rl-feature-card">
              <div className="rl-feat-icon rl-feat-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h3>Blockchain-backed receipts</h3>
              <p>Each donation generates an immutable, verifiable record. No tampering, no guessing — just proof.</p>
            </div>
            <div className="rl-feature-card">
              <div className="rl-feat-icon rl-feat-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <h3>Real-time impact tracking</h3>
              <p>Follow your donation from contribution to utilization. See photo-verified receipts from the ground.</p>
            </div>
            <div className="rl-feature-card">
              <div className="rl-feat-icon rl-feat-amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3>Smart fund distribution</h3>
              <p>Built-in analytics help organizations allocate resources efficiently and respond faster to community needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIED DONATION EVENTS GALLERY */}
      <section className="rl-section rl-gallery-section" id="gallery">
        <div className="rl-section-inner">
          <div className="rl-section-tag">Audit Proof Gallery</div>
          <h2 className="rl-section-title">Verified Donation Events on the Ground</h2>
          <p className="rl-section-sub">
            Photos taken directly during packaging, logistics dispatch, and verified distribution missions led by Sto. Domingo Parish.
          </p>

          <div className="rl-gallery-grid">
            {galleryItems.map((item, index) => (
              <div className="rl-gallery-card" key={index}>
                <div className="rl-gallery-img-container">
                  <img src={item.photo} alt={item.title} className="rl-gallery-img" />
                  <div className="rl-gallery-badge">
                    <span className="rl-badge-dot"></span>
                    VERIFIED EVENT PHOTO
                  </div>
                </div>
                <div className="rl-gallery-card-body">
                  <h3 className="rl-gallery-card-title">{item.title}</h3>
                  <p className="rl-gallery-card-desc">{item.description}</p>
                  <div className="rl-gallery-card-meta">
                    <div className="rl-gallery-meta-row">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <span>{item.location}</span>
                    </div>
                    <div className="rl-gallery-meta-row">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <div className="rl-gallery-card-campaign">
                    {item.campaign}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECT CONTEXT */}
      <section className="rl-section rl-context-section" id="context">
        <div className="rl-section-inner">
          <div className="rl-section-tag">Project Context</div>
          <h2 className="rl-section-title">Sto. Domingo Church Partnership</h2>
          <p className="rl-section-sub">
            Sto. Domingo Church in Quezon City serves as the primary implementation partner. The parish depends on donations from individuals and organizations to continue vital community outreach and ministries.
          </p>

          <div className="rl-context-grid">
            <div className="rl-context-left">
              <h3>The Challenges We Identified</h3>
              <div className="rl-challenge-list">
                <div className="rl-challenge-item">
                  <div className="rl-challenge-num">01</div>
                  <div>
                    <h4>Personal GCash Accounts</h4>
                    <p>Online donations were sent to an authorized staff member’s personal GCash account because the parish lacked an official digital platform. Funds remained in a personal account until transfer.</p>
                  </div>
                </div>
                <div className="rl-challenge-item">
                  <div className="rl-challenge-num">02</div>
                  <div>
                    <h4>Manual Records &amp; Reconciliation</h4>
                    <p>Donation records, receipt generation, fund classification, and reconciliation were completely processed using manual methods.</p>
                  </div>
                </div>
                <div className="rl-challenge-item">
                  <div className="rl-challenge-num">03</div>
                  <div>
                    <h4>Delayed Monitoring</h4>
                    <p>To reduce withdrawal transactions, online donations were usually withdrawn once a month instead of after every donation, making tracking more difficult.</p>
                  </div>
                </div>
                <div className="rl-challenge-item">
                  <div className="rl-challenge-num">04</div>
                  <div>
                    <h4>Manual Fund Allocation</h4>
                    <p>No system existed to monitor donation trends or provide recommendations for allocating funds to different ministries, relying mostly on experience.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rl-context-right">
              <div className="rl-solution-box">
                <h3>The RELIEFLINK Solution</h3>
                <p>
                  RELIEFLINK addresses these challenges by developing a unified mobile and web-based donation management system.
                </p>
                <div className="rl-sol-points">
                  <div className="rl-sol-point">
                    <strong>Blockchain Technology:</strong> Kept secure, transparent, and difficult to alter, building donor trust with tamper-resistant records.
                  </div>
                  <div className="rl-sol-point">
                    <strong>Prescriptive Analytics:</strong> Analyzes donation trends to provide data-driven fund allocation recommendations for different ministries.
                  </div>
                  <div className="rl-sol-point">
                    <strong>UN SDG 16 Alignment:</strong> Aligns with Goal 16 (Peace, Justice, and Strong Institutions) by promoting transparency and accountability.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="rl-about-section" id="about">
        <div className="rl-about-inner">
          <div className="rl-about-text">
            <div className="rl-section-tag">About RELIEFLINK</div>
            <h2 className="rl-section-title">Empowering Charities with Digital Transparency</h2>
            <p className="rl-about-desc">In charitable and religious organizations, digital systems help improve the way donations are collected, recorded, monitored, and reported, replacing error-prone manual operations.</p>
            <p className="rl-about-desc">RELIEFLINK benefits both donors and administrators. Donors use convenient digital payment methods with complete visibility, while administrators manage, verify, monitor, and generate reports securely.</p>
            <div className="rl-about-values">
              {[
                { color: 'blue', title: 'Mission-driven', desc: 'Every feature is built to maximize positive impact for Filipino communities.', icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
                { color: 'green', title: 'Trust and security', desc: 'Industry-standard encryption and blockchain verification protect every transaction.', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
                { color: 'purple', title: 'Impact-focused', desc: 'Data-driven decisions help organizations reach more families, faster.', icon: <><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></> },
              ].map(({ color, title, desc, icon }) => (
                <div className="rl-about-val" key={title}>
                  <div className={`rl-about-val-icon rl-feat-${color}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  </div>
                  <div>
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rl-chain-panel">
            <div className="rl-chain-header">How your donation travels</div>
            {[
              ['1', 'You donate securely', 'Encrypted, verified payment'],
              ['2', 'Blockchain record created', 'Immutable transaction logged'],
              ['3', 'Funds disbursed', 'Direct to verified organizations'],
              ['4', 'Receipt submitted', 'Photo & document proof uploaded'],
            ].map(([num, title, sub], i, arr) => (
              <React.Fragment key={num}>
                <div className="rl-chain-item">
                  <div className="rl-chain-num">{num}</div>
                  <div className="rl-chain-text">
                    <strong>{title}</strong>
                    <span>{sub}</span>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="rl-chain-arrow">↓</div>}
              </React.Fragment>
            ))}
            <div className="rl-chain-arrow">↓</div>
            <div className="rl-chain-badge">
              <div className="rl-chain-dot" />
              <span>You see verified impact on your app</span>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="rl-section rl-stories-section" id="stories">
        <div className="rl-section-inner">
          <div className="rl-section-tag">Stories</div>
          <h2 className="rl-section-title">Real donors, real impact</h2>
          <div className="rl-testimonials-grid">
            {[
              { photo: '/assets/Dono1.JPEG', name: 'Maria Santos', role: 'OFW in Singapore', quote: '"ReliefLink helped me support my hometown in Bicol after the typhoon. Seeing real-time updates of how my donation bought school supplies brought tears to my eyes."' },
              { photo: '/assets/Dono2.JPEG', name: 'Carlos Reyes', role: 'Business Owner, Makati', quote: '"As a business owner, I love how transparent ReliefLink is. I can see exactly how my monthly donations are helping families rebuild their lives."' },
              { photo: '/assets/Dono3.JPEG', name: 'Anna Lee', role: 'Nurse in Canada', quote: '"The app makes giving so easy. I set up recurring donations and get updates showing the impact. It\'s like being connected to my community even from abroad."' },
              { photo: '/assets/Dono4.JPEG', name: 'Francis Louis', role: 'Active Volunteer, Quezon City', quote: '"Being able to see our team\'s relief distribution logged on blockchain builds immense trust with our sponsors. No more doubts about where funds go."' },
              { photo: '/assets/Dono5.JPEG', name: 'Rhyza Estrella', role: 'Regular Donor, Manila', quote: '"The clarity of the prescriptive recommendations showed me exactly where the parish needed funds most. I feel my contributions make a real difference."' }
            ].map(({ photo, name, role, quote }) => (
              <div className="rl-tcard" key={name}>
                <div className="rl-stars">{'★★★★★'}</div>
                <p>{quote}</p>
                <div className="rl-tcard-author">
                  <img src={photo} alt={name} className="rl-avatar-img" />
                  <div>
                    <div className="rl-author-name">{name}</div>
                    <div className="rl-author-role">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section className="rl-download-section" id="download">
        <div className="rl-download-inner">
          <div className="rl-download-copy">
            <div className="rl-section-tag" style={{ color: '#60a5fa' }}>Mobile app</div>
            <h2 className="rl-section-title" style={{ color: 'white' }}>Take ReliefLink everywhere</h2>
            <p className="rl-section-sub" style={{ color: '#9ca3af' }}>Give on the go, track your impact in real time, and earn donor badges — all from your phone.</p>
            <div className="rl-dfeats">
              {['Real-time campaign notifications', 'Full donation history and receipts', 'Donor badges and recognition', 'One-click recurring donations'].map(f => (
                <div className="rl-dfeat" key={f}>
                  <div className="rl-dfeat-check">
                    <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="rl-store-btns">
              <button className="rl-store-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div className="rl-store-text"><span>Download on the</span>App Store</div>
              </button>
              <button className="rl-store-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3.18 23.76c.27.15.6.19.95.05l13.49-7.69-2.89-2.89-11.55 10.53zm15.16-8.64L4.85.89C4.47.65 4.07.6 3.73.78L14.76 11.8l3.58-.68zM21.36 10.7l-2.93-1.67-3.26 3.27 3.26 3.26 2.96-1.69c.84-.48.84-1.69-.03-2.17zM4.85 23.11l.03.03 10.95-11.34-2.96-2.96-8.02 14.27z"/></svg>
                <div className="rl-store-text"><span>Get it on</span>Google Play</div>
              </button>
            </div>
          </div>
          <div className="rl-txn-panel">
            <div className="rl-txn-header">Recent verified transactions</div>
            {[
              { color: 'blue', title: 'Typhoon Relief Fund', date: 'May 28, 2026 · Verified', amount: '+₱5,000', icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
              { color: 'green', title: 'Shelter Rebuild — Bicol', date: 'May 14, 2026 · Verified', amount: '+₱2,500', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
              { color: 'purple', title: 'School Supplies Drive', date: 'Apr 30, 2026 · Verified', amount: '+₱1,000', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
            ].map(({ color, title, date, amount, icon }) => (
              <div className="rl-txn-item" key={title}>
                <div className="rl-txn-left">
                  <div className={`rl-txn-icon rl-txn-${color}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  </div>
                  <div>
                    <div className="rl-txn-title">{title}</div>
                    <div className="rl-txn-date">{date}</div>
                  </div>
                </div>
                <div className="rl-txn-amount">{amount}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="rl-cta-section">
        <div className="rl-cta-inner">
          <h2>Start giving with confidence today</h2>
          <p>Join thousands of Filipinos already making a difference. Download ReliefLink and know exactly where your donations go.</p>
          <div className="rl-cta-btns">
            <button className="rl-cta-white" onClick={() => scrollToSection('download')}>Download ReliefLink</button>
            <button className="rl-cta-outline" onClick={() => scrollToSection('about')}>Learn how it works</button>
          </div>
          <div className="rl-cta-trust">
            {['100% secure payments', 'Verified campaigns', 'Blockchain receipts'].map(t => (
              <span className="rl-cta-trust-item" key={t}><span className="rl-cta-dot" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="rl-footer">
        <div className="rl-footer-inner">
          <div className="rl-footer-top">
            <div className="rl-footer-brand">
              <div className="rl-brand">
                <div className="rl-logo">
                  <img src="/assets/LOGO.png" alt="" className="rl-logo-img" onError={e => e.target.style.display='none'} />
                </div>
                <span className="rl-brand-name">Relief<span>Link</span></span>
              </div>
              <p>Connecting donors with communities in need across the Philippines since 2024.</p>
            </div>
            <div className="rl-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#gallery">Gallery</a>
              <a href="#context">Context</a>
              <a href="#about">About</a>
              <a href="#stories">Stories</a>
            </div>
            <div className="rl-footer-col">
              <h4>Company</h4>
              <a href="#about">About us</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="rl-footer-col">
              <h4>Administrative</h4>
              <button className="rl-footer-portal-btn" onClick={handleGoToStaffPortal}>Staff Portal Login</button>
              <a href="#">Developer API</a>
              <a href="#">Audit Records</a>
            </div>
          </div>
          <div className="rl-footer-bottom">
            <p>© 2024 ReliefLink. All rights reserved.</p>
            <div className="rl-footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;