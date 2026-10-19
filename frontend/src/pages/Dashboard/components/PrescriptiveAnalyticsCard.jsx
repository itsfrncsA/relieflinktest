import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  calculateSectorBudgetPrescription,
  SECTOR_DEFINITIONS,
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
  const [activeView, setActiveView] = useState('table'); // 'table' | 'charts' | 'scholars' | 'model'

  const { totalBeneficiaries, sectorAllocations } = useMemo(() => {
    return calculateSectorBudgetPrescription(users, totalFunds, expenses);
  }, [users, totalFunds, expenses]);

  // Ranked Scholars for Multi-Criteria Educational Aid Decision Matrix
  const rankedScholars = useMemo(() => {
    return rankScholarsByRenewalEligibility(users);
  }, [users]);

  // Total Disbursed & Funding Gap across all sectors
  const totalPrescribedTarget = sectorAllocations.reduce((sum, s) => sum + (s.targetAmount || 0), 0);
  const totalActualDisbursed = sectorAllocations.reduce((sum, s) => sum + (s.actualDisbursed || 0), 0);
  const totalFundingGap = Math.max(totalPrescribedTarget - totalActualDisbursed, 0);
  const budgetUtilization = totalPrescribedTarget > 0 
    ? Math.min(Math.round((totalActualDisbursed / totalPrescribedTarget) * 100), 100) 
    : 0;

  // Chart Data: Comparison of Prescribed Target vs Actual Disbursed
  const comparisonChartData = useMemo(() => {
    return sectorAllocations.map(s => ({
      name: s.shortName || s.name,
      fullName: s.name,
      category: s.category,
      headcount: s.headcount,
      'Prescribed Target': s.targetAmount,
      'Actual Disbursed': s.actualDisbursed,
      'Funding Gap': s.fundingGap,
      percentage: s.percentage,
      color: s.color
    }));
  }, [sectorAllocations]);

  // Chart Data: Urgency Weighting & Demographics Breakdown
  const urgencyPieData = useMemo(() => {
    return sectorAllocations.map(s => ({
      name: s.shortName || s.name,
      value: s.headcount > 0 ? s.headcount : 1,
      targetAmount: s.targetAmount,
      percentage: s.percentage,
      color: s.color,
      urgencyWeight: s.urgencyWeight || 1.0
    }));
  }, [sectorAllocations]);

  const handleOpenSectorDirectory = (sectorId) => {
    if (setSectorFilter) setSectorFilter(sectorId);
    if (setMainTab) setMainTab('sectors');
  };

  return (
    <div className="dashboard-chart-card" style={{
      marginBottom: '28px',
      border: '2px solid #2563eb',
      borderRadius: '16px',
      background: '#ffffff',
      boxShadow: '0 8px 24px rgba(37,99,235,0.08)',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
            }}>
              Prescriptive Decision Support
            </span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              Beneficiary Need-Based Fund Allocation &amp; Optimization Engine
            </h3>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Detailed mathematical optimization model prescribing donation distributions across parish ministries based on active beneficiary demographics, urgency factors, and multi-criteria renewal criteria.
          </p>
        </div>

        {/* View Switcher Controls (Aligned Right) */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveView('table')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: activeView === 'table' ? '#ffffff' : 'transparent',
              color: activeView === 'table' ? '#2563eb' : '#64748b',
              boxShadow: activeView === 'table' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Optimization Matrix
          </button>

          <button
            type="button"
            onClick={() => setActiveView('charts')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: activeView === 'charts' ? '#ffffff' : 'transparent',
              color: activeView === 'charts' ? '#2563eb' : '#64748b',
              boxShadow: activeView === 'charts' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Variance Graphs
          </button>
        </div>
      </div>

      {/* Metric KPI Cards Strip - All Black Typography & Subtext Removed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Optimization Baseline
          </span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {totalBeneficiaries} Evaluated Members
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Prescribed Aid Target
          </span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {formatCurrency(totalPrescribedTarget)}
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Actual Aid Disbursed
          </span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {formatCurrency(totalActualDisbursed)}
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Remaining Allocation Gap
          </span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {formatCurrency(totalFundingGap)}
          </div>
        </div>
      </div>

      {/* VIEW 1: Detailed Optimization Matrix Table */}
      {activeView === 'table' && (
        <div>
          <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                Sector-by-Sector Prescriptive Audit Ledger &amp; Variance Matrix
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Dynamic capital distribution based on active demographics, need urgency weighting, and execution progress
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '800' }}>Ministry Sector</th>
                  <th style={{ padding: '12px 14px', fontWeight: '800' }}>Urgency Multiplier</th>
                  <th style={{ padding: '12px 14px', fontWeight: '800' }}>Headcount</th>
                  <th style={{ padding: '12px 14px', fontWeight: '800' }}>Target Share (%)</th>
                  <th style={{ padding: '12px 14px', fontWeight: '800' }}>Prescribed Target</th>
                  <th style={{ padding: '12px 14px', fontWeight: '800' }}>Actual Disbursed</th>
                  <th style={{ padding: '12px 14px', fontWeight: '800' }}>Variance / Gap</th>
                  <th style={{ padding: '12px 14px', fontWeight: '800' }}>Prescriptive Directive</th>
                  <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectorAllocations.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: idx < sectorAllocations.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: s.color }}></span>
                        <div>
                          <strong style={{ color: '#0f172a', display: 'block' }}>{s.name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{s.category}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        backgroundColor: s.bgColor,
                        color: s.color,
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {s.urgencyWeight ? `${s.urgencyWeight}x Weight` : '1.0x Weight'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>
                      {s.headcount} members
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ color: s.color, fontSize: '13px' }}>{s.percentage}%</strong>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>
                      {formatCurrency(s.targetAmount)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: s.actualDisbursed > 0 ? '#16a34a' : '#64748b' }}>
                      {formatCurrency(s.actualDisbursed)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: s.fundingGap > 0 ? '#d97706' : '#16a34a',
                        backgroundColor: s.fundingGap > 0 ? '#fffbeb' : '#f0fdf4',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: s.fundingGap > 0 ? '1px solid #fde68a' : '1px solid #bbf7d0'
                      }}>
                        {s.fundingGap > 0 ? `Gap: ${formatCurrency(s.fundingGap)}` : 'Target Met'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '11.5px', color: '#334155', maxWidth: '240px' }}>
                      {s.fundingGap > 0 
                        ? `Disburse ${formatCurrency(s.fundingGap)} to reach optimal 100% allocation for registered members.`
                        : `Fund allocation fully utilized and compliant with current demand baseline.`}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenSectorDirectory(s.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Manage Aid ({s.headcount})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Variance Graphs */}
      {activeView === 'charts' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '20px', marginBottom: '20px' }}>
            {/* Bar Chart: Prescribed Target vs Actual Disbursed */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>
                Prescribed Target (₱) vs Actual Disbursed (₱) by Sector
              </h4>
              <div style={{ width: '100%', height: '340px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 10, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-25} textAnchor="end" height={55} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), '']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Prescribed Target" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Actual Disbursed" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Urgency Demographics Breakdown */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>
                Beneficiary Headcount &amp; Need Urgency Weight
              </h4>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={urgencyPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {urgencyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, entry) => [
                        `${val} Beneficiaries (${entry.payload.percentage}% Fund Share)`,
                        name
                      ]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', maxHeight: '140px', overflowY: 'auto' }}>
                {sectorAllocations.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '5px 10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }}></span>
                      <strong style={{ color: '#0f172a' }}>{s.shortName || s.name}</strong>
                    </div>
                    <span style={{ color: '#64748b' }}>Urgency: <strong style={{ color: s.color }}>{s.urgencyWeight || 1.0}x</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptiveAnalyticsCard;
