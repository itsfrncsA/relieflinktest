const Donation = require('../models/Donations');
const fs = require('fs');
const path = require('path');
const { getBlockchain } = require('../blockchain');

exports.getDonations = async (req, res) => {
  try {
    // Admin/Staff can see all donations
    // Mobile users (role='user') can only see their own donations
    let filter = {};
    if (req.user.role === 'user') {
      filter = { donorId: req.user._id };
    }
    // Otherwise, no filter = get all donations for admin/staff
    
    const donations = await Donation.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: donations,
      message: 'Donations retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching donations',
      message: err.message 
    });
  }
};

exports.getPublicDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ verificationStatus: 'approved' }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: donations,
      message: donations.length > 0 ? 'Public donations retrieved' : 'No approved donations yet'
    });
  } catch (err) {
    console.error('Error fetching public donations:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching donations',
      message: err.message 
    });
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
  const { donorName, amount, paymentMethod, referenceNumber, notes, destination } = req.body;

  if (!donorName || !amount)
    return res.status(400).json({ message: 'Please provide donor name and amount' });

  try {
    // Save donation with authenticated user's ID
    const donation = await Donation.create({
      donorId: req.user._id,
      donorName,
      amount,
      paymentMethod: paymentMethod || 'Cash',
      referenceNumber,
      notes,
      destination: destination || 'General Fund'
    });
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
    if (donation.receiptPath) {
      const fileName = donation.receiptFileName || path.basename(donation.receiptPath.replace(/\\/g, '/'));
      const oldPath = path.join(__dirname, '../uploads/receipts', fileName);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
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

    if (status === 'approved') {
      const blockchain = getBlockchain();
      if (!blockchain.getDonationById(donation._id.toString())) {
        const block = blockchain.addDonation({
          donationId: donation._id.toString(),
          donorName: donation.donorName,
          amount: donation.amount,
          paymentMethod: donation.paymentMethod,
          referenceNumber: donation.referenceNumber,
          destination: donation.destination,
          status: donation.verificationStatus
        });
        donation.blockId = block.id;
      } else {
        const existingBlock = blockchain.getDonationById(donation._id.toString());
        donation.blockId = existingBlock.id;
      }
    }

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

    if (!donation.receiptPath) {
      return res.status(404).json({ message: 'Receipt path not recorded' });
    }

    const fileName = donation.receiptFileName || path.basename(donation.receiptPath.replace(/\\/g, '/'));
    const localReceiptPath = path.join(__dirname, '../uploads/receipts', fileName);

    if (!fs.existsSync(localReceiptPath)) {
      return res.status(404).json({ message: 'Receipt file not found on local storage disk' });
    }

    res.download(localReceiptPath, donation.receiptFileName || fileName);
  } catch (err) {
    console.error('Error downloading receipt:', err);
    res.status(500).json({ message: 'Error downloading receipt: ' + err.message });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const { donorName, amount, paymentMethod } = req.body;

    if (!donorName || !amount) {
      return res.status(400).json({ message: 'Please provide donor name and amount' });
    }

    if (!req.params.id) {
      return res.status(400).json({ message: 'Donation ID is required' });
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { donorName, amount: parseFloat(amount), paymentMethod, updatedAt: new Date() },
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
    donation.verificationStatus = 'approved';
    donation.status = 'approved';

    const blockchain = getBlockchain();
    if (!blockchain.getDonationById(donation._id.toString())) {
      const block = blockchain.addDonation({
        donationId: donation._id.toString(),
        donorName: donation.donorName,
        amount: donation.amount,
        paymentMethod: donation.paymentMethod,
        referenceNumber: donation.referenceNumber,
        destination: donation.destination,
        status: donation.verificationStatus
      });
      donation.blockId = block.id;
    } else {
      const existingBlock = blockchain.getDonationById(donation._id.toString());
      donation.blockId = existingBlock.id;
    }

    await donation.save();
    res.json(donation);
  } catch (err) {
    console.error('Error verifying donation:', err);
    res.status(500).json({ message: 'Error verifying donation' });
  }
};
