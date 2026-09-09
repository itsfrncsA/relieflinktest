const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `expense-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply auth middleware to all routes
router.use(protect);

// Expense routes
router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.post('/:id/receipt', upload.single('receipt'), uploadReceipt);

module.exports = router;
