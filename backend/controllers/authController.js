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
    
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
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

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Mobile registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed: ' + (err.message || 'Server error') });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: 'Please provide email address' });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists with this email, password reset instructions have been sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would send this via email
    // For now, we'll return the token in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset token (development only):', resetToken);
      return res.json({ 
        message: 'Password reset instructions have been sent to your email',
        resetToken: resetToken // Only in development
      });
    }
    
    res.json({ 
      message: 'Password reset instructions have been sent to your email'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
