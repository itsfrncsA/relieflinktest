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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', fontSize: '13.5px' }}>
                <strong style={{ color: '#1e3a8a' }}>Data Privacy & Security Governance Policy:</strong> Official Legal Compliance Document under Republic Act No. 10173 (Data Privacy Act of 2012) • Governing ReliefLink Web & Mobile Platforms.
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>1. Institutional Scope, Legal Mandate & Framework</h3>
                <p style={{ margin: 0 }}>
                  This Data Privacy Policy constitutes a legally binding governance instrument establishing the terms under which ReliefLink—operating in official partnership with Sto. Domingo Parish located at 537 Quezon Avenue, Quezon City, Metro Manila, Philippines—collects, processes, stores, secures, and disposes of personal information. By registering an account, submitting monetary or in-kind donations, applying for beneficiary relief distributions, or interacting with the ReliefLink web portal or mobile applications, you explicitly consent to the data collection and governance protocols defined herein in strict accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations (IRR).
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>2. Categories of Information Collected & Operational Necessity</h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  ReliefLink adheres strictly to the principle of data minimization. We collect only personal data that is directly necessary, proportionate, and legitimate for conducting transparent disaster relief governance:
                </p>
                <ul style={{ paddingLeft: '22px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Personal Identification Data:</strong> Full legal name, verified email address, contact telephone/mobile numbers, user account role designation, and encrypted authentication security credentials.</li>
                  <li><strong>Financial & Donation Transaction Data:</strong> Contribution amounts, designated relief project funds, payment channel selections (GCash, Maya, Bank Transfer, QR Code, Cash), official transaction reference numbers, date/time stamps, and uploaded digital proof-of-payment receipt images.</li>
                  <li><strong>Beneficiary & Scholar Assessment Data:</strong> Barangay and parish sector affiliations, household income disclosures, course/program enrollments, academic performance metrics (GWA), and official vulnerability verification documentation.</li>
                  <li><strong>Technical Telemetry Data:</strong> IP addresses, browser user-agent strings, device hardware model identifiers, operating system versions, and system event logs captured strictly for security auditing and threat prevention.</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>3. Specific Purposes of Data Processing & Legal Bases</h3>
                <p style={{ margin: 0 }}>
                  Collected data is processed exclusively for non-profit, legitimate, and declared humanitarian objectives: (a) verifying monetary and in-kind donation receipts submitted by donors; (b) generating verified digital certificates of appreciation and audit receipts; (c) coordinating humanitarian supply distribution (food packs, medical kits, scholar stipends) across Sto. Domingo Parish community sectors; (d) generating real-time audit reports for internal church finance councils and independent auditors; and (e) defending system infrastructure against unauthorized access or fraud.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>4. Non-Disclosure & Absolute Prohibition of Commercial Exploitation</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink enforces a strict, unyielding zero-commercialization guarantee. Personal information collected through our web or mobile applications shall NEVER be sold, leased, rented, commercialized, traded, or shared with commercial entities, marketing networks, advertising agencies, or third-party data brokers under any circumstances. Personal data is disclosed only to authorized Sto. Domingo Parish relief coordinators bound by non-disclosure legal duties or when required by statutory law enforcement court orders.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>5. Blockchain Financial Audit Consensus & Privacy Safeguards</h3>
                <p style={{ margin: 0 }}>
                  To guarantee 100% financial transparency without violating personal privacy rights, ReliefLink utilizes private Ethereum / Hyperledger Besu smart contract consensus logging. Only non-sensitive transactional metadata—such as allocation amounts, fund project codes, and cryptographic SHA-256 hashes—are committed on-chain for open public and auditor inspection. Personally Identifiable Information (PII), such as full names, phone numbers, and receipt images, is kept strictly isolated off-chain on encrypted parish local database servers.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>6. Comprehensive Technical Security & Encryption Architecture</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink employs robust multi-layered technical, organizational, and physical security measures to protect data against unauthorized disclosure, alteration, loss, or destruction. All data in transit is protected using TLS 1.3 cryptographic protocols. Passwords are encrypted using salted bcrypt hashing algorithms. Administrative access requires JSON Web Token (JWT) authorization with role-based access control (RBAC) enforcing least-privilege principles across all server endpoints.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>7. Password Complexity Requirements & Account Security Governance</h3>
                <p style={{ margin: 0 }}>
                  To protect user accounts against credential stuffing and brute-force intrusions, registered passwords must meet strict complexity rules (minimum length, uppercase/lowercase letters, numeric digits, and approved special symbols). Passwords must not contain spaces or forbidden symbols (<code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>&lt; &gt; " : ; ' / | &#123; &#125; [ ] ( ) - + =</code>). Users must immediately notify parish security officers upon suspecting any unauthorized account activity.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>8. Data Retention, Archival & Secure Disposal Schedules</h3>
                <p style={{ margin: 0 }}>
                  Personal and transactional records are retained strictly for the duration necessary to fulfill declared humanitarian purposes and comply with statutory accounting and auditing retention mandates governed by Philippine law. Upon expiration of applicable retention periods, physical and electronic records are permanently anonymized or destroyed using secure cryptographic data-wiping techniques.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>9. Statutory Rights of Data Subjects (Republic Act No. 10173)</h3>
                <p style={{ margin: 0 }}>
                  Pursuant to the Data Privacy Act of 2012, data subjects possess enforceable rights regarding their personal data: (a) Right to be Informed of data processing scope; (b) Right to Access personal records; (c) Right to Object to processing; (d) Right to Rectify inaccurate or outdated entries; (e) Right to Erasure or Blocking subject to statutory parish audit mandates; and (f) Right to Lodge Complaints before the National Privacy Commission (NPC).
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>10. Proof of Payment Authenticity & Anti-Fraud Inspection</h3>
                <p style={{ margin: 0 }}>
                  All uploaded proof-of-payment receipt files undergo automated and manual authenticity verification. Submitting fabricated, photoshopped, altered, or duplicate transaction receipts violates system governance, causing immediate permanent account termination, IP address blacklisting, and referral to civil and criminal law enforcement under the Cybercrime Prevention Act of 2012 (RA 10175).
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>11. Role-Based Administrative Accountability & Non-Disclosure Duties</h3>
                <p style={{ margin: 0 }}>
                  Access to user management records, scholar financial details, and receipt attachments is restricted strictly to authorized Sto. Domingo Parish administrators and relief desk personnel. All administrative staff execute binding Non-Disclosure Agreements (NDAs) and are subject to continuous system access telemetry monitoring.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>12. Third-Party Payment Channel Disclaimers</h3>
                <p style={{ margin: 0 }}>
                  Payment transactions processed through external financial providers—such as GCash, Maya, QR Ph, or banking institution online transfer portals—are subject to the respective privacy policies and security frameworks of those financial institutions. ReliefLink does not store credit card numbers or banking PINs and assumes no liability for processing failures occurring within third-party payment gateways.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>13. Local Session Storage & Zero Advertising Trackers</h3>
                <p style={{ margin: 0 }}>
                  The ReliefLink web application utilizes browser LocalStorage and essential session tokens strictly for user authentication session persistence and security state maintenance. ReliefLink contains zero commercial advertising trackers, third-party remarketing pixels, or behavioral analytics cookies.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>14. Modifications, Amendments & Policy Notification Protocols</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink reserves the right to amend, update, or modify this Data Privacy Policy at any time to reflect updates in legal requirements or system technical enhancements. Material revisions will be prominently announced on the web portal header and mobile application notification dashboards. Continued platform interaction constitutes binding acceptance of updated policies.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>15. Data Protection Officer Contact & Regulatory Inquiries</h3>
                <p style={{ margin: 0 }}>
                  For inquiries, formal data subject access requests, or privacy concerns, please contact the Data Protection Desk at: Relief Operations Center, Sto. Domingo Parish, 537 Quezon Avenue, Quezon City, Metro Manila, Philippines. Email: <a href="mailto:privacy@relieflink.org" style={{ color: '#2563eb', textDecoration: 'none' }}>privacy@relieflink.org</a>.
                </p>
              </div>
            </div>
          )}

          {activeModal === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', fontSize: '13.5px' }}>
                <strong style={{ color: '#1e3a8a' }}>Terms of Service & Institutional Operating Governance:</strong> Official 15-Section Legal Operating Policy Governing ReliefLink Web & Mobile Applications • Sto. Domingo Parish Partner Hub.
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>1. Acceptance of Terms, Institutional Scope & Binding Agreement</h3>
                <p style={{ margin: 0 }}>
                  Welcome to ReliefLink, the official community disaster relief governance and donation management platform operating in partnership with Sto. Domingo Parish (537 Quezon Avenue, Quezon City, Philippines). By accessing, registering an account, browsing, or utilizing our web and mobile applications, you acknowledge that you have read, understood, and agreed to be legally bound by these 15-Section Terms of Service and our Data Privacy Policy. If you do not accept these terms, you must immediately cease all use of the platform.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>2. User Identity Verification, Age Eligibility & Registration Warranties</h3>
                <p style={{ margin: 0 }}>
                  Users registering an account on ReliefLink warrant that all registration information submitted—including full legal name, active mobile number, and valid email address—is truthful, current, and verifiable. Registration using fake identities, temporary disposable emails, or unauthorized pseudonyms is strictly prohibited. Registrants must be at least 18 years of age or authorized by a parent or legal guardian to submit monetary contributions or relief assistance applications.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>3. Account Credentials Safeguards & Password Complexity Rules</h3>
                <p style={{ margin: 0 }}>
                  You are solely responsible for maintaining the strict confidentiality of your account credentials (email and password). Passwords must meet security complexity standards (minimum length, uppercase/lowercase letters, numbers, and special symbols) and must NOT contain spaces or forbidden symbols (<code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>&lt; &gt; " : ; ' / | &#123; &#125; [ ] ( ) - + =</code>). You agree to notify parish administrators immediately upon discovering any unauthorized account access.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>4. Fiduciary Fund Allocation, Non-Profit Operation & Relief Goods Integrity</h3>
                <p style={{ margin: 0 }}>
                  All monetary contributions made via GCash, Maya, Bank Transfer, QR Ph, or direct cash, as well as in-kind disaster relief goods (canned goods, rice, hygiene kits, medical supplies), are allocated strictly to verified Sto. Domingo Parish calamity response operations, scholar financial aid stipends, and community volunteer apostolates. ReliefLink operates on a 100% non-profit humanitarian basis with zero commercial administrative fee deductions or profit markups.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>5. Proof of Payment Verification, Anti-Fraud Protocols & Legal Penalties</h3>
                <p style={{ margin: 0 }}>
                  Donors are required to provide authentic transaction reference numbers and valid proof-of-payment receipts. Submitting fake, altered, photoshopped, or duplicate payment screenshots constitutes fraud and is strictly prohibited. Any fraudulent submission will result in immediate permanent account termination, IP address blacklisting, and formal referral to civil and criminal prosecution under the Cybercrime Prevention Act of 2012 (RA 10175) and the Revised Penal Code.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>6. Non-Refundability Policy & Irrevocable Disaster Emergency Commitments</h3>
                <p style={{ margin: 0 }}>
                  Monetary donations processed and verified through ReliefLink are committed immediately to real-time emergency relief purchasing, food pack assembly, medical aid deployment, or educational scholar disbursements. Consequently, all verified monetary donations are final, irrevocable, and non-refundable once committed to active relief project channels.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>7. Blockchain Audit Consensus, Smart Contracts & Immutable Ledger</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink implements immutable smart contract transaction logging (Hyperledger Besu / private Ethereum ledger consensus) to guarantee complete financial transparency. Non-sensitive transactional metadata and cryptographic verification hashes are committed on-chain for open public and auditor verification. Sensitive personal information remains strictly protected on secure local parish servers.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>8. Data Privacy Compliance (Republic Act No. 10173)</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink strictly adheres to the Philippine Data Privacy Act of 2012 (RA 10173). Personal data collected—including donor names, contact details, transaction records, and proof-of-payment receipts—is processed exclusively for legitimate service delivery, donation verification, recipient aid distribution, and parish auditing. Personal data will never be sold, rented, or commercialized under any circumstances.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>9. Advanced Security Architecture, TLS 1.3 Cryptography & Access Control</h3>
                <p style={{ margin: 0 }}>
                  All network communication is secured using TLS 1.3 encryption protocols. User passwords are stored using salted cryptographic bcrypt hashing algorithms. Administrative API endpoints require JWT authorization tokens with strict role-based access control (RBAC) enforcing least-privilege principles across all server endpoints.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>10. Acceptable System Use & Technical Safeguards</h3>
                <p style={{ margin: 0 }}>
                  Users agree not to engage in any activity that compromises platform integrity, including: (a) attempting unauthorized access to administrative or database endpoints; (b) reverse engineering or decompiling application binaries; (c) injecting malicious scripts (SQL/XSS); (d) submitting false relief requests or fraudulent scholar credentials; or (e) transmitting automated spam or bot traffic.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>11. Administrator Fiduciary Accountability & Audit Telemetry</h3>
                <p style={{ margin: 0 }}>
                  Parish administrators, relief staff, and volunteer coordinators with access to management dashboards are held to strict fiduciary and ethical standards. Any unauthorized manipulation of relief inventory, scholar stipends, or financial ledger logs is immutably recorded by audit telemetry and subject to immediate administrative disciplinary action and legal recourse.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>12. Beneficiary Verification & Sector Aid Governance</h3>
                <p style={{ margin: 0 }}>
                  Aid recipients, scholar stipend applicants, and sector beneficiaries must submit authentic documentation for verification by authorized Sto. Domingo Parish community coordinators. Misrepresentation of economic status, household income, or calamity displacement results in immediate revocation of aid eligibility.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>13. Humanitarian Service Disclaimers & Third-Party Gateway Limitations</h3>
                <p style={{ margin: 0 }}>
                  ReliefLink operates on a non-profit humanitarian basis to support disaster-stricken communities. While we strive to maintain uninterrupted service availability, ReliefLink is not liable for temporary service interruptions caused by telecom network outages, scheduled server maintenance, or delays originating from third-party payment channels (such as GCash or financial institution gateways).
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>14. Intellectual Property Rights & System Ownership</h3>
                <p style={{ margin: 0 }}>
                  All software source code, database architectures, user interface designs, ReliefLink logos, branding assets, and official parish relief documentation are the exclusive intellectual property of ReliefLink and Sto. Domingo Parish. Unauthorized copying, distribution, re-branding, or commercial exploitation is strictly prohibited without explicit written consent.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>15. Policy Amendments, Governing Law & Quezon City Jurisdiction</h3>
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
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>+63 9754703724</div>
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
