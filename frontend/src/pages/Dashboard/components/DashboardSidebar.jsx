import React from 'react';

const DashboardSidebar = ({
  mainTab,
  setMainTab,
  currentUser,
  handleLogout,
  userManagementSubTab,
  setUserManagementSubTab
}) => {
  const userName = currentUser?.name || 'Francis Arillo';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const userRole = currentUser?.role === 'superadmin' ? 'Superadmin' : (currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Admin');

  return (
    <aside className="dashboard-sidebar">
      {/* Brand Header */}
      <div className="dashboard-sidebar-header" style={{ padding: '6px 8px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
              ReliefLink
            </h2>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', letterSpacing: '0.2px' }}>
              Parish Treasury &amp; Aid
            </span>
          </div>

          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
            flexShrink: 0
          }}>
            <img
              src="/logo2.png"
              alt="ReliefLink Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/LOGO.png'; }}
            />
          </div>
        </div>

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{
            position: 'relative',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {userInitials || 'FA'}
            <span style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #ffffff'
            }}></span>
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '10px',
                backgroundColor: userRole === 'Superadmin' ? '#f5f3ff' : '#eff6ff',
                color: userRole === 'Superadmin' ? '#7c3aed' : '#2563eb',
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="dashboard-sidebar-nav">
        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'overview' ? 'active' : ''}`}
          onClick={() => setMainTab('overview')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'donations' ? 'active' : ''}`}
          onClick={() => setMainTab('donations')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Donations &amp; Receipts</span>
        </button>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'sectors' ? 'active' : ''}`}
          onClick={() => setMainTab('sectors')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Attendee List</span>
        </button>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'reports' ? 'active' : ''}`}
          onClick={() => setMainTab('reports')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Financial Audit &amp; Reports</span>
        </button>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setMainTab('announcements')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span>Announcements</span>
        </button>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setMainTab('expenses')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Expenses</span>
        </button>

        {currentUser?.role === 'superadmin' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              type="button"
              className={`dashboard-sidebar-link ${mainTab === 'users' ? 'active' : ''}`}
              onClick={() => setMainTab('users')}
            >
              <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Users</span>
            </button>

            {/* Sub navigation links under Users */}
            {mainTab === 'users' && (
              <div style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', marginBottom: '6px' }}>
                <button
                  type="button"
                  onClick={() => setUserManagementSubTab('admins')}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: userManagementSubTab === 'admins' ? '700' : '500',
                    color: userManagementSubTab === 'admins' ? '#2563eb' : '#64748b',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: userManagementSubTab === 'admins' ? '#eff6ff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: userManagementSubTab === 'admins' ? '#2563eb' : '#94a3b8' }}></span>
                  Admins &amp; Staff
                </button>
                <button
                  type="button"
                  onClick={() => setUserManagementSubTab('registered')}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: userManagementSubTab === 'registered' ? '700' : '500',
                    color: userManagementSubTab === 'registered' ? '#2563eb' : '#64748b',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: userManagementSubTab === 'registered' ? '#eff6ff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: userManagementSubTab === 'registered' ? '#2563eb' : '#94a3b8' }}></span>
                  Registered Members
                </button>
                <button
                  type="button"
                  onClick={() => setUserManagementSubTab('pending')}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: userManagementSubTab === 'pending' ? '700' : '500',
                    color: userManagementSubTab === 'pending' ? '#2563eb' : '#64748b',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: userManagementSubTab === 'pending' ? '#eff6ff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: userManagementSubTab === 'pending' ? '#2563eb' : '#94a3b8' }}></span>
                  Pending Approval
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'transparency' ? 'active' : ''}`}
          onClick={() => setMainTab('transparency')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Transparency</span>
        </button>
      </nav>

      <div className="dashboard-sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          className="dashboard-logout-btn"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
