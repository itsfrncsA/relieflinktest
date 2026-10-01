import React, { useState } from 'react';
import {
  calculateSectorBudgetPrescription,
  rankScholarsByRenewalEligibility
} from '../../../utils/prescriptiveAnalytics';

const PrescriptiveAnalyticsCard = ({
  users = [],
  expenses = [],
  totalFunds = 0,
  formatCurrency = (n) => `₱${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  setMainTab,
  setSectorFilter,
  setDisburseModalUser,
  setDisburseAmount,
  setDisburseSectorId
}) => {
  const [activeView, setActiveView] = useState('budget'); // 'budget' | 'scholars'

  const { totalBeneficiaries, sectorAllocations } = calculateSectorBudgetPrescription(
    users,
    totalFunds,
    expenses
  );

  const rankedScholars = rankScholarsByRenewalEligibility(users);
  const fastTrackCount = rankedScholars.filter(s => s.prescriptiveMetrics.recommendation === 'Fast-Track Renewal').length;
  const servicePendingCount = rankedScholars.filter(s => s.prescriptiveMetrics.recommendation === 'Service Hours Pending').length;
  const docsRequiredCount = rankedScholars.filter(s => s.prescriptiveMetrics.recommendation === 'Documents Required' || s.prescriptiveMetrics.recommendation === 'Document Review Required').length;
  const totalScholars = rankedScholars.length;
  const topPriorityScholars = rankedScholars.slice(0, 4);

  const handleOpenSectorDirectory = (sectorId) => {
    if (setSectorFilter) setSectorFilter(sectorId);
    if (setMainTab) setMainTab('sectors');
  };

  const handleQuickGrantDisburse = (scholar) => {
    if (setDisburseModalUser) setDisburseModalUser(scholar);
    if (setDisburseAmount) setDisburseAmount(String(scholar.scholarDetails?.monthlyAllowance || '2000'));
    if (setDisburseSectorId) setDisburseSectorId('Scholars');
  };

  return (
    <div className="dashboard-chart-card" style={{ marginBottom: '24px', border: '2px solid #2563eb', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', boxShadow: '0 8px 24px rgba(37,99,235,0.06)' }}>
      {/* Header with Dual-Mode Toggle */}
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
              Beneficiary Need-Based Fund &amp; Grant Allocation Engine
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Mathematical optimization engine prescribing donation budget distributions across parish ministries based on live beneficiary demographics and urgency weights.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: '#e2e8f0',
          padding: '3px',
          borderRadius: '10px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setActiveView('budget')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeView === 'budget' ? '#2563eb' : 'transparent',
              color: activeView === 'budget' ? '#ffffff' : '#475569',
              transition: 'all 0.2s'
            }}
          >
            📊 Sector Budget Allocation (%)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('scholars')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeView === 'scholars' ? '#2563eb' : 'transparent',
              color: activeView === 'scholars' ? '#ffffff' : '#475569',
              transition: 'all 0.2s'
            }}
          >
            🎓 Scholar Grant Recommender ({totalScholars})
          </button>
        </div>
      </div>

      {/* VIEW 1: DYNAMIC BENEFICIARY-BASED SECTOR ALLOCATION */}
      {activeView === 'budget' && (
        <div>
          {/* Summary Overview Banner */}
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
                Active Optimization Baseline
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px' }}>
                {totalBeneficiaries} Registered Beneficiaries Evaluated
              </div>
              <div style={{ fontSize: '12px', color: '#e0e7ff', marginTop: '2px' }}>
                Available Parish Treasury: <strong>{formatCurrency(totalFunds)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleOpenSectorDirectory('all')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                View Beneficiary Directory
              </button>
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              <span>Prescribed Fund Allocation Distribution (%)</span>
              <span>Total: 100% of Incoming Donations</span>
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
                      <span>👥 <strong>{s.headcount}</strong> registered beneficiaries in sector</span>
                    ) : (
                      <span>🛡️ Emergency reserve &amp; contingency pool</span>
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
                    Manage Sector →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: SCHOLAR GRANT EVALUATION & RECOMMENDER */}
      {activeView === 'scholars' && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Fast-Track Renewal</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#15803d', margin: '4px 0 0 0' }}>{fastTrackCount} Scholars</div>
              <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '2px' }}>Approved: Service &amp; grades clear</div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Parish Service Pending</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', margin: '4px 0 0 0' }}>{servicePendingCount} Scholars</div>
              <div style={{ fontSize: '11.5px', color: '#1d4ed8', marginTop: '2px' }}>Passes grades; service hours required</div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>Documents Required</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#b45309', margin: '4px 0 0 0' }}>{docsRequiredCount} Scholars</div>
              <div style={{ fontSize: '11.5px', color: '#b45309', marginTop: '2px' }}>Pending enrollment / grade slip</div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Active Scholar Roster</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '4px 0 0 0' }}>{totalScholars} Beneficiaries</div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Parish Educational Ministry</div>
            </div>
          </div>

          {/* Top Prescriptive Renewal Action List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Prescribed Grant Decisions &amp; Allowance Actions
              </span>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                Ranked by Decision Model (40% GWA, 35% Service, 15% Docs, 10% Need)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topPriorityScholars.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No registered student scholars found to evaluate. Add student members under the Scholars ministry.
                </div>
              ) : (
                topPriorityScholars.map((scholar, index) => {
                  const m = scholar.prescriptiveMetrics;
                  return (
                    <div
                      key={scholar._id || index}
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
                          background: m.recommendation === 'Fast-Track Renewal' ? '#16a34a' : '#2563eb',
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
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{scholar.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {m.school} • {m.courseProgram}
                          </div>
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                          {m.prescribedAction}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <span>Academics: <strong>{m.gwaLabel}</strong></span>
                          <span>•</span>
                          <span>Ministry Service: <strong>{m.isServiceRendered ? 'Completed' : 'Pending'}</strong></span>
                          <span>•</span>
                          <span>Docs: <strong>{m.submittedDocs}/{m.totalDocs} verified</strong></span>
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
                          border: `1px solid ${m.tierBorder}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {m.recommendation} ({m.score}/100)
                        </span>

                        <button
                          type="button"
                          onClick={() => handleQuickGrantDisburse(scholar)}
                          style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Disburse Grant
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptiveAnalyticsCard;
