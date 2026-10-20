import React, { useState, useMemo } from 'react';

const DonationsTab = ({
  donations,
  sectors,
  formatCurrency,
  setSelectedDonation,
  deleteDonation,
  getDonationStatus,
  setShowRecordDonationModal
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to resolve new statuses: 'fully used' | 'partially used' | 'cash on hand' | 'pending'
  const resolveStatus = (d) => {
    const s = (d.status || d.verificationStatus || '').toLowerCase();
    if (s === 'fully used' || s === 'partially used' || s === 'cash on hand') return s;
    if (s === 'pending') return 'pending';
    if (s === 'rejected' || s === 'cancelled' || s === 'canceled' || s === 'failed') return 'rejected';
    if (d.remainingBalance === 0 && d.amount > 0 && d.usageLogs && d.usageLogs.length > 0) return 'fully used';
    if (typeof d.remainingBalance === 'number' && d.remainingBalance > 0 && d.remainingBalance < d.amount) return 'partially used';
    if (s === 'approved' || s === 'completed' || s === 'verified') return 'cash on hand';
    return s || 'cash on hand';
  };

  const getRemainingBalance = (d) => {
    const st = resolveStatus(d);
    if (st === 'fully used' || st === 'rejected') return 0;
    if (d.remainingBalance !== undefined && d.remainingBalance !== null && !isNaN(d.remainingBalance)) {
      if ((st === 'cash on hand' || st === 'pending') && d.remainingBalance === 0 && (!d.usageLogs || d.usageLogs.length === 0)) {
        return Number(d.amount || 0);
      }
      return Number(d.remainingBalance);
    }
    return Number(d.amount || 0);
  };

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStatusFilter, setExportStatusFilter] = useState('all');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const approvedDonations = donations.filter(d => {
    const st = resolveStatus(d);
    return st !== 'rejected' && st !== 'pending';
  });
  const totalDonationsAmount = approvedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalAvailableOnHand = approvedDonations.reduce((sum, d) => sum + getRemainingBalance(d), 0);
  const totalUtilized = Math.max(0, totalDonationsAmount - totalAvailableOnHand);

  const handleExportConfirm = () => {
    if (exportStartDate && exportEndDate) {
      if (new Date(exportStartDate) > new Date(exportEndDate)) {
        alert('Start date cannot be after end date.');
        return;
      }
    }

    let toExport = [...donations];

    if (exportStatusFilter !== 'all') {
      toExport = toExport.filter(d => resolveStatus(d).toLowerCase() === exportStatusFilter.toLowerCase());
    }

    if (exportStartDate) {
      const [sy, sm, sd] = exportStartDate.split('-').map(Number);
      const startOfDay = new Date(sy, sm - 1, sd, 0, 0, 0, 0).getTime();
      toExport = toExport.filter(d => new Date(d.createdAt).getTime() >= startOfDay);
    }
    if (exportEndDate) {
      const [ey, em, ed] = exportEndDate.split('-').map(Number);
      const endOfDay = new Date(ey, em - 1, ed, 23, 59, 59, 999).getTime();
      toExport = toExport.filter(d => new Date(d.createdAt).getTime() <= endOfDay);
    }

    if (toExport.length === 0) {
      alert('No donation records match the selected export criteria.');
      return;
    }

    const headers = ['Amount (PHP)', 'Status', 'Remaining Balance (PHP)', 'Payment Method', 'Destination / Ministry', 'Reference Code', 'Date Recorded', 'Cryptographic Proof'];
    const rows = toExport.map(d => {
      const amount = Number(d.amount || 0).toFixed(2);
      const st = resolveStatus(d);
      const status = st.charAt(0).toUpperCase() + st.slice(1);
      const remBal = getRemainingBalance(d).toFixed(2);
      const method = d.paymentMethod || 'Cash';
      const dest = d.destination || 'Parish General Fund';
      const dateRecorded = (d.paidAt || d.createdAt) ? new Date(d.paidAt || d.createdAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A';
      const proof = d.blockId || 'Pending Blockchain Proof';
      const ref = d.referenceNumber || d.checkoutSessionId || (d._id ? 'REF-' + d._id.substring(0, 8).toUpperCase() : 'N/A');

      return [
        `"${amount}"`,
        `"${status}"`,
        `"${remBal}"`,
        `"${String(method).replace(/"/g, '""')}"`,
        `"${String(dest).replace(/"/g, '""')}"`,
        `"${String(ref).replace(/"/g, '""')}"`,
        `"${String(dateRecorded).replace(/"/g, '""')}"`,
        `"${String(proof).replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Donation_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      if (statusFilter !== 'all') {
        if (resolveStatus(d) !== statusFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.donorName?.toLowerCase().includes(q);
        const matchRef = d.referenceNumber?.toLowerCase().includes(q) || d.blockId?.toLowerCase().includes(q);
        const matchMethod = d.paymentMethod?.toLowerCase().includes(q);
        const matchDest = d.destination?.toLowerCase().includes(q);
        const matchStatus = resolveStatus(d).includes(q);
        if (!matchName && !matchRef && !matchMethod && !matchDest && !matchStatus) return false;
      }

      return true;
    });
  }, [donations, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / itemsPerPage));
  const paginatedDonations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDonations.slice(start, start + itemsPerPage);
  }, [filteredDonations, currentPage]);

  const handleTabChange = (id) => {
    setFilterType(id);
    setCurrentPage(1);
  };

  return (
    <div className="dashboard-main-content">
      {/* Header & Global Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Donation Management
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Audited financial contributions with cryptographically signed verification records
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowRecordDonationModal(true)}
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
            Record Contribution
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            style={{
              backgroundColor: '#0f172a',
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
            Export CSV Ledger
          </button>
        </div>
      </div>

      {/* Metric Cards Strip - Clean Minimal Typography */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Donations</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>{formatCurrency(totalDonationsAmount)}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available On-Hand</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>{formatCurrency(totalAvailableOnHand)}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Aid Utilized</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>
            {formatCurrency(totalUtilized)}
          </div>
        </div>
      </div>

      {/* Search & Status Filter Controls (Aligned) */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '460px' }}>
            <input
              type="text"
              placeholder="Search by payment ref, hash, destination, or amount..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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

          <div style={{ minWidth: '180px' }}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="fully used">Fully Used</option>
              <option value="partially used">Partially Used</option>
              <option value="cash on hand">Cash on Hand</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
          Showing <strong style={{ color: '#0f172a' }}>{paginatedDonations.length}</strong> of {filteredDonations.length} transactions
        </div>
      </div>

      {/* Donations Table: Date Received, Amount, Status, Remaining Balance, Actions */}
      <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="dashboard-th">Date Received</th>
                <th className="dashboard-th">Amount</th>
                <th className="dashboard-th" style={{ textAlign: 'center' }}>Status</th>
                <th className="dashboard-th" style={{ textAlign: 'center' }}>Remaining Balance</th>
                <th className="dashboard-th" style={{ textAlign: 'right', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDonations.map((d) => {
                const status = resolveStatus(d);
                let statusColor = '#16a34a';
                if (status === 'fully used') statusColor = '#64748b';
                else if (status === 'partially used') statusColor = '#2563eb';
                else if (status === 'pending') statusColor = '#d97706';
                else if (status === 'rejected') statusColor = '#dc2626';

                const remBal = getRemainingBalance(d);

                return (
                  <tr key={d._id}>
                    <td className="dashboard-td">
                      <span style={{ fontSize: '13px', color: '#475569' }}>
                        {(d.paidAt || d.createdAt) ? new Date(d.paidAt || d.createdAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </td>
                    <td className="dashboard-td amount" style={{ fontWeight: '700', color: '#0f172a' }}>
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="dashboard-td" style={{ textAlign: 'center' }}>
                      <span style={{
                        color: statusColor,
                        fontWeight: '800',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}>
                        {status}
                      </span>
                    </td>
                    <td className="dashboard-td" style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                      {formatCurrency(remBal)}
                    </td>
                    <td className="dashboard-td" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDonation(d)}
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
                          title="View Details"
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

              {paginatedDonations.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                      <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#334155' }}>No donations found.</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Try changing your filter selection.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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

      {/* Export Options Modal - Styled Centered Modal */}
      {showExportModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="dashboard-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="dashboard-modal-title">Export Donation Ledger</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Choose options and filters for your CSV export</p>
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
                <label className="dashboard-label">Status Filter</label>
                <select
                  value={exportStatusFilter}
                  onChange={(e) => setExportStatusFilter(e.target.value)}
                  className="dashboard-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Canceled</option>
                </select>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label">Payment Channel</label>
                <select
                  value={exportChannelFilter}
                  onChange={(e) => setExportChannelFilter(e.target.value)}
                  className="dashboard-select"
                >
                  <option value="all">All Channels (Cash, GCash, Maya, Cards, Bank)</option>
                  <option value="online">Online / Digital Channels</option>
                  <option value="cash">Direct Cash / Physical</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="dashboard-form-group">
                  <label className="dashboard-label">From Date (Optional)</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="dashboard-input"
                  />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label">To Date (Optional)</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="dashboard-input"
                  />
                </div>
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
                onClick={handleExportConfirm}
                className="dashboard-submit-btn"
                style={{ backgroundColor: '#2563eb' }}
              >
                Download CSV Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsTab;
