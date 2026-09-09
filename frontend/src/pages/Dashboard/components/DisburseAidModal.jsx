import React from 'react';

const DisburseAidModal = ({
  disburseModalUser,
  setDisburseModalUser,
  disburseAmount,
  setDisburseAmount,
  handleDisburseFund
}) => {
  if (!disburseModalUser) return null;

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal" style={{ maxWidth: '450px' }}>
        <div className="dashboard-modal-header">
          <h3 className="dashboard-modal-title">Disburse Aid / Allowance</h3>
          <button
            type="button"
            onClick={() => setDisburseModalUser(null)}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="dashboard-modal-content">
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>
            Disbursing aid to <strong>{disburseModalUser.name}</strong> ({disburseModalUser.sectorGroup || 'Beneficiary'}).
          </p>
          <div className="dashboard-form-group" style={{ marginBottom: '16px' }}>
            <label className="dashboard-label">Disbursement Amount (PHP)</label>
            <input
              type="number"
              value={disburseAmount}
              onChange={(e) => setDisburseAmount(e.target.value)}
              placeholder="e.g. 1000.00"
              className="dashboard-input"
            />
          </div>
          <div className="dashboard-modal-buttons">
            <button
              type="button"
              onClick={handleDisburseFund}
              className="dashboard-submit-btn"
              style={{ backgroundColor: '#10b981' }}
            >
              Confirm Disbursement
            </button>
            <button
              type="button"
              onClick={() => setDisburseModalUser(null)}
              className="dashboard-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisburseAidModal;
