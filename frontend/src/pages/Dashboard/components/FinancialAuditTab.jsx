import React, { useState } from 'react';
import RcaFormSection from '../../../components/RcaFormSection';
import PrescriptiveAnalyticsCard from './PrescriptiveAnalyticsCard';

const FinancialAuditTab = ({
  rcaName, setRcaName,
  rcaDate, setRcaDate,
  rcaPosition, setRcaPosition,
  rcaMinistry, setRcaMinistry,
  rcaActivity, setRcaActivity,
  rcaDateNeeded, setRcaDateNeeded,
  rcaRequestedAmount, setRcaRequestedAmount,
  rcaOutstandingAmount, setRcaOutstandingAmount,
  rcaRequestedBy, setRcaRequestedBy,
  rcaRecommendingBy, setRcaRecommendingBy,
  rcaApprovedBy, setRcaApprovedBy,
  rcaOutstandingDetails, setRcaOutstandingDetails,
  cashAdvances,
  setShowRcaPreviewModal,
  handlePrintRcaForm,
  handleSaveCashAdvance,
  handleDeleteCashAdvance,
  donations = [],
  expenses = [],
  users = [],
  dashboardOverview,
  formatCurrency = (n) => `₱${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  setShowDrilldownModal,
  setMainTab,
  setSectorFilter,
  setDisburseModalUser,
  setDisburseAmount,
  setDisburseSectorId,
  getDonationStatus
}) => {
  const [reportsSubTab, setReportsSubTab] = useState('audit'); // 'audit' | 'transparency'

  const approvedDonations = donations.filter(d => d.status === 'approved' || d.verificationStatus === 'approved');
  const totalDonations = dashboardOverview?.totalDonations || approvedDonations.reduce((s, d) => s + (d.amount || 0), 0);
  const totalExpenses = dashboardOverview?.totalExpenses || expenses.filter(e => e.status === 'approved' || !e.status).reduce((s, e) => s + (e.amount || 0), 0);
  const netFunds = totalDonations - totalExpenses;

  const verifiedDonations = approvedDonations;
  const approvedExpensesList = expenses.filter(e => e.status === 'approved' || !e.status);

  const resolveDonationStatus = (donation) => {
    if (getDonationStatus) return getDonationStatus(donation);
    const status = (donation.verificationStatus || donation.status || 'pending').toLowerCase();
    if (status.includes('approved') || status.includes('complete') || status.includes('valid')) return 'approved';
    if (status.includes('reject') || status.includes('fail') || status.includes('cancel')) return 'rejected';
    return 'pending';
  };

  return (
    <div className="dashboard-main-content">
      {/* Header & Sub-Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="dashboard-section-title" style={{ margin: 0 }}>Reports and Prescriptive Analytics</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Execute official cash advance requests, prescriptive aid allocation, and public transparency records
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setReportsSubTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: reportsSubTab === 'audit' ? '#ffffff' : 'transparent',
              color: reportsSubTab === 'audit' ? '#2563eb' : '#64748b',
              boxShadow: reportsSubTab === 'audit' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Financial Audit &amp; RCA
          </button>

          <button
            type="button"
            onClick={() => setReportsSubTab('transparency')}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: reportsSubTab === 'transparency' ? '#ffffff' : 'transparent',
              color: reportsSubTab === 'transparency' ? '#2563eb' : '#64748b',
              boxShadow: reportsSubTab === 'transparency' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Transparency &amp; Ledger
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Financial Audit & RCA */}
      {reportsSubTab === 'audit' && (
        <>
          {/* Official RCA Form (Request for Cash Advance) Section */}
          <RcaFormSection
            rcaName={rcaName} setRcaName={setRcaName}
            rcaDate={rcaDate} setRcaDate={setRcaDate}
            rcaPosition={rcaPosition} setRcaPosition={setRcaPosition}
            rcaMinistry={rcaMinistry} setRcaMinistry={setRcaMinistry}
            rcaActivity={rcaActivity} setRcaActivity={setRcaActivity}
            rcaDateNeeded={rcaDateNeeded} setRcaDateNeeded={setRcaDateNeeded}
            rcaRequestedAmount={rcaRequestedAmount} setRcaRequestedAmount={setRcaRequestedAmount}
            rcaOutstandingAmount={rcaOutstandingAmount} setRcaOutstandingAmount={setRcaOutstandingAmount}
            rcaRequestedBy={rcaRequestedBy} setRcaRequestedBy={setRcaRequestedBy}
            rcaRecommendingBy={rcaRecommendingBy} setRcaRecommendingBy={setRcaRecommendingBy}
            rcaApprovedBy={rcaApprovedBy} setRcaApprovedBy={setRcaApprovedBy}
            rcaOutstandingDetails={rcaOutstandingDetails} setRcaOutstandingDetails={setRcaOutstandingDetails}
            cashAdvances={cashAdvances}
            setShowRcaPreviewModal={setShowRcaPreviewModal}
            handlePrintRcaForm={handlePrintRcaForm}
            handleSaveCashAdvance={handleSaveCashAdvance}
            handleDeleteCashAdvance={handleDeleteCashAdvance}
          />

          {/* Prescriptive Analytics Decision Support Engine */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <PrescriptiveAnalyticsCard
              users={users}
              expenses={expenses}
              totalFunds={totalDonations}
              formatCurrency={formatCurrency}
              setMainTab={setMainTab}
              setSectorFilter={setSectorFilter}
              setDisburseModalUser={setDisburseModalUser}
              setDisburseAmount={setDisburseAmount}
              setDisburseSectorId={setDisburseSectorId}
            />
          </div>

          {/* Dashboard Financial Statistics Summary */}
          <div className="dashboard-stats-grid" style={{ marginTop: '24px' }}>
            <div className="dashboard-stat-card summary-card-donations">
              <div className="dashboard-stat-label">Total Verified Donations</div>
              <div className="dashboard-stat-value">{formatCurrency(totalDonations)}</div>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '4px' }}>Audited Revenue</div>
            </div>

            <div
              className="dashboard-stat-card summary-card-expenses"
              onClick={() => setShowDrilldownModal && setShowDrilldownModal(true)}
              style={{ cursor: 'pointer' }}
              title="Click to view expense category breakdown"
            >
              <div className="dashboard-stat-label">Total Documented Expenses</div>
              <div className="dashboard-stat-value">{formatCurrency(totalExpenses)}</div>
              <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', marginTop: '4px' }}>Disbursements</div>
            </div>

            <div className="dashboard-stat-card summary-card-netfunds">
              <div className="dashboard-stat-label">Net Parish Treasury</div>
              <div className="dashboard-stat-value">{formatCurrency(netFunds)}</div>
              <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '4px' }}>Available Balance</div>
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: Public Financial Transparency & Ledger */}
      {reportsSubTab === 'transparency' && (
        <div>
          {/* Transparency Metrics Overview */}
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
                {approvedExpensesList.length} / {expenses.length}
              </div>
              <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', marginTop: '2px' }}>Documented Vouchers</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Audit Standard</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>SHA-256</div>
              <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>Besu Cryptographic Proofs</div>
            </div>
          </div>

          {/* Prescriptive Needs-Based Fund Allocation for Public Transparency */}
          <div style={{ marginBottom: '24px' }}>
            <PrescriptiveAnalyticsCard
              users={users}
              expenses={expenses}
              totalFunds={totalDonations}
              formatCurrency={formatCurrency}
              setMainTab={setMainTab}
              setSectorFilter={setSectorFilter}
              setDisburseModalUser={setDisburseModalUser}
              setDisburseAmount={setDisburseAmount}
              setDisburseSectorId={setDisburseSectorId}
            />
          </div>

          {/* Recent Verified Donations Ledger */}
          <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Public Contribution Registry</h3>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Showing {Math.min(donations.length, 15)} records</span>
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
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No contributions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    donations.slice(0, 15).map((donation) => {
                      const st = resolveDonationStatus(donation);
                      return (
                        <tr key={donation._id}>
                          <td className="dashboard-td">
                            <strong style={{ color: '#1e293b' }}>{donation.isAnonymous ? 'Anonymous Donor' : (donation.donorName || 'Donor')}</strong>
                          </td>
                          <td className="dashboard-td amount" style={{ fontWeight: '800', color: '#16a34a' }}>
                            {formatCurrency(donation.amount)}
                          </td>
                          <td className="dashboard-td">{new Date(donation.createdAt || Date.now()).toLocaleDateString()}</td>
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
                            <span className={`status-badge ${st}`}>
                              {st.charAt(0).toUpperCase() + st.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transparency Statement Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Transparency &amp; Governance Statement</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              This portal provides complete transparency into parish disaster relief operations and general fund allocations. All transactions are cryptographically verified and recorded on an immutable ledger to ensure fiduciary integrity and public accountability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAuditTab;
