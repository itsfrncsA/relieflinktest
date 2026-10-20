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
  mainTab,
  setDisburseModalUser,
  setDisburseAmount,
  expenses = [],
  formatCurrency
}) => {
  if (!showEditUserModal) return null;

  const isBeneficiaryMode = mainTab === 'sectors';
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isScholar = (editUserSectorGroup || editingUser?.sectorGroup || '').toLowerCase().includes('scholar');

  const userDisbursements = React.useMemo(() => {
    if (!editingUser) return [];
    const logs = [];

    // 1. Match from expenses list
    if (expenses && expenses.length > 0) {
      const uId = String(editingUser._id || '');
      const uName = (editingUser.name || '').toLowerCase().trim();
      expenses.forEach(exp => {
        const matchesId = exp.beneficiaryId && String(exp.beneficiaryId) === uId;
        const desc = (exp.description || '').toLowerCase();
        const matchesDesc = uName && desc.includes(uName);
        if (matchesId || matchesDesc) {
          logs.push({
            id: exp._id,
            date: exp.date || exp.createdAt,
            category: exp.category || 'Aid Allowance',
            amount: exp.amount || 0,
            status: exp.status || 'approved'
          });
        }
      });
    }

    // 2. Match from user reliefHistory
    if (editingUser.reliefHistory && editingUser.reliefHistory.length > 0) {
      editingUser.reliefHistory.forEach((rh, idx) => {
        logs.push({
          id: `rh-${idx}`,
          date: rh.date,
          category: rh.reliefType || 'Relief Assistance',
          amount: rh.amount || 0,
          status: 'approved'
        });
      });
    }

    return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [editingUser, expenses]);

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
            /* Beneficiary Viewing Mode: Read-Only with Disbursement Logs */
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
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Sector Group</label>
                  <input 
                    className="dashboard-input" 
                    value={editUserSectorGroup || 'General'} 
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#2563eb', fontWeight: '700' }}
                  />
                </div>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Beneficiary Number</label>
                <input 
                  className="dashboard-input" 
                  value={editUserSectorIdNumber || (editingUser?._id ? `BN-${editingUser._id.substring(0, 8).toUpperCase()}` : 'BN-PENDING')} 
                  readOnly
                  style={{ backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'monospace', fontWeight: '700' }}
                />
              </div>

              {/* Disbursement History / Aid Logs - Only for Scholars */}
              {isScholar && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="dashboard-label" style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Scholar Disbursement Logs
                    </label>
                    {userDisbursements.length > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        {userDisbursements.length} Received
                      </span>
                    )}
                  </div>

                  {userDisbursements.length > 0 ? (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700' }}>Date &amp; Time</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700' }}>Aid Type</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDisbursements.map((log) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 12px', color: '#334155', whiteSpace: 'nowrap' }}>
                                {log.date ? new Date(log.date).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </td>
                              <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: '600' }}>
                                {log.category}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '800', color: '#16a34a' }}>
                                {formatCurrency ? formatCurrency(log.amount) : `₱${Number(log.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '12px' }}>
                      No scholar disbursement logs recorded for this beneficiary yet.
                    </div>
                  )}
                </div>
              )}
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
