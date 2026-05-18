require('dotenv').config();

const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const otpGenerator = require('otp-generator');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs temporarily (in production, use MongoDB with expiry)
const otpStore = new Map();

// Send OTP via SMS
router.post('/send', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number required' });
  }

  // Generate 6-digit OTP
  const otp = otpGenerator.generate(6, { 
    digits: true, 
    lowerCaseAlphabets: false, 
    upperCaseAlphabets: false, 
    specialChars: false 
  });

  // Store OTP with expiry (5 minutes)
  otpStore.set(phoneNumber, {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  try {
    // Send SMS using Twilio Messaging API
    const message = await client.messages.create({
      body: `Your ReliefLink verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number: +15076903263
      to: phoneNumber
    });

    res.json({ success: true, message: 'OTP sent via SMS!', sid: message.sid });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP code
router.post('/verify', async (req, res) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ success: false, message: 'Phone number and code required' });
  }

  const storedOtp = otpStore.get(phoneNumber);

  if (!storedOtp) {
    return res.json({ success: false, message: 'No OTP requested for this number' });
  }

  if (Date.now() > storedOtp.expiresAt) {
    otpStore.delete(phoneNumber);
    return res.json({ success: false, message: 'OTP has expired' });
  }

  if (storedOtp.code === code) {
    otpStore.delete(phoneNumber);
    return res.json({ success: true, message: 'Phone verified successfully!' });
  } else {
    return res.json({ success: false, message: 'Invalid code' });
  }
});

module.exports = router;