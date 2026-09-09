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
