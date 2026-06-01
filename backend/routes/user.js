const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getUsers,
  getUserById,
  getCurrentUserProfile,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetPassword,
  uploadProfileImage,
  getPendingUsers,
  approveUser,
  rejectUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

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

// Get current user profile
router.get('/me', getCurrentUserProfile);

// Restrict all subsequent user management routes to SuperAdmin only
router.use((req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. SuperAdmin privileges required.' });
});

// User management routes
router.get('/', getUsers);
router.get('/pending', getPendingUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/reset-password', resetPassword);
router.post('/:id/profile-image', upload.single('profileImage'), uploadProfileImage);
router.patch('/:id/approve', approveUser);
router.patch('/:id/reject', rejectUser);

module.exports = router;
