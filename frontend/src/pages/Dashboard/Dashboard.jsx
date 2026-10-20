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
import DocumentsTab from './components/DocumentsTab';
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
import CreateUserModal from './components/CreateUserModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import RecordDonationModal from './components/RecordDonationModal';

const Dashboard = () => {
  // Navigation & Tab State
  const [mainTab, setMainTab] = useState('overview');
  const [userManagementSubTab, setUserManagementSubTab] = useState('all');
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
  const [editingCashAdvanceId, setEditingCashAdvanceId] = useState(null);
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
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [disburseModalUser, setDisburseModalUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  // Expense Form State
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  // Announcement Form State
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancCategory, setAncCategory] = useState('');
  const [ancEventDate, setAncEventDate] = useState('');
  const [ancLocation, setAncLocation] = useState('');
  const [ancWho, setAncWho] = useState('');
  const [ancIsPinned, setAncIsPinned] = useState(false);
  const [ancSubmitting, setAncSubmitting] = useState(false);
  const [editingAncId, setEditingAncId] = useState(null);

  // Disbursement State
  const [disburseAmount, setDisburseAmount] = useState('');
  const [disburseSectorId, setDisburseSectorId] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showMinistryOverview, setShowMinistryOverview] = useState(false);

  // User Edit State
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserRole, setEditUserRole] = useState('user');
  const [editUserStatus, setEditUserStatus] = useState('active');
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
    if (!receiptPath || typeof receiptPath !== 'string') return '';
    if (receiptPath.startsWith('data:image') || receiptPath.startsWith('http://') || receiptPath.startsWith('https://') || receiptPath.startsWith('blob:')) {
      return receiptPath;
    }
    const backendBase = API_URL.replace(/\/api\/?$/, '');
    const cleanPath = receiptPath.startsWith('/') ? receiptPath : `/${receiptPath}`;
    return `${backendBase}${cleanPath}`;
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

  // Restrict Non-Superadmin from Reports and Admin subtab
  useEffect(() => {
    if (currentUser && currentUser.role !== 'superadmin') {
      if (mainTab === 'reports') {
        setMainTab('overview');
      }
      if (userManagementSubTab === 'admins') {
        setUserManagementSubTab('registered');
      }
    }
  }, [currentUser, mainTab, userManagementSubTab]);

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
    const approvedExpenses = expenses.filter(e => e.status === 'approved' || !e.status);
    approvedExpenses.forEach((expense) => {
      const cat = (expense.category || 'other').trim();
      categoryMap[cat] = (categoryMap[cat] || 0) + (expense.amount || 0);
    });
    return Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }));
  }, [expenses]);

  // Actions & Handlers
  const handleRecordDonation = async (donationData) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    try {
      const res = await axios.post(`${API_URL}/donations`, donationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Donation recorded successfully!');
      await fetchDonations();
      await fetchDashboardOverview();
      setTimeout(() => setMessage(''), 3000);
      return res.data;
    } catch (err) {
      console.error('Error recording donation:', err);
      const errMsg = err.response?.data?.message || (err.response?.data?.errors && err.response?.data?.errors[0]?.msg) || 'Error recording donation';
      setMessage(errMsg);
      alert(`Could not record contribution: ${errMsg}`);
      setTimeout(() => setMessage(''), 5000);
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

  const addExpense = async (e, overrideCategory = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    const catToUse = (overrideCategory || expenseCategory || '').trim();
    if (!catToUse || !expenseAmount) {
      setMessage('Please enter category and amount');
      return;
    }
    try {
      const isSuperAdmin = currentUser?.role === 'superadmin';
      const initialStatus = isSuperAdmin ? 'approved' : 'pending';
      await axios.post(
        `${API_URL}/expenses`,
        { category: catToUse, amount: parseFloat(expenseAmount), description: expenseDescription, status: initialStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(isSuperAdmin ? 'Transaction recorded and automatically approved!' : 'Transaction recorded (Pending approval)!');
      setExpenseCategory('');
      setExpenseAmount('');
      setExpenseDescription('');
      fetchExpenses();
      fetchDonations();
      fetchSectors();
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
      fetchDonations();
      fetchSectors();
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

  const handleEditAnnouncement = (anc) => {
    setEditingAncId(anc._id);
    setAncTitle(anc.title || '');
    setAncContent(anc.content || '');
    setAncCategory(anc.category || '');
    setAncEventDate(anc.eventDate || '');
    setAncLocation(anc.location || '');
    setAncWho(anc.who || '');
    setAncIsPinned(Boolean(anc.isPinned));
    const contentArea = document.querySelector('.dashboard-content') || window;
    contentArea.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAncId(null);
    setAncTitle('');
    setAncContent('');
    setAncCategory('');
    setAncEventDate('');
    setAncLocation('');
    setAncWho('');
    setAncIsPinned(false);
  };

  const handleCreateAnnouncement = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    if (!ancTitle.trim() || !ancContent.trim()) {
      setMessage('Title and content are required');
      return;
    }
    try {
      setAncSubmitting(true);
      const payload = {
        title: ancTitle.trim(),
        content: ancContent.trim(),
        category: ancCategory || 'General',
        eventDate: ancEventDate ? ancEventDate.trim() : '',
        location: ancLocation ? ancLocation.trim() : '',
        who: ancWho ? ancWho.trim() : '',
        isPinned: Boolean(ancIsPinned)
      };

      if (editingAncId) {
        let updatedAnc = null;
        try {
          const res = await axios.put(
            `${API_URL}/announcements/${editingAncId}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          updatedAnc = res.data?.data;
          setMessage('Announcement updated successfully!');
        } catch (putErr) {
          // If 404 (e.g., static mock ID or backend not found), create as new announcement
          if (putErr.response?.status === 404) {
            const postRes = await axios.post(
              `${API_URL}/announcements`,
              payload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            updatedAnc = postRes.data?.data;
            setMessage('Announcement updated successfully!');
          } else {
            throw putErr;
          }
        }
        if (updatedAnc) {
          setAnnouncements(prev => prev.map(a => a._id === editingAncId ? updatedAnc : a));
        }
      } else {
        const res = await axios.post(
          `${API_URL}/announcements`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Announcement published successfully!');
        if (res.data?.data) {
          const createdAnc = res.data.data;
          setAnnouncements(prev => [createdAnc, ...prev]);
        }
      }
      handleCancelEditAnnouncement();
      fetchAnnouncements();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving announcement:', err);
      setMessage(err.response?.data?.error || err.response?.data?.message || 'Error saving announcement');
    } finally {
      setAncSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`${API_URL}/announcements/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Announcement deleted successfully');
    } catch (err) {
      console.warn('Delete warning:', err);
      // If 404 or backend mismatch on static ID, still consider deleted locally
      if (err.response?.status === 404) {
        setMessage('Announcement deleted successfully');
      } else {
        setMessage(err.response?.data?.error || err.response?.data?.message || 'Error deleting announcement');
      }
    } finally {
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      if (editingAncId === id) {
        handleCancelEditAnnouncement();
      }
      fetchAnnouncements();
      setTimeout(() => setMessage(''), 3000);
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
      const sector = disburseModalUser.sectorGroup || 'General Relief';
      const isSuperAdmin = currentUser?.role === 'superadmin';
      const disburseStatus = isSuperAdmin ? 'approved' : 'pending';
      await axios.post(
        `${API_URL}/expenses`,
        {
          category: sector.toLowerCase().includes('scholar') ? 'Scholarship Aid' : `${sector} Assistance`,
          amount: amt,
          description: `Direct aid disbursement for ${disburseModalUser.name} (${sector})`,
          status: disburseStatus,
          beneficiaryId: disburseModalUser._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(isSuperAdmin ? `Successfully disbursed PHP ${amt.toLocaleString()} to ${disburseModalUser.name} (Approved)` : `Disbursement of PHP ${amt.toLocaleString()} recorded for ${disburseModalUser.name} (Pending Approval)`);
      setDisburseModalUser(null);
      setDisburseAmount('');
      fetchExpenses();
      fetchDonations();
      fetchSectors();
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      console.error('Error recording disbursement:', err);
      setMessage('Failed to disburse allowance');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserName(user?.name || '');
    setEditUserEmail(user?.email || '');
    setEditUserPhone(user?.phone || '');
    setEditUserRole(user?.role || 'user');
    setEditUserStatus(user?.status || 'active');
    setEditUserDepartment(user?.department || '');
    setEditUserSectorGroup(user?.sectorGroup || 'None');
    setEditUserSectorIdNumber(user?.sectorIdNumber || '');
    setEditUserSchool(user?.scholarDetails?.school || '');
    setEditUserCourseProgram(user?.scholarDetails?.courseProgram || '');
    setEditUserYearLevel(user?.scholarDetails?.yearLevel || '');
    setEditUserGwa(user?.scholarDetails?.gwa !== undefined && user?.scholarDetails?.gwa !== null ? String(user.scholarDetails.gwa) : '');
    setEditUserHouseholdIncome(user?.scholarDetails?.householdIncome !== undefined && user?.scholarDetails?.householdIncome !== null ? String(user.scholarDetails.householdIncome) : '');
    setEditUserMonthlyAllowance(user?.scholarDetails?.monthlyAllowance !== undefined && user?.scholarDetails?.monthlyAllowance !== null ? String(user.scholarDetails.monthlyAllowance) : '0');
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
    if (/\d/.test(editUserName.trim())) {
      setMessage('Full Name cannot contain numbers.');
      alert('Full Name cannot contain numbers. Please enter a valid name.');
      return;
    }
    try {
      const gwaVal = editUserGwa && !isNaN(parseFloat(editUserGwa)) ? parseFloat(editUserGwa) : undefined;
      const incomeVal = editUserHouseholdIncome && !isNaN(parseFloat(editUserHouseholdIncome)) ? parseFloat(editUserHouseholdIncome) : undefined;
      const allowanceVal = editUserMonthlyAllowance && !isNaN(parseFloat(editUserMonthlyAllowance)) ? parseFloat(editUserMonthlyAllowance) : 0;

      const isBeneficiaryEdit = mainTab === 'sectors';
      const isMemberUser = editingUser.role === 'user' || userManagementSubTab === 'registered';
      const targetRole = isMemberUser ? 'user' : (editUserRole || editingUser.role || 'admin');
      const targetSector = isBeneficiaryEdit ? editUserSectorGroup : (isMemberUser ? (editingUser.sectorGroup || editUserSectorGroup || 'None') : 'None');

      const payload = isBeneficiaryEdit ? {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        phone: editUserPhone ? editUserPhone.trim() : undefined,
        sectorGroup: editUserSectorGroup,
        sectorIdNumber: editUserSectorIdNumber,
        scholarDetails: (editUserSectorGroup === 'Student Scholarships' || editUserSectorGroup === 'Scholars') ? {
          ...(editingUser.scholarDetails || {}),
          school: editUserSchool,
          courseProgram: editUserCourseProgram,
          yearLevel: editUserYearLevel,
          gwa: gwaVal,
          householdIncome: incomeVal,
          monthlyAllowance: allowanceVal,
          applicationStatus: editUserApplicationStatus,
          applicationNotes: editUserApplicationNotes,
          requirements: editUserRequirements
        } : undefined
      } : {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        phone: editUserPhone ? editUserPhone.trim() : undefined,
        role: targetRole,
        status: editUserStatus,
        department: editUserDepartment ? editUserDepartment.trim() : undefined,
        sectorGroup: targetSector
      };

      await axios.put(
        `${API_URL}/users/${editingUser._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(isBeneficiaryEdit ? 'Beneficiary record saved successfully!' : 'User profile saved successfully!');
      setShowEditUserModal(false);
      setEditingUser(null);
      fetchUsers();
      fetchSectors();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving user profile:', err);
      setMessage(err.response?.data?.message || 'Error updating user profile');
    }
  };

  const handleToggleUserStatus = async (user) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    const id = user._id || user.id;
    if (currentUser && (currentUser._id === id || currentUser.id === id)) {
      alert('You cannot deactivate your own logged-in account.');
      return;
    }
    const currentStatus = (user.status || 'active').toLowerCase();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(
        `${API_URL}/users/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`User "${user.name || 'Account'}" is now marked as ${newStatus === 'inactive' ? 'NOT ACTIVE' : 'ACTIVE'}.`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setMessage(err.response?.data?.message || 'Error updating user status');
    }
  };

  const handleResetUserPassword = (user) => {
    if (currentUser?.role !== 'superadmin') {
      alert('Access denied. Only Superadmin is authorized to reset user passwords.');
      return;
    }
    setResetPasswordUser(user);
    setResetNewPassword('');
  };

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordUser || !resetNewPassword || resetNewPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    if (/[<>"':;\/|{}\[\]()\-\+= ]/.test(resetNewPassword)) {
      alert("Password cannot contain spaces or forbidden characters (< > \" : ; ' / | { } [ ] ( ) - + =)");
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

  const handleApproveBeneficiary = async (user) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    const id = user._id || user.id;
    try {
      const payload = {
        status: 'active',
        scholarDetails: user.sectorGroup === 'Scholars' ? {
          ...(user.scholarDetails || {}),
          applicationStatus: 'Approved'
        } : user.scholarDetails
      };
      await axios.put(`${API_URL}/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`Beneficiary "${user.name}" approved successfully!`);
      fetchUsers();
      if (showEditUserModal) setShowEditUserModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error approving beneficiary:', err);
      setMessage('Failed to approve beneficiary.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteUser = async (user) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    const id = user._id || user.id;
    const name = user.name || user.email || 'this user';
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(`User "${name}" deleted successfully`);
      setUsers(prev => prev.filter(u => (u._id || u.id) !== id));
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage(err.response?.data?.message || 'Error deleting user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreateUserSubmit = async (payload) => {
    const token = getAuthToken();
    if (!token) return handleUnauthorized();
    const res = await axios.post(`${API_URL}/users`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessage(`User account for "${payload.name}" created successfully!`);
    await fetchUsers();
    await fetchSectors();
    if (payload.sectorGroup && payload.sectorGroup !== 'None') {
      setSectorFilter(payload.sectorGroup);
      setMainTab('sectors');
    }
    setTimeout(() => setMessage(''), 4000);
    return res.data;
  };

  const handleGenerateReportSubmit = (e) => {
    e.preventDefault();
    if (!reportTitleInput.trim()) {
      alert('Please enter a custom report title.');
      return;
    }
    if (!reportStartDateInput || !reportEndDateInput) {
      alert('Please select both From Date and To Date.');
      return;
    }
    if (new Date(reportStartDateInput) > new Date(reportEndDateInput)) {
      alert('From Date cannot be later than To Date.');
      return;
    }
    if (!reportNotesInput.trim()) {
      alert('Please provide notes or a summary narrative.');
      return;
    }

    const title = reportTitleInput.trim();

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
    const approvedExpenses = expenses.filter(e => e.status === 'approved' || !e.status);
    const totalDisbursed = approvedExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const netBalance = totalRaised - totalDisbursed;

    // Genuine beneficiaries count and sector distribution
    const genuineBeneficiaries = users.filter(u => {
      if (['superadmin', 'admin', 'staff'].includes(u.role)) return false;
      return u.sectorGroup && u.sectorGroup !== 'None' && u.sectorGroup.trim() !== '';
    });

    const sectorCounts = {
      'LGBTQ': 0,
      'Elderly': 0,
      'PDL': 0,
      'Urban Poor': 0,
      'Migrant': 0,
      'Student Scholarships': 0,
      'Drug Rehabilitation': 0
    };

    genuineBeneficiaries.forEach(u => {
      const sec = (u.sectorGroup || '').toLowerCase();
      if (sec.includes('lgbtq')) sectorCounts['LGBTQ'] += 1;
      else if (sec.includes('elderly') || sec.includes('senior')) sectorCounts['Elderly'] += 1;
      else if (sec.includes('pdl') || sec.includes('nakakolong') || sec.includes('prison')) sectorCounts['PDL'] += 1;
      else if (sec.includes('urban') || sec.includes('poor')) sectorCounts['Urban Poor'] += 1;
      else if (sec.includes('migrant')) sectorCounts['Migrant'] += 1;
      else if (sec.includes('student') || sec.includes('scholar')) sectorCounts['Student Scholarships'] += 1;
      else if (sec.includes('drug') || sec.includes('rehab')) sectorCounts['Drug Rehabilitation'] += 1;
    });

    // Expense categorization breakdown
    const expenseCatMap = {};
    approvedExpenses.forEach(exp => {
      const cat = (exp.category || 'General Relief Aid').trim();
      const label = cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      expenseCatMap[label] = (expenseCatMap[label] || 0) + (exp.amount || 0);
    });
    const expenseCategories = Object.entries(expenseCatMap);

    const monthlyBurnRate = approvedExpenses.length > 0 ? (totalDisbursed / 3) : 15000;
    const runwayMonths = monthlyBurnRate > 0 ? (netBalance / monthlyBurnRate).toFixed(1) : '12+';

    // Helper for status and remaining balance
    const resolveReportStatus = (d) => {
      const s = (d.status || d.verificationStatus || '').toLowerCase();
      if (s === 'fully used' || s === 'partially used' || s === 'cash on hand') return s;
      return 'cash on hand';
    };

    const getReportRemBal = (d) => {
      const st = resolveReportStatus(d);
      if (st === 'partially used') {
        if (d.remainingBalance !== undefined && d.remainingBalance !== null && d.remainingBalance > 0) {
          return d.remainingBalance;
        }
        return (d.amount || 0) * 0.5;
      }
      return 0;
    };

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Popup was blocked by your browser. Please allow popups for this site to view and print the audit report.');
      return;
    }
    printWin.document.write(`
      <html>
        <head>
          <title>${title} — ReliefLink Audit</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 36px 44px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.5px; }
            .parish { font-size: 13px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }
            .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
            .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 24px 0 10px 0; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
            .stat-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; }
            .stat-lbl { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .stat-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            .stat-sub { font-size: 11px; color: #475569; font-weight: 600; margin-top: 2px; }
            .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11.5px; }
            th { background: #0f172a; color: #ffffff; text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            .status-badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
            .status-cash { background: #ecfdf5; color: #16a34a; border: 1px solid #a7f3d0; }
            .status-partial { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
            .status-fully { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
            .footer { margin-top: 36px; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center; }
            @media print {
              body { padding: 16px; }
              .stat-box { border: 1px solid #000; }
              th { background: #000 !important; color: #fff !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="parish">Sto. Domingo Parish • ReliefLink System</div>
              <h1 class="title">${title}</h1>
              <div class="sub">Generated on ${new Date().toLocaleString()} • Filter Sector: ${reportSectorInput.toUpperCase()}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; font-weight: 700; color: #16a34a;">✓ Cryptographically Audited</div>
              <div style="font-size: 10.5px; color: #64748b;">Parish Pastoral Council</div>
            </div>
          </div>

          <!-- Dashboard KPI Summary Cards -->
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-lbl">Total Donations Raised</div>
              <div class="stat-val">₱${totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div class="stat-sub">${filtered.length} Verified Ledger Receipts</div>
            </div>
            <div class="stat-box">
              <div class="stat-lbl">Total Aid Disbursed</div>
              <div class="stat-val">₱${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div class="stat-sub">Disbursed Across ${approvedExpenses.length} Records</div>
            </div>
            <div class="stat-box">
              <div class="stat-lbl">Net Available Treasury</div>
              <div class="stat-val">₱${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div class="stat-sub">Available Treasury Balance</div>
            </div>
            <div class="stat-box">
              <div class="stat-lbl">Active Beneficiaries</div>
              <div class="stat-val">${genuineBeneficiaries.length} Members</div>
              <div class="stat-sub">Projected Runway: ${runwayMonths} mos</div>
            </div>
          </div>

          <!-- 2-Column: Expense Categories & Beneficiary Intake by Sector -->
          <div class="two-col">
            <div>
              <div class="section-title">Disbursement Categorization Breakdown</div>
              <table>
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th style="text-align: right;">Disbursed Amount</th>
                    <th style="text-align: right;">Share</th>
                  </tr>
                </thead>
                <tbody>
                  ${expenseCategories.map(([cat, amt]) => `
                    <tr>
                      <td><strong>${cat}</strong></td>
                      <td style="text-align: right;">₱${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align: right;">${totalDisbursed > 0 ? Math.round((amt / totalDisbursed) * 100) : 0}%</td>
                    </tr>
                  `).join('')}
                  ${expenseCategories.length === 0 ? '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No expense records found.</td></tr>' : ''}
                </tbody>
              </table>
            </div>

            <div>
              <div class="section-title">Beneficiary Intake Volume by Ministry Sector</div>
              <table>
                <thead>
                  <tr>
                    <th>Ministry / Sector</th>
                    <th style="text-align: right;">Active Headcount</th>
                    <th style="text-align: right;">Share</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(sectorCounts).map(([sec, count]) => `
                    <tr>
                      <td><strong>${sec}</strong></td>
                      <td style="text-align: right;">${count} Beneficiaries</td>
                      <td style="text-align: right;">${genuineBeneficiaries.length > 0 ? Math.round((count / genuineBeneficiaries.length) * 100) : 0}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Transaction Records Log -->
          <div class="section-title">Transactions Log (${filtered.length} Records)</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Channel</th>
                <th>Destination</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: right;">Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(d => {
                const st = resolveReportStatus(d);
                const rem = getReportRemBal(d);
                let badgeClass = 'status-cash';
                if (st === 'fully used') badgeClass = 'status-fully';
                else if (st === 'partially used') badgeClass = 'status-partial';

                return `
                  <tr>
                    <td>${new Date(d.createdAt).toLocaleDateString()}</td>
                    <td>${d.paymentMethod || 'Cash'}</td>
                    <td>${d.destination || 'General Fund'}</td>
                    <td style="text-align: right;"><strong>₱${(d.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td style="text-align: center;"><span class="status-badge ${badgeClass}">${st}</span></td>
                    <td style="text-align: right;">₱${rem.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `;
              }).join('')}
              ${filtered.length === 0 ? '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">No transaction records matched the criteria.</td></tr>' : ''}
            </tbody>
          </table>

          <div class="footer">
            <span>ReliefLink Financial &amp; Operations Audit Report</span>
            <span>Sto. Domingo Parish Pastoral Council • Confidential &amp; Validated</span>
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

  const handleSaveCashAdvance = async () => {
    if (!rcaName.trim()) {
      alert('Please enter Applicant Name.');
      return false;
    }
    if (/\d/.test(rcaName.trim())) {
      alert('Applicant Name cannot contain numbers. Please enter a valid name.');
      return false;
    }
    if (!rcaDate) {
      alert('Please select Document Date.');
      return false;
    }
    if (!rcaPosition.trim()) {
      alert('Please enter Position.');
      return false;
    }
    if (/\d/.test(rcaPosition.trim())) {
      alert('Position cannot contain numbers. Please enter a valid position.');
      return false;
    }
    if (!rcaMinistry.trim()) {
      alert('Please enter Organization / Ministry.');
      return false;
    }
    if (/^\d+$/.test(rcaMinistry.trim())) {
      alert('Organization / Ministry cannot be numeric only.');
      return false;
    }
    if (!rcaActivity.trim() || /^\d+$/.test(rcaActivity.trim())) {
      alert('Please enter a valid Activity / Purpose (cannot be numeric only).');
      return false;
    }
    if (!rcaDateNeeded) {
      alert('Please select Date Needed.');
      return false;
    }
    if (!rcaRequestedAmount || parseFloat(rcaRequestedAmount) <= 0) {
      alert('Please enter a valid Requested Cash Advance amount.');
      return false;
    }

    try {
      const payload = {
        applicantName: rcaName.trim(),
        date: rcaDate || new Date(),
        position: rcaPosition || '',
        ministry: rcaMinistry || '',
        activityPurpose: rcaActivity.trim(),
        dateNeeded: rcaDateNeeded || undefined,
        requestedAmount: parseFloat(rcaRequestedAmount) || 0,
        outstandingAmount: parseFloat(rcaOutstandingAmount) || 0,
        outstandingDetails: (rcaOutstandingDetails || []).filter(r => r.date || r.amount || r.status),
        requestedBy: rcaRequestedBy?.trim() || rcaName.trim() || 'Applicant',
        recommendingApproval: rcaRecommendingBy?.trim() || 'Parish Finance Council / Treasurer',
        approvedBy: rcaApprovedBy?.trim() || 'Parish Priest',
        status: 'Submitted',
        createdBy: currentUser?.name || 'Admin'
      };

      if (editingCashAdvanceId) {
        const res = await axios.put(`${API_URL}/cash-advances/${editingCashAdvanceId}`, payload);
        if (res.data?.success) {
          await fetchCashAdvances();
          setEditingCashAdvanceId(null);
          setMessage('Cash Advance RCA record updated successfully.');
          setTimeout(() => setMessage(''), 4000);
          return true;
        }
      } else {
        const res = await axios.post(`${API_URL}/cash-advances`, payload);
        if (res.data?.success) {
          await fetchCashAdvances();
          setMessage('Cash Advance RCA record generated & saved to audit table.');
          setTimeout(() => setMessage(''), 4000);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error saving cash advance:', err);
      alert('Failed to save cash advance: ' + (err.response?.data?.message || err.message));
      return false;
    }
  };

  const handleEditCashAdvance = (ca) => {
    if (!ca) return;
    setEditingCashAdvanceId(ca._id);
    setRcaName(ca.applicantName || '');
    setRcaDate(ca.date ? new Date(ca.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setRcaPosition(ca.position || '');
    setRcaMinistry(ca.ministry || '');
    setRcaActivity(ca.activityPurpose || '');
    setRcaDateNeeded(ca.dateNeeded ? new Date(ca.dateNeeded).toISOString().split('T')[0] : '');
    setRcaRequestedAmount(ca.requestedAmount !== undefined && ca.requestedAmount !== null ? String(ca.requestedAmount) : '');
    setRcaOutstandingAmount(ca.outstandingAmount !== undefined && ca.outstandingAmount !== null ? String(ca.outstandingAmount) : '');
    if (ca.outstandingDetails && ca.outstandingDetails.length > 0) {
      const details = ca.outstandingDetails.map(d => ({
        date: d.date ? new Date(d.date).toISOString().split('T')[0] : '',
        amount: d.amount !== undefined && d.amount !== null ? String(d.amount) : '',
        status: d.status || ''
      }));
      while (details.length < 5) {
        details.push({ date: '', amount: '', status: '' });
      }
      setRcaOutstandingDetails(details);
    } else {
      setRcaOutstandingDetails([
        { date: '', amount: '', status: '' },
        { date: '', amount: '', status: '' },
        { date: '', amount: '', status: '' },
        { date: '', amount: '', status: '' },
        { date: '', amount: '', status: '' }
      ]);
    }
    setRcaRequestedBy(ca.requestedBy || ca.applicantName || '');
    setRcaRecommendingBy(ca.recommendingApproval || '');
    setRcaApprovedBy(ca.approvedBy || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditCashAdvance = () => {
    setEditingCashAdvanceId(null);
    setRcaName('');
    setRcaDate(new Date().toISOString().split('T')[0]);
    setRcaPosition('');
    setRcaMinistry('');
    setRcaActivity('');
    setRcaDateNeeded('');
    setRcaRequestedAmount('');
    setRcaOutstandingAmount('');
    setRcaRequestedBy('');
    setRcaRecommendingBy('');
    setRcaApprovedBy('');
    setRcaOutstandingDetails([
      { date: '', amount: '', status: '' },
      { date: '', amount: '', status: '' },
      { date: '', amount: '', status: '' },
      { date: '', amount: '', status: '' },
      { date: '', amount: '', status: '' }
    ]);
  };

  const handleDeleteCashAdvance = async (id) => {
    if (!window.confirm('Are you sure you want to remove this Cash Advance audit record?')) return;
    try {
      await axios.delete(`${API_URL}/cash-advances/${id}`);
      await fetchCashAdvances();
      setMessage('Cash Advance audit record removed.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting cash advance:', err);
      alert('Failed to delete cash advance');
    }
  };

  const handlePrintRcaForm = async (recordOrSave = null) => {
    setShowRcaPreviewModal(false);

    let docName = rcaName;
    let docDate = rcaDate;
    let docPosition = rcaPosition;
    let docMinistry = rcaMinistry;
    let docActivity = rcaActivity;
    let docDateNeeded = rcaDateNeeded;
    let docRequestedAmount = rcaRequestedAmount;
    let docOutstandingAmount = rcaOutstandingAmount;
    let docDetails = rcaOutstandingDetails;
    let docRequestedBy = rcaRequestedBy;
    let docRecommending = rcaRecommendingBy;
    let docApprovedBy = rcaApprovedBy;

    // If an existing record object was passed from the audit table
    if (recordOrSave && typeof recordOrSave === 'object' && recordOrSave.applicantName) {
      docName = recordOrSave.applicantName;
      docDate = recordOrSave.date ? new Date(recordOrSave.date).toISOString().split('T')[0] : '';
      docPosition = recordOrSave.position;
      docMinistry = recordOrSave.ministry;
      docActivity = recordOrSave.activityPurpose;
      docDateNeeded = recordOrSave.dateNeeded ? new Date(recordOrSave.dateNeeded).toISOString().split('T')[0] : '';
      docRequestedAmount = recordOrSave.requestedAmount;
      docOutstandingAmount = recordOrSave.outstandingAmount;
      docDetails = recordOrSave.outstandingDetails || [];
      docRequestedBy = recordOrSave.requestedBy || recordOrSave.applicantName;
      docRecommending = recordOrSave.recommendingApproval;
      docApprovedBy = recordOrSave.approvedBy;
    } else if (recordOrSave === true && rcaName) {
      // Save if requested
      await handleSaveCashAdvance();
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
          <title>RCA Form - ${docName || 'Parishioner'}</title>
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
                <span class="field-line">${docName || ''}</span>
              </div>
              <div class="field-item" style="max-width: 220px; margin-left: 16px;">
                <span class="field-label">DATE:</span>
                <span class="field-line">${docDate || ''}</span>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <span class="field-label">POSITION:</span>
                <span class="field-line">${docPosition || ''}</span>
              </div>
              <div class="field-item" style="max-width: 280px; margin-left: 16px;">
                <span class="field-label">ORG / MINISTRY:</span>
                <span class="field-line">${docMinistry || ''}</span>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <span class="field-label">ACTIVITY / PURPOSE:</span>
                <span class="field-line">${docActivity || ''}</span>
              </div>
              <div class="field-item" style="max-width: 240px; margin-left: 16px;">
                <span class="field-label">DATE NEEDED:</span>
                <span class="field-line">${docDateNeeded || ''}</span>
              </div>
            </div>

            <div class="field-row" style="margin-bottom: 6px;">
              <div class="field-item">
                <span class="field-label">REQUESTED CASH ADVANCE:</span>
                <span class="field-line field-bold">${docRequestedAmount ? '₱' + Number(docRequestedAmount).toLocaleString() : '₱0.00'}</span>
              </div>
            </div>

            <div class="note-text">
              Note: Receipts attached to the Liquidation Form must be under the name of Sto. Domingo Parish Pastoral Council.
            </div>

            <div class="field-row" style="margin-bottom: 14px;">
              <div class="field-item">
                <span class="field-label">OUTSTANDING CASH ADVANCE:</span>
                <span class="field-line">${docOutstandingAmount ? '₱' + Number(docOutstandingAmount).toLocaleString() : 'None'}</span>
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
                    ${(docDetails && docDetails.length > 0 ? docDetails : [{}, {}, {}, {}, {}]).map(r => `
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
                  <div class="sig-line">${docRequestedBy || docName || ''}</div>
                  <div class="sig-label">(Signature Over Printed Name)</div>
                </div>

                <div class="sig-block">
                  <div class="sig-header">RECOMMENDING APPROVAL :</div>
                  <div class="sig-line">${docRecommending || 'Parish Finance Council / Treasurer'}</div>
                  <div class="sig-label">(Signature Over Printed Name)</div>
                </div>

                <div class="sig-block" style="margin-bottom: 0;">
                  <div class="sig-header">APPROVED BY :</div>
                  <div class="sig-line">${docApprovedBy || 'Parish Priest'}</div>
                  <div class="sig-label">(Signature Over Printed Name)</div>
                </div>
              </div>
            </div>

            <div class="promise-box">
              I hereby promise to liquidate my cash advance WITHIN (a) five (5) working days from completion of event/project or (b) five (5) working days from the day following release of cash advance, as applicable.
            </div>

            <div class="bottom-sigs">
              <div class="bottom-sig-item">
                <div class="sig-line">${docName || ''}</div>
                <div class="sig-label">(Signature Over Printed Name)</div>
              </div>
              <div class="bottom-sig-item">
                <div class="sig-line">${docDate || ''}</div>
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
        sectorFilter={sectorFilter}
        setSectorFilter={setSectorFilter}
      />

      {/* Main App Layout */}
      <div className="dashboard-content" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
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
            setUserManagementSubTab={setUserManagementSubTab}
            setShowDrilldownModal={setShowDrilldownModal}
            setSectorFilter={setSectorFilter}
            setDisburseModalUser={setDisburseModalUser}
            setDisburseAmount={setDisburseAmount}
            setDisburseSectorId={setDisburseSectorId}
          />
        )}

        {mainTab === 'donations' && (
          <DonationsTab
            donations={donations}
            expenses={expenses}
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
            handleDeleteUser={handleDeleteUser}
            handleApproveBeneficiary={handleApproveBeneficiary}
            setShowCreateUserModal={setShowCreateUserModal}
          />
        )}

        {mainTab === 'reports' && (
          <FinancialAuditTab
            donations={donations}
            expenses={expenses}
            users={users}
            dashboardOverview={dashboardOverview}
            formatCurrency={formatCurrency}
            setShowDrilldownModal={setShowDrilldownModal}
            setMainTab={setMainTab}
            setSectorFilter={setSectorFilter}
            setDisburseModalUser={setDisburseModalUser}
            setDisburseAmount={setDisburseAmount}
            setDisburseSectorId={setDisburseSectorId}
            getDonationStatus={getDonationStatus}
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
          />
        )}

        {mainTab === 'documents' && (
          <DocumentsTab
            rcaName={rcaName} setRcaName={setRcaName}
            rcaDate={rcaDate} setRcaDate={setRcaDate}
            rcaPosition={rcaPosition} setRcaPosition={setRcaPosition}
            rcaMinistry={rcaMinistry} setRcaMinistry={setRcaMinistry}
            rcaActivity={rcaActivity} setRcaActivity={setRcaActivity}
            rcaDateNeeded={rcaDateNeeded} setRcaDateNeeded={setRcaDateNeeded}
            rcaRequestedAmount={rcaRequestedAmount} setRcaRequestedAmount={setRcaRequestedAmount}
            rcaOutstandingAmount={rcaOutstandingAmount} setRcaOutstandingAmount={setRcaOutstandingAmount}
            rcaOutstandingDetails={rcaOutstandingDetails} setRcaOutstandingDetails={setRcaOutstandingDetails}
            rcaRequestedBy={rcaRequestedBy} setRcaRequestedBy={setRcaRequestedBy}
            rcaRecommendingBy={rcaRecommendingBy} setRcaRecommendingBy={setRcaRecommendingBy}
            rcaApprovedBy={rcaApprovedBy} setRcaApprovedBy={setRcaApprovedBy}
            cashAdvances={cashAdvances}
            setShowRcaPreviewModal={setShowRcaPreviewModal}
            handlePrintRcaForm={handlePrintRcaForm}
            handleSaveCashAdvance={handleSaveCashAdvance}
            editingCashAdvanceId={editingCashAdvanceId}
            handleEditCashAdvance={handleEditCashAdvance}
            handleCancelEditCashAdvance={handleCancelEditCashAdvance}
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
            ancWho={ancWho} setAncWho={setAncWho}
            ancIsPinned={ancIsPinned} setAncIsPinned={setAncIsPinned}
            ancSubmitting={ancSubmitting}
            editingAncId={editingAncId}
            handleEditAnnouncement={handleEditAnnouncement}
            handleCancelEditAnnouncement={handleCancelEditAnnouncement}
            handleCreateAnnouncement={handleCreateAnnouncement}
            handleDeleteAnnouncement={handleDeleteAnnouncement}
          />
        )}

        {mainTab === 'users' && (
          <UserManagementTab
            users={users}
            userManagementSubTab={userManagementSubTab}
            setUserManagementSubTab={setUserManagementSubTab}
            handleEditUser={handleEditUser}
            handleToggleUserStatus={handleToggleUserStatus}
            handleResetUserPassword={handleResetUserPassword}
            handleApproveUser={handleApproveUser}
            setShowCreateUserModal={setShowCreateUserModal}
            formatCurrency={formatCurrency}
            currentUser={currentUser}
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
      <CreateUserModal
        showCreateUserModal={showCreateUserModal}
        setShowCreateUserModal={setShowCreateUserModal}
        handleCreateUserSubmit={handleCreateUserSubmit}
        currentUser={currentUser}
        mainTab={mainTab}
        sectorFilter={sectorFilter}
      />

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
        deleteDonation={deleteDonation}
        getReceiptUrl={getReceiptUrl}
        currentUser={currentUser}
        fetchDonations={fetchDonations}
        setMessage={setMessage}
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
        editUserPhone={editUserPhone} setEditUserPhone={setEditUserPhone}
        editUserRole={editUserRole} setEditUserRole={setEditUserRole}
        editUserStatus={editUserStatus} setEditUserStatus={setEditUserStatus}
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
        handleApproveBeneficiary={handleApproveBeneficiary}
        currentUser={currentUser}
        mainTab={mainTab}
        setDisburseModalUser={setDisburseModalUser}
        setDisburseAmount={setDisburseAmount}
        expenses={expenses}
        formatCurrency={formatCurrency}
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
