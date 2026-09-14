const mongoose = require('mongoose');

const cashAdvanceSchema = new mongoose.Schema({
  applicantName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  position: {
    type: String,
    trim: true
  },
  ministry: {
    type: String,
    trim: true
  },
  activityPurpose: {
    type: String,
    required: true,
    trim: true
  },
  dateNeeded: {
    type: Date
  },
  requestedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  outstandingAmount: {
    type: Number,
    default: 0
  },
  outstandingDetails: [{
    date: { type: String },
    amount: { type: Number, default: 0 },
    status: { type: String }
  }],
  requestedBy: {
    type: String,
    trim: true
  },
  recommendingApproval: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Submitted', 'Approved', 'Liquidated', 'Pending'],
    default: 'Submitted'
  },
  createdBy: {
    type: String,
    default: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CashAdvance', cashAdvanceSchema);
