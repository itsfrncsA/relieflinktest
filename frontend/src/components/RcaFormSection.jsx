import React from 'react';

const RcaFormSection = ({
  rcaName, setRcaName,
  rcaDate, setRcaDate,
  rcaPosition, setRcaPosition,
  rcaMinistry, setRcaMinistry,
  rcaActivity, setRcaActivity,
  rcaDateNeeded, setRcaDateNeeded,
  rcaRequestedAmount, setRcaRequestedAmount,
  rcaOutstandingAmount, setRcaOutstandingAmount,
  rcaRequestedBy, setRcaRequestedBy,
  rcaRecommendingBy, setRcaRecommendingBy,
  rcaApprovedBy, setRcaApprovedBy,
  rcaOutstandingDetails, setRcaOutstandingDetails,
  cashAdvances,
  setShowRcaPreviewModal,
  handlePrintRcaForm,
  handleSaveCashAdvance,
  handleDeleteCashAdvance
}) => {
  return (
    <>
      {/* Fillable Request for Cash Advance (RCA) Official Form Section */}
      <div className="dashboard-chart-card" style={{ marginBottom: '32px', border: '2px solid #2563eb', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Sto. Domingo Parish Pastoral Council — Request for Cash Advance (RCA)</span>
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Fill out the details digitally below to generate the official parish document and log it into the audit registry.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                if (!rcaName.trim()) {
                  alert('Please enter Applicant Name before previewing.');
                  return;
                }
                setShowRcaPreviewModal(true);
              }}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e40af',
                border: '1px solid #93c5fd',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview Form</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCashAdvance}
              className="quick-action-btn action-primary"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '13px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Generate</span>
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveCashAdvance(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Applicant Name *</label>
              <input
                type="text"
                placeholder="Full Name"
                value={rcaName}
                onChange={(e) => setRcaName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Date *</label>
              <input
                type="date"
                value={rcaDate}
                onChange={(e) => setRcaDate(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Position * (Click or type)</label>
              <input
                type="text"
                list="rcaPositionOptions"
                placeholder="Select or type position..."
                value={rcaPosition}
                onChange={(e) => setRcaPosition(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              />
              <datalist id="rcaPositionOptions">
                <option value="Ministry Coordinator" />
                <option value="Parish Youth Coordinator" />
                <option value="Committee Head" />
                <option value="Choir Master / Directress" />
                <option value="Social Action Officer" />
                <option value="Volunteers Lead" />
              </datalist>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Org / Ministry * (Click or type)</label>
              <input
                type="text"
                list="rcaMinistryOptions"
                placeholder="Select or type org/ministry..."
                value={rcaMinistry}
                onChange={(e) => setRcaMinistry(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              />
              <datalist id="rcaMinistryOptions">
                <option value="Parish Youth Ministry" />
                <option value="Social Action Ministry" />
                <option value="Commission on Family and Life" />
                <option value="Liturgy and Music Ministry" />
                <option value="Catechetical Ministry" />
                <option value="Dominican Outreach Core Group" />
              </datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Activity / Purpose *</label>
              <input
                type="text"
                placeholder="e.g. Food pack procurement for Bicol outreach"
                value={rcaActivity}
                onChange={(e) => setRcaActivity(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Date Needed *</label>
              <input
                type="date"
                value={rcaDateNeeded}
                onChange={(e) => setRcaDateNeeded(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Requested Cash Advance (PHP) *</label>
              <input
                type="number"
                placeholder="Amount in ₱"
                value={rcaRequestedAmount}
                onChange={(e) => setRcaRequestedAmount(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Outstanding Cash Advance (if any)</label>
              <input
                type="number"
                placeholder="Existing unliquidated amount in ₱"
                value={rcaOutstandingAmount}
                onChange={(e) => setRcaOutstandingAmount(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Requested By (Ministry Coordinator)</label>
              <input
                type="text"
                placeholder="Select or type name..."
                value={rcaRequestedBy}
                onChange={(e) => setRcaRequestedBy(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Recommending Approval (PFC / Treasurer)</label>
              <input
                type="text"
                list="rcaPfcOptions"
                placeholder="Select or type name..."
                value={rcaRecommendingBy}
                onChange={(e) => setRcaRecommendingBy(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              />
              <datalist id="rcaPfcOptions">
                <option value="Parish Finance Council / Treasurer" />
                <option value="Bro. Miguel Enrico (Admin Head)" />
                <option value="Sis. Teresa Salazar (Finance Lead)" />
              </datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Approved By (Parish Priest)</label>
              <input
                type="text"
                list="rcaPriestOptions"
                placeholder="Select or type name..."
                value={rcaApprovedBy}
                onChange={(e) => setRcaApprovedBy(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              />
              <datalist id="rcaPriestOptions">
                <option value="Rev. Fr. Roger P. Quirao, OP (Parish Priest)" />
                <option value="Rev. Fr. Prior, OP (Dominican Superior)" />
                <option value="Parish Administrator" />
              </datalist>
            </div>
          </div>

          {/* Details of Outstanding Cash Advance rows */}
          <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#1e3a8a' }}>
              Details of Outstanding Cash Advance (Optional Table Rows)
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
              Enter previous unliquidated cash advances, dates released, amounts, or status notes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>DATE RELEASED / DESCRIPTION</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>AMOUNT (PHP)</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>STATUS / REMARKS</span>
            </div>

            {rcaOutstandingDetails.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '8px', marginBottom: '6px' }}>
                <input
                  type="text"
                  placeholder={`Row ${idx + 1} Date (e.g. 08/15/2026 or Particulars)`}
                  value={row.date}
                  onChange={(e) => {
                    const updated = [...rcaOutstandingDetails];
                    updated[idx].date = e.target.value;
                    setRcaOutstandingDetails(updated);
                  }}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
                <input
                  type="number"
                  placeholder={`Row ${idx + 1} Amount (₱)`}
                  value={row.amount}
                  onChange={(e) => {
                    const updated = [...rcaOutstandingDetails];
                    updated[idx].amount = e.target.value;
                    setRcaOutstandingDetails(updated);
                  }}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
                <input
                  type="text"
                  placeholder={`Row ${idx + 1} Status (e.g. Partial/Pending)`}
                  value={row.status}
                  onChange={(e) => {
                    const updated = [...rcaOutstandingDetails];
                    updated[idx].status = e.target.value;
                    setRcaOutstandingDetails(updated);
                  }}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
            <button
              type="button"
              onClick={() => {
                if (!rcaName.trim()) {
                  alert('Please enter Applicant Name before previewing.');
                  return;
                }
                setShowRcaPreviewModal(true);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                background: '#ffffff',
                color: '#1e40af',
                border: '1px solid #93c5fd',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview Form</span>
            </button>

            <button
              type="submit"
              className="quick-action-btn action-primary"
              style={{
                padding: '11px 24px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '14px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Generate</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cash Advance Audit History Log Table */}
      <div className="dashboard-chart-card" style={{ marginBottom: '32px' }}>
        <h3 className="dashboard-chart-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span>Recorded Cash Advance Audit Records ({cashAdvances.length})</span>
          <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>Click "Print Form" on any row to generate official paper document</span>
        </h3>

        <div className="donations-table-wrap" style={{ marginTop: '16px', overflowX: 'auto' }}>
          {cashAdvances.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '8px' }}>
              No Cash Advance requests recorded yet. Fill out the form above and click <strong>"Generate"</strong> to log a record here.
            </div>
          ) : (
            <table className="donations-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Applicant</th>
                  <th>Position / Ministry</th>
                  <th>Activity / Purpose</th>
                  <th>Requested Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashAdvances.map((ca, index) => (
                  <tr key={ca._id || index}>
                    <td style={{ color: '#64748b', fontWeight: '600' }}>{index + 1}</td>
                    <td>{new Date(ca.createdAt || ca.date).toLocaleDateString()}</td>
                    <td><strong>{ca.applicantName}</strong></td>
                    <td>{ca.position} {ca.ministry ? `• ${ca.ministry}` : ''}</td>
                    <td>{ca.activityPurpose}</td>
                    <td style={{ color: '#2563eb', fontWeight: '800' }}>₱{Number(ca.requestedAmount || 0).toLocaleString()}</td>
                    <td>
                      <span className="status-badge status-approved">
                        {ca.status || 'Submitted'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => handlePrintRcaForm(ca)}
                          style={{
                            padding: '6px 12px',
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
                          }}
                          title="Print official RCA document"
                        >
                          <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <span>Print Form</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRcaName(ca.applicantName || '');
                            setRcaPosition(ca.position || '');
                            setRcaMinistry(ca.ministry || '');
                            setRcaActivity(ca.activityPurpose || '');
                            setRcaRequestedAmount(ca.requestedAmount || '');
                            setRcaOutstandingAmount(ca.outstandingAmount || '');
                            setRcaRequestedBy(ca.requestedBy || ca.applicantName || '');
                            setRcaRecommendingBy(ca.recommendingApproval || '');
                            setRcaApprovedBy(ca.approvedBy || '');
                            setShowRcaPreviewModal(true);
                          }}
                          style={{
                            padding: '6px 10px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Preview in A4 Document modal"
                        >
                          <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCashAdvance(ca._id)}
                          style={{
                            padding: '6px 8px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          title="Delete record"
                        >
                          <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default RcaFormSection;
