const express = require('express');
const router = express.Router();
const Donation = require('../models/Donations');
const { protect } = require('../middleware/Middleware');
const { validateDonation } = require('../middleware/validate');
const { syncSingleDonation } = require('../services/paymongoSyncService');
const { enrichDonations, enrichDonation, signDonation } = require('../services/auditService');

// Get all donations (admin only, personal for mobile donors)
router.get('/', protect, async (req, res) => {
  try {
    const { personal } = req.query;
    const isStaff = req.user && ['admin', 'superadmin', 'staff', 'parish_admin'].includes(req.user.role);

    // Immediately auto-verify any recent pending PayMongo donations so user/admin gets live status
    try {
      const recentPending = await Donation.find({
        status: 'pending',
        $or: [
          { checkoutSessionId: { $regex: /^cs_/ } },
          { referenceNumber: { $regex: /^cs_/ } },
          { paymentMethod: /paymongo/i }
        ],
        createdAt: { $gte: new Date(Date.now() - 35 * 60 * 1000) }
      }).limit(6);

      for (const d of recentPending) {
        await syncSingleDonation(d);
      }
    } catch (_) {}

    // Auto-expire any pending PayMongo sessions older than 30 minutes so they don't linger
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    try {
      await Donation.updateMany(
        {
          status: 'pending',
          $or: [
            { paymentMethod: /PayMongo/i },
            { checkoutSessionId: { $exists: true, $ne: null } }
          ],
          createdAt: { $lt: thirtyMinutesAgo }
        },
        {
          $set: {
            status: 'rejected',
            verificationStatus: 'rejected',
            paymentStatus: 'expired',
            rejectionReason: 'Payment session expired (30 minutes passed without payment)'
          }
        }
      );
    } catch (_) {}

    if (personal === 'true' || !isStaff) {
      const queryConditions = [
        { userId: req.user._id }
      ];
      if (req.user.email) {
        queryConditions.push({ donorEmail: new RegExp(`^${req.user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim()}$`, 'i') });
      }
      const escapedName = req.user.name ? req.user.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim() : '';
      if (escapedName) {
        queryConditions.push({ donorName: new RegExp(`^${escapedName}$`, 'i') });
      }

      const userDonations = await Donation.find({ $or: queryConditions }).sort({ createdAt: -1 });
      const enrichedUserDonations = enrichDonations(userDonations);
      return res.json({
        success: true,
        data: enrichedUserDonations,
        donations: enrichedUserDonations
      });
    }

    // Web Admin View:
    // SAKA LANG PAPASOK SA WEB KAPAG SUCCESSFUL ANG TRANSACTION!
    // Include:
    // 1. All successful/approved donations
    // 2. Manual cash/bank deposit pending donations that need parish staff review
    // EXCLUDE: Unpaid/pending or rejected PayMongo checkout sessions.
    const adminQuery = {
      $or: [
        { status: { $in: ['approved', 'completed', 'fully used', 'partially used', 'cash on hand'] } },
        { 
          status: 'pending', 
          paymentMethod: { $not: /PayMongo/i },
          $or: [
            { checkoutSessionId: { $exists: false } },
            { checkoutSessionId: null },
            { checkoutSessionId: '' }
          ]
        }
      ]
    };

    const donations = await Donation.find(adminQuery).sort({ createdAt: -1 });
    const enrichedDonations = enrichDonations(donations);
    res.json({
      success: true,
      data: enrichedDonations,
      donations: enrichedDonations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get public donations (for transparency)
router.get('/public', async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(enrichDonations(donations));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const fs = require('fs');
const path = require('path');
const { recordDonationOnChain } = require('../services/besuService');

// Helper to save base64 proof image to disk
function saveBase64Image(dataString, originalFileName) {
  if (!dataString || typeof dataString !== 'string' || !dataString.startsWith('data:image')) {
    return {
      receiptPath: dataString || null,
      receiptUrl: dataString || null,
      receiptFileName: originalFileName || null
    };
  }
  try {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { receiptPath: null, receiptUrl: null, receiptFileName: originalFileName || null };
    }
    const ext = (matches[1].split('/')[1] || 'png').replace('+xml', '');
    const buffer = Buffer.from(matches[2], 'base64');
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `receipt-${Date.now()}-${Math.round(Math.random() * 1E6)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return {
      receiptPath: `uploads/receipts/${filename}`,
      receiptUrl: `/uploads/receipts/${filename}`,
      receiptFileName: originalFileName || filename
    };
  } catch (err) {
    console.error('Error saving base64 receipt:', err);
    return { receiptPath: null, receiptUrl: null, receiptFileName: originalFileName || null };
  }
}

// Create a donation (manual or mobile app)
router.post('/', validateDonation, async (req, res) => {
  try {
    let authUser = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const jwtSecret = process.env.JWT_SECRET || 'relieflink_super_secret_key_2026_production';
        const decoded = jwt.verify(token, jwtSecret);
        authUser = await User.findById(decoded.id).select('-password');
      } catch (e) {}
    }

    // Process proof image if passed as Base64 data URL
    const rawImage = req.body.proofImage || req.body.receiptPath;
    const rawFileName = req.body.receiptFileName || req.body.proofFileName;
    const { receiptPath, receiptUrl, receiptFileName } = saveBase64Image(rawImage, rawFileName);

    // Record contributions: direct cash records default to 'cash on hand' unless pending specified
    const incomingStatus = (req.body.status || 'cash on hand').toLowerCase();
    const isApprovedOrCashOnHand = ['approved', 'completed', 'cash on hand'].includes(incomingStatus);

    const donation = new Donation({
      donorName: req.body.donorName || 'Anonymous',
      donorEmail: req.body.donorEmail || req.body.email || (authUser ? authUser.email : null),
      userId: req.body.userId || (authUser ? authUser._id : null),
      amount: Number(req.body.amount),
      paymentMethod: req.body.paymentMethod || 'Direct Cash',
      referenceNumber: req.body.referenceNumber || `CASH-${Date.now().toString().slice(-6)}`,
      notes: req.body.notes || '',
      destination: req.body.destination || 'Parish General Fund',
      receiptPath: receiptPath,
      receiptUrl: receiptUrl,
      proofImage: receiptUrl || receiptPath,
      receiptFileName: receiptFileName,
      status: incomingStatus,
      verificationStatus: incomingStatus,
      remainingBalance: req.body.remainingBalance !== undefined && req.body.remainingBalance !== null ? Number(req.body.remainingBalance) : Number(req.body.amount || 0),
      verifiedBy: isApprovedOrCashOnHand ? (req.body.verifiedBy || (authUser ? authUser.name : 'Parish Admin')) : undefined,
      verifiedAt: isApprovedOrCashOnHand ? new Date() : undefined
    });
    
    signDonation(donation);
    let savedDonation = await donation.save();

    // If verified immediately, record on Azure Besu blockchain
    if (isApprovedOrCashOnHand) {
      try {
        const onChainResult = await recordDonationOnChain({
          donorName: savedDonation.donorName,
          amount: savedDonation.amount,
          referenceNumber: savedDonation.referenceNumber || `REF-${savedDonation._id}`,
          blockHash: savedDonation._id.toString()
        });
        if (onChainResult) {
          savedDonation.blockId = onChainResult.txHash;
          signDonation(savedDonation);
          await savedDonation.save();
        }
      } catch (chainErr) {
        console.warn('⚠️ Blockchain write deferred:', chainErr.message);
      }
    }

    res.status(201).json(enrichDonation(savedDonation));
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

    let blockchainRecorded = false; 

    // Record on Azure Besu blockchain
    try {
      const onChainResult = await recordDonationOnChain({
      donorId: donation.userId?.toString(),
      amount: donation.amount,
      blockHash: donation._id.toString()
    });

           if (onChainResult?.txHash) {
        donation.blockId = onChainResult.txHash;
        blockchainRecorded = true;
      } else {
        console.warn(
          'Blockchain recording was not confirmed for donation:',
          donation._id.toString()
       );
      }
    } catch (chainErr) {
      console.error('Blockchain write deferred:', chainErr.message);
    }
    
    signDonation(donation);
    await donation.save();
    
    res.json({
      success: true,
      blockchainRecorded,
      message: blockchainRecorded 
      ? 'Donation approved and mined to Azure Besu blockchain successfully' 
      : 'Donation approved but not yet mined to Azure Besu blockchain',
      donation: enrichDonation(donation)
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

// Update donation details (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { donorName, amount, paymentMethod, destination, referenceNumber, notes, status, remainingBalance, usageLogs } = req.body;

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donorName !== undefined) donation.donorName = donorName.trim();
    if (amount !== undefined) donation.amount = parseFloat(amount);
    if (paymentMethod !== undefined) donation.paymentMethod = paymentMethod;
    if (destination !== undefined) donation.destination = destination;
    if (referenceNumber !== undefined) donation.referenceNumber = referenceNumber;
    if (notes !== undefined) donation.notes = notes;
    if (remainingBalance !== undefined) donation.remainingBalance = parseFloat(remainingBalance);
    if (usageLogs !== undefined) donation.usageLogs = usageLogs;
    if (status !== undefined) {
      donation.status = status;
      donation.verificationStatus = status;
      if (status === 'approved' || status === 'fully used' || status === 'partially used') {
        donation.verifiedBy = req.user?.name || 'Parish Admin';
        donation.verifiedAt = new Date();
      }
    }

    const updated = await donation.save();

    res.json({
      success: true,
      message: 'Donation updated successfully',
      donation: enrichDonation(updated)
    });
  } catch (err) {
    console.error('Update donation error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Delete donation (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    await Donation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Donation record deleted successfully',
      id: id
    });
  } catch (err) {
    console.error('Delete donation error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
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