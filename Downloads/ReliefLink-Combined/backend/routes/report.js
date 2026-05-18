const express = require('express');
const router = express.Router();
const {
  getDonationReport,
  getExpenseReport,
  getInventoryReport,
  getUserActivityReport,
  getDashboardReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Report routes
router.get('/donations', getDonationReport);
router.get('/expenses', getExpenseReport);
router.get('/inventory', getInventoryReport);
router.get('/users', getUserActivityReport);
router.get('/dashboard', getDashboardReport);

module.exports = router;
