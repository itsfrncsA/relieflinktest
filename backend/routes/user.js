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
