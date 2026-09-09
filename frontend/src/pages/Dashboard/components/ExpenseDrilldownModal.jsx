import React from 'react';

const ExpenseDrilldownModal = ({
  showDrilldownModal,
  setShowDrilldownModal,
  expenses,
  formatCurrency
}) => {
  if (!showDrilldownModal) return null;

  const totalExp = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const map = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    map[cat] = (map[cat] || 0) + (e.amount || 0);
  });

  return (
    <div className="drilldown-modal-overlay" onClick={() => setShowDrilldownModal(false)}>
      <div className="drilldown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="drilldown-header">
          <h3>Expense Breakdown by Category</h3>
          <button
            type="button"
            className="drilldown-close-btn"
            onClick={() => setShowDrilldownModal(false)}
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="drilldown-content">
          {Object.entries(map).map(([name, amt]) => {
            const pct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;
            return (
              <div key={name} className="category-drilldown-row">
                <div className="category-drilldown-info">
                  <span style={{ textTransform: 'capitalize' }}>{name.replace(/-/g, ' ')}</span>
                  <span>{formatCurrency(amt)} ({pct}%)</span>
                </div>
                <div className="category-drilldown-bar-bg">
                  <div className="category-drilldown-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
          {expenses.length === 0 && (
            <p style={{ textAlign: 'center', color: '#64748b' }}>No expense records available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDrilldownModal;
