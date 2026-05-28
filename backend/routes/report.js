const express = require('express');
const router = express.Router();
const {
  getDonationReport,
  getExpenseReport,
  getInventoryReport,
  getUserActivityReport,
  getDashboardReport,
  createReport,
  getSavedReports,
  getReportById,
  deleteReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Specific routes FIRST (before generic :id routes)
router.post('/', createReport);
router.get('/donations', getDonationReport);
router.get('/expenses', getExpenseReport);
router.get('/inventory', getInventoryReport);
router.get('/users', getUserActivityReport);
router.get('/dashboard', getDashboardReport);
router.get('/saved/all', getSavedReports);

// Generic routes LAST (with :id parameter)
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

module.exports = router;
