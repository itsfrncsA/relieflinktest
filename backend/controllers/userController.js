const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, department, permissions } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff',
      phone,
      department,
      permissions: permissions || undefined // Will use default permissions based on role
    });

    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow password update through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      user[key] = updateData[key];
    });

    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow users to delete themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Don't allow users to deactivate themselves
    if (id === req.user.id && status !== 'active') {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset user password
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Please provide a valid password (minimum 6 characters)' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending users
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(pendingUsers);
  } catch (err) {
    console.error('Get pending users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    // Only admins can approve other admins
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve admin users' });
    }

    user.status = 'active';
    if (role) user.role = role;
    if (department) user.department = department;
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      message: 'User approved successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject user
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    user.status = 'rejected';
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      message: 'User rejected successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Reject user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      message: 'Profile image uploaded successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Upload profile image error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    user.role = role || user.role;
    user.department = department || user.department;
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      message: 'User approved successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject user
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally, you can delete the user or mark as rejected
    await User.findByIdAndDelete(id);

    res.json({ message: 'User rejected and removed successfully' });
  } catch (err) {
    console.error('Reject user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
