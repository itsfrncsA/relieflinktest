import React from 'react';

const GenerateReportModal = ({
  showGenerateReportModal,
  setShowGenerateReportModal,
  reportTitleInput, setReportTitleInput,
  reportTypeInput, setReportTypeInput,
  reportSectorInput, setReportSectorInput,
  reportStartDateInput, setReportStartDateInput,
  reportEndDateInput, setReportEndDateInput,
  reportNotesInput, setReportNotesInput,
  sectors,
  handleGenerateReportSubmit
}) => {
  if (!showGenerateReportModal) return null;

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal" style={{ maxWidth: '520px', width: '90%', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="dashboard-modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="dashboard-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                Generate Financial &amp; Audit Report
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Export validated ledger statements &amp; summary breakdowns</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGenerateReportModal(false)}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleGenerateReportSubmit}>
          <div className="dashboard-modal-content" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Report Custom Title</label>
              <input
                type="text"
                placeholder="e.g. Q3 2026 Parish Financial Audit Report"
                value={reportTitleInput}
                onChange={(e) => setReportTitleInput(e.target.value)}
                className="dashboard-input"
                style={{ borderRadius: '8px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Report Type</label>
                <select
                  value={reportTypeInput}
                  onChange={(e) => setReportTypeInput(e.target.value)}
                  className="dashboard-input"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="monthly">Monthly Audit</option>
                  <option value="quarterly">Quarterly Breakdown</option>
                  <option value="annual">Annual Financial Statement</option>
                  <option value="emergency">Emergency Relief Audit</option>
                </select>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Sector Filter</label>
                <select
                  value={reportSectorInput}
                  onChange={(e) => setReportSectorInput(e.target.value)}
                  className="dashboard-input"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="all">All Sectors &amp; General Fund</option>
                  {sectors.map(s => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>From Date</label>
                <input
                  type="date"
                  value={reportStartDateInput}
                  onChange={(e) => setReportStartDateInput(e.target.value)}
                  className="dashboard-input"
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>To Date</label>
                <input
                  type="date"
                  value={reportEndDateInput}
                  onChange={(e) => setReportEndDateInput(e.target.value)}
                  className="dashboard-input"
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>

            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Notes / Summary Narrative</label>
              <textarea
                placeholder="Add contextual audit notes, accountant remarks, or verification commentary..."
                rows="3"
                value={reportNotesInput}
                onChange={(e) => setReportNotesInput(e.target.value)}
                className="dashboard-input"
                style={{ borderRadius: '8px', resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="dashboard-modal-buttons" style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="dashboard-cancel-btn"
              onClick={() => setShowGenerateReportModal(false)}
              style={{ borderRadius: '8px', padding: '9px 18px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dashboard-submit-btn"
              style={{
                borderRadius: '8px',
                padding: '9px 20px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print &amp; Download PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateReportModal;
