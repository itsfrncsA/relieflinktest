const express = require('express');
const router = express.Router();
const {
  getDonationReport,
  getExpenseReport,
  getInventoryReport,
  getUserActivityReport,
  getDashboardReport,
  getSavedReports,
  generateAndSaveReport,
  downloadSavedReport,
  deleteSavedReport
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

// Saved report routes
router.get('/saved', getSavedReports);
router.post('/saved', generateAndSaveReport);
router.get('/saved/:id/download', downloadSavedReport);
router.delete('/saved/:id', deleteSavedReport);

module.exports = router;
