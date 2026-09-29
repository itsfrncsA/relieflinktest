import React, { useState, useEffect } from 'react';

const CreateUserModal = ({
  showCreateUserModal,
  setShowCreateUserModal,
  handleCreateUserSubmit,
  currentUser,
  mainTab,
  sectorFilter
}) => {
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isBeneficiaryMode = mainTab === 'sectors';

  const getInitialSector = () => {
    if (!isBeneficiaryMode) return 'None';
    if (sectorFilter && sectorFilter !== 'all') {
      if (sectorFilter.toLowerCase().includes('pwd')) return 'PWD';
      if (sectorFilter.toLowerCase().includes('senior')) return 'Senior Citizens';
      if (sectorFilter.toLowerCase().includes('scholar')) return 'Scholars';
      if (sectorFilter.toLowerCase().includes('prison')) return 'Prison Ministry';
      if (sectorFilter.toLowerCase().includes('solo')) return 'Solo Parents';
      if (sectorFilter.toLowerCase().includes('disaster')) return 'Disaster Relief';
      return sectorFilter;
    }
    return 'Solo Parents';
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(isBeneficiaryMode ? 'user' : 'admin');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [sectorGroup, setSectorGroup] = useState(getInitialSector());
  const [sectorIdNumber, setSectorIdNumber] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (showCreateUserModal && isBeneficiaryMode) {
      setSectorGroup(getInitialSector());
    }
  }, [showCreateUserModal, sectorFilter, isBeneficiaryMode]);

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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!showCreateUserModal) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRole(isBeneficiaryMode ? 'user' : 'admin');
    setPhone('');
    setDepartment('');
    setSectorGroup(getInitialSector());
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
    if (!name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    if (!isBeneficiaryMode && !email.trim()) {
      setErrorMessage('Email Address is required for administrative user accounts.');
      return;
    }

    if (!isBeneficiaryMode) {
      if (!password) {
        setErrorMessage('Temporary Password is required for user account.');
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
    }

    setLoading(true);
    setErrorMessage('');

    const payload = isBeneficiaryMode ? {
      name: name.trim(),
      email: email.trim() || undefined,
      role: 'user',
      phone: phone ? phone.trim() : undefined,
      sectorGroup,
      status: 'active',
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
    } : {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      phone: phone ? phone.trim() : undefined,
      department: department ? department.trim() : undefined,
      sectorGroup: 'None',
      status
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
      <div className="dashboard-modal" style={{ maxWidth: (isBeneficiaryMode && sectorGroup === 'Scholars') ? '640px' : '520px' }}>
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
            <h3 className="dashboard-modal-title" style={{ margin: 0 }}>
              {isBeneficiaryMode
                ? (sectorGroup === 'Scholars' ? 'Add New Student Scholar' : 'Add New Beneficiary')
                : 'Create New User Account'}
            </h3>
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
                placeholder={isBeneficiaryMode ? "e.g. Lourdes Santos" : "e.g. Maria Santos"}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">
                {isBeneficiaryMode ? 'Email Address (Optional)' : 'Email Address *'}
              </label>
              <input
                type="email"
                required={!isBeneficiaryMode}
                className="dashboard-input"
                placeholder={isBeneficiaryMode ? "Optional (e.g. lourdes@example.com)" : "Enter email address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {!isBeneficiaryMode ? (
            /* System User Mode: Password, System Role, Phone */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label">Temporary Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="dashboard-input"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label">System Role *</label>
                  <select
                    className="dashboard-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="dashboard-form-group" style={{ marginBottom: '12px' }}>
                <label className="dashboard-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="dashboard-input"
                  placeholder="09171234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          ) : (
            /* Beneficiary Directory Mode: Sector Group, Phone (Optional), Scholar Details */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '700', color: '#1e293b' }}>Select Sector / Ministry *</label>
                  <select 
                    className="dashboard-select" 
                    value={sectorGroup} 
                    onChange={(e) => setSectorGroup(e.target.value)}
                    style={{ fontWeight: '600' }}
                  >
                    <option value="Solo Parents">Solo Parents</option>
                    <option value="Senior Citizens">Senior Citizens</option>
                    <option value="PWD">Persons with Disabilities (PWD)</option>
                    <option value="Scholars">Student Scholars</option>
                    <option value="Prison Ministry">Prison Ministry</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                  </select>
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="dashboard-input"
                    placeholder="09171234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

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
              {loading
                ? (isBeneficiaryMode ? 'Adding Beneficiary...' : 'Creating User...')
                : (isBeneficiaryMode
                    ? (sectorGroup === 'Scholars' ? 'Add Student Scholar' : 'Add Beneficiary')
                    : 'Create Account')}
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
