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
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [destination, setDestination] = useState('Parish General Fund');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!showRecordDonationModal) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB');
        return;
      }
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProof = () => {
    setProofImage('');
    setProofFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    await handleRecordDonation({
      donorName: isAnonymous ? 'Anonymous' : (donorName.trim() || 'Anonymous'),
      amount: parseFloat(amount),
      paymentMethod,
      destination,
      referenceNumber: referenceNumber.trim() || `CASH-${Date.now().toString().slice(-6)}`,
      notes: notes.trim(),
      proofImage: proofImage || undefined,
      receiptPath: proofImage || undefined,
      receiptFileName: proofFileName || undefined,
      status: 'approved'
    });
    setSubmitting(false);
    setShowRecordDonationModal(false);
    setDonorName('');
    setIsAnonymous(false);
    setAmount('');
    setPaymentMethod('Cash');
    setDestination('Parish General Fund');
    setReferenceNumber('');
    setNotes('');
    setProofImage('');
    setProofFileName('');
  };

  return (
    <div className="dashboard-modal-overlay" onClick={() => setShowRecordDonationModal(false)}>
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
                Record Cash / Direct Contribution
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>
                Manually record over-the-counter cash donations &amp; proofs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRecordDonationModal(false)}
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
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="dashboard-select"
                  style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}
                >
                  <option value="Cash">Direct Cash (Parish Office)</option>
                  <option value="GCash">GCash Manual Transfer</option>
                  <option value="Maya">Maya Manual Transfer</option>
                  <option value="Bank Transfer">Bank Transfer / Deposit</option>
                </select>
              </div>
            </div>

            {/* Restricted Ministry Destination and Reference # in 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
                  Restricted Ministry
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
                      <option value="Senior Citizens">Senior Citizens</option>
                      <option value="Scholars">Scholars</option>
                      <option value="Prison Ministry">Prison Ministry</option>
                      <option value="Persons with Disabilities (PWD)">Persons with Disabilities (PWD)</option>
                      <option value="Solo Parents">Solo Parents</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                    </>
                  )}
                </select>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
                  Acknowledgement Ref #
                </label>
                <input
                  type="text"
                  placeholder="e.g. AR-2026-0042"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="dashboard-input"
                  style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Proof of Donation / Receipt Upload */}
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span>Proof of Donation / Receipt Attachment</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '400' }}>Optional (Max 5MB)</span>
              </label>

              {!proofImage ? (
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}>
                  <input
                    type="file"
                    id="donation-proof-file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="donation-proof-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>
                      Click to Upload Receipt / Proof Image
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      PNG, JPG, WebP, or PDF receipt scan
                    </span>
                  </label>
                </div>
              ) : (
                <div style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    {proofImage.startsWith('data:image') ? (
                      <img
                        src={proofImage}
                        alt="Receipt preview"
                        style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                      />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '6px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '20px', height: '20px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {proofFileName || 'Proof Document Attached'}
                      </p>
                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
                        Ready to save
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveProof}
                    style={{
                      border: 'none',
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              )}
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

          {/* Fixed Pinned Footer Actions */}
          <div className="dashboard-modal-footer">
            <button
              type="button"
              className="dashboard-cancel-btn"
              onClick={() => setShowRecordDonationModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="dashboard-submit-btn"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
