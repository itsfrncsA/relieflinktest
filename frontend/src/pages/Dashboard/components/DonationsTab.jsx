import React, { useState } from 'react';

const DonationsTab = ({
  donations,
  sectors,
  formatCurrency,
  setSelectedDonation,
  deleteDonation,
  getDonationStatus,
  setShowRecordDonationModal
}) => {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStatusFilter, setExportStatusFilter] = useState('all');
  const [exportChannelFilter, setExportChannelFilter] = useState('all');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const approvedDonations = donations.filter(d => d.status === 'approved' || d.verificationStatus === 'approved');
  const totalDonationsAmount = approvedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalVerifiedCount = approvedDonations.length;

  const handleExportConfirm = () => {
    let toExport = [...donations];

    if (exportStatusFilter !== 'all') {
      toExport = toExport.filter(d => getDonationStatus(d).toLowerCase() === exportStatusFilter.toLowerCase());
    }

    if (exportChannelFilter !== 'all') {
      toExport = toExport.filter(d => {
        const pm = (d.paymentMethod || '').toLowerCase();
        if (exportChannelFilter === 'online') {
          return pm.includes('paymongo') || pm.includes('gcash') || pm.includes('maya') || pm.includes('card') || pm.includes('qrph') || pm.includes('online');
        } else if (exportChannelFilter === 'cash') {
          return pm.includes('cash') || pm === 'direct' || pm === 'manual' || !pm;
        }
        return true;
      });
    }

    if (exportStartDate) {
      const s = new Date(exportStartDate).getTime();
      toExport = toExport.filter(d => new Date(d.createdAt).getTime() >= s);
    }
    if (exportEndDate) {
      const e = new Date(exportEndDate).getTime() + 86400000;
      toExport = toExport.filter(d => new Date(d.createdAt).getTime() <= e);
    }

    if (toExport.length === 0) {
      alert('No donation records match the selected export criteria.');
      return;
    }

    const headers = ['Donor Name', 'Amount', 'Payment Method', 'Destination / Ministry', 'Reference Code', 'Status', 'Date Recorded'];
    const rows = toExport.map(d => [
      `"${d.donorName || (d.isAnonymous ? 'Anonymous' : 'Donor')}"`,
      `"${d.amount || 0}"`,
      `"${d.paymentMethod || 'Cash'}"`,
      `"${d.destination || 'General Fund'}"`,
      `"${d.referenceNumber || d._id}"`,
      `"${d.status || 'approved'}"`,
      `"${new Date(d.createdAt).toLocaleDateString()}"`
    ]);
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

  const filteredDonations = donations.filter(d => {
    const pm = (d.paymentMethod || '').toLowerCase();
    const dest = (d.destination || '').toLowerCase();

    // Check if donation was made through digital/online channels (PayMongo, QR Ph, GCash, Maya, Card, etc.)
    const isOnline = pm.includes('paymongo') ||
      pm.includes('gcash') ||
      pm.includes('maya') ||
      pm.includes('card') ||
      pm.includes('qrph') ||
      pm.includes('online') ||
      pm.includes('bank') ||
      pm.includes('grab_pay') ||
      pm.includes('billease') ||
      pm.includes('dob');

    // Filter type (online vs direct cash vs in-kind)
    if (filterType === 'online') {
      if (!isOnline) return false;
    } else if (filterType === 'cash') {
      if (isOnline) return false;
      const isCash = pm.includes('cash') || pm === 'direct' || pm === 'manual' || !pm;
      if (!isCash) return false;
    } else if (filterType === 'inkind') {
      if (!dest.includes('in-kind') && !dest.includes('relief pack') && !pm.includes('in-kind')) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.donorName?.toLowerCase().includes(q);
      const matchRef = d.referenceNumber?.toLowerCase().includes(q) || d.blockId?.toLowerCase().includes(q);
      const matchMethod = d.paymentMethod?.toLowerCase().includes(q);
      const matchDest = d.destination?.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchMethod && !matchDest) return false;
    }

    return true;
  });

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

      {/* Metric Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Ledger Volume</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{formatCurrency(totalDonationsAmount)}</div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>
            {totalVerifiedCount} verified receipts {donations.length > totalVerifiedCount ? `(${donations.length - totalVerifiedCount} pending)` : ''}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Donations</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{totalVerifiedCount}</div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>100% Verified on Chain</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Contribution</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
            {formatCurrency(totalVerifiedCount > 0 ? totalDonationsAmount / totalVerifiedCount : 0)}
          </div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>Per Verified Transaction</div>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {[
          { id: 'all', label: 'All Donations' },
          { id: 'online', label: 'Online / PayMongo' },
          { id: 'cash', label: 'Direct Cash' },
          { id: 'inkind', label: 'In-Kind & Relief Packs' }
        ].map(tab => {
          const count = donations.filter(d => {
            const pm = (d.paymentMethod || '').toLowerCase();
            const dest = (d.destination || '').toLowerCase();
            const isOnline = pm.includes('paymongo') || pm.includes('gcash') || pm.includes('maya') || pm.includes('card') || pm.includes('qrph') || pm.includes('online') || pm.includes('bank') || pm.includes('grab_pay') || pm.includes('billease') || pm.includes('dob');
            if (tab.id === 'online') return isOnline;
            if (tab.id === 'cash') return !isOnline && (pm.includes('cash') || pm === 'direct' || pm === 'manual' || !pm);
            if (tab.id === 'inkind') return dest.includes('in-kind') || dest.includes('relief pack') || pm.includes('in-kind');
            return true;
          }).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              style={{
                backgroundColor: filterType === tab.id ? '#2563eb' : '#ffffff',
                color: filterType === tab.id ? '#ffffff' : '#334155',
                border: '1px solid ' + (filterType === tab.id ? '#2563eb' : '#cbd5e1'),
                borderRadius: '24px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: filterType === tab.id ? '0 4px 12px rgba(37,99,235,0.25)' : '0 1px 3px rgba(15,23,42,0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: filterType === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: filterType === tab.id ? '#ffffff' : '#64748b',
                borderRadius: '12px',
                padding: '1px 8px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Destination Controls */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by donor name, payment ref, or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
          Showing <strong style={{ color: '#0f172a' }}>{filteredDonations.length}</strong> of {donations.length} transactions
        </div>
      </div>

      {/* Donations Table */}
      <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="dashboard-th">#</th>
                <th className="dashboard-th">Date Received</th>
                <th className="dashboard-th">Donor Name</th>
                <th className="dashboard-th">Reference Code</th>
                <th className="dashboard-th">Payment Method</th>
                <th className="dashboard-th">Restricted Destination</th>
                <th className="dashboard-th">Amount</th>
                <th className="dashboard-th" style={{ textAlign: 'center' }}>Status</th>
                <th className="dashboard-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((d, index) => {
                const status = getDonationStatus(d).toLowerCase();
                let statusColor = '#2563eb'; // blue for active/default
                if (status === 'pending') statusColor = '#ea580c'; // orange for pending
                else if (status === 'approved') statusColor = '#16a34a'; // green for approved
                else if (status === 'rejected') statusColor = '#dc2626'; // red for rejected

                return (
                  <tr key={d._id}>
                    <td className="dashboard-td" style={{ color: '#64748b', fontWeight: '600' }}>{index + 1}</td>
                    <td className="dashboard-td">
                      <span style={{ fontSize: '13px', color: '#475569' }}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </td>
                    <td className="dashboard-td">
                      <strong style={{ color: '#1e293b' }}>{d.isAnonymous ? 'Anonymous Donor' : d.donorName}</strong>
                    </td>
                    <td className="dashboard-td">
                      <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '12px' }}>
                        {d.referenceNumber || d._id?.substring(0, 10) || '—'}
                      </span>
                    </td>
                    <td className="dashboard-td">
                      <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {d.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="dashboard-td">
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb' }}>
                        {d.destination || 'General Fund'}
                      </span>
                    </td>
                    <td className="dashboard-td amount" style={{ fontWeight: '800', color: '#16a34a' }}>
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="dashboard-td" style={{ textAlign: 'center' }}>
                      <span style={{
                        color: statusColor,
                        fontWeight: '800',
                        fontSize: '12.5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}>
                        {status}
                      </span>
                    </td>
                    <td className="dashboard-td" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
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

                        {deleteDonation && (
                          <button
                            type="button"
                            onClick={() => deleteDonation(d._id)}
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
                            title="Delete donation record"
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

              {filteredDonations.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
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
      </div>

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="dashboard-modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="dashboard-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <div>
                <h3 className="dashboard-modal-title">Export Donation Ledger</h3>
                <p className="dashboard-modal-subtitle">Choose options and filters for your CSV export</p>
              </div>
              <button
                type="button"
                className="dashboard-modal-close"
                onClick={() => setShowExportModal(false)}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
              <div className="dashboard-form-group">
                <label className="dashboard-label">Status Filter</label>
                <select
                  value={exportStatusFilter}
                  onChange={(e) => setExportStatusFilter(e.target.value)}
                  className="dashboard-select"
                >
                  <option value="all">All Statuses (Approved, Pending, Completed, Rejected)</option>
                  <option value="approved">Approved Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="completed">Completed Only</option>
                  <option value="rejected">Rejected Only</option>
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
                className="dashboard-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportConfirm}
                className="dashboard-btn-primary"
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
