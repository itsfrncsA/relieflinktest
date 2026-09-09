const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'clothing', 'medical', 'shelter', 'education', 'other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['pieces', 'boxes', 'kilograms', 'liters', 'sets', 'bags']
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'allocated', 'distributed', 'low-stock'],
    default: 'available'
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0
  },
  donor: {
    type: String,
    required: false
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: false
  },
  allocatedTo: {
    type: String,
    required: false
  },
  allocatedDate: {
    type: Date,
    required: false
  },
  distributedDate: {
    type: Date,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  image: {
    type: String, // File path
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Auto-update status based on quantity
inventorySchema.pre('save', function() {
  if (this.quantity <= this.minimumStock) {
    this.status = 'low-stock';
  } else if (this.status === 'low-stock' && this.quantity > this.minimumStock) {
    this.status = 'available';
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
