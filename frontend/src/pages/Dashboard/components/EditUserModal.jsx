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
  editUserDepartment, setEditUserDepartment,
  editUserSectorGroup, setEditUserSectorGroup,
  editUserSectorIdNumber, setEditUserSectorIdNumber,
  editUserSchool, setEditUserSchool,
  editUserCourseProgram, setEditUserCourseProgram,
  editUserYearLevel, setEditUserYearLevel,
  editUserGwa, setEditUserGwa,
  editUserHouseholdIncome, setEditUserHouseholdIncome,
  editUserMonthlyAllowance, setEditUserMonthlyAllowance,
  editUserApplicationStatus, setEditUserApplicationStatus,
  editUserApplicationNotes, setEditUserApplicationNotes,
  editUserRequirements, setEditUserRequirements,
  saveUserEdits,
  mainTab
}) => {
  if (!showEditUserModal) return null;

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal" style={{ maxWidth: editUserSectorGroup === 'Scholars' ? '640px' : '520px' }}>
        <div className="dashboard-modal-header">
          <h3 className="dashboard-modal-title">
            {editUserSectorGroup === 'Scholars' ? 'Scholar Details & Application' : 'Edit User Profile'}
          </h3>
          <button
            type="button"
            onClick={() => {
              setShowEditUserModal(false);
              setEditingUser(null);
            }}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="dashboard-modal-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Full Name</label>
              <input className="dashboard-input" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Email Address</label>
              <input className="dashboard-input" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Phone Number</label>
              <input 
                className="dashboard-input" 
                placeholder="e.g. 09171234567" 
                value={editUserPhone || ''} 
                onChange={(e) => setEditUserPhone && setEditUserPhone(e.target.value)} 
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">System Role</label>
              <select className="dashboard-select" value={editUserRole} onChange={(e) => setEditUserRole(e.target.value)}>
                <option value="superadmin">Superadmin (Full System Access)</option>
                <option value="admin">Admin (Management & Approvals)</option>
                <option value="staff">Staff (Operations & Inventory)</option>
                <option value="relief_worker">Relief Worker (Field Ops)</option>
                <option value="volunteer">Volunteer (Community Service)</option>
                <option value="donor">Donor (Financial & Goods)</option>
                <option value="user">User (General Member / Beneficiary)</option>
              </select>
            </div>
          </div>

          <div className="dashboard-form-group" style={{ marginBottom: '12px' }}>
            <label className="dashboard-label">Department / Ministry</label>
            <input className="dashboard-input" placeholder="e.g. Youth Ministry / Relief Operations" value={editUserDepartment} onChange={(e) => setEditUserDepartment(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', color: '#1e293b' }}>Sector Group</label>
              <select className="dashboard-select" value={editUserSectorGroup} onChange={(e) => setEditUserSectorGroup(e.target.value)}>
                <option value="None">None / General Member</option>
                <option value="Senior Citizens">Senior Citizens</option>
                <option value="PWD">Persons with Disabilities (PWD)</option>
                <option value="Scholars">Scholars</option>
                <option value="Prison Ministry">Prison Ministry</option>
                <option value="Solo Parents">Solo Parents</option>
                <option value="Disaster Relief">Disaster Relief</option>
              </select>
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Sector ID / Reg Number</label>
              <input className="dashboard-input" placeholder="e.g. SCH-2024-0105" value={editUserSectorIdNumber} onChange={(e) => setEditUserSectorIdNumber(e.target.value)} />
            </div>
          </div>

          {editUserSectorGroup === 'Scholars' && (
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '12px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e40af' }}>
                Paperless Scholarship Application Details
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Application Status</label>
                  <select 
                    className="dashboard-select" 
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    value={editUserApplicationStatus} 
                    onChange={(e) => setEditUserApplicationStatus(e.target.value)}
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Approved">Approved</option>
                    <option value="Active">Active Scholar</option>
                    <option value="Completed">Completed / Graduated</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Monthly Allowance (PHP)</label>
                  <input type="number" className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="1000.00" value={editUserMonthlyAllowance} onChange={(e) => setEditUserMonthlyAllowance(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>School / Institution</label>
                  <input className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="e.g. UST / PUP" value={editUserSchool} onChange={(e) => setEditUserSchool(e.target.value)} />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Course / Program</label>
                  <input className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="e.g. BS Information Tech" value={editUserCourseProgram} onChange={(e) => setEditUserCourseProgram(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Year Level</label>
                  <input className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="e.g. 2nd Year College" value={editUserYearLevel} onChange={(e) => setEditUserYearLevel(e.target.value)} />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>GWA / Grade</label>
                  <input type="number" step="0.01" className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="1.75" value={editUserGwa} onChange={(e) => setEditUserGwa(e.target.value)} />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Household Income (PHP)</label>
                  <input type="number" className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="15000" value={editUserHouseholdIncome} onChange={(e) => setEditUserHouseholdIncome(e.target.value)} />
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                <label className="dashboard-label" style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Verified Digital Requirements:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={editUserRequirements.reportCard} 
                      onChange={(e) => setEditUserRequirements({ ...editUserRequirements, reportCard: e.target.checked })} 
                    />
                    Report Card / TOR
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={editUserRequirements.indigencyCert} 
                      onChange={(e) => setEditUserRequirements({ ...editUserRequirements, indigencyCert: e.target.checked })} 
                    />
                    Certificate of Indigency
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={editUserRequirements.enrollmentForm} 
                      onChange={(e) => setEditUserRequirements({ ...editUserRequirements, enrollmentForm: e.target.checked })} 
                    />
                    Enrollment Form / COR
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={editUserRequirements.recommendationLetter} 
                      onChange={(e) => setEditUserRequirements({ ...editUserRequirements, recommendationLetter: e.target.checked })} 
                    />
                    Parish Recommendation
                  </label>
                </div>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontSize: '12px' }}>Parish Staff Notes / Evaluation</label>
                <textarea 
                  className="dashboard-input" 
                  style={{ padding: '6px 8px', fontSize: '12px', minHeight: '50px', resize: 'vertical' }} 
                  placeholder="Notes on interview, financial need evaluation..." 
                  value={editUserApplicationNotes} 
                  onChange={(e) => setEditUserApplicationNotes(e.target.value)} 
                />
              </div>
            </div>
          )}

          <div className="dashboard-modal-buttons" style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="dashboard-submit-btn" style={{ background: '#2563eb' }} onClick={saveUserEdits}>
              Save Changes
            </button>
            <button
              type="button"
              className="dashboard-cancel-btn"
              onClick={() => {
                setShowEditUserModal(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
