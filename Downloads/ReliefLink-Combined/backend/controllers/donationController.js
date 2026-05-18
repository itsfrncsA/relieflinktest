const Donation = require('../models/Donations');
const fs = require('fs');
const path = require('path');

exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ message: 'Error fetching donations' });
  }
};

exports.getPublicDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ verificationStatus: 'approved' }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error('Error fetching public donations:', err);
    res.status(500).json({ message: 'Error fetching donations' });
  }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    const donations = await Donation.find({ verificationStatus: 'pending' }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error('Error fetching pending verifications:', err);
    res.status(500).json({ message: 'Error fetching pending verifications' });
  }
};

exports.addDonation = async (req, res) => {
  const { donorName, amount } = req.body;

  if (!donorName || !amount)
    return res.status(400).json({ message: 'Please provide donor name and amount' });

  try {
    const donation = await Donation.create({ donorName, amount });
    res.status(201).json(donation);
  } catch (err) {
    console.error('Error adding donation:', err);
    res.status(500).json({ message: 'Error adding donation' });
  }
};

exports.uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { donationId } = req.body;

    if (!donationId) {
      // Clean up uploaded file if no donation ID
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Donation ID is required' });
    }

    const donation = await Donation.findById(donationId);

    if (!donation) {
      // Clean up uploaded file if donation not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Delete old receipt if it exists
    if (donation.receiptPath && fs.existsSync(donation.receiptPath)) {
      fs.unlinkSync(donation.receiptPath);
    }

    // Update donation with receipt info
    donation.receiptPath = req.file.path;
    donation.receiptFileName = req.file.filename;
    donation.verificationStatus = 'pending';
    await donation.save();

    res.json({
      message: 'Receipt uploaded successfully',
      donation: donation
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading receipt:', err);
    res.status(500).json({ message: 'Error uploading receipt: ' + err.message });
  }
};

exports.verifyReceipt = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Donation ID is required' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (!donation.receiptPath) {
      return res.status(400).json({ message: 'No receipt found for this donation' });
    }

    donation.verificationStatus = status;
    donation.verifiedBy = req.user?.id || 'admin';
    donation.verificationNotes = notes || '';
    donation.verificationDate = new Date();
    donation.verified = status === 'approved';

    await donation.save();

    res.json({
      message: `Receipt ${status} successfully`,
      donation: donation
    });
  } catch (err) {
    console.error('Error verifying receipt:', err);
    res.status(500).json({ message: 'Error verifying receipt: ' + err.message });
  }
};
exports.downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (!donation.receiptPath || !fs.existsSync(donation.receiptPath)) {
      return res.status(404).json({ message: 'Receipt file not found' });
    }

    res.download(donation.receiptPath, donation.receiptFileName);
  } catch (err) {
    console.error('Error downloading receipt:', err);
    res.status(500).json({ message: 'Error downloading receipt: ' + err.message });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const { donorName, amount } = req.body;

    if (!donorName || !amount) {
      return res.status(400).json({ message: 'Please provide donor name and amount' });
    }

    if (!req.params.id) {
      return res.status(400).json({ message: 'Donation ID is required' });
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { donorName, amount: parseFloat(amount), updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (err) {
    console.error('Error updating donation:', err);
    res.status(500).json({ message: 'Error updating donation: ' + err.message });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Donation ID is required' });
    }

    const donation = await Donation.findByIdAndDelete(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Delete receipt file if it exists
    if (donation.receiptPath && fs.existsSync(donation.receiptPath)) {
      fs.unlinkSync(donation.receiptPath);
    }

    res.json({ message: 'Donation deleted successfully', _id: donation._id });
  } catch (err) {
    console.error('Error deleting donation:', err);
    res.status(500).json({ message: 'Error deleting donation: ' + err.message });
  }
};

exports.verifyDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    
    donation.verified = true;
    await donation.save();
    res.json(donation);
  } catch (err) {
    console.error('Error verifying donation:', err);
    res.status(500).json({ message: 'Error verifying donation' });
  }
};
