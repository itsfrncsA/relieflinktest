import React, { useState, useEffect } from 'react';

const CreateUserModal = ({
  showCreateUserModal,
  setShowCreateUserModal,
  handleCreateUserSubmit,
  currentUser,
  mainTab,
  sectorFilter
}) => {
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
  const [phone, setPhone] = useState('');
  const [sectorGroup, setSectorGroup] = useState(getInitialSector());

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (showCreateUserModal && isBeneficiaryMode) {
      setSectorGroup(getInitialSector());
    }
  }, [showCreateUserModal, sectorFilter, isBeneficiaryMode]);

  if (!showCreateUserModal) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setPhone('');
    setSectorGroup(getInitialSector());
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    setShowCreateUserModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Full Name is required.');
      return;
    }

    if (/\d/.test(trimmedName)) {
      setErrorMessage('Full Name cannot contain numbers. Please enter a valid name.');
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
      name: trimmedName,
      email: email.trim() || undefined,
      role: 'user',
      phone: phone ? phone.trim() : undefined,
      sectorGroup,
      status: 'active'
    } : {
      name: trimmedName,
      email: email.trim(),
      password,
      role: 'admin',
      sectorGroup: 'None',
      status: 'active'
    };

    try {
      await handleCreateUserSubmit(payload);
      resetForm();
      setShowCreateUserModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create account';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('already exist') || msg.toLowerCase().includes('duplicate')) {
        alert('An account with this email address already exists.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-modal-overlay" onClick={handleClose}>
      <div className="dashboard-modal" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-modal-header" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '18px'
            }}>
              +
            </div>
            <div>
              <h3 className="dashboard-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                {isBeneficiaryMode ? 'Add New Beneficiary' : 'Create New Admin Account'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                {isBeneficiaryMode ? 'Register a verified parish community member' : 'Create a system administrator account'}
              </p>
            </div>
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

        <form onSubmit={handleSubmit}>
          <div className="dashboard-modal-content" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {errorMessage && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid #fecaca'
              }}>
                {errorMessage}
              </div>
            )}

            <div className="dashboard-form-group">
              <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Full Name *</label>
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
              <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>
                {isBeneficiaryMode ? 'Email Address (Optional)' : 'Email Address *'}
              </label>
              <input
                type="email"
                required={!isBeneficiaryMode}
                className="dashboard-input"
                placeholder={isBeneficiaryMode ? "Optional (e.g. lourdes@example.com)" : "adminrelief@gmail.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isBeneficiaryMode ? (
              /* Admin Account Mode: Full Name, Email, Temporary Password only (No role dropdown, no phone number) */
              <div className="dashboard-form-group">
                <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Temporary Password *</label>
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
            ) : (
              /* Beneficiary Mode: Sector Group & Phone */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Select Sector / Ministry *</label>
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
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="dashboard-input"
                    placeholder="09171234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-modal-footer" style={{ justifyContent: 'center', padding: '16px 24px' }}>
            <button
              type="submit"
              className="dashboard-submit-btn"
              style={{
                width: '100%',
                maxWidth: '280px',
                justifyContent: 'center',
                background: '#2563eb',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '14px'
              }}
              disabled={loading}
            >
              {loading
                ? (isBeneficiaryMode ? 'Adding Beneficiary...' : 'Creating Admin...')
                : (isBeneficiaryMode ? 'Add Beneficiary' : 'Create Admin Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
