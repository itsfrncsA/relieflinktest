const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['donations', 'expenses', 'inventory', 'activity', 'financial-summary'],
    required: true 
  },
  dateRange: {
    startDate: { type: Date },
    endDate: { type: Date }
  },
  format: { 
    type: String, 
    enum: ['pdf', 'csv', 'json'],
    default: 'pdf'
  },
  summary: {
    totalRecords: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    breakdown: { type: Object, default: {} }
  },
  status: { 
    type: String, 
    enum: ['draft', 'completed', 'failed'],
    default: 'completed'
  },
  filePath: { type: String },
  fileName: { type: String },
  downloadCount: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
