import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../api';

const DonationDetailsModal = ({
  selectedDonation,
  setSelectedDonation,
  deleteDonation,
  getReceiptUrl,
  currentUser,
  fetchDonations,
  setMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [statusVal, setStatusVal] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedDonation) {
      setIsEditing(false);
      const currentSt = (selectedDonation.verificationStatus || selectedDonation.status || 'pending').toLowerCase();
      // default selection when editing (first available alternative)
      if (currentSt === 'pending') setStatusVal('approved');
      else if (currentSt === 'approved') setStatusVal('rejected');
      else setStatusVal('approved');
    }
  }, [selectedDonation]);

  if (!selectedDonation) return null;

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const pmLower = (selectedDonation.paymentMethod || '').toLowerCase();
  const isCashDonation = pmLower.includes('cash') || pmLower === 'direct' || pmLower === 'manual' || !pmLower;
  const canEdit = isSuperAdmin && isCashDonation;

  const currentStatus = (selectedDonation.verificationStatus || selectedDonation.status || 'pending').toLowerCase();

  // 2 choices only, excluding current status
  const availableStatusChoices = ['approved', 'pending', 'rejected'].filter(s => s !== currentStatus);

  const handleSaveStatus = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Authentication session expired. Please log in again.');
      return;
    }

    try {
      setSaving(true);
      const res = await axios.put(
        `${API_URL}/donations/${selectedDonation._id}`,
        { status: statusVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.donation || { ...selectedDonation, status: statusVal, verificationStatus: statusVal };
      setSelectedDonation(updated);
      setIsEditing(false);

      if (fetchDonations) await fetchDonations();
      if (setMessage) {
        setMessage(`Donation status updated to ${statusVal.toUpperCase()}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating donation status:', err);
      alert('Failed to update donation status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-modal-overlay" onClick={() => setSelectedDonation(null)}>
      <div className="dashboard-modal" style={{ maxWidth: '720px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-modal-header" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="dashboard-modal-title">Donation Details &amp; Receipt</h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>Verified contribution record &amp; audit data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDonation(null)}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="dashboard-modal-content" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
            {/* Column 1 */}
            <div>
              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Donor Name:</strong><br />
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{selectedDonation.donorName || 'Anonymous Donor'}</span>
              </p>

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Donation Amount:</strong><br />
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>₱{selectedDonation.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </p>

              {selectedDonation.feeAmount > 0 && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Gateway Processing Fee:</strong><br />
                  <span>₱{selectedDonation.feeAmount?.toFixed(2)} (Paid by Donor)</span>
                  {selectedDonation.grossAmount && (
                    <span style={{ display: 'block', fontSize: '12px', color: '#475569' }}>Total Charged: ₱{selectedDonation.grossAmount?.toFixed(2)}</span>
                  )}
                </p>
              )}

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Payment Method:</strong><br />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{selectedDonation.paymentMethod || 'Cash'}</span>
              </p>

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Restricted Ministry Destination:</strong><br />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>{selectedDonation.destination || 'Parish General Fund'}</span>
              </p>
            </div>

            {/* Column 2 */}
            <div>
              {/* Status with Super Admin edit icon */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Status:</strong>
                  {canEdit && !isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                      title="Edit status (Super Admin)"
                    >
                      <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                      className="dashboard-select"
                      style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', width: 'auto' }}
                    >
                      {availableStatusChoices.map(c => (
                        <option key={c} value={c}>{c.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className={`status-badge ${currentStatus}`} style={{ display: 'inline-block', marginTop: '2px', textTransform: 'uppercase', fontWeight: '800' }}>
                    {currentStatus}
                  </span>
                )}
              </div>

              {selectedDonation.referenceNumber && (
                <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Reference / Checkout ID:</strong><br />
                  <code style={{ fontSize: '13px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#334155' }}>{selectedDonation.referenceNumber}</code>
                </p>
              )}

              {selectedDonation.paymentId && (
                <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>PayMongo Payment ID:</strong><br />
                  <code style={{ fontSize: '13px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#334155' }}>{selectedDonation.paymentId}</code>
                </p>
              )}

              {selectedDonation.blockId && (
                <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Blockchain ID:</strong><br />
                  <span className="blockchain-badge" title="Cryptographically secured on blockchain" style={{ marginLeft: 0, marginTop: '4px' }}>
                    {selectedDonation.blockId}
                  </span>
                </p>
              )}

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Date &amp; Time:</strong><br />
                <span style={{ fontSize: '13px', color: '#475569' }}>{new Date(selectedDonation.paidAt || selectedDonation.createdAt).toLocaleString()}</span>
              </p>

              {selectedDonation.notes && (
                <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Notes / Mass Intention:</strong><br />
                  <span style={{ fontSize: '13px', color: '#334155' }}>{selectedDonation.notes}</span>
                </p>
              )}
            </div>
          </div>

          {/* Verification Status Details */}
          {(selectedDonation.verificationStatus === 'approved' || selectedDonation.verificationStatus === 'rejected') && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '20px', borderLeft: `4px solid ${selectedDonation.verificationStatus === 'approved' ? '#16a34a' : '#dc2626'}` }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification Log</h4>
              {selectedDonation.verifiedBy && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Verified By:</strong> {selectedDonation.verifiedBy}</p>
              )}
              {selectedDonation.verificationDate && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Verified At:</strong> {new Date(selectedDonation.verificationDate).toLocaleString()}</p>
              )}
              {selectedDonation.verificationNotes && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Admin Notes:</strong> {selectedDonation.verificationNotes}</p>
              )}
              {selectedDonation.rejectionReason && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Rejection Reason:</strong> {selectedDonation.rejectionReason}</p>
              )}
            </div>
          )}

          {/* Receipt Preview */}
          {(selectedDonation.receiptPath || selectedDonation.receiptUrl || selectedDonation.proofImage) ? (
            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proof of Donation Receipt</h4>
              <div style={{ width: '100%', maxHeight: '320px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={getReceiptUrl(selectedDonation.receiptPath || selectedDonation.receiptUrl || selectedDonation.proofImage)}
                  alt="Receipt Proof"
                  style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', cursor: 'pointer' }}
                  onClick={() => window.open(getReceiptUrl(selectedDonation.receiptPath || selectedDonation.receiptUrl || selectedDonation.proofImage), '_blank')}
                  title="Click to view full receipt"
                />
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              No receipt image uploaded for this entry.
            </p>
          )}

          {/* Centered Modal Footer */}
          <div className="dashboard-modal-footer" style={{ justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className="dashboard-submit-btn"
                  style={{ background: '#16a34a' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="dashboard-cancel-btn"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="dashboard-submit-btn"
                style={{ background: '#2563eb', padding: '10px 24px' }}
                onClick={() => {
                  const win = window.open('', '_blank');
                  win.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Official Donation Receipt - Sto. Domingo Parish</title>
                        <style>
                          body { font-family: 'Times New Roman', serif; padding: 30px; color: #1c1917; line-height: 1.5; }
                          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
                          .title { font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 0; }
                          .subtitle { font-size: 13px; color: #57534e; margin: 2px 0 0 0; }
                          .receipt-box { border: 1px solid #d6d3d1; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
                          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; border-bottom: 1px dashed #e7e5e4; padding-bottom: 4px; }
                          .amount { font-size: 18px; font-weight: bold; color: #047857; }
                          .footer { font-size: 11px; text-align: center; margin-top: 30px; color: #78716c; border-top: 1px solid #e7e5e4; padding-top: 10px; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div style="font-size: 20px; font-weight: bold; color: #1e3a8a;">Sto. Domingo Parish • Social Action Ministry</div>
                          <div class="subtitle">Parish Treasury, Aid Distribution &amp; Relief Operations</div>
                          <div class="title" style="margin-top: 10px; font-size: 15px;">Official Electronic Donation Acknowledgement Receipt</div>
                        </div>
                        <div class="receipt-box">
                          <div class="row"><strong>Official AR Number:</strong> <span>AR-${selectedDonation._id ? selectedDonation._id.slice(-8).toUpperCase() : 'DIRECT'}</span></div>
                          <div class="row"><strong>Reference / Tracking Code:</strong> <span>${selectedDonation.referenceNumber || 'N/A'}</span></div>
                          <div class="row"><strong>Blockchain Audit Block ID:</strong> <span>${selectedDonation.blockId || 'Verified On-Chain Ledger'}</span></div>
                          <div class="row"><strong>Date &amp; Time:</strong> <span>${new Date(selectedDonation.createdAt).toLocaleString()}</span></div>
                          <div class="row"><strong>Donor / Contributor Name:</strong> <span>${selectedDonation.donorName || 'Anonymous Donor'}</span></div>
                          <div class="row"><strong>Payment Method:</strong> <span>${selectedDonation.paymentMethod || 'Cash'}</span></div>
                          <div class="row"><strong>Restricted Destination / Ministry:</strong> <span>${selectedDonation.destination || 'General Parish Fund'}</span></div>
                          <div class="row" style="border-bottom:none; margin-top:10px;">
                            <strong>Amount Received:</strong>
                            <span class="amount">₱${selectedDonation.amount?.toFixed(2)}</span>
                          </div>
                        </div>
                        <div class="footer">
                          Thank you for your generous support to Sto. Domingo Church Ministries.<br />
                          This serves as an official electronic record of your donation.
                        </div>
                      </body>
                    </html>
                  `);
                  win.document.close();
                  win.print();
                }}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Official AR Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetailsModal;
