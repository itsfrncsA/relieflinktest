const crypto = require('crypto');

const AUDIT_SECRET = process.env.JWT_SECRET || process.env.BESU_PRIVATE_KEY || 'relieflink-immutable-blockchain-audit-2026';

/**
 * Deterministically compute the cryptographic audit seal for a donation
 */
function computeAuditHash(id, amount, destination, ref, timestamp) {
  const normalizedId = String(id || '').trim();
  const normalizedAmount = Number(amount || 0).toFixed(2);
  const normalizedDest = String(destination || '').trim().toLowerCase();
  const normalizedRef = String(ref || '').trim();
  const normalizedTime = timestamp ? new Date(timestamp).getTime() : 0;

  const payload = `RELIEFLINK:DONATION:${normalizedId}:${normalizedAmount}:${normalizedDest}:${normalizedRef}:${normalizedTime}`;
  return crypto.createHmac('sha256', AUDIT_SECRET).update(payload).digest('hex');
}

/**
 * Sign a donation record with its original immutable baseline amount and audit hash
 */
function signDonation(donation) {
  if (!donation) return;

  const baselineAmount = Number(
    donation.originalAmount !== undefined && donation.originalAmount !== null && !isNaN(Number(donation.originalAmount))
      ? donation.originalAmount
      : (donation.netAmount !== undefined && donation.netAmount !== null && !isNaN(Number(donation.netAmount))
          ? donation.netAmount
          : donation.amount)
  );

  donation.originalAmount = baselineAmount;
  donation.auditHash = computeAuditHash(
    donation._id,
    baselineAmount,
    donation.destination,
    donation.referenceNumber || donation.checkoutSessionId,
    donation.createdAt
  );

  return donation;
}

/**
 * Verify whether a donation record has been altered in the off-chain MongoDB database
 */
function verifyDonationIntegrity(donation) {
  if (!donation) {
    return { isTampered: false, verifiedAmount: 0, tamperedAmount: 0, discrepancy: 0 };
  }

  const currentAmount = Number(donation.amount || 0);

  // 1. Gateway verified ledger check (PayMongo QRPH / Card / E-Wallet)
  if (donation.netAmount !== undefined && donation.netAmount !== null && !isNaN(Number(donation.netAmount))) {
    const gatewayAmount = Number(donation.netAmount);
    if (Math.abs(currentAmount - gatewayAmount) > 0.009) {
      return {
        isTampered: true,
        verifiedAmount: gatewayAmount,
        tamperedAmount: currentAmount,
        discrepancy: currentAmount - gatewayAmount,
        reason: `Off-chain database tampering detected: MongoDB amount (₱${currentAmount.toFixed(2)}) disagrees with the immutable verified payment gateway net ledger (₱${gatewayAmount.toFixed(2)}).`,
        source: 'PAYMENT_LEDGER_MISMATCH',
        blockchainVerified: Boolean(donation.blockId)
      };
    }
  }

  // 2. Cryptographic baseline check (recorded when donation was mined/approved)
  if (donation.originalAmount !== undefined && donation.originalAmount !== null && !isNaN(Number(donation.originalAmount))) {
    const originalAmount = Number(donation.originalAmount);
    if (Math.abs(currentAmount - originalAmount) > 0.009) {
      return {
        isTampered: true,
        verifiedAmount: originalAmount,
        tamperedAmount: currentAmount,
        discrepancy: currentAmount - originalAmount,
        reason: `Cryptographic audit failure: MongoDB amount (₱${currentAmount.toFixed(2)}) disagrees with the recorded immutable baseline (₱${originalAmount.toFixed(2)}).`,
        source: 'CRYPTOGRAPHIC_AUDIT_MISMATCH',
        blockchainVerified: Boolean(donation.blockId)
      };
    }
  }

  // 3. Cryptographic HMAC audit seal check (if auditHash was present)
  if (donation.auditHash && donation.createdAt) {
    const testHash = computeAuditHash(
      donation._id,
      currentAmount,
      donation.destination,
      donation.referenceNumber || donation.checkoutSessionId,
      donation.createdAt
    );

    if (testHash !== donation.auditHash) {
      // Amount or attributes have been modified in DB
      const expectedBaseline = Number(donation.originalAmount || donation.netAmount || currentAmount);
      return {
        isTampered: true,
        verifiedAmount: expectedBaseline,
        tamperedAmount: currentAmount,
        discrepancy: currentAmount - expectedBaseline,
        reason: `Cryptographic seal verification failed: Data integrity signature mismatch. Off-chain database fields have been altered.`,
        source: 'HMAC_SEAL_MISMATCH',
        blockchainVerified: Boolean(donation.blockId)
      };
    }
  }

  return {
    isTampered: false,
    verifiedAmount: currentAmount,
    tamperedAmount: currentAmount,
    discrepancy: 0,
    reason: null,
    source: 'CLEAN_VERIFIED',
    blockchainVerified: Boolean(donation.blockId)
  };
}

/**
 * Enriches a donation plain object or Mongoose document with audit flags
 */
function enrichDonation(d) {
  if (!d) return d;
  const obj = typeof d.toObject === 'function' ? d.toObject() : { ...d };
  const audit = verifyDonationIntegrity(obj);

  obj.isTampered = audit.isTampered;
  obj.verifiedAmount = audit.verifiedAmount;
  obj.tamperedAmount = audit.tamperedAmount;
  obj.tamperDiscrepancy = audit.discrepancy;
  obj.tamperReason = audit.reason;
  obj.blockchainVerified = audit.blockchainVerified;

  // BLOCKCHAIN IMMUTABILITY OVERRIDE:
  // When the DB is tampered, the change DOES NOT push through!
  // The authentic blockchain value overrides the altered database value.
  if (audit.isTampered) {
    obj.dbAttemptedAmount = obj.amount; // Save the attempted unauthorized value
    obj.amount = audit.verifiedAmount;  // Enforce authentic blockchain amount
    if (obj.remainingBalance !== undefined && obj.remainingBalance > audit.verifiedAmount) {
      obj.remainingBalance = audit.verifiedAmount;
    }

    // Asynchronously notify Superadmin via email (debounced per incident)
    try {
      const { sendTamperAlertEmail } = require('./emailAlertService');
      sendTamperAlertEmail({
        donationId: obj._id,
        donorName: obj.donorName || obj.name,
        referenceNumber: obj.referenceNumber || obj.checkoutSessionId,
        originalAmount: audit.verifiedAmount,
        tamperedAmount: audit.tamperedAmount,
        reason: audit.reason,
        txHash: obj.blockId
      }).catch(err => console.warn('⚠️ [auditService] Failed to dispatch tamper email:', err.message));
    } catch (emailErr) {
      console.warn('⚠️ [auditService] Email notification trigger error:', emailErr.message);
    }
  }

  return obj;
}

/**
 * Enriches an array of donation documents
 */
function enrichDonations(donations) {
  if (!Array.isArray(donations)) return [];
  return donations.map(enrichDonation);
}

module.exports = {
  computeAuditHash,
  signDonation,
  verifyDonationIntegrity,
  enrichDonation,
  enrichDonations
};
