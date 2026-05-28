const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  referenceNumber: { type: String },
  notes: { type: String, default: '' },
  destination: { type: String, default: 'General Fund' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending' 
  },
  verifiedBy: { type: String, default: null },
  verifiedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  receiptPath: { type: String, default: null },
  receiptFileName: { type: String, default: null },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
  verificationNotes: { type: String, default: '' },
  verificationDate: { type: Date, default: null },
  verified: { type: Boolean, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);