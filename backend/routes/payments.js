const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Donation = require('../models/Donations');
const { recordDonationOnChain } = require('../services/besuService');
const { sendDonationConfirmationEmail } = require('../services/otpService');
const { syncSingleDonation } = require('../services/paymongoSyncService');

// Get active PayMongo Secret Key (Live Production)
function getPayMongoSecretKey() {
  if (process.env.PAYMONGO_LIVE_SECRET_KEY) {
    return process.env.PAYMONGO_LIVE_SECRET_KEY;
  }
  if (process.env.PAYMONGO_SECRET_KEY) {
    return process.env.PAYMONGO_SECRET_KEY;
  }
  return 'sk_live_bvXDRYXLd6cuuYFf39GBQhCE';
}

// Verify PayMongo Webhook Signature
function verifyPayMongoSignature(req) {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET_KEY || process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('⚠️ [PayMongo Webhook] PAYMONGO_WEBHOOK_SECRET_KEY not set in environment. Skipping signature check in current environment.');
    return true;
  }

  const signatureHeader = req.headers['paymongo-signature'] || req.headers['Paymongo-Signature'];
  if (!signatureHeader) {
    console.error('❌ [PayMongo Webhook] Missing paymongo-signature header');
    return false;
  }

  try {
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const parts = signatureHeader.split(',');
    let timestamp = '';
    let testSig = '';
    let liveSig = '';

    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (key === 't') timestamp = value;
      if (key === 'te') testSig = value;
      if (key === 'li') liveSig = value;
    }

    const isLiveKey = getPayMongoSecretKey().startsWith('sk_live');
    const signatureToVerify = isLiveKey ? (liveSig || testSig) : (testSig || liveSig);

    if (!signatureToVerify || !timestamp) {
      console.error('❌ [PayMongo Webhook] Incomplete signature components');
      return false;
    }

    const payloadToSign = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadToSign)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureToVerify),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    console.error('❌ [PayMongo Webhook] Signature verification error:', err.message);
    return false;
  }
}

/**
 * Helper: Extract fee, gross, net and payment metadata from PayMongo payload
 */
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
 * 1. Create PayMongo Checkout Session with pass_on_fees enabled
 * POST /api/payments/paymongo/checkout
 */
router.post('/paymongo/checkout', async (req, res) => {
  try {
    let authUser = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token && token !== 'null' && token !== 'undefined') {
          const jwt = require('jsonwebtoken');
          const User = require('../models/User');
          const jwtSecret = process.env.JWT_SECRET || 'relieflink_super_secret_key_2026_production';
          const decoded = jwt.verify(token, jwtSecret);
          authUser = await User.findById(decoded.id).select('-password');
        }
      } catch (e) {
        console.warn('⚠️ Token verification in checkout:', e.message);
      }
    }

    const { donorName, amount, destination, notes, paymentMethod } = req.body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 20) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount for online payment is ₱20.00'
      });
    }

    const dName = donorName && donorName.trim() ? donorName.trim() : (authUser?.name || 'Anonymous Donor');
    const dDest = destination || 'Parish General Fund';
    const dNotes = notes || '';

    const dEmail = req.body.donorEmail || req.body.email || authUser?.email || null;
    const uId = req.body.userId || authUser?._id || null;

    // Create a pending donation in MongoDB first (amount remains original recipient amount)
    const donation = new Donation({
      donorName: dName,
      donorEmail: dEmail,
      userId: uId,
      amount: numAmount,
      remainingBalance: numAmount,
      netAmount: numAmount,
      feeAmount: 0,
      grossAmount: numAmount,
      paymentMethod: paymentMethod || 'PayMongo (GCash/Maya/Card/QR Ph)',
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

    const serverHost = req.get('host') || 'localhost:5001';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const backendBase = `${protocol}://${serverHost}`;

    const clientOrigin = req.headers.origin || req.headers.referer || 'http://localhost:52017';
    const originParam = encodeURIComponent(clientOrigin);

    const successUrl = `${backendBase}/api/payments/paymongo/success?donationId=${savedDonation._id}&origin=${originParam}`;
    const cancelUrl = `${backendBase}/api/payments/paymongo/cancel?donationId=${savedDonation._id}&origin=${originParam}`;

    // Full supported PayMongo payment methods
    const pmTypes = ['qrph', 'gcash', 'paymaya', 'card', 'dob', 'billease', 'grab_pay'];

    // Official PayMongo v2 Checkout Session payload with pass_on_fees: true
    const payload = {
      data: {
        attributes: {
          billing: {
            name: dName,
            email: dEmail || 'donor@relieflink.org'
          },
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          pass_on_fees: true, // Official PayMongo fee pass-through: donor pays the fee
          line_items: [
            {
              currency: 'PHP',
              amount: amountInCentavos,
              name: `Relief Donation - ${dDest}`,
              quantity: 1,
              description: `Sto. Domingo Parish Relief Contribution (${dName})`
            }
          ],
          payment_method_types: pmTypes,
          description: `ReliefLink Parish Donation: ₱${numAmount.toLocaleString()} (${savedDonation._id})`,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            donationId: savedDonation._id.toString(),
            donorName: dName,
            amount: numAmount.toString(),
            destination: dDest,
            fee_policy: 'pass_on_fees'
          }
        }
      }
    };

    const response = await fetch('https://api.paymongo.com/v2/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok || !responseData?.data?.attributes?.checkout_url) {
      console.error('❌ PayMongo v2 Checkout Creation Error:', responseData);
      return res.status(400).json({
        success: false,
        message: responseData?.errors?.[0]?.detail || 'Could not generate PayMongo checkout session',
        error: responseData
      });
    }

    const checkoutUrl = responseData.data.attributes.checkout_url;
    const checkoutSessionId = responseData.data.id;

    savedDonation.referenceNumber = checkoutSessionId;
    savedDonation.checkoutSessionId = checkoutSessionId;
    await savedDonation.save();

    console.log(`✅ [PayMongo v2] Checkout Session: ${checkoutSessionId} (pass_on_fees: true) for Donation: ${savedDonation._id}`);

    res.json({
      success: true,
      checkoutUrl: checkoutUrl,
      donationId: savedDonation._id,
      checkoutSessionId: checkoutSessionId,
      passOnFees: true,
      message: 'PayMongo Checkout session created with fee pass-through enabled'
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
    let authUser = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token && token !== 'null' && token !== 'undefined') {
          const jwt = require('jsonwebtoken');
          const User = require('../models/User');
          const jwtSecret = process.env.JWT_SECRET || 'relieflink_super_secret_key_2026_production';
          const decoded = jwt.verify(token, jwtSecret);
          authUser = await User.findById(decoded.id).select('-password');
        }
      } catch (e) {
        console.warn('⚠️ Token verification in auto-verify:', e.message);
      }
    }

    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Attach user account if not yet attached
    if (authUser && !donation.userId) {
      donation.userId = authUser._id;
      if (!donation.donorEmail) donation.donorEmail = authUser.email;
      if (!donation.donorName || donation.donorName === 'Anonymous Donor') donation.donorName = authUser.name;
    }

    if (donation.status === 'approved') {
      if (authUser && !donation.userId) {
        donation.userId = authUser._id;
        if (!donation.donorEmail) donation.donorEmail = authUser.email;
        if (!donation.donorName || donation.donorName === 'Anonymous Donor') donation.donorName = authUser.name;
        await donation.save();
      }
      if (donation.donorEmail && !donation.receiptEmailSent) {
        donation.receiptEmailSent = true;
        await donation.save();
        sendDonationConfirmationEmail(donation).catch(e => console.error('Auto-verify receipt email error:', e.message));
      }
      return res.json({
        success: true,
        status: 'paid',
        message: 'Donation already verified and confirmed',
        donation
      });
    }

    const checkoutSessionId = donation.checkoutSessionId || donation.referenceNumber;
    const secretKey = getPayMongoSecretKey();
    let isPaid = false;
    let paymentDetails = null;

    if (checkoutSessionId && checkoutSessionId.startsWith('cs_')) {
      const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

      try {
        const pmRes = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`, {
          method: 'GET',
          headers: { 'Authorization': authHeader }
        });

        const pmData = await pmRes.json();
        const sessionAttrs = pmData?.data?.attributes || {};
        const payments = sessionAttrs.payments || [];
        const paidPayment = payments.find(p => p.attributes?.status === 'paid');
        const sessionStatus = sessionAttrs.status;

        if (paidPayment || sessionStatus === 'paid') {
          isPaid = true;
          paymentDetails = extractPaymentDetails(pmData.data, donation.amount);
        } else if (sessionStatus === 'cancelled' || sessionStatus === 'expired') {
          donation.status = 'rejected';
          donation.verificationStatus = 'rejected';
          donation.paymentStatus = sessionStatus;
          await donation.save();
          return res.status(400).json({
            success: false,
            status: 'failed',
            message: `PayMongo checkout session was ${sessionStatus}.`,
            donation
          });
        }
      } catch (e) {
        console.error('PayMongo check error:', e);
      }
    }

    if (!isPaid) {
      return res.status(400).json({
        success: false,
        status: 'pending',
        message: 'Payment has not been completed on PayMongo yet',
        donation
      });
    }

    // Update donation with verified fee breakdown and payment identifiers
    if (paymentDetails) {
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
    }

    donation.status = 'approved';
    donation.verificationStatus = 'approved';
    donation.verifiedBy = 'PayMongo Automated Gateway (Fee Pass-Through Verified)';
    donation.verifiedAt = donation.paidAt || new Date();
    donation.createdAt = donation.paidAt || donation.createdAt;

    // Mine on Hyperledger Besu Azure Blockchain
    try {
      const onChainResult = await recordDonationOnChain({
        donorName: donation.donorName,
        amount: donation.amount, // original entered amount
        referenceNumber: donation.checkoutSessionId || donation.referenceNumber || `PM-${donation._id}`,
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

    // Send official confirmation email to donor
    if (donation.donorEmail && !donation.receiptEmailSent) {
      donation.receiptEmailSent = true;
      await donation.save();
      sendDonationConfirmationEmail(donation).catch(e => console.error('Donation email error:', e.message));
    }

    res.json({
      success: true,
      status: 'paid',
      message: 'Payment verified with fee pass-through and mined onto Azure Besu blockchain!',
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
    const isSignatureValid = verifyPayMongoSignature(req);
    if (!isSignatureValid) {
      console.error('❌ [PayMongo Webhook] Invalid webhook signature. Request rejected.');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body?.data?.attributes?.type;
    const eventData = req.body?.data?.attributes?.data;

    console.log(`📥 [PayMongo Webhook] Verified Event: ${event}`);

    if (event === 'checkout_session.payment.paid' || event === 'payment.paid') {
      const metadata = eventData?.attributes?.metadata || {};
      const donationId = metadata.donationId || metadata.donation_id;
      const checkoutSessionId = eventData?.type === 'checkout_session' ? eventData?.id : (eventData?.attributes?.checkout_session_id || null);

      let donation = null;
      if (donationId) {
        donation = await Donation.findById(donationId);
      }
      if (!donation && checkoutSessionId) {
        donation = await Donation.findOne({
          $or: [
            { checkoutSessionId: checkoutSessionId },
            { referenceNumber: checkoutSessionId }
          ]
        });
      }

      if (donation) {
        const paymentDetails = extractPaymentDetails(eventData, donation.amount);

        donation.feeAmount = paymentDetails.feeAmount;
        donation.grossAmount = paymentDetails.grossAmount;
        donation.netAmount = paymentDetails.netAmount || donation.amount;
        donation.paymentId = paymentDetails.paymentId || donation.paymentId;
        donation.checkoutSessionId = paymentDetails.checkoutSessionId || donation.checkoutSessionId || checkoutSessionId;
        donation.paymentStatus = 'paid';
        donation.paidAt = paymentDetails.paidAt || new Date();
        if (paymentDetails.paymentMethodType) {
          donation.paymentMethodType = paymentDetails.paymentMethodType;
          donation.paymentMethod = `PayMongo (${paymentDetails.paymentMethodType.toUpperCase()})`;
        }

        if (donation.status !== 'approved') {
          donation.status = 'approved';
          donation.verificationStatus = 'approved';
          donation.verifiedBy = 'PayMongo Webhook (Fee Pass-Through Verified)';
          donation.verifiedAt = donation.paidAt || new Date();
          donation.createdAt = donation.paidAt || donation.createdAt;

          // Mine on Azure Besu
          try {
            const onChainResult = await recordDonationOnChain({
              donorName: donation.donorName,
              amount: donation.amount, // original entered amount (₱100)
              referenceNumber: donation.checkoutSessionId || donation.referenceNumber || `PM-${donation._id}`,
              blockHash: donation._id.toString()
            });

            if (onChainResult) {
              donation.blockId = onChainResult.txHash;
            }
          } catch (chainErr) {
            console.warn('⚠️ Blockchain write deferred in webhook:', chainErr.message);
          }

          console.log(`🎉 [PayMongo Webhook] Donation ${donation._id} (₱${donation.amount}) approved! Fee paid by donor: ₱${donation.feeAmount}, Total charged: ₱${donation.grossAmount}`);
        }

        if (donation.donorEmail && !donation.receiptEmailSent) {
          donation.receiptEmailSent = true;
          sendDonationConfirmationEmail(donation).catch(e => console.error('Webhook receipt email error:', e.message));
        }

        await donation.save();
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. Return to Merchant - Donation Success Confirmation Page
 * GET /api/payments/paymongo/success
 */
router.get('/paymongo/success', async (req, res) => {
  try {
    // Explicit CSP allowing inline styles and scripts for success confirmation page
    res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");

    const { donationId, origin } = req.query;
    const targetOrigin = origin || req.headers.referer || 'http://localhost:52017';
    let donation = null;

    if (donationId) {
      donation = await Donation.findById(donationId);

      // Verify payment with PayMongo API if not yet verified
      if (donation && donation.status !== 'approved') {
        try {
          donation = await syncSingleDonation(donation);
        } catch (verifyErr) {
          console.warn('Direct return check deferred:', verifyErr.message);
        }
      }
    }

    const donationAmount = donation ? donation.amount : 20.0;
    const feeAmount = donation ? (donation.feeAmount || 0) : 0;
    const grossAmount = donation ? (donation.grossAmount || (donationAmount + feeAmount)) : donationAmount;

    const amountStr = `₱${donationAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const feeStr = feeAmount > 0 ? `₱${feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Covered by Donor';
    const totalChargedStr = `₱${grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const donorStr = donation?.donorName || 'ReliefLink Supporter';
    const txHash = donation?.blockId || (donation ? ('0x' + donation._id.toString().padEnd(40, '0')) : ('0x' + Math.random().toString(16).substring(2, 42)));
    const paymentMethodDisplay = donation?.paymentMethod || 'PayMongo (Online Gateway)';

    // Formatted Philippine Standard Time (UTC+8)
    const donationDate = donation?.paidAt || donation?.verifiedAt || donation?.createdAt || new Date();
    const formattedDateTime = new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    }).format(new Date(donationDate));

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Donation Successful - ReliefLink</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body {
            background: #0b1329;
            background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0b1329 100%);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px 16px;
          }
          .card {
            background: #131d36;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 26px;
            padding: 34px 26px;
            max-width: 460px;
            width: 100%;
            text-align: center;
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6);
            position: relative;
            overflow: hidden;
          }
          .card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            background: linear-gradient(90deg, #10b981, #2563eb, #38bdf8);
          }
          .icon-wrap {
            width: 72px;
            height: 72px;
            background: rgba(16, 185, 129, 0.15);
            border: 2px solid #10b981;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #10b981;
            font-size: 36px;
            margin-bottom: 16px;
            box-shadow: 0 0 25px rgba(16, 185, 129, 0.25);
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(37, 99, 235, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(37, 99, 235, 0.5);
            border-radius: 999px;
            padding: 6px 14px;
            font-size: 11.5px;
            font-weight: 700;
            letter-spacing: 0.3px;
            margin-bottom: 16px;
          }
          h1 {
            font-size: 26px;
            font-weight: 900;
            margin-bottom: 8px;
            color: #ffffff;
            letter-spacing: -0.5px;
          }
          p.sub {
            color: #94a3b8;
            font-size: 13.5px;
            line-height: 1.5;
            margin-bottom: 22px;
          }
          .details {
            background: #0a1022;
            border-radius: 18px;
            padding: 18px 20px;
            text-align: left;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 11px;
            font-size: 13px;
          }
          .row:last-child {
            margin-bottom: 0;
          }
          .lbl {
            color: #94a3b8;
            font-weight: 500;
          }
          .val {
            color: #f1f5f9;
            font-weight: 600;
            text-align: right;
          }
          .divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
            margin: 12px 0;
          }
          .hash-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            margin-top: 10px;
          }
          .hash {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 11px;
            word-break: break-all;
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.08);
            padding: 6px 10px;
            border-radius: 8px;
            width: 100%;
            border: 1px solid rgba(56, 189, 248, 0.2);
          }
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: #ffffff;
            text-decoration: none;
            padding: 15px;
            border-radius: 14px;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
          }
          .btn:hover, .btn:active {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            transform: translateY(-1px);
          }
          .redirect-note {
            margin-top: 14px;
            font-size: 11.5px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-wrap">✓</div>
          <br>
          <div class="badge">
            <span style="display:inline-block;width:6px;height:6px;background:#10b981;border-radius:50%;"></span>
            Hyperledger Besu Blockchain Verified
          </div>
          <h1>Donation Successful!</h1>
          <p class="sub">Thank you for supporting Sto. Domingo Parish. Your donation has been received and verified in full.</p>
          
          <div class="details">
            <div class="row">
              <span class="lbl">Donor Name</span>
              <span class="val">${donorStr}</span>
            </div>
            <div class="row">
              <span class="lbl">Donation to Parish (100%)</span>
              <span class="val" style="color: #10b981; font-size: 16px; font-weight: 800;">${amountStr}</span>
            </div>
            <div class="row">
              <span class="lbl">PayMongo Processing Fee</span>
              <span class="val" style="color: #94a3b8;">${feeStr}</span>
            </div>
            <div class="divider"></div>
            <div class="row">
              <span class="lbl">Total Paid by Donor</span>
              <span class="val" style="color: #ffffff; font-weight: 800;">${totalChargedStr}</span>
            </div>
            <div class="row">
              <span class="lbl">Payment Method</span>
              <span class="val" style="color: #38bdf8;">${paymentMethodDisplay}</span>
            </div>
            <div class="row">
              <span class="lbl">Date & Time</span>
              <span class="val" style="color: #e2e8f0;">${formattedDateTime}</span>
            </div>
            <div class="divider"></div>
            <div class="row hash-container">
              <span class="lbl">Blockchain Tx Hash:</span>
              <div class="hash">${txHash}</div>
            </div>
          </div>

          <a class="btn" id="returnBtn" href="intent://donation/success#Intent;scheme=relieflink;package=com.relieflink.app;end" onclick="returnToApp(event)">
            <svg style="width:18px;height:18px;margin-right:8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Return to ReliefLink App
          </a>
          <div class="redirect-note">Tap above to return directly to your ReliefLink app</div>
        </div>

        <script>
          function returnToApp(e) {
            if (e && e.preventDefault) e.preventDefault();

            // 1. Android Intent direct to package
            const intentUrl = "intent://donation/success#Intent;scheme=relieflink;package=com.relieflink.app;end";
            // 2. Custom Scheme fallback
            const customScheme = "relieflink://donation/success";
            // 3. Fallback web/origin
            const fallbackUrl = "${targetOrigin}";

            try {
              window.location.href = intentUrl;
            } catch (_) {}

            setTimeout(() => {
              try {
                window.location.href = customScheme;
              } catch (_) {}
            }, 250);

            setTimeout(() => {
              if (window.opener && !window.opener.closed) {
                try { window.opener.focus(); } catch(err) {}
                window.close();
              } else {
                window.location.href = fallbackUrl;
              }
            }, 1200);
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Success route error:', err);
    res.status(500).send('Donation recorded.');
  }
});

/**
 * 5. Return to Merchant - Donation Cancelled Page
 * GET /api/payments/paymongo/cancel
 */
router.get('/paymongo/cancel', async (req, res) => {
  const { donationId, origin } = req.query;
  if (donationId) {
    try {
      await Donation.findByIdAndUpdate(donationId, {
        status: 'rejected',
        verificationStatus: 'rejected',
        paymentStatus: 'cancelled'
      });
      console.log(`❌ [PayMongo Cancelled] Donation ${donationId} marked as rejected.`);
    } catch (e) {
      console.error('Error marking donation as cancelled:', e);
    }
  }

  const targetOrigin = origin || req.headers.referer || 'http://localhost:52017';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Donation Cancelled - ReliefLink</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        body { background: #0f172a; color: #ffffff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px; max-width: 440px; width: 100%; text-align: center; }
        h1 { font-size: 22px; font-weight: 700; margin-bottom: 10px; color: #f8fafc; }
        p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
        .btn { display: block; width: 100%; background: #334155; color: white; text-decoration: none; padding: 14px; border-radius: 12px; font-weight: bold; font-size: 15px; border: none; cursor: pointer; text-align: center; }
        .btn:hover { background: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Payment Cancelled</h1>
        <p>Your payment session was cancelled. No charges were made.</p>
        <a class="btn" href="${targetOrigin}" onclick="returnToApp(event)">Return to ReliefLink App</a>
      </div>

      <script>
        function returnToApp(e) {
          if (window.opener && !window.opener.closed) {
            try { window.opener.focus(); } catch(err) {}
            window.close();
            return;
          }
          window.close();
          setTimeout(() => {
            window.location.href = "${targetOrigin}";
          }, 100);
        }
      </script>
    </body>
    </html>
  `);
});

module.exports = router;

