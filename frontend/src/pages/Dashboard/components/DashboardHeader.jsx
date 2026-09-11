import React from 'react';

const DashboardHeader = ({
  donations,
  expenses,
  users,
  formatCurrency
}) => {
  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalExpenses = expenses.filter(e => e.status === 'approved' || !e.status).reduce((sum, e) => sum + (e.amount || 0), 0);
  const netFunds = totalDonations - totalExpenses;
  const activeUsersCount = users.filter(u => u.status === 'active' || !u.status).length;

  return (
    <div
      className="dashboard-ticker"
      style={{
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          display: 'inline-block',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
        }}></span>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Live Audit Overview:
        </span>
      </div>

      <div style={{
        fontSize: '13px',
        color: '#475569',
        backgroundColor: '#f8fafc',
        padding: '4px 12px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>Donations:</span>
        <strong style={{ color: '#16a34a' }}>{formatCurrency(totalDonations)}</strong>
      </div>

      <div style={{
        fontSize: '13px',
        color: '#475569',
        backgroundColor: '#f8fafc',
        padding: '4px 12px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>Expenses:</span>
        <strong style={{ color: '#e11d48' }}>{formatCurrency(totalExpenses)}</strong>
      </div>

      <div style={{
        fontSize: '13px',
        color: '#475569',
        backgroundColor: '#f8fafc',
        padding: '4px 12px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>Net Funds:</span>
        <strong style={{ color: '#059669' }}>{formatCurrency(netFunds)}</strong>
      </div>

      <div style={{
        fontSize: '13px',
        color: '#475569',
        backgroundColor: '#f8fafc',
        padding: '4px 12px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>Active Users:</span>
        <strong style={{ color: '#0f172a' }}>{activeUsersCount}</strong>
      </div>
    </div>
  );
};

export default DashboardHeader;
