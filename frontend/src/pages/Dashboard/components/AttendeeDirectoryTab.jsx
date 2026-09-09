import React, { useState } from 'react';

const AttendeeDirectoryTab = ({
  users,
  sectors,
  sectorFilter,
  setSectorFilter,
  showMinistryOverview,
  setShowMinistryOverview,
  handleToggleScholarService,
  setDisburseModalUser,
  setDisburseAmount,
  setDisburseSectorId,
  handleEditUser
}) => {
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    const matchesSector = sectorFilter === 'all' || (u.sectorGroup && u.sectorGroup.toLowerCase().includes(sectorFilter.toLowerCase()));
    const q = attendeeSearchQuery.toLowerCase();
    const matchesQuery = !q || (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) || u.sectorIdNumber?.toLowerCase().includes(q));
    const matchesStatus = attendeeStatusFilter === 'all' || (u.scholarDetails?.applicationStatus === attendeeStatusFilter);
    return matchesSector && matchesQuery && matchesStatus;
  });

  return (
    <div className="dashboard-main-content">
      {/* Header with Title and Global Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Attendee &amp; Beneficiary Directory
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Track parish community members, manage relief disbursements, and monitor student ministry service
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowMinistryOverview(!showMinistryOverview)}
            style={{
              backgroundColor: showMinistryOverview ? '#eff6ff' : '#ffffff',
              color: showMinistryOverview ? '#2563eb' : '#475569',
              border: '1px solid ' + (showMinistryOverview ? '#93c5fd' : '#cbd5e1'),
              padding: '9px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showMinistryOverview ? 'Hide Ministry Budgets' : 'View Ministry Budgets'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (filteredUsers.length === 0) {
                alert('No records to export');
                return;
              }
              const headers = ['Name', 'Email', 'Phone', 'Sector Group', 'Reg ID', 'App Status', 'Parish Service'];
              const rows = filteredUsers.map(u => [
                `"${u.name || ''}"`,
                `"${u.email || ''}"`,
                `"${u.phone || ''}"`,
                `"${u.sectorGroup || 'Unassigned'}"`,
                `"${u.sectorIdNumber || u._id}"`,
                `"${u.scholarDetails?.applicationStatus || 'N/A'}"`,
                `"${u.scholarDetails?.serviceStatus || 'N/A'}"`
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `Parish_Attendee_Directory_${sectorFilter}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
            }}
          >
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Compact Metric Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Registered Members</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{users.length}</div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>Across 6 Ministries</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Restricted Ministry Funds</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
            PHP {sectors.reduce((s, x) => s + (x.totalRaised || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>Allocated for Aid</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Disbursed Assistance</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
            PHP {sectors.reduce((s, x) => s + (x.totalDisbursed || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', marginTop: '2px' }}>Distributed to Beneficiaries</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining Ministry Balance</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
            PHP {(sectors.reduce((s, x) => s + (x.totalRaised || 0), 0) - sectors.reduce((s, x) => s + (x.totalDisbursed || 0), 0)).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>Available for Immediate Relief</div>
        </div>
      </div>

      {/* Collapsible Ministry Budget Breakdown */}
      {showMinistryOverview && (
        <div style={{ marginBottom: '24px', animation: 'fadeIn 0.25s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {sectors.map(sec => {
              const percent = sec.totalRaised > 0 ? Math.round((sec.totalDisbursed / sec.totalRaised) * 100) : 0;
              const isSelected = sectorFilter.toLowerCase().includes(sec.name.toLowerCase()) || sectorFilter === sec.name;
              return (
                <div
                  key={sec.code}
                  onClick={() => setSectorFilter(isSelected ? 'all' : sec.name)}
                  style={{
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px', color: isSelected ? '#1e40af' : '#0f172a' }}>{sec.name}</strong>
                    <span style={{ backgroundColor: isSelected ? '#2563eb' : '#f1f5f9', color: isSelected ? '#ffffff' : '#475569', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                      {sec.memberCount} Members
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                    <span>Raised: PHP {sec.totalRaised?.toLocaleString()}</span>
                    <span>Disbursed: PHP {sec.totalDisbursed?.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(percent, 100)}%`, backgroundColor: isSelected ? '#2563eb' : '#10b981' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Filter Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {[
          { id: 'all', label: 'All Groups' },
          { id: 'Senior Citizens', label: 'Senior Citizens' },
          { id: 'Scholars', label: 'Scholars' },
          { id: 'Prison Ministry', label: 'Prison Ministry' },
          { id: 'Persons with Disabilities (PWD)', label: 'PWD' },
          { id: 'Solo Parents', label: 'Solo Parents' },
          { id: 'Disaster Relief', label: 'Disaster Relief' }
        ].map(tab => {
          const isActive = sectorFilter.toLowerCase().includes(tab.id.toLowerCase()) || sectorFilter === tab.id;
          const count = tab.id === 'all'
            ? users.length
            : users.filter(u => u.sectorGroup && u.sectorGroup.toLowerCase().includes(tab.id.toLowerCase())).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSectorFilter(tab.id)}
              style={{
                backgroundColor: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                border: '1px solid ' + (isActive ? '#2563eb' : '#cbd5e1'),
                borderRadius: '24px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.25)' : '0 1px 3px rgba(15,23,42,0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                borderRadius: '12px',
                padding: '1px 8px',
                fontSize: '11px',
                marginLeft: '2px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Status Controls */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by name, email, phone, or sector ID..."
              value={attendeeSearchQuery}
              onChange={(e) => setAttendeeSearchQuery(e.target.value)}
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

          <select
            value={attendeeStatusFilter}
            onChange={(e) => setAttendeeStatusFilter(e.target.value)}
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
            <option value="all">All Relief Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Active">Active</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
          Showing <strong style={{ color: '#0f172a' }}>{filteredUsers.length}</strong> of {users.length} members
        </div>
      </div>

      {/* Primary Attendee Table */}
      <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="dashboard-th">Beneficiary / Member</th>
                <th className="dashboard-th">Ministry Sector</th>
                <th className="dashboard-th">Sector ID Number</th>
                <th className="dashboard-th">Relief / Scholarship Status</th>
                <th className="dashboard-th">Parish Ministry Service</th>
                <th className="dashboard-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(member => (
                <tr key={member._id}>
                  <td className="dashboard-td">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '14px',
                        border: '1px solid #dbeafe'
                      }}>
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{member.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{member.email} • {member.phone || 'No phone'}</div>
                        {member.scholarDetails?.school && (
                          <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px', fontWeight: '500' }}>
                            Scholar: {member.scholarDetails.school} ({member.scholarDetails.yearLevel || 'N/A'})
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="dashboard-td">
                    <span style={{
                      backgroundColor: member.sectorGroup === 'Scholars' ? '#dbeafe' : member.sectorGroup === 'Senior Citizens' ? '#fef3c7' : member.sectorGroup === 'PWD' ? '#fae8ff' : member.sectorGroup === 'Prison Ministry' ? '#e2e8f0' : '#eff6ff',
                      color: member.sectorGroup === 'Scholars' ? '#1e40af' : member.sectorGroup === 'Senior Citizens' ? '#92400e' : member.sectorGroup === 'PWD' ? '#86198f' : member.sectorGroup === 'Prison Ministry' ? '#334155' : '#1e40af',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {member.sectorGroup || 'Unassigned'}
                    </span>
                  </td>

                  <td className="dashboard-td">
                    <code style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                      {member.sectorIdNumber || `ID-${member._id.substring(0, 6).toUpperCase()}`}
                    </code>
                  </td>

                  <td className="dashboard-td">
                    {member.sectorGroup === 'Scholars' || member.scholarDetails?.applicationStatus ? (
                      <span style={{
                        backgroundColor: 
                          ['Approved', 'Active'].includes(member.scholarDetails?.applicationStatus) ? '#dcfce7' : 
                          member.scholarDetails?.applicationStatus === 'Interview Scheduled' ? '#e0f2fe' :
                          member.scholarDetails?.applicationStatus === 'Completed' ? '#f3e8ff' :
                          member.scholarDetails?.applicationStatus === 'Rejected' ? '#fee2e2' : '#fef3c7',
                        color: 
                          ['Approved', 'Active'].includes(member.scholarDetails?.applicationStatus) ? '#166534' : 
                          member.scholarDetails?.applicationStatus === 'Interview Scheduled' ? '#0369a1' :
                          member.scholarDetails?.applicationStatus === 'Completed' ? '#6b21a8' :
                          member.scholarDetails?.applicationStatus === 'Rejected' ? '#991b1b' : '#92400e',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'inline-block'
                      }}>
                        ● {member.scholarDetails?.applicationStatus || 'Pending Review'}
                      </span>
                    ) : (
                      <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
                        Standard Member
                      </span>
                    )}
                  </td>

                  <td className="dashboard-td">
                    {member.sectorGroup === 'Scholars' || member.scholarDetails?.school ? (
                      <button
                        type="button"
                        onClick={() => handleToggleScholarService(member)}
                        style={{
                          backgroundColor: member.scholarDetails?.serviceStatus === 'Served' ? '#dcfce7' : '#fef9c3',
                          color: member.scholarDetails?.serviceStatus === 'Served' ? '#166534' : '#854d0e',
                          border: '1px solid ' + (member.scholarDetails?.serviceStatus === 'Served' ? '#bbf7d0' : '#fef08a'),
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Click to toggle parish service status"
                      >
                        {member.scholarDetails?.serviceStatus === 'Served' ? 'Service Rendered' : 'Pending Service'}
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                    )}
                  </td>

                  <td className="dashboard-td" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setDisburseModalUser(member);
                          setDisburseAmount(member.scholarDetails?.monthlyAllowance || '1000');
                          setDisburseSectorId(member.sectorGroup || '');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                        }}
                      >
                        Disburse Aid
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditUser(member)}
                        className="action-btn edit-btn"
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}
                      >
                        Edit
                      </button>
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
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#334155' }}>No beneficiaries match your filter criteria.</p>
                    <p style={{ margin: '4px 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>Try resetting your search query or choosing "All Groups".</p>
                    <button
                      type="button"
                      onClick={() => { setSectorFilter('all'); setAttendeeSearchQuery(''); setAttendeeStatusFilter('all'); }}
                      style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Reset All Filters
                    </button>
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

export default AttendeeDirectoryTab;
