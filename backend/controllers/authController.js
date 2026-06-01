const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.registerAdmin = async (req, res) => {
  const { name, email, password, role, phone, department } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Please provide name, email, and password' });

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  // Phone validation (optional field)
  if (phone && !/^[\+]?[0-9]{10,15}$/.test(phone)) {
    return res.status(400).json({ message: 'Please provide a valid phone number' });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    // Check if there are any existing admins
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Sanitize requested role from client. Only allow 'staff' or 'volunteer' for normal registrations.
    // Admin role is only allowed for the very first admin (when no admins exist).
    const requestedRole = (typeof role === 'string' && ['admin', 'staff', 'volunteer'].includes(role)) ? role : 'staff';

    let userRole = 'staff';
    let userStatus = 'pending';

    if (adminCount === 0 && requestedRole === 'admin') {
      // Allow the first admin to be created and set active so they can manage approvals.
      userRole = 'admin';
      userStatus = 'active';
    } else {
      // If admins already exist, do not allow admin self-registration.
      if (requestedRole === 'admin') {
        return res.status(403).json({
          message: 'Admin registration requires approval from existing administrators. Please register as staff and request admin privileges.'
        });
      }

      // Accept staff or volunteer as requested roles; default to staff otherwise.
      if (requestedRole === 'volunteer') userRole = 'volunteer';
      else userRole = 'staff';
      userStatus = 'pending';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      phone: phone || undefined,
      department: department || undefined,
      status: userStatus
    });

    // Don't auto-login pending users
    if (userStatus === 'pending') {
      return res.status(201).json({
        message: 'Registration successful! Your account is pending approval from administrators.',
        user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
    });
  } catch (err) {
    console.error('Registration error:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    console.error('Full error object:', JSON.stringify(err, null, 2));
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: 'Please provide email address' });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Security: Don't reveal whether email exists
      return res.status(200).json({ message: 'If an account exists with this email, password reset instructions have been sent' });
    }

    // Generate a 6-digit OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in user document with expiry (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ReliefLink Password Reset Code',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the code below to reset your password:</p>
        <h1 style="color: #2196F3; letter-spacing: 2px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p><small>ReliefLink - Transparency in Giving</small></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Password reset code has been sent to your email',
      success: true
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
  }

  // Password validation
  if (newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[!@#$%^&*]/.test(newPassword)) {
    return res.status(400).json({ 
      message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character' 
    });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if OTP exists and hasn't expired
    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
      return res.status(400).json({ message: 'No password reset request found. Please request a new one.' });
    }

    // Check if OTP is expired
    if (new Date() > user.resetPasswordOtpExpiry) {
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new password reset.' });
    }

    // Verify OTP
    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;
    await user.save();

    res.json({ 
      message: 'Password reset successfully',
      success: true
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.registerDonator = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  // Phone validation (optional field)
  if (phone && !/^[\+]?[0-9]{10,15}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid phone number' });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      phone: phone || undefined,
      status: 'active' // Users/donators are auto-approved
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
    });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
