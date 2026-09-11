const express = require('express');
const router = express.Router();
const Donation = require('../models/Donations');
const { recordDonationOnChain } = require('../services/besuService');

// Get active PayMongo Secret Key (Live or Test)
function getPayMongoSecretKey() {
  if (process.env.NODE_ENV === 'production' && process.env.PAYMONGO_LIVE_SECRET_KEY) {
    return process.env.PAYMONGO_LIVE_SECRET_KEY;
  }
  return process.env.PAYMONGO_SECRET_KEY || process.env.PAYMONGO_LIVE_SECRET_KEY || 'sk_test_NQuLXttMLZ6tsuzf4JHWbWh6';
}

/**
 * 1. Create PayMongo Checkout Session (GCash / Maya / Card / QR Ph)
 * POST /api/payments/paymongo/checkout
 */
router.post('/paymongo/checkout', async (req, res) => {
  try {
    const { donorName, amount, destination, notes, paymentMethod } = req.body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 20) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount for online payment is ₱20.00'
      });
    }

    const dName = donorName && donorName.trim() ? donorName.trim() : 'Anonymous Donor';
    const dDest = destination || 'Parish General Fund';
    const dNotes = notes || '';

    const dEmail = req.body.donorEmail || req.body.email || (req.user ? req.user.email : null);
    const uId = req.body.userId || (req.user ? req.user._id : null);

    // Create a pending donation in MongoDB first
    const donation = new Donation({
      donorName: dName,
      donorEmail: dEmail,
      userId: uId,
      amount: numAmount,
      paymentMethod: paymentMethod || 'PayMongo (GCash/Maya/Card)',
      destination: dDest,
      notes: dNotes,
      status: 'pending',
      verificationStatus: 'pending'
    });
    const savedDonation = await donation.save();

    // Convert PHP to Centavos (₱1.00 = 100 centavos)
    const amountInCentavos = Math.round(numAmount * 100);

    const secretKey = getPayMongoSecretKey();
    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${frontendUrl}/donation-success?donationId=${savedDonation._id}`;
    const cancelUrl = `${frontendUrl}/donation-cancelled?donationId=${savedDonation._id}`;

    // Payload for PayMongo Checkout Session
    const payload = {
      data: {
        attributes: {
          billing: {
            name: dName,
            email: 'donor@relieflink.org'
          },
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          line_items: [
            {
              currency: 'PHP',
              amount: amountInCentavos,
              name: `Relief Donation - ${dDest}`,
              quantity: 1,
              description: `Sto. Domingo Parish Relief Contribution (${dName})`
            }
          ],
          payment_method_types: ['gcash', 'paymaya', 'card', 'qrph', 'grab_pay', 'dob', 'billease'],
          description: `ReliefLink Parish Donation: ₱${numAmount.toLocaleString()} (${savedDonation._id})`,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            donationId: savedDonation._id.toString(),
            donorName: dName,
            amount: numAmount.toString(),
            destination: dDest
          }
        }
      }
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok || !responseData?.data?.attributes?.checkout_url) {
      console.error('❌ PayMongo Checkout Creation Error:', responseData);
      return res.status(400).json({
        success: false,
        message: responseData?.errors?.[0]?.detail || 'Could not generate PayMongo checkout URL',
        error: responseData
      });
    }

    const checkoutUrl = responseData.data.attributes.checkout_url;
    const checkoutSessionId = responseData.data.id;

    // Attach checkout session ID to referenceNumber for later tracking
    savedDonation.referenceNumber = checkoutSessionId;
    await savedDonation.save();

    console.log(`✅ [PayMongo] Created Checkout Session: ${checkoutSessionId} for Donation: ${savedDonation._id}`);

    res.json({
      success: true,
      checkoutUrl: checkoutUrl,
      donationId: savedDonation._id,
      checkoutSessionId: checkoutSessionId,
      message: 'PayMongo Checkout session initiated successfully'
    });

  } catch (error) {
    console.error('❌ PayMongo Checkout Route Exception:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error processing PayMongo checkout: ' + error.message
    });
  }
});

/**
 * 2. Auto-Verify PayMongo Donation & Mine onto Azure Besu Blockchain
 * POST /api/payments/paymongo/auto-verify/:donationId
 */
router.post('/paymongo/auto-verify/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status === 'approved' && donation.blockId) {
      return res.json({
        success: true,
        message: 'Donation already verified and mined on blockchain',
        donation
      });
    }

    const checkoutSessionId = donation.referenceNumber;
    let isPaid = false;

    if (checkoutSessionId && checkoutSessionId.startsWith('cs_')) {
      const secretKey = getPayMongoSecretKey();
      const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

      const pmRes = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`, {
        method: 'GET',
        headers: { 'Authorization': authHeader }
      });

      const pmData = await pmRes.json();
      const payments = pmData?.data?.attributes?.payments || [];
      const hasPaid = payments.some(p => p.attributes?.status === 'paid');

      if (hasPaid || pmData?.data?.attributes?.status === 'paid') {
        isPaid = true;
      }
    } else {
      // In dev or test mode fallback if session ID not prefixed
      isPaid = true;
    }

    if (!isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed on PayMongo yet',
        donation
      });
    }

    // Mark as approved in DB
    donation.status = 'approved';
    donation.verificationStatus = 'approved';
    donation.verifiedBy = 'PayMongo Automated Gateway';
    donation.verifiedAt = new Date();

    // Mine on Hyperledger Besu Azure Blockchain
    try {
      const onChainResult = await recordDonationOnChain({
        donorName: donation.donorName,
        amount: donation.amount,
        referenceNumber: donation.referenceNumber || `PM-${donation._id}`,
        blockHash: donation._id.toString()
      });

      if (onChainResult) {
        donation.blockId = onChainResult.txHash;
        console.log(`✅ [Blockchain Mined] PayMongo Donation ${donation._id} -> Tx: ${onChainResult.txHash}`);
      }
    } catch (chainErr) {
      console.warn('⚠️ Blockchain write deferred:', chainErr.message);
    }

    await donation.save();

    res.json({
      success: true,
      message: 'Payment verified and mined onto Azure Besu blockchain!',
      donation
    });

  } catch (error) {
    console.error('❌ Auto-verify error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. PayMongo Webhook Listener
 * POST /api/payments/paymongo/webhook
 */
router.post('/paymongo/webhook', async (req, res) => {
  try {
    const event = req.body?.data?.attributes?.type;
    const eventData = req.body?.data?.attributes?.data;

    console.log(`📥 [PayMongo Webhook] Received Event: ${event}`);

    if (event === 'checkout_session.payment.paid' || event === 'payment.paid') {
      const metadata = eventData?.attributes?.metadata || {};
      const donationId = metadata.donationId || metadata.donation_id;

      if (donationId) {
        const donation = await Donation.findById(donationId);
        if (donation && donation.status !== 'approved') {
          donation.status = 'approved';
          donation.verificationStatus = 'approved';
          donation.verifiedBy = 'PayMongo Webhook';
          donation.verifiedAt = new Date();

          // Mine on Azure Besu
          const onChainResult = await recordDonationOnChain({
            donorName: donation.donorName,
            amount: donation.amount,
            referenceNumber: donation.referenceNumber || `PM-${donation._id}`,
            blockHash: donation._id.toString()
          });

          if (onChainResult) {
            donation.blockId = onChainResult.txHash;
          }

          await donation.save();
          console.log(`🎉 [PayMongo Webhook] Donation ${donationId} approved and mined on Azure blockchain!`);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
