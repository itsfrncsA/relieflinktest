import React from 'react';
import RcaFormSection from '../../../components/RcaFormSection';

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
  donations,
  expenses,
  dashboardOverview,
  formatCurrency,
  setShowDrilldownModal
}) => {
  const totalDonations = dashboardOverview?.totalDonations || donations.reduce((s, d) => s + (d.amount || 0), 0);
  const totalExpenses = dashboardOverview?.totalExpenses || expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netFunds = totalDonations - totalExpenses;

  return (
    <div className="dashboard-main-content">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="dashboard-section-title" style={{ margin: 0 }}>Financial Audit &amp; Parish Report Manager</h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Execute official cash advance requests, audit trails, and automated financial governance
        </p>
      </div>

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
      />

      {/* Dashboard Financial Statistics Summary */}
      <div className="dashboard-stats-grid" style={{ marginTop: '24px' }}>
        <div className="dashboard-stat-card summary-card-donations">
          <div className="dashboard-stat-label">Total Verified Donations</div>
          <div className="dashboard-stat-value">{formatCurrency(totalDonations)}</div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '4px' }}>Audited Revenue</div>
        </div>

        <div
          className="dashboard-stat-card summary-card-expenses"
          onClick={() => setShowDrilldownModal(true)}
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
    </div>
  );
};

export default FinancialAuditTab;
