const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getInventory,
  getLowStockItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  allocateInventoryItem,
  uploadItemImage
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `inventory-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Inventory routes
router.get('/', getInventory);
router.get('/low-stock', getLowStockItems);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.post('/:id/allocate', allocateInventoryItem);
router.post('/:id/image', upload.single('image'), uploadItemImage);

module.exports = router;
