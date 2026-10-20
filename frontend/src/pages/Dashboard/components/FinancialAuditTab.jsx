import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import PrescriptiveAnalyticsCard from './PrescriptiveAnalyticsCard';

const CANONICAL_MINISTRY_COLORS = {
  'LGBTQ': '#7c3aed',
  'Elderly': '#db2777',
  'PDL': '#ea580c',
  'Urban Poor': '#16a34a',
  'Migrant': '#0891b2',
  'Student Scholarships': '#2563eb',
  'Drug Rehabilitation': '#d97706'
};

const EXPENSE_PALETTE = ['#0284c7', '#0d9488', '#e11d48', '#d97706', '#64748b', '#8b5cf6', '#475569'];

const getMinistryName = (cat = '') => {
  const c = (cat || '').toLowerCase();
  if (c.includes('lgbtq')) return 'LGBTQ';
  if (c.includes('elderly') || c.includes('senior')) return 'Elderly';
  if (c.includes('pdl') || c.includes('prison') || c.includes('nakakolong')) return 'PDL';
  if (c.includes('urban') || c.includes('poor')) return 'Urban Poor';
  if (c.includes('migrant')) return 'Migrant';
  if (c.includes('scholar') || c.includes('student')) return 'Student Scholarships';
  if (c.includes('drug') || c.includes('rehab')) return 'Drug Rehabilitation';
  return null;
};

const FinancialAuditTab = ({
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
  getDonationStatus,
  expenseByCategory = [],
  expenseCategory = '',
  setExpenseCategory,
  expenseAmount = '',
  setExpenseAmount,
  expenseDescription = '',
  setExpenseDescription,
  addExpense,
  selectedExpense,
  setSelectedExpense,
  approveExpense,
  rejectExpense
}) => {
  const [reportsSubTab, setReportsSubTab] = useState('audit'); // 'audit' | 'expenses' | 'transparency'
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('all');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('disbursement'); // 'disbursement' | 'expense'
  const [customExpenseCategory, setCustomExpenseCategory] = useState('');

  const approvedDonations = donations.filter(d => {
    const s = (d.status || d.verificationStatus || '').toLowerCase();
    return s !== 'rejected' && s !== 'pending';
  });
  const totalDonations = dashboardOverview?.totalDonations || approvedDonations.reduce((s, d) => s + (d.amount || 0), 0);
  const approvedExpensesList = expenses.filter(e => e.status === 'approved' || !e.status);
  const totalExpenses = dashboardOverview?.totalExpenses || approvedExpensesList.reduce((s, e) => s + (e.amount || 0), 0);
  const netFunds = totalDonations - totalExpenses;

  const pendingExpenseCount = expenses.filter(e => e.status === 'pending').length;
  const approvedExpenseCount = approvedExpensesList.length;
  const rejectedExpenseCount = expenses.filter(e => e.status === 'rejected').length;

  // 1. 7 Canonical Ministries Disbursements only (Excluding operational expenses)
  const ministryDisbursements = React.useMemo(() => {
    const map = {
      'LGBTQ': 0,
      'Elderly': 0,
      'PDL': 0,
      'Urban Poor': 0,
      'Migrant': 0,
      'Student Scholarships': 0,
      'Drug Rehabilitation': 0
    };
    approvedExpensesList.forEach(exp => {
      const min = getMinistryName(exp.category);
      if (min) {
        map[min] += (Number(exp.amount) || 0);
      }
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      color: CANONICAL_MINISTRY_COLORS[name]
    }));
  }, [approvedExpensesList]);

  const totalMinistryDisbursed = React.useMemo(() => {
    return ministryDisbursements.reduce((sum, item) => sum + item.amount, 0);
  }, [ministryDisbursements]);

  // 2. Operational Expenses only (Excluding ministry disbursements)
  const operationalExpenses = React.useMemo(() => {
    const map = {};
    approvedExpensesList.forEach(exp => {
      const min = getMinistryName(exp.category);
      if (!min) {
        const cat = exp.category?.trim() || 'General Operations';
        const label = cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        map[label] = (map[label] || 0) + (Number(exp.amount) || 0);
      }
    });
    const entries = Object.entries(map);
    if (entries.length === 0) {
      return [{ name: 'Operations & Maintenance', amount: 0, color: '#64748b' }];
    }
    return entries.map(([name, amount], idx) => ({
      name,
      amount,
      color: EXPENSE_PALETTE[idx % EXPENSE_PALETTE.length]
    }));
  }, [approvedExpensesList]);

  const totalOperationalExpenses = React.useMemo(() => {
    return operationalExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [operationalExpenses]);

  const filteredExpenses = expenses.filter(expense => {
    const matchesStatus =
      expenseStatusFilter === 'all' ? true :
      expenseStatusFilter === 'pending' ? expense.status === 'pending' :
      expenseStatusFilter === 'approved' ? (expense.status === 'approved' || !expense.status) :
      expenseStatusFilter === 'rejected' ? expense.status === 'rejected' : true;

    const q = expenseSearchTerm.toLowerCase();
    const matchesSearch = !q ||
      expense.description?.toLowerCase().includes(q) ||
      expense.category?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    let finalCategory = expenseCategory;
    if (transactionType === 'expense' && (expenseCategory === 'Others' || expenseCategory === 'other')) {
      if (!customExpenseCategory.trim()) {
        alert('Please specify the expense category.');
        return;
      }
      finalCategory = customExpenseCategory.trim();
    }
    if (!finalCategory) {
      alert('Please select a category.');
      return;
    }
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!expenseDescription.trim()) {
      alert('Please enter description / remarks.');
      return;
    }

    if (setExpenseCategory) {
      setExpenseCategory(finalCategory);
    }
    if (addExpense) {
      await addExpense(e, finalCategory);
    }
    setCustomExpenseCategory('');
    setShowAddExpenseModal(false);
  };

  const resolveDonationStatus = (donation) => {
    if (getDonationStatus) return getDonationStatus(donation);
    const status = (donation.verificationStatus || donation.status || 'pending').toLowerCase();
    if (status.includes('approved') || status.includes('complete') || status.includes('valid')) return 'approved';
    if (status.includes('reject') || status.includes('fail') || status.includes('cancel')) return 'rejected';
    return 'pending';
  };

  // Group expenses by category for detailed breakdown table
  const expenseBreakdown = React.useMemo(() => {
    const map = {};
    approvedExpensesList.forEach(exp => {
      const cat = exp.category || 'General Operations';
      if (!map[cat]) {
        map[cat] = { count: 0, total: 0 };
      }
      map[cat].count += 1;
      map[cat].total += (exp.amount || 0);
    });
    return Object.entries(map).map(([category, stats]) => {
      const rawPct = totalExpenses > 0 ? (stats.total / totalExpenses) * 100 : 0;
      const percentage = stats.total > 0 && rawPct < 1 ? Number(rawPct.toFixed(1)) : Math.round(rawPct);
      return {
        category,
        count: stats.count,
        total: stats.total,
        percentage
      };
    });
  }, [approvedExpensesList, totalExpenses]);

  // Compute category chart data if not provided
  const computedExpenseByCategory = expenseByCategory && expenseByCategory.length > 0
    ? expenseByCategory
    : expenseBreakdown.map(b => ({ name: b.category, amount: b.total }));

  return (
    <div className="dashboard-main-content">
      {/* Header & Sub-Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Reports
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Official parish financial audits, expense disbursements, and cryptographic ledger statements
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
            onClick={() => setReportsSubTab('prescriptive')}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: reportsSubTab === 'prescriptive' ? '#ffffff' : 'transparent',
              color: reportsSubTab === 'prescriptive' ? '#2563eb' : '#64748b',
              boxShadow: reportsSubTab === 'prescriptive' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Prescriptive Analytics
          </button>

          <button
            type="button"
            onClick={() => setReportsSubTab('expenses')}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: reportsSubTab === 'expenses' ? '#ffffff' : 'transparent',
              color: reportsSubTab === 'expenses' ? '#2563eb' : '#64748b',
              boxShadow: reportsSubTab === 'expenses' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Disbursement Tracking
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Financial Audit & RCA */}
      {reportsSubTab === 'audit' && (
        <>
          {/* Detailed Financial Audit Summary Table */}
          <div className="dashboard-chart-card" style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 className="dashboard-chart-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                  Treasury Balance &amp; Operational Audit Statement
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Cumulative balance of verified collections against approved aid disbursements
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Audited Collections</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{formatCurrency(totalDonations)}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Approved Disbursements</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{formatCurrency(totalExpenses)}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Net Available Treasury</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{formatCurrency(netFunds)}</div>
              </div>
            </div>

            {/* Expense Categories Breakdown Table */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
              Disbursement Categorization Breakdown
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th className="dashboard-th">Disbursement Category</th>
                    <th className="dashboard-th" style={{ textAlign: 'center' }}>Disbursement Count</th>
                    <th className="dashboard-th" style={{ textAlign: 'right' }}>Total Disbursed</th>
                    <th className="dashboard-th" style={{ textAlign: 'right' }}>% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseBreakdown.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="dashboard-td" style={{ textTransform: 'capitalize', fontWeight: '600', color: '#0f172a' }}>
                        {item.category.replace(/-/g, ' ')}
                      </td>
                      <td className="dashboard-td" style={{ textAlign: 'center' }}>{item.count} disbursements</td>
                      <td className="dashboard-td" style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                        {formatCurrency(item.total)}
                      </td>
                      <td className="dashboard-td" style={{ textAlign: 'right', fontWeight: '700', color: '#2563eb' }}>
                        {item.percentage}%
                      </td>
                    </tr>
                  ))}
                  {expenseBreakdown.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                        No expense disbursements recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: Prescriptive Analytics Dedicated View */}
      {reportsSubTab === 'prescriptive' && (
        <div style={{ marginTop: '8px' }}>
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
      )}

      {/* SUB-TAB 3: Expense Management (Moved directly into Reports) */}
      {reportsSubTab === 'expenses' && (
        <div>
          {/* Dual Charts Grid: Disbursement by 7 Ministries vs Operational Expenses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Graph 1: 7 Ministries Disbursement Allocation */}
            <div className="dashboard-chart-card dashboard-chart-card-inline" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 className="dashboard-chart-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    Disbursement Allocation by Category
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    7 parish ministries direct relief disbursements
                  </p>
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  Total Disbursed: <span style={{ color: '#2563eb' }}>{formatCurrency(totalMinistryDisbursed)}</span>
                </div>
              </div>

              <div className="dashboard-chart-wrap" style={{ minHeight: '260px' }}>
                {ministryDisbursements.some(m => m.amount > 0) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(200px, 1.3fr)', gap: '16px', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={ministryDisbursements}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="amount"
                          nameKey="name"
                        >
                          {ministryDisbursements.map((entry, index) => (
                            <Cell
                              key={`min-cell-${index}`}
                              fill={entry.color || CANONICAL_MINISTRY_COLORS[entry.name] || '#2563eb'}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Compact Ministry Legend (no box, smaller text) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {ministryDisbursements.map((item) => {
                        const percent = totalMinistryDisbursed > 0 ? Math.round((item.amount / totalMinistryDisbursed) * 100) : 0;
                        return (
                          <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', padding: '2px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block', flexShrink: 0 }}></span>
                              <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.name}</span>
                            </div>
                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <strong style={{ color: '#0f172a' }}>{formatCurrency(item.amount)}</strong>
                              <span style={{ color: '#64748b', marginLeft: '4px', fontSize: '10.5px' }}>({percent}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b', fontSize: '13px' }}>
                    No ministry disbursements recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Graph 2: General Operational Expenses Allocation */}
            <div className="dashboard-chart-card dashboard-chart-card-inline" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 className="dashboard-chart-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    Expense Allocation by Category
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Operational, transpo, supplies &amp; maintenance costs
                  </p>
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  Total Expenses: <span style={{ color: '#dc2626' }}>{formatCurrency(totalOperationalExpenses)}</span>
                </div>
              </div>

              <div className="dashboard-chart-wrap" style={{ minHeight: '260px' }}>
                {operationalExpenses.some(o => o.amount > 0) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(200px, 1.3fr)', gap: '16px', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={operationalExpenses}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="amount"
                          nameKey="name"
                        >
                          {operationalExpenses.map((entry, index) => (
                            <Cell
                              key={`exp-cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Compact Expense Legend (no box, smaller text) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {operationalExpenses.map((item) => {
                        const percent = totalOperationalExpenses > 0 ? Math.round((item.amount / totalOperationalExpenses) * 100) : 0;
                        return (
                          <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', padding: '2px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block', flexShrink: 0 }}></span>
                              <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.name}</span>
                            </div>
                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <strong style={{ color: '#0f172a' }}>{formatCurrency(item.amount)}</strong>
                              <span style={{ color: '#64748b', marginLeft: '4px', fontSize: '10.5px' }}>({percent}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b', fontSize: '13px' }}>
                    No operational expenses recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List Toolbar (Search bar, Status Filter, Record New Transaction) placed directly above the list */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <input
                type="text"
                className="dashboard-input"
                placeholder="Search transactions..."
                value={expenseSearchTerm}
                onChange={(e) => setExpenseSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', height: '42px', fontSize: '13px' }}
              />
              <svg style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={expenseStatusFilter}
                onChange={(e) => setExpenseStatusFilter(e.target.value)}
                style={{
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '600',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer',
                  outline: 'none',
                  height: '42px'
                }}
              >
                <option value="all">All Disbursements ({expenses.length})</option>
                <option value="pending">Pending Review ({pendingExpenseCount})</option>
                <option value="approved">Approved ({approvedExpenseCount})</option>
                <option value="rejected">Canceled ({rejectedExpenseCount})</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setTransactionType('disbursement');
                  setExpenseCategory('');
                  setCustomExpenseCategory('');
                  setShowAddExpenseModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '42px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Record New Transaction
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th className="dashboard-th">Category</th>
                    <th className="dashboard-th">Amount</th>
                    <th className="dashboard-th">Date</th>
                    <th className="dashboard-th" style={{ textAlign: 'center' }}>Status</th>
                    <th className="dashboard-th" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const st = (expense.status || 'pending').toLowerCase();
                    let statusColor = '#2563eb';
                    if (st === 'pending') statusColor = '#ea580c';
                    else if (st === 'approved') statusColor = '#16a34a';
                    else if (st === 'rejected') statusColor = '#dc2626';

                    return (
                      <tr key={expense._id}>
                        <td className="dashboard-td">
                          <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#1e293b' }}>
                            {expense.category?.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="dashboard-td amount" style={{ fontWeight: '800', color: '#dc2626' }}>
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="dashboard-td">{expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</td>
                        <td className="dashboard-td" style={{ textAlign: 'center' }}>
                          <span style={{
                            color: statusColor,
                            fontWeight: '800',
                            fontSize: '12.5px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px'
                          }}>
                            {st === 'rejected' ? 'canceled' : st}
                          </span>
                        </td>
                        <td className="dashboard-td" style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {expense.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveExpense && approveExpense(expense._id)}
                                  style={{
                                    backgroundColor: '#16a34a',
                                    color: '#ffffff',
                                    border: 'none',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 2px 5px rgba(22, 163, 74, 0.2)'
                                  }}
                                  title="Approve Expense"
                                >
                                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectExpense && rejectExpense(expense._id)}
                                  style={{
                                    backgroundColor: '#dc2626',
                                    color: '#ffffff',
                                    border: 'none',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 2px 5px rgba(220, 38, 38, 0.2)'
                                  }}
                                  title="Reject / Cancel Expense"
                                >
                                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedExpense && setSelectedExpense(expense)}
                              style={{
                                backgroundColor: '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: '0 2px 5px rgba(15, 23, 42, 0.15)'
                              }}
                              title="View Expense Details"
                            >
                              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No expenses found in this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Record New Transaction Modal */}
          {showAddExpenseModal && (
            <div className="dashboard-modal-overlay">
              <div className="dashboard-modal" style={{ maxWidth: '520px', width: '92%', borderRadius: '16px', overflow: 'hidden' }}>
                <div className="dashboard-modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="dashboard-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                        Record New Transaction
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Log ministry disbursements or operational expenses</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExpenseModal(false);
                      setCustomExpenseCategory('');
                    }}
                    className="dashboard-close-btn"
                    aria-label="Close"
                  >
                    <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitExpense}>
                  <div className="dashboard-modal-content" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Transaction Type Toggle Buttons */}
                    <div className="dashboard-form-group">
                      <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155', marginBottom: '8px', display: 'block' }}>
                        Transaction Type *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionType('disbursement');
                            if (setExpenseCategory) setExpenseCategory('');
                            setCustomExpenseCategory('');
                          }}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: transactionType === 'disbursement' ? '700' : '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease-in-out',
                            border: transactionType === 'disbursement' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            backgroundColor: transactionType === 'disbursement' ? '#2563eb' : '#ffffff',
                            color: transactionType === 'disbursement' ? '#ffffff' : '#475569',
                            boxShadow: transactionType === 'disbursement' ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                          }}
                        >
                          Disbursement
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionType('expense');
                            if (setExpenseCategory) setExpenseCategory('');
                            setCustomExpenseCategory('');
                          }}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: transactionType === 'expense' ? '700' : '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease-in-out',
                            border: transactionType === 'expense' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            backgroundColor: transactionType === 'expense' ? '#2563eb' : '#ffffff',
                            color: transactionType === 'expense' ? '#ffffff' : '#475569',
                            boxShadow: transactionType === 'expense' ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                          }}
                        >
                          Expense
                        </button>
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="dashboard-form-group">
                      <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                        Category *
                      </label>
                      <select
                        className="dashboard-select"
                        value={expenseCategory || ''}
                        onChange={(e) => setExpenseCategory && setExpenseCategory(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select category</option>
                        {transactionType === 'disbursement' ? (
                          <>
                            <option value="Student Scholarships">Student Scholarships</option>
                            <option value="Elderly Assistance">Elderly Assistance</option>
                            <option value="Urban Poor Assistance">Urban Poor Assistance</option>
                            <option value="PDL Assistance">PDL Assistance</option>
                            <option value="LGBTQ Assistance">LGBTQ Assistance</option>
                            <option value="Migrant Ministry">Migrant Ministry</option>
                            <option value="Drug Rehabilitation">Drug Rehabilitation</option>
                          </>
                        ) : (
                          <>
                            <option value="Parish Operations &amp; Maintenance">Parish Operations &amp; Maintenance</option>
                            <option value="Transportation &amp; Logistics">Transportation &amp; Logistics</option>
                            <option value="Relief Goods Procurement">Relief Goods Procurement</option>
                            <option value="Medical &amp; Health Supplies">Medical &amp; Health Supplies</option>
                            <option value="Shelter &amp; Emergency Materials">Shelter &amp; Emergency Materials</option>
                            <option value="Others">Others</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Others, Please Specify (Only for Expense + Others) */}
                    {transactionType === 'expense' && (expenseCategory === 'Others' || expenseCategory === 'other') && (
                      <div className="dashboard-form-group">
                        <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#2563eb' }}>
                          Others, please specify *
                        </label>
                        <input
                          type="text"
                          className="dashboard-input"
                          placeholder="e.g. Utility Bills, Equipment Repair..."
                          value={customExpenseCategory}
                          onChange={(e) => setCustomExpenseCategory(e.target.value)}
                          required
                          autoFocus
                          style={{ borderColor: '#93c5fd' }}
                        />
                      </div>
                    )}

                    <div className="dashboard-form-group">
                      <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Amount (PHP) *</label>
                      <input
                        type="number"
                        className="dashboard-input"
                        placeholder="0.00"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount && setExpenseAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>

                    <div className="dashboard-form-group">
                      <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Description / Voucher Remarks *</label>
                      <textarea
                        className="dashboard-input"
                        rows="3"
                        placeholder="Enter description, purpose, or official voucher number..."
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription && setExpenseDescription(e.target.value)}
                        required
                        style={{ resize: 'vertical' }}
                      ></textarea>
                    </div>
                  </div>

                  <div className="dashboard-modal-buttons" style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="submit"
                      className="dashboard-submit-btn"
                      style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', minWidth: '220px', padding: '12px 28px', fontSize: '14px', borderRadius: '10px' }}
                    >
                      Record Transaction
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Expense Detail View Modal */}
          {selectedExpense && (
            <div className="dashboard-modal-overlay">
              <div className="dashboard-modal">
                <div className="dashboard-modal-header">
                  <h3 className="dashboard-modal-title">Expense Details</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedExpense && setSelectedExpense(null)}
                    className="dashboard-close-btn"
                    aria-label="Close"
                  >
                    <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="dashboard-modal-content">
                  <p className="dashboard-modal-text"><strong>Category:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedExpense.category?.replace(/-/g, ' ')}</span></p>
                  <p className="dashboard-modal-text"><strong>Amount:</strong> <span style={{ color: '#dc2626', fontWeight: '800' }}>{formatCurrency(selectedExpense.amount)}</span></p>
                  <p className="dashboard-modal-text"><strong>Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: '700' }}>{selectedExpense.status || 'approved'}</span></p>
                  {selectedExpense.date && (
                    <p className="dashboard-modal-text"><strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString()}</p>
                  )}
                  {selectedExpense.status === 'approved' && (selectedExpense.approvedAt || selectedExpense.updatedAt) && (
                    <p className="dashboard-modal-text">
                      <strong>Approved Date &amp; Time:</strong> {new Date(selectedExpense.approvedAt || selectedExpense.updatedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {selectedExpense.status === 'rejected' && (selectedExpense.rejectedAt || selectedExpense.updatedAt) && (
                    <p className="dashboard-modal-text">
                      <strong>Rejected Date &amp; Time:</strong> {new Date(selectedExpense.rejectedAt || selectedExpense.updatedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {selectedExpense.description && (
                    <p className="dashboard-modal-text"><strong>Description:</strong> {selectedExpense.description}</p>
                  )}
                  <div className="dashboard-modal-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" className="dashboard-cancel-btn" onClick={() => setSelectedExpense && setSelectedExpense(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialAuditTab;
