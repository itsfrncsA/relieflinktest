import React from 'react';

const RcaFormSection = ({
  cashAdvances = [],
  setShowRcaPreviewModal,
  setRcaName,
  setRcaPosition,
  setRcaMinistry,
  setRcaActivity,
  setRcaRequestedAmount,
  setRcaOutstandingAmount,
  setRcaRequestedBy,
  setRcaRecommendingBy,
  setRcaApprovedBy
}) => {
  return (
    <div className="dashboard-chart-card" style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 className="dashboard-chart-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
            Recorded Cash Advance Audit Records
          </h3>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Official RCA authorizations and parish ministry disbursements
          </p>
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
          {cashAdvances.length} Records
        </span>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        {cashAdvances.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
            No Cash Advance records found in audit registry.
          </div>
        ) : (
          <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="dashboard-th" style={{ width: '50px' }}>#</th>
                <th className="dashboard-th">Date</th>
                <th className="dashboard-th">Applicant</th>
                <th className="dashboard-th">Position / Ministry</th>
                <th className="dashboard-th">Activity / Purpose</th>
                <th className="dashboard-th">Requested Amount</th>
                <th className="dashboard-th" style={{ textAlign: 'center' }}>Status</th>
                <th className="dashboard-th" style={{ textAlign: 'right', width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cashAdvances.map((ca, index) => (
                <tr key={ca._id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td className="dashboard-td" style={{ color: '#64748b', fontWeight: '600' }}>{index + 1}</td>
                  <td className="dashboard-td">{new Date(ca.createdAt || ca.date || Date.now()).toLocaleDateString()}</td>
                  <td className="dashboard-td"><strong style={{ color: '#0f172a' }}>{ca.applicantName}</strong></td>
                  <td className="dashboard-td">{ca.position} {ca.ministry ? `• ${ca.ministry}` : ''}</td>
                  <td className="dashboard-td">{ca.activityPurpose}</td>
                  <td className="dashboard-td" style={{ color: '#0f172a', fontWeight: '700' }}>₱{Number(ca.requestedAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="dashboard-td" style={{ textAlign: 'center' }}>
                    <span style={{
                      color: '#16a34a',
                      fontWeight: '800',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px'
                    }}>
                      {ca.status || 'Submitted'}
                    </span>
                  </td>
                  <td className="dashboard-td" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {/* View / Preview Eye Icon */}
                      <button
                        type="button"
                        onClick={() => {
                          if (setRcaName) setRcaName(ca.applicantName || '');
                          if (setRcaPosition) setRcaPosition(ca.position || '');
                          if (setRcaMinistry) setRcaMinistry(ca.ministry || '');
                          if (setRcaActivity) setRcaActivity(ca.activityPurpose || '');
                          if (setRcaRequestedAmount) setRcaRequestedAmount(ca.requestedAmount || '');
                          if (setRcaOutstandingAmount) setRcaOutstandingAmount(ca.outstandingAmount || '');
                          if (setRcaRequestedBy) setRcaRequestedBy(ca.requestedBy || ca.applicantName || '');
                          if (setRcaRecommendingBy) setRcaRecommendingBy(ca.recommendingApproval || '');
                          if (setRcaApprovedBy) setRcaApprovedBy(ca.approvedBy || '');
                          if (setShowRcaPreviewModal) setShowRcaPreviewModal(true);
                        }}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 2px 5px rgba(15, 23, 42, 0.15)'
                        }}
                        title="View Official RCA Form Document"
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
  );
};

export default RcaFormSection;
