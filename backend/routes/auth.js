const express = require('express');
const router = express.Router();
const {
  login,
  registerAdmin,
  registerDonator,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', registerAdmin);           // Web: requires admin approval
router.post('/register-admin', registerAdmin);
router.post('/register-mobile', registerDonator); // Mobile: auto-approved as 'user'
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
