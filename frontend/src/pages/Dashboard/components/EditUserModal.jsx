import React from 'react';

const EditUserModal = ({
  showEditUserModal,
  setShowEditUserModal,
  editingUser,
  setEditingUser,
  editUserName, setEditUserName,
  editUserEmail, setEditUserEmail,
  editUserPhone, setEditUserPhone,
  editUserRole, setEditUserRole,
  editUserStatus, setEditUserStatus,
  editUserDepartment, setEditUserDepartment,
  editUserSectorGroup, setEditUserSectorGroup,
  editUserSectorIdNumber, setEditUserSectorIdNumber,
  saveUserEdits,
  handleApproveBeneficiary,
  currentUser,
  mainTab
}) => {
  if (!showEditUserModal) return null;

  const isBeneficiaryMode = mainTab === 'sectors';
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const handleClose = () => {
    setShowEditUserModal(false);
    setEditingUser(null);
  };

  return (
    <div className="dashboard-modal-overlay" onClick={handleClose}>
      <div className="dashboard-modal" style={{ maxWidth: '520px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-modal-header" style={{ padding: '18px 24px' }}>
          <div>
            <h3 className="dashboard-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              {isBeneficiaryMode ? 'Beneficiary Record Details' : 'Edit User Profile'}
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              {isBeneficiaryMode ? 'Viewing verified parish member record' : 'Update administrative user details and access status'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="dashboard-modal-content" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isBeneficiaryMode ? (
            /* Beneficiary Viewing Mode: Read-Only */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Full Name</label>
                  <input
                    className="dashboard-input"
                    value={editUserName}
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '600' }}
                  />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Email Address</label>
                  <input 
                    className="dashboard-input" 
                    value={editUserEmail && !editUserEmail.endsWith('@relietlink.local') ? editUserEmail : 'None provided'} 
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Phone Number</label>
                  <input 
                    className="dashboard-input" 
                    value={editUserPhone || 'None provided'} 
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
                  />
                </div>
                <div className="dashboard-form-group">
                  {/* Remove * from sector group */}
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Sector Group</label>
                  <input 
                    className="dashboard-input" 
                    value={editUserSectorGroup || 'General'} 
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#2563eb', fontWeight: '700' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="dashboard-form-group">
                  {/* Changed from Sector ID / Reg Number to Beneficiary Number */}
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Beneficiary Number</label>
                  <input 
                    className="dashboard-input" 
                    value={editUserSectorIdNumber || (editingUser?._id ? `BN-${editingUser._id.substring(0, 8).toUpperCase()}` : 'BN-PENDING')} 
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'monospace', fontWeight: '700' }}
                  />
                </div>

                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Aid Application Status</label>
                  <input 
                    className="dashboard-input" 
                    value={
                      editingUser?.sectorGroup === 'Scholars'
                        ? (editingUser?.scholarDetails?.applicationStatus || 'Pending Review')
                        : (editingUser?.status === 'active' || editingUser?.sectorGroup ? 'Active Beneficiary' : (editingUser?.status || 'Active'))
                    }
                    readOnly
                    style={{
                      backgroundColor: '#f8fafc',
                      color: (editingUser?.scholarDetails?.applicationStatus || editingUser?.status || '').toLowerCase().includes('pending') ? '#ea580c' : '#16a34a',
                      fontWeight: '800',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>
              </div>

              {/* View Only / Approve Footer */}
              <div className="dashboard-modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px', padding: '12px 0 0 0' }}>
                <button
                  type="button"
                  className="dashboard-submit-btn"
                  style={{ background: '#0f172a', padding: '10px 18px' }}
                  onClick={handleClose}
                >
                  Close
                </button>

                {((editingUser?.scholarDetails?.applicationStatus || editingUser?.status || '').toLowerCase().includes('pending')) && handleApproveBeneficiary && (
                  <button
                    type="button"
                    className="dashboard-submit-btn"
                    style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleApproveBeneficiary(editingUser)}
                  >
                    <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve Application
                  </button>
                )}
              </div>
            </>
          ) : (
            /* System Admin Edit Mode */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Full Name *</label>
                  <input className="dashboard-input" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Email Address *</label>
                  <input 
                    className="dashboard-input" 
                    placeholder="Enter email address" 
                    value={editUserEmail} 
                    onChange={(e) => setEditUserEmail(e.target.value)} 
                  />
                </div>
              </div>

              {isSuperAdmin && (
                <div className="dashboard-form-group" style={{ marginTop: '4px' }}>
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Account Status</label>
                  <select
                    className="dashboard-select"
                    value={(editUserStatus || 'active').toLowerCase()}
                    onChange={(e) => setEditUserStatus && setEditUserStatus(e.target.value)}
                    style={{ fontWeight: '700' }}
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="inactive">Not Active / Inactive (Disabled Access)</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
              )}

              <div className="dashboard-modal-buttons" style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="dashboard-submit-btn" style={{ background: '#2563eb' }} onClick={saveUserEdits}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className="dashboard-cancel-btn"
                  onClick={handleClose}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
