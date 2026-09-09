import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

const EXPENSE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b'];

const ExpensesTab = ({
  expenses,
  expenseByCategory,
  expenseCategory,
  setExpenseCategory,
  expenseAmount,
  setExpenseAmount,
  expenseDescription,
  setExpenseDescription,
  addExpense,
  selectedExpense,
  setSelectedExpense,
  approveExpense,
  rejectExpense,
  formatCurrency
}) => {
  const totalExpenseSum = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="dashboard-main-content">
      <h2 className="dashboard-section-title">Expense Management</h2>

      {/* Expense Allocation by Category Pie / Donut Chart */}
      <div className="dashboard-chart-card dashboard-chart-card-inline" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 className="dashboard-chart-title" style={{ margin: 0 }}>Expense Allocation by Category</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Breakdown of organizational disbursements across operational and relief categories
            </p>
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            Total Expenses: <span style={{ color: '#dc2626' }}>{formatCurrency(totalExpenseSum)}</span>
          </div>
        </div>

        <div className="dashboard-chart-wrap" style={{ minHeight: '300px' }}>
          {expenseByCategory.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1.2fr) minmax(240px, 1fr)', gap: '20px', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="amount"
                    nameKey="name"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell
                        key={`expense-cell-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expenseByCategory.map((item, index) => {
                  const percent = totalExpenseSum > 0 ? Math.round((item.amount / totalExpenseSum) * 100) : 0;
                  const color = EXPENSE_COLORS[index % EXPENSE_COLORS.length];
                  return (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }}></span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' }}>{item.name.replace(/-/g, ' ')}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{formatCurrency(item.amount)}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>
              No expense records found.
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="dashboard-form-card" style={{ marginBottom: '24px' }}>
        <h3 className="form-title">Add New Expense</h3>
        <form className="dashboard-form" onSubmit={addExpense}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} required>
                <option value="">Select category</option>
                <option value="relief-goods">Relief Goods</option>
                <option value="medical-supplies">Medical Supplies</option>
                <option value="transportation">Transportation</option>
                <option value="shelter-materials">Shelter Materials</option>
                <option value="communication">Communication</option>
                <option value="operations">Parish Operations</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (PHP)</label>
              <input type="number" className="form-input" placeholder="0.00" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} step="0.01" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows="3" placeholder="Enter expense description, voucher number, or purpose" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="submit-btn" style={{ background: '#2563eb' }}>Record Expense</button>
        </form>
      </div>

      {/* Expenses Table */}
      <div className="dashboard-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="dashboard-th">Category</th>
                <th className="dashboard-th">Description</th>
                <th className="dashboard-th">Amount</th>
                <th className="dashboard-th">Date</th>
                <th className="dashboard-th">Status</th>
                <th className="dashboard-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td className="dashboard-td">
                    <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#1e293b' }}>
                      {expense.category?.replace(/-/g, ' ')}
                    </span>
                  </td>
                  <td className="dashboard-td">{expense.description}</td>
                  <td className="dashboard-td amount" style={{ fontWeight: '800', color: '#dc2626' }}>
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="dashboard-td">{expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</td>
                  <td className="dashboard-td">
                    <span className={`status-badge ${expense.status || 'approved'}`}>
                      {expense.status || 'approved'}
                    </span>
                  </td>
                  <td className="dashboard-td" style={{ textAlign: 'right' }}>
                    <button type="button" className="action-btn edit-btn" onClick={() => setSelectedExpense(expense)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal">
            <div className="dashboard-modal-header">
              <h3 className="dashboard-modal-title">Expense Details</h3>
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
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
              <p className="dashboard-modal-text"><strong>Status:</strong> {selectedExpense.status || 'approved'}</p>
              {selectedExpense.date && (
                <p className="dashboard-modal-text"><strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString()}</p>
              )}
              {selectedExpense.description && (
                <p className="dashboard-modal-text"><strong>Description:</strong> {selectedExpense.description}</p>
              )}
              <div className="dashboard-modal-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                {(selectedExpense.status === 'pending') && (
                  <>
                    <button
                      type="button"
                      className="dashboard-submit-btn approve-btn"
                      style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                      onClick={() => approveExpense(selectedExpense._id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="dashboard-submit-btn reject-btn"
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                      onClick={() => rejectExpense(selectedExpense._id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button type="button" className="dashboard-cancel-btn" onClick={() => setSelectedExpense(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
