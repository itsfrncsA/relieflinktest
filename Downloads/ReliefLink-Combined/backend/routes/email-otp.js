require('dotenv').config();

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // This must be an App Password, not your regular Gmail password
  }
});

// Store OTPs temporarily (in production, use MongoDB with expiry)
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Email
router.post('/send', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address required' });
  }

  const otp = generateOTP();

  // Store OTP with expiry (5 minutes)
  otpStore.set(email, {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your ReliefLink Verification Code',
    text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent to your email!' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP code
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and code required' });
  }

  const storedOtp = otpStore.get(email);

  if (!storedOtp) {
    return res.json({ success: false, message: 'No OTP requested for this email' });
  }

  if (Date.now() > storedOtp.expiresAt) {
    otpStore.delete(email);
    return res.json({ success: false, message: 'OTP has expired' });
  }

  if (storedOtp.code === code) {
    otpStore.delete(email);
    return res.json({ success: true, message: 'Email verified successfully!' });
  } else {
    return res.json({ success: false, message: 'Invalid code' });
  }
});

module.exports = router;