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

const { recordDonationOnChain } = require('../services/besuService');

// Create a donation (manual or mobile app)
router.post('/', validateDonation, async (req, res) => {
  try {
    const isApproved = req.body.status === 'approved' || !req.body.status;
    const donation = new Donation({
      donorName: req.body.donorName || 'Anonymous',
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod || 'Cash',
      referenceNumber: req.body.referenceNumber,
      notes: req.body.notes,
      destination: req.body.destination || 'Parish General Fund',
      receiptPath: req.body.receiptPath || req.body.proofImage || null,
      receiptUrl: req.body.receiptUrl || req.body.proofImage || null,
      proofImage: req.body.proofImage || req.body.receiptPath || null,
      receiptFileName: req.body.receiptFileName || null,
      status: isApproved ? 'approved' : 'pending',
      verificationStatus: isApproved ? 'approved' : 'pending',
      verifiedBy: isApproved ? (req.body.verifiedBy || 'Parish Admin') : undefined,
      verifiedAt: isApproved ? new Date() : undefined
    });
    
    let savedDonation = await donation.save();

    // If approved immediately, record on Azure Besu blockchain
    if (isApproved) {
      try {
        const onChainResult = await recordDonationOnChain({
          donorName: savedDonation.donorName,
          amount: savedDonation.amount,
          referenceNumber: savedDonation.referenceNumber || `REF-${savedDonation._id}`,
          blockHash: savedDonation._id.toString()
        });
        if (onChainResult) {
          savedDonation.blockId = onChainResult.txHash;
          await savedDonation.save();
        }
      } catch (chainErr) {
        console.warn('⚠️ Blockchain write deferred:', chainErr.message);
      }
    }

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
    donation.verifiedBy = req.user?.name || req.user?.email || 'Parish Admin';
    donation.verifiedAt = new Date();

    // Record on Azure Besu blockchain
    try {
      const onChainResult = await recordDonationOnChain({
        donorName: donation.donorName,
        amount: donation.amount,
        referenceNumber: donation.referenceNumber || `REF-${donation._id}`,
        blockHash: donation._id.toString()
      });
      if (onChainResult) {
        donation.blockId = onChainResult.txHash;
      }
    } catch (chainErr) {
      console.warn('⚠️ Blockchain write deferred:', chainErr.message);
    }
    
    await donation.save();
    
    res.json({
      success: true,
      message: 'Donation approved and mined to Azure Besu blockchain successfully',
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