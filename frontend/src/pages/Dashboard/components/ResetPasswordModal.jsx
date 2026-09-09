import React from 'react';

const ResetPasswordModal = ({
  resetPasswordUser,
  setResetPasswordUser,
  resetNewPassword,
  setResetNewPassword,
  handleConfirmResetPassword
}) => {
  if (!resetPasswordUser) return null;

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal" style={{ maxWidth: '440px' }}>
        <div className="dashboard-modal-header">
          <h3 className="dashboard-modal-title">Reset User Password</h3>
          <button
            type="button"
            onClick={() => setResetPasswordUser(null)}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="dashboard-modal-content">
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569' }}>
            Set a new temporary password for <strong>{resetPasswordUser.name}</strong> ({resetPasswordUser.email}).
          </p>
          <div className="dashboard-form-group" style={{ marginBottom: '16px' }}>
            <label className="dashboard-label">New Password</label>
            <input
              type="password"
              className="dashboard-input"
              placeholder="Enter new password (min. 6 characters)"
              value={resetNewPassword}
              onChange={(e) => setResetNewPassword(e.target.value)}
            />
          </div>
          <div className="dashboard-modal-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="dashboard-submit-btn"
              style={{ background: '#2563eb' }}
              onClick={handleConfirmResetPassword}
            >
              Update Password
            </button>
            <button
              type="button"
              className="dashboard-cancel-btn"
              onClick={() => setResetPasswordUser(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
