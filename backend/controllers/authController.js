const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Please provide email and password' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active. Please wait for admin approval.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const jwtSecret = process.env.JWT_SECRET || 'relieflink_super_secret_key_2026_production';
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });
    
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
    const userCreated = user.createdAt || (user._id && typeof user._id.getTimestamp === 'function' ? user._id.getTimestamp() : new Date());

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        createdAt: userCreated,
        phone: user.phone || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login error: ' + err.message });
  }
};


// Public admin registration disabled by administrator policy
exports.registerAdmin = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Public administrator registration is disabled. Please contact an existing administrator to create an account.'
  });
};

// Mobile app beneficiary registration
exports.registerMobile = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  try {
    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'user',
      phone: phone ? phone.trim() : undefined,
      status: 'active'
    });

    const jwtSecret = process.env.JWT_SECRET || 'relieflink_super_secret_key_2026_production';
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '30d' });
    const userCreated = user.createdAt || (user._id && typeof user._id.getTimestamp === 'function' ? user._id.getTimestamp() : new Date());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        createdAt: userCreated,
        phone: user.phone || ''
      }
    });
  } catch (err) {
    console.error('Mobile registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed: ' + (err.message || 'Server error') });
  }
};

const { sendOtpEmail, verifyOTP, consumeVerifiedOTP, generateOTP } = require('../services/otpService');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide email address' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account was found for this email address.'
      });
    }

    const otp = generateOTP();
    await sendOtpEmail(normalizedEmail, otp);

    const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_SHOW_OTP === 'true';

    res.json({
      success: true,
      message: 'Verification code sent to your email.',
      ...(isDev ? { devOtp: otp } : {})
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + (err.message || 'Unable to send OTP') });
  }
};

exports.verifyResetOtp = async (req, res) => {
  const { email, otp, code } = req.body;
  const otpCode = otp || code;

  if (!email || !otpCode) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  const result = verifyOTP(email, otpCode);
  return res.status(result.success ? 200 : 400).json(result);
};

exports.resetPassword = async (req, res) => {
  const { email, otp, code, newPassword } = req.body;
  const otpCode = otp || code;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP if provided
    if (otpCode) {
      const otpRes = verifyOTP(normalizedEmail, otpCode);
      if (!otpRes.success) {
        return res.status(400).json(otpRes);
      }
      consumeVerifiedOTP(normalizedEmail);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password: ' + err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters'
    });
  }

  try {
    let user = null;
    if (email && email.trim().isNotEmpty !== false && email.trim() !== '—') {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }
    
    // If not found by email or email not provided, fallback to auth token if available
    if (!user && req.user?._id) {
      user = await User.findById(req.user._id);
    }

    // If still not found, check Authorization header manually
    if (!user && req.headers.authorization) {
      const token = req.headers.authorization.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        try {
          const jwtSecret = process.env.JWT_SECRET || 'relieflink_super_secret_key_2026_production';
          const decoded = jwt.verify(token, jwtSecret);
          if (decoded && decoded.id) {
            user = await User.findById(decoded.id);
          }
        } catch (_) {}
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found. Please log in again.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Your current password is incorrect.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      success: false,
      message: 'Unable to update password: ' + (err.message || 'Server error')
    });
  }
};

