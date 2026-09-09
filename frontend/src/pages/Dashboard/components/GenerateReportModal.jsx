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
    <div className="dashboard-modal-overlay" onClick={() => setShowGenerateReportModal(false)}>
      <div className="dashboard-modal" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="dashboard-modal-title">
                Generate Financial &amp; Audit Report
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>
                Export validated ledger statements &amp; summary breakdowns
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGenerateReportModal(false)}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleGenerateReportSubmit}>
          <div className="dashboard-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Report Custom Title</label>
              <input
                type="text"
                placeholder="e.g. Q3 2026 Parish Financial Audit Report"
                value={reportTitleInput}
                onChange={(e) => setReportTitleInput(e.target.value)}
                className="dashboard-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="dashboard-form-group">
                <label className="dashboard-label">Report Type</label>
                <select
                  value={reportTypeInput}
                  onChange={(e) => setReportTypeInput(e.target.value)}
                  className="dashboard-select"
                >
                  <option value="monthly">Monthly Audit</option>
                  <option value="quarterly">Quarterly Breakdown</option>
                  <option value="annual">Annual Financial Statement</option>
                  <option value="emergency">Emergency Relief Audit</option>
                </select>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label">Sector Filter</label>
                <select
                  value={reportSectorInput}
                  onChange={(e) => setReportSectorInput(e.target.value)}
                  className="dashboard-select"
                >
                  <option value="all">All Sectors &amp; General Fund</option>
                  {sectors.map(s => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="dashboard-form-group">
                <label className="dashboard-label">From Date</label>
                <input
                  type="date"
                  value={reportStartDateInput}
                  onChange={(e) => setReportStartDateInput(e.target.value)}
                  className="dashboard-input"
                />
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label">To Date</label>
                <input
                  type="date"
                  value={reportEndDateInput}
                  onChange={(e) => setReportEndDateInput(e.target.value)}
                  className="dashboard-input"
                />
              </div>
            </div>

            <div className="dashboard-form-group">
              <label className="dashboard-label">Notes / Summary Narrative</label>
              <textarea
                placeholder="Add contextual audit notes, accountant remarks, or verification commentary..."
                rows="3"
                value={reportNotesInput}
                onChange={(e) => setReportNotesInput(e.target.value)}
                className="dashboard-textarea"
              />
            </div>
          </div>

          <div className="dashboard-modal-footer">
            <button
              type="button"
              className="dashboard-cancel-btn"
              onClick={() => setShowGenerateReportModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dashboard-submit-btn"
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
