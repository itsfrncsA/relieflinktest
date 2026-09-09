import React from 'react';

const DashboardHeader = ({
  donations,
  expenses,
  users,
  formatCurrency
}) => {
  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netFunds = totalDonations - totalExpenses;
  const activeUsersCount = users.filter(u => u.status === 'active' || !u.status).length;

  return (
    <div className="dashboard-ticker" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(15,23,42,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
          Live KPI Overview:
        </span>
      </div>

      <div style={{ fontSize: '13px', color: '#64748b' }}>
        Total Donations: <strong style={{ color: '#16a34a' }}>{formatCurrency(totalDonations)}</strong>
      </div>
      <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1' }}></div>

      <div style={{ fontSize: '13px', color: '#64748b' }}>
        Total Expenses: <strong style={{ color: '#dc2626' }}>{formatCurrency(totalExpenses)}</strong>
      </div>
      <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1' }}></div>

      <div style={{ fontSize: '13px', color: '#64748b' }}>
        Net Funds: <strong style={{ color: '#059669' }}>{formatCurrency(netFunds)}</strong>
      </div>
      <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1' }}></div>

      <div style={{ fontSize: '13px', color: '#64748b' }}>
        Active Users: <strong style={{ color: '#0f172a' }}>{activeUsersCount}</strong>
      </div>
    </div>
  );
};

export default DashboardHeader;
