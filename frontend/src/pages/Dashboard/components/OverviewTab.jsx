import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const OverviewTab = ({
  donations,
  expenses,
  users,
  sectors,
  monthlyTrendData,
  formatCurrency,
  setShowGenerateReportModal,
  setShowRecordDonationModal,
  setMainTab,
  setShowDrilldownModal
}) => {
  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netFunds = totalDonations - totalExpenses;
  const verifiedCount = donations.filter(d => d.status === 'approved' || d.verificationStatus === 'approved').length;

  return (
    <div className="dashboard-main-content">
      {/* Top Banner & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Operations &amp; Treasury Overview
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Real-time financial verification, donor contributions, and relief distributions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowGenerateReportModal(true)}
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
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Financial Audit Report
          </button>

          <button
            type="button"
            onClick={() => setShowRecordDonationModal(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
            }}
          >
            Record Contribution
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '24px' }}>
        {/* Total Donations */}
        <div className="dashboard-stat-card summary-card-donations">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div className="dashboard-stat-label">Total Donations Raised</div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="dashboard-stat-value">{formatCurrency(totalDonations)}</div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            100% Cryptographically Verified
          </div>
        </div>

        {/* Total Expenses */}
        <div
          className="dashboard-stat-card summary-card-expenses"
          onClick={() => setShowDrilldownModal(true)}
          style={{ cursor: 'pointer' }}
          title="Click to view expense category breakdown"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div className="dashboard-stat-label">Total Expenses</div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <div className="dashboard-stat-value">{formatCurrency(totalExpenses)}</div>
          <div style={{ fontSize: '12px', color: '#e11d48', fontWeight: '600', marginTop: '6px' }}>
            Disbursed Across {expenses.length} Records
          </div>
        </div>

        {/* Net Funds */}
        <div className="dashboard-stat-card summary-card-netfunds">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div className="dashboard-stat-label">Net Available Funds</div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="dashboard-stat-value">{formatCurrency(netFunds)}</div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '6px' }}>
            Available Treasury Balance
          </div>
        </div>

        {/* Active Members */}
        <div
          className="dashboard-stat-card summary-card-inventory"
          onClick={() => setMainTab('users')}
          style={{ cursor: 'pointer' }}
          title="Click to manage community users"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div className="dashboard-stat-label">Registered Members</div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="dashboard-stat-value">{users.length}</div>
          <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '600', marginTop: '6px' }}>
            Across 6 Ministry Sectors
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts-grid" style={{ marginBottom: '24px' }}>
        {/* Donation Trend Area Chart */}
        <div className="dashboard-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="dashboard-chart-title" style={{ margin: 0 }}>Monthly Donation Growth</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Cumulative inflow over time</p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '6px' }}>
              {donations.length} Contributions
            </span>
          </div>
          <div className="dashboard-chart-wrap" style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#ffffff', fontSize: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(value) => [formatCurrency(value), 'Total Donations']}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Ministry Progress Bars */}
        <div className="dashboard-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="dashboard-chart-title" style={{ margin: 0 }}>Restricted Sector Funding</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Allocated budget vs disbursed aid</p>
            </div>
            <button
              type="button"
              onClick={() => setMainTab('sectors')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              View All Directory &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sectors.slice(0, 5).map(sec => {
              const raised = sec.totalRaised || 0;
              const disbursed = sec.totalDisbursed || 0;
              const percent = raised > 0 ? Math.min(Math.round((disbursed / raised) * 100), 100) : 0;
              return (
                <div key={sec.code} style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{sec.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>
                      {formatCurrency(disbursed)} / {formatCurrency(raised)}
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#2563eb' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
