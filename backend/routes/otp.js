require('dotenv').config();

const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Initialize Twilio client with your .env variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send OTP to phone number
router.post('/send', async (req, res) => {
  const { phoneNumber } = req.body;

  // Basic validation
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number required' });
  }

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms'
      });

    res.json({ success: true, status: verification.status, message: 'OTP sent!' });
  } catch (error) {
    console.error('Twilio send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP code
router.post('/verify', async (req, res) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ success: false, message: 'Phone number and code required' });
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: phoneNumber,
        code: code
      });

    if (verificationCheck.status === 'approved') {
      res.json({ success: true, message: 'Phone verified successfully!' });
    } else {
      res.json({ success: false, message: 'Invalid or expired code' });
    }
  } catch (error) {
    console.error('Twilio verify error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;