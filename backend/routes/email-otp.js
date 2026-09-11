const express = require('express');
const router = express.Router();
const { sendOtpEmail, verifyOTP, generateOTP } = require('../services/otpService');

// Send OTP via Email
router.post('/send', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const otp = generateOTP();
    await sendOtpEmail(normalizedEmail, otp);
    res.json({ success: true, message: 'OTP sent to your email!' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP code
router.post('/verify', async (req, res) => {
  const { email, code, otp } = req.body;
  const otpCode = code || otp;

  if (!email || !otpCode) {
    return res.status(400).json({ success: false, message: 'Email and code required' });
  }

  const result = verifyOTP(email, otpCode);
  return res.json(result);
});

module.exports = router;