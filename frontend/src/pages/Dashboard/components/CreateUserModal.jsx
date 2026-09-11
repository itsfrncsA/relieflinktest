import React, { useState } from 'react';

const CreateUserModal = ({
  showCreateUserModal,
  setShowCreateUserModal,
  handleCreateUserSubmit,
  currentUser
}) => {
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [sectorGroup, setSectorGroup] = useState('None');
  const [sectorIdNumber, setSectorIdNumber] = useState('');
  const [status, setStatus] = useState('active');

  // Scholar specific fields
  const [school, setSchool] = useState('');
  const [courseProgram, setCourseProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [gwa, setGwa] = useState('');
  const [householdIncome, setHouseholdIncome] = useState('');
  const [monthlyAllowance, setMonthlyAllowance] = useState('1000');
  const [applicationStatus, setApplicationStatus] = useState('Approved');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [requirements, setRequirements] = useState({
    reportCard: false,
    indigencyCert: false,
    enrollmentForm: false,
    recommendationLetter: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!showCreateUserModal) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setPhone('');
    setDepartment('');
    setSectorGroup('None');
    setSectorIdNumber('');
    setStatus('active');
    setSchool('');
    setCourseProgram('');
    setYearLevel('');
    setGwa('');
    setHouseholdIncome('');
    setMonthlyAllowance('1000');
    setApplicationStatus('Approved');
    setApplicationNotes('');
    setRequirements({
      reportCard: false,
      indigencyCert: false,
      enrollmentForm: false,
      recommendationLetter: false
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Full Name, Email Address, and Password are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (/[<>"':;\/|{}\[\]()\-\+= ]/.test(password)) {
      setErrorMessage("Password cannot contain spaces or forbidden characters (< > \" : ; ' / | { } [ ] ( ) - + =)");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      phone: phone ? phone.trim() : undefined,
      department: department ? department.trim() : undefined,
      sectorGroup,
      sectorIdNumber: sectorIdNumber ? sectorIdNumber.trim() : undefined,
      status,
      scholarDetails: sectorGroup === 'Scholars' ? {
        school,
        courseProgram,
        yearLevel,
        gwa: gwa ? parseFloat(gwa) : undefined,
        householdIncome: householdIncome ? parseFloat(householdIncome) : undefined,
        monthlyAllowance: monthlyAllowance ? parseFloat(monthlyAllowance) : 0,
        applicationStatus,
        applicationNotes,
        serviceStatus: 'Pending',
        requirements
      } : undefined
    };

    try {
      await handleCreateUserSubmit(payload);
      resetForm();
      setShowCreateUserModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create user';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('already exist') || msg.toLowerCase().includes('duplicate')) {
        alert('An account with this email address already exists.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal" style={{ maxWidth: sectorGroup === 'Scholars' ? '640px' : '520px' }}>
        <div className="dashboard-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800'
            }}>
              +
            </div>
            <h3 className="dashboard-modal-title" style={{ margin: 0 }}>Create New User Account</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowCreateUserModal(false);
            }}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-modal-content">
          {errorMessage && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '14px',
              border: '1px solid #fecaca'
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Full Name *</label>
              <input
                type="text"
                required
                className="dashboard-input"
                placeholder="e.g. Maria Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Email Address *</label>
              <input
                type="email"
                required
                className="dashboard-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Temporary Password *</label>
              <input
                type="password"
                required
                className="dashboard-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">
                System Role * {isSuperAdmin ? '' : '(Superadmin Only for Admin/Staff)'}
              </label>
              <select
                className="dashboard-select"
                value={isSuperAdmin ? role : 'user'}
                onChange={(e) => setRole(e.target.value)}
                disabled={!isSuperAdmin}
                style={!isSuperAdmin ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : {}}
                title={!isSuperAdmin ? 'Only Superadmin can assign administrative roles' : 'Select user role'}
              >
                <option value="user">User (General Beneficiary / Member)</option>
                {isSuperAdmin && (
                  <>
                    <option value="superadmin">Superadmin (Full System Access)</option>
                    <option value="admin">Admin (Management & Approvals)</option>
                    <option value="staff">Staff (Operations & Inventory)</option>
                    <option value="relief_worker">Relief Worker (Field Ops)</option>
                    <option value="volunteer">Volunteer (Community Service)</option>
                    <option value="donor">Donor (Financial & Goods)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Phone Number</label>
              <input
                type="tel"
                className="dashboard-input"
                placeholder="09171234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Account Status</label>
              <select className="dashboard-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active (Instant Access)</option>
                <option value="pending">Pending Approval</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="dashboard-form-group" style={{ marginBottom: '12px' }}>
            <label className="dashboard-label">Department / Ministry</label>
            <input
              type="text"
              className="dashboard-input"
              placeholder="e.g. Youth Ministry, Parish Social Action, Logistics"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '700', color: '#1e293b' }}>Sector Group</label>
              <select className="dashboard-select" value={sectorGroup} onChange={(e) => setSectorGroup(e.target.value)}>
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
              <input
                type="text"
                className="dashboard-input"
                placeholder="e.g. SCH-2024-001"
                value={sectorIdNumber}
                onChange={(e) => setSectorIdNumber(e.target.value)}
              />
            </div>
          </div>

          {sectorGroup === 'Scholars' && (
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '12px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e40af' }}>
                Paperless Scholarship Initial Setup
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Application Status</label>
                  <select 
                    className="dashboard-select" 
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    value={applicationStatus} 
                    onChange={(e) => setApplicationStatus(e.target.value)}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Active">Active Scholar</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Completed">Completed / Graduated</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Monthly Allowance (PHP)</label>
                  <input
                    type="number"
                    className="dashboard-input"
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    placeholder="1000.00"
                    value={monthlyAllowance}
                    onChange={(e) => setMonthlyAllowance(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>School / Institution</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    placeholder="e.g. UST / PUP / DepEd"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Course / Program</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    placeholder="e.g. BS Computer Science"
                    value={courseProgram}
                    onChange={(e) => setCourseProgram(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Year Level</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    placeholder="e.g. Grade 11 / 2nd Year"
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                  />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>GWA / Grade</label>
                  <input
                    type="number"
                    step="0.01"
                    className="dashboard-input"
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    placeholder="1.75"
                    value={gwa}
                    onChange={(e) => setGwa(e.target.value)}
                  />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontSize: '12px' }}>Household Income</label>
                  <input
                    type="number"
                    className="dashboard-input"
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    placeholder="15000"
                    value={householdIncome}
                    onChange={(e) => setHouseholdIncome(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                <label className="dashboard-label" style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Submitted Digital Requirements:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={requirements.reportCard} 
                      onChange={(e) => setRequirements({ ...requirements, reportCard: e.target.checked })} 
                    />
                    Report Card / TOR
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={requirements.indigencyCert} 
                      onChange={(e) => setRequirements({ ...requirements, indigencyCert: e.target.checked })} 
                    />
                    Certificate of Indigency
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={requirements.enrollmentForm} 
                      onChange={(e) => setRequirements({ ...requirements, enrollmentForm: e.target.checked })} 
                    />
                    Enrollment Form / COR
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={requirements.recommendationLetter} 
                      onChange={(e) => setRequirements({ ...requirements, recommendationLetter: e.target.checked })} 
                    />
                    Parish Recommendation
                  </label>
                </div>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontSize: '12px' }}>Evaluation Notes</label>
                <textarea 
                  className="dashboard-input" 
                  style={{ padding: '6px 8px', fontSize: '12px', minHeight: '44px', resize: 'vertical' }} 
                  placeholder="Notes on background check, family status..." 
                  value={applicationNotes} 
                  onChange={(e) => setApplicationNotes(e.target.value)} 
                />
              </div>
            </div>
          )}

          <div className="dashboard-modal-buttons" style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="dashboard-submit-btn"
              style={{ background: '#2563eb' }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button
              type="button"
              className="dashboard-cancel-btn"
              onClick={() => {
                resetForm();
                setShowCreateUserModal(false);
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
