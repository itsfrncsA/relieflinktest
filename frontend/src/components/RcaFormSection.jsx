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
  handlePrintRcaForm
}) => {
  return (
    <>
      {/* Fillable Request for Cash Advance (RCA) Official Form Section */}
      <div className="dashboard-chart-card" style={{ marginBottom: '32px', border: '2px solid #2563eb', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Sto. Domingo Parish Pastoral Council — Request for Cash Advance (RCA)</span>
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Fill out the details digitally below to automatically populate and format the official parish document for printing &amp; signatures.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowRcaPreviewModal(true)}
              style={{ padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Preview Outcome</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRcaPreviewModal(true)}
              className="quick-action-btn action-primary"
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
            >
              <span>Double-Check &amp; Generate Form</span>
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setShowRcaPreviewModal(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <option value="Choir Ministry" />
                <option value="Legion of Mary" />
                <option value="Social Action Center (SAC)" />
                <option value="Catechetical Ministry" />
                <option value="Volunteer Works Committee" />
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
                list="rcaRequestedByOptions"
                placeholder="Select or type name..."
                value={rcaRequestedBy}
                onChange={(e) => setRcaRequestedBy(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              />
              <datalist id="rcaRequestedByOptions">
                <option value="Ministry Coordinator" />
                <option value="Bro. Juan Dela Cruz (Ministry Coordinator)" />
                <option value="Sis. Maria Santos (Youth Coordinator)" />
              </datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Recommending Approval (PFC / Treasurer)</label>
              <input
                type="text"
                list="rcaRecommendingByOptions"
                placeholder="Select or type name..."
                value={rcaRecommendingBy}
                onChange={(e) => setRcaRecommendingBy(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              />
              <datalist id="rcaRecommendingByOptions">
                <option value="Parish Finance Council / Treasurer" />
                <option value="PFC Chairman" />
                <option value="Parish Treasurer" />
              </datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Approved By (Parish Priest)</label>
              <input
                type="text"
                list="rcaApprovedByOptions"
                placeholder="Select or type name..."
                value={rcaApprovedBy}
                onChange={(e) => setRcaApprovedBy(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              />
              <datalist id="rcaApprovedByOptions">
                <option value="Parish Priest" />
                <option value="Rev. Fr. Parish Priest" />
                <option value="Parish Priest / PPC Chairman" />
              </datalist>
            </div>
          </div>

          {/* Details of Outstanding Cash Advance rows */}
          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '4px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
              Details of Outstanding Cash Advance (Optional Table Rows)
            </label>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>
              Enter previous unliquidated cash advances, dates released, amounts, or status notes.
            </p>
            
            {/* Column Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '6px', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
              <div>Date Released / Description</div>
              <div>Amount (PHP)</div>
              <div>Status / Remarks</div>
            </div>

            {rcaOutstandingDetails.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '8px' }}>
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
              onClick={() => setShowRcaPreviewModal(true)}
              style={{ padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', background: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Preview Outcome Before Generating</span>
            </button>
            <button
              type="submit"
              className="quick-action-btn action-primary"
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Double-Check &amp; Save/Print Form</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cash Advance Audit History Log Table */}
      <div className="dashboard-chart-card" style={{ marginBottom: '32px' }}>
        <h3 className="dashboard-chart-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recorded Cash Advance Audit Records ({cashAdvances.length})</span>
          <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>Automatically saved on print/generate</span>
        </h3>

        <div className="donations-table-wrap" style={{ marginTop: '16px' }}>
          {cashAdvances.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No Cash Advance requests logged yet. Filling up and printing an RCA form above automatically creates an audit record here.
            </div>
          ) : (
            <table className="donations-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Applicant</th>
                  <th>Position / Ministry</th>
                  <th>Activity / Purpose</th>
                  <th>Requested Amount</th>
                  <th>Status</th>
                  <th>Recorded By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashAdvances.map((ca) => (
                  <tr key={ca._id}>
                    <td>{new Date(ca.createdAt || ca.date).toLocaleDateString()}</td>
                    <td><strong>{ca.applicantName}</strong></td>
                    <td>{ca.position} • {ca.ministry}</td>
                    <td>{ca.activityPurpose}</td>
                    <td style={{ color: '#2563eb', fontWeight: '800' }}>₱{Number(ca.requestedAmount || 0).toLocaleString()}</td>
                    <td>
                      <span className="status-badge status-approved">
                        {ca.status || 'Submitted'}
                      </span>
                    </td>
                    <td>{ca.createdBy || 'Admin'}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setRcaName(ca.applicantName);
                          setRcaPosition(ca.position || '');
                          setRcaMinistry(ca.ministry || '');
                          setRcaActivity(ca.activityPurpose || '');
                          setRcaRequestedAmount(ca.requestedAmount || '');
                          setRcaOutstandingAmount(ca.outstandingAmount || '');
                          setRcaRequestedBy(ca.requestedBy || ca.applicantName);
                          setRcaRecommendingBy(ca.recommendingApproval || '');
                          setRcaApprovedBy(ca.approvedBy || '');
                          handlePrintRcaForm(false);
                        }}
                        style={{ padding: '4px 10px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Re-print Form
                      </button>
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
