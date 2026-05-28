import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [activeCta, setActiveCta] = useState(null);

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

  return (
    <div className="rl-page">

      {/* NAV */}
      <nav className="rl-nav">
        <div className="rl-nav-inner">
          <div className="rl-brand">
            <div className="rl-logo">
              <img src="/assets/LOGO.PNG" alt="" className="rl-logo-img" onError={e => e.target.style.display='none'} />
            </div>
            <span className="rl-brand-name">Relief<span>Link</span></span>
          </div>
          <div className="rl-nav-links">
            <button className="rl-nav-link" onClick={() => scrollToSection('features')}>Features</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('about')}>About</button>
            <button className="rl-nav-link" onClick={() => scrollToSection('stories')}>Stories</button>
          </div>
          <button className="rl-nav-cta" onClick={() => scrollToSection('download')}>Get the App</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="rl-hero">
        <div className="rl-hero-inner">
          <div className="rl-hero-copy">
            <div className="rl-badge">
              <span className="rl-badge-dot" />
              Now available in the Philippines
            </div>
            <h1 className="rl-hero-title">
              Give with confidence.<br />
              <em>Every peso,</em> verified.
            </h1>
            <p className="rl-hero-sub">
              A transparent donation system where every peso is tracked from donation to impact. Verified campaigns, secure payments, and blockchain-backed accountability.
            </p>
            <div className="rl-hero-actions">
              <button
                className={`rl-btn-primary ${activeCta === 'download' ? 'rl-pressed' : ''}`}
                onClick={() => handleCtaClick('download', () => scrollToSection('download'))}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3m0 14-4-4m4 4 4-4M3 21h18"/></svg>
                Download the App
              </button>
              <button
                className={`rl-btn-ghost ${activeCta === 'learn' ? 'rl-pressed' : ''}`}
                onClick={() => handleCtaClick('learn', () => scrollToSection('about'))}
              >
                How it works
              </button>
            </div>
            <div className="rl-trust-row">
              {['Verified campaigns', 'Secure payments', 'Blockchain receipts'].map(t => (
                <div className="rl-trust-chip" key={t}>
                  <span className="rl-check-icon">
                    <svg viewBox="0 0 12 12" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="rl-phone-wrap">
            <div className="rl-phone">
              <div className="rl-phone-screen">
                <div className="rl-phone-status">
                  <span className="rl-phone-time">9:41</span>
                </div>
                <div className="rl-phone-header">
                  <div className="rl-phone-brand">
                    <div className="rl-phone-logo" />
                    <span>ReliefLink</span>
                  </div>
                </div>
                <div className="rl-phone-body">
                  <div className="rl-phone-greeting">Good morning,<strong>Maria</strong></div>
                  <div className="rl-phone-campaign">
                    <div className="rl-pc-label">Active Campaign</div>
                    <div className="rl-pc-title">Typhoon Relief Fund — Northern Luzon</div>
                    <div className="rl-pc-track"><div className="rl-pc-fill" /></div>
                    <div className="rl-pc-meta"><span>₱2.1M raised</span><span>68% of goal</span></div>
                  </div>
                  <div className="rl-phone-stats">
                    {[['₱5,000','My donations'],['12','Campaigns'],['95%','Verified'],['847','Families']].map(([v,l]) => (
                      <div className="rl-ps-card" key={l}>
                        <div className="rl-ps-val">{v}</div>
                        <div className="rl-ps-lab">{l}</div>
                      </div>
                    ))}
                  </div>
                  <button className="rl-phone-donate">Donate Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="rl-stats-bar">
        <div className="rl-stats-inner">
          {[
            ['50,000+', 'Active donors'],
            ['₱100M+', 'Raised for communities'],
            ['1,000+', 'Communities helped'],
            ['95%', 'Donation transparency rate'],
          ].map(([val, lab]) => (
            <div className="rl-stat-item" key={lab}>
              <div className="rl-stat-val">{val}</div>
              <div className="rl-stat-lab">{lab}</div>
            </div>
          ))}
        </div>
      </div>

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

      {/* ABOUT */}
      <section className="rl-about-section" id="about">
        <div className="rl-about-inner">
          <div className="rl-about-text">
            <div className="rl-section-tag">About us</div>
            <h2 className="rl-section-title">Transparent giving for every Filipino</h2>
            <p className="rl-about-desc">ReliefLink is a transparent donation system built to restore trust in charitable giving through technology and accountability.</p>
            <p className="rl-about-desc">Every donation is tracked with immutable blockchain records and receipt-based verification — ensuring complete transparency from contribution to impact.</p>
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
              { initials: 'MS', color: 'blue', name: 'Maria Santos', role: 'OFW in Singapore', quote: '"ReliefLink helped me support my hometown in Bicol after the typhoon. Seeing real-time updates of how my donation bought school supplies brought tears to my eyes."' },
              { initials: 'CR', color: 'purple', name: 'Carlos Reyes', role: 'Business Owner, Makati', quote: '"As a business owner, I love how transparent ReliefLink is. I can see exactly how my monthly donations are helping families rebuild their lives."' },
              { initials: 'AL', color: 'green', name: 'Anna Lee', role: 'Nurse in Canada', quote: '"The app makes giving so easy. I set up recurring donations and get updates showing the impact. It\'s like being connected to my community even from abroad."' },
            ].map(({ initials, color, name, role, quote }) => (
              <div className="rl-tcard" key={name}>
                <div className="rl-stars">{'★★★★★'}</div>
                <p>{quote}</p>
                <div className="rl-tcard-author">
                  <div className={`rl-avatar rl-av-${color}`}>{initials}</div>
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
                  <img src="/assets/LOGO.PNG" alt="" className="rl-logo-img" onError={e => e.target.style.display='none'} />
                </div>
                <span className="rl-brand-name">Relief<span>Link</span></span>
              </div>
              <p>Connecting donors with communities in need across the Philippines since 2024.</p>
            </div>
            <div className="rl-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#about">How it works</a>
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
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
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