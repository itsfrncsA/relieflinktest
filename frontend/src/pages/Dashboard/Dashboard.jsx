import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
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
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [reports, setReports] = useState([]);
  const [dashboardOverview, setDashboardOverview] = useState(null);
  const authRedirectedRef = useRef(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const [inventoryName, setInventoryName] = useState('');
  const [inventoryDescription, setInventoryDescription] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('');
  const [inventoryQuantity, setInventoryQuantity] = useState('');
  const [inventoryUnit, setInventoryUnit] = useState('');
  const [inventoryLocation, setInventoryLocation] = useState('');
  const [inventoryMinimumStock, setInventoryMinimumStock] = useState('');

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('staff');
  const [editUserDepartment, setEditUserDepartment] = useState('');

  const [savedReports, setSavedReports] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [reportDateStart, setReportDateStart] = useState('');
  const [reportDateEnd, setReportDateEnd] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const getAuthToken = () => localStorage.getItem('token');

  const handleUnauthorized = useCallback(() => {
    if (authRedirectedRef.current) return;
    authRedirectedRef.current = true;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMessage('Your session has expired. Please log in again.');
    window.location.href = '/';
  }, []);

  const formatCurrency = (value = 0) =>
    `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getDonationStatus = (donation) => {
    if (donation.verificationStatus) return donation.verificationStatus;
    if (donation.status) return donation.status;
    if (donation.verified === true) return 'approved';
    if (donation.verified === false) return 'pending';
    return 'pending';
  };

  const fetchDonations = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonations(res.data);
    } catch (err) {
      console.error('Error fetching donations:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  const fetchUsers = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  const fetchExpenses = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to fetch expenses');
    }
  }, [handleUnauthorized]);

  const fetchInventory = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to fetch inventory');
    }
  }, [handleUnauthorized]);

  const fetchReports = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const [dashboardRes, savedRes] = await Promise.all([
        axios.get(`${API_URL}/reports/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/saved`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setDashboardOverview(dashboardRes.data?.overview || null);
      setSavedReports(savedRes.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to fetch reports');
    }
  }, [handleUnauthorized]);

  const generateReport = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    if (!reportTitle || !reportType) {
      setMessage('Please fill in Report Title and Report Type');
      return;
    }

    try {
      setGeneratingReport(true);
      await axios.post(`${API_URL}/reports/saved`, {
        title: reportTitle,
        type: reportType,
        format: reportFormat,
        dateRangeStart: reportDateStart || null,
        dateRangeEnd: reportDateEnd || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Report generated successfully!');
      setReportTitle('');
      setReportType('');
      setReportFormat('PDF');
      setReportDateStart('');
      setReportDateEnd('');
      fetchReports();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error generating report:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = async (reportId) => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/reports/saved/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const contentDisposition = res.headers['content-disposition'];
      let filename = 'report';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      fetchReports();
    } catch (err) {
      console.error('Error downloading report:', err);
      setMessage('Failed to download report');
    }
  };

  const addDonation = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

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
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const errorMsg = err.response?.data?.message || err.message || 'Error saving donation';
      setMessage('✗ ' + errorMsg);
    }
  };

  const viewDonation = (donation) => {
    setEditingId(donation._id);
    setDonorName(donation.donorName);
    setAmount(donation.amount.toString());
  };

  const approveDonation = async (donationId) => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      await axios.put(`${API_URL}/donations/${donationId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✓ Donation approved!');
      fetchDonations();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error approving donation:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const errorMsg = err.response?.data?.message || err.message || 'Error approving donation';
      setMessage('✗ ' + errorMsg);
    }
  };

  const rejectDonation = async (donationId) => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const reason = prompt('Rejection reason (optional):') || 'Payment not verified';
      await axios.put(
        `${API_URL}/donations/${donationId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✓ Donation rejected!');
      fetchDonations();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error rejecting donation:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const errorMsg = err.response?.data?.message || err.message || 'Error rejecting donation';
      setMessage('✗ ' + errorMsg);
    }
  };

  const filteredDonations = donationFilter === 'all' 
    ? donations 
    : donationFilter === 'pending' 
    ? donations.filter(d => getDonationStatus(d) === 'pending')
    : donationFilter === 'verified'
    ? donations.filter(d => getDonationStatus(d) === 'approved')
    : donations;

  const donationStatusData = useMemo(() => {
    const approved = donations.filter(d => getDonationStatus(d) === 'approved').length;
    const pending = donations.filter(d => getDonationStatus(d) === 'pending').length;
    const rejected = donations.filter(d => getDonationStatus(d) === 'rejected').length;
    return [
      { name: 'Approved', value: approved, color: '#16a34a' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Rejected', value: rejected, color: '#dc2626' }
    ];
  }, [donations]);

  const monthlyDonationTrend = useMemo(() => {
    const monthlyMap = new Map();
    donations.forEach((donation) => {
      const date = new Date(donation.createdAt || donation.date || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + (donation.amount || 0));
    });

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => ({
        month: new Date(`${key}-01`).toLocaleString('default', { month: 'short' }),
        amount: value
      }));
  }, [donations]);

  const expenseByCategory = useMemo(() => {
    const categoryMap = {};
    expenses.forEach((expense) => {
      const category = expense.category || 'other';
      categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
    });

    return Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }));
  }, [expenses]);

  const deleteDonation = async (id) => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

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
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
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
    setEditingUser(user);
    setEditUserName(user?.name || '');
    setEditUserEmail(user?.email || '');
    setEditUserRole(user?.role || 'staff');
    setEditUserDepartment(user?.department || '');
    setShowEditUserModal(true);
  };

  const saveUserEdits = async () => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    if (!editingUser?._id) return;
    if (!editUserName || !editUserEmail) {
      setMessage('Please fill in name and email');
      return;
    }

    try {
      const res = await axios.put(
        `${API_URL}/users/${editingUser._id}`,
        {
          name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          department: editUserDepartment || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data;
      setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
      setMessage('✓ User updated successfully');
      setShowEditUserModal(false);
      setEditingUser(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating user:', err.response || err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update user';
      setMessage('✗ ' + errorMsg);
    }
  };

  const handleResetPassword = async (user) => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

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
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to reset password');
    }
  };

  const handleApproveUser = async (user) => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
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
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to approve user');
    }
  };

  const handleRejectUser = async (user) => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

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
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to reject user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const addExpense = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    if (!expenseCategory || !expenseAmount || !expenseDescription) {
      setMessage('Please fill in category, amount, and description');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/expenses`,
        {
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          description: expenseDescription
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage('✓ Expense added successfully!');
      setExpenseCategory('');
      setExpenseAmount('');
      setExpenseDescription('');
      fetchExpenses();
      fetchReports();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding expense:', err.response || err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const errorMsg = err.response?.data?.message || err.message || 'Error adding expense';
      setMessage('✗ ' + errorMsg);
    }
  };

  const addInventoryItem = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    if (
      !inventoryName ||
      !inventoryDescription ||
      !inventoryCategory ||
      !inventoryQuantity ||
      !inventoryUnit ||
      !inventoryLocation ||
      !inventoryMinimumStock
    ) {
      setMessage('Please fill in all required inventory fields');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/inventory`,
        {
          name: inventoryName,
          description: inventoryDescription,
          category: inventoryCategory,
          quantity: parseInt(inventoryQuantity, 10),
          unit: inventoryUnit,
          location: inventoryLocation,
          minimumStock: parseInt(inventoryMinimumStock, 10)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage('✓ Inventory item added successfully!');
      setInventoryName('');
      setInventoryDescription('');
      setInventoryCategory('');
      setInventoryQuantity('');
      setInventoryUnit('');
      setInventoryLocation('');
      setInventoryMinimumStock('');
      fetchInventory();
      fetchReports();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding inventory item:', err.response || err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const errorMsg = err.response?.data?.message || err.message || 'Error adding inventory item';
      setMessage('✗ ' + errorMsg);
    }
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

    if (!getAuthToken()) {
      handleUnauthorized();
      return;
    }
    fetchDonations();
    fetchUsers();
    fetchExpenses();
    fetchInventory();
    fetchReports();
  }, [fetchDonations, fetchUsers, fetchExpenses, fetchInventory, fetchReports, handleUnauthorized]);

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
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-label">Total Donations</div>
              <div className="dashboard-stat-value">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0))}</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-label">Verified Donations</div>
              <div className="dashboard-stat-value">{donations.filter(d => getDonationStatus(d) === 'approved').length}</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-label">Pending Donations</div>
              <div className="dashboard-stat-value">{donations.filter(d => getDonationStatus(d) === 'pending').length}</div>
            </div>
          </div>

          <div className="dashboard-charts-grid">
            <div className="dashboard-chart-card">
              <h3 className="dashboard-chart-title">Donation Trend (Last 6 Months)</h3>
              <div className="dashboard-chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyDonationTrend}>
                    <defs>
                      <linearGradient id="donationTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b83a3a" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#b83a3a" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#b83a3a"
                      fillOpacity={1}
                      fill="url(#donationTrendFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-chart-card">
              <h3 className="dashboard-chart-title">Donation Verification Status</h3>
              <div className="dashboard-chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={donationStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {donationStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
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
                Pending ({donations.filter(d => getDonationStatus(d) === 'pending').length})
              </button>
              <button 
                className={`dashboard-tab ${donationFilter === 'verified' ? 'dashboard-tab-active' : ''}`}
                onClick={() => setDonationFilter('verified')}
              >
                Verified ({donations.filter(d => getDonationStatus(d) === 'approved').length})
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
                      <th className="dashboard-th">Payment</th>
                      <th className="dashboard-th">Destination</th>
                      <th className="dashboard-th">Status</th>
                      <th className="dashboard-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map(d => (
                      <tr key={d._id} className="dashboard-row">
                        <td className="dashboard-td">{d.donorName}</td>
                        <td className="dashboard-td"><strong>₱{d.amount.toFixed(2)}</strong></td>
                        <td className="dashboard-td">{d.paymentMethod || 'Cash'}</td>
                        <td className="dashboard-td">{d.destination || 'General Fund'}</td>
                        <td className="dashboard-td">
                          <div className="dashboard-status-column">
                            <span className={`dashboard-badge ${getDonationStatus(d) === 'approved' ? 'dashboard-badge-verified' : getDonationStatus(d) === 'pending' ? 'dashboard-badge-pending' : 'dashboard-badge-rejected'}`}>
                              {getDonationStatus(d) === 'approved' ? '✓ Verified' : getDonationStatus(d) === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                            </span>
                          </div>
                        </td>
                        <td className="dashboard-td">
                          <div className="dashboard-action-buttons">
                            {getDonationStatus(d) === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveDonation(d._id)}
                                  className="action-btn approve-btn"
                                  title="Approve donation"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectDonation(d._id)}
                                  className="action-btn reject-btn"
                                  title="Reject donation"
                                >
                                  Reject
                                </button>
                              </>
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other tabs content */}
      {mainTab === 'expenses' && (
        <div className="dashboard-main-content">
          <h2 className="dashboard-section-title">Expense Management</h2>

          <div className="dashboard-chart-card dashboard-chart-card-inline">
            <h3 className="dashboard-chart-title">Expense Allocation by Category</h3>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={expenseByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Add Expense Form */}
          <div className="dashboard-form-card">
            <h3 className="form-title">Add New Expense</h3>
            <form className="dashboard-form" onSubmit={addExpense}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
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
                  <input type="number" className="form-input" placeholder="0.00" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} step="0.01" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Enter expense description" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)}></textarea>
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
                    <td className="dashboard-td">{formatCurrency(expense.amount)}</td>
                    <td className="dashboard-td">{expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="dashboard-td">
                      <span className={`status-badge ${expense.status}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="dashboard-td">
                      <div className="action-buttons">
                        <button type="button" className="action-btn edit-btn" onClick={() => setSelectedExpense(expense)}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedExpense && (
            <div className="dashboard-modal-overlay">
              <div className="dashboard-modal">
                <div className="dashboard-modal-header">
                  <h3 className="dashboard-modal-title">Expense</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedExpense(null)}
                    className="dashboard-close-btn"
                  >
                    ✕
                  </button>
                </div>
                <div className="dashboard-modal-content">
                  <p className="dashboard-modal-text"><strong>Category:</strong> {selectedExpense.category}</p>
                  <p className="dashboard-modal-text"><strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}</p>
                  <p className="dashboard-modal-text"><strong>Status:</strong> {selectedExpense.status}</p>
                  {selectedExpense.date && (
                    <p className="dashboard-modal-text"><strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString()}</p>
                  )}
                  {selectedExpense.description && (
                    <p className="dashboard-modal-text"><strong>Description:</strong> {selectedExpense.description}</p>
                  )}
                  <div className="dashboard-modal-buttons">
                    <button type="button" className="dashboard-cancel-btn" onClick={() => setSelectedExpense(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {mainTab === 'inventory' && (
        <div className="dashboard-main-content">
          <h2 className="dashboard-section-title">Inventory Management</h2>
          
          {/* Add Inventory Form */}
          <div className="dashboard-form-card">
            <h3 className="form-title">Add New Item</h3>
            <form className="dashboard-form" onSubmit={addInventoryItem}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input type="text" className="form-input" placeholder="Enter item name" value={inventoryName} onChange={(e) => setInventoryName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" placeholder="0" value={inventoryQuantity} onChange={(e) => setInventoryQuantity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-input" value={inventoryUnit} onChange={(e) => setInventoryUnit(e.target.value)}>
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
                  <label className="form-label">Category</label>
                  <select className="form-input" value={inventoryCategory} onChange={(e) => setInventoryCategory(e.target.value)}>
                    <option value="">Select category</option>
                    <option value="relief-goods">Relief Goods</option>
                    <option value="medical-supplies">Medical Supplies</option>
                    <option value="hygiene-kits">Hygiene Kits</option>
                    <option value="shelter-materials">Shelter Materials</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Stock</label>
                  <input type="number" className="form-input" placeholder="0" value={inventoryMinimumStock} onChange={(e) => setInventoryMinimumStock(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Enter item description" value={inventoryDescription} onChange={(e) => setInventoryDescription(e.target.value)}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <select className="form-input" value={inventoryLocation} onChange={(e) => setInventoryLocation(e.target.value)}>
                    <option value="">Select location</option>
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Warehouse B">Warehouse B</option>
                    <option value="Warehouse C">Warehouse C</option>
                    <option value="Medical Center">Medical Center</option>
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
                    <td className="dashboard-td">{item.name}</td>
                    <td className="dashboard-td">{item.quantity}</td>
                    <td className="dashboard-td">{item.unit}</td>
                    <td className="dashboard-td">{item.location}</td>
                    <td className="dashboard-td">
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="dashboard-td">{item.receivedDate ? new Date(item.receivedDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="dashboard-td">
                      <div className="action-buttons">
                        <button type="button" className="action-btn edit-btn" onClick={() => setSelectedInventoryItem(item)}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedInventoryItem && (
            <div className="dashboard-modal-overlay">
              <div className="dashboard-modal">
                <div className="dashboard-modal-header">
                  <h3 className="dashboard-modal-title">Inventory Item</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedInventoryItem(null)}
                    className="dashboard-close-btn"
                  >
                    ✕
                  </button>
                </div>
                <div className="dashboard-modal-content">
                  <p className="dashboard-modal-text"><strong>Name:</strong> {selectedInventoryItem.name}</p>
                  <p className="dashboard-modal-text"><strong>Quantity:</strong> {selectedInventoryItem.quantity} {selectedInventoryItem.unit}</p>
                  <p className="dashboard-modal-text"><strong>Location:</strong> {selectedInventoryItem.location}</p>
                  <p className="dashboard-modal-text"><strong>Status:</strong> {selectedInventoryItem.status}</p>
                  {selectedInventoryItem.description && (
                    <p className="dashboard-modal-text"><strong>Description:</strong> {selectedInventoryItem.description}</p>
                  )}
                  <div className="dashboard-modal-buttons">
                    <button type="button" className="dashboard-cancel-btn" onClick={() => setSelectedInventoryItem(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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

          {showEditUserModal && editingUser && (
            <div className="dashboard-modal-overlay">
              <div className="dashboard-modal">
                <div className="dashboard-modal-header">
                  <h3 className="dashboard-modal-title">Edit User</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setEditingUser(null);
                    }}
                    className="dashboard-close-btn"
                  >
                    ✕
                  </button>
                </div>
                <div className="dashboard-modal-content">
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Name</label>
                    <input className="dashboard-input" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
                  </div>
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Email</label>
                    <input className="dashboard-input" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} />
                  </div>
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Role</label>
                    <select className="dashboard-select" value={editUserRole} onChange={(e) => setEditUserRole(e.target.value)}>
                      <option value="admin">admin</option>
                      <option value="staff">staff</option>
                      <option value="volunteer">volunteer</option>
                    </select>
                  </div>
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Department</label>
                    <input className="dashboard-input" value={editUserDepartment} onChange={(e) => setEditUserDepartment(e.target.value)} />
                  </div>
                  <div className="dashboard-modal-buttons">
                    <button type="button" className="dashboard-verify-btn" onClick={saveUserEdits}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="dashboard-cancel-btn"
                      onClick={() => {
                        setShowEditUserModal(false);
                        setEditingUser(null);
                      }}
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

      {mainTab === 'reports' && (
        <div className="dashboard-main-content">
          <h2 className="dashboard-section-title">Reports</h2>

          <div className="dashboard-form-card">
            <h3 className="form-title">Generate New Report</h3>
            <form onSubmit={generateReport} className="dashboard-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Report Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter report title"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Report Type</label>
                  <select
                    className="form-input"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="Donations Report">Donations Report</option>
                    <option value="Expenses Report">Expenses Report</option>
                    <option value="Inventory Report">Inventory Report</option>
                    <option value="Monthly Report">Monthly Report</option>
                    <option value="Quarterly Report">Quarterly Report</option>
                    <option value="Annual Report">Annual Report</option>
                    <option value="Special Report">Special Report</option>
                    <option value="Custom Report">Custom Report</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date Range</label>
                  <div className="date-range">
                    <input
                      type="date"
                      className="form-input"
                      value={reportDateStart}
                      onChange={(e) => setReportDateStart(e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      className="form-input"
                      value={reportDateEnd}
                      onChange={(e) => setReportDateEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Format</label>
                  <select
                    className="form-input"
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value)}
                  >
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="submit-btn report-generate-btn"
                disabled={generatingReport}
              >
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>

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
                {savedReports.length === 0 ? (
                  <tr>
                    <td className="dashboard-td" colSpan="6" style={{ textAlign: 'center', color: '#7d7d8f' }}>
                      No reports generated yet. Create your first report above.
                    </td>
                  </tr>
                ) : (
                  savedReports.map((report) => (
                    <tr key={report._id}>
                      <td className="dashboard-td">{report.title}</td>
                      <td className="dashboard-td">{report.type}</td>
                      <td className="dashboard-td">{new Date(report.createdAt).toLocaleDateString('en-CA')}</td>
                      <td className="dashboard-td">
                        <span className={`report-status-badge ${report.status === 'COMPLETED' ? 'completed' : report.status === 'DRAFT' ? 'draft' : 'generating'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="dashboard-td">{report.downloads}</td>
                      <td className="dashboard-td">
                        <button
                          className="report-download-btn"
                          onClick={() => downloadReport(report._id)}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'transparency' && (
        <div className="dashboard-main-content">
          <div className="transparency-hero">
            <div className="transparency-hero-content">
              <h2 className="transparency-hero-title">Donation Transparency</h2>
              <p className="transparency-hero-subtitle">Full visibility into how every peso is received and spent</p>
            </div>
          </div>

          <div className="transparency-stats-grid">
            <div className="transparency-stat-card donations-card">
              <div className="transparency-stat-icon">&#9829;</div>
              <div className="transparency-stat-info">
                <span className="transparency-stat-label">Total Donations</span>
                <span className="transparency-stat-value">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0))}</span>
                <span className="transparency-stat-count">{donations.length} donations received</span>
              </div>
            </div>
            <div className="transparency-stat-card expenses-card">
              <div className="transparency-stat-icon">&#9733;</div>
              <div className="transparency-stat-info">
                <span className="transparency-stat-label">Total Expenses</span>
                <span className="transparency-stat-value">{formatCurrency(expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</span>
                <span className="transparency-stat-count">{expenses.length} expenses recorded</span>
              </div>
            </div>
            <div className="transparency-stat-card remaining-card">
              <div className="transparency-stat-icon">&#9670;</div>
              <div className="transparency-stat-info">
                <span className="transparency-stat-label">Remaining Funds</span>
                <span className="transparency-stat-value">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</span>
                <span className="transparency-stat-count">Available for relief operations</span>
              </div>
            </div>
          </div>

          {donations.length > 0 && expenses.length > 0 && (
            <div className="transparency-progress-section">
              <h3 className="transparency-section-title">Fund Utilization</h3>
              <div className="transparency-progress-bar-container">
                <div
                  className="transparency-progress-bar"
                  style={{
                    width: `${Math.min(100, (expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / Math.max(1, donations.reduce((sum, d) => sum + (d.amount || 0), 0))) * 100)}%`
                  }}
                />
              </div>
              <div className="transparency-progress-labels">
                <span>
                  {((expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / Math.max(1, donations.reduce((sum, d) => sum + (d.amount || 0), 0))) * 100).toFixed(1)}% utilized
                </span>
                <span>
                  {(100 - (expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / Math.max(1, donations.reduce((sum, d) => sum + (d.amount || 0), 0))) * 100).toFixed(1)}% remaining
                </span>
              </div>
            </div>
          )}

          <div className="transparency-table-section">
            <div className="transparency-section-header">
              <h3 className="transparency-section-title">Where Donations Went</h3>
              <span className="transparency-record-count">{expenses.length} records</span>
            </div>
            <div className="dashboard-table-container">
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
                  {expenses.length === 0 ? (
                    <tr>
                      <td className="dashboard-td" colSpan="4" style={{ textAlign: 'center', color: '#7d7d8f' }}>
                        No expense records yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td className="dashboard-td">
                          <span className="transparency-category-badge">{expense.category}</span>
                        </td>
                        <td className="dashboard-td" style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(expense.amount)}</td>
                        <td className="dashboard-td">{new Date(expense.date).toLocaleDateString()}</td>
                        <td className="dashboard-td">{expense.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="transparency-table-section">
            <div className="transparency-section-header">
              <h3 className="transparency-section-title">Recent Donations</h3>
              <span className="transparency-record-count">{Math.min(donations.length, 10)} of {donations.length}</span>
            </div>
            <div className="dashboard-table-container">
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
                  {donations.length === 0 ? (
                    <tr>
                      <td className="dashboard-td" colSpan="4" style={{ textAlign: 'center', color: '#7d7d8f' }}>
                        No donations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    donations.slice(0, 10).map((donation) => (
                      <tr key={donation._id}>
                        <td className="dashboard-td" style={{ fontWeight: 600 }}>{donation.donorName}</td>
                        <td className="dashboard-td" style={{ fontWeight: 600, color: '#16a34a' }}>{formatCurrency(donation.amount)}</td>
                        <td className="dashboard-td">{new Date(donation.createdAt).toLocaleDateString()}</td>
                        <td className="dashboard-td">
                          <span className={`status-badge ${getDonationStatus(donation) === 'approved' ? 'active' : getDonationStatus(donation) === 'pending' ? 'pending' : 'inactive'}`}>
                            {getDonationStatus(donation)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
