import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [activeCta, setActiveCta] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  
  // Phone Mockup interactive states
  const [phoneScreen, setPhoneScreen] = useState('home'); // 'home', 'donate', 'transparency'
  const [customDonationAmount, setCustomDonationAmount] = useState('1000');
  const [customDonorName, setCustomDonorName] = useState('Maria');
  const [lastPhoneDonation, setLastPhoneDonation] = useState(null);

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
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const offset = 70;
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

  const handleDownloadAndroidApp = () => {
    const link = document.createElement('a');
    link.href = '/relieflink-app.apk';
    link.download = 'ReliefLink-v1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
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

  const faqs = [
    {
      question: "How do I download and install the ReliefLink Home app?",
      answer: "Click the 'Download Android App' button on this page to download the APK file directly to your mobile device, or tap 'Download App' on top right. Follow the on-screen instructions to complete installation."
    },
    {
      question: "How does ReliefLink guarantee donation transparency?",
      answer: "Every donation processed through the ReliefLink mobile app generates an immutable receipt on the Polygon blockchain, coupled with photo-verified proof of on-ground distribution by Sto. Domingo Parish."
    },
    {
      question: "Can I donate using GCash or QR Ph?",
      answer: "Yes! The mobile app supports direct QR Ph and InstaPay scanning for seamless, instant donations with zero hidden transaction fees."
    },
    {
      question: "Where is the staff / administrator login?",
      answer: "The admin portal login is discretely accessible for authorized parish staff at the bottom left footer of this page or via direct link /admin-login."
    }
  ];

  return (
    <div className="rl-page">
      {/* TOP NAVBAR (White header with royal blue brand accent & Download App button) */}
      <nav className="rl-nav">
        <div className="rl-nav-inner">
          <div className="rl-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="rl-logo">
              <img 
                src="/LOGO.png" 
                alt="ReliefLink Logo" 
                className="rl-logo-img" 
                onError={(e) => { e.target.src = '/assets/LOGO.PNG'; }}
              />
            </div>
            <span className="rl-brand-name">relieflink</span>
          </div>

          <div className="rl-nav-links">
            <button className="rl-nav-link" onClick={() => scrollToSection('features')}>Features</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('about')}>About Us</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('faqs')}>FAQs</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('gallery')}>Gallery</button>
          </div>

          <div className="rl-nav-actions">
            <button className="rl-nav-cta" onClick={handleDownloadAndroidApp}>
              Download App
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Vibrant Bright Royal Blue Background with Animations) */}
      <section className="rl-hero">
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
            
            <div className="rl-hero-actions">
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
              <span className="rl-fstat-lbl">Polygon Verified</span>
            </div>
            <div className="rl-hero-arch">
              {/* Interactive Phone Mockup */}
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
                          <div className="rl-pc-label">Active Parish Cause</div>
                          <div className="rl-pc-title">Typhoon Relief Fund — Sto. Domingo</div>
                          <div className="rl-pc-track"><div className="rl-pc-fill" /></div>
                          <div className="rl-pc-meta"><span>₱2.1M raised</span><span>68% of goal</span></div>
                        </div>
                        <div className="rl-phone-stats">
                          <div className="rl-ps-card">
                            <div className="rl-ps-val">₱5,512</div>
                            <div className="rl-ps-lab">Total Donated</div>
                          </div>
                          <div className="rl-ps-card">
                            <div className="rl-ps-val">4</div>
                            <div className="rl-ps-lab">Verified Receipts</div>
                          </div>
                        </div>
                        <button className="rl-phone-donate" onClick={() => setPhoneScreen('donate')}>Simulate Direct Donation</button>
                      </div>
                    )}

                    {phoneScreen === 'donate' && (
                      <form className="rl-phone-form" onSubmit={handlePhoneSubmitDonation}>
                        <div className="rl-phone-form-title">Scan QR Ph / InstaPay to Donate</div>
                        
                        <div className="rl-phone-qr-container">
                          <img 
                            src="/assets/QR.jpeg" 
                            alt="QR Ph InstaPay Code" 
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
                          <h3>Fully Verified &amp; Transparent</h3>
                          <p>Your donation has been recorded on the polygon blockchain ledger.</p>
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
        </div>
      </section>

      {/* LIVE IMPACT COUNTER BANNER */}
      <div className="rl-stats-banner reveal-on-scroll">
        <div className="rl-stats-inner">
          <div className="rl-stat-item">
            <div className="rl-stat-num">₱2.85M+</div>
            <div className="rl-stat-desc">Relief Raised &amp; Monitored</div>
          </div>
          <div className="rl-stat-divider"></div>
          <div className="rl-stat-item">
            <div className="rl-stat-num">100%</div>
            <div className="rl-stat-desc">Polygon Blockchain Audits</div>
          </div>
          <div className="rl-stat-divider"></div>
          <div className="rl-stat-item">
            <div className="rl-stat-num">14+</div>
            <div className="rl-stat-desc">Parish Relief Drives</div>
          </div>
          <div className="rl-stat-divider"></div>
          <div className="rl-stat-item">
            <div className="rl-stat-num">Sto. Domingo</div>
            <div className="rl-stat-desc">National Shrine Hub</div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section className="rl-section rl-features-section" id="features">
        <div className="rl-section-inner">
          <div className="rl-section-tag reveal-on-scroll">Why ReliefLink</div>
          <h2 className="rl-section-title reveal-on-scroll">Built for trust,<br />designed for impact</h2>
          <p className="rl-section-sub reveal-on-scroll">Our donation system ensures complete transparency — from the moment you contribute to when your donation creates real impact in communities.</p>
          <div className="rl-features-grid">
            <div className="rl-feature-card reveal-on-scroll">
              <div className="rl-feat-icon rl-feat-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Verified campaigns only</h3>
              <p>Every campaign is reviewed before going live. Organizations are vetted so you know exactly who receives your funds.</p>
            </div>
            <div className="rl-feature-card reveal-on-scroll">
              <div className="rl-feat-icon rl-feat-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h3>Blockchain-backed receipts</h3>
              <p>Each donation generates an immutable, verifiable record. No tampering, no guessing — just proof.</p>
            </div>
            <div className="rl-feature-card reveal-on-scroll">
              <div className="rl-feat-icon rl-feat-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <h3>Real-time impact tracking</h3>
              <p>Follow your donation from contribution to utilization. See photo-verified receipts from the ground.</p>
            </div>
            <div className="rl-feature-card reveal-on-scroll">
              <div className="rl-feat-icon rl-feat-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3>Smart fund distribution</h3>
              <p>Built-in analytics help parish leaders allocate resources efficiently and respond faster to community needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="rl-section rl-how-section" id="how-it-works">
        <div className="rl-section-inner">
          <div className="rl-section-tag reveal-on-scroll">How It Works</div>
          <h2 className="rl-section-title reveal-on-scroll">Transparent giving in 4 simple steps</h2>
          
          <div className="rl-steps-grid">
            <div className="rl-step-card reveal-on-scroll">
              <div className="rl-step-num">01</div>
              <h3>Download App</h3>
              <p>Install the ReliefLink Home app on your mobile device.</p>
            </div>
            <div className="rl-step-card reveal-on-scroll">
              <div className="rl-step-num">02</div>
              <h3>Select Parish Campaign</h3>
              <p>Browse active verified relief programs and community causes.</p>
            </div>
            <div className="rl-step-card reveal-on-scroll">
              <div className="rl-step-num">03</div>
              <h3>Instant GCash / QR Ph</h3>
              <p>Donate directly with zero friction and instant receipt generation.</p>
            </div>
            <div className="rl-step-card reveal-on-scroll">
              <div className="rl-step-num">04</div>
              <h3>Track Verified Impact</h3>
              <p>Receive live photo updates and blockchain audit receipts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="rl-section rl-about-section" id="about">
        <div className="rl-section-inner reveal-on-scroll">
          <div className="rl-about-content">
            <div className="rl-about-text">
              <div className="rl-section-tag">About ReliefLink</div>
              <h2 className="rl-section-title">Empowering Parish Communities with Prescriptive Analytics</h2>
              <p className="rl-section-sub">
                ReliefLink was developed in partnership with Sto. Domingo Church to eliminate manual donation handling, prevent delayed fund monitoring, and provide transparent allocation of relief funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section className="rl-section rl-faqs-section" id="faqs">
        <div className="rl-section-inner">
          <div className="rl-section-tag reveal-on-scroll">Frequently Asked Questions</div>
          <h2 className="rl-section-title reveal-on-scroll">Everything you need to know</h2>

          <div className="rl-faqs-list reveal-on-scroll">
            {faqs.map((faq, index) => (
              <div 
                className={`rl-faq-item ${openFaq === index ? 'open' : ''}`} 
                key={index}
                onClick={() => toggleFaq(index)}
              >
                <div className="rl-faq-question">
                  <span>{faq.question}</span>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                {openFaq === index && (
                  <div className="rl-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIT PROOF GALLERY SECTION */}
      <section className="rl-section rl-gallery-section" id="gallery">
        <div className="rl-section-inner">
          <div className="rl-section-tag reveal-on-scroll">Audit Proof Gallery</div>
          <h2 className="rl-section-title reveal-on-scroll">Verified Donation Events on the Ground</h2>
          <p className="rl-section-sub reveal-on-scroll">
            Photos taken directly during packaging, logistics dispatch, and verified distribution missions led by Sto. Domingo Parish.
          </p>

          <div className="rl-gallery-grid">
            {galleryItems.map((item, index) => (
              <div className="rl-gallery-card reveal-on-scroll" key={index}>
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

      {/* PARISH LOCATION MAP & RELIEF HUB SECTION (Bright & Welcoming Royal Blue Theme) */}
      <section className="rl-section rl-parish-section" id="parish">
        <div className="rl-section-inner reveal-on-scroll">
          <div className="rl-section-tag" style={{ color: '#2563eb', background: '#dbeafe', padding: '6px 14px', borderRadius: '20px', display: 'inline-block' }}>
            Sto. Domingo Parish • Quezon City Relief Hub
          </div>
          <h2 className="rl-section-title" style={{ marginTop: '12px' }}>
            National Shrine of Our Lady of the Holy Rosary
          </h2>
          <p className="rl-section-sub">
            Visit our active relief distribution center or drop off physical goods and donations directly at Sto. Domingo Church, Quezon Avenue.
          </p>

          <div className="rl-parish-card">
            <div className="rl-parish-info-bar">
              <div>
                <div className="rl-parish-label">Parish Address</div>
                <div className="rl-parish-address">537 Quezon Ave, Sta. Mesa Heights, Quezon City, Metro Manila</div>
              </div>
              <a 
                href="https://maps.google.com/?q=Sto.+Domingo+Church+Quezon+City" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rl-btn-directions"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get Directions
              </a>
            </div>

            <div className="rl-parish-map-container">
              <iframe
                title="Sto. Domingo Church Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.5238210350733!2d121.00898537583489!3d14.62615967574706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b6058097b6eb%3A0x6b2e16d48ca83df0!2sSto.%20Domingo%20Church!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="100%"
                height="380"
                style={{ border: 0, borderRadius: '16px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="rl-parish-details-grid">
              <div className="rl-pdetail-box">
                <div className="rl-pdetail-title">Church Schedule</div>
                <div className="rl-pdetail-text">Monday – Sunday: 5:00 AM – 7:30 PM</div>
              </div>
              <div className="rl-pdetail-box">
                <div className="rl-pdetail-title">Relief &amp; Social Action Office</div>
                <div className="rl-pdetail-text">Parish Ministry Center (Door 2)</div>
              </div>
              <div className="rl-pdetail-box">
                <div className="rl-pdetail-title">Contact Hotline</div>
                <div className="rl-pdetail-text">(02) 8743-7756 / 8711-1077</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER (Deep Navy Blue Footer Bar) */}
      <footer className="rl-footer">
        <div className="rl-footer-inner">
          <div className="rl-footer-brand-wrap">
            <span className="rl-footer-copyright">
              © ReliefLink. All rights reserved.
            </span>
          </div>

          <div className="rl-footer-links">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a href="#contact" onClick={(e) => e.preventDefault()}>Contact Us</a>
          </div>

          {/* Hidden/Subtle Admin Login Button */}
          <button 
            className="rl-hidden-admin-btn"
            onClick={handleGoToStaffPortal}
            title="Admin / Staff Portal Login"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Staff Portal</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;