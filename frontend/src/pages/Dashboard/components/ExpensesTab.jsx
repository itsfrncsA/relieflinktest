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
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const approvedExpensesList = expenses.filter(e => e.status === 'approved' || !e.status);
  const totalExpenseSum = approvedExpensesList.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const approvedCount = approvedExpensesList.length;
  const rejectedCount = expenses.filter(e => e.status === 'rejected').length;

  const filteredExpenses = expenses.filter(expense => {
    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? expense.status === 'pending' :
      statusFilter === 'approved' ? (expense.status === 'approved' || !expense.status) :
      statusFilter === 'rejected' ? expense.status === 'rejected' : true;

    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      expense.description?.toLowerCase().includes(q) ||
      expense.category?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    await addExpense(e);
    setShowAddExpenseModal(false);
  };

  return (
    <div className="dashboard-main-content">
      {/* Header & Record Expense Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Expense Management
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Track operational disbursements, relief supplies procurement, and ministry allowances
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddExpenseModal(true)}
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
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Record New Expense
        </button>
      </div>

      {/* Filter Tabs / Status Pills */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: statusFilter === 'all' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: statusFilter === 'all' ? '#2563eb' : '#ffffff',
            color: statusFilter === 'all' ? '#ffffff' : '#334155',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>All Expenses</span>
          <span style={{ background: statusFilter === 'all' ? 'rgba(255,255,255,0.25)' : '#f1f5f9', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' }}>
            {expenses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: statusFilter === 'pending' ? '1px solid #d97706' : '1px solid #cbd5e1',
            background: statusFilter === 'pending' ? '#d97706' : '#ffffff',
            color: statusFilter === 'pending' ? '#ffffff' : '#b45309',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Pending Review</span>
          <span style={{ background: statusFilter === 'pending' ? 'rgba(255,255,255,0.25)' : '#fef9c3', color: statusFilter === 'pending' ? '#fff' : '#a16207', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('approved')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: statusFilter === 'approved' ? '1px solid #16a34a' : '1px solid #cbd5e1',
            background: statusFilter === 'approved' ? '#16a34a' : '#ffffff',
            color: statusFilter === 'approved' ? '#ffffff' : '#166534',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Approved</span>
          <span style={{ background: statusFilter === 'approved' ? 'rgba(255,255,255,0.25)' : '#dcfce7', color: statusFilter === 'approved' ? '#fff' : '#15803d', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' }}>
            {approvedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('rejected')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: statusFilter === 'rejected' ? '1px solid #dc2626' : '1px solid #cbd5e1',
            background: statusFilter === 'rejected' ? '#dc2626' : '#ffffff',
            color: statusFilter === 'rejected' ? '#ffffff' : '#991b1b',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Rejected</span>
          <span style={{ background: statusFilter === 'rejected' ? 'rgba(255,255,255,0.25)' : '#fee2e2', color: statusFilter === 'rejected' ? '#fff' : '#b91c1c', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' }}>
            {rejectedCount}
          </span>
        </button>
      </div>

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
              {filteredExpenses.map((expense) => (
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
                    <span className={`status-badge ${expense.status || 'pending'}`}>
                      {expense.status || 'pending'}
                    </span>
                  </td>
                  <td className="dashboard-td" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {expense.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => approveExpense(expense._id)}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectExpense(expense._id)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => setSelectedExpense(expense)}
                        style={{ padding: '5px 12px', fontSize: '11px', fontWeight: '600' }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

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

      {/* Add New Expense Modal */}
      {showAddExpenseModal && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal" style={{ maxWidth: '500px', width: '90%', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="dashboard-modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '18px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="dashboard-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    Record New Expense
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Log disbursements and operational costs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(false)}
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
                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Category *</label>
                  <select
                    className="dashboard-select"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="relief-goods">Relief Goods Procurement</option>
                    <option value="medical-supplies">Medical &amp; Health Supplies</option>
                    <option value="transportation">Transportation &amp; Logistics</option>
                    <option value="shelter-materials">Shelter &amp; Emergency Materials</option>
                    <option value="communication">Communication &amp; Utilities</option>
                    <option value="Scholarship Aid">Scholarship &amp; Educational Aid</option>
                    <option value="operations">Parish Operations &amp; Maintenance</option>
                    <option value="other">Other Direct Aid / Operations</option>
                  </select>
                </div>

                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Amount (PHP) *</label>
                  <input
                    type="number"
                    className="dashboard-input"
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    step="0.01"
                    required
                  />
                </div>

                <div className="dashboard-form-group">
                  <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Description / Voucher Remarks *</label>
                  <textarea
                    className="dashboard-input"
                    rows="3"
                    placeholder="Enter expense description, official voucher number, or purpose..."
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>

              <div className="dashboard-modal-buttons" style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="dashboard-cancel-btn"
                  onClick={() => setShowAddExpenseModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dashboard-submit-btn"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                >
                  Record Expense
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
