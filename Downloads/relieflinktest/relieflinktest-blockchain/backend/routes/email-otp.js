require('dotenv').config();

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create transporter with error handling
let transporter;

try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // This must be an App Password, not your regular Gmail password
    }
  });
  
  // Verify transporter connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter error:', error);
    } else {
      console.log('✅ Email transporter verified successfully');
    }
  });
} catch (error) {
  console.error('Failed to initialize email transporter:', error);
}

// Store OTPs temporarily (in production, use MongoDB with expiry)
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Email
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address required' 
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    if (!transporter) {
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not configured' 
      });
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

    await transporter.sendMail(mailOptions);
    return res.json({ 
      success: true, 
      message: 'OTP sent to your email!' 
    });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send OTP' 
    });
  }
});

// Verify OTP code
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and code required' 
      });
    }

    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP requested for this email' 
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    if (storedOtp.code === code) {
      otpStore.delete(email);
      return res.json({ 
        success: true, 
        message: 'Email verified successfully!' 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid code' 
      });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Verification failed' 
    });
  }
});

module.exports = router;