const express = require('express');
const router = express.Router();
const { validateDonation } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const donationController = require('../controllers/donationController');
const Donation = require('../models/Donations');

// Get all donations (admin)
router.get('/', protect, donationController.getDonations);

// Get public donations (for transparency)
router.get('/public', donationController.getPublicDonations);

// Create a donation (admin dashboard / mobile)
// NOTE: kept unprotected so mobile/guest flows won't break; admin UI sends token anyway.
router.post('/', validateDonation, donationController.addDonation);

// Update/delete donation (admin dashboard expects these)
router.put('/:id', protect, donationController.updateDonation);
router.delete('/:id', protect, donationController.deleteDonation);

// Approve/reject donation (admin dashboard actions)
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
    donation.verifiedBy = req.user?.name || req.user?.email || req.user?.id || 'admin';
    donation.verifiedAt = new Date();

    await donation.save();

    res.json({ success: true, message: 'Donation approved successfully', donation });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/reject', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = 'rejected';
    donation.rejectionReason = req.body?.reason || 'Payment not verified';
    donation.verifiedBy = req.user?.name || req.user?.email || req.user?.id || 'admin';
    donation.verifiedAt = new Date();

    await donation.save();

    res.json({ success: true, message: 'Donation rejected', donation });
  } catch (err) {
    console.error('Rejection error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Receipt workflow (admin dashboard expects these)
router.post('/:id/upload-receipt', protect, upload.single('receipt'), donationController.uploadReceipt);
router.put('/:id/verify-receipt', protect, donationController.verifyReceipt);
router.get('/:id/download-receipt', protect, donationController.downloadReceipt);

// Optional: pending verification list (if needed elsewhere)
router.get('/pending', protect, donationController.getPendingVerifications);

module.exports = router;