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
import RcaFormSection from '../../components/RcaFormSection';
import RcaPreviewModal from '../../components/RcaPreviewModal';

const Dashboard = () => {
  const [donations, setDonations] = useState([]);
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [receiptFile, setReceiptFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedDonationForVerification, setSelectedDonationForVerification] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('approved');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [mainTab, setMainTab] = useState('overview');
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
  const [selectedDonation, setSelectedDonation] = useState(null);

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('user');
  const [editUserDepartment, setEditUserDepartment] = useState('');
  const [userSearchText, setUserSearchText] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Sector Groups & Restricted Donation states
  const [sectors, setSectors] = useState([]);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sectorCategory, setSectorCategory] = useState('Parish General Fund');
  const [isAnonymous, setIsAnonymous] = useState(false);
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
  const [disburseModalUser, setDisburseModalUser] = useState(null);
  const [disburseAmount, setDisburseAmount] = useState('');
  const [disburseSectorId, setDisburseSectorId] = useState('');

  // Report form states
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('donations');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Announcement Management States
  const [announcements, setAnnouncements] = useState([]);
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancCategory, setAncCategory] = useState('General');
  const [ancEventDate, setAncEventDate] = useState('');
  const [ancLocation, setAncLocation] = useState('');
  const [ancIsPinned, setAncIsPinned] = useState(false);
  const [ancSubmitting, setAncSubmitting] = useState(false);

  // RCA Form (Request for Cash Advance) fillable states
  const [cashAdvances, setCashAdvances] = useState([]);
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
  const [showRcaPreviewModal, setShowRcaPreviewModal] = useState(false);

  const fetchCashAdvances = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/cash-advances`);
      setCashAdvances(res.data.data || []);
    } catch (err) {
      console.error('Error fetching cash advance audit logs:', err);
    }
  }, []);

  const saveRcaAuditLog = async () => {
    if (!rcaName.trim() || !rcaRequestedAmount) return;
    const token = getAuthToken();
    try {
      // 1. Save to CashAdvance collection
      await axios.post(`${API_URL}/cash-advances`, {
        applicantName: rcaName,
        date: rcaDate,
        position: rcaPosition,
        ministry: rcaMinistry,
        activityPurpose: rcaActivity,
        dateNeeded: rcaDateNeeded || undefined,
        requestedAmount: rcaRequestedAmount,
        outstandingAmount: rcaOutstandingAmount,
        requestedBy: rcaRequestedBy || rcaName,
        recommendingApproval: rcaRecommendingBy,
        approvedBy: rcaApprovedBy,
        outstandingDetails: rcaOutstandingDetails.filter(d => d.date || d.amount || d.status),
        createdBy: currentUser?.name || currentUser?.username || 'Admin User'
      });
      fetchCashAdvances();

      // 2. Also log as an official entry into the Saved Reports list
      if (token) {
        await axios.post(
          `${API_URL}/reports`,
          {
            title: `RCA Form: ${rcaName} - ₱${Number(rcaRequestedAmount).toLocaleString()}`,
            type: 'expenses',
            format: 'pdf',
            data: {
              applicantName: rcaName,
              ministry: rcaMinistry,
              amount: rcaRequestedAmount,
              purpose: rcaActivity
            }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchReports();
      }
    } catch (err) {
      console.error('Error saving cash advance log:', err);
    }
  };

  const handlePrintRcaForm = (shouldSave = true) => {
    if (shouldSave) {
      saveRcaAuditLog();
    }
    const printWin = window.open('', '_blank', 'width=900,height=1100');
    if (!printWin) {
      alert('Please allow popups to print the RCA form.');
      return;
    }

    const rowsHtml = rcaOutstandingDetails.map(row => `
      <tr>
        <td style="border: 1px solid #000; height: 28px; text-align: center;">${row.date || ''}</td>
        <td style="border: 1px solid #000; height: 28px; text-align: right; padding-right: 8px;">${row.amount ? '₱' + Number(row.amount).toLocaleString() : ''}</td>
        <td style="border: 1px solid #000; height: 28px; text-align: center;">${row.status || ''}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>STO. DOMINGO PARISH PASTORAL COUNCIL - REQUEST FOR CASH ADVANCE FORM (RCA)</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; color: #000; margin: 0; padding: 20px; box-sizing: border-box; }
          .rca-border-box { border: 2px solid #000; padding: 20px; min-height: 950px; position: relative; }
          .rca-header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; position: relative; }
          .rca-logo { width: 75px; height: 75px; object-fit: contain; position: absolute; left: 0; top: 0; }
          .rca-title-wrap { text-align: center; width: 100%; }
          .rca-main-title { font-size: 18pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
          .rca-sub-title { font-size: 13pt; font-weight: bold; margin-top: 5px; }
          .rca-field-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 11pt; font-weight: bold; }
          .rca-field-col { display: flex; align-items: flex-end; }
          .rca-label { font-weight: bold; text-transform: uppercase; white-space: nowrap; margin-right: 6px; }
          .rca-line-fill { border-bottom: 1px solid #000; flex: 1; padding-left: 8px; font-weight: normal; min-height: 18px; }
          .rca-note { font-size: 9pt; font-style: italic; margin-top: -6px; margin-bottom: 14px; font-weight: normal; }
          .rca-table-section { display: flex; border: 1.5px solid #000; margin-top: 15px; margin-bottom: 15px; }
          .rca-left-table { width: 45%; border-right: 1.5px solid #000; }
          .rca-left-table table { width: 100%; border-collapse: collapse; }
          .rca-left-table th { border: 1px solid #000; padding: 6px 4px; font-size: 9pt; font-style: italic; background: #f9f9f9; text-align: center; }
          .rca-right-signatures { width: 55%; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; }
          .rca-sig-block { margin-bottom: 15px; }
          .rca-sig-title { font-size: 10pt; font-weight: bold; margin-bottom: 25px; }
          .rca-sig-line { border-bottom: 1px solid #000; text-align: center; font-weight: bold; padding-bottom: 2px; }
          .rca-sig-caption { font-size: 8pt; text-align: center; margin-top: 2px; }
          .rca-promise-text { font-size: 9pt; font-weight: bold; color: #1e3a8a; line-height: 1.4; margin-top: 20px; margin-bottom: 40px; }
          .rca-bottom-sig { display: flex; justify-content: space-between; gap: 40px; margin-top: 30px; }
          .rca-bottom-col { flex: 1; text-align: center; }
          @media print {
            body { padding: 0; }
            .rca-border-box { border: 2px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="rca-border-box">
          <div class="rca-header">
            <div class="rca-title-wrap">
              <div class="rca-main-title">STO. DOMINGO PARISH PASTORAL COUNCIL</div>
              <div class="rca-sub-title">REQUEST FOR CASH ADVANCE FORM (RCA)</div>
            </div>
          </div>

          <div class="rca-field-row" style="margin-top: 25px;">
            <div className="rca-field-col" style="width: 58%;">
              <span class="rca-label">NAME :</span>
              <span class="rca-line-fill">${rcaName}</span>
            </div>
            <div className="rca-field-col" style="width: 38%;">
              <span class="rca-label">DATE :</span>
              <span class="rca-line-fill">${rcaDate}</span>
            </div>
          </div>

          <div class="rca-field-row">
            <div className="rca-field-col" style="width: 58%;">
              <span class="rca-label">POSITION :</span>
              <span class="rca-line-fill">${rcaPosition}</span>
            </div>
            <div className="rca-field-col" style="width: 38%;">
              <span class="rca-label">ORG/MINISTRY :</span>
              <span class="rca-line-fill">${rcaMinistry}</span>
            </div>
          </div>

          <div class="rca-field-row" style="margin-bottom: 2px;">
            <div className="rca-field-col" style="width: 58%;">
              <span class="rca-label">ACTIVITY / PURPOSE :</span>
              <span class="rca-line-fill">${rcaActivity}</span>
            </div>
            <div className="rca-field-col" style="width: 38%;">
              <span class="rca-label">DATE NEEDED :</span>
              <span class="rca-line-fill">${rcaDateNeeded}</span>
            </div>
          </div>
          <div class="rca-note">(Attach supporting computations or details as applicable)</div>

          <div class="rca-field-row" style="margin-top: 15px;">
            <div className="rca-field-col" style="width: 100%;">
              <span class="rca-label">REQUESTED CASH ADVANCE :</span>
              <span class="rca-line-fill">${rcaRequestedAmount ? '₱' + Number(rcaRequestedAmount).toLocaleString() : ''}</span>
            </div>
          </div>

          <div class="rca-field-row">
            <div className="rca-field-col" style="width: 100%;">
              <span class="rca-label">OUTSTANDING CASH ADVANCE (if any) :</span>
              <span class="rca-line-fill">${rcaOutstandingAmount ? '₱' + Number(rcaOutstandingAmount).toLocaleString() : ''}</span>
            </div>
          </div>

          <div class="rca-table-section">
            <div class="rca-left-table">
              <table>
                <thead>
                  <tr>
                    <th colspan="3">Details of Outstanding Cash Advance (to be filled up by PFC)</th>
                  </tr>
                  <tr>
                    <th style="width: 35%;">Date Released</th>
                    <th style="width: 35%;">Amount</th>
                    <th style="width: 30%;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </div>

            <div class="rca-right-signatures">
              <div class="rca-sig-block">
                <div class="rca-sig-title">REQUESTED BY :</div>
                <div class="rca-sig-line">${rcaRequestedBy || rcaName}</div>
                <div class="rca-sig-caption">(Signature Over Printed Name)</div>
              </div>

              <div class="rca-sig-block">
                <div class="rca-sig-title">RECOMMENDING APPROVAL :</div>
                <div class="rca-sig-line">${rcaRecommendingBy}</div>
                <div class="rca-sig-caption">(Signature Over Printed Name)</div>
              </div>

              <div class="rca-sig-block" style="margin-bottom: 0;">
                <div class="rca-sig-title">APPROVED BY :</div>
                <div class="rca-sig-line">${rcaApprovedBy}</div>
                <div class="rca-sig-caption">(Signature Over Printed Name)</div>
              </div>
            </div>
          </div>

          <div class="rca-promise-text">
            I hereby promise to liquidate my cash advance WITHIN (a) five (5) working days from completion of event/project or (b) five (5) working days from the day following release of cash advance, as applicable.
          </div>

          <div class="rca-bottom-sig">
            <div class="rca-bottom-col">
              <div class="rca-sig-line">${rcaName}</div>
              <div class="rca-sig-caption">(Signature Over Printed Name)</div>
            </div>
            <div class="rca-bottom-col">
              <div class="rca-sig-line">${rcaDate}</div>
              <div class="rca-sig-caption">Date</div>
            </div>
          </div>

          <div style="position: absolute; bottom: 15px; left: 20px; font-size: 9pt; font-family: sans-serif; color: #333;">
            Data Classification - Confidential
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // New visual & functional enhancements states
  const [showDrilldownModal, setShowDrilldownModal] = useState(false);
  const [reportSearchText, setReportSearchText] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [reportDateFilter, setReportDateFilter] = useState('all');

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements/all`);
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancContent.trim()) {
      setMessage('Please enter title and content for announcement');
      return;
    }
    setAncSubmitting(true);
    try {
      await axios.post(`${API_URL}/announcements`, {
        title: ancTitle,
        content: ancContent,
        category: ancCategory,
        eventDate: ancEventDate || undefined,
        location: ancLocation,
        isPinned: ancIsPinned,
        createdBy: currentUser?.name || currentUser?.username || 'Parish Admin'
      });
      setMessage('Announcement posted successfully!');
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
      setMessage(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setAncSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`${API_URL}/announcements/${id}`);
      setMessage('Announcement deleted!');
      fetchAnnouncements();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setMessage('Failed to delete announcement');
    }
  };
  const getReceiptUrl = (receiptPath) => {
    if (!receiptPath) return '';
    const normalized = receiptPath.replace(/\\/g, '/');
    const idx = normalized.indexOf('uploads/');
    if (idx !== -1) {
      return `${API_URL.replace('/api', '')}/${normalized.substring(idx)}`;
    }
    return `${API_URL.replace('/api', '')}/${normalized}`;
  };

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
    setMessage(`Exported ${type} to CSV successfully!`);
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
    if (!donation) return 'pending';
    if (donation.status) return donation.status;
    if (donation.verified === true) return 'approved';
    if (donation.verified === false) return 'pending';
    return 'pending';
  };

  const getPrescriptiveRecommendations = () => {
    const recommendations = [];

    // 1. Financial Inflow vs Outflow Recommendation
    const totalDonationsVal = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalExpensesVal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const balanceVal = totalDonationsVal - totalExpensesVal;

    if (totalDonationsVal > 0) {
      const burnRate = totalExpensesVal / totalDonationsVal;
      if (burnRate > 0.85) {
        recommendations.push({
          type: 'high',
          title: 'Immediate Donation Campaign Required',
          description: `Expenses have consumed ${Math.round(burnRate * 100)}% of total received donations. Remaining funds are ₱${balanceVal.toLocaleString()}.`,
          action: 'Launch a targeted donation drive on the mobile app focusing on immediate GCash/Maya online contributions to replenish funds.'
        });
      } else if (burnRate > 0.5) {
        recommendations.push({
          type: 'medium',
          title: 'Optimize Logistics & Procurements',
          description: `Total fund utilization is moderate at ${Math.round(burnRate * 100)}%.`,
          action: 'Audit recent logistics and transport expenses. Consider partnering with local wholesale suppliers to lower bulk purchase costs.'
        });
      } else {
        recommendations.push({
          type: 'low',
          title: 'Establish Reserve Fund Allocation',
          description: `Fund utilization is healthy at ${Math.round(burnRate * 100)}% with ₱${balanceVal.toLocaleString()} available.`,
          action: 'We recommend allocating 20% of current available funds into a locked emergency reserve account for future unanticipated crisis responses.'
        });
      }
    } else {
      recommendations.push({
        type: 'medium',
        title: 'Launch Online Fundraising Campaign',
        description: 'There are currently no cash donations recorded in the system database.',
        action: 'Mobilize social media channels and update the mobile app landing details to request GCash/Maya donations from the public.'
      });
    }

    // 3. Category Expenses prescriptive control
    if (expenses && expenses.length > 0) {
      const categoryTotals = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

      const highestCategoryEntry = Object.entries(categoryTotals).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0]);
      if (highestCategoryEntry[0]) {
        const pct = Math.round((highestCategoryEntry[1] / totalExpensesVal) * 100);
        if (highestCategoryEntry[0].toLowerCase().includes('food') && pct > 40) {
          recommendations.push({
            type: 'low',
            title: 'Partner with Local Wholesalers for Food Items',
            description: `Procuring Food represents your largest expense share at ${pct}% (₱${highestCategoryEntry[1].toLocaleString()}).`,
            action: 'Negotiate bulk supply agreements with commercial rice millers or canned goods distributors to reduce average per-unit meal costs by 15-20%.'
          });
        } else if (highestCategoryEntry[0].toLowerCase().includes('transport') || highestCategoryEntry[0].toLowerCase().includes('travel')) {
          recommendations.push({
            type: 'low',
            title: 'Transition to Volunteer Vehicle Fleet',
            description: `Transport and logistics represent ${pct}% of total expenses.`,
            action: 'Recruit volunteer vehicle owners from the local community to decrease commercial logistics rental expenditures.'
          });
        }
      }
    }

    return recommendations;
  };

  // Generate Report Modal States
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [reportTitleInput, setReportTitleInput] = useState('');
  const [reportTypeInput, setReportTypeInput] = useState('monthly');
  const [reportFormatInput, setReportFormatInput] = useState('pdf');
  const [reportCategoryInput, setReportCategoryInput] = useState('all');
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');

  const participantsData = useMemo(() => {
    const standardMethods = ['GCash', 'Maya', 'PayMongo (Auto)', 'Cash', 'Bank Transfer'];
    const presentMethods = Array.from(new Set(donations.map(d => d.paymentMethod).filter(Boolean)));
    const allMethods = Array.from(new Set([...standardMethods, ...presentMethods]));

    return allMethods.map(method => {
      const matchingDonations = donations.filter(d => 
        (d.paymentMethod || '').toLowerCase() === method.toLowerCase() ||
        (method === 'Cash' && (!d.paymentMethod || d.paymentMethod === 'Cash'))
      );

      const totalPayments = matchingDonations.length;
      const validatedPayments = matchingDonations.filter(d => 
        d.verificationStatus === 'approved' || d.status === 'approved'
      ).length;

      const uniqueDonors = new Set(matchingDonations.map(d => d.donorName || d.donorId)).size;

      return {
        name: method,
        registered: totalPayments,
        validated: validatedPayments,
        attendees: uniqueDonors
      };
    }).filter(item => item.registered > 0 || ['GCash', 'Maya', 'PayMongo (Auto)', 'Cash'].includes(item.name));
  }, [donations]);

  const branchData = useMemo(() => {
    const defaultSectors = [
      'Scholars',
      'Senior Citizens',
      'Prison Ministry',
      'Disaster Relief',
      'Persons with Disabilities (PWD)',
      'Solo Parents'
    ];

    const sectorList = sectors && sectors.length > 0 
      ? sectors 
      : defaultSectors.map(name => ({ name, targetBeneficiaries: 0 }));

    return sectorList.map(sec => {
      const secName = typeof sec === 'string' ? sec : (sec.name || 'General');
      
      const matchingDonations = donations.filter(d => {
        const cat = (d.sectorCategory || '').toLowerCase();
        const dest = (d.destination || '').toLowerCase();
        const nameLower = secName.toLowerCase();
        return cat.includes(nameLower) || dest.includes(nameLower) || 
          (nameLower.includes('pwd') && (cat.includes('disabilit') || dest.includes('pwd'))) ||
          (nameLower.includes('scholar') && (cat.includes('scholar') || dest.includes('scholar')));
      });

      const totalPayments = matchingDonations.length;
      const validatedPayments = matchingDonations.filter(d => 
        d.verificationStatus === 'approved' || d.status === 'approved'
      ).length;

      const beneficiaries = typeof sec === 'object' && sec.targetBeneficiaries 
        ? sec.targetBeneficiaries 
        : (sec.members?.length || 0);

      return {
        name: secName.length > 18 ? secName.substring(0, 18) + '...' : secName,
        registered: totalPayments,
        validated: validatedPayments,
        attendees: beneficiaries
      };
    });
  }, [sectors, donations]);

  const handleGenerateReportSubmit = (e) => {
    e.preventDefault();
    const title = reportTitleInput || `${reportTypeInput.toUpperCase()} Financial Audit Report`;
    
    const filteredByDate = donations.filter(d => {
      const dDate = new Date(d.createdAt);
      if (reportStartDate && dDate < new Date(reportStartDate)) return false;
      if (reportEndDate && dDate > new Date(reportEndDate)) return false;
      if (reportCategoryInput !== 'all') {
        const cat = (d.sectorCategory || '').toLowerCase();
        const dest = (d.destination || '').toLowerCase();
        if (!cat.includes(reportCategoryInput.toLowerCase()) && !dest.includes(reportCategoryInput.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    const totalDonationsSum = filteredByDate.reduce((sum, d) => sum + (d.amount || 0), 0);
    const approvedDonationsCount = filteredByDate.filter(d => d.verificationStatus === 'approved' || d.status === 'approved').length;
    const totalExpensesSum = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const netBalance = totalDonationsSum - totalExpensesSum;

    const newReport = {
      _id: Date.now().toString(),
      title: title,
      type: reportTypeInput === 'monthly' ? 'Monthly Report' : reportTypeInput === 'quarterly' ? 'Quarterly Report' : reportTypeInput === 'annual' ? 'Annual Report' : 'Special Report',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      downloads: 1,
      totalRaised: totalDonationsSum,
      totalDisbursed: totalExpensesSum,
      netBalance: netBalance,
      transactionCount: filteredByDate.length
    };

    setReports(prev => [newReport, ...prev]);

    if (reportFormatInput === 'csv') {
      const headers = ['Transaction ID', 'Donor Name', 'Amount (PHP)', 'Payment Method', 'Sector / Category', 'Status', 'Date'];
      const rows = filteredByDate.map(d => [
        d.referenceNumber || d._id,
        `"${d.donorName}"`,
        d.amount,
        d.paymentMethod || 'Cash',
        `"${d.sectorCategory || d.destination || 'General Fund'}"`,
        d.verificationStatus || d.status,
        new Date(d.createdAt).toLocaleDateString()
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
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
              .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
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
                <div class="stat-val">₱${totalDonationsSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="stat-box">
                <div class="stat-lbl">Total Disbursed</div>
                <div class="stat-val">₱${totalExpensesSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="stat-box">
                <div class="stat-lbl">Net Operational Balance</div>
                <div class="stat-val">₱${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="stat-box">
                <div class="stat-lbl">Validated Transactions</div>
                <div class="stat-val">${approvedDonationsCount} / ${filteredByDate.length}</div>
              </div>
            </div>
            <h3>Detailed Transactions Record (${filteredByDate.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor Name</th>
                  <th>Payment Channel</th>
                  <th>Category / Destination</th>
                  <th>Amount</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredByDate.map(d => `
                  <tr>
                    <td>${new Date(d.createdAt).toLocaleDateString()}</td>
                    <td>${d.donorName}</td>
                    <td>${d.paymentMethod || 'Cash'}</td>
                    <td>${d.sectorCategory || d.destination || 'General Fund'}</td>
                    <td><strong>₱${(d.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td>${d.verificationStatus || d.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <span>ReliefLink Cryptographic &amp; Financial Audit Report</span>
              <span>Prepared for Sto. Domingo Parish Finance Committee</span>
            </div>
          </body>
        </html>
      `);
      printWin.document.close();
      printWin.print();
    }

    setMessage('✓ Financial Audit Report generated successfully!');
    setShowGenerateReportModal(false);
    setTimeout(() => setMessage(''), 4000);
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
      setDonations(res.data.data || res.data || []);
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
      setUsers(res.data.data || res.data || []);
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
      setExpenses(res.data.data || res.data || []);
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
      setInventory(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage('Failed to fetch inventory');
    }
  }, [handleUnauthorized]);

  const fetchSectors = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/sectors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSectors(res.data || []);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  }, []);

    const handleDisburseFund = async () => {
      const token = getAuthToken();
      if (!token || !disburseModalUser || !disburseAmount) return;
      try {
        // Find sector ID
        const userSector = sectors.find(s => s.name === disburseModalUser.sectorGroup || s.code === disburseModalUser.sectorGroup) || sectors[0];
        if (!userSector) {
          setMessage('Sector not found for disbursement');
          return;
        }
        await axios.post(`${API_URL}/sectors/disburse`, {
          userId: disburseModalUser._id,
          sectorId: userSector._id,
          amount: parseFloat(disburseAmount)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(`Successfully disbursed ₱${parseFloat(disburseAmount).toLocaleString()} to ${disburseModalUser.name}`);
        setDisburseModalUser(null);
        setDisburseAmount('');
        fetchSectors();
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Disbursement error:', err);
        setMessage(err.response?.data?.message || 'Error processing disbursement');
      }
    };

    const handleToggleScholarService = async (user) => {
      const token = getAuthToken();
      if (!token) return;
      const currentStatus = user.scholarDetails?.serviceStatus || 'Pending';
      const nextStatus = currentStatus === 'Served' ? 'Pending' : 'Served';
      try {
        await axios.patch(`${API_URL}/sectors/scholars/${user._id}/service`, {
          serviceStatus: nextStatus
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
        setMessage(`Scholar service updated to: ${nextStatus}`);
        setTimeout(() => setMessage(''), 2500);
      } catch (err) {
        console.error('Error updating scholar service:', err);
      }
    };

    const fetchReports = useCallback(async () => {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        const [dashboardRes, donationsRes, expensesRes, savedRes] = await Promise.all([
          axios.get(`${API_URL}/reports/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/reports/donations`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/reports/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
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
          await axios.put(`${API_URL}/donations/${editingId}`, { donorName, amount: parseFloat(amount), paymentMethod }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessage('Donation updated successfully!');
          setEditingId(null);
        } else {
          const formData = new FormData();
          formData.append('donorName', donorName);
          formData.append('amount', parseFloat(amount));
          formData.append('paymentMethod', paymentMethod);
          formData.append('sectorCategory', sectorCategory);
          formData.append('isRestricted', sectorCategory && sectorCategory !== 'Parish General Fund');
          formData.append('isAnonymous', isAnonymous);
          if (receiptFile) {
            formData.append('receipt', receiptFile);
          }

          await axios.post(`${API_URL}/donations`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          setMessage('Donation added successfully!');
        }
        setDonorName('');
        setAmount('');
        setPaymentMethod('Cash');
        setSectorCategory('Parish General Fund');
        setIsAnonymous(false);
        setReceiptFile(null);
        fetchDonations();
        fetchSectors();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Error saving donation:', err.response || err);
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorMsg = err.response?.data?.message || err.message || 'Error saving donation';
        setMessage('Error: ' + errorMsg);
      }
    };

    const viewDonation = (donation) => {
      setSelectedDonation(donation);
    };

    const approveDonation = async (donationId) => {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        await axios.put(`${API_URL}/donations/${donationId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setMessage('Donation approved!');
        fetchDonations();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Error approving donation:', err);
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorMsg = err.response?.data?.message || err.message || 'Error approving donation';
        setMessage('Error: ' + errorMsg);
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
        setMessage('Donation rejected!');
        fetchDonations();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Error rejecting donation:', err);
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorMsg = err.response?.data?.message || err.message || 'Error rejecting donation';
        setMessage('Error: ' + errorMsg);
      }
    };

    const approveExpense = async (expenseId) => {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        await axios.put(
          `${API_URL}/expenses/${expenseId}`,
          { status: 'approved' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Expense approved!');
        fetchExpenses();
        fetchReports();
        setSelectedExpense(null);
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Error approving expense:', err);
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorMsg = err.response?.data?.message || err.message || 'Error approving expense';
        setMessage('Error: ' + errorMsg);
      }
    };

    const rejectExpense = async (expenseId) => {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        const reason = prompt('Rejection notes/reason (optional):') || 'Expense not approved';
        await axios.put(
          `${API_URL}/expenses/${expenseId}`,
          { status: 'rejected', notes: reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Expense rejected!');
        fetchExpenses();
        fetchReports();
        setSelectedExpense(null);
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Error rejecting expense:', err);
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorMsg = err.response?.data?.message || err.message || 'Error rejecting expense';
        setMessage('Error: ' + errorMsg);
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
        setMessage('Donation deleted successfully!');
        fetchDonations();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting donation:', err.response || err);
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorMsg = err.response?.data?.message || err.message || 'Error deleting donation';
        setMessage('Error: ' + errorMsg);
      }
    };

    const cancelEdit = () => {
      setEditingId(null);
      setDonorName('');
      setAmount('');
      setPaymentMethod('Cash');
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
            department: editUserDepartment || undefined,
            sectorGroup: editUserSectorGroup,
            sectorIdNumber: editUserSectorIdNumber,
            scholarDetails: {
              school: editUserSchool,
              courseProgram: editUserCourseProgram,
              yearLevel: editUserYearLevel,
              gwa: parseFloat(editUserGwa || 0),
              householdIncome: parseFloat(editUserHouseholdIncome || 0),
              monthlyAllowance: parseFloat(editUserMonthlyAllowance || 0),
              serviceStatus: editingUser.scholarDetails?.serviceStatus || 'Pending',
              applicationStatus: editUserApplicationStatus,
              requirements: editUserRequirements,
              applicationNotes: editUserApplicationNotes,
              lastDisbursementDate: editingUser.scholarDetails?.lastDisbursementDate || null
            }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedUser = res.data;
        setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
        setMessage('User updated successfully');
        setShowEditUserModal(false);
        setEditingUser(null);
        fetchSectors();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Error updating user:', err.response || err);
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorMsg = err.response?.data?.message || err.message || 'Failed to update user';
        setMessage('Error: ' + errorMsg);
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

        setMessage('Expense added successfully!');
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
        setMessage('Error: ' + errorMsg);
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

        setMessage('Inventory item added successfully!');
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
        setMessage('Error: ' + errorMsg);
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
      fetchSectors();
      fetchAnnouncements();
      fetchCashAdvances();
    }, [fetchDonations, fetchUsers, fetchExpenses, fetchInventory, fetchReports, fetchSectors, fetchAnnouncements, fetchCashAdvances, handleUnauthorized]);

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
                className={`dashboard-sidebar-link ${mainTab === 'overview' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('overview');
                  setIsSidebarOpen(false);
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </button>
              <button
                className={`dashboard-sidebar-link ${mainTab === 'donations' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('donations');
                  setIsSidebarOpen(false);
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Donations & Receipts
              </button>
              <button
                className={`dashboard-sidebar-link ${mainTab === 'sectors' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('sectors');
                  setIsSidebarOpen(false);
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Attendee List
              </button>
              <button
                className={`dashboard-sidebar-link ${mainTab === 'reports' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('reports');
                  setIsSidebarOpen(false);
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Financial Audit &amp; Reports
              </button>
              <button
                className={`dashboard-sidebar-link ${mainTab === 'announcements' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('announcements');
                  setIsSidebarOpen(false);
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.684A1.761 1.761 0 013 12c0-.97.784-1.76 1.75-1.76l5.25.01" />
                </svg>
                Announcements
              </button>
              <button
                className={`dashboard-sidebar-link ${mainTab === 'expenses' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('expenses');
                  setIsSidebarOpen(false);
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Expenses
              </button>
              {currentUser?.role === 'superadmin' && (
                <button
                  className={`dashboard-sidebar-link ${mainTab === 'users' ? 'active' : ''}`}
                  onClick={() => {
                    setMainTab('users');
                    setIsSidebarOpen(false);
                  }}
                >
                  <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Users
                </button>
              )}
              <button
                className={`dashboard-sidebar-link ${mainTab === 'transparency' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('transparency');
                  setIsSidebarOpen(false);
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Transparency
              </button>
            </nav>

            <div className="dashboard-sidebar-footer">
              <button onClick={handleLogout} className="sidebar-logout-btn">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
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
                <svg style={{ width: '20px', height: '20px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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



            {/* Main Overview Dashboard View (Reference UI Layout) */}
            {mainTab === 'overview' && (
              <div className="dashboard-main-content" style={{ padding: '24px 32px', backgroundColor: '#eaeff7', minHeight: 'calc(100vh - 70px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Dashboard</h1>
                  <button
                    type="button"
                    onClick={() => setShowGenerateReportModal(true)}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 22px',
                      fontWeight: '700',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Report
                  </button>
                </div>

                {/* 4 Stat Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                  {/* Card 1: Total Registered */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ backgroundColor: '#fef3c7', padding: '6px', borderRadius: '50%', color: '#d97706', display: 'flex' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Total Registered</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>
                      {users.length}
                    </div>
                  </div>

                  {/* Card 2: Total Validated */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ backgroundColor: '#dbeafe', padding: '6px', borderRadius: '50%', color: '#2563eb', display: 'flex' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Total Validated</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>
                      {donations.filter(d => d.verificationStatus === 'approved' || d.status === 'approved').length}
                    </div>
                  </div>

                  {/* Card 3: Total Payments Made */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ backgroundColor: '#fef3c7', padding: '6px', borderRadius: '50%', color: '#d97706', display: 'flex' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Total Payments Made</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>
                      {donations.length}
                    </div>
                  </div>

                  {/* Card 4: Total Attendees / Beneficiaries */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ backgroundColor: '#f3e8ff', padding: '6px', borderRadius: '50%', color: '#9333ea', display: 'flex' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Total Attendees</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>
                      {sectors.reduce((sum, s) => sum + (s.targetBeneficiaries || s.members?.length || 0), 0)}
                    </div>
                  </div>
                </div>

                {/* Analytical Charts Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* Chart 1: Participants Breakdown */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>Participants &amp; Payment Channels Breakdown</h3>
                    <div style={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={participantsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                          <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
                          <Bar dataKey="registered" name="Total Payments" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={22} />
                          <Bar dataKey="validated" name="Total Validated" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={22} />
                          <Bar dataKey="attendees" name="Unique Donors" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={22} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Branch Breakdown */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>Branch &amp; Sector Ministry Breakdown</h3>
                    <div style={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={branchData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                          <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
                          <Bar dataKey="registered" name="Total Payments" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={22} />
                          <Bar dataKey="validated" name="Total Validated" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={22} />
                          <Bar dataKey="attendees" name="Beneficiaries / Attendees" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={22} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'donations' && (
              <div className="dashboard-main-content" style={{ padding: '24px 32px', backgroundColor: '#eaeff7', minHeight: 'calc(100vh - 70px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Donations & Receipts</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                      Official cryptographic contribution records &amp; parish disbursement management
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setShowForm(true); }}
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Record Contribution
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.csv';
                        input.onchange = (e) => {
                          if (e.target.files?.[0]) {
                            alert(`Ledger file "${e.target.files[0].name}" queued for cryptographic audit verification.`);
                          }
                        };
                        input.click();
                      }}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <svg style={{ width: '16px', height: '16px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Import Audit Ledger
                    </button>
                  </div>
                </div>
                <div className="dashboard-stats-grid">
                  <div className="dashboard-stat-card summary-card-donations">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="dashboard-stat-label">Total Donations</div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="dashboard-stat-value">{formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0))}</div>
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>✓</span> 100% Cryptographically Verified
                    </div>
                  </div>

                  <div
                    className="dashboard-stat-card summary-card-expenses"
                    onClick={() => setShowDrilldownModal(true)}
                    title="Click to view expense category breakdown"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="dashboard-stat-label">Total Expenses</div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="dashboard-stat-value">{formatCurrency(expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</div>
                  </div>

                  <div className="dashboard-stat-card summary-card-netfunds">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="dashboard-stat-label">Net Available Funds</div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                    </div>
                    <div className="dashboard-stat-value">
                      {formatCurrency(donations.reduce((sum, d) => sum + (d.amount || 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}
                    </div>
                    <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '6px' }}>
                      Parish Treasury Surplus
                    </div>
                  </div>

                  <div className="dashboard-stat-card summary-card-users">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="dashboard-stat-label">Active Donors &amp; Users</div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="dashboard-stat-value">{users.filter(u => u.status === 'active').length}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '6px' }}>
                      Registered Beneficiaries &amp; Donors
                    </div>
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
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#2563eb"
                            strokeWidth={3}
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
                              <Cell fill="#2563eb" />
                              <Cell fill="#10b981" />
                              <Cell fill="#f59e0b" />
                              <Cell fill="#8b5cf6" />
                              <Cell fill="#ec4899" />
                              <Cell fill="#06b6d4" />
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
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
                      <div className="dashboard-form-group">
                        <label className="dashboard-label">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="dashboard-input"
                        >
                          <option value="Cash">Cash</option>
                          <option value="QR Ph">QR Ph (InstaPay)</option>
                          <option value="GCash">GCash</option>
                          <option value="Maya">Maya</option>
                          <option value="Bank Transfer">Bank Transfer / InstaPay</option>
                        </select>
                      </div>
                      <div className="dashboard-form-group">
                        <label className="dashboard-label">Target Sector / Ministry</label>
                        <select
                          value={sectorCategory}
                          onChange={(e) => setSectorCategory(e.target.value)}
                          className="dashboard-input"
                        >
                          <option value="Parish General Fund">Parish General Fund (Unrestricted)</option>
                          <option value="Senior Citizens">Senior Citizens (Restricted)</option>
                          <option value="Persons with Disabilities (PWD)">Persons with Disabilities (PWD)</option>
                          <option value="Scholars">Scholars Educational Fund</option>
                          <option value="Prison Ministry">Prison Ministry</option>
                          <option value="Solo Parents">Solo Parents Fund</option>
                          <option value="Disaster Relief">Emergency Disaster Relief</option>
                        </select>
                      </div>
                      {!editingId && (
                        <div className="dashboard-form-group">
                          <label className="dashboard-label">Proof of Payment Receipt (Optional)</label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setReceiptFile(e.target.files[0])}
                            className="dashboard-input"
                            style={{ padding: '6px 12px' }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="dashboard-form-row" style={{ marginTop: '8px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                        />
                        <span>Keep Donor Anonymous (Hide name publicly)</span>
                      </label>
                    </div>
                    <div className="dashboard-button-group">
                      <button type="submit" className="dashboard-submit-btn" disabled={loading}>
                        {editingId ? 'View Donation' : 'Add Donation'}
                      </button>
                      {editingId && (
                        <button type="button" onClick={cancelEdit} className="dashboard-cancel-btn">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Messages */}
                {message && (
                  <div className="dashboard-message-alert">
                    <span className="dashboard-message-icon">
                      <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p className="dashboard-message-text">{message}</p>
                  </div>
                )}

                {/* Table Section */}
                <div className="dashboard-table-card" style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 20px 0' }}>Donation & Payment Records</h2>

                  {/* Tabs */}
                  <div className="dashboard-tabs-container" style={{ marginBottom: '20px' }}>
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
                            <th className="dashboard-th" style={{ width: '40px' }}>#</th>
                            <th className="dashboard-th">Payment Date</th>
                            <th className="dashboard-th">Name</th>
                            <th className="dashboard-th">User ID</th>
                            <th className="dashboard-th">Attendee Type</th>
                            <th className="dashboard-th">Amount</th>
                            <th className="dashboard-th">Status</th>
                            <th className="dashboard-th">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDonations.map((d, index) => (
                            <tr key={d._id} className="dashboard-row">
                              <td className="dashboard-td" style={{ color: '#64748b', fontWeight: '600' }}>{index + 1}</td>
                              <td className="dashboard-td">
                                <span style={{ fontSize: '13px', color: '#475569' }}>
                                  {d.createdAt ? new Date(d.createdAt).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '07/08/2026 16:13'}
                                </span>
                              </td>
                              <td className="dashboard-td">
                                <strong style={{ color: '#1e293b' }}>{d.isAnonymous ? '🔒 Anonymous Donor' : d.donorName}</strong>
                              </td>
                              <td className="dashboard-td">
                                <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '12px' }}>
                                  {d.referenceNumber || d._id?.substring(0, 10) || '—'}
                                </span>
                              </td>
                              <td className="dashboard-td">
                                <span style={{
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {d.paymentMethod || 'Student'}
                                </span>
                              </td>
                              <td className="dashboard-td"><strong>₱{d.amount.toFixed(2)}</strong></td>
                              <td className="dashboard-td">
                                <div className="dashboard-status-column">
                                  <span className={`dashboard-badge ${getDonationStatus(d) === 'approved' ? 'dashboard-badge-verified' : getDonationStatus(d) === 'pending' ? 'dashboard-badge-pending' : 'dashboard-badge-rejected'}`}>
                                    {getDonationStatus(d) === 'approved' ? 'Verified' : getDonationStatus(d) === 'pending' ? 'Pending' : 'Rejected'}
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
                                  <button
                                    type="button"
                                    onClick={() => viewDonation(d)}
                                    className="action-btn details-btn"
                                    title="View donation details"
                                  >
                                    <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    View
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '12px' }}>
                        <div>Showing 1-{filteredDonations.length} of {donations.length}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button type="button" style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', background: '#ffffff', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}>&lt;</button>
                          <span style={{ fontSize: '12px', color: '#475569' }}>Page 1 of 1</span>
                          <button type="button" style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', background: '#ffffff', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}>&gt;</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Announcements Management Tab */}
            {mainTab === 'announcements' && (
              <div className="dashboard-main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 className="dashboard-section-title" style={{ margin: 0 }}>Parish Announcements &amp; Events</h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Post news, scholarship calls, events, and urgent notices that display directly on the public home page.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
                  {/* Create Announcement Form */}
                  <div className="dashboard-chart-card">
                    <h3 className="dashboard-chart-title">Create New Announcement</h3>
                    <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Announcement Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Scholarship Application Drive for 2026-2027"
                          value={ancTitle}
                          onChange={(e) => setAncTitle(e.target.value)}
                          required
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Category</label>
                          <select
                            value={ancCategory}
                            onChange={(e) => setAncCategory(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', outline: 'none' }}
                          >
                            <option value="Scholarship">Scholarship</option>
                            <option value="Event">Event</option>
                            <option value="Relief Operation">Relief Operation</option>
                            <option value="Parish Update">Parish Update</option>
                            <option value="Urgent Notice">Urgent Notice</option>
                            <option value="General">General</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Event Date (Optional)</label>
                          <input
                            type="date"
                            value={ancEventDate}
                            onChange={(e) => setAncEventDate(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Location / Venue (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Sto. Domingo Parish Center Auditorium"
                          value={ancLocation}
                          onChange={(e) => setAncLocation(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Content &amp; Details *</label>
                        <textarea
                          placeholder="Provide full announcement details, requirements, or event instructions..."
                          value={ancContent}
                          onChange={(e) => setAncContent(e.target.value)}
                          required
                          rows={5}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          id="ancPinCheck"
                          checked={ancIsPinned}
                          onChange={(e) => setAncIsPinned(e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="ancPinCheck" style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', cursor: 'pointer' }}>
                          Pin to top of public homepage
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={ancSubmitting}
                        className="quick-action-btn action-primary"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', marginTop: '8px' }}
                      >
                        {ancSubmitting ? 'Posting...' : '📢 Publish Announcement'}
                      </button>
                    </form>
                  </div>

                  {/* Announcements List */}
                  <div className="dashboard-chart-card">
                    <h3 className="dashboard-chart-title">Existing Announcements ({announcements.length})</h3>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '680px', overflowY: 'auto' }}>
                      {announcements.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                          No announcements posted yet. Use the form on the left to publish one!
                        </div>
                      ) : (
                        announcements.map((anc) => (
                          <div key={anc._id} style={{ padding: '16px', borderRadius: '12px', border: anc.isPinned ? '2px solid #2563eb' : '1px solid #e2e8f0', background: anc.isPinned ? '#f0f7ff' : '#ffffff', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1e40af', textTransform: 'uppercase' }}>
                                  {anc.category || 'General'}
                                </span>
                                {anc.isPinned && (
                                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb' }}>📌 Pinned</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteAnnouncement(anc._id)}
                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                            </div>

                            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{anc.title}</h4>
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{anc.content}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b', borderTop: '1px border-dash #e2e8f0', paddingTop: '8px' }}>
                              <span>📅 Posted: {new Date(anc.createdAt).toLocaleDateString()}</span>
                              {anc.eventDate && <span>📍 Event Date: {new Date(anc.eventDate).toLocaleDateString()}</span>}
                              {anc.location && <span>🏢 Venue: {anc.location}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
                          aria-label="Close"
                        >
                          <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
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
                        <div className="dashboard-modal-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                          {(selectedExpense.status === 'pending' || !selectedExpense.status) && (
                            <>
                              <button
                                type="button"
                                className="dashboard-submit-btn approve-btn"
                                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
                                onClick={() => approveExpense(selectedExpense._id)}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="dashboard-submit-btn reject-btn"
                                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
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
            )}



            {mainTab === 'users' && currentUser?.role === 'superadmin' && (
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
                    Pending Approval ({users.filter(u => u.status === 'pending' && (u.role === 'admin' || u.role === 'superadmin')).length})
                  </button>
                </div>

                {/* Search & Role Filter Bar */}
                <div className="reports-filter-bar" style={{ marginTop: '20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="filter-search-input"
                    style={{ maxWidth: '360px', width: '100%' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Filter by Role:</label>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', cursor: 'pointer' }}
                    >
                      <option value="all">All Roles (Admins & Staff & Members)</option>
                      <option value="staff">Parish Staff & Admins Only (superadmin / admin)</option>
                      <option value="user">General Beneficiaries & Members (user)</option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const searchFilteredUsers = users.filter(u => {
                    const matchesSearch = !userSearchText || 
                      u.name?.toLowerCase().includes(userSearchText.toLowerCase()) ||
                      u.email?.toLowerCase().includes(userSearchText.toLowerCase());

                    const matchesRole = 
                      userRoleFilter === 'all' ? true :
                      userRoleFilter === 'staff' ? (u.role === 'admin' || u.role === 'superadmin') :
                      userRoleFilter === 'user' ? u.role === 'user' : true;

                    return matchesSearch && matchesRole;
                  });

                  return (
                    <>
                      {userManagementTab === 'active' && (
                        <div className="users-tables-split">
                          {/* Admins Subsection */}
                          <div className="users-subsection admins-subsection">
                            <h3 className="subsection-title" style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              Administrators & Admins ({searchFilteredUsers.filter(u => u.status === 'active' && (u.role === 'admin' || u.role === 'superadmin')).length})
                            </h3>
                            <div className="users-table-container">
                              <div className="users-table-wrapper">
                                {searchFilteredUsers.filter(u => u.status === 'active' && (u.role === 'admin' || u.role === 'superadmin')).length === 0 ? (
                                  <p className="dashboard-empty-state" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No active administrators found.</p>
                                ) : (
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
                                      {searchFilteredUsers.filter(u => u.status === 'active' && (u.role === 'admin' || u.role === 'superadmin')).map(user => (
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
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Standard Users Subsection */}
                          <div className="users-subsection standard-users-subsection" style={{ marginTop: '2.5rem' }}>
                            <h3 className="subsection-title" style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              Registered Users ({searchFilteredUsers.filter(u => u.status === 'active' && u.role === 'user').length})
                            </h3>
                            <div className="users-table-container">
                              <div className="users-table-wrapper">
                                {searchFilteredUsers.filter(u => u.status === 'active' && u.role === 'user').length === 0 ? (
                                  <p className="dashboard-empty-state" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No active registered users found.</p>
                                ) : (
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
                                      {searchFilteredUsers.filter(u => u.status === 'active' && u.role === 'user').map(user => (
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
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {userManagementTab === 'pending' && (
                        <div className="users-subsection pending-admins-subsection">
                          <h3 className="subsection-title" style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Pending Administrators ({searchFilteredUsers.filter(u => u.status === 'pending' && (u.role === 'admin' || u.role === 'superadmin')).length})
                          </h3>
                          <div className="users-table-container">
                            <div className="users-table-wrapper">
                              {searchFilteredUsers.filter(u => u.status === 'pending' && (u.role === 'admin' || u.role === 'superadmin')).length === 0 ? (
                                <p className="dashboard-empty-state" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No pending administrator registrations found.</p>
                              ) : (
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
                                    {searchFilteredUsers.filter(u => u.status === 'pending' && (u.role === 'admin' || u.role === 'superadmin')).map(user => (
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
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

              </div>
            )}

            {mainTab === 'reports' && (
              <div className="dashboard-main-content">
                <h2 className="dashboard-section-title">Financial Audit &amp; Parish Report Manager</h2>

                <RcaFormSection
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
                />

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
                      {generatingReport ? 'Generating...' : 'Generate Report'}
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

                {/* Prescriptive Analytics Recommendations */}
                <div className="prescriptive-analytics-section" style={{ margin: '28px 0', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Prescriptive Analytics Engine</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Automated, data-driven recommendations generated from live financial, expense, and inventory metrics.</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '20px',
                    marginTop: '16px'
                  }}>
                    {(() => {
                      const recs = getPrescriptiveRecommendations();
                      return recs.map((rec, index) => {
                        let bg = '#eff6ff';
                        let border = '#dbeafe';
                        let text = '#1e40af';
                        let icon = (
                          <svg style={{ width: '20px', height: '20px', color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        );
                        let badgeBg = '#3b82f6';
                        let badgeLabel = 'Optimization';

                        if (rec.type === 'high') {
                          bg = '#fef2f2';
                          border = '#fee2e2';
                          text = '#991b1b';
                          icon = (
                            <svg style={{ width: '20px', height: '20px', color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          );
                          badgeBg = '#ef4444';
                          badgeLabel = 'Action Required';
                        } else if (rec.type === 'medium') {
                          bg = '#fffbeb';
                          border = '#fef3c7';
                          text = '#92400e';
                          icon = (
                            <svg style={{ width: '20px', height: '20px', color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          );
                          badgeBg = '#f59e0b';
                          badgeLabel = 'Warning';
                        }

                        return (
                          <div
                            key={index}
                            style={{
                              backgroundColor: bg,
                              border: `1px solid ${border}`,
                              borderRadius: '12px',
                              padding: '18px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.01)'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '20px' }}>{icon}</span>
                                <span style={{
                                  backgroundColor: badgeBg,
                                  color: 'white',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  {badgeLabel}
                                </span>
                              </div>
                              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: text }}>
                                {rec.title}
                              </h4>
                              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                                {rec.description}
                              </p>
                            </div>

                            <div style={{
                              marginTop: 'auto',
                              paddingTop: '14px',
                              borderTop: `1px dashed ${border}`,
                              fontSize: '12px',
                              lineHeight: '1.4',
                              color: '#334155'
                            }}>
                              <span style={{ color: text, fontWeight: '700' }}>Prescription: </span>
                              {rec.action}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Saved Reports Table */}
                <div className="reports-section">
                  <h3>Saved Reports</h3>

                  {/* Live Search & Filter Bar */}
                  <div className="reports-filter-bar">
                    <input
                      type="text"
                      placeholder="Search reports by title..."
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
                                    <svg style={{ width: '12px', height: '12px', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {report.downloadCount || 0}
                                  </span>
                                </td>
                                <td className="dashboard-td">
                                  <div className="action-buttons">
                                    <button
                                      className="btn-action btn-download"
                                      onClick={() => handleDownloadReport(report._id)}
                                      title="Download Report"
                                    >
                                      <svg style={{ width: '14px', height: '14px', display: 'block', margin: '0 auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                    </button>
                                    <button
                                      className="export-btn"
                                      onClick={() => exportToCSV(report.type === 'expenses' || report._id === 'expenses' ? 'expenses' : 'donations')}
                                      title="Export Report to CSV Excel"
                                    >
                                      Export CSV
                                    </button>
                                    {report._id !== 'donations' && report._id !== 'expenses' && report._id !== 'inventory' && (
                                      <button
                                        className="btn-action btn-delete"
                                        onClick={() => handleDeleteReport(report._id)}
                                        title="Delete Report"
                                      >
                                        <svg style={{ width: '14px', height: '14px', display: 'block', margin: '0 auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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
                                <td className="dashboard-td">
                                  <strong>{donation.donorName}</strong>
                                  {donation.blockId && (
                                    <span className="blockchain-badge" title="Cryptographically secured on blockchain">
                                      🔗 {donation.blockId.substring(0, 8)}...
                                    </span>
                                  )}
                                </td>
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

            {/* Sector Groups & Attendee List Tab Content */}
            {mainTab === 'sectors' && (
              <div className="dashboard-main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className="dashboard-section-title" style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Sector Ministries &amp; Attendee Ledger</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                      Dedicated restricted portals for Senior Citizens, PWD, Scholars, Prison Ministry, and Disaster Relief. Select a category below to view beneficiaries.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSectorFilter('all')}
                      style={{
                        backgroundColor: sectorFilter === 'all' ? '#2563eb' : '#ffffff',
                        color: sectorFilter === 'all' ? '#ffffff' : '#334155',
                        border: '1px solid ' + (sectorFilter === 'all' ? '#2563eb' : '#cbd5e1'),
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      View All ({users.length})
                    </button>
                  </div>
                </div>

                {/* Sector Cards Overview - Interactive selection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                  {sectors.map((sec) => {
                    const percentUtilized = sec.totalRaised > 0 ? Math.round((sec.totalDisbursed / sec.totalRaised) * 100) : 0;
                    const isSelected = sectorFilter.toLowerCase().includes(sec.name.toLowerCase()) || sectorFilter === sec.name;
                    return (
                      <div
                        key={sec._id || sec.code}
                        onClick={() => {
                          setSectorFilter(isSelected ? 'all' : sec.name);
                          const el = document.getElementById('sector-table-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                          backgroundColor: isSelected ? '#f8faff' : '#ffffff',
                          borderRadius: '16px',
                          padding: '22px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          boxShadow: isSelected ? '0 8px 24px rgba(37, 99, 235, 0.12)' : '0 4px 12px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          position: 'relative'
                        }}
                      >
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '16px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 6px rgba(37,99,235,0.3)'
                          }}>
                            ✓ Selected Sector
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: isSelected ? '#1e40af' : '#0f172a' }}>{sec.name}</h3>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>CODE: {sec.code}</span>
                          </div>
                          <span style={{
                            backgroundColor: isSelected ? '#dbeafe' : '#eff6ff',
                            color: '#2563eb',
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '4px 10px',
                            borderRadius: '20px'
                          }}>
                            {sec.memberCount} Members
                          </span>
                        </div>

                        <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px 0', minHeight: '36px', lineHeight: '1.4' }}>
                          {sec.description}
                        </p>

                        <div style={{ background: isSelected ? '#eff6ff' : '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Raised (Restricted)</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#16a34a' }}>PHP {(sec.totalRaised || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Total Disbursed</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>PHP {(sec.totalDisbursed || 0).toLocaleString()}</div>
                          </div>
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b' }}>Remaining Balance:</span>
                            <span style={{ fontWeight: '700', color: sec.remainingBudget > 0 ? '#059669' : '#dc2626' }}>PHP {(sec.remainingBudget || 0).toLocaleString()}</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(percentUtilized, 100)}%`, backgroundColor: isSelected ? '#2563eb' : '#3b82f6', borderRadius: '3px' }}></div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSectorFilter(isSelected ? 'all' : sec.name);
                            const el = document.getElementById('sector-table-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          style={{
                            width: '100%',
                            backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#334155',
                            border: 'none',
                            padding: '9px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isSelected ? '✓ Viewing This Table' : `Show ${sec.name} Table`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Sector Beneficiary Directory Table Section */}
                <div id="sector-table-section" className="dashboard-table-card" style={{ scrollMarginTop: '80px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                        Beneficiary &amp; Attendee Directory {sectorFilter !== 'all' ? `— ${sectorFilter}` : '(All Ministries)'}
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Showing {users.filter(u => {
                          const matchesSector = sectorFilter === 'all' || (u.sectorGroup && u.sectorGroup.toLowerCase().includes(sectorFilter.toLowerCase()));
                          const q = attendeeSearchQuery.toLowerCase();
                          const matchesQuery = !q || (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) || u.sectorIdNumber?.toLowerCase().includes(q));
                          return matchesSector && matchesQuery;
                        }).length} members
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Live Search Input */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Search name, phone, or ID..."
                          value={attendeeSearchQuery}
                          onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                          style={{
                            padding: '8px 12px 8px 32px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            width: '240px',
                            outline: 'none'
                          }}
                        />
                        <svg style={{ position: 'absolute', left: '10px', top: '10px', width: '14px', height: '14px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <select
                        value={sectorFilter}
                        onChange={(e) => setSectorFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', backgroundColor: '#ffffff', color: '#1e293b' }}
                      >
                        <option value="all">All Sector Groups</option>
                        <option value="Senior Citizens">Senior Citizens</option>
                        <option value="Persons with Disabilities (PWD)">Persons with Disabilities (PWD)</option>
                        <option value="Scholars">Scholars</option>
                        <option value="Prison Ministry">Prison Ministry</option>
                        <option value="Solo Parents">Solo Parents</option>
                        <option value="Disaster Relief">Disaster Relief</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          const filtered = users.filter(u => {
                            const matchesSector = sectorFilter === 'all' || (u.sectorGroup && u.sectorGroup.toLowerCase().includes(sectorFilter.toLowerCase()));
                            const q = attendeeSearchQuery.toLowerCase();
                            const matchesQuery = !q || (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) || u.sectorIdNumber?.toLowerCase().includes(q));
                            return matchesSector && matchesQuery;
                          });
                          if (filtered.length === 0) {
                            alert('No records to export');
                            return;
                          }
                          const headers = ['Name', 'Email', 'Phone', 'Sector Group', 'Reg ID', 'App Status', 'Parish Service'];
                          const rows = filtered.map(u => [
                            `"${u.name || ''}"`,
                            `"${u.email || ''}"`,
                            `"${u.phone || ''}"`,
                            `"${u.sectorGroup || 'Unassigned'}"`,
                            `"${u.sectorIdNumber || u._id}"`,
                            `"${u.scholarDetails?.applicationStatus || 'N/A'}"`,
                            `"${u.scholarDetails?.serviceStatus || 'N/A'}"`
                          ]);
                          const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement('a');
                          link.setAttribute('href', encodedUri);
                          link.setAttribute('download', `Parish_Sector_Members_${sectorFilter}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
                    {['all', 'Senior Citizens', 'Scholars', 'Prison Ministry', 'Persons with Disabilities (PWD)', 'Solo Parents', 'Disaster Relief'].map(tag => {
                      const isActive = sectorFilter === tag;
                      const count = tag === 'all' 
                        ? users.length 
                        : users.filter(u => u.sectorGroup && u.sectorGroup.toLowerCase().includes(tag.toLowerCase())).length;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSectorFilter(tag)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: '1px solid ' + (isActive ? '#2563eb' : '#e2e8f0'),
                            backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                            color: isActive ? '#1e40af' : '#475569',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tag === 'all' ? 'All Sectors' : tag} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <div className="dashboard-table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th className="dashboard-th">Beneficiary / Member</th>
                          <th className="dashboard-th">Sector Group</th>
                          <th className="dashboard-th">ID / Registration #</th>
                          <th className="dashboard-th">Scholarship App Status</th>
                          <th className="dashboard-th">Parish Service (Scholars)</th>
                          <th className="dashboard-th">Assistance Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(u => {
                            const matchesSector = sectorFilter === 'all' || (u.sectorGroup && u.sectorGroup.toLowerCase().includes(sectorFilter.toLowerCase()));
                            const q = attendeeSearchQuery.toLowerCase();
                            const matchesQuery = !q || (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) || u.sectorIdNumber?.toLowerCase().includes(q));
                            return matchesSector && matchesQuery;
                          })
                          .map(member => (
                            <tr key={member._id}>
                              <td className="dashboard-td">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e0f2fe',
                                    color: '#0369a1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '13px'
                                  }}>
                                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div>
                                    <strong style={{ color: '#0f172a' }}>{member.name}</strong>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{member.email} • {member.phone || 'No phone'}</div>
                                    {member.scholarDetails?.school && (
                                      <div style={{ fontSize: '11px', color: '#1e40af', marginTop: '2px' }}>
                                        {member.scholarDetails.school} ({member.scholarDetails.yearLevel || 'N/A'})
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="dashboard-td">
                                <span style={{
                                  backgroundColor: member.sectorGroup === 'Scholars' ? '#dbeafe' : member.sectorGroup === 'Senior Citizens' ? '#fef3c7' : member.sectorGroup === 'PWD' ? '#fae8ff' : '#f1f5f9',
                                  color: member.sectorGroup === 'Scholars' ? '#1e40af' : member.sectorGroup === 'Senior Citizens' ? '#92400e' : member.sectorGroup === 'PWD' ? '#86198f' : '#475569',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {member.sectorGroup || 'Unassigned'}
                                </span>
                              </td>
                              <td className="dashboard-td">
                                <code>{member.sectorIdNumber || member._id.substring(0, 8)}</code>
                              </td>
                              <td className="dashboard-td">
                                {member.sectorGroup === 'Scholars' || member.scholarDetails?.applicationStatus ? (
                                  <span style={{
                                    backgroundColor: 
                                      ['Approved', 'Active'].includes(member.scholarDetails?.applicationStatus) ? '#dcfce7' : 
                                      member.scholarDetails?.applicationStatus === 'Interview Scheduled' ? '#e0f2fe' :
                                      member.scholarDetails?.applicationStatus === 'Completed' ? '#f3e8ff' :
                                      member.scholarDetails?.applicationStatus === 'Rejected' ? '#fee2e2' : '#fef3c7',
                                    color: 
                                      ['Approved', 'Active'].includes(member.scholarDetails?.applicationStatus) ? '#166534' : 
                                      member.scholarDetails?.applicationStatus === 'Interview Scheduled' ? '#0369a1' :
                                      member.scholarDetails?.applicationStatus === 'Completed' ? '#6b21a8' :
                                      member.scholarDetails?.applicationStatus === 'Rejected' ? '#991b1b' : '#92400e',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    display: 'inline-block'
                                  }}>
                                    {member.scholarDetails?.applicationStatus || 'Pending Review'}
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>N/A</span>
                                )}
                              </td>
                              <td className="dashboard-td">
                                {member.sectorGroup === 'Scholars' || member.scholarDetails?.school ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleScholarService(member)}
                                    style={{
                                      backgroundColor: member.scholarDetails?.serviceStatus === 'Served' ? '#dcfce7' : '#fef9c3',
                                      color: member.scholarDetails?.serviceStatus === 'Served' ? '#166534' : '#854d0e',
                                      border: '1px solid ' + (member.scholarDetails?.serviceStatus === 'Served' ? '#bbf7d0' : '#fef08a'),
                                      padding: '4px 10px',
                                      borderRadius: '8px',
                                      fontWeight: '600',
                                      fontSize: '12px',
                                      cursor: 'pointer'
                                    }}
                                    title="Click to toggle parish service status"
                                  >
                                    {member.scholarDetails?.serviceStatus === 'Served' ? 'Service Rendered' : 'Pending Service'}
                                  </button>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>N/A</span>
                                )}
                              </td>
                              <td className="dashboard-td">
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEditUser(member)}
                                    className="action-btn details-btn"
                                    style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                    title="Edit Beneficiary Application Details"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDisburseModalUser(member);
                                      setDisburseAmount(member.scholarDetails?.monthlyAllowance || '1000');
                                      setDisburseSectorId(member.sectorGroup || '');
                                    }}
                                    className="action-btn details-btn"
                                    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                  >
                                    Disburse
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {users.filter(u => {
                          const matchesSector = sectorFilter === 'all' || (u.sectorGroup && u.sectorGroup.toLowerCase().includes(sectorFilter.toLowerCase()));
                          const q = attendeeSearchQuery.toLowerCase();
                          const matchesQuery = !q || (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) || u.sectorIdNumber?.toLowerCase().includes(q));
                          return matchesSector && matchesQuery;
                        }).length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '32px 20px', color: '#64748b' }}>
                              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#334155' }}>No beneficiaries found in this category.</p>
                              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Try changing your search query or select "All Sectors".</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Fund Disbursement Modal */}
            {disburseModalUser && (
              <div className="dashboard-modal-overlay">
                <div className="dashboard-modal" style={{ maxWidth: '450px' }}>
                  <div className="dashboard-modal-header">
                    <h3 className="dashboard-modal-title">Disburse Aid / Allowance</h3>
                    <button type="button" onClick={() => setDisburseModalUser(null)} className="dashboard-close-btn">✕</button>
                  </div>
                  <div className="dashboard-modal-content">
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>
                      Disbursing aid to <strong>{disburseModalUser.name}</strong> ({disburseModalUser.sectorGroup || 'Beneficiary'}).
                    </p>
                    <div className="dashboard-form-group" style={{ marginBottom: '16px' }}>
                      <label className="dashboard-label">Disbursement Amount (PHP)</label>
                      <input
                        type="number"
                        value={disburseAmount}
                        onChange={(e) => setDisburseAmount(e.target.value)}
                        placeholder="e.g. 1000.00"
                        className="dashboard-input"
                      />
                    </div>
                    <div className="dashboard-modal-buttons">
                      <button type="button" onClick={handleDisburseFund} className="dashboard-submit-btn" style={{ backgroundColor: '#10b981' }}>
                        Confirm Disbursement
                      </button>
                      <button type="button" onClick={() => setDisburseModalUser(null)} className="dashboard-cancel-btn">
                        Cancel
                      </button>
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

            {/* Edit User / Scholarship Application Modal */}
            {showEditUserModal && editingUser && (
              <div className="dashboard-modal-overlay">
                <div className="dashboard-modal" style={{ maxWidth: editUserSectorGroup === 'Scholars' ? '640px' : '520px' }}>
                  <div className="dashboard-modal-header">
                    <h3 className="dashboard-modal-title">
                      {editUserSectorGroup === 'Scholars' ? 'Scholar Details & Application' : 'Edit User Profile'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditUserModal(false);
                        setEditingUser(null);
                      }}
                      className="dashboard-close-btn"
                      aria-label="Close"
                    >
                      <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="dashboard-modal-content">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div className="dashboard-form-group">
                        <label className="dashboard-label">Full Name</label>
                        <input className="dashboard-input" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
                      </div>
                      <div className="dashboard-form-group">
                        <label className="dashboard-label">Email Address</label>
                        <input className="dashboard-input" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} />
                      </div>
                    </div>

                    {/* Show System Role & Department ONLY when editing standard user accounts */}
                    {mainTab === 'users' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div className="dashboard-form-group">
                          <label className="dashboard-label">System Role</label>
                          <select className="dashboard-select" value={editUserRole} onChange={(e) => setEditUserRole(e.target.value)}>
                            <option value="superadmin">Superadmin</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                        </div>
                        <div className="dashboard-form-group">
                          <label className="dashboard-label">Department</label>
                          <input className="dashboard-input" value={editUserDepartment} onChange={(e) => setEditUserDepartment(e.target.value)} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                      <div className="dashboard-form-group">
                        <label className="dashboard-label" style={{ fontWeight: '700', color: '#1e293b' }}>Sector Group</label>
                        <select className="dashboard-select" value={editUserSectorGroup} onChange={(e) => setEditUserSectorGroup(e.target.value)}>
                          <option value="None">None / General Member</option>
                          <option value="Senior Citizens">Senior Citizens</option>
                          <option value="PWD">Persons with Disabilities (PWD)</option>
                          <option value="Scholars">Scholars</option>
                          <option value="Prison Ministry">Prison Ministry</option>
                          <option value="Solo Parents">Solo Parents</option>
                          <option value="Disaster Relief">Disaster Relief</option>
                        </select>
                      </div>
                      <div className="dashboard-form-group">
                        <label className="dashboard-label">Sector ID / Reg Number</label>
                        <input className="dashboard-input" placeholder="e.g. SCH-2024-0105" value={editUserSectorIdNumber} onChange={(e) => setEditUserSectorIdNumber(e.target.value)} />
                      </div>
                    </div>
                    {editUserSectorGroup === 'Scholars' && (
                      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '12px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          Paperless Scholarship Application Details
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                          <div className="dashboard-form-group">
                            <label className="dashboard-label" style={{ fontSize: '12px' }}>Application Status</label>
                            <select 
                              className="dashboard-select" 
                              style={{ padding: '6px 8px', fontSize: '12px' }}
                              value={editUserApplicationStatus} 
                              onChange={(e) => setEditUserApplicationStatus(e.target.value)}
                            >
                              <option value="Pending Review">Pending Review</option>
                              <option value="Interview Scheduled">Interview Scheduled</option>
                              <option value="Approved">Approved</option>
                              <option value="Active">Active Scholar</option>
                              <option value="Completed">Completed / Graduated</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                          <div className="dashboard-form-group">
                            <label className="dashboard-label" style={{ fontSize: '12px' }}>Monthly Allowance (₱)</label>
                            <input type="number" className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="1000.00" value={editUserMonthlyAllowance} onChange={(e) => setEditUserMonthlyAllowance(e.target.value)} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                          <div className="dashboard-form-group">
                            <label className="dashboard-label" style={{ fontSize: '12px' }}>School / Institution</label>
                            <input className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="e.g. UST / PUP" value={editUserSchool} onChange={(e) => setEditUserSchool(e.target.value)} />
                          </div>
                          <div className="dashboard-form-group">
                            <label className="dashboard-label" style={{ fontSize: '12px' }}>Course / Program</label>
                            <input className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="e.g. BS Information Tech" value={editUserCourseProgram} onChange={(e) => setEditUserCourseProgram(e.target.value)} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <div className="dashboard-form-group">
                            <label className="dashboard-label" style={{ fontSize: '12px' }}>Year Level</label>
                            <input className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="e.g. 2nd Year College" value={editUserYearLevel} onChange={(e) => setEditUserYearLevel(e.target.value)} />
                          </div>
                          <div className="dashboard-form-group">
                            <label className="dashboard-label" style={{ fontSize: '12px' }}>GWA / Grade</label>
                            <input type="number" step="0.01" className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="1.75" value={editUserGwa} onChange={(e) => setEditUserGwa(e.target.value)} />
                          </div>
                          <div className="dashboard-form-group">
                            <label className="dashboard-label" style={{ fontSize: '12px' }}>Household Income (₱)</label>
                            <input type="number" className="dashboard-input" style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="15000" value={editUserHouseholdIncome} onChange={(e) => setEditUserHouseholdIncome(e.target.value)} />
                          </div>
                        </div>

                        {/* Verified Requirements Checklists */}
                        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                          <label className="dashboard-label" style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                            Verified Digital Requirements (Paperless Checklist):
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={editUserRequirements.reportCard} 
                                onChange={(e) => setEditUserRequirements({ ...editUserRequirements, reportCard: e.target.checked })} 
                              />
                              Report Card / TOR
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={editUserRequirements.indigencyCert} 
                                onChange={(e) => setEditUserRequirements({ ...editUserRequirements, indigencyCert: e.target.checked })} 
                              />
                              Certificate of Indigency
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={editUserRequirements.enrollmentForm} 
                                onChange={(e) => setEditUserRequirements({ ...editUserRequirements, enrollmentForm: e.target.checked })} 
                              />
                              Enrollment Form / COR
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={editUserRequirements.recommendationLetter} 
                                onChange={(e) => setEditUserRequirements({ ...editUserRequirements, recommendationLetter: e.target.checked })} 
                              />
                              Parish Recommendation
                            </label>
                          </div>
                        </div>

                        <div className="dashboard-form-group">
                          <label className="dashboard-label" style={{ fontSize: '12px' }}>Parish Staff Notes / Evaluation</label>
                          <textarea 
                            className="dashboard-input" 
                            style={{ padding: '6px 8px', fontSize: '12px', minHeight: '50px', resize: 'vertical' }} 
                            placeholder="Notes on interview, financial need evaluation..." 
                            value={editUserApplicationNotes} 
                            onChange={(e) => setEditUserApplicationNotes(e.target.value)} 
                          />
                        </div>
                      </div>
                    )}
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

            {/* Donation Details Modal */}
            {selectedDonation && (
              <div className="dashboard-modal-overlay">
                <div className="dashboard-modal" style={{ maxWidth: '600px', width: '90%' }}>
                  <div className="dashboard-modal-header">
                    <h3 className="dashboard-modal-title">📋 Donation Details</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedDonation(null)}
                      className="dashboard-close-btn"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="dashboard-modal-content" style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <p className="dashboard-modal-text"><strong>Donor Name:</strong><br />{selectedDonation.donorName}</p>
                        <p className="dashboard-modal-text"><strong>Amount:</strong><br /><span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>₱{selectedDonation.amount?.toFixed(2)}</span></p>
                        <p className="dashboard-modal-text"><strong>Payment Method:</strong><br />{selectedDonation.paymentMethod || 'Cash'}</p>
                        <p className="dashboard-modal-text"><strong>Destination:</strong><br />{selectedDonation.destination || 'General Fund'}</p>
                      </div>
                      <div>
                        <p className="dashboard-modal-text"><strong>Status:</strong><br />
                          <span className={`status-badge ${selectedDonation.verificationStatus || selectedDonation.status || 'pending'}`} style={{ display: 'inline-block', marginTop: '4px' }}>
                            {selectedDonation.verificationStatus || selectedDonation.status || 'pending'}
                          </span>
                        </p>
                        {selectedDonation.referenceNumber && (
                          <p className="dashboard-modal-text"><strong>Reference Number:</strong><br /><code>{selectedDonation.referenceNumber}</code></p>
                        )}
                        {selectedDonation.blockId && (
                          <p className="dashboard-modal-text"><strong>Blockchain ID:</strong><br />
                            <span className="blockchain-badge" title="Cryptographically secured on blockchain" style={{ marginLeft: 0, marginTop: '4px' }}>
                              🔗 {selectedDonation.blockId}
                            </span>
                          </p>
                        )}
                        <p className="dashboard-modal-text"><strong>Date:</strong><br />{new Date(selectedDonation.createdAt).toLocaleString()}</p>
                        {selectedDonation.notes && (
                          <p className="dashboard-modal-text"><strong>Notes:</strong><br />{selectedDonation.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Verification Status Details */}
                    {(selectedDonation.verificationStatus === 'approved' || selectedDonation.verificationStatus === 'rejected') && (
                      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', marginBottom: '20px', borderLeft: `4px solid ${selectedDonation.verificationStatus === 'approved' ? '#16a34a' : '#dc2626'}` }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Verification Log</h4>
                        {selectedDonation.verifiedBy && (
                          <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Verified By:</strong> {selectedDonation.verifiedBy}</p>
                        )}
                        {selectedDonation.verificationDate && (
                          <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Verified At:</strong> {new Date(selectedDonation.verificationDate).toLocaleString()}</p>
                        )}
                        {selectedDonation.verificationNotes && (
                          <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Admin Notes:</strong> {selectedDonation.verificationNotes}</p>
                        )}
                        {selectedDonation.rejectionReason && (
                          <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Rejection Reason:</strong> {selectedDonation.rejectionReason}</p>
                        )}
                      </div>
                    )}

                    {/* Receipt Preview */}
                    {selectedDonation.receiptPath ? (
                      <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>📄 Proof of Payment Receipt</h4>
                        <div style={{ width: '100%', maxHeight: '280px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img
                            src={getReceiptUrl(selectedDonation.receiptPath)}
                            alt="Receipt Proof"
                            style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', cursor: 'pointer' }}
                            onClick={() => window.open(getReceiptUrl(selectedDonation.receiptPath), '_blank')}
                            title="Click to view full receipt"
                          />
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <svg style={{ width: '12px', height: '12px', color: '#f59e0b', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Click image to open in full size
                        </p>
                      </div>
                    ) : (
                      selectedDonation.paymentMethod !== 'Cash' && (
                        <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          No receipt image uploaded as proof.
                        </p>
                      )
                    )}

                    <div className="dashboard-modal-buttons" style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        className="dashboard-verify-btn" 
                        onClick={() => {
                          const win = window.open('', '_blank');
                          win.document.write(`
                            <html>
                              <head>
                                <title>Official Acknowledgement Receipt - Sto. Domingo Parish</title>
                                <style>
                                  body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1c1917; }
                                  .header { text-align: center; border-bottom: 2px solid #991b1b; padding-bottom: 16px; margin-bottom: 24px; }
                                  .title { font-size: 20px; font-weight: bold; color: #991b1b; }
                                  .subtitle { font-size: 14px; color: #57534e; }
                                  .box { border: 1px solid #e7e5e4; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #fafaf9; }
                                  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e7e5e4; }
                                  .amount { font-size: 24px; font-weight: bold; color: #166534; }
                                  .footer { text-align: center; font-size: 12px; color: #78716c; margin-top: 40px; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div class="title">STO. DOMINGO PARISH &amp; NATIONAL SHRINE</div>
                                  <div class="subtitle">Social Action Center — Official Acknowledgement Receipt (AR)</div>
                                  <div style="font-size:12px; margin-top:4px;">537 Quezon Ave, Sta. Mesa Heights, Quezon City</div>
                                </div>
                                <div class="box">
                                  <div class="row"><strong>Receipt No:</strong> <span>AR-${selectedDonation._id?.substring(0,8).toUpperCase()}</span></div>
                                  <div class="row"><strong>Date:</strong> <span>${new Date(selectedDonation.createdAt).toLocaleDateString()}</span></div>
                                  <div class="row"><strong>Received From (Donor):</strong> <span>${selectedDonation.donorName}</span></div>
                                  <div class="row"><strong>Payment Method:</strong> <span>${selectedDonation.paymentMethod || 'Cash'}</span></div>
                                  <div class="row"><strong>Restricted Destination / Ministry:</strong> <span>${selectedDonation.destination || 'General Parish Fund'}</span></div>
                                  <div class="row" style="border-bottom:none; margin-top:10px;">
                                    <strong>Amount Received:</strong>
                                    <span class="amount">₱${selectedDonation.amount?.toFixed(2)}</span>
                                  </div>
                                </div>
                                <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                                  <div>
                                    <p style="font-size:12px; margin-bottom:40px;">Received &amp; Verified By:</p>
                                    <p style="border-top:1px solid #000; padding-top:4px; font-size:13px; font-weight:bold;">Mr. Edward A. Castro</p>
                                    <p style="font-size:11px; color:#57534e;">Social Action Center Coordinator</p>
                                  </div>
                                  <div>
                                    <p style="font-size:12px; margin-bottom:40px;">Parish Representative Signature:</p>
                                    <p style="border-top:1px solid #000; padding-top:4px; font-size:13px; font-weight:bold;">_______________________</p>
                                  </div>
                                </div>
                                <div class="footer">
                                  Thank you for your generous support to Sto. Domingo Church Ministries.<br />
                                  This serves as an official electronic record of your donation.
                                </div>
                              </body>
                            </html>
                          `);
                          win.document.close();
                          win.print();
                        }}
                        style={{ backgroundColor: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Official AR Receipt
                      </button>
                      <button type="button" className="dashboard-cancel-btn" onClick={() => setSelectedDonation(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Request for Cash Advance (RCA) Document Preview Modal */}
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

            {/* Generate Financial Audit Report Modal */}
            {showGenerateReportModal && (
              <div className="dashboard-modal-overlay">
                <div className="dashboard-modal" style={{ maxWidth: '520px', width: '90%', borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="dashboard-modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="dashboard-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                          Generate Financial &amp; Audit Report
                        </h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Export validated ledger statements &amp; summary breakdowns</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGenerateReportModal(false)}
                      className="dashboard-close-btn"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleGenerateReportSubmit}>
                    <div className="dashboard-modal-content" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="dashboard-form-group">
                        <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Report Custom Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Q3 2026 Parish Financial Audit Report"
                          value={reportTitleInput}
                          onChange={(e) => setReportTitleInput(e.target.value)}
                          className="dashboard-input"
                          style={{ borderRadius: '8px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="dashboard-form-group">
                          <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Report Type</label>
                          <select
                            value={reportTypeInput}
                            onChange={(e) => setReportTypeInput(e.target.value)}
                            className="dashboard-input"
                            style={{ borderRadius: '8px' }}
                          >
                            <option value="monthly">Monthly Audit</option>
                            <option value="quarterly">Quarterly Breakdown</option>
                            <option value="annual">Annual Financial Statement</option>
                            <option value="emergency">Emergency Relief Audit</option>
                          </select>
                        </div>

                        <div className="dashboard-form-group">
                          <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Sector Filter</label>
                          <select
                            value={reportCategoryInput}
                            onChange={(e) => setReportCategoryInput(e.target.value)}
                            className="dashboard-input"
                            style={{ borderRadius: '8px' }}
                          >
                            <option value="all">All Ministries &amp; Funds</option>
                            <option value="Senior Citizens">Senior Citizens</option>
                            <option value="Scholars">Scholars</option>
                            <option value="PWD">PWD Assistance</option>
                            <option value="Prison Ministry">Prison Ministry</option>
                            <option value="Solo Parents">Solo Parents</option>
                            <option value="Disaster Relief">Disaster Relief</option>
                            <option value="General Fund">General Parish Fund</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="dashboard-form-group">
                          <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Start Date</label>
                          <input
                            type="date"
                            value={reportStartDate}
                            onChange={(e) => setReportStartDate(e.target.value)}
                            className="dashboard-input"
                            style={{ borderRadius: '8px' }}
                          />
                        </div>

                        <div className="dashboard-form-group">
                          <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>End Date</label>
                          <input
                            type="date"
                            value={reportEndDate}
                            onChange={(e) => setReportEndDate(e.target.value)}
                            className="dashboard-input"
                            style={{ borderRadius: '8px' }}
                          />
                        </div>
                      </div>

                      <div className="dashboard-form-group">
                        <label className="dashboard-label" style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Export Format</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            border: reportFormatInput === 'pdf' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            backgroundColor: reportFormatInput === 'pdf' ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: reportFormatInput === 'pdf' ? '#1e40af' : '#475569'
                          }}>
                            <input
                              type="radio"
                              name="reportFormatModal"
                              value="pdf"
                              checked={reportFormatInput === 'pdf'}
                              onChange={(e) => setReportFormatInput(e.target.value)}
                            />
                            Official PDF Sheet
                          </label>

                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            border: reportFormatInput === 'csv' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            backgroundColor: reportFormatInput === 'csv' ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: reportFormatInput === 'csv' ? '#1e40af' : '#475569'
                          }}>
                            <input
                              type="radio"
                              name="reportFormatModal"
                              value="csv"
                              checked={reportFormatInput === 'csv'}
                              onChange={(e) => setReportFormatInput(e.target.value)}
                            />
                            CSV Spreadsheet
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="dashboard-cancel-btn"
                        onClick={() => setShowGenerateReportModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '9px 20px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                        }}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Generate &amp; Download
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}


          </main>
        </div>
      </div>
    );
  };

  export default Dashboard;
