const Donation = require('../models/Donations');

/**
 * Automatically clean up abandoned / unpaid online donation sessions
 * If an online donation has been pending for more than 15 minutes with no proof/receipt uploaded,
 * mark it as 'failed' / 'cancelled'.
 */
const checkAndExpirePendingDonations = async () => {
  try {
    const expirationThreshold = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

    const onlineMethods = ['GCash', 'Maya', 'Online', 'PayMongo', 'Credit Card', 'Debit Card', 'QR Ph', 'InstaPay'];

    const result = await Donation.updateMany(
      {
        status: 'pending',
        paymentMethod: { $in: onlineMethods },
        createdAt: { $lt: expirationThreshold },
        $or: [
          { receiptPath: null },
          { receiptPath: { $exists: false } },
          { proofImage: null },
          { proofImage: { $exists: false } }
        ]
      },
      {
        $set: {
          status: 'failed',
          verificationStatus: 'rejected',
          rejectionReason: 'Payment session expired / abandoned after 15 minutes',
          verifiedAt: new Date(),
          verifiedBy: 'System Auto-Expiry'
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏱️ [AUTO-EXPIRY] Expired ${result.modifiedCount} abandoned pending donation(s).`);
    }
  } catch (error) {
    console.error('⚠️ [AUTO-EXPIRY ERROR]:', error.message);
  }
};

/**
 * Start periodic background check (runs every 3 minutes)
 */
const startAutoExpiryJob = () => {
  // Run once on startup
  checkAndExpirePendingDonations();

  // Run every 3 minutes
  setInterval(checkAndExpirePendingDonations, 3 * 60 * 1000);
  console.log('✅ Auto-expiry background job initialized (15-min timeout for abandoned pending transactions)');
};

module.exports = {
  checkAndExpirePendingDonations,
  startAutoExpiryJob
};
