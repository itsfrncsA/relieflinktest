const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// In-memory set to prevent spamming superadmins on every request.
// Key: `${donationId}_${attemptedAmount}`
const sentAlerts = new Map();

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const rawUser = process.env.EMAIL_USER || (process.env.SMTP_USER && !process.env.SMTP_USER.includes('your_email') ? process.env.SMTP_USER : 'francisarillo3211@gmail.com');
  const rawPass = process.env.EMAIL_PASS || (process.env.SMTP_PASS && !process.env.SMTP_PASS.includes('your_app_password') ? process.env.SMTP_PASS : 'gqgmltlrpqwplsvj');

  if (!rawUser || !rawPass) {
    return null;
  }

  const user = rawUser.trim();
  const pass = rawPass.replace(/\s+/g, '');

  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  return cachedTransporter;
}

/**
 * Get superadmin email addresses: exclusively Francis Arillo
 */
async function getSuperadminEmails() {
  return ['francisarillo@gmail.com'];
}

/**
 * Send an immediate High-Priority Security Incident Email to Superadmins.
 * Debounced so it only sends once per unique incident within a 1-hour window.
 */
async function sendTamperAlertEmail({ donationId, donorName, referenceNumber, originalAmount, tamperedAmount, reason, txHash }) {
  const cacheKey = `${donationId}_${tamperedAmount}`;
  const lastSent = sentAlerts.get(cacheKey);
  const now = Date.now();

  // Debounce: don't resend for identical tamper within 30 minutes
  if (lastSent && (now - lastSent) < 30 * 60 * 1000) {
    return { sent: false, reason: 'debounced' };
  }

  // Set immediately to block concurrent execution from parallel array/loop calls
  sentAlerts.set(cacheKey, now);

  const transporter = getTransporter();
  if (!transporter) {
    sentAlerts.delete(cacheKey);
    console.warn('⚠️ [emailAlertService] No email transporter configured.');
    return { sent: false, reason: 'no_transporter' };
  }

  const recipients = await getSuperadminEmails();
  if (recipients.length === 0) {
    recipients.push('francisarillo@gmail.com');
  }

  const fromEmail = process.env.EMAIL_USER || 'francisarillo3211@gmail.com';
  const discrepancy = Number(tamperedAmount) - Number(originalAmount);
  const formattedOriginal = `₱${Number(originalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedTampered = `₱${Number(tamperedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedDiff = `${discrepancy >= 0 ? '+' : ''}₱${discrepancy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const dashboardUrl = process.env.DASHBOARD_LOGIN_URL || 'https://relieflink-4w1g.onrender.com/admin-login';

  const mailOptions = {
    from: `"ReliefLink Security Shield" <${fromEmail}>`,
    to: recipients.join(', '),
    subject: `🚨 [SECURITY INCIDENT] Tampered Donation Detected - ID: ${donationId?.toString().slice(-6) || 'N/A'}`,
    text: `CRITICAL SECURITY ALERT: DATABASE TAMPERING DETECTED\n\n` +
      `The ReliefLink Cryptographic Audit Shield detected an unauthorized modification in MongoDB:\n\n` +
      `Donor: ${donorName || 'Anonymous'}\n` +
      `Reference Number: ${referenceNumber || 'N/A'}\n` +
      `Donation ID: ${donationId}\n` +
      `Authentic Amount (Blockchain / Net): ${formattedOriginal}\n` +
      `Attempted Altered DB Amount: ${formattedTampered}\n` +
      `Discrepancy: ${formattedDiff}\n` +
      `Transaction Hash: ${txHash || 'On-chain authenticated'}\n\n` +
      `ACTION TAKEN:\n` +
      `The system successfully BLOCKED the altered value from pushing through. Financial calculations, charts, and disbursements strictly remain preserved at ${formattedOriginal}.\n\n` +
      `Log in to the Superadmin Dashboard to review and click "Sync Database Back to Blockchain" to restore the MongoDB record:\n${dashboardUrl}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #ffffff; border: 2px solid #ef4444; border-radius: 14px; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.15);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid #fee2e2; padding-bottom: 16px;">
          <div style="font-size: 32px;">🚨</div>
          <div>
            <h2 style="color: #991b1b; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.3px;">
              SECURITY ALERT: Database Record Tampered
            </h2>
            <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">
              ReliefLink Cryptographic Tamper Shield • Sto. Domingo Parish
            </p>
          </div>
        </div>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
          <p style="color: #991b1b; font-size: 14px; line-height: 1.5; margin: 0; font-weight: 600;">
            An off-chain alteration was detected in MongoDB. The database value was manipulated, but our blockchain verification system has <strong>intercepted and blocked</strong> the change from pushing through.
          </p>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; color: #4b5563; letter-spacing: 0.5px; margin: 18px 0 10px 0;">
          Incident Audit Details
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 8px; color: #6b7280; width: 40%;">Donor Name:</td>
              <td style="padding: 10px 8px; font-weight: 700; color: #111827;">${donorName || 'Anonymous Donor'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 8px; color: #6b7280;">Reference / ID:</td>
              <td style="padding: 10px 8px; font-family: monospace; font-size: 13px; color: #374151;">${referenceNumber || donationId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6; background-color: #ecfdf5;">
              <td style="padding: 10px 8px; color: #065f46; font-weight: 600;">Authentic Amount (Blockchain):</td>
              <td style="padding: 10px 8px; font-weight: 800; color: #047857; font-size: 15px;">
                ${formattedOriginal} <span style="background: #10b981; color: #ffffff; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">VERIFIED</span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6; background-color: #fef2f2;">
              <td style="padding: 10px 8px; color: #991b1b; font-weight: 600;">Tampered DB Value:</td>
              <td style="padding: 10px 8px; font-weight: 800; color: #dc2626; font-size: 15px;">
                ${formattedTampered} <span style="background: #ef4444; color: #ffffff; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">TAMPERED</span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 8px; color: #6b7280;">Unlawful Discrepancy:</td>
              <td style="padding: 10px 8px; font-weight: 700; color: #b91c1c;">${formattedDiff}</td>
            </tr>
            ${txHash ? `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 8px; color: #6b7280;">Smart Contract Tx:</td>
              <td style="padding: 10px 8px; font-family: monospace; font-size: 12px; color: #2563eb; word-break: break-all;">
                ${txHash}
              </td>
            </tr>` : ''}
          </tbody>
        </table>

        <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
          <div style="font-weight: 700; color: #065f46; font-size: 13px; margin-bottom: 4px;">
            🛡️ IMMUTABILITY GUARANTEE ACTIVE
          </div>
          <div style="font-size: 13px; color: #334155; line-height: 1.4;">
            The tampered value (${formattedTampered}) has been <strong>rejected</strong>. All dashboard metrics, reports, and aid disbursement limits are locked to the verified amount (${formattedOriginal}).
          </div>
        </div>

        <div style="text-align: center; margin-top: 28px; margin-bottom: 10px;">
          <a href="${dashboardUrl}" style="background-color: #dc2626; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.3);">
            Open Admin Login to Review &amp; Restore
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This automated security notification was dispatched by ReliefLink Blockchain Guard.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    sentAlerts.set(cacheKey, now);
    console.log(`🚨 [emailAlertService] Tamper security alert email sent to [${recipients.join(', ')}]. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, recipients };
  } catch (err) {
    console.error('❌ [emailAlertService] Error sending tamper alert email:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = {
  sendTamperAlertEmail,
  getSuperadminEmails
};
