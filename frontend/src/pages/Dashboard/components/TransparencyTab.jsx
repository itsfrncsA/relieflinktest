import React from 'react';

const TransparencyTab = ({
  donations,
  expenses,
  formatCurrency,
  getDonationStatus
}) => {
  const verifiedDonations = donations.filter(d => d.status === 'approved' || d.verificationStatus === 'approved');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');

  return (
    <div className="dashboard-main-content">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="dashboard-section-title" style={{ margin: 0 }}>Public Financial Transparency</h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Real-time public ledger with cryptographic proofs and audited relief disbursements
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Receipts</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
            {verifiedDonations.length} / {donations.length}
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>
            {donations.length > 0 ? Math.round((verifiedDonations.length / donations.length) * 100) : 100}% Verification Rate
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved Disbursements</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
            {approvedExpenses.length} / {expenses.length}
          </div>
          <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', marginTop: '2px' }}>Documented Vouchers</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Audit Standard</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>SHA-256</div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>Besu Cryptographic Proofs</div>
        </div>
      </div>

      {/* Recent Verified Donations Ledger */}
      <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Public Contribution Registry</h3>
        </div>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="dashboard-th">Donor Identity</th>
                <th className="dashboard-th">Amount</th>
                <th className="dashboard-th">Date Logged</th>
                <th className="dashboard-th">Destination Ministry</th>
                <th className="dashboard-th">Cryptographic Proof</th>
                <th className="dashboard-th">Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {donations.slice(0, 15).map((donation) => (
                <tr key={donation._id}>
                  <td className="dashboard-td">
                    <strong style={{ color: '#1e293b' }}>{donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}</strong>
                  </td>
                  <td className="dashboard-td amount" style={{ fontWeight: '800', color: '#16a34a' }}>
                    {formatCurrency(donation.amount)}
                  </td>
                  <td className="dashboard-td">{new Date(donation.createdAt).toLocaleDateString()}</td>
                  <td className="dashboard-td">{donation.destination || 'General Parish Fund'}</td>
                  <td className="dashboard-td">
                    {donation.blockId ? (
                      <code style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: '#2563eb' }}>
                        {donation.blockId.substring(0, 12)}...
                      </code>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Pending Block</span>
                    )}
                  </td>
                  <td className="dashboard-td">
                    <span className={`status-badge ${getDonationStatus(donation)}`}>
                      {getDonationStatus(donation).charAt(0).toUpperCase() + getDonationStatus(donation).slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparency Statement Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Transparency &amp; Governance Statement</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
          This portal provides complete transparency into the parish relief operations.
          Every donation received is immutably hashed and verified on the local enterprise blockchain registry.
          All disbursements and vouchers are cross-checked against ministry authorizations and audited by the pastoral council.
        </p>
      </div>
    </div>
  );
};

export default TransparencyTab;
