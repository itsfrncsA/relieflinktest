const express = require('express');
const router = express.Router();
const Donation = require('../models/Donations');
const { protect } = require('../middleware/Middleware');
const { validateDonation } = require('../middleware/validate');

// Get all donations (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get public donations (for transparency)
router.get('/public', async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a donation (from mobile app)
router.post('/', validateDonation, async (req, res) => {
  try {
    const donation = new Donation({
      donorName: req.body.donorName || 'Anonymous',
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod || 'Cash',
      referenceNumber: req.body.referenceNumber,
      notes: req.body.notes,
      destination: req.body.destination,
      status: 'pending'
    });
    
    const savedDonation = await donation.save();
    res.status(201).json(savedDonation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Approve a donation (admin only)
router.put('/:id/approve', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Donation is not pending' });
    }
    
    donation.status = 'approved';
    donation.verifiedBy = req.user.name || req.user.email;
    donation.verifiedAt = new Date();
    
    await donation.save();
    
    res.json({
      success: true,
      message: 'Donation approved successfully',
      donation: donation
    });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Reject a donation (admin only)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    donation.status = 'rejected';
    donation.rejectionReason = req.body.reason || 'Payment not verified';
    
    await donation.save();
    
    res.json({ success: true, message: 'Donation rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pending donations for admin
router.get('/pending', protect, async (req, res) => {
  try {
    const pending = await Donation.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;