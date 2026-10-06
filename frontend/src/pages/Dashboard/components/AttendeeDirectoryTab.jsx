import React, { useState, useMemo } from 'react';

// Helper to match user sector group with sector cards and tab filters
const matchSector = (userSectorGroup, targetFilter) => {
  if (!targetFilter || targetFilter === 'all') return true;
  if (!userSectorGroup) return false;

  const u = userSectorGroup.toLowerCase().trim();
  const t = targetFilter.toLowerCase().trim();

  if (u === t || u.includes(t) || t.includes(u)) return true;

  // LGBTQ
  if (u.includes('lgbtq') && t.includes('lgbtq')) return true;

  // Elderly / Senior
  if ((u.includes('elderly') || u.includes('senior')) && (t.includes('elderly') || t.includes('senior'))) return true;

  // PDL (nakakolong) / Prison
  if ((u.includes('pdl') || u.includes('nakakolong') || u.includes('prison')) && (t.includes('pdl') || t.includes('nakakolong') || t.includes('prison'))) return true;

  // Urban Poor / Indigent
  if ((u.includes('urban') || u.includes('poor')) && (t.includes('urban') || t.includes('poor'))) return true;

  // Migrant
  if (u.includes('migrant') && t.includes('migrant')) return true;

  // Student Scholarships / Scholars
  if ((u.includes('scholar') || u.includes('student')) && (t.includes('scholar') || t.includes('student'))) return true;

  // Drug rehabilitation.
  if ((u.includes('drug') || u.includes('rehab')) && (t.includes('drug') || t.includes('rehab'))) return true;

  return false;
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
  handleApproveBeneficiary,
  setShowCreateUserModal
}) => {
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Export CSV Options Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSectorChoice, setExportSectorChoice] = useState('all');

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
      return matchesSector && matchesQuery;
    });
  }, [beneficiaryUsers, sectorFilter, attendeeSearchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleTabChange = (tabId) => {
    setSectorFilter(tabId);
    setCurrentPage(1);
  };

  const handleExportExecute = () => {
    let toExport = [...beneficiaryUsers];

    if (exportSectorChoice !== 'all') {
      toExport = toExport.filter(u => matchSector(u.sectorGroup, exportSectorChoice));
    }

    if (toExport.length === 0) {
      alert('No beneficiary records match the export criteria.');
      return;
    }

    const headers = ['Beneficiary Name', 'Email', 'Phone', 'Ministry Sector', 'Beneficiary Number'];
    const rows = toExport.map(u => [
      `"${u.name || ''}"`,
      `"${u.email && !u.email.endsWith('@relietlink.local') ? u.email : ''}"`,
      `"${u.phone || ''}"`,
      `"${u.sectorGroup || 'Unassigned'}"`,
      `"${u.sectorIdNumber || `BN-${(u._id || '').substring(0, 8).toUpperCase()}`}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Beneficiary_Directory_${exportSectorChoice}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  return (
    <div className="dashboard-main-content">
      {/* Header with Title and Global Actions (Ministry Budget button removed) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Beneficiary Management
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Track parish community members, manage relief disbursements, and monitor aid allocations
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
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
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
            onClick={() => setShowExportModal(true)}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stat Cards Strip - All Black Typography */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Beneficiaries</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{beneficiaryUsers.length}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Restricted Ministry Funds</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            PHP {sectors.reduce((s, x) => s + (x.totalRaised || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Allocated for Aid</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Disbursed Assistance</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            PHP {sectors.reduce((s, x) => s + (x.totalDisbursed || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Distributed to Beneficiaries</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining Ministry Balance</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            PHP {(sectors.reduce((s, x) => s + (x.totalRaised || 0), 0) - sectors.reduce((s, x) => s + (x.totalDisbursed || 0), 0)).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Available for Immediate Relief</div>
        </div>
      </div>

      {/* Search Bar & Counter */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
        <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '500px' }}>
          <input
            type="text"
            placeholder="Search by name, email, phone, or sector ID..."
            value={attendeeSearchQuery}
            onChange={(e) => { setAttendeeSearchQuery(e.target.value); setCurrentPage(1); }}
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

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            Showing <strong style={{ color: '#0f172a' }}>{paginatedUsers.length}</strong> of {filteredUsers.length} members
          </div>
        </div>
      </div>

      {/* Primary Beneficiary Table */}
      <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#ffffff', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table className="dashboard-table" style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="dashboard-th" style={{ paddingLeft: '20px', minWidth: '220px' }}>Beneficiary</th>
                <th className="dashboard-th" style={{ textAlign: 'center', minWidth: '160px' }}>Ministry Sector</th>
                <th className="dashboard-th" style={{ textAlign: 'center', minWidth: '160px' }}>Beneficiary Number</th>
                <th className="dashboard-th" style={{ textAlign: 'right', paddingRight: '24px', minWidth: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((member) => {
                const sec = (member.sectorGroup || '').toLowerCase();
                let secBg = '#eff6ff';
                let secBorder = '#bfdbfe';
                let secColor = '#1d4ed8';

                if (sec.includes('scholar') || sec.includes('student')) {
                  secBg = '#eff6ff'; secBorder = '#bfdbfe'; secColor = '#1d4ed8';
                } else if (sec.includes('lgbtq')) {
                  secBg = '#fdf2f8'; secBorder = '#fbcfe8'; secColor = '#db2777';
                } else if (sec.includes('elderly') || sec.includes('senior')) {
                  secBg = '#fffbeb'; secBorder = '#fde68a'; secColor = '#b45309';
                } else if (sec.includes('pdl') || sec.includes('nakakolong') || sec.includes('prison')) {
                  secBg = '#f8fafc'; secBorder = '#cbd5e1'; secColor = '#334155';
                } else if (sec.includes('urban') || sec.includes('poor')) {
                  secBg = '#ecfdf5'; secBorder = '#a7f3d0'; secColor = '#047857';
                } else if (sec.includes('migrant')) {
                  secBg = '#f5f3ff'; secBorder = '#ddd6fe'; secColor = '#6d28d9';
                } else if (sec.includes('drug') || sec.includes('rehab')) {
                  secBg = '#fff7ed'; secBorder = '#fed7aa'; secColor = '#c2410c';
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
                          {member.name ? member.name.charAt(0).toUpperCase() : 'B'}
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
                        {member.sectorIdNumber || `BN-${member._id.substring(0, 6).toUpperCase()}`}
                      </code>
                    </td>

                    <td className="dashboard-td" style={{ textAlign: 'right', paddingRight: '24px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {/* Eye Icon for View details */}
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
                          title="View beneficiary details"
                        >
                          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                      <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#334155' }}>No beneficiaries match your filter criteria.</p>
                    <p style={{ margin: '4px 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>Try resetting your search query or selecting "All Beneficiaries".</p>
                    <button
                      type="button"
                      onClick={() => { setSectorFilter('all'); setAttendeeSearchQuery(''); setCurrentPage(1); }}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
              Page {currentPage} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                  color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                &larr; Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid ' + (currentPage === pageNum ? '#2563eb' : '#cbd5e1'),
                    background: currentPage === pageNum ? '#2563eb' : '#ffffff',
                    color: currentPage === pageNum ? '#ffffff' : '#0f172a',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '12px'
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                  color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="dashboard-modal" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="dashboard-modal-title">Export Beneficiaries</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Choose sector to export to CSV</p>
                </div>
              </div>
              <button
                type="button"
                className="dashboard-close-btn"
                onClick={() => setShowExportModal(false)}
                aria-label="Close"
              >
                <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="dashboard-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 20px' }}>
              <div className="dashboard-form-group">
                <label className="dashboard-label">Ministry / Sector to Export</label>
                <select
                  value={exportSectorChoice}
                  onChange={(e) => setExportSectorChoice(e.target.value)}
                  className="dashboard-select"
                >
                  <option value="all">All Sectors &amp; Ministries</option>
                  <option value="LGBTQ">LGBTQ</option>
                  <option value="Elderly">Elderly</option>
                  <option value="PDL (nakakolong)">PDL (nakakolong)</option>
                  <option value="Urban Poor">Urban Poor</option>
                  <option value="Migrant">Migrant</option>
                  <option value="Student Scholarships">Student Scholarships</option>
                  <option value="Drug rehabilitation.">Drug rehabilitation.</option>
                </select>
              </div>
            </div>

            <div className="dashboard-modal-footer">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="dashboard-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportExecute}
                className="dashboard-submit-btn"
                style={{ backgroundColor: '#2563eb' }}
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeeDirectoryTab;
