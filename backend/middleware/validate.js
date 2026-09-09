const { body, validationResult } = require('express-validator');

// Validation for donation creation
const validateDonation = [
  body('donorName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Donor name must be between 2 and 100 characters')
    .escape(), // Prevents XSS attacks
  
  body('amount')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Amount must be between ₱1 and ₱1,000,000'),
  
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'GCash', 'Maya', 'Bank Transfer'])
    .withMessage('Invalid payment method'),
  
  body('referenceNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Reference number too long')
    .escape(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes too long')
    .escape(),
  
  // Check for errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Validation for user registration
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = { validateDonation, validateRegistration };