import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { API_URL } from "../../api";
import RcaPreviewModal from '../../components/RcaPreviewModal';

// Modular Dashboard Components
import DashboardSidebar from './components/DashboardSidebar';
import DashboardHeader from './components/DashboardHeader';
import OverviewTab from './components/OverviewTab';
import DonationsTab from './components/DonationsTab';
import AttendeeDirectoryTab from './components/AttendeeDirectoryTab';
import FinancialAuditTab from './components/FinancialAuditTab';
import AnnouncementsTab from './components/AnnouncementsTab';
import ExpensesTab from './components/ExpensesTab';
import UserManagementTab from './components/UserManagementTab';
import TransparencyTab from './components/TransparencyTab';

// Modular Dashboard Modals
import GenerateReportModal from './components/GenerateReportModal';
import DonationDetailsModal from './components/DonationDetailsModal';
import DisburseAidModal from './components/DisburseAidModal';
import ExpenseDrilldownModal from './components/ExpenseDrilldownModal';
import EditUserModal from './components/EditUserModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import RecordDonationModal from './components/RecordDonationModal';

const Dashboard = () => {
  // Navigation & Tab State
  const [mainTab, setMainTab] = useState('overview');
  const [userManagementSubTab, setUserManagementSubTab] = useState('admins');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const authRedirectedRef = useRef(false);

  // Core Data State
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [cashAdvances, setCashAdvances] = useState([]);
  const [dashboardOverview, setDashboardOverview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Modal Visibility State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDrilldownModal, setShowDrilldownModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showRecordDonationModal, setShowRecordDonationModal] = useState(false);
  const [showRcaPreviewModal, setShowRcaPreviewModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [disburseModalUser, setDisburseModalUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  // Expense Form State
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  // Announcement Form State
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancCategory, setAncCategory] = useState('General');
  const [ancEventDate, setAncEventDate] = useState('');
  const [ancLocation, setAncLocation] = useState('');
  const [ancIsPinned, setAncIsPinned] = useState(false);
  const [ancSubmitting, setAncSubmitting] = useState(false);

  // Disbursement State
  const [disburseAmount, setDisburseAmount] = useState('');
  const [disburseSectorId, setDisburseSectorId] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showMinistryOverview, setShowMinistryOverview] = useState(false);

  // User Edit State
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('user');
  const [editUserDepartment, setEditUserDepartment] = useState('');
  const [editUserSectorGroup, setEditUserSectorGroup] = useState('None');
  const [editUserSectorIdNumber, setEditUserSectorIdNumber] = useState('');
  const [editUserSchool, setEditUserSchool] = useState('');
  const [editUserCourseProgram, setEditUserCourseProgram] = useState('');
  const [editUserYearLevel, setEditUserYearLevel] = useState('');
  const [editUserGwa, setEditUserGwa] = useState('');
  const [editUserHouseholdIncome, setEditUserHouseholdIncome] = useState('');
  const [editUserMonthlyAllowance, setEditUserMonthlyAllowance] = useState('0');
  const [editUserApplicationStatus, setEditUserApplicationStatus] = useState('Pending Review');
  const [editUserApplicationNotes, setEditUserApplicationNotes] = useState('');
  const [editUserRequirements, setEditUserRequirements] = useState({
    reportCard: false,
    indigencyCert: false,
    enrollmentForm: false,
    recommendationLetter: false
  });
  const [resetNewPassword, setResetNewPassword] = useState('');

  // Report Generator Form State
  const [reportTitleInput, setReportTitleInput] = useState('');
  const [reportTypeInput, setReportTypeInput] = useState('monthly');
  const [reportSectorInput, setReportSectorInput] = useState('all');
  const [reportStartDateInput, setReportStartDateInput] = useState('');
  const [reportEndDateInput, setReportEndDateInput] = useState('');
  const [reportNotesInput, setReportNotesInput] = useState('');

  // RCA Form State
  const [rcaName, setRcaName] = useState('');
  const [rcaDate, setRcaDate] = useState(new Date().toISOString().split('T')[0]);
  const [rcaPosition, setRcaPosition] = useState('');
  const [rcaMinistry, setRcaMinistry] = useState('');
  const [rcaActivity, setRcaActivity] = useState('');
  const [rcaDateNeeded, setRcaDateNeeded] = useState('');
  const [rcaRequestedAmount, setRcaRequestedAmount] = useState('');
  const [rcaOutstandingAmount, setRcaOutstandingAmount] = useState('');
  const [rcaRequestedBy, setRcaRequestedBy] = useState('');
  const [rcaRecommendingBy, setRcaRecommendingBy] = useState('');
  const [rcaApprovedBy, setRcaApprovedBy] = useState('');
  const [rcaOutstandingDetails, setRcaOutstandingDetails] = useState([
    { date: '', amount: '', status: '' },
    { date: '', amount: '', status: '' },
    { date: '', amount: '', status: '' },
    { date: '', amount: '', status: '' },
    { date: '', amount: '', status: '' }
  ]);

  // Auth Helpers
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const handleUnauthorized = useCallback(() => {
    if (authRedirectedRef.current) return;
    authRedirectedRef.current = true;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatCurrency = (val) => {
    return `₱${(Number(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDonationStatus = (donation) => {
    return donation.verificationStatus || donation.status || 'approved';
  };

  const getReceiptUrl = (receiptPath) => {
    if (!receiptPath) return '';
    if (receiptPath.startsWith('http://') || receiptPath.startsWith('https://') || receiptPath.startsWith('blob:')) {
      return receiptPath;
    }
    const cleanPath = receiptPath.startsWith('/') ? receiptPath.substring(1) : receiptPath;
    return `${API_URL}/${cleanPath}`;
  };

  // Data Fetching
  const fetchDonations = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      const res = await axios.get(`${API_URL}/donations`, { headers: { Authorization: `Bearer ${token}` } });
      setDonations(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  }, [handleUnauthorized]);

  const fetchUsers = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      const res = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [handleUnauthorized]);

  const fetchExpenses = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      const res = await axios.get(`${API_URL}/expenses`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  }, [handleUnauthorized]);

  const fetchSectors = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/sectors`);
      setSectors(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/reports`, { headers: { Authorization: `Bearer ${token}` } });
      setReports(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements`);
      setAnnouncements(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  }, []);

  const fetchCashAdvances = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/cash-advances`);
      setCashAdvances(res.data.data || []);
    } catch (err) {
      console.error('Error fetching cash advances:', err);
    }
  }, []);

  const fetchDashboardOverview = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/dashboard/overview`, { headers: { Authorization: `Bearer ${token}` } });
      setDashboardOverview(res.data.data || res.data || null);
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    fetchDonations();
    fetchUsers();
    fetchExpenses();
    fetchSectors();
    fetchReports();
    fetchAnnouncements();
    fetchCashAdvances();
    fetchDashboardOverview();
  }, [fetchDonations, fetchUsers, fetchExpenses, fetchSectors, fetchReports, fetchAnnouncements, fetchCashAdvances, fetchDashboardOverview]);

  // Derived Analytics Data
  const monthlyTrendData = useMemo(() => {
    const map = new Map();
    donations.forEach((donation) => {
      const date = new Date(donation.createdAt || donation.date || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + (donation.amount || 0));
    });

    return Array.from(map.entries())
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
      const cat = expense.category || 'other';
      categoryMap[cat] = (categoryMap[cat] || 0) + (expense.amount || 0);
    });
    return Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }));
  }, [expenses]);

  // Actions & Handlers
  const handleRecordDonation = async (donationData) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      await axios.post(`${API_URL}/donations`, donationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Donation recorded successfully!');
      fetchDonations();
      fetchDashboardOverview();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error recording donation:', err);
      setMessage(err.response?.data?.message || 'Error recording donation');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const deleteDonation = async (id) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    if (!window.confirm('Are you sure you want to delete this donation?')) return;
    try {
      await axios.delete(`${API_URL}/donations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Donation deleted successfully!');
      fetchDonations();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting donation:', err);
      setMessage('Error deleting donation');
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    if (!expenseCategory || !expenseAmount) {
      setMessage('Please enter category and amount');
      return;
    }
    try {
      await axios.post(
        `${API_URL}/expenses`,
        { category: expenseCategory, amount: parseFloat(expenseAmount), description: expenseDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Expense recorded successfully!');
      setExpenseCategory('');
      setExpenseAmount('');
      setExpenseDescription('');
      fetchExpenses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding expense:', err);
      setMessage('Error adding expense');
    }
  };

  const approveExpense = async (id) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      await axios.put(`${API_URL}/expenses/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Expense approved!');
      setSelectedExpense(null);
      fetchExpenses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error approving expense:', err);
    }
  };

  const rejectExpense = async (id) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      await axios.put(`${API_URL}/expenses/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Expense rejected!');
      setSelectedExpense(null);
      fetchExpenses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error rejecting expense:', err);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    if (!ancTitle.trim() || !ancContent.trim()) {
      setMessage('Title and content are required');
      return;
    }
    try {
      setAncSubmitting(true);
      await axios.post(
        `${API_URL}/announcements`,
        {
          title: ancTitle,
          content: ancContent,
          category: ancCategory,
          eventDate: ancEventDate || undefined,
          location: ancLocation || undefined,
          isPinned: ancIsPinned
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Announcement published successfully!');
      setAncTitle('');
      setAncContent('');
      setAncCategory('General');
      setAncEventDate('');
      setAncLocation('');
      setAncIsPinned(false);
      fetchAnnouncements();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error posting announcement:', err);
      setMessage('Error posting announcement');
    } finally {
      setAncSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`${API_URL}/announcements/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Announcement removed');
      fetchAnnouncements();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const handleToggleScholarService = async (member) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    const currentServiceStatus = member.scholarDetails?.serviceStatus || 'Pending';
    const newServiceStatus = currentServiceStatus === 'Served' ? 'Pending' : 'Served';
    try {
      await axios.put(
        `${API_URL}/users/${member._id}`,
        {
          scholarDetails: {
            ...(member.scholarDetails || {}),
            serviceStatus: newServiceStatus,
            lastServiceDate: newServiceStatus === 'Served' ? new Date() : undefined
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Parish service updated to ${newServiceStatus}`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating parish service:', err);
    }
  };

  const handleDisburseFund = async () => {
    if (!disburseModalUser || !disburseAmount) return;
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      const amt = parseFloat(disburseAmount);
      await axios.post(
        `${API_URL}/expenses`,
        {
          category: 'Scholarship Aid',
          amount: amt,
          description: `Disbursement allowance for ${disburseModalUser.name} (${disburseModalUser.sectorGroup || 'Beneficiary'})`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Disbursed PHP ${amt.toLocaleString()} to ${disburseModalUser.name}`);
      setDisburseModalUser(null);
      setDisburseAmount('');
      fetchExpenses();
      fetchSectors();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error recording disbursement:', err);
      setMessage('Failed to disburse allowance');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserName(user?.name || '');
    setEditUserEmail(user?.email || '');
    setEditUserRole(user?.role || 'user');
    setEditUserDepartment(user?.department || '');
    setEditUserSectorGroup(user?.sectorGroup || 'None');
    setEditUserSectorIdNumber(user?.sectorIdNumber || '');
    setEditUserSchool(user?.scholarDetails?.school || '');
    setEditUserCourseProgram(user?.scholarDetails?.courseProgram || '');
    setEditUserYearLevel(user?.scholarDetails?.yearLevel || '');
    setEditUserGwa(user?.scholarDetails?.gwa || '');
    setEditUserHouseholdIncome(user?.scholarDetails?.householdIncome || '');
    setEditUserMonthlyAllowance(user?.scholarDetails?.monthlyAllowance || '0');
    setEditUserApplicationStatus(user?.scholarDetails?.applicationStatus || 'Pending Review');
    setEditUserApplicationNotes(user?.scholarDetails?.applicationNotes || '');
    setEditUserRequirements(user?.scholarDetails?.requirements || {
      reportCard: false,
      indigencyCert: false,
      enrollmentForm: false,
      recommendationLetter: false
    });
    setShowEditUserModal(true);
  };

  const saveUserEdits = async () => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    if (!editingUser?._id || !editUserName || !editUserEmail) {
      setMessage('Name and email are required');
      return;
    }
    try {
      await axios.put(
        `${API_URL}/users/${editingUser._id}`,
        {
          name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          department: editUserDepartment || undefined,
          sectorGroup: editUserSectorGroup,
          sectorIdNumber: editUserSectorIdNumber,
          scholarDetails: {
            school: editUserSchool,
            courseProgram: editUserCourseProgram,
            yearLevel: editUserYearLevel,
            gwa: editUserGwa ? parseFloat(editUserGwa) : undefined,
            householdIncome: editUserHouseholdIncome ? parseFloat(editUserHouseholdIncome) : undefined,
            monthlyAllowance: editUserMonthlyAllowance ? parseFloat(editUserMonthlyAllowance) : 0,
            applicationStatus: editUserApplicationStatus,
            applicationNotes: editUserApplicationNotes,
            requirements: editUserRequirements
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('User profile saved successfully!');
      setShowEditUserModal(false);
      setEditingUser(null);
      fetchUsers();
      fetchSectors();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving user profile:', err);
      setMessage('Error updating user');
    }
  };

  const handleResetUserPassword = (user) => {
    setResetPasswordUser(user);
    setResetNewPassword('');
  };

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordUser || !resetNewPassword || resetNewPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      await axios.put(
        `${API_URL}/users/${resetPasswordUser._id}/reset-password`,
        { newPassword: resetNewPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Password reset for ${resetPasswordUser.name}`);
      setResetPasswordUser(null);
      setResetNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      alert('Failed to reset password');
    }
  };

  const handleApproveUser = async (id) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      await axios.put(`${API_URL}/users/${id}`, { status: 'active' }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('User account approved!');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error approving user:', err);
    }
  };

  const handleGenerateReportSubmit = (e) => {
    e.preventDefault();
    const title = reportTitleInput || `${reportTypeInput.toUpperCase()} Financial Audit Report`;

    const filtered = donations.filter(d => {
      const dDate = new Date(d.createdAt);
      if (reportStartDateInput && dDate < new Date(reportStartDateInput)) return false;
      if (reportEndDateInput && dDate > new Date(reportEndDateInput)) return false;
      if (reportSectorInput !== 'all') {
        const dest = (d.destination || '').toLowerCase();
        if (!dest.includes(reportSectorInput.toLowerCase())) return false;
      }
      return true;
    });

    const totalRaised = filtered.reduce((s, d) => s + (d.amount || 0), 0);
    const totalDisbursed = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const netBalance = totalRaised - totalDisbursed;

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
            .sub { font-size: 14px; color: #64748b; margin-top: 6px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
            .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
            .stat-lbl { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .stat-val { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 12px; color: #64748b; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Sto. Domingo Parish — ReliefLink</h1>
            <div class="sub">${title} • Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-lbl">Total Funds Raised</div>
              <div class="stat-val">₱${totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="stat-box">
              <div class="stat-lbl">Total Disbursed</div>
              <div class="stat-val">₱${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="stat-box">
              <div class="stat-lbl">Net Operational Balance</div>
              <div class="stat-val">₱${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <h3>Transactions Log (${filtered.length} Records)</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor Name</th>
                <th>Channel</th>
                <th>Destination</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(d => `
                <tr>
                  <td>${new Date(d.createdAt).toLocaleDateString()}</td>
                  <td>${d.donorName}</td>
                  <td>${d.paymentMethod || 'Cash'}</td>
                  <td>${d.destination || 'General Fund'}</td>
                  <td><strong>₱${(d.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                  <td>${d.verificationStatus || d.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <span>ReliefLink Financial &amp; Cryptographic Audit Report</span>
            <span>Prepared for Sto. Domingo Parish Pastoral Council</span>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();

    setMessage('Financial Audit Report generated successfully!');
    setShowGenerateReportModal(false);
    setTimeout(() => setMessage(''), 4000);
  };

  const handlePrintRcaForm = (saveAuditLog = false) => {
    setShowRcaPreviewModal(false);

    // If saving audit log is requested
    if (saveAuditLog) {
      setMessage('RCA Form confirmed, recorded in parish audit registry, and sent to printer.');
      setTimeout(() => setMessage(''), 4000);
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow pop-ups in your browser to print the RCA form.');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RCA Form - ${rcaName || 'Parishioner'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 20mm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #000000;
              background: #ffffff;
              margin: 0;
              padding: 20px;
              font-size: 11pt;
              line-height: 1.3;
            }
            .rca-container {
              max-width: 750px;
              margin: 0 auto;
              border: 2px solid #000000;
              padding: 24px;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header-title {
              font-size: 16pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-sub {
              font-size: 13pt;
              font-weight: bold;
              margin-top: 4px;
            }
            .field-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              font-size: 11pt;
              font-weight: bold;
            }
            .field-item {
              display: flex;
              flex: 1;
            }
            .field-label {
              white-space: nowrap;
              margin-right: 6px;
            }
            .field-line {
              border-bottom: 1px solid #000000;
              flex: 1;
              padding-left: 8px;
              font-weight: normal;
            }
            .field-bold {
              font-weight: bold;
            }
            .note-text {
              font-size: 9pt;
              font-style: italic;
              margin-bottom: 14px;
              font-weight: normal;
              color: #333333;
            }
            .table-sig-wrap {
              display: flex;
              border: 1.5px solid #000000;
              margin-top: 15px;
              margin-bottom: 15px;
            }
            .table-col {
              width: 45%;
              border-right: 1.5px solid #000000;
            }
            .sig-col {
              width: 55%;
              padding: 10px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000000;
              padding: 4px;
              font-size: 9.5pt;
            }
            th {
              background: #f8fafc;
              text-align: center;
            }
            .sig-block {
              margin-bottom: 14px;
            }
            .sig-header {
              font-size: 9.5pt;
              font-weight: bold;
              margin-bottom: 18px;
            }
            .sig-line {
              border-bottom: 1px solid #000000;
              text-align: center;
              font-weight: bold;
              font-size: 10.5pt;
              padding-bottom: 2px;
            }
            .sig-label {
              font-size: 8pt;
              text-align: center;
              margin-top: 2px;
            }
            .promise-box {
              font-size: 9.5pt;
              font-weight: bold;
              line-height: 1.4;
              margin-top: 16px;
              margin-bottom: 24px;
              color: #000000;
            }
            .bottom-sigs {
              display: flex;
              justify-content: space-between;
              gap: 40px;
              margin-top: 20px;
            }
            .bottom-sig-item {
              flex: 1;
              text-align: center;
            }
            .footer-conf {
              margin-top: 16px;
              font-size: 8.5pt;
              font-family: sans-serif;
              color: #444444;
            }
            @media print {
              body { padding: 0; }
              .rca-container { border: 2px solid #000 !important; width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="rca-container">
            <div class="header">
              <div class="header-title">STO. DOMINGO PARISH PASTORAL COUNCIL</div>
              <div class="header-sub">REQUEST FOR CASH ADVANCE FORM (RCA)</div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <span class="field-label">NAME:</span>
                <span class="field-line">${rcaName || ''}</span>
              </div>
              <div class="field-item" style="max-width: 220px; margin-left: 16px;">
                <span class="field-label">DATE:</span>
                <span class="field-line">${rcaDate || ''}</span>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <span class="field-label">POSITION:</span>
                <span class="field-line">${rcaPosition || ''}</span>
              </div>
              <div class="field-item" style="max-width: 280px; margin-left: 16px;">
                <span class="field-label">ORG / MINISTRY:</span>
                <span class="field-line">${rcaMinistry || ''}</span>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <span class="field-label">ACTIVITY / PURPOSE:</span>
                <span class="field-line">${rcaActivity || ''}</span>
              </div>
              <div class="field-item" style="max-width: 240px; margin-left: 16px;">
                <span class="field-label">DATE NEEDED:</span>
                <span class="field-line">${rcaDateNeeded || ''}</span>
              </div>
            </div>

            <div class="field-row" style="margin-bottom: 6px;">
              <div class="field-item">
                <span class="field-label">REQUESTED CASH ADVANCE:</span>
                <span class="field-line field-bold">${rcaRequestedAmount ? '₱' + Number(rcaRequestedAmount).toLocaleString() : '₱0.00'}</span>
              </div>
            </div>

            <div class="note-text">
              Note: Receipts attached to the Liquidation Form must be under the name of Sto. Domingo Parish Pastoral Council.
            </div>

            <div class="field-row" style="margin-bottom: 14px;">
              <div class="field-item">
                <span class="field-label">OUTSTANDING CASH ADVANCE:</span>
                <span class="field-line">${rcaOutstandingAmount ? '₱' + Number(rcaOutstandingAmount).toLocaleString() : 'None'}</span>
              </div>
            </div>

            <div class="table-sig-wrap">
              <div class="table-col">
                <table>
                  <thead>
                    <tr>
                      <th colspan="3" style="font-size: 8.5pt; font-style: italic;">Details of Outstanding Cash Advance (to be filled up by PFC)</th>
                    </tr>
                    <tr>
                      <th>Date Released</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(rcaOutstandingDetails || [{}, {}, {}, {}, {}]).map(r => `
                      <tr>
                        <td style="text-align: center; height: 22px;">${r.date || ''}</td>
                        <td style="text-align: right; padding-right: 6px; height: 22px;">${r.amount ? '₱' + Number(r.amount).toLocaleString() : ''}</td>
                        <td style="text-align: center; height: 22px;">${r.status || ''}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="sig-col">
                <div class="sig-block">
                  <div class="sig-header">REQUESTED BY :</div>
                  <div class="sig-line">${rcaRequestedBy || rcaName || ''}</div>
                  <div class="sig-label">(Signature Over Printed Name)</div>
                </div>

                <div class="sig-block">
                  <div class="sig-header">RECOMMENDING APPROVAL :</div>
                  <div class="sig-line">${rcaRecommendingBy || 'Parish Finance Council / Treasurer'}</div>
                  <div class="sig-label">(Signature Over Printed Name)</div>
                </div>

                <div class="sig-block" style="margin-bottom: 0;">
                  <div class="sig-header">APPROVED BY :</div>
                  <div class="sig-line">${rcaApprovedBy || 'Parish Priest'}</div>
                  <div class="sig-label">(Signature Over Printed Name)</div>
                </div>
              </div>
            </div>

            <div class="promise-box">
              I hereby promise to liquidate my cash advance WITHIN (a) five (5) working days from completion of event/project or (b) five (5) working days from the day following release of cash advance, as applicable.
            </div>

            <div class="bottom-sigs">
              <div class="bottom-sig-item">
                <div class="sig-line">${rcaName || ''}</div>
                <div class="sig-label">(Signature Over Printed Name)</div>
              </div>
              <div class="bottom-sig-item">
                <div class="sig-line">${rcaDate || ''}</div>
                <div class="sig-label">Date</div>
              </div>
            </div>

            <div class="footer-conf">
              Data Classification - Confidential
            </div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => {
      printWin.print();
    }, 250);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        mainTab={mainTab}
        setMainTab={setMainTab}
        currentUser={currentUser}
        handleLogout={handleLogout}
        userManagementSubTab={userManagementSubTab}
        setUserManagementSubTab={setUserManagementSubTab}
      />

      {/* Main App Layout */}
      <div className="dashboard-content" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        {/* Live Top KPI Ticker */}
        <DashboardHeader
          donations={donations}
          expenses={expenses}
          users={users}
          formatCurrency={formatCurrency}
        />

        {/* Global Feedback Banner */}
        {message && (
          <div style={{ margin: '16px 24px -8px 24px', padding: '12px 20px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '13px', fontWeight: '600' }}>
            {message}
          </div>
        )}

        {/* Dynamic Main Tabs */}
        {mainTab === 'overview' && (
          <OverviewTab
            donations={donations}
            expenses={expenses}
            users={users}
            sectors={sectors}
            monthlyTrendData={monthlyTrendData}
            formatCurrency={formatCurrency}
            setShowGenerateReportModal={setShowGenerateReportModal}
            setShowRecordDonationModal={setShowRecordDonationModal}
            setMainTab={setMainTab}
            setShowDrilldownModal={setShowDrilldownModal}
          />
        )}

        {mainTab === 'donations' && (
          <DonationsTab
            donations={donations}
            sectors={sectors}
            formatCurrency={formatCurrency}
            setSelectedDonation={setSelectedDonation}
            deleteDonation={deleteDonation}
            getDonationStatus={getDonationStatus}
            setShowRecordDonationModal={setShowRecordDonationModal}
          />
        )}

        {mainTab === 'sectors' && (
          <AttendeeDirectoryTab
            users={users}
            sectors={sectors}
            sectorFilter={sectorFilter}
            setSectorFilter={setSectorFilter}
            showMinistryOverview={showMinistryOverview}
            setShowMinistryOverview={setShowMinistryOverview}
            handleToggleScholarService={handleToggleScholarService}
            setDisburseModalUser={setDisburseModalUser}
            setDisburseAmount={setDisburseAmount}
            setDisburseSectorId={setDisburseSectorId}
            handleEditUser={handleEditUser}
          />
        )}

        {mainTab === 'reports' && (
          <FinancialAuditTab
            rcaName={rcaName} setRcaName={setRcaName}
            rcaDate={rcaDate} setRcaDate={setRcaDate}
            rcaPosition={rcaPosition} setRcaPosition={setRcaPosition}
            rcaMinistry={rcaMinistry} setRcaMinistry={setRcaMinistry}
            rcaActivity={rcaActivity} setRcaActivity={setRcaActivity}
            rcaDateNeeded={rcaDateNeeded} setRcaDateNeeded={setRcaDateNeeded}
            rcaRequestedAmount={rcaRequestedAmount} setRcaRequestedAmount={setRcaRequestedAmount}
            rcaOutstandingAmount={rcaOutstandingAmount} setRcaOutstandingAmount={setRcaOutstandingAmount}
            rcaRequestedBy={rcaRequestedBy} setRcaRequestedBy={setRcaRequestedBy}
            rcaRecommendingBy={rcaRecommendingBy} setRcaRecommendingBy={setRcaRecommendingBy}
            rcaApprovedBy={rcaApprovedBy} setRcaApprovedBy={setRcaApprovedBy}
            rcaOutstandingDetails={rcaOutstandingDetails} setRcaOutstandingDetails={setRcaOutstandingDetails}
            cashAdvances={cashAdvances}
            setShowRcaPreviewModal={setShowRcaPreviewModal}
            handlePrintRcaForm={handlePrintRcaForm}
            donations={donations}
            expenses={expenses}
            dashboardOverview={dashboardOverview}
            formatCurrency={formatCurrency}
            setShowDrilldownModal={setShowDrilldownModal}
          />
        )}

        {mainTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            ancTitle={ancTitle} setAncTitle={setAncTitle}
            ancContent={ancContent} setAncContent={setAncContent}
            ancCategory={ancCategory} setAncCategory={setAncCategory}
            ancEventDate={ancEventDate} setAncEventDate={setAncEventDate}
            ancLocation={ancLocation} setAncLocation={setAncLocation}
            ancIsPinned={ancIsPinned} setAncIsPinned={setAncIsPinned}
            ancSubmitting={ancSubmitting}
            handleCreateAnnouncement={handleCreateAnnouncement}
            handleDeleteAnnouncement={handleDeleteAnnouncement}
          />
        )}

        {mainTab === 'expenses' && (
          <ExpensesTab
            expenses={expenses}
            expenseByCategory={expenseByCategory}
            expenseCategory={expenseCategory}
            setExpenseCategory={setExpenseCategory}
            expenseAmount={expenseAmount}
            setExpenseAmount={setExpenseAmount}
            expenseDescription={expenseDescription}
            setExpenseDescription={setExpenseDescription}
            addExpense={addExpense}
            selectedExpense={selectedExpense}
            setSelectedExpense={setSelectedExpense}
            approveExpense={approveExpense}
            rejectExpense={rejectExpense}
            formatCurrency={formatCurrency}
          />
        )}

        {mainTab === 'users' && (
          <UserManagementTab
            users={users}
            userManagementSubTab={userManagementSubTab}
            setUserManagementSubTab={setUserManagementSubTab}
            handleEditUser={handleEditUser}
            handleResetUserPassword={handleResetUserPassword}
            handleApproveUser={handleApproveUser}
            formatCurrency={formatCurrency}
          />
        )}

        {mainTab === 'transparency' && (
          <TransparencyTab
            donations={donations}
            expenses={expenses}
            formatCurrency={formatCurrency}
            getDonationStatus={getDonationStatus}
          />
        )}
      </div>

      {/* Modular Modals */}
      <GenerateReportModal
        showGenerateReportModal={showGenerateReportModal}
        setShowGenerateReportModal={setShowGenerateReportModal}
        reportTitleInput={reportTitleInput} setReportTitleInput={setReportTitleInput}
        reportTypeInput={reportTypeInput} setReportTypeInput={setReportTypeInput}
        reportSectorInput={reportSectorInput} setReportSectorInput={setReportSectorInput}
        reportStartDateInput={reportStartDateInput} setReportStartDateInput={setReportStartDateInput}
        reportEndDateInput={reportEndDateInput} setReportEndDateInput={setReportEndDateInput}
        reportNotesInput={reportNotesInput} setReportNotesInput={setReportNotesInput}
        sectors={sectors}
        handleGenerateReportSubmit={handleGenerateReportSubmit}
      />

      <DonationDetailsModal
        selectedDonation={selectedDonation}
        setSelectedDonation={setSelectedDonation}
        getReceiptUrl={getReceiptUrl}
      />

      <DisburseAidModal
        disburseModalUser={disburseModalUser}
        setDisburseModalUser={setDisburseModalUser}
        disburseAmount={disburseAmount}
        setDisburseAmount={setDisburseAmount}
        handleDisburseFund={handleDisburseFund}
      />

      <ExpenseDrilldownModal
        showDrilldownModal={showDrilldownModal}
        setShowDrilldownModal={setShowDrilldownModal}
        expenses={expenses}
        formatCurrency={formatCurrency}
      />

      <EditUserModal
        showEditUserModal={showEditUserModal}
        setShowEditUserModal={setShowEditUserModal}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        editUserName={editUserName} setEditUserName={setEditUserName}
        editUserEmail={editUserEmail} setEditUserEmail={setEditUserEmail}
        editUserRole={editUserRole} setEditUserRole={setEditUserRole}
        editUserDepartment={editUserDepartment} setEditUserDepartment={setEditUserDepartment}
        editUserSectorGroup={editUserSectorGroup} setEditUserSectorGroup={setEditUserSectorGroup}
        editUserSectorIdNumber={editUserSectorIdNumber} setEditUserSectorIdNumber={setEditUserSectorIdNumber}
        editUserSchool={editUserSchool} setEditUserSchool={setEditUserSchool}
        editUserCourseProgram={editUserCourseProgram} setEditUserCourseProgram={setEditUserCourseProgram}
        editUserYearLevel={editUserYearLevel} setEditUserYearLevel={setEditUserYearLevel}
        editUserGwa={editUserGwa} setEditUserGwa={setEditUserGwa}
        editUserHouseholdIncome={editUserHouseholdIncome} setEditUserHouseholdIncome={setEditUserHouseholdIncome}
        editUserMonthlyAllowance={editUserMonthlyAllowance} setEditUserMonthlyAllowance={setEditUserMonthlyAllowance}
        editUserApplicationStatus={editUserApplicationStatus} setEditUserApplicationStatus={setEditUserApplicationStatus}
        editUserApplicationNotes={editUserApplicationNotes} setEditUserApplicationNotes={setEditUserApplicationNotes}
        editUserRequirements={editUserRequirements} setEditUserRequirements={setEditUserRequirements}
        saveUserEdits={saveUserEdits}
        mainTab={mainTab}
      />

      <ResetPasswordModal
        resetPasswordUser={resetPasswordUser}
        setResetPasswordUser={setResetPasswordUser}
        resetNewPassword={resetNewPassword}
        setResetNewPassword={setResetNewPassword}
        handleConfirmResetPassword={handleConfirmResetPassword}
      />

      <RcaPreviewModal
        showRcaPreviewModal={showRcaPreviewModal}
        setShowRcaPreviewModal={setShowRcaPreviewModal}
        rcaName={rcaName}
        rcaDate={rcaDate}
        rcaPosition={rcaPosition}
        rcaMinistry={rcaMinistry}
        rcaActivity={rcaActivity}
        rcaDateNeeded={rcaDateNeeded}
        rcaRequestedAmount={rcaRequestedAmount}
        rcaOutstandingAmount={rcaOutstandingAmount}
        rcaOutstandingDetails={rcaOutstandingDetails}
        rcaRequestedBy={rcaRequestedBy}
        rcaRecommendingBy={rcaRecommendingBy}
        rcaApprovedBy={rcaApprovedBy}
        handlePrintRcaForm={handlePrintRcaForm}
      />

      <RecordDonationModal
        showRecordDonationModal={showRecordDonationModal}
        setShowRecordDonationModal={setShowRecordDonationModal}
        sectors={sectors}
        handleRecordDonation={handleRecordDonation}
      />
    </div>
  );
};

export default Dashboard;
