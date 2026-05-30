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

  // Report form states
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('donations');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [generatingReport, setGeneratingReport] = useState(false);

  // New visual & functional enhancements states
  const [showDrilldownModal, setShowDrilldownModal] = useState(false);
  const [reportSearchText, setReportSearchText] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [reportDateFilter, setReportDateFilter] = useState('all');
  const [reportDownloads, setReportDownloads] = useState({});

  const exportToCSV = (type) => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (type === 'donations') {
      headers = ['Donor Name', 'Amount (PHP)', 'Payment Method', 'Destination', 'Status', 'Date'];
      rows = donations.map(d => [
        d.donorName,
        d.amount,
        d.paymentMethod || 'Cash',
        d.destination || 'General Fund',
        getDonationStatus(d),
        new Date(d.createdAt || d.date || Date.now()).toLocaleDateString()
      ]);
      filename = 'donations_report.csv';
    } else if (type === 'expenses') {
      headers = ['Category', 'Amount (PHP)', 'Description', 'Status', 'Date'];
      rows = expenses.map(e => [
        e.category,
        e.amount,
        e.description,
        e.status || 'pending',
        new Date(e.date || Date.now()).toLocaleDateString()
      ]);
      filename = 'expenses_report.csv';
    } else {
      setMessage('Invalid export type. Only donations and expenses can be exported as CSV.');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage(`✓ Exported ${type} to CSV successfully!`);
    setTimeout(() => setMessage(''), 3000);
  };

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
      const [dashboardRes, donationsRes, expensesRes, inventoryRes, savedRes] = await Promise.all([
        axios.get(`${API_URL}/reports/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/donations`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/inventory`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/saved/all`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);

      setDashboardOverview(dashboardRes.data?.overview || null);

      const liveReports = [
        {
          _id: 'donations',
          title: 'Donations Overview',
          type: 'Live',
          date: new Date().toISOString(),
          status: 'updated',
          total: donationsRes.data?.summary?.totalAmount || 0,
          count: donationsRes.data?.summary?.totalDonations || 0
        },
        {
          _id: 'expenses',
          title: 'Expenses Overview',
          type: 'Live',
          date: new Date().toISOString(),
          status: 'updated',
          total: expensesRes.data?.summary?.totalAmount || 0,
          count: expensesRes.data?.summary?.totalExpenses || 0
        },
        {
          _id: 'inventory',
          title: 'Inventory Overview',
          type: 'Live',
          date: new Date().toISOString(),
          status: 'updated',
          total: inventoryRes.data?.summary?.totalQuantity || 0,
          count: inventoryRes.data?.summary?.totalItems || 0
        }
      ];

      const savedReports = Array.isArray(savedRes.data) ? savedRes.data : [];
      setReports([...liveReports, ...savedReports]);
    } catch (err) {
      console.error('Error fetching reports:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to fetch reports');
    }
  }, [handleUnauthorized]);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      setMessage('Please log in first');
      return;
    }

    if (!reportTitle.trim()) {
      setMessage('Please enter a report title');
      return;
    }

    try {
      setGeneratingReport(true);
      const reportData = {
        title: reportTitle,
        type: reportType,
        startDate: reportStartDate ? new Date(reportStartDate).toISOString() : undefined,
        endDate: reportEndDate ? new Date(reportEndDate).toISOString() : undefined,
        format: reportFormat
      };

      const response = await axios.post(
        `${API_URL}/reports`,
        reportData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Report generated successfully!');
      setReportTitle('');
      setReportStartDate('');
      setReportEndDate('');
      setReportFormat('pdf');

      // Refresh reports list
      fetchReports();
    } catch (err) {
      console.error('Error generating report:', err);
      setMessage(err.response?.data?.message || 'Error generating report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = async (reportId) => {
    const token = getAuthToken();
    if (!token) {
      setMessage('Please log in first');
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/reports/${reportId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Increment dynamic downloads tracker in state
      setReportDownloads(prev => ({
        ...prev,
        [reportId]: (prev[reportId] || 0) + 1
      }));

      // Create a mock download (in real app, this would be a file download)
      setMessage(`Report "${response.data.title}" downloaded successfully!`);
    } catch (err) {
      console.error('Error downloading report:', err);
      setMessage('Error downloading report');
    }
  };

  const handleDeleteReport = async (reportId) => {
    const token = getAuthToken();
    if (!token) {
      setMessage('Please log in first');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/reports/${reportId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Report deleted successfully');
      fetchReports();
    } catch (err) {
      console.error('Error deleting report:', err);
      setMessage('Error deleting report');
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

          {/* Sticky Quick Stats Bar */}
          <div className="quick-stats-bar">
            <span><span className="quick-stats-indicator"></span>LIVE KPI OVERVIEW:</span>
            <span className="quick-stats-divider">|</span>
            <span>Total Donations: <span className="quick-stats-value quick-stats-val-donations">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0))}</span></span>
            <span className="quick-stats-divider">|</span>
            <span>Total Expenses: <span className="quick-stats-value quick-stats-val-expenses">{formatCurrency(expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</span></span>
            <span className="quick-stats-divider">|</span>
            <span>Net Funds: <span className="quick-stats-value quick-stats-val-net" style={{ color: (donations.reduce((sum, d) => sum + (d.amount || 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0)) >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</span></span>
            <span className="quick-stats-divider">|</span>
            <span>Active Users: <span className="quick-stats-value">{users.filter(u => u.status === 'active').length}</span></span>
          </div>

          {mainTab === 'donations' && (
            <div className="dashboard-main-content">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Donations</h2>

              </div>
              <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card summary-card-donations">
                  <div className="stat-icon"></div>
                  <div className="dashboard-stat-label">Total Donations</div>
                  <div className="dashboard-stat-value">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0))}</div>
                </div>
                <div
                  className="dashboard-stat-card summary-card-expenses"
                  onClick={() => setShowDrilldownModal(true)}
                  title="Click to view expense category breakdown"
                >
                  <div className="stat-icon"></div>
                  <div className="dashboard-stat-label">Total Expenses</div>
                  <div className="dashboard-stat-value">{formatCurrency(expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</div>
                </div>
                <div className="dashboard-stat-card summary-card-netfunds">
                  <div className="stat-icon"></div>
                  <div className="dashboard-stat-label">Net Funds</div>
                  <div className="dashboard-stat-value">
                    {formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}
                  </div>
                </div>
                <div className="dashboard-stat-card summary-card-users">
                  <div className="stat-icon"></div>
                  <div className="dashboard-stat-label">Active Users</div>
                  <div className="dashboard-stat-value">{users.filter(u => u.status === 'active').length}</div>
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
                  <h3 className="dashboard-chart-title">Expense Allocation by Category</h3>
                  <div className="dashboard-chart-wrap">
                    {expenses.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={Object.entries(
                              expenses.reduce((acc, e) => {
                                acc[e.category] = (acc[e.category] || 0) + e.amount;
                                return acc;
                              }, {})
                            ).map(([name, value]) => ({ name, value }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={85}
                            fill="#667eea"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#6366f1" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ec4899" />
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="dashboard-empty-state">No expense records available yet.</p>
                    )}
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
                                  <img src="/assets/view.png" alt="View" style={{ width: '16px', height: '16px' }} />
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
              <h2 className="dashboard-section-title"> Report Manager</h2>

              {/* Generate New Report Form */}
              <div className="reports-form-section">
                <h3>Generate New Report</h3>
                <form className="reports-form" onSubmit={handleGenerateReport}>
                  <div className="reports-form-row">
                    <div className="form-group">
                      <label>Report Title *</label>
                      <input
                        type="text"
                        placeholder="e.g., January 2024 Relief Operations"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Report Type *</label>
                      <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        <option value="donations">Donations Report</option>
                        <option value="expenses">Expenses Report</option>
                        <option value="inventory">Inventory Report</option>
                        <option value="financial-summary">Financial Summary</option>
                      </select>
                    </div>
                  </div>

                  <div className="reports-form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Format</label>
                      <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)}>
                        <option value="pdf">PDF</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-generate-report"
                    disabled={generatingReport}
                  >
                    {generatingReport ? '⏳ Generating...' : '✨ Generate Report'}
                  </button>
                </form>
              </div>

              {/* Dashboard Statistics */}
              <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card summary-card-donations">
                  <div className="stat-icon"></div>
                  <div className="dashboard-stat-label">Total Donations</div>
                  <div className="dashboard-stat-value">{formatCurrency(dashboardOverview?.totalDonations || 0)}</div>
                </div>
                <div
                  className="dashboard-stat-card summary-card-expenses"
                  onClick={() => setShowDrilldownModal(true)}
                  title="Click to view expense category breakdown"
                >
                  <div className="stat-icon"></div>
                  <div className="dashboard-stat-label">Total Expenses</div>
                  <div className="dashboard-stat-value">{formatCurrency(dashboardOverview?.totalExpenses || 0)}</div>
                </div>
                <div className="dashboard-stat-card summary-card-netfunds">
                  <div className="stat-icon"></div>
                  <div className="dashboard-stat-label">Net Funds</div>
                  <div className="dashboard-stat-value" style={{ color: 'white' }}>
                    {formatCurrency(dashboardOverview?.netAmount || 0)}
                  </div>
                </div>
                <div className="dashboard-stat-card summary-card-users">
                  <div className="stat-icon"></div>
                  <div className="dashboard-stat-label">Active Users</div>
                  <div className="dashboard-stat-value">{dashboardOverview?.activeUsers || 0}</div>
                </div>
              </div>

              {/* Saved Reports Table */}
              <div className="reports-section">
                <h3>Saved Reports</h3>

                {/* Live Search & Filter Bar */}
                <div className="reports-filter-bar">
                  <input
                    type="text"
                    placeholder="🔍 Search reports by title..."
                    value={reportSearchText}
                    onChange={(e) => setReportSearchText(e.target.value)}
                    className="filter-search-input"
                  />
                  <select
                    value={reportTypeFilter}
                    onChange={(e) => setReportTypeFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    <option value="donations">Donations Reports</option>
                    <option value="expenses">Expenses Reports</option>
                    <option value="inventory">Inventory Reports</option>
                    <option value="financial-summary">Financial Summary</option>
                    <option value="Live">Live / Default</option>
                  </select>
                  <select
                    value={reportDateFilter}
                    onChange={(e) => setReportDateFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Generated Today</option>
                    <option value="week">Past 7 Days</option>
                    <option value="month">Past 30 Days</option>
                  </select>
                </div>

                <div className="dashboard-table-container">
                  {(() => {
                    const filteredReports = (reports || []).filter(report => {
                      const matchesSearch = report.title?.toLowerCase().includes(reportSearchText.toLowerCase());
                      const matchesType = reportTypeFilter === 'all' ||
                        (reportTypeFilter === 'Live' ? (!report.type || report.type === 'Live') : report.type === reportTypeFilter);

                      let matchesDate = true;
                      if (reportDateFilter !== 'all') {
                        const reportDate = new Date(report.date || report.createdAt);
                        const now = new Date();
                        if (reportDateFilter === 'today') {
                          matchesDate = reportDate.toDateString() === now.toDateString();
                        } else if (reportDateFilter === 'week') {
                          const diffDays = Math.ceil(Math.abs(now - reportDate) / (1000 * 60 * 60 * 24));
                          matchesDate = diffDays <= 7;
                        } else if (reportDateFilter === 'month') {
                          const diffDays = Math.ceil(Math.abs(now - reportDate) / (1000 * 60 * 60 * 24));
                          matchesDate = diffDays <= 30;
                        }
                      }
                      return matchesSearch && matchesType && matchesDate;
                    });

                    return filteredReports.length > 0 ? (
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th className="dashboard-th">Report Title</th>
                            <th className="dashboard-th">Type</th>
                            <th className="dashboard-th">Format</th>
                            <th className="dashboard-th">Date</th>
                            <th className="dashboard-th">Downloads</th>
                            <th className="dashboard-th">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports.map((report) => (
                            <tr key={report._id} className="report-row">
                              <td className="dashboard-td"><strong>{report.title}</strong></td>
                              <td className="dashboard-td">
                                <span className="report-type-badge">{report.type || 'Live'}</span>
                              </td>
                              <td className="dashboard-td">{report.format || 'N/A'}</td>
                              <td className="dashboard-td">{new Date(report.date || report.createdAt).toLocaleDateString()}</td>
                              <td className="dashboard-td">
                                <span className="download-count-badge">
                                  📥 {reportDownloads[report._id] || report.downloadCount || 0}
                                </span>
                              </td>
                              <td className="dashboard-td">
                                <div className="action-buttons">
                                  <button
                                    className="btn-action btn-download"
                                    onClick={() => handleDownloadReport(report._id)}
                                    title="Download Report"
                                  >
                                    ⬇️
                                  </button>
                                  <button
                                    className="export-btn"
                                    onClick={() => exportToCSV(report.type === 'expenses' || report._id === 'expenses' ? 'expenses' : 'donations')}
                                    title="Export Report to CSV Excel"
                                  >
                                    📄 Export CSV
                                  </button>
                                  {report._id !== 'donations' && report._id !== 'expenses' && report._id !== 'inventory' && (
                                    <button
                                      className="btn-action btn-delete"
                                      onClick={() => handleDeleteReport(report._id)}
                                      title="Delete Report"
                                    >
                                      🗑️
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-data-message">No matching reports found.</p>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {mainTab === 'transparency' && (
            <div className="dashboard-main-content">
              <div className="transparency-header">
                <h2 className="dashboard-section-title"> Transparency & Accountability</h2>
                <p className="transparency-subtitle">Track how donations are used and manage funds responsibly</p>
              </div>

              {/* Key Metrics */}
              <div className="transparency-metrics">
                <div className="metric-card metric-primary">
                  <div className="metric-icon"></div>
                  <div className="metric-content">
                    <h3>Total Donations Received</h3>
                    <p className="metric-value">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0))}</p>
                    <p className="metric-subtitle">{donations.length} donations</p>
                  </div>
                </div>

                <div className="metric-card metric-warning">
                  <div className="metric-icon"></div>
                  <div className="metric-content">
                    <h3>Total Expenses Used</h3>
                    <p className="metric-value">{formatCurrency(expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</p>
                    <p className="metric-subtitle">{expenses.length} expenses</p>
                  </div>
                </div>

                <div className="metric-card metric-success">
                  <div className="metric-icon"></div>
                  <div className="metric-content">
                    <h3>Remaining Funds</h3>
                    <p className="metric-value">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</p>
                    <p className="metric-subtitle">Available for relief</p>
                  </div>
                </div>

                <div className="metric-card metric-info">
                  <div className="metric-icon"></div>
                  <div className="metric-content">
                    <h3>Fund Utilization</h3>
                    <p className="metric-value">
                      {donations.length > 0
                        ? Math.round((expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / donations.reduce((sum, d) => sum + (d.amount || 0), 0)) * 100)
                        : 0}%
                    </p>
                    <p className="metric-subtitle">Of funds utilized</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="transparency-charts">
                {/* Donation Distribution Chart */}
                <div className="chart-container">
                  <h3>Expense Breakdown by Category</h3>
                  {expenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            expenses.reduce((acc, e) => {
                              acc[e.category] = (acc[e.category] || 0) + e.amount;
                              return acc;
                            }, {})
                          ).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ₱${value.toLocaleString()}`}
                          outerRadius={100}
                          fill="#667eea"
                          dataKey="value"
                        >
                          <Cell fill="#667eea" />
                          <Cell fill="#764ba2" />
                          <Cell fill="#f093fb" />
                          <Cell fill="#4facfe" />
                          <Cell fill="#00f2fe" />
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="no-data-message">No expense data available</p>
                  )}
                </div>

                {/* Donations Trend */}
                <div className="chart-container">
                  <h3>Fund Flow Overview</h3>
                  <div className="fund-flow">
                    <div className="fund-flow-item">
                      <span className="flow-arrow">→</span>
                      <div>
                        <p className="flow-label">Total Inflow</p>
                        <p className="flow-amount">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0))}</p>
                      </div>
                    </div>
                    <div className="fund-flow-divider"></div>
                    <div className="fund-flow-item">
                      <span className="flow-arrow">→</span>
                      <div>
                        <p className="flow-label">Total Outflow</p>
                        <p className="flow-amount">{formatCurrency(expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</p>
                      </div>
                    </div>
                    <div className="fund-flow-divider"></div>
                    <div className="fund-flow-item">
                      <span className="flow-arrow">→</span>
                      <div>
                        <p className="flow-label">Balance</p>
                        <p className="flow-amount" style={{ color: '#10b981' }}>
                          {formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Tables */}
              <div className="transparency-sections">
                {/* Where Donations Went */}
                <div className="transparency-details">
                  <h3> Expense Details - Where Donations Went</h3>
                  {expenses.length > 0 ? (
                    <div className="dashboard-table-container">
                      <table className="dashboard-table transparency-table">
                        <thead>
                          <tr>
                            <th className="dashboard-th">Category</th>
                            <th className="dashboard-th">Amount</th>
                            <th className="dashboard-th">Date</th>
                            <th className="dashboard-th">Description</th>
                            <th className="dashboard-th">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.slice(0, 15).map((expense) => (
                            <tr key={expense._id} className="expense-row">
                              <td className="dashboard-td"><strong>{expense.category}</strong></td>
                              <td className="dashboard-td amount">{formatCurrency(expense.amount)}</td>
                              <td className="dashboard-td">{new Date(expense.date).toLocaleDateString()}</td>
                              <td className="dashboard-td">{expense.description}</td>
                              <td className="dashboard-td">
                                <span className={`status-badge ${expense.status || 'pending'}`}>
                                  {(expense.status || 'pending').charAt(0).toUpperCase() + (expense.status || 'pending').slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="no-data-message">No expense records found</p>
                  )}
                </div>

                {/* Recent Donations */}
                <div className="transparency-donations">
                  <h3>🎁 Recent Donations Received</h3>
                  {donations.length > 0 ? (
                    <div className="dashboard-table-container">
                      <table className="dashboard-table transparency-table">
                        <thead>
                          <tr>
                            <th className="dashboard-th">Donor Name</th>
                            <th className="dashboard-th">Amount</th>
                            <th className="dashboard-th">Date Received</th>
                            <th className="dashboard-th">Destination</th>
                            <th className="dashboard-th">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.slice(0, 15).map((donation) => (
                            <tr key={donation._id} className="donation-row">
                              <td className="dashboard-td"><strong>{donation.donorName}</strong></td>
                              <td className="dashboard-td amount">{formatCurrency(donation.amount)}</td>
                              <td className="dashboard-td">{new Date(donation.createdAt).toLocaleDateString()}</td>
                              <td className="dashboard-td">{donation.destination || 'General Fund'}</td>
                              <td className="dashboard-td">
                                <span className={`status-badge ${getDonationStatus(donation)}`}>
                                  {getDonationStatus(donation).charAt(0).toUpperCase() + getDonationStatus(donation).slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="no-data-message">No donation records found</p>
                  )}
                </div>
              </div>

              {/* Transparency Statement */}
              <div className="transparency-statement">
                <h3>📋 Transparency Statement</h3>
                <div className="statement-content">
                  <p>
                    This dashboard provides complete transparency into our relief organization's financial operations.
                    Every donation is tracked from receipt through allocation. All expenses are documented and categorized
                    to ensure accountability and trust with our donors and beneficiaries.
                  </p>
                  <div className="statement-stats">
                    <div className="statement-stat">
                      <span className="stat-label">Verified Donations:</span>
                      <span className="stat-value">{donations.filter(d => d.status === 'approved').length}/{donations.length}</span>
                    </div>
                    <div className="statement-stat">
                      <span className="stat-label">Approved Expenses:</span>
                      <span className="stat-value">{expenses.filter(e => e.status === 'approved').length}/{expenses.length}</span>
                    </div>
                    <div className="statement-stat">
                      <span className="stat-label">Success Rate:</span>
                      <span className="stat-value">{donations.length > 0 ? Math.round((donations.filter(d => d.status === 'approved').length / donations.length) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drill-down Expense Modal */}
          {showDrilldownModal && (
            <div className="drilldown-modal-overlay" onClick={() => setShowDrilldownModal(false)}>
              <div className="drilldown-modal" onClick={(e) => e.stopPropagation()}>
                <div className="drilldown-header">
                  <h3>📂 Expense breakdown by Category</h3>
                  <button className="drilldown-close-btn" onClick={() => setShowDrilldownModal(false)}>✕</button>
                </div>
                <div className="drilldown-content">
                  {(() => {
                    const totalExp = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                    const map = {};
                    expenses.forEach(e => {
                      const cat = e.category || 'Other';
                      map[cat] = (map[cat] || 0) + (e.amount || 0);
                    });
                    return Object.entries(map).map(([name, amt]) => {
                      const pct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;
                      return (
                        <div key={name} className="category-drilldown-row">
                          <div className="category-drilldown-info">
                            <span>{name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ')}</span>
                            <span>{formatCurrency(amt)} ({pct}%)</span>
                          </div>
                          <div className="category-drilldown-bar-bg">
                            <div className="category-drilldown-bar-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  {expenses.length === 0 && <p style={{ textAlign: 'center', color: '#64748b' }}>No expense records available yet.</p>}
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
