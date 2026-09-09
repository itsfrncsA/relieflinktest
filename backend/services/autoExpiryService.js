const Donation = require('../models/Donations');

/**
 * Automatically clean up abandoned / unpaid online donation sessions
 * If an online donation has been pending for more than 15 minutes without payment completion / proof,
 * mark it as 'failed' / 'cancelled'.
 */
const checkAndExpirePendingDonations = async () => {
  try {
    const expirationThreshold = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

    const onlinePattern = /paymongo|gcash|maya|online|card|qr\s*ph|instapay/i;

    const result = await Donation.updateMany(
      {
        $or: [
          { status: 'pending' },
          { verificationStatus: 'pending' }
        ],
        paymentMethod: { $regex: onlinePattern },
        createdAt: { $lt: expirationThreshold },
        $and: [
          {
            $or: [
              { receiptPath: null },
              { receiptPath: '' },
              { receiptPath: { $exists: false } },
            ]
          },
          {
            $or: [
              { proofImage: null },
              { proofImage: '' },
              { proofImage: { $exists: false } },
            ]
          }
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
      console.log(`⏱️ [AUTO-EXPIRY] Expired ${result.modifiedCount} abandoned pending donation(s) older than 15 minutes.`);
    }
  } catch (error) {
    console.error('⚠️ [AUTO-EXPIRY ERROR]:', error.message);
  }
};

/**
 * Start periodic background check (runs every 2 minutes)
 */
const startAutoExpiryJob = () => {
  // Run once on startup
  checkAndExpirePendingDonations();

  // Run every 2 minutes
  setInterval(checkAndExpirePendingDonations, 2 * 60 * 1000);
  console.log('✅ Auto-expiry background job initialized (15-min timeout for abandoned pending transactions)');
};

module.exports = {
  checkAndExpirePendingDonations,
  startAutoExpiryJob
};
