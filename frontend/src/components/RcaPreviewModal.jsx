import React from 'react';

const RcaPreviewModal = ({
  showRcaPreviewModal,
  setShowRcaPreviewModal,
  rcaName,
  rcaDate,
  rcaPosition,
  rcaMinistry,
  rcaActivity,
  rcaDateNeeded,
  rcaRequestedAmount,
  rcaOutstandingAmount,
  rcaOutstandingDetails,
  rcaRequestedBy,
  rcaRecommendingBy,
  rcaApprovedBy,
  handlePrintRcaForm
}) => {
  if (!showRcaPreviewModal) return null;

  return (
    <div className="dashboard-modal-overlay" style={{ zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
      <div className="dashboard-modal" style={{ maxWidth: '850px', width: '95%', maxHeight: '92vh', overflowY: 'auto', background: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
        <div className="dashboard-modal-header" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <h3 className="dashboard-modal-title" style={{ color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span>Document Outcome Preview — Double Check Before Printing</span>
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Review the generated layout below. Once double-checked, click "Confirm &amp; Print" to save the audit log and print/download the official form.
            </p>
          </div>
          <button type="button" onClick={() => setShowRcaPreviewModal(false)} className="dashboard-close-btn">✕</button>
        </div>

        {/* Styled A4 Paper Preview Box */}
        <div style={{ background: '#ffffff', color: '#000000', fontFamily: "'Times New Roman', serif", padding: '24px', border: '2px solid #000000', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: '4px', margin: '0 auto', maxWidth: '750px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              STO. DOMINGO PARISH PASTORAL COUNCIL
            </div>
            <div style={{ fontSize: '13pt', fontWeight: 'bold', marginTop: '4px' }}>
              REQUEST FOR CASH ADVANCE FORM (RCA)
            </div>
          </div>

          {/* Fields Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11pt', fontWeight: 'bold' }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>NAME:</span>
              <span style={{ borderBottom: '1px solid #000', flex: 1, paddingLeft: '8px', fontWeight: 'normal', color: rcaName ? '#000' : '#94a3b8' }}>
                {rcaName || '(Not specified)'}
              </span>
            </div>
            <div style={{ display: 'flex', width: '220px', marginLeft: '16px' }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>DATE:</span>
              <span style={{ borderBottom: '1px solid #000', flex: 1, paddingLeft: '8px', fontWeight: 'normal', color: rcaDate ? '#000' : '#94a3b8' }}>
                {rcaDate || '(Not specified)'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11pt', fontWeight: 'bold' }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>POSITION:</span>
              <span style={{ borderBottom: '1px solid #000', flex: 1, paddingLeft: '8px', fontWeight: 'normal', color: rcaPosition ? '#000' : '#94a3b8' }}>
                {rcaPosition || '(Not specified)'}
              </span>
            </div>
            <div style={{ display: 'flex', width: '280px', marginLeft: '16px' }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>ORG / MINISTRY:</span>
              <span style={{ borderBottom: '1px solid #000', flex: 1, paddingLeft: '8px', fontWeight: 'normal', color: rcaMinistry ? '#000' : '#94a3b8' }}>
                {rcaMinistry || '(Not specified)'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11pt', fontWeight: 'bold' }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>ACTIVITY / PURPOSE:</span>
              <span style={{ borderBottom: '1px solid #000', flex: 1, paddingLeft: '8px', fontWeight: 'normal', color: rcaActivity ? '#000' : '#94a3b8' }}>
                {rcaActivity || '(Not specified)'}
              </span>
            </div>
            <div style={{ display: 'flex', width: '240px', marginLeft: '16px' }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>DATE NEEDED:</span>
              <span style={{ borderBottom: '1px solid #000', flex: 1, paddingLeft: '8px', fontWeight: 'normal', color: rcaDateNeeded ? '#000' : '#94a3b8' }}>
                {rcaDateNeeded || '(Not specified)'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11pt', fontWeight: 'bold' }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>REQUESTED CASH ADVANCE:</span>
              <span style={{ borderBottom: '1px solid #000', flex: 1, paddingLeft: '8px', fontWeight: 'bold', color: '#1e3a8a' }}>
                {rcaRequestedAmount ? `₱${Number(rcaRequestedAmount).toLocaleString()}` : '₱0.00'}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '9pt', fontStyle: 'italic', marginBottom: '14px', fontWeight: 'normal', color: '#475569' }}>
            Note: Receipts attached to the Liquidation Form must be under the name of Sto. Domingo Parish Pastoral Council.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '11pt', fontWeight: 'bold' }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>OUTSTANDING CASH ADVANCE:</span>
              <span style={{ borderBottom: '1px solid #000', flex: 1, paddingLeft: '8px', fontWeight: 'normal' }}>
                {rcaOutstandingAmount ? `₱${Number(rcaOutstandingAmount).toLocaleString()}` : 'None'}
              </span>
            </div>
          </div>

          {/* Details Table & Signatures Side-by-Side */}
          <div style={{ display: 'flex', border: '1.5px solid #000', marginTop: '15px', marginBottom: '15px' }}>
            <div style={{ width: '45%', borderRight: '1.5px solid #000' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th colSpan="3" style={{ border: '1px solid #000', padding: '4px', fontSize: '8.5pt', fontStyle: 'italic', background: '#f8fafc', textAlign: 'center' }}>Details of Outstanding Cash Advance (to be filled up by PFC)</th>
                  </tr>
                  <tr>
                    <th style={{ border: '1px solid #000', padding: '4px', fontSize: '9pt', background: '#f8fafc', textAlign: 'center' }}>Date Released</th>
                    <th style={{ border: '1px solid #000', padding: '4px', fontSize: '9pt', background: '#f8fafc', textAlign: 'center' }}>Amount</th>
                    <th style={{ border: '1px solid #000', padding: '4px', fontSize: '9pt', background: '#f8fafc', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rcaOutstandingDetails.map((row, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #000', height: '24px', textAlign: 'center', fontSize: '10pt' }}>{row.date || ''}</td>
                      <td style={{ border: '1px solid #000', height: '24px', textAlign: 'right', paddingRight: '6px', fontSize: '10pt' }}>{row.amount ? '₱' + Number(row.amount).toLocaleString() : ''}</td>
                      <td style={{ border: '1px solid #000', height: '24px', textAlign: 'center', fontSize: '10pt' }}>{row.status || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ width: '55%', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '9.5pt', fontWeight: 'bold', marginBottom: '16px' }}>REQUESTED BY :</div>
                <div style={{ borderBottom: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt', paddingBottom: '2px' }}>
                  {rcaRequestedBy || rcaName}
                </div>
                <div style={{ fontSize: '8pt', textAlign: 'center', marginTop: '2px' }}>(Signature Over Printed Name)</div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '9.5pt', fontWeight: 'bold', marginBottom: '16px' }}>RECOMMENDING APPROVAL :</div>
                <div style={{ borderBottom: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt', paddingBottom: '2px' }}>
                  {rcaRecommendingBy}
                </div>
                <div style={{ fontSize: '8pt', textAlign: 'center', marginTop: '2px' }}>(Signature Over Printed Name)</div>
              </div>

              <div>
                <div style={{ fontSize: '9.5pt', fontWeight: 'bold', marginBottom: '16px' }}>APPROVED BY :</div>
                <div style={{ borderBottom: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt', paddingBottom: '2px' }}>
                  {rcaApprovedBy}
                </div>
                <div style={{ fontSize: '8pt', textAlign: 'center', marginTop: '2px' }}>(Signature Over Printed Name)</div>
              </div>
            </div>
          </div>

          {/* Promise Statement */}
          <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.4', marginTop: '16px', marginBottom: '24px' }}>
            I hereby promise to liquidate my cash advance WITHIN (a) five (5) working days from completion of event/project or (b) five (5) working days from the day following release of cash advance, as applicable.
          </div>

          {/* Bottom Approved By / Signature */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', marginTop: '20px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', paddingBottom: '2px' }}>
                {rcaName}
              </div>
              <div style={{ fontSize: '8pt', textAlign: 'center', marginTop: '2px' }}>(Signature Over Printed Name)</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', paddingBottom: '2px' }}>
                {rcaDate}
              </div>
              <div style={{ fontSize: '8pt', textAlign: 'center', marginTop: '2px' }}>Date</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '9pt', fontFamily: 'sans-serif', color: '#333' }}>
            Data Classification - Confidential
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => setShowRcaPreviewModal(false)}
            className="dashboard-cancel-btn"
            style={{ padding: '10px 18px', borderRadius: '8px', fontSize: '14px' }}
          >
            Edit Details
          </button>
          <button
            type="button"
            onClick={() => {
              setShowRcaPreviewModal(false);
              handlePrintRcaForm(true);
            }}
            className="quick-action-btn action-primary"
            style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Confirm, Save &amp; Print Form</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RcaPreviewModal;
