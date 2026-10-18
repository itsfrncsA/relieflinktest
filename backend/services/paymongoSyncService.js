const Donation = require('../models/Donations');
const { recordDonationOnChain } = require('./besuService');
const { sendDonationConfirmationEmail } = require('./otpService');

// Get active PayMongo Secret Key
function getPayMongoSecretKey() {
  if (process.env.PAYMONGO_LIVE_SECRET_KEY) {
    return process.env.PAYMONGO_LIVE_SECRET_KEY;
  }
  if (process.env.PAYMONGO_SECRET_KEY) {
    return process.env.PAYMONGO_SECRET_KEY;
  }
  return 'sk_live_bvXDRYXLd6cuuYFf39GBQhCE';
}

// Helper: Extract fee, gross, net and payment metadata from PayMongo payload
function extractPaymentDetails(eventData, baseDonationAmount) {
  const sessionAttributes = eventData?.attributes || {};
  const payments = sessionAttributes.payments || [];
  const primaryPayment = payments.length > 0 ? payments[0] : (eventData?.type === 'payment' ? eventData : null);
  const paymentAttributes = primaryPayment?.attributes || {};

  const grossCentavos = paymentAttributes.amount || sessionAttributes.amount;
  const feeCentavos = paymentAttributes.fee;
  const netCentavos = paymentAttributes.net_amount;

  const feeAmount = (feeCentavos !== undefined && feeCentavos !== null)
    ? Number((feeCentavos / 100).toFixed(2))
    : 0;

  const grossAmount = (grossCentavos !== undefined && grossCentavos !== null)
    ? Number((grossCentavos / 100).toFixed(2))
    : Number((baseDonationAmount + feeAmount).toFixed(2));

  const netAmount = (netCentavos !== undefined && netCentavos !== null)
    ? Number((netCentavos / 100).toFixed(2))
    : baseDonationAmount;

  const paymentMethodType = paymentAttributes.source?.type || paymentAttributes.payment_method_type || primaryPayment?.type || null;
  const paymentId = primaryPayment?.id || null;
  const checkoutSessionId = eventData?.type === 'checkout_session' ? eventData?.id : (sessionAttributes.checkout_session_id || null);
  const paidAt = paymentAttributes.paid_at ? new Date(paymentAttributes.paid_at * 1000) : new Date();

  return {
    feeAmount,
    grossAmount,
    netAmount,
    paymentMethodType,
    paymentId,
    checkoutSessionId,
    paidAt,
    paymentStatus: paymentAttributes.status || sessionAttributes.status || 'paid'
  };
}

/**
 * Verify and synchronize a single pending donation with PayMongo
 */
async function syncSingleDonation(donation) {
  if (!donation || donation.status === 'approved') return donation;

  const checkoutSessionId = donation.checkoutSessionId || donation.referenceNumber;
  if (!checkoutSessionId || !checkoutSessionId.startsWith('cs_')) {
    return donation;
  }

  const secretKey = getPayMongoSecretKey();
  const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

  try {
    const pmRes = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`, {
      method: 'GET',
      headers: { 'Authorization': authHeader }
    });

    if (!pmRes.ok) {
      return donation;
    }

    const pmData = await pmRes.json();
    const sessionAttrs = pmData?.data?.attributes || {};
    const payments = sessionAttrs.payments || [];
    const isPaid = payments.some(p => p.attributes?.status === 'paid') || sessionAttrs.status === 'paid';
    const sessionStatus = sessionAttrs.status;

    if (isPaid) {
      const paymentDetails = extractPaymentDetails(pmData.data, donation.amount);
      donation.feeAmount = paymentDetails.feeAmount;
      donation.grossAmount = paymentDetails.grossAmount;
      donation.netAmount = paymentDetails.netAmount || donation.amount;
      donation.paymentId = paymentDetails.paymentId || donation.paymentId;
      donation.checkoutSessionId = paymentDetails.checkoutSessionId || donation.checkoutSessionId;
      donation.paymentStatus = 'paid';
      donation.paidAt = paymentDetails.paidAt || new Date();
      if (paymentDetails.paymentMethodType) {
        donation.paymentMethodType = paymentDetails.paymentMethodType;
        donation.paymentMethod = `PayMongo (${paymentDetails.paymentMethodType.toUpperCase()})`;
      }
      donation.status = 'approved';
      donation.verificationStatus = 'approved';
      donation.verifiedBy = 'PayMongo Auto-Sync (Instant Validation)';
      donation.verifiedAt = donation.paidAt || new Date();
      donation.createdAt = donation.paidAt || donation.createdAt;

      // Record on Azure Besu blockchain
      try {
        const onChainResult = await recordDonationOnChain({
          donorName: donation.donorName,
          amount: donation.amount,
          referenceNumber: donation.checkoutSessionId || donation.referenceNumber || `PM-${donation._id}`,
          blockHash: donation._id.toString()
        });
        if (onChainResult && onChainResult.txHash) {
          donation.blockId = onChainResult.txHash;
        }
      } catch (chainErr) {
        console.warn('⚠️ Blockchain write deferred in PayMongo Auto-Sync:', chainErr.message);
      }

      // Send confirmation email receipt
      if (donation.donorEmail && !donation.receiptEmailSent) {
        donation.receiptEmailSent = true;
        await donation.save();
        sendDonationConfirmationEmail(donation).catch(e => console.error('Sync receipt email error:', e.message));
      } else {
        await donation.save();
      }

      console.log(`🎉 [PayMongo Instant Sync] Donation ${donation._id} (₱${donation.amount}) automatically verified & approved without needing return to merchant!`);
      return donation;
    } else if (sessionStatus === 'cancelled' || sessionStatus === 'expired') {
      donation.status = 'rejected';
      donation.verificationStatus = 'rejected';
      donation.paymentStatus = sessionStatus;
      donation.rejectionReason = `PayMongo checkout session ${sessionStatus}`;
      await donation.save();
      console.log(`⏱️ [PayMongo Instant Sync] Marked session ${checkoutSessionId} as ${sessionStatus}`);
      return donation;
    }
  } catch (err) {
    console.error(`⚠️ [PayMongo Sync Error] Session ${checkoutSessionId}:`, err.message);
  }

  return donation;
}

let isSyncing = false;

/**
 * Periodically scan and auto-validate any pending PayMongo sessions
 */
async function syncPendingPayMongoDonations() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // Only check pending donations created in the last 35 minutes
    const thirtyFiveMinutesAgo = new Date(Date.now() - 35 * 60 * 1000);

    const pendingDonations = await Donation.find({
      status: 'pending',
      $or: [
        { checkoutSessionId: { $regex: /^cs_/ } },
        { referenceNumber: { $regex: /^cs_/ } },
        { paymentMethod: /paymongo/i }
      ],
      createdAt: { $gte: thirtyFiveMinutesAgo }
    }).limit(15);

    if (pendingDonations.length > 0) {
      for (const donation of pendingDonations) {
        await syncSingleDonation(donation);
      }
    }
  } catch (error) {
    console.error('⚠️ [PayMongo Auto-Sync Job Error]:', error.message);
  } finally {
    isSyncing = false;
  }
}

/**
 * Start background sync job running every 5 seconds
 */
function startPayMongoSyncJob() {
  // Initial check on startup
  syncPendingPayMongoDonations();

  // Run every 5 seconds for immediate validation
  setInterval(syncPendingPayMongoDonations, 5000);
  console.log('✅ PayMongo Instant Auto-Sync job initialized (checks active sessions every 5s for immediate validation)');
}

module.exports = {
  syncSingleDonation,
  syncPendingPayMongoDonations,
  startPayMongoSyncJob,
  extractPaymentDetails,
  getPayMongoSecretKey
};
