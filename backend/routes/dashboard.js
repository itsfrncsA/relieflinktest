const express = require('express');
const router = express.Router();
const { getDashboardReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Apply auth middleware
router.use(protect);

// Dashboard overview endpoints
router.get('/overview', getDashboardReport);
router.get('/', getDashboardReport);

module.exports = router;
