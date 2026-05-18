import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { API_URL } from "../../api";

const Dashboard = () => {
  const [donations, setDonations] = useState([]);
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedDonationForVerification, setSelectedDonationForVerification] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('approved');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [mainTab, setMainTab] = useState('donations');
  const [donationFilter, setDonationFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userManagementTab, setUserManagementTab] = useState('active');
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([
    { _id: '1', category: 'Relief Goods', amount: 50000, description: 'Food packs for typhoon victims', date: '2024-01-15', status: 'approved' },
    { _id: '2', category: 'Medical Supplies', amount: 25000, description: 'Medicines for health centers', date: '2024-01-18', status: 'approved' },
    { _id: '3', category: 'Transportation', amount: 15000, description: 'Delivery logistics', date: '2024-01-20', status: 'pending' },
    { _id: '4', category: 'Shelter Materials', amount: 75000, description: 'Tents and sleeping mats', date: '2024-01-22', status: 'approved' },
    { _id: '5', category: 'Communication', amount: 8000, description: 'Emergency communication equipment', date: '2024-01-25', status: 'approved' }
  ]);
  const [inventory, setInventory] = useState([
    { _id: '1', item: 'Food Packs', quantity: 500, unit: 'boxes', location: 'Warehouse A', status: 'available', lastUpdated: '2024-01-25' },
    { _id: '2', item: 'Bottled Water', quantity: 1000, unit: 'cases', location: 'Warehouse B', status: 'available', lastUpdated: '2024-01-24' },
    { _id: '3', item: 'Blankets', quantity: 300, unit: 'pieces', location: 'Warehouse A', status: 'distributed', lastUpdated: '2024-01-23' },
    { _id: '4', item: 'Medicine Kits', quantity: 150, unit: 'kits', location: 'Medical Center', status: 'available', lastUpdated: '2024-01-25' },
    { _id: '5', item: 'Tents', quantity: 50, unit: 'units', location: 'Warehouse C', status: 'reserved', lastUpdated: '2024-01-22' }
  ]);
  const [reports, setReports] = useState([
    { _id: '1', title: 'January 2024 Relief Operations', type: 'Monthly Report', date: '2024-01-31', status: 'completed', downloads: 45 },
    { _id: '2', title: 'Typhoon Response Impact', type: 'Special Report', date: '2024-01-28', status: 'completed', downloads: 78 },
    { _id: '3', title: 'Q4 2023 Financial Summary', type: 'Quarterly Report', date: '2024-01-15', status: 'completed', downloads: 32 },
    { _id: '4', title: 'February 2024 Operations Plan', type: 'Planning Report', date: '2024-02-01', status: 'draft', downloads: 12 },
    { _id: '5', title: 'Annual Impact Assessment 2023', type: 'Annual Report', date: '2024-01-10', status: 'completed', downloads: 156 }
  ]);
  const token = localStorage.getItem('token');
  const [currentUser, setCurrentUser] = useState(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonations(res.data);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setMessage('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addDonation = async (e) => {
    e.preventDefault();
    if (!donorName || !amount) {
      setMessage('Please fill in all fields');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_URL}/donations/${editingId}`, { donorName, amount: parseFloat(amount) }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('✓ Donation updated successfully!');
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/donations`, { donorName, amount: parseFloat(amount) }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('✓ Donation added successfully!');
      }
      setDonorName('');
      setAmount('');
      fetchDonations();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving donation:', err.response || err);
      const errorMsg = err.response?.data?.message || err.message || 'Error saving donation';
      setMessage('✗ ' + errorMsg);
    }
  };

  const viewDonation = (donation) => {
    setEditingId(donation._id);
    setDonorName(donation.donorName);
    setAmount(donation.amount.toString());
  };

  const uploadReceipt = async (donationId) => {
    if (!selectedFile) {
      setMessage('Please select a file to upload');
      return;
    }

    try {
      setUploadingId(donationId);
      const formData = new FormData();
      formData.append('receipt', selectedFile);
      formData.append('donationId', donationId);

      await axios.post(
        `${API_URL}/donations/${donationId}/upload-receipt`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage('✓ Receipt uploaded successfully!');
      setSelectedFile(null);
      fetchDonations();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading receipt:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error uploading receipt';
      setMessage('✗ ' + errorMsg);
    } finally {
      setUploadingId(null);
    }
  };

  const handleVerifyReceipt = async () => {
    if (!selectedDonationForVerification) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/donations/${selectedDonationForVerification._id}/verify-receipt`,
        {
          status: verificationStatus,
          notes: verificationNotes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage(`✓ Receipt ${verificationStatus} successfully!`);
      setShowVerificationModal(false);
      setSelectedDonationForVerification(null);
      setVerificationNotes('');
      setVerificationStatus('approved');
      fetchDonations();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error verifying receipt:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error verifying receipt';
      setMessage('✗ ' + errorMsg);
    }
  };

  const downloadReceipt = async (donationId, fileName) => {
    try {
      const res = await axios.get(
        `${API_URL}/donations/${donationId}/download-receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setMessage('✗ Error downloading receipt');
    }
  };

  const filteredDonations = donationFilter === 'all' 
    ? donations 
    : donationFilter === 'pending' 
    ? donations.filter(d => d.verificationStatus === 'pending')
    : donationFilter === 'verified'
    ? donations.filter(d => d.verified)
    : donations;

  const deleteDonation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/donations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✓ Donation deleted successfully!');
      fetchDonations();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting donation:', err.response || err);
      const errorMsg = err.response?.data?.message || err.message || 'Error deleting donation';
      setMessage('✗ ' + errorMsg);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDonorName('');
    setAmount('');
  };

  const handleEditUser = (user) => {
    setMessage('Edit user feature coming soon');
  };

  const handleResetPassword = async (user) => {
    const newPassword = prompt('Enter new password for this user:');
    if (!newPassword) return;

    try {
      await axios.patch(`${API_URL}/users/${user._id}/reset-password`, {
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Password reset successfully');
    } catch (err) {
      console.error('Error resetting password:', err);
      setMessage('Failed to reset password');
    }
  };

  const handleApproveUser = async (user) => {
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    try {
      await axios.patch(`${API_URL}/users/${user._id}/approve`, {
        role: user.role,
        department: user.department
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update user in local state
      setUsers(users.map(u => u._id === user._id ? { ...u, status: 'active' } : u));
      setMessage('User approved successfully');
    } catch (err) {
      console.error('Error approving user:', err);
      setMessage('Failed to approve user');
    }
  };

  const handleRejectUser = async (user) => {
    const reason = prompt('Please enter reason for rejection:');
    if (!reason) return;

    try {
      await axios.patch(`${API_URL}/users/${user._id}/reject`, {
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove user from local state
      setUsers(users.filter(u => u._id !== user._id));
      setMessage('User rejected successfully');
    } catch (err) {
      console.error('Error rejecting user:', err);
      setMessage('Failed to reject user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  useEffect(() => {
    // Load current user from localStorage
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== 'undefined') {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }

    if (!token) {
      window.location.href = '/';
      return;
    }
    fetchDonations();
    fetchUsers();
  }, [token, fetchDonations, fetchUsers]);

  return (
    <div className="dashboard-container">
      <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-header">
            <div className="dashboard-sidebar-title">Admin Dashboard</div>
            <div className="dashboard-sidebar-user">
              <div className="user-info">
                <div className="user-name">{currentUser?.name || currentUser?.username || currentUser?.email || 'Admin'}</div>
                <div className="user-role">{currentUser?.role || 'Administrator'}</div>
              </div>
            </div>
          </div>

          <nav className="dashboard-sidebar-nav">
            <button
              className={`dashboard-sidebar-link ${mainTab === 'donations' ? 'active' : ''}`}
              onClick={() => {
                setMainTab('donations');
                setIsSidebarOpen(false);
              }}
            >
              Donations
            </button>
            <button
              className={`dashboard-sidebar-link ${mainTab === 'expenses' ? 'active' : ''}`}
              onClick={() => {
                setMainTab('expenses');
                setIsSidebarOpen(false);
              }}
            >
              Expenses
            </button>
            <button
              className={`dashboard-sidebar-link ${mainTab === 'inventory' ? 'active' : ''}`}
              onClick={() => {
                setMainTab('inventory');
                setIsSidebarOpen(false);
              }}
            >
              Inventory
            </button>
            <button
              className={`dashboard-sidebar-link ${mainTab === 'users' ? 'active' : ''}`}
              onClick={() => {
                setMainTab('users');
                setIsSidebarOpen(false);
              }}
            >
              Users
            </button>
            <button
              className={`dashboard-sidebar-link ${mainTab === 'reports' ? 'active' : ''}`}
              onClick={() => {
                setMainTab('reports');
                setIsSidebarOpen(false);
              }}
            >
              Reports
            </button>
            <button
              className={`dashboard-sidebar-link ${mainTab === 'transparency' ? 'active' : ''}`}
              onClick={() => {
                setMainTab('transparency');
                setIsSidebarOpen(false);
              }}
            >
              Transparency
            </button>
          </nav>

          <div className="dashboard-sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-topbar">
            <button
              className="dashboard-sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
              type="button"
            >
              ☰
            </button>
            <div className="dashboard-topbar-title">Welcome, {currentUser?.name || currentUser?.username || currentUser?.email || 'Admin'}</div>
            <button onClick={handleLogout} className="logout-btn dashboard-topbar-logout">
              Logout
            </button>
          </div>

      {mainTab === 'donations' && (
        <div className="dashboard-main-content">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Donations</h2>
            
          </div>
          {/* Form Section */}
          <div className="dashboard-form-card">
            <h2 className="dashboard-section-title">
              {editingId ? 'View Donation' : 'New Donation'}
            </h2>
            <form onSubmit={addDonation} className="dashboard-form">
              <div className="dashboard-form-row">
                <div className="dashboard-form-group">
                  <label className="dashboard-label">Donor Name</label>
                  <input
                    type="text"
                    placeholder="Enter donor name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="dashboard-input"
                  />
                </div>
                <div className="dashboard-form-group">
                  <label className="dashboard-label">Amount (PHP)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    className="dashboard-input"
                  />
                </div>
              </div>
              <div className="dashboard-button-group">
                <button type="submit" className="dashboard-submit-btn" disabled={loading}>
                  {editingId ? '📋 View Donation' : '➕ Add Donation'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="dashboard-cancel-btn">
                    ✕ Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Messages */}
          {message && (
            <div className="dashboard-message-alert">
              <span className="dashboard-message-icon">✓</span>
              <p className="dashboard-message-text">{message}</p>
            </div>
          )}

          {/* Table Section */}
          <div className="dashboard-table-card">
            <h2 className="dashboard-section-title">📋 Donations List</h2>
            
            {/* Tabs */}
            <div className="dashboard-tabs-container">
              <button 
                className={`dashboard-tab ${donationFilter === 'all' ? 'dashboard-tab-active' : ''}`}
                onClick={() => setDonationFilter('all')}
              >
                All ({donations.length})
              </button>
              <button 
                className={`dashboard-tab ${donationFilter === 'pending' ? 'dashboard-tab-active' : ''}`}
                onClick={() => setDonationFilter('pending')}
              >
                Pending ({donations.filter(d => d.verificationStatus === 'pending').length})
              </button>
              <button 
                className={`dashboard-tab ${donationFilter === 'verified' ? 'dashboard-tab-active' : ''}`}
                onClick={() => setDonationFilter('verified')}
              >
                Verified ({donations.filter(d => d.verified).length})
              </button>
            </div>

            {loading && <p className="dashboard-loading-text">Loading...</p>}
            {filteredDonations.length === 0 && !loading ? (
              <p className="dashboard-empty-state">No donations found in this category.</p>
            ) : (
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr className="dashboard-header-row">
                      <th className="dashboard-th">Donor Name</th>
                      <th className="dashboard-th">Amount</th>
                      <th className="dashboard-th">Receipt</th>
                      <th className="dashboard-th">Status</th>
                      <th className="dashboard-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map(d => (
                      <tr key={d._id} className="dashboard-row">
                        <td className="dashboard-td">{d.donorName}</td>
                        <td className="dashboard-td"><strong>₱{d.amount.toFixed(2)}</strong></td>
                        <td className="dashboard-td">
                          <div className="dashboard-receipt-cell">
                            {d.receiptPath ? (
                              <div className="dashboard-receipt-status">
                                <span className="dashboard-receipt-icon">📄</span>
                                <button 
                                  onClick={() => downloadReceipt(d._id, d.receiptFileName)}
                                  className="dashboard-download-link"
                                >
                                  Download
                                </button>
                              </div>
                            ) : (
                              <span className="dashboard-no-receipt">No receipt</span>
                            )}
                          </div>
                        </td>
                        <td className="dashboard-td">
                          <div className="dashboard-status-column">
                            <span className={`dashboard-badge ${d.verified ? 'dashboard-badge-verified' : d.verificationStatus === 'pending' ? 'dashboard-badge-pending' : 'dashboard-badge-rejected'}`}>
                              {d.verified ? '✓ Verified' : d.verificationStatus === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                            </span>
                          </div>
                        </td>
                        <td className="dashboard-td">
                          <div className="dashboard-action-buttons">
                            {d.verificationStatus === 'pending' && d.receiptPath && (
                              <button 
                                onClick={() => {
                                  setSelectedDonationForVerification(d);
                                  setShowVerificationModal(true);
                                }} 
                                className="dashboard-verify-btn"
                                title="Verify receipt"
                              >
                                ✓
                              </button>
                            )}
                            <button onClick={() => viewDonation(d)} className="dashboard-view-btn" title="View donation">
                              <img src="/assets/view.png" alt="View" style={{width: '16px', height: '16px'}} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Receipt Upload Row - shows when editing a donation */}
                {editingId && (
                  <div className="dashboard-receipt-upload-section">
                    <h3 className="dashboard-upload-title">📎 Upload Receipt for this Donation</h3>
                    <div className="dashboard-upload-container">
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="dashboard-file-input"
                      />
                      <button 
                        onClick={() => uploadReceipt(editingId)}
                        className="dashboard-upload-btn"
                        disabled={!selectedFile || uploadingId === editingId}
                      >
                        {uploadingId === editingId ? '⏳ Uploading...' : '📤 Upload Receipt'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Modal */}
          {showVerificationModal && selectedDonationForVerification && (
            <div className="dashboard-modal-overlay">
              <div className="dashboard-modal">
                <div className="dashboard-modal-header">
                  <h3 className="dashboard-modal-title">✓ Verify Receipt</h3>
                  <button 
                    onClick={() => {
                      setShowVerificationModal(false);
                      setSelectedDonationForVerification(null);
                    }}
                    className="dashboard-close-btn"
                  >
                    ✕
                  </button>
                </div>
                <div className="dashboard-modal-content">
                  <p className="dashboard-modal-text">
                    <strong>Donor:</strong> {selectedDonationForVerification.donorName}
                  </p>
                  <p className="dashboard-modal-text">
                    <strong>Amount:</strong> ₱{selectedDonationForVerification.amount.toFixed(2)}
                  </p>
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Verification Decision</label>
                    <select 
                      value={verificationStatus}
                      onChange={(e) => setVerificationStatus(e.target.value)}
                      className="dashboard-select"
                    >
                      <option value="approved">✓ Approve</option>
                      <option value="rejected">✗ Reject</option>
                    </select>
                  </div>
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Notes</label>
                    <textarea 
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="dashboard-textarea"
                      placeholder="Add verification notes..."
                    />
                  </div>
                  <div className="dashboard-modal-buttons">
                    <button 
                      onClick={() => {
                        if (verificationStatus && verificationNotes) {
                          // API call to update verification status
                          handleVerifyReceipt();
                        }
                      }}
                      className="dashboard-verify-btn"
                      disabled={!verificationStatus || !verificationNotes}
                    >
                      ✓ Verify Receipt
                    </button>
                    <button 
                      onClick={() => {
                        setShowVerificationModal(false);
                        setSelectedDonationForVerification(null);
                        setVerificationStatus('');
                        setVerificationNotes('');
                      }}
                      className="dashboard-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other tabs content */}
      {mainTab === 'expenses' && (
        <div className="dashboard-main-content">
          <h2 className="dashboard-section-title">Expense Management</h2>
          
          {/* Add Expense Form */}
          <div className="dashboard-form-card">
            <h3 className="form-title">Add New Expense</h3>
            <form className="dashboard-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input">
                    <option value="">Select category</option>
                    <option value="relief-goods">Relief Goods</option>
                    <option value="medical-supplies">Medical Supplies</option>
                    <option value="transportation">Transportation</option>
                    <option value="shelter-materials">Shelter Materials</option>
                    <option value="communication">Communication</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₱)</label>
                  <input type="number" className="form-input" placeholder="0.00" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Enter expense description"></textarea>
              </div>
              <button type="submit" className="submit-btn">Add Expense</button>
            </form>
          </div>

          {/* Expenses Table */}
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-th">Category</th>
                  <th className="dashboard-th">Description</th>
                  <th className="dashboard-th">Amount</th>
                  <th className="dashboard-th">Date</th>
                  <th className="dashboard-th">Status</th>
                  <th className="dashboard-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="dashboard-td">{expense.category}</td>
                    <td className="dashboard-td">{expense.description}</td>
                    <td className="dashboard-td">₱{expense.amount.toLocaleString()}</td>
                    <td className="dashboard-td">{expense.date}</td>
                    <td className="dashboard-td">
                      <span className={`status-badge ${expense.status}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="dashboard-td">
                      <div className="action-buttons">
                        <button className="action-btn edit-btn">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'inventory' && (
        <div className="dashboard-main-content">
          <h2 className="dashboard-section-title">Inventory Management</h2>
          
          {/* Add Inventory Form */}
          <div className="dashboard-form-card">
            <h3 className="form-title">Add New Item</h3>
            <form className="dashboard-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input type="text" className="form-input" placeholder="Enter item name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-input">
                    <option value="">Select unit</option>
                    <option value="pieces">Pieces</option>
                    <option value="boxes">Boxes</option>
                    <option value="cases">Cases</option>
                    <option value="units">Units</option>
                    <option value="kits">Kits</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <select className="form-input">
                    <option value="">Select location</option>
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Warehouse B">Warehouse B</option>
                    <option value="Warehouse C">Warehouse C</option>
                    <option value="Medical Center">Medical Center</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input">
                    <option value="available">Available</option>
                    <option value="distributed">Distributed</option>
                    <option value="reserved">Reserved</option>
                    <option value="low-stock">Low Stock</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="submit-btn">Add Item</button>
            </form>
          </div>

          {/* Inventory Table */}
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-th">Item</th>
                  <th className="dashboard-th">Quantity</th>
                  <th className="dashboard-th">Unit</th>
                  <th className="dashboard-th">Location</th>
                  <th className="dashboard-th">Status</th>
                  <th className="dashboard-th">Last Updated</th>
                  <th className="dashboard-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item._id}>
                    <td className="dashboard-td">{item.item}</td>
                    <td className="dashboard-td">{item.quantity}</td>
                    <td className="dashboard-td">{item.unit}</td>
                    <td className="dashboard-td">{item.location}</td>
                    <td className="dashboard-td">
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="dashboard-td">{item.lastUpdated}</td>
                    <td className="dashboard-td">
                      <div className="action-buttons">
                        <button className="action-btn edit-btn">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'users' && (
        <div className="dashboard-main-content">
          <h2 className="dashboard-section-title">User Management</h2>
          
          <div className="user-management-tabs">
            <button 
              className={`user-tab ${userManagementTab === 'active' ? 'active' : ''}`}
              onClick={() => setUserManagementTab('active')}
            >
              Active Users ({users.filter(u => u.status === 'active').length})
            </button>
            <button 
              className={`user-tab ${userManagementTab === 'pending' ? 'active' : ''}`}
              onClick={() => setUserManagementTab('pending')}
            >
              Pending Approval ({users.filter(u => u.status === 'pending').length})
            </button>
          </div>

          {userManagementTab === 'active' && (
            <div className="users-table-container">
              <div className="users-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr className="dashboard-header-row">
                      <th className="dashboard-th">Name</th>
                      <th className="dashboard-th">Email</th>
                      <th className="dashboard-th">Role</th>
                      <th className="dashboard-th">Department</th>
                      <th className="dashboard-th">Status</th>
                      <th className="dashboard-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.status === 'active').map(user => (
                      <tr key={user._id} className="dashboard-row">
                        <td className="dashboard-td">{user.name}</td>
                        <td className="dashboard-td">{user.email}</td>
                        <td className="dashboard-td">
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="dashboard-td">{user.department || 'N/A'}</td>
                        <td className="dashboard-td">
                          <span className={`status-badge ${user.status}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="dashboard-td">
                          <div className="action-buttons">
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </button>
                            <button 
                              className="action-btn reset-btn"
                              onClick={() => handleResetPassword(user)}
                            >
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {userManagementTab === 'pending' && (
            <div className="pending-users-container">
              <div className="pending-users-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr className="dashboard-header-row">
                      <th className="dashboard-th">Name</th>
                      <th className="dashboard-th">Email</th>
                      <th className="dashboard-th">Requested Role</th>
                      <th className="dashboard-th">Department</th>
                      <th className="dashboard-th">Registration Date</th>
                      <th className="dashboard-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.status === 'pending').map(user => (
                      <tr key={user._id} className="dashboard-row pending-row">
                        <td className="dashboard-td">{user.name}</td>
                        <td className="dashboard-td">{user.email}</td>
                        <td className="dashboard-td">
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="dashboard-td">{user.department || 'N/A'}</td>
                        <td className="dashboard-td">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="dashboard-td">
                          <div className="action-buttons">
                            <button 
                              className="action-btn approve-btn"
                              onClick={() => handleApproveUser(user)}
                            >
                              Approve
                            </button>
                            <button 
                              className="action-btn reject-btn"
                              onClick={() => handleRejectUser(user)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {mainTab === 'reports' && (
        <div className="dashboard-main-content">
          <h2 className="dashboard-section-title">Reports</h2>
          
          {/* Generate Report Form */}
          <div className="dashboard-form-card">
            <h3 className="form-title">Generate New Report</h3>
            <form className="dashboard-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Report Title</label>
                  <input type="text" className="form-input" placeholder="Enter report title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Report Type</label>
                  <select className="form-input">
                    <option value="">Select type</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="quarterly">Quarterly Report</option>
                    <option value="annual">Annual Report</option>
                    <option value="special">Special Report</option>
                    <option value="planning">Planning Report</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date Range</label>
                  <div className="date-range">
                    <input type="date" className="form-input" />
                    <span>to</span>
                    <input type="date" className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Format</label>
                  <select className="form-input">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="submit-btn">Generate Report</button>
            </form>
          </div>

          {/* Reports Table */}
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-th">Report Title</th>
                  <th className="dashboard-th">Type</th>
                  <th className="dashboard-th">Date</th>
                  <th className="dashboard-th">Status</th>
                  <th className="dashboard-th">Downloads</th>
                  <th className="dashboard-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td className="dashboard-td">{report.title}</td>
                    <td className="dashboard-td">{report.type}</td>
                    <td className="dashboard-td">{report.date}</td>
                    <td className="dashboard-td">
                      <span className={`status-badge ${report.status}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="dashboard-td">{report.downloads}</td>
                    <td className="dashboard-td">
                      <div className="action-buttons">
                        <button className="action-btn edit-btn">Download</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'transparency' && (
        <div className="dashboard-main-content">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Donation Transparency</h2>
        
          </div>
          <div className="transparency-summary">
            <div className="summary-card">
              <h3>Total Donations</h3>
              <p className="summary-amount">₱{donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>Total Expenses</h3>
              <p className="summary-amount">₱{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>Remaining Funds</h3>
              <p className="summary-amount">₱{(donations.reduce((sum, d) => sum + d.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}</p>
            </div>
          </div>
          <div className="transparency-details">
            <h3>Where Donations Went</h3>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-th">Category</th>
                  <th className="dashboard-th">Amount</th>
                  <th className="dashboard-th">Date</th>
                  <th className="dashboard-th">Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="dashboard-td">{expense.category}</td>
                    <td className="dashboard-td">₱{expense.amount.toLocaleString()}</td>
                    <td className="dashboard-td">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="dashboard-td">{expense.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="transparency-donations">
            <h3>Recent Donations</h3>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-th">Donor</th>
                  <th className="dashboard-th">Amount</th>
                  <th className="dashboard-th">Date</th>
                  <th className="dashboard-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.slice(0, 10).map((donation) => (
                  <tr key={donation._id}>
                    <td className="dashboard-td">{donation.donorName}</td>
                    <td className="dashboard-td">₱{donation.amount.toLocaleString()}</td>
                    <td className="dashboard-td">{new Date(donation.createdAt).toLocaleDateString()}</td>
                    <td className="dashboard-td">{donation.verificationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
