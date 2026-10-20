import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const CANONICAL_MINISTRY_COLORS = {
  'LGBTQ': '#7c3aed',
  'Elderly': '#db2777',
  'PDL': '#ea580c',
  'Urban Poor': '#16a34a',
  'Migrant': '#0891b2',
  'Student Scholarships': '#2563eb',
  'Drug Rehabilitation': '#d97706',
  'Expenses': '#64748b'
};

export const classifyDisbursementCategory = (cat = '') => {
  const c = (cat || '').toLowerCase();
  if (c.includes('lgbtq')) return 'LGBTQ';
  if (c.includes('elderly') || c.includes('senior')) return 'Elderly';
  if (c.includes('pdl') || c.includes('prison') || c.includes('nakakolong')) return 'PDL';
  if (c.includes('urban') || c.includes('poor')) return 'Urban Poor';
  if (c.includes('migrant')) return 'Migrant';
  if (c.includes('scholar') || c.includes('student')) return 'Student Scholarships';
  if (c.includes('drug') || c.includes('rehab')) return 'Drug Rehabilitation';
  return 'Expenses';
};

const PIE_COLORS = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#2563eb', '#d97706', '#64748b'];

const OverviewTab = ({
  donations = [],
  expenses = [],
  users = [],
  sectors = [],
  monthlyTrendData = [],
  formatCurrency = (n) => `₱${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  setShowGenerateReportModal,
  setMainTab,
  setSectorFilter
}) => {
  const approvedDonations = donations.filter(d => {
    const s = (d.status || d.verificationStatus || '').toLowerCase();
    return s !== 'rejected' && s !== 'pending';
  });
  const totalDonations = approvedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const approvedExpenses = expenses.filter(e => e.status === 'approved' || !e.status);
  const totalExpenses = approvedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netFunds = totalDonations - totalExpenses;

  // Genuine Beneficiaries count
  const genuineBeneficiaries = useMemo(() => {
    return users.filter(u => {
      if (['superadmin', 'admin', 'staff'].includes(u.role)) return false;
      return u.sectorGroup && u.sectorGroup !== 'None' && u.sectorGroup.trim() !== '';
    });
  }, [users]);

  // Beneficiary distribution by sector for Sector Volume Bar Chart
  const sectorVolumeData = useMemo(() => {
    const counts = {
      'LGBTQ': 0,
      'Elderly': 0,
      'PDL': 0,
      'Urban Poor': 0,
      'Migrant': 0,
      'Student Scholarships': 0,
      'Drug Rehabilitation': 0
    };

    genuineBeneficiaries.forEach(u => {
      const sec = (u.sectorGroup || '').toLowerCase();
      if (sec.includes('lgbtq')) counts['LGBTQ'] += 1;
      else if (sec.includes('elderly') || sec.includes('senior')) counts['Elderly'] += 1;
      else if (sec.includes('pdl') || sec.includes('nakakolong') || sec.includes('prison')) counts['PDL'] += 1;
      else if (sec.includes('urban') || sec.includes('poor')) counts['Urban Poor'] += 1;
      else if (sec.includes('migrant')) counts['Migrant'] += 1;
      else if (sec.includes('student') || sec.includes('scholar')) counts['Student Scholarships'] += 1;
      else if (sec.includes('drug') || sec.includes('rehab')) counts['Drug Rehabilitation'] += 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      sector: name,
      beneficiaries: count
    }));
  }, [genuineBeneficiaries]);

  // Monthly Cash Flow Trend (Inflow vs Outflow) computed dynamically from live donations & expenses
  const cashFlowTrendData = useMemo(() => {
    const now = new Date();
    const monthBuckets = [];

    // Rolling 6 months up to current month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      monthBuckets.push({ key, month: label });
    }

    // Map donations
    const donMap = {};
    donations.forEach(d => {
      const s = (d.status || d.verificationStatus || '').toLowerCase();
      if (s === 'rejected' || s === 'pending') return;
      const rawDate = d.paidAt || d.createdAt || d.date;
      if (!rawDate) return;
      const dt = new Date(rawDate);
      if (isNaN(dt.getTime())) return;
      const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      donMap[k] = (donMap[k] || 0) + (Number(d.amount) || 0);
    });

    // Map expenses
    const expMap = {};
    expenses.forEach(e => {
      const s = (e.status || 'approved').toLowerCase();
      if (s === 'rejected' || s === 'pending') return;
      const rawDate = e.approvedAt || e.date || e.createdAt;
      if (!rawDate) return;
      const dt = new Date(rawDate);
      if (isNaN(dt.getTime())) return;
      const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      expMap[k] = (expMap[k] || 0) + (Number(e.amount) || 0);
    });

    return monthBuckets.map(b => ({
      month: b.month,
      Donations: donMap[b.key] || 0,
      Disbursements: expMap[b.key] || 0
    }));
  }, [donations, expenses]);

  // Expense & Disbursement Categorization for Pie Chart:
  // 7 canonical ministries + single generalized "Expenses" slice (transpo, operations, maintenance, etc.)
  const expensePieData = useMemo(() => {
    const ministryTotals = {
      'LGBTQ': 0,
      'Elderly': 0,
      'PDL': 0,
      'Urban Poor': 0,
      'Migrant': 0,
      'Student Scholarships': 0,
      'Drug Rehabilitation': 0,
      'Expenses': 0
    };

    approvedExpenses.forEach(exp => {
      const cat = exp.category || '';
      const mapped = classifyDisbursementCategory(cat);
      ministryTotals[mapped] += (Number(exp.amount) || 0);
    });

    const items = Object.entries(ministryTotals)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: CANONICAL_MINISTRY_COLORS[name] || '#64748b'
      }));

    if (items.length === 0) {
      return [{ name: 'Expenses', value: 0, color: '#64748b' }];
    }
    return items;
  }, [approvedExpenses]);

  // Financial Health Runway Calculation
  const monthlyBurnRate = approvedExpenses.length > 0 ? (totalExpenses / 3) : 15000;
  const runwayMonths = monthlyBurnRate > 0 ? (netFunds / monthlyBurnRate).toFixed(1) : '12+';

  return (
    <div className="dashboard-main-content">
      {/* Top Banner & Global Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.6px' }}>
            Admin Dashboard
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Real-time financial verification, donor contributions, and relief distributions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowGenerateReportModal && setShowGenerateReportModal(true)}
            style={{
              background: '#0f172a',
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
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Financial Audit Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Total Donations Raised */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Donations Raised
            </span>
            <div style={{ color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', letterSpacing: '-0.5px' }}>
            {formatCurrency(totalDonations)}
          </div>
        </div>

        {/* Total Expenses */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Aid Disbursed
            </span>
            <div style={{ color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', letterSpacing: '-0.5px' }}>
            {formatCurrency(totalExpenses)}
          </div>
        </div>

        {/* Net Available Funds */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Net Available Treasury
            </span>
            <div style={{ color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', letterSpacing: '-0.5px' }}>
            {formatCurrency(netFunds)}
          </div>
        </div>

        {/* Registered Beneficiaries */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Beneficiaries
            </span>
            <div style={{ color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', letterSpacing: '-0.5px' }}>
            {genuineBeneficiaries.length}
          </div>
        </div>
      </div>

      {/* Row 1: High-Level Visual Graphs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(300px, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {/* Monthly Cash Flow Inflow vs Outflow Area Chart */}
        <div className="dashboard-chart-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15,23,42,0.03)', backgroundColor: '#ffffff', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="dashboard-chart-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Cash Inflow vs Aid Disbursement Trend
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Monthly comparison of collections against aid distribution</p>
            </div>
          </div>
          <div className="dashboard-chart-wrap" style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDisbursements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip formatter={(value) => [formatCurrency(value), '']} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="Donations" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDonations)" />
                <Area type="monotone" dataKey="Disbursements" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDisbursements)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Donut Graph */}
        <div className="dashboard-chart-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15,23,42,0.03)', backgroundColor: '#ffffff', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="dashboard-chart-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Disbursement Categorization
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Disbursement breakdown by relief category</p>
            </div>
          </div>

          <div className="dashboard-chart-wrap" style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CANONICAL_MINISTRY_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Beneficiary Intake by Sector Graph */}
      <div className="dashboard-chart-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15,23,42,0.03)', backgroundColor: '#ffffff', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 className="dashboard-chart-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Active Beneficiary Intake Volume by Sector
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Demographic distribution across verified parish community ministries
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (setMainTab) setMainTab('sectors');
              if (setSectorFilter) setSectorFilter('all');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span>Manage Beneficiaries</span>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>&rarr;</span>
          </button>
        </div>

        <div className="dashboard-chart-wrap" style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorVolumeData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="sector" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                formatter={(val) => [`${val} Members`, 'Beneficiary Count']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <Bar dataKey="beneficiaries" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={44}>
                {sectorVolumeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
