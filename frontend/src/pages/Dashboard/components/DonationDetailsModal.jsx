import React from 'react';

const DonationDetailsModal = ({
  selectedDonation,
  setSelectedDonation,
  getReceiptUrl
}) => {
  if (!selectedDonation) return null;

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="dashboard-modal-header">
          <h3 className="dashboard-modal-title">Donation Details</h3>
          <button
            type="button"
            onClick={() => setSelectedDonation(null)}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="dashboard-modal-content" style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <p className="dashboard-modal-text"><strong>Donor Name:</strong><br />{selectedDonation.donorName}</p>
              <p className="dashboard-modal-text"><strong>Amount:</strong><br /><span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>₱{selectedDonation.amount?.toFixed(2)}</span></p>
              <p className="dashboard-modal-text"><strong>Payment Method:</strong><br />{selectedDonation.paymentMethod || 'Cash'}</p>
              <p className="dashboard-modal-text"><strong>Destination:</strong><br />{selectedDonation.destination || 'General Fund'}</p>
            </div>
            <div>
              <p className="dashboard-modal-text"><strong>Status:</strong><br />
                <span className={`status-badge ${selectedDonation.verificationStatus || selectedDonation.status || 'pending'}`} style={{ display: 'inline-block', marginTop: '4px' }}>
                  {selectedDonation.verificationStatus || selectedDonation.status || 'pending'}
                </span>
              </p>
              {selectedDonation.referenceNumber && (
                <p className="dashboard-modal-text"><strong>Reference Number:</strong><br /><code>{selectedDonation.referenceNumber}</code></p>
              )}
              {selectedDonation.blockId && (
                <p className="dashboard-modal-text"><strong>Blockchain ID:</strong><br />
                  <span className="blockchain-badge" title="Cryptographically secured on blockchain" style={{ marginLeft: 0, marginTop: '4px' }}>
                    {selectedDonation.blockId}
                  </span>
                </p>
              )}
              <p className="dashboard-modal-text"><strong>Date:</strong><br />{new Date(selectedDonation.createdAt).toLocaleString()}</p>
              {selectedDonation.notes && (
                <p className="dashboard-modal-text"><strong>Notes:</strong><br />{selectedDonation.notes}</p>
              )}
            </div>
          </div>

          {/* Verification Status Details */}
          {(selectedDonation.verificationStatus === 'approved' || selectedDonation.verificationStatus === 'rejected') && (
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', marginBottom: '20px', borderLeft: `4px solid ${selectedDonation.verificationStatus === 'approved' ? '#16a34a' : '#dc2626'}` }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Verification Log</h4>
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
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Proof of Donation Receipt</h4>
              <div style={{ width: '100%', maxHeight: '280px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={getReceiptUrl(selectedDonation.receiptPath || selectedDonation.receiptUrl || selectedDonation.proofImage)}
                  alt="Receipt Proof"
                  style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', cursor: 'pointer' }}
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

          <div className="dashboard-modal-buttons" style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="dashboard-verify-btn" 
              onClick={() => {
                const win = window.open('', '_blank');
                win.document.write(`
                  <html>
                    <head>
                      <title>Official Acknowledgement Receipt - Sto. Domingo Parish</title>
                      <style>
                        body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1c1917; }
                        .header { text-align: center; border-bottom: 2px solid #991b1b; padding-bottom: 16px; margin-bottom: 24px; }
                        .title { font-size: 20px; font-weight: bold; color: #991b1b; }
                        .subtitle { font-size: 14px; color: #57534e; }
                        .box { border: 1px solid #e7e5e4; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #fafaf9; }
                        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e7e5e4; }
                        .amount { font-size: 24px; font-weight: bold; color: #166534; }
                        .footer { text-align: center; font-size: 12px; color: #78716c; margin-top: 40px; }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <div class="title">STO. DOMINGO PARISH &amp; NATIONAL SHRINE</div>
                        <div class="subtitle">Social Action Center — Official Acknowledgement Receipt (AR)</div>
                        <div style="font-size:12px; margin-top:4px;">537 Quezon Ave, Sta. Mesa Heights, Quezon City</div>
                      </div>
                      <div class="box">
                        <div class="row"><strong>Receipt No:</strong> <span>AR-${selectedDonation._id?.substring(0,8).toUpperCase()}</span></div>
                        <div class="row"><strong>Date:</strong> <span>${new Date(selectedDonation.createdAt).toLocaleDateString()}</span></div>
                        <div class="row"><strong>Received From (Donor):</strong> <span>${selectedDonation.donorName}</span></div>
                        <div class="row"><strong>Payment Method:</strong> <span>${selectedDonation.paymentMethod || 'Cash'}</span></div>
                        <div class="row"><strong>Restricted Destination / Ministry:</strong> <span>${selectedDonation.destination || 'General Parish Fund'}</span></div>
                        <div class="row" style="border-bottom:none; margin-top:10px;">
                          <strong>Amount Received:</strong>
                          <span class="amount">₱${selectedDonation.amount?.toFixed(2)}</span>
                        </div>
                      </div>
                      <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                        <div>
                          <p style="font-size:12px; margin-bottom:40px;">Received &amp; Verified By:</p>
                          <p style="border-top:1px solid #000; padding-top:4px; font-size:13px; font-weight:bold;">Mr. Edward A. Castro</p>
                          <p style="font-size:11px; color:#57534e;">Social Action Center Coordinator</p>
                        </div>
                        <div>
                          <p style="font-size:12px; margin-bottom:40px;">Parish Representative Signature:</p>
                          <p style="border-top:1px solid #000; padding-top:4px; font-size:13px; font-weight:bold;">_______________________</p>
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
              style={{ backgroundColor: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Official AR Receipt
            </button>
            <button type="button" className="dashboard-cancel-btn" onClick={() => setSelectedDonation(null)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetailsModal;
