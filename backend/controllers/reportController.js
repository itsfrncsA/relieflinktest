const Donation = require('../models/Donations');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const SavedReport = require('../models/SavedReport');

// Generate donation report
exports.getDonationReport = async (req, res) => {
  try {
    const { startDate, endDate, format } = req.query;
    
    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const donations = await Donation.find(matchQuery).sort({ createdAt: -1 });

    const summary = {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      averageDonation: donations.length > 0 ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0,
      verifiedDonations: donations.filter(d => d.status === 'approved').length,
      pendingDonations: donations.filter(d => d.status === 'pending').length
    };

    const report = {
      title: 'Donations Report',
      period: { startDate, endDate },
      summary,
      data: donations
    };

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(donations, [
        'donorName', 'amount', 'status', 'createdAt', 'paymentMethod', 'destination'
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=donations-report.csv');
      return res.send(csv);
    }

    res.json(report);
  } catch (err) {
    console.error('Donation report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate expense report
exports.getExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate, category, status, format } = req.query;
    
    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }
    if (category) matchQuery.category = category;
    if (status) matchQuery.status = status;

    const expenses = await Expense.find(matchQuery)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 });

    const summary = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
      averageExpense: expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0,
      approvedExpenses: expenses.filter(e => e.status === 'approved').length,
      pendingExpenses: expenses.filter(e => e.status === 'pending').length,
      rejectedExpenses: expenses.filter(e => e.status === 'rejected').length
    };

    // Group by category
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const report = {
      title: 'Expenses Report',
      period: { startDate, endDate },
      summary,
      categoryBreakdown,
      data: expenses
    };

    if (format === 'csv') {
      const csv = convertToCSV(expenses, [
        'description', 'amount', 'category', 'date', 'status', 'createdBy.name'
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses-report.csv');
      return res.send(csv);
    }

    res.json(report);
  } catch (err) {
    console.error('Expense report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate inventory report
exports.getInventoryReport = async (req, res) => {
  try {
    const { category, status, format } = req.query;
    
    const matchQuery = {};
    if (category) matchQuery.category = category;
    if (status) matchQuery.status = status;

    const inventory = await Inventory.find(matchQuery)
      .populate('createdBy', 'name email')
      .sort({ receivedDate: -1 });

    const summary = {
      totalItems: inventory.length,
      totalQuantity: inventory.reduce((sum, i) => sum + i.quantity, 0),
      availableItems: inventory.filter(i => i.status === 'available').length,
      allocatedItems: inventory.filter(i => i.status === 'allocated').length,
      distributedItems: inventory.filter(i => i.status === 'distributed').length,
      lowStockItems: inventory.filter(i => i.status === 'low-stock').length
    };

    // Group by category
    const categoryBreakdown = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity;
      return acc;
    }, {});

    // Group by location
    const locationBreakdown = inventory.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + item.quantity;
      return acc;
    }, {});

    const report = {
      title: 'Inventory Report',
      summary,
      categoryBreakdown,
      locationBreakdown,
      data: inventory
    };

    if (format === 'csv') {
      const csv = convertToCSV(inventory, [
        'name', 'description', 'category', 'quantity', 'unit', 'location', 'status', 'receivedDate'
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
      return res.send(csv);
    }

    res.json(report);
  } catch (err) {
    console.error('Inventory report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate user activity report
exports.getUserActivityReport = async (req, res) => {
  try {
    const { startDate, endDate, role, format } = req.query;
    
    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    if (role) matchQuery.role = role;

    const users = await User.find(matchQuery)
      .select('-password')
      .sort({ createdAt: -1 });

    const summary = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      inactiveUsers: users.filter(u => u.status === 'inactive').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length,
      admins: users.filter(u => u.role === 'admin').length,
      staff: users.filter(u => u.role === 'staff').length,
      volunteers: users.filter(u => u.role === 'volunteer').length
    };

    // Group by department
    const departmentBreakdown = users.reduce((acc, user) => {
      const dept = user.department || 'unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const report = {
      title: 'User Activity Report',
      period: { startDate, endDate },
      summary,
      departmentBreakdown,
      data: users
    };

    if (format === 'csv') {
      const csv = convertToCSV(users, [
        'name', 'email', 'role', 'department', 'status', 'createdAt', 'lastLogin'
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-report.csv');
      return res.send(csv);
    }

    res.json(report);
  } catch (err) {
    console.error('User activity report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate comprehensive dashboard report
exports.getDashboardReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Get data from all collections
    const [donations, expenses, inventory, users] = await Promise.all([
      Donation.find(dateQuery),
      Expense.find(dateQuery),
      Inventory.find(),
      User.find().select('-password')
    ]);

    const report = {
      title: 'Comprehensive Dashboard Report',
      period: { startDate, endDate },
      overview: {
        totalDonations: donations.reduce((sum, d) => sum + d.amount, 0),
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        netAmount: donations.reduce((sum, d) => sum + d.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
        totalInventoryItems: inventory.reduce((sum, i) => sum + i.quantity, 0),
        activeUsers: users.filter(u => u.status === 'active').length
      },
      donations: {
        count: donations.length,
        total: donations.reduce((sum, d) => sum + d.amount, 0),
        verified: donations.filter(d => d.status === 'approved').length
      },
      expenses: {
        count: expenses.length,
        total: expenses.reduce((sum, e) => sum + e.amount, 0),
        approved: expenses.filter(e => e.status === 'approved').length
      },
      inventory: {
        totalItems: inventory.length,
        available: inventory.filter(i => i.status === 'available').length,
        lowStock: inventory.filter(i => i.status === 'low-stock').length
      },
      users: {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        admins: users.filter(u => u.role === 'admin').length
      }
    };

    res.json(report);
  } catch (err) {
    console.error('Dashboard report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to convert data to CSV
function convertToCSV(data, fields) {
  const headers = fields.map(field => {
    const parts = field.split('.');
    return parts[parts.length - 1];
  }).join(',');

  const rows = data.map(item => {
    return fields.map(field => {
      const parts = field.split('.');
      let value = item;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || '';
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

// Get all saved reports
exports.getSavedReports = async (req, res) => {
  try {
    const reports = await SavedReport.find()
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching saved reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate and save a new report
exports.generateAndSaveReport = async (req, res) => {
  try {
    const { title, type, format, dateRangeStart, dateRangeEnd } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: 'Title and type are required' });
    }

    const dateQuery = {};
    if (dateRangeStart || dateRangeEnd) {
      dateQuery.createdAt = {};
      if (dateRangeStart) dateQuery.createdAt.$gte = new Date(dateRangeStart);
      if (dateRangeEnd) dateQuery.createdAt.$lte = new Date(dateRangeEnd);
    }

    let reportData = '';
    const reportType = type.toLowerCase();

    if (reportType.includes('donation')) {
      const donations = await Donation.find(dateQuery).sort({ createdAt: -1 });
      if (format === 'CSV') {
        reportData = convertToCSV(donations, ['donorName', 'amount', 'status', 'createdAt', 'paymentMethod', 'destination']);
      } else {
        reportData = JSON.stringify({
          summary: {
            totalDonations: donations.length,
            totalAmount: donations.reduce((sum, d) => sum + d.amount, 0)
          },
          data: donations
        });
      }
    } else if (reportType.includes('expense')) {
      const expenses = await Expense.find(dateQuery).sort({ date: -1 });
      if (format === 'CSV') {
        reportData = convertToCSV(expenses, ['description', 'amount', 'category', 'date', 'status']);
      } else {
        reportData = JSON.stringify({
          summary: {
            totalExpenses: expenses.length,
            totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0)
          },
          data: expenses
        });
      }
    } else if (reportType.includes('inventory')) {
      const inventory = await Inventory.find().sort({ receivedDate: -1 });
      if (format === 'CSV') {
        reportData = convertToCSV(inventory, ['name', 'description', 'category', 'quantity', 'unit', 'location', 'status']);
      } else {
        reportData = JSON.stringify({
          summary: {
            totalItems: inventory.length,
            totalQuantity: inventory.reduce((sum, i) => sum + i.quantity, 0)
          },
          data: inventory
        });
      }
    } else {
      const [donations, expenses, inventory] = await Promise.all([
        Donation.find(dateQuery),
        Expense.find(dateQuery),
        Inventory.find()
      ]);
      if (format === 'CSV') {
        const donationsCsv = convertToCSV(donations, ['donorName', 'amount', 'status', 'createdAt']);
        const expensesCsv = convertToCSV(expenses, ['description', 'amount', 'category', 'date']);
        const inventoryCsv = convertToCSV(inventory, ['name', 'quantity', 'category', 'location']);
        reportData = `--- DONATIONS ---\n${donationsCsv}\n\n--- EXPENSES ---\n${expensesCsv}\n\n--- INVENTORY ---\n${inventoryCsv}`;
      } else {
        reportData = JSON.stringify({
          donations: { count: donations.length, total: donations.reduce((sum, d) => sum + d.amount, 0) },
          expenses: { count: expenses.length, total: expenses.reduce((sum, e) => sum + e.amount, 0) },
          inventory: { count: inventory.length, total: inventory.reduce((sum, i) => sum + i.quantity, 0) }
        });
      }
    }

    const savedReport = new SavedReport({
      title,
      type,
      format: format || 'PDF',
      status: 'COMPLETED',
      dateRangeStart: dateRangeStart || null,
      dateRangeEnd: dateRangeEnd || null,
      reportData,
      generatedBy: req.user._id || req.user.id
    });

    await savedReport.save();

    const populated = await SavedReport.findById(savedReport._id).populate('generatedBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download a saved report
exports.downloadSavedReport = async (req, res) => {
  try {
    const report = await SavedReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.downloads += 1;
    await report.save();

    const filename = report.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    if (report.format === 'CSV') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      return res.send(report.reportData);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
    res.send(report.reportData);
  } catch (err) {
    console.error('Error downloading report:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a saved report
exports.deleteSavedReport = async (req, res) => {
  try {
    const report = await SavedReport.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
