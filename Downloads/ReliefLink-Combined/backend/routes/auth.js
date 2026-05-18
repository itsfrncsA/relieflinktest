const express = require('express');
const router = express.Router();
const {
  login,
  registerAdmin,
  forgotPassword
} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', registerAdmin);           // Frontend uses this endpoint
router.post('/register-admin', registerAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
