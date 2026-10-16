import React, { useState } from 'react';

const RecordDonationModal = ({
  showRecordDonationModal,
  setShowRecordDonationModal,
  sectors,
  handleRecordDonation
}) => {
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Direct Cash');
  const [destination, setDestination] = useState('Parish General Fund');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!showRecordDonationModal) return null;

  const handleClose = () => {
    setDonorName('');
    setIsAnonymous(false);
    setAmount('');
    setPaymentMethod('Direct Cash');
    setDestination('Parish General Fund');
    setNotes('');
    setShowRecordDonationModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAnonymous) {
      const trimmedName = donorName.trim();
      if (!trimmedName) {
        alert('Please enter donor full name');
        return;
      }
      if (/\d/.test(trimmedName)) {
        alert('Donor name cannot contain numbers. Please enter a valid name.');
        return;
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    setSubmitting(true);
    await handleRecordDonation({
      donorName: isAnonymous ? 'Anonymous' : (donorName.trim() || 'Anonymous'),
      amount: parseFloat(amount),
      paymentMethod: 'Direct Cash',
      destination,
      referenceNumber: `CASH-${Date.now().toString().slice(-6)}`,
      notes: notes.trim(),
      status: 'cash on hand',
      verificationStatus: 'cash on hand',
      remainingBalance: 0
    });
    setSubmitting(false);
    handleClose();
  };

  return (
    <div className="dashboard-modal-overlay" onClick={handleClose}>
      <div
        className="dashboard-modal"
        style={{
          maxWidth: '560px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="dashboard-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="dashboard-modal-title">
                Record Direct Cash Contribution
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>
                Manually record over-the-counter direct cash donations &amp; proofs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div
            className="dashboard-modal-content"
            style={{
              padding: '16px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto',
              flex: 1
            }}
          >
            {/* Donor Name & Anonymous Toggle */}
            <div className="dashboard-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="dashboard-label" style={{ margin: 0, fontWeight: '600', fontSize: '12px', color: '#334155' }}>
                  Donor Full Name *
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Mark as Anonymous
                </label>
              </div>
              <input
                type="text"
                placeholder={isAnonymous ? "Anonymous Donor" : "e.g., Juan Dela Cruz / Dela Cruz Family"}
                value={isAnonymous ? "" : donorName}
                disabled={isAnonymous}
                onChange={(e) => setDonorName(e.target.value)}
                className="dashboard-input"
                style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}
                required={!isAnonymous}
              />
            </div>

            {/* Amount and Payment Method in 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
                  Donation Amount (PHP) *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="dashboard-input"
                  style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}
                  required
                />
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
                  Payment Method
                </label>
                <div style={{
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: '600'
                }}>
                  Direct Cash
                </div>
              </div>
            </div>

            {/* Restricted Ministry Destination */}
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
                Restricted Ministry Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="dashboard-select"
                style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}
              >
                <option value="Parish General Fund">Parish General Fund</option>
                {sectors && sectors.length > 0 ? (
                  sectors.map(s => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))
                ) : (
                  <>
                    <option value="LGBTQ">LGBTQ</option>
                    <option value="Elderly">Elderly</option>
                    <option value="PDL">PDL</option>
                    <option value="Urban Poor">Urban Poor</option>
                    <option value="Migrant">Migrant</option>
                    <option value="Student Scholarships">Student Scholarships</option>
                    <option value="Drug Rehabilitation">Drug Rehabilitation</option>
                  </>
                )}
              </select>
            </div>

            {/* Notes / Mass Intentions */}
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
                Mass Intention / Notes / Donor Remarks
              </label>
              <textarea
                placeholder="e.g. Thanksgiving for birthday, in memory of Maria Dela Cruz, scholarship sponsor..."
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="dashboard-input"
                style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Centered Record Contribution Action */}
          <div className="dashboard-modal-footer" style={{ justifyContent: 'center' }}>
            <button
              type="submit"
              disabled={submitting}
              className="dashboard-submit-btn"
              style={{
                width: '100%',
                maxWidth: '280px',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                padding: '12px 24px',
                fontSize: '14px',
                borderRadius: '10px'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {submitting ? 'Recording...' : 'Record Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordDonationModal;
