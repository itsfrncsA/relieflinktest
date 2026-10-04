import React from 'react';
import RcaFormSection from '../../../components/RcaFormSection';

const DocumentsTab = ({
  rcaName, setRcaName,
  rcaDate, setRcaDate,
  rcaPosition, setRcaPosition,
  rcaMinistry, setRcaMinistry,
  rcaActivity, setRcaActivity,
  rcaDateNeeded, setRcaDateNeeded,
  rcaRequestedAmount, setRcaRequestedAmount,
  rcaOutstandingAmount, setRcaOutstandingAmount,
  rcaOutstandingDetails, setRcaOutstandingDetails,
  rcaRequestedBy, setRcaRequestedBy,
  rcaRecommendingBy, setRcaRecommendingBy,
  rcaApprovedBy, setRcaApprovedBy,
  cashAdvances = [],
  setShowRcaPreviewModal,
  handlePrintRcaForm,
  handleSaveCashAdvance
}) => {
  const handleDetailChange = (index, field, value) => {
    const updated = [...rcaOutstandingDetails];
    updated[index] = { ...updated[index], [field]: value };
    setRcaOutstandingDetails(updated);
  };

  const handleClearForm = () => {
    setRcaName('');
    setRcaDate(new Date().toISOString().split('T')[0]);
    setRcaPosition('');
    setRcaMinistry('');
    setRcaActivity('');
    setRcaDateNeeded('');
    setRcaRequestedAmount('');
    setRcaOutstandingAmount('');
    setRcaRequestedBy('');
    setRcaRecommendingBy('');
    setRcaApprovedBy('');
    setRcaOutstandingDetails([
      { date: '', amount: '', status: '' },
      { date: '', amount: '', status: '' },
      { date: '', amount: '', status: '' },
      { date: '', amount: '', status: '' },
      { date: '', amount: '', status: '' }
    ]);
  };

  return (
    <div className="dashboard-main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Documents
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Parish official forms, request for cash advance (RCA) generator, and printable document registry
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowRcaPreviewModal && setShowRcaPreviewModal(true)}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview &amp; Print RCA
          </button>

          <button
            type="button"
            onClick={handleSaveCashAdvance}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save RCA Record
          </button>
        </div>
      </div>

      {/* Fillable Request for Cash Advance (RCA) Form Card */}
      <div className="dashboard-form-card" style={{ marginBottom: '28px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '24px', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                Request for Cash Advance (RCA) Form
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Fill out the official parish cash advance voucher to generate paper printouts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearForm}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#475569',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Clear Form
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Name & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Applicant Name *</label>
              <input
                type="text"
                className="dashboard-input"
                placeholder="e.g. Francis Arillo"
                value={rcaName}
                onChange={(e) => setRcaName(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Date *</label>
              <input
                type="date"
                className="dashboard-input"
                value={rcaDate}
                onChange={(e) => setRcaDate(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Position & Ministry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Position</label>
              <input
                type="text"
                className="dashboard-input"
                placeholder="e.g. Ministry Coordinator"
                value={rcaPosition}
                onChange={(e) => setRcaPosition(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Organization / Ministry</label>
              <input
                type="text"
                className="dashboard-input"
                placeholder="e.g. Parish Youth Ministry"
                value={rcaMinistry}
                onChange={(e) => setRcaMinistry(e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Activity / Purpose & Date Needed */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Activity / Purpose *</label>
              <input
                type="text"
                className="dashboard-input"
                placeholder="e.g. Relief Goods Distribution Logistics"
                value={rcaActivity}
                onChange={(e) => setRcaActivity(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Date Needed</label>
              <input
                type="date"
                className="dashboard-input"
                value={rcaDateNeeded}
                onChange={(e) => setRcaDateNeeded(e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Requested Amount & Outstanding Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Requested Cash Advance (PHP) *</label>
              <input
                type="number"
                className="dashboard-input"
                placeholder="0.00"
                value={rcaRequestedAmount}
                onChange={(e) => setRcaRequestedAmount(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Outstanding Cash Advance (PHP)</label>
              <input
                type="number"
                className="dashboard-input"
                placeholder="0.00"
                value={rcaOutstandingAmount}
                onChange={(e) => setRcaOutstandingAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Details of Outstanding Cash Advance Table */}
          <div style={{ marginTop: '8px' }}>
            <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155', marginBottom: '8px', display: 'block' }}>
              Details of Outstanding Cash Advance (to be filled up by PFC)
            </label>
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Date Released</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Amount (PHP)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(rcaOutstandingDetails || []).map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < rcaOutstandingDetails.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '6px 12px' }}>
                        <input
                          type="date"
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                          value={row.date || ''}
                          onChange={(e) => handleDetailChange(i, 'date', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <input
                          type="number"
                          placeholder="0.00"
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                          value={row.amount || ''}
                          onChange={(e) => handleDetailChange(i, 'amount', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <input
                          type="text"
                          placeholder="e.g. Partially Liquidated"
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                          value={row.status || ''}
                          onChange={(e) => handleDetailChange(i, 'status', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatories Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Requested By</label>
              <input
                type="text"
                className="dashboard-input"
                placeholder={rcaName || "Applicant Name"}
                value={rcaRequestedBy}
                onChange={(e) => setRcaRequestedBy(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Recommending Approval</label>
              <input
                type="text"
                className="dashboard-input"
                placeholder="Parish Finance Council / Treasurer"
                value={rcaRecommendingBy}
                onChange={(e) => setRcaRecommendingBy(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Approved By</label>
              <input
                type="text"
                className="dashboard-input"
                placeholder="Parish Priest"
                value={rcaApprovedBy}
                onChange={(e) => setRcaApprovedBy(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowRcaPreviewModal && setShowRcaPreviewModal(true)}
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '11px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(15,23,42,0.15)'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview &amp; Print RCA Form
            </button>

            <button
              type="button"
              onClick={handleSaveCashAdvance}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save RCA Document
            </button>
          </div>
        </div>
      </div>

      {/* Recorded Cash Advance Audit Table */}
      <RcaFormSection
        cashAdvances={cashAdvances}
        setShowRcaPreviewModal={setShowRcaPreviewModal}
        setRcaName={setRcaName}
        setRcaPosition={setRcaPosition}
        setRcaMinistry={setRcaMinistry}
        setRcaActivity={setRcaActivity}
        setRcaRequestedAmount={setRcaRequestedAmount}
        setRcaOutstandingAmount={setRcaOutstandingAmount}
        setRcaRequestedBy={setRcaRequestedBy}
        setRcaRecommendingBy={setRcaRecommendingBy}
        setRcaApprovedBy={setRcaApprovedBy}
      />
    </div>
  );
};

export default DocumentsTab;
