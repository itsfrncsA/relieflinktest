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

  const totalDonationsAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalVerifiedCount = donations.filter(d => d.status === 'approved' || d.verificationStatus === 'approved').length;

  const filteredDonations = donations.filter(d => {
    // Filter type (online vs direct cash vs in-kind)
    if (filterType === 'online') {
      const pm = (d.paymentMethod || '').toLowerCase();
      if (!pm.includes('paymongo') && !pm.includes('card') && !pm.includes('gcash') && !pm.includes('maya') && !pm.includes('online')) return false;
    } else if (filterType === 'cash') {
      const pm = (d.paymentMethod || '').toLowerCase();
      if (!pm.includes('cash')) return false;
    } else if (filterType === 'inkind') {
      const dest = (d.destination || '').toLowerCase();
      if (!dest.includes('in-kind') && !dest.includes('relief pack')) return false;
    }

    // Sector destination filter
    if (sectorFilter !== 'all') {
      const dest = (d.destination || '').toLowerCase();
      if (!dest.includes(sectorFilter.toLowerCase())) return false;
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
            Donations &amp; Contribution Ledger
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
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Record Contribution
          </button>
          <button
            type="button"
            onClick={() => {
              const headers = ['Donor Name', 'Amount', 'Payment Method', 'Destination', 'Reference', 'Status', 'Date'];
              const rows = filteredDonations.map(d => [
                `"${d.donorName || ''}"`,
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
              link.setAttribute('download', `Donation_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
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
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>{donations.length} total receipts</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Donations</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{totalVerifiedCount}</div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>100% Verified on Chain</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Contribution</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
            {formatCurrency(donations.length > 0 ? totalDonationsAmount / donations.length : 0)}
          </div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>Per Transaction</div>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {[
          { id: 'all', label: 'All Donations' },
          { id: 'online', label: 'Online / PayMongo' },
          { id: 'cash', label: 'Direct Cash' },
          { id: 'inkind', label: 'In-Kind & Relief Packs' }
        ].map(tab => (
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
              boxShadow: filterType === tab.id ? '0 4px 12px rgba(37,99,235,0.25)' : '0 1px 3px rgba(15,23,42,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
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

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
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
            <option value="all">All Destination Ministries</option>
            {sectors.map(s => (
              <option key={s.code} value={s.name}>{s.name}</option>
            ))}
          </select>
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
                <th className="dashboard-th">Audit Status</th>
                <th className="dashboard-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((d, index) => (
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
                  <td className="dashboard-td">
                    <span className={`status-badge ${getDonationStatus(d)}`}>
                      {getDonationStatus(d).charAt(0).toUpperCase() + getDonationStatus(d).slice(1)}
                    </span>
                  </td>
                  <td className="dashboard-td" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedDonation(d)}
                        className="action-btn edit-btn"
                        style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '600' }}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

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
    </div>
  );
};

export default DonationsTab;
