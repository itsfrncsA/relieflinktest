import React, { useState } from 'react';

const DashboardSidebar = ({
  mainTab,
  setMainTab,
  currentUser,
  handleLogout,
  userManagementSubTab,
  setUserManagementSubTab,
  sectorFilter,
  setSectorFilter
}) => {
  const [isUserMenuHovered, setIsUserMenuHovered] = useState(false);
  const [isBeneficiaryMenuHovered, setIsBeneficiaryMenuHovered] = useState(false);
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
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              <span style={{ color: '#ffffff' }}>Relief</span>
              <span style={{ color: '#f59e0b' }}>Link</span>
            </h2>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.2px' }}>
              Sto. Domingo Parish • Treasury &amp; Aid
            </span>
          </div>

          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            flexShrink: 0
          }}>
            <img
              src="/logo2.png"
              alt="ReliefLink Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/assets/logo2.png'; }}
            />
          </div>
        </div>

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1.5px solid rgba(255, 255, 255, 0.3)'
          }}>
            {userInitials || 'FA'}
            <span style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #0f172a'
            }}></span>
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '8px',
                backgroundColor: userRole === 'Superadmin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(37, 99, 235, 0.25)',
                color: userRole === 'Superadmin' ? '#f59e0b' : '#60a5fa',
                border: userRole === 'Superadmin' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(96, 165, 250, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
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
          <span>Admin Dashboard</span>
        </button>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'donations' ? 'active' : ''}`}
          onClick={() => setMainTab('donations')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Donation Management</span>
        </button>

        <div
          onMouseEnter={() => setIsBeneficiaryMenuHovered(true)}
          onMouseLeave={() => setIsBeneficiaryMenuHovered(false)}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <button
            type="button"
            className={`dashboard-sidebar-link ${mainTab === 'sectors' ? 'active' : ''}`}
            onClick={() => {
              setMainTab('sectors');
              if (setSectorFilter) setSectorFilter('all');
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Beneficiary Management</span>
            </div>
            <svg
              style={{
                width: '14px',
                height: '14px',
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isBeneficiaryMenuHovered ? 'rotate(180deg)' : 'rotate(0deg)',
                color: isBeneficiaryMenuHovered ? '#ffffff' : '#64748b'
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Beneficiary Dropdown submenu (Only down when hovered, goes up when done hovering) */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: isBeneficiaryMenuHovered ? '280px' : '0px',
              opacity: isBeneficiaryMenuHovered ? 1 : 0,
              transform: isBeneficiaryMenuHovered ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              paddingLeft: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              marginTop: isBeneficiaryMenuHovered ? '4px' : '0px',
              marginBottom: isBeneficiaryMenuHovered ? '6px' : '0px'
            }}
          >
            {[
              { id: 'all', label: 'All Beneficiaries' },
              { id: 'Senior Citizens', label: 'Senior Citizens' },
              { id: 'Scholars', label: 'Scholars' },
              { id: 'Prison Ministry', label: 'Prison Ministry' },
              { id: 'PWD', label: 'PWD' },
              { id: 'Solo Parents', label: 'Solo Parents' },
              { id: 'Disaster Relief', label: 'Disaster Relief' }
            ].map((sec) => {
              const isActive = mainTab === 'sectors' && (
                sec.id === 'all' 
                  ? (!sectorFilter || sectorFilter === 'all') 
                  : (sectorFilter && sectorFilter.toLowerCase().includes(sec.id.toLowerCase()))
              );
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setMainTab('sectors');
                    if (setSectorFilter) setSectorFilter(sec.id);
                  }}
                  style={{
                    background: isActive ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                    border: isActive ? '1px solid rgba(96, 165, 250, 0.35)' : '1px solid transparent',
                    textAlign: 'left',
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#60a5fa' : '#94a3b8',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isActive ? '#60a5fa' : '#64748b' }}></span>
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'reports' ? 'active' : ''}`}
          onClick={() => setMainTab('reports')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Reports</span>
        </button>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'documents' ? 'active' : ''}`}
          onClick={() => setMainTab('documents')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5a1 1 0 001 1h5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
          </svg>
          <span>Documents</span>
        </button>

        <button
          type="button"
          className={`dashboard-sidebar-link ${mainTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setMainTab('announcements')}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span>Announcement</span>
        </button>

        {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || !currentUser?.role) && (
          <div
            onMouseEnter={() => setIsUserMenuHovered(true)}
            onMouseLeave={() => setIsUserMenuHovered(false)}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <button
              type="button"
              className={`dashboard-sidebar-link ${mainTab === 'users' ? 'active' : ''}`}
              onClick={() => {
                setMainTab('users');
                if (setUserManagementSubTab) setUserManagementSubTab('all');
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>User Management</span>
              </div>
              <svg
                style={{
                  width: '14px',
                  height: '14px',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isUserMenuHovered ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: isUserMenuHovered ? '#ffffff' : '#64748b'
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown submenu that drops down on hover and smoothly goes up when done hovering */}
            <div
              style={{
                overflow: 'hidden',
                maxHeight: isUserMenuHovered ? '180px' : '0px',
                opacity: isUserMenuHovered ? 1 : 0,
                transform: isUserMenuHovered ? 'translateY(0)' : 'translateY(-8px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                paddingLeft: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                marginTop: isUserMenuHovered ? '4px' : '0px',
                marginBottom: isUserMenuHovered ? '6px' : '0px'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMainTab('users');
                  if (setUserManagementSubTab) setUserManagementSubTab('all');
                }}
                style={{
                  background: (mainTab === 'users' && (userManagementSubTab === 'all' || !userManagementSubTab)) ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                  border: (mainTab === 'users' && (userManagementSubTab === 'all' || !userManagementSubTab)) ? '1px solid rgba(96, 165, 250, 0.35)' : '1px solid transparent',
                  textAlign: 'left',
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  fontWeight: (mainTab === 'users' && (userManagementSubTab === 'all' || !userManagementSubTab)) ? '700' : '500',
                  color: (mainTab === 'users' && (userManagementSubTab === 'all' || !userManagementSubTab)) ? '#60a5fa' : '#94a3b8',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (mainTab === 'users' && (userManagementSubTab === 'all' || !userManagementSubTab)) ? '#60a5fa' : '#64748b' }}></span>
                All Accounts
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainTab('users');
                  if (setUserManagementSubTab) setUserManagementSubTab('admins');
                }}
                style={{
                  background: (mainTab === 'users' && userManagementSubTab === 'admins') ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                  border: (mainTab === 'users' && userManagementSubTab === 'admins') ? '1px solid rgba(96, 165, 250, 0.35)' : '1px solid transparent',
                  textAlign: 'left',
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  fontWeight: (mainTab === 'users' && userManagementSubTab === 'admins') ? '700' : '500',
                  color: (mainTab === 'users' && userManagementSubTab === 'admins') ? '#60a5fa' : '#94a3b8',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (mainTab === 'users' && userManagementSubTab === 'admins') ? '#60a5fa' : '#64748b' }}></span>
                Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainTab('users');
                  if (setUserManagementSubTab) setUserManagementSubTab('registered');
                }}
                style={{
                  background: (mainTab === 'users' && userManagementSubTab === 'registered') ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                  border: (mainTab === 'users' && userManagementSubTab === 'registered') ? '1px solid rgba(96, 165, 250, 0.35)' : '1px solid transparent',
                  textAlign: 'left',
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  fontWeight: (mainTab === 'users' && userManagementSubTab === 'registered') ? '700' : '500',
                  color: (mainTab === 'users' && userManagementSubTab === 'registered') ? '#60a5fa' : '#94a3b8',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (mainTab === 'users' && userManagementSubTab === 'registered') ? '#60a5fa' : '#64748b' }}></span>
                Registered Members
              </button>
            </div>
          </div>
        )}

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
