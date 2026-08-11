const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  donorName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  referenceNumber: { type: String },
  notes: { type: String, default: '' },
  destination: { type: String, default: 'General Fund' },
  sectorCategory: { type: String, default: 'Parish General Fund' },
  isRestricted: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  acknowledgementNo: { type: String, default: null },
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
    default: 'pending'
  },
  verificationNotes: { type: String, default: '' },
  verificationDate: { type: Date, default: null },
  verified: { type: Boolean, default: null },
  blockId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);