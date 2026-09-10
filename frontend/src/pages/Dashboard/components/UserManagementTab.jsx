import React, { useState } from 'react';

const UserManagementTab = ({
  users,
  userManagementSubTab,
  setUserManagementSubTab,
  handleEditUser,
  handleDeleteUser,
  handleResetUserPassword,
  handleApproveUser,
  handleDeactivateUser,
  formatCurrency
}) => {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Filter users based on sub-tab
  const adminsList = users.filter(u => u.role === 'admin' || u.role === 'superadmin' || u.role === 'staff');
  const registeredList = users.filter(u => u.role !== 'admin' && u.role !== 'superadmin' && u.status !== 'pending');
  const pendingList = users.filter(u => u.status === 'pending');

  let baseList = users;
  if (userManagementSubTab === 'admins') {
    baseList = adminsList;
  } else if (userManagementSubTab === 'registered') {
    baseList = registeredList;
  } else if (userManagementSubTab === 'pending') {
    baseList = pendingList;
  }

  const filteredUsers = baseList.filter(u => {
    const q = searchText.toLowerCase();
    const matchesSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.sectorGroup?.toLowerCase().includes(q);

    const matchesRole =
      roleFilter === 'all' ? true :
      (u.role || 'user') === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="dashboard-main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="dashboard-section-title" style={{ margin: 0 }}>User &amp; Access Management</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Manage administrative privileges, staff authorizations, and parish community beneficiaries
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Total Accounts:</span>
          <span style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '13px', padding: '3px 10px', borderRadius: '12px' }}>
            {users.length}
          </span>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setUserManagementSubTab('all')}
          style={{
            backgroundColor: userManagementSubTab === 'all' ? '#2563eb' : '#ffffff',
            color: userManagementSubTab === 'all' ? '#ffffff' : '#334155',
            border: '1px solid ' + (userManagementSubTab === 'all' ? '#2563eb' : '#cbd5e1'),
            borderRadius: '24px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: userManagementSubTab === 'all' ? '0 4px 12px rgba(37,99,235,0.25)' : '0 1px 3px rgba(15,23,42,0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>All Users</span>
          <span style={{
            backgroundColor: userManagementSubTab === 'all' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
            color: userManagementSubTab === 'all' ? '#ffffff' : '#64748b',
            borderRadius: '12px',
            padding: '1px 8px',
            fontSize: '11px'
          }}>
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setUserManagementSubTab('admins')}
          style={{
            backgroundColor: userManagementSubTab === 'admins' ? '#2563eb' : '#ffffff',
            color: userManagementSubTab === 'admins' ? '#ffffff' : '#334155',
            border: '1px solid ' + (userManagementSubTab === 'admins' ? '#2563eb' : '#cbd5e1'),
            borderRadius: '24px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: userManagementSubTab === 'admins' ? '0 4px 12px rgba(37,99,235,0.25)' : '0 1px 3px rgba(15,23,42,0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Admins &amp; Staff</span>
          <span style={{
            backgroundColor: userManagementSubTab === 'admins' ? 'rgba(255,255,255,0.25)' : '#eff6ff',
            color: userManagementSubTab === 'admins' ? '#ffffff' : '#1d4ed8',
            borderRadius: '12px',
            padding: '1px 8px',
            fontSize: '11px',
            fontWeight: '800'
          }}>
            {adminsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setUserManagementSubTab('registered')}
          style={{
            backgroundColor: userManagementSubTab === 'registered' ? '#2563eb' : '#ffffff',
            color: userManagementSubTab === 'registered' ? '#ffffff' : '#334155',
            border: '1px solid ' + (userManagementSubTab === 'registered' ? '#2563eb' : '#cbd5e1'),
            borderRadius: '24px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: userManagementSubTab === 'registered' ? '0 4px 12px rgba(37,99,235,0.25)' : '0 1px 3px rgba(15,23,42,0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Registered Members</span>
          <span style={{
            backgroundColor: userManagementSubTab === 'registered' ? 'rgba(255,255,255,0.25)' : '#ecfdf5',
            color: userManagementSubTab === 'registered' ? '#ffffff' : '#059669',
            borderRadius: '12px',
            padding: '1px 8px',
            fontSize: '11px',
            fontWeight: '800'
          }}>
            {registeredList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setUserManagementSubTab('pending')}
          style={{
            backgroundColor: userManagementSubTab === 'pending' ? '#2563eb' : '#ffffff',
            color: userManagementSubTab === 'pending' ? '#ffffff' : '#334155',
            border: '1px solid ' + (userManagementSubTab === 'pending' ? '#2563eb' : '#cbd5e1'),
            borderRadius: '24px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: userManagementSubTab === 'pending' ? '0 4px 12px rgba(37,99,235,0.25)' : '0 1px 3px rgba(15,23,42,0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Pending Approvals</span>
          <span style={{
            backgroundColor: userManagementSubTab === 'pending' ? 'rgba(255,255,255,0.25)' : '#fff1f2',
            color: userManagementSubTab === 'pending' ? '#ffffff' : '#e11d48',
            borderRadius: '12px',
            padding: '1px 8px',
            fontSize: '11px',
            fontWeight: '800'
          }}>
            {pendingList.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Strip */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <input
              type="text"
              placeholder={`Search in ${userManagementSubTab === 'admins' ? 'Admins' : userManagementSubTab === 'registered' ? 'Registered Members' : 'Users'} by name, email, department...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                boxSizing: 'border-box'
              }}
            />
            <svg style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {userManagementSubTab === 'all' && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                backgroundColor: '#f8fafc'
              }}
            >
              <option value="all">All Roles</option>
              <option value="superadmin">👑 Superadmin</option>
              <option value="admin">🛡️ Admin</option>
              <option value="staff">📋 Staff</option>
              <option value="relief_worker">📦 Relief Worker</option>
              <option value="volunteer">🤝 Volunteer</option>
              <option value="donor">💖 Donor</option>
              <option value="user">👤 User / Beneficiary</option>
            </select>
          )}
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
          Showing <strong style={{ color: '#0f172a' }}>{filteredUsers.length}</strong> of {baseList.length} accounts
        </div>
      </div>

      {/* Users Table */}
      <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="dashboard-th">User Profile</th>
                <th className="dashboard-th">Role</th>
                <th className="dashboard-th">Ministry / Department</th>
                <th className="dashboard-th">Account Status</th>
                <th className="dashboard-th">Registered Date</th>
                <th className="dashboard-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="dashboard-td">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: user.role === 'superadmin' ? '#eff6ff' : user.role === 'admin' ? '#f0fdf4' : user.role === 'staff' ? '#f0fdfa' : user.role === 'volunteer' ? '#fffbeb' : '#f8fafc',
                        color: user.role === 'superadmin' ? '#1d4ed8' : user.role === 'admin' ? '#16a34a' : user.role === 'staff' ? '#0d9488' : user.role === 'volunteer' ? '#d97706' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '14px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="dashboard-td">
                    <span style={{
                      backgroundColor:
                        user.role === 'superadmin' ? '#eff6ff' :
                        user.role === 'admin' ? '#f0fdf4' :
                        user.role === 'staff' ? '#f0fdfa' :
                        user.role === 'relief_worker' ? '#e0f2fe' :
                        user.role === 'volunteer' ? '#fffbeb' :
                        user.role === 'donor' ? '#fdf2f8' : '#f1f5f9',
                      color:
                        user.role === 'superadmin' ? '#1e40af' :
                        user.role === 'admin' ? '#166534' :
                        user.role === 'staff' ? '#0f766e' :
                        user.role === 'relief_worker' ? '#0369a1' :
                        user.role === 'volunteer' ? '#b45309' :
                        user.role === 'donor' ? '#be185d' : '#475569',
                      border: '1px solid ' + (
                        user.role === 'superadmin' ? '#bfdbfe' :
                        user.role === 'admin' ? '#bbf7d0' :
                        user.role === 'staff' ? '#99f6e4' :
                        user.role === 'relief_worker' ? '#bae6fd' :
                        user.role === 'volunteer' ? '#fde68a' :
                        user.role === 'donor' ? '#fbcfe8' : '#e2e8f0'
                      ),
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {user.role || 'user'}
                    </span>
                  </td>

                  <td className="dashboard-td">
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                      {user.sectorGroup || user.department || 'General Community'}
                    </span>
                  </td>

                  <td className="dashboard-td">
                    <span className={`status-badge ${user.status || 'active'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>

                  <td className="dashboard-td" style={{ fontSize: '12px', color: '#64748b' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>

                  <td className="dashboard-td" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {user.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleApproveUser && handleApproveUser(user._id)}
                          style={{
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditUser(user)}
                        className="action-btn edit-btn"
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetUserPassword(user)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Reset
                      </button>

                      {handleDeleteUser && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                          title="Permanently delete this user"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                      <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#334155' }}>No accounts found.</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Try clearing your search query or selecting another tab.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTab;
