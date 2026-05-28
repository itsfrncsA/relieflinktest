const mongoose = require('mongoose');

const savedReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Monthly Report', 'Quarterly Report', 'Annual Report', 'Special Report', 'Donations Report', 'Expenses Report', 'Inventory Report', 'Planning Report', 'Custom Report']
  },
  format: {
    type: String,
    required: true,
    enum: ['PDF', 'CSV'],
    default: 'PDF'
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'DRAFT', 'GENERATING', 'FAILED'],
    default: 'COMPLETED'
  },
  dateRangeStart: {
    type: Date
  },
  dateRangeEnd: {
    type: Date
  },
  downloads: {
    type: Number,
    default: 0
  },
  reportData: {
    type: String
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SavedReport', savedReportSchema);
