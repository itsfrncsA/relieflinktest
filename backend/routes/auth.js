const express = require('express');
const router = express.Router();
const {
  login,
  registerAdmin,
  registerMobile,
  forgotPassword
} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', registerAdmin);           // Disabled: 403 Forbidden
router.post('/register-admin', registerAdmin);     // Disabled: 403 Forbidden
router.post('/register-mobile', registerMobile);   // Mobile beneficiary signup
router.post('/forgot-password', forgotPassword);
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
