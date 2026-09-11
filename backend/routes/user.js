const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  resetPassword,
  uploadProfileImage,
  getPendingUsers,
  approveUser,
  rejectUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply auth middleware to all routes
router.use(protect);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working', user: req.user.email });
});

// User profile for authenticated user
router.get('/me', async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const formattedStatus = user.status
      ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()
      : 'Active';

    const userCreated = user.createdAt || (user._id && typeof user._id.getTimestamp === 'function' ? user._id.getTimestamp() : new Date());

    res.json({
      success: true,
      data: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'donor',
        status: formattedStatus,
        createdAt: userCreated,
        updatedAt: user.updatedAt || userCreated
      },
      user
    });
  } catch (err) {
    console.error('Get /api/users/me error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// User management routes
router.get('/', getUsers);
router.get('/pending', getPendingUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/role', updateUserRole);
router.put('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/reset-password', resetPassword);
router.put('/:id/reset-password', resetPassword);
router.post('/:id/profile-image', upload.single('profileImage'), uploadProfileImage);
router.patch('/:id/approve', approveUser);
router.patch('/:id/reject', rejectUser);

module.exports = router;
