import React from 'react';
import { calculateSectorBudgetPrescription } from '../../../utils/prescriptiveAnalytics';

const PrescriptiveAnalyticsCard = ({
  users = [],
  expenses = [],
  totalFunds = 0,
  formatCurrency = (n) => `₱${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  setMainTab,
  setSectorFilter
}) => {
  const { totalBeneficiaries, sectorAllocations } = calculateSectorBudgetPrescription(
    users,
    totalFunds,
    expenses
  );

  const handleOpenSectorDirectory = (sectorId) => {
    if (setSectorFilter) setSectorFilter(sectorId);
    if (setMainTab) setMainTab('sectors');
  };

  return (
    <div className="dashboard-chart-card" style={{ marginBottom: '24px', border: '2px solid #2563eb', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', boxShadow: '0 8px 24px rgba(37,99,235,0.06)' }}>
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
              Prescriptive Decision Support
            </span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Beneficiary Need-Based Fund Allocation Engine
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Mathematical optimization model prescribing donation budget distributions across parish sectors based on active beneficiary demographics and urgency factors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenSectorDirectory('all')}
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
          <span>Beneficiary Directory ({totalBeneficiaries})</span>
          <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* Summary Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        borderRadius: '14px',
        padding: '16px 20px',
        color: '#ffffff',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#bfdbfe', fontWeight: '700' }}>
            Optimization Baseline
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px' }}>
            {totalBeneficiaries} Registered Beneficiaries Evaluated
          </div>
          <div style={{ fontSize: '12px', color: '#e0e7ff', marginTop: '2px' }}>
            Available Fund Treasury: <strong>{formatCurrency(totalFunds)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            background: 'rgba(255,255,255,0.18)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            Proportional Allocation Model
          </span>
        </div>
      </div>

      {/* Allocation Progress Bar */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
          <span>Prescribed Fund Allocation Distribution (%)</span>
          <span>100% of Incoming Donations</span>
        </div>
        <div style={{
          display: 'flex',
          height: '14px',
          borderRadius: '7px',
          overflow: 'hidden',
          backgroundColor: '#e2e8f0',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {sectorAllocations.map(s => (
            <div
              key={s.id}
              style={{
                width: `${s.percentage}%`,
                backgroundColor: s.color,
                transition: 'width 0.4s ease'
              }}
              title={`${s.name}: ${s.percentage}% (${formatCurrency(s.targetAmount)})`}
            />
          ))}
        </div>
      </div>

      {/* Sector Allocation Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {sectorAllocations.map(s => (
          <div
            key={s.id}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: `1.5px solid ${s.borderColor}`,
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: s.bgColor,
                  color: s.color,
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  {s.category}
                </span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '900',
                  color: s.color
                }}>
                  {s.percentage}%
                </span>
              </div>

              <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>
                {s.name}
              </h4>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '10px' }}>
                {s.headcount > 0 ? (
                  <span><strong>{s.headcount}</strong> registered beneficiaries in sector</span>
                ) : (
                  <span>Emergency reserve and contingency pool</span>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#64748b' }}>Prescribed Target:</span>
                  <strong style={{ color: '#0f172a' }}>{formatCurrency(s.targetAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Actual Disbursed:</span>
                  <strong style={{ color: s.actualDisbursed > 0 ? '#16a34a' : '#64748b' }}>
                    {formatCurrency(s.actualDisbursed)}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: s.statusColor,
                backgroundColor: s.statusBg,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {s.allocationStatus}
              </span>

              <button
                type="button"
                onClick={() => handleOpenSectorDirectory(s.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Manage Sector
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrescriptiveAnalyticsCard;
