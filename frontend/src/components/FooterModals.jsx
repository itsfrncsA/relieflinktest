import React, { useState } from 'react';

const FooterModals = ({ activeModal, onClose }) => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  if (!activeModal) return null;

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      onClose();
    }, 2200);
  };

  return (
    <div 
      className="rl-modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'rlFadeIn 0.25s ease'
      }}
    >
      <div 
        className="rl-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: activeModal === 'contact' ? '560px' : '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          animation: 'rlSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          color: '#0f172a',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeModal === 'privacy' && (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              {activeModal === 'terms' && (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {activeModal === 'contact' && (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Service'}
                {activeModal === 'contact' && 'Contact Relief Operations'}
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '600' }}>
                ReliefLink • Sto. Domingo Parish Partner Hub
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '24px 28px',
          overflowY: 'auto',
          fontSize: '14px',
          lineHeight: '1.65',
          color: '#334155'
        }}>
          {activeModal === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', fontSize: '13px' }}>
                <strong style={{ color: '#1e3a8a' }}>Data Privacy & Security Governance Policy:</strong> Compliant with Republic Act No. 10173 (Data Privacy Act of 2012) • ReliefLink Web & Mobile Applications.
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>1. Scope & Legal Institutional Framework</h3>
                <p style={{ margin: 0 }}>
                  This Data Privacy Policy governs all data collection, processing, and storage practices across the ReliefLink platform operating in partnership with Sto. Domingo Parish (537 Quezon Avenue, Quezon City, Philippines). By accessing or using the platform, users consent to the data governance terms set forth herein in compliance with Philippine Data Privacy laws.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>2. Categories of Information Collected</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink collects only data essential for humanitarian relief operations and financial transparency:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', marginBottom: 0 }}>
                  <li><strong>Account Data:</strong> Full legal name, verified email address, mobile phone number, and encrypted authentication tokens.</li>
                  <li><strong>Transaction & Payment Data:</strong> Donation amounts, payment channels (GCash, Maya, Bank Transfer, QR, Cash), transaction reference numbers, and uploaded proof-of-payment receipts.</li>
                  <li><strong>Beneficiary Records:</strong> Parish sector affiliations, scholar verification documents, and calamity assistance distribution logs.</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>3. Specific Purposes of Data Processing</h3>
                <p style={{ margin: 0 }}>
                  Personal data collected is utilized strictly for non-profit humanitarian relief management, including: (a) verifying monetary and in-kind donation submissions; (b) issuing digital certificates of appreciation and audit receipts; (c) tracking aid allocation across Sto. Domingo Parish community sectors; and (d) generating real-time audit reports for parish oversight.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>4. Non-Disclosure & Commercial Non-Exploitation</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink maintains a strict zero-commercialization policy. Personal data will never be sold, rented, leased, or traded to third-party commercial entities, marketing networks, or data brokers under any circumstances.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>5. Blockchain Financial Transparency & Privacy Safeguards</h3>
                <p style={{ margin: 0 }}>
                  Financial auditing is logged immutably using private Ethereum / Hyperledger Besu smart contract consensus. To protect individual privacy, only non-sensitive transactional metadata and cryptographic verification hashes are committed on-chain. Personally identifiable information (PII) is kept strictly off-chain on encrypted parish servers.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>6. Data Security, Cryptography & Encryption Standards</h3>
                <p style={{ margin: 0 }}>
                  All network communication is secured using TLS 1.3 encryption protocols. User passwords are encrypted using salted bcrypt hashing algorithm. Administrative API endpoints require JWT authorization tokens with strict role-based access control (RBAC) to prevent unauthorized access.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>7. Password Complexity & Security Rules</h3>
                <p style={{ margin: 0 }}>
                  To prevent unauthorized account compromise, passwords must meet complexity standards and cannot contain spaces or forbidden symbols (<code style={{ background: '#f1f5f9', padding: '2px 5px', borderRadius: '4px' }}>&lt; &gt; " : ; ' / | &#123; &#125; [ ] ( ) - + =</code>).
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>8. Data Retention & Archival Policies</h3>
                <p style={{ margin: 0 }}>
                  Personal and transactional records are retained in compliance with statutory audit standards mandated by Philippine law and parish financial accountability rules. Inactive or expired account records are securely archived or anonymized after retention periods elapse.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>9. Rights of Data Subjects (Republic Act No. 10173)</h3>
                <p style={{ margin: 0 }}>
                  Under RA 10173, registered users possess explicit rights to: (a) be informed of data processing activities; (b) request access to personal records; (c) rectify inaccurate data; and (d) object to processing or request account deletion subject to statutory audit requirements.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>10. Proof of Payment Integrity & Fraud Prevention</h3>
                <p style={{ margin: 0 }}>
                  All uploaded proof-of-payment receipt files are scanned for authenticity. Submitting fake, altered, or photoshopped transaction receipts violates system security policies and triggers immediate account termination and legal reporting.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>11. Role-Based Administrative Access Control</h3>
                <p style={{ margin: 0 }}>
                  Access to user details and receipt attachments is restricted strictly to authorized parish administrators and relief desk personnel who are bound by confidentiality non-disclosure agreements.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>12. Third-Party Payment Gateway Disclaimer</h3>
                <p style={{ margin: 0 }}>
                  Payment transactions processed through external financial providers (GCash, Maya, or online bank transfer portals) are governed by their respective privacy terms. ReliefLink is not responsible for data processing on external third-party payment gateways.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>13. Cookies & Local Session Storage</h3>
                <p style={{ margin: 0 }}>
                  The ReliefLink web app utilizes browser LocalStorage and essential session tokens strictly for user authentication session persistence. No third-party tracking cookies or behavioral advertising pixels are embedded.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>14. Policy Updates & Notification</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink reserves the right to amend this Data Privacy Policy at any time. Material changes will be announced on the web portal and mobile application dashboards.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>15. Data Protection Contact & Inquiries</h3>
                <p style={{ margin: 0 }}>
                  For data privacy inquiries, record requests, or rights concerns, contact the Data Protection Desk at Sto. Domingo Parish, 537 Quezon Avenue, Quezon City, Philippines.
                </p>
              </div>
            </div>
          )}

          {activeModal === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', fontSize: '13px' }}>
                <strong style={{ color: '#1e3a8a' }}>Terms of Service & Data Protection Governance:</strong> Official 15-Section Operating Policy for ReliefLink • Sto. Domingo Parish Partner Hub.
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>1. Acceptance of Terms & Institutional Scope</h3>
                <p style={{ margin: 0 }}>
                  Welcome to ReliefLink, the official community disaster relief governance and donation management system operating in partnership with Sto. Domingo Parish (537 Quezon Avenue, Quezon City, Philippines). By accessing, registering an account, or utilizing our web and mobile applications, you acknowledge that you have read, understood, and agreed to be legally bound by these 15-Section Terms and Conditions, as well as our Data Privacy Policy. If you do not accept these terms, you must refrain from accessing or using the platform.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>2. User Identity Verification & Eligibility Standards</h3>
                <p style={{ margin: 0 }}>
                  Users registering an account on ReliefLink must provide accurate, verifiable, and complete information upon registration, including full legal name, active email address, and valid mobile phone number. Registration using fake identities, temporary throwaway emails, or unauthorized pseudonyms is strictly prohibited. Users must be at least 18 years of age or authorized by a legal guardian to submit monetary or in-kind donations.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>3. Account Security Credentials & Password Rules</h3>
                <p style={{ margin: 0 }}>
                  You are solely responsible for maintaining the confidentiality of your account credentials (email and password). Passwords must satisfy security complexity requirements (minimum length, uppercase/lowercase letters, numbers, and special symbols) and must not contain spaces or forbidden symbols (<code style={{ background: '#f1f5f9', padding: '2px 5px', borderRadius: '4px' }}>&lt; &gt; " : ; ' / | &#123; &#125; [ ] ( ) - + =</code>). You agree to notify administrators immediately of any suspected security breaches or unauthorized account access.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>4. Fiduciary Allocation & Relief Donation Integrity</h3>
                <p style={{ margin: 0 }}>
                  All monetary contributions made via GCash, Maya, Bank Transfer, QR Code, or direct cash, as well as in-kind disaster relief goods, are allocated strictly to verified parish relief operations, calamity assistance, scholar aid programs, and community volunteer apostolates. ReliefLink and Sto. Domingo Parish operate on a 100% non-profit humanitarian basis with zero commercial administrative fee deductions.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>5. Proof of Payment & Prohibition of Fraudulent Claims</h3>
                <p style={{ margin: 0 }}>
                  Donors are required to provide authentic transaction reference numbers and valid proof-of-payment receipts. Submitting fake, altered, photoshopped, or duplicate payment screenshots is strictly prohibited and constitutes fraud. Any fraudulent submission will result in immediate permanent account termination, IP address banning, and formal reporting to law enforcement authorities under Philippine cybercrime statutes.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>6. Non-Refundability & Irrevocable Fund Commitment</h3>
                <p style={{ margin: 0 }}>
                  Monetary donations processed and verified through ReliefLink are immediately committed to active emergency relief purchasing, food pack assembly, medical aid deployment, or educational scholar disbursements. Consequently, all verified monetary donations are final, irrevocable, and non-refundable once processed by the system.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>7. Blockchain Audit Consensus & Immutable Ledger</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink implements immutable smart contract transaction logging (Hyperledger Besu / private Ethereum ledger consensus) to guarantee complete financial transparency. Non-sensitive transactional metadata and cryptographic verification hashes are committed on-chain for public and auditor verification. Sensitive personal information remains strictly protected on secure local parish servers.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>8. Data Privacy Compliance (Republic Act No. 10173)</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink strictly adheres to the Philippine Data Privacy Act of 2012 (RA 10173). Personal data collected—including donor names, contact details, transaction records, and proof-of-payment receipts—is processed exclusively for legitimate service delivery, donation verification, recipient aid distribution, and parish auditing. Personal data will never be sold, rented, or commercialized.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>9. Data Encryption & Industry Security Protocols</h3>
                <p style={{ margin: 0 }}>
                  All network communication is encrypted using TLS 1.3 encryption protocols. User passwords are stored using salted cryptographic bcrypt hashing algorithm. Administrative API endpoints require JWT authentication tokens with strict role-based access control (RBAC). Data storage servers are protected behind active firewalls and periodic security auditing.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>10. Acceptable System Use & Technical Integrity Safeguards</h3>
                <p style={{ margin: 0 }}>
                  Users agree not to engage in any activity that compromises platform integrity, including: (a) attempting unauthorized access to administrative or database endpoints; (b) reverse engineering or decompiling application binaries; (c) injecting malicious scripts (SQL/XSS); (d) submitting false relief requests or fraudulent scholar credentials; or (e) transmitting automated spam or bot traffic.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>11. Administrator & Relief Staff Fiduciary Standards</h3>
                <p style={{ margin: 0 }}>
                  Parish administrators, relief staff, and volunteer coordinators with access to management dashboards are held to strict fiduciary and ethical standards. Any unauthorized manipulation of relief inventory, scholar stipends, or financial ledger logs is immutably recorded by audit telemetry and subject to immediate administrative disciplinary action and legal recourse.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>12. Beneficiary Verification & Sector Aid Governance</h3>
                <p style={{ margin: 0 }}>
                  Aid recipients, scholar stipend applicants, and sector beneficiaries must submit authentic documentation for verification by authorized Sto. Domingo Parish community coordinators. Misrepresentation of economic status, household income, or calamity displacement results in immediate revocation of aid eligibility.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>13. Service Disclaimers & Third-Party Gateway Limitations</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink operates on a non-profit humanitarian basis to support disaster-stricken communities. While we strive to maintain uninterrupted service availability, ReliefLink is not liable for temporary service interruptions caused by telecom network outages, scheduled server maintenance, or delays originating from third-party payment channels (such as GCash or financial institution gateways).
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>14. Intellectual Property & System Ownership</h3>
                <p style={{ margin: 0 }}>
                  All software source code, database architectures, user interface designs, ReliefLink logos, branding assets, and official parish relief documentation are the exclusive intellectual property of ReliefLink and Sto. Domingo Parish. Unauthorized copying, distribution, re-branding, or commercial exploitation is strictly prohibited without explicit written consent.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>15. Policy Amendments, Governing Law & Jurisdiction</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink reserves the right to modify or replace these 15-Section Terms of Service at any time. Notice of significant policy updates will be posted within the application. These terms are governed by and construed in accordance with the laws of the Republic of the Philippines. Any legal action or proceeding shall be submitted exclusively to the competent courts of Quezon City, Metro Manila. Official Contact: Relief Operations Desk, Sto. Domingo Parish, 537 Quezon Avenue, Quezon City, Philippines.
                </p>
              </div>
            </div>
          )}

          {activeModal === 'contact' && (
            <div>
              {contactSent ? (
                <div style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: '16px'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px auto'
                  }}>
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#166534', margin: '0 0 6px 0' }}>Message Received</h3>
                  <p style={{ fontSize: '13.5px', color: '#15803d', margin: 0 }}>
                    Thank you for reaching out! The Sto. Domingo Parish Relief desk has received your inquiry and will respond shortly.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Parish Info Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#2563eb' }}>Parish Relief Desk</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>Sto. Domingo Church Hub</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#2563eb' }}>Direct Hotline</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>+63 (02) 8712-6271</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#2563eb' }}>Email Inquiries</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>relief@relieflink.org</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#2563eb' }}>Operations Hours</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>8:00 AM – 5:00 PM (24/7 during calamity alerts)</div>
                    </div>
                  </div>

                  {/* Quick Inquiry Form */}
                  <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>Your Name *</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Juan dela Cruz"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '13.5px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>Email Address *</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="juan@example.com"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '13.5px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>Subject</label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        placeholder="Donation Inquiry / Volunteer / Calamity Assistance"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>Message *</label>
                      <textarea
                        required
                        rows="3"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="How can our parish relief team help you?"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13.5px',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '12px 20px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 18px rgba(37, 99, 235, 0.25)',
                        transition: 'all 0.2s'
                      }}
                    >
                      Send Message to Relief Desk
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#f8fafc'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 22px',
              borderRadius: '999px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FooterModals;
