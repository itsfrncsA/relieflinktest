const express = require('express');
const router = express.Router();
const {
  login,
  registerAdmin,
  registerMobile,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword
} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', registerAdmin);           // Disabled: 403 Forbidden
router.post('/register-admin', registerAdmin);     // Disabled: 403 Forbidden
router.post('/register-mobile', registerMobile);   // Mobile beneficiary signup
router.post('/change-password', changePassword);   // User change password
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

