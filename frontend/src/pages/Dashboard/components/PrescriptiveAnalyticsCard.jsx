import React from 'react';
import { rankBeneficiariesByEquity } from '../../../utils/prescriptiveAnalytics';

const PrescriptiveAnalyticsCard = ({
  users = [],
  setMainTab,
  setSectorFilter,
  setDisburseModalUser,
  setDisburseAmount,
  setDisburseSectorId
}) => {
  const rankedBeneficiaries = rankBeneficiariesByEquity(users);
  
  const criticalCount = rankedBeneficiaries.filter(b => b.prescriptiveMetrics.score >= 80).length;
  const highCount = rankedBeneficiaries.filter(b => b.prescriptiveMetrics.score >= 65 && b.prescriptiveMetrics.score < 80).length;
  const unservedCount = rankedBeneficiaries.filter(b => b.prescriptiveMetrics.daysSinceAid === null).length;
  const recentlyServedCount = rankedBeneficiaries.filter(b => b.prescriptiveMetrics.daysSinceAid !== null && b.prescriptiveMetrics.daysSinceAid < 14).length;

  const topPriorityBatch = rankedBeneficiaries.slice(0, 4);

  const handleOpenPriorityDirectory = () => {
    if (setSectorFilter) setSectorFilter('all');
    if (setMainTab) setMainTab('users');
  };

  const handleQuickDisburse = (beneficiary) => {
    if (setDisburseModalUser) setDisburseModalUser(beneficiary);
    if (setDisburseAmount) setDisburseAmount('1500');
    if (setDisburseSectorId) setDisburseSectorId(beneficiary.sectorGroup || 'Disaster Relief');
  };

  return (
    <div className="dashboard-chart-card" style={{ marginBottom: '24px', border: '2px solid #3b82f6', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', boxShadow: '0 8px 24px rgba(37,99,235,0.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 9px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Prescriptive Analytics
            </span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Beneficiary Vulnerability &amp; Equity Index
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Multi-criteria optimization engine preventing aid duplication and prioritizing neglected, high-risk households
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenPriorityDirectory}
          style={{
            background: '#eff6ff',
            color: '#2563eb',
            border: '1.5px solid #bfdbfe',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>View Full Equity Queue ({rankedBeneficiaries.length})</span>
          <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase' }}>Critical Urgency (&gt;80%)</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626', margin: '4px 0 0 0' }}>{criticalCount} Families</div>
          <div style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '2px' }}>Recommended for immediate aid</div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>High Priority (65-79%)</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#d97706', margin: '4px 0 0 0' }}>{highCount} Members</div>
          <div style={{ fontSize: '11.5px', color: '#b45309', marginTop: '2px' }}>Next distribution batch</div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Unserved First-Time</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', margin: '4px 0 0 0' }}>{unservedCount} Recipients</div>
          <div style={{ fontSize: '11.5px', color: '#1d4ed8', marginTop: '2px' }}>Zero aid history (High Equity)</div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Recently Served (&lt;14d)</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', margin: '4px 0 0 0' }}>{recentlyServedCount} Protected</div>
          <div style={{ fontSize: '11.5px', color: '#15803d', marginTop: '2px' }}>Deprioritized to prevent hoarding</div>
        </div>
      </div>

      {/* Top Prescriptive Priority Queue */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Top Prescribed Aid Recipients for Upcoming Distribution
          </span>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Ranked by Weighted Equity Algorithm
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topPriorityBatch.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No registered beneficiaries found to analyze.
            </div>
          ) : (
            topPriorityBatch.map((beneficiary, index) => {
              const m = beneficiary.prescriptiveMetrics;
              return (
                <div
                  key={beneficiary._id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: `1.5px solid ${m.tierBorder}`,
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: index === 0 ? '#dc2626' : (index === 1 ? '#d97706' : '#2563eb'),
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      #{index + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{beneficiary.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {beneficiary.sectorGroup || 'General Member'} {beneficiary.sectorIdNumber ? `• ${beneficiary.sectorIdNumber}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                      {m.rationale}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Sector Score: {m.sectorScore}% • Income Score: {m.incomeScore}% • Equity Recency: {m.equityScore}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800',
                      background: m.tierBg,
                      color: m.tierColor,
                      border: `1px solid ${m.tierBorder}`
                    }}>
                      Score: {m.score}/100 ({m.tier})
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQuickDisburse(beneficiary)}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Disburse Aid
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptiveAnalyticsCard;
