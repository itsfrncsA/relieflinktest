import React, { useState, useMemo } from 'react';

// Helper to match user sector group with sector cards and tab filters
const matchSector = (userSectorGroup, targetFilter) => {
  if (!targetFilter || targetFilter === 'all') return true;
  if (!userSectorGroup) return false;

  const u = userSectorGroup.toLowerCase().trim();
  const t = targetFilter.toLowerCase().trim();

  if (u === t || u.includes(t) || t.includes(u)) return true;

  // Senior Citizens
  if ((u.includes('senior') || u.includes('elderly')) && (t.includes('senior') || t.includes('elderly'))) return true;

  // Scholars / Education
  if ((u.includes('scholar') || u.includes('education') || u.includes('student')) && (t.includes('scholar') || t.includes('education') || t.includes('student'))) return true;

  // Solo Parents
  if (u.includes('solo') && t.includes('solo')) return true;

  // PWD / Persons with Disabilities
  if ((u.includes('pwd') || u.includes('disabilit')) && (t.includes('pwd') || t.includes('disabilit'))) return true;

  // Prison Ministry
  if (u.includes('prison') && t.includes('prison')) return true;

  // Calamity / Disaster / Indigent
  if ((u.includes('calamity') || u.includes('disaster') || u.includes('indigent') || u.includes('relief')) && 
      (t.includes('calamity') || t.includes('disaster') || t.includes('indigent') || t.includes('relief'))) return true;

  return false;
};

// Map sector name/code to standard tab identifier
const getStandardSectorId = (secNameOrCode) => {
  if (!secNameOrCode) return 'all';
  const s = secNameOrCode.toLowerCase();
  if (s.includes('senior')) return 'Senior Citizens';
  if (s.includes('scholar') || s.includes('education')) return 'Scholars';
  if (s.includes('solo')) return 'Solo Parents';
  if (s.includes('pwd') || s.includes('disabilit')) return 'PWD';
  if (s.includes('prison')) return 'Prison Ministry';
  if (s.includes('relief') || s.includes('calamity') || s.includes('indigent')) return 'Disaster Relief';
  return secNameOrCode;
};

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
  handleEditUser,
  handleDeleteUser,
  setShowCreateUserModal
}) => {
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState('all');
  const [sortByPriority, setSortByPriority] = useState(false);

  // Filter only genuine beneficiaries (members with an assigned parish relief / community sector)
  const beneficiaryUsers = useMemo(() => {
    return users.filter(u => {
      if (['superadmin', 'admin', 'staff'].includes(u.role)) {
        return false;
      }
      const hasSector = u.sectorGroup && u.sectorGroup !== 'None' && u.sectorGroup.trim() !== '';
      return hasSector;
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    return beneficiaryUsers.filter(u => {
      const matchesSector = matchSector(u.sectorGroup, sectorFilter);
      const q = attendeeSearchQuery.toLowerCase();
      const matchesQuery = !q || (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) || u.sectorIdNumber?.toLowerCase().includes(q));
      const matchesStatus = attendeeStatusFilter === 'all' || 
        (u.sectorGroup === 'Scholars' ? u.scholarDetails?.applicationStatus === attendeeStatusFilter : (attendeeStatusFilter === 'Active' ? u.status === 'active' : false));

      return matchesSector && matchesQuery && matchesStatus;
    });
  }, [beneficiaryUsers, sectorFilter, attendeeSearchQuery, attendeeStatusFilter]);

  return (
    <div className="dashboard-main-content">
      {/* Header with Title and Global Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Beneficiary Management
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Track parish community members, manage relief disbursements, and monitor student ministry service
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {setShowCreateUserModal && (
            <button
              type="button"
              onClick={() => setShowCreateUserModal(true)}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Beneficiary
            </button>
          )}

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
                `"${u.email && !u.email.endsWith('@relietlink.local') ? u.email : ''}"`,
                `"${u.phone || ''}"`,
                `"${u.sectorGroup || 'Unassigned'}"`,
                `"${u.sectorIdNumber || u._id}"`,
                `"${u.sectorGroup === 'Scholars' ? (u.scholarDetails?.applicationStatus || 'Pending Review') : (u.role === 'donor' ? 'Verified Donor' : 'Active Beneficiary')}"`,
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
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Beneficiaries</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{beneficiaryUsers.length}</div>
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
              const stdId = getStandardSectorId(sec.name);
              const isSelected = sectorFilter !== 'all' && matchSector(sec.name, sectorFilter);
              const memberCount = beneficiaryUsers.filter(u => matchSector(u.sectorGroup, sec.name)).length;

              return (
                <div
                  key={sec.code || sec._id || sec.name}
                  onClick={() => setSectorFilter(isSelected ? 'all' : stdId)}
                  style={{
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.15)' : '0 2px 6px rgba(15,23,42,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px', color: isSelected ? '#1e40af' : '#0f172a' }}>{sec.name}</strong>
                    <span style={{ backgroundColor: isSelected ? '#2563eb' : '#f1f5f9', color: isSelected ? '#ffffff' : '#475569', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                      {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
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
          { id: 'all', label: 'All Beneficiaries' },
          { id: 'Senior Citizens', label: 'Senior Citizens' },
          { id: 'Scholars', label: 'Scholars' },
          { id: 'Prison Ministry', label: 'Prison Ministry' },
          { id: 'PWD', label: 'PWD' },
          { id: 'Solo Parents', label: 'Solo Parents' },
          { id: 'Disaster Relief', label: 'Disaster Relief' }
        ].map(tab => {
          const isActive = tab.id === 'all'
            ? (!sectorFilter || sectorFilter === 'all')
            : matchSector(tab.id, sectorFilter);
          const count = tab.id === 'all'
            ? beneficiaryUsers.length
            : beneficiaryUsers.filter(u => matchSector(u.sectorGroup, tab.id)).length;

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

      {/* Search, Status & Prescriptive Priority Controls */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              Showing <strong style={{ color: '#0f172a' }}>{filteredUsers.length}</strong> of {users.length} members
            </span>
          </div>
        </div>
      </div>

      {/* Primary Beneficiary Table */}
      <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#ffffff', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table className="dashboard-table" style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="dashboard-th" style={{ paddingLeft: '20px', minWidth: '220px' }}>Beneficiary</th>
                <th className="dashboard-th" style={{ textAlign: 'center', minWidth: '160px' }}>Ministry Sector</th>
                <th className="dashboard-th" style={{ textAlign: 'center', minWidth: '130px' }}>Sector ID Number</th>
                <th className="dashboard-th" style={{ textAlign: 'center', minWidth: '140px' }}>Aid Status</th>
                <th className="dashboard-th" style={{ textAlign: 'right', paddingRight: '24px', minWidth: '190px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((member) => {
                const sec = (member.sectorGroup || '').toLowerCase();
                let secBg = '#eff6ff';
                let secBorder = '#bfdbfe';
                let secColor = '#1d4ed8';

                if (sec.includes('scholar')) {
                  secBg = '#eff6ff'; secBorder = '#bfdbfe'; secColor = '#1d4ed8';
                } else if (sec.includes('solo')) {
                  secBg = '#f5f3ff'; secBorder = '#ddd6fe'; secColor = '#6d28d9';
                } else if (sec.includes('senior')) {
                  secBg = '#fffbeb'; secBorder = '#fde68a'; secColor = '#b45309';
                } else if (sec.includes('pwd') || sec.includes('disabilit')) {
                  secBg = '#ecfeff'; secBorder = '#a5f3fc'; secColor = '#0e7490';
                } else if (sec.includes('prison')) {
                  secBg = '#f8fafc'; secBorder = '#cbd5e1'; secColor = '#334155';
                } else if (sec.includes('relief') || sec.includes('indigent') || sec.includes('calamity')) {
                  secBg = '#ecfdf5'; secBorder = '#a7f3d0'; secColor = '#047857';
                }

                // Determine Aid Status & Text Color (no boxes/shapes, pure text)
                let rawStatus = member.sectorGroup === 'Scholars'
                  ? (member.scholarDetails?.applicationStatus || 'Pending Review')
                  : (member.status === 'active' || member.sectorGroup ? 'Active Beneficiary' : (member.status || 'Active'));
                
                let statusText = rawStatus;
                let statusColor = '#2563eb'; // blue for active/default

                const stLower = rawStatus.toLowerCase();
                if (stLower.includes('pending') || stLower.includes('review') || stLower.includes('interview')) {
                  statusColor = '#ea580c'; // orange for pending
                } else if (stLower.includes('approved') || stLower.includes('active') || stLower.includes('verified')) {
                  statusColor = '#16a34a'; // green for approved / active
                } else if (stLower.includes('reject') || stLower.includes('suspended')) {
                  statusColor = '#dc2626'; // red for rejected
                }

                return (
                  <tr key={member._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="dashboard-td" style={{ paddingLeft: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '14px',
                          border: '1px solid #e2e8f0'
                        }}>
                          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                            {member.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {member.email && !member.email.endsWith('@relietlink.local') ? member.email : 'No email'} • {member.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="dashboard-td" style={{ textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: secBg,
                        color: secColor,
                        border: `1px solid ${secBorder}`,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'inline-block'
                      }}>
                        {member.sectorGroup || 'Unassigned'}
                      </span>
                    </td>

                    <td className="dashboard-td" style={{ textAlign: 'center' }}>
                      <code style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                        {member.sectorIdNumber || `ID-${member._id.substring(0, 6).toUpperCase()}`}
                      </code>
                    </td>

                    <td className="dashboard-td" style={{ textAlign: 'center' }}>
                      <span style={{
                        color: statusColor,
                        fontWeight: '800',
                        fontSize: '12.5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        {statusText}
                      </span>
                    </td>

                    <td className="dashboard-td" style={{ textAlign: 'right', paddingRight: '24px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setDisburseModalUser(member);
                            setDisburseAmount(member.scholarDetails?.monthlyAllowance || '1000');
                            setDisburseSectorId(member.sectorGroup || '');
                          }}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 5px rgba(16, 185, 129, 0.2)'
                          }}
                        >
                          Disburse Aid
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditUser(member)}
                          style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 2px 5px rgba(15, 23, 42, 0.15)'
                          }}
                          title="Edit member"
                        >
                          <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {handleDeleteUser && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(member)}
                            style={{
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              border: 'none',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 2px 5px rgba(15, 23, 42, 0.15)'
                            }}
                            title="Delete member record"
                          >
                            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
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
