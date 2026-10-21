const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'operations'
  },
  date: {
    type: Date,
    default: Date.now
  },
  receipt: {
    type: String, // File path
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  approvedAt: {
    type: Date,
    required: false
  },
  rejectedAt: {
    type: Date,
    required: false
  },
  blockId: {
    type: String,
    default: null
  },
  txHash: {
    type: String,
    default: null
  },
  fundSource: {
    type: String,
    default: 'General Fund'
  },
  fundedFrom: [{
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
    donorName: String,
    amount: Number,
    destination: String,
    blockId: String,
    disbursementTxHash: String,
    referenceNumber: String
  }]
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Expense', expenseSchema);
