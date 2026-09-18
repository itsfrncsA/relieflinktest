const nodemailer = require('nodemailer');

// Temporary in-memory OTP store (email -> { code, expiresAt, verified })
const otpStore = new Map();

function getTransporter() {
  const rawUser = process.env.EMAIL_USER || (process.env.SMTP_USER && !process.env.SMTP_USER.includes('your_email') ? process.env.SMTP_USER : 'francisarillo3211@gmail.com');
  const rawPass = process.env.EMAIL_PASS || (process.env.SMTP_PASS && !process.env.SMTP_PASS.includes('your_app_password') ? process.env.SMTP_PASS : 'gqgmltlrpqwplsvj');

  if (!rawUser || !rawPass) {
    return null;
  }

  const user = rawUser.trim();
  const pass = rawPass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email, otp) {
  const normalizedEmail = email.trim().toLowerCase();
  
  otpStore.set(normalizedEmail, {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    verified: false
  });

  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_USER || 'francisarillo3211@gmail.com';
  const mailOptions = {
    from: `"ReliefLink" <${fromEmail}>`,
    to: normalizedEmail,
    subject: 'Your ReliefLink Security Code',
    text: `Your ReliefLink verification code is: ${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">ReliefLink Security Code</h2>
        <p style="color: #475569; font-size: 15px;">Use the verification code below to verify your account or reset your password:</p>
        <div style="background-color: #f1f5f9; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">© ${new Date().getFullYear()} ReliefLink - Sto. Domingo Parish</p>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[OTP] Email successfully sent to ${normalizedEmail}`);
    } catch (err) {
      console.error(`[OTP] Failed to send email via SMTP (${err.message}). Logging OTP in console:`, otp);
      const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_SHOW_OTP === 'true';
      if (!isDev) {
        throw new Error(`Failed to deliver OTP email: ${err.message}`);
      }
    }
  } else {
    console.log(`[OTP] SMTP not configured. OTP for ${normalizedEmail} is: ${otp}`);
  }

  return otp;
}

function verifyOTP(email, code) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { success: false, message: 'No OTP requested for this email' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { success: false, message: 'OTP has expired. Please request a new code.' };
  }

  if (record.code === (code || '').trim()) {
    record.verified = true;
    return { success: true, message: 'OTP verified successfully' };
  }

  return { success: false, message: 'Invalid verification code' };
}

function consumeVerifiedOTP(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);
  if (record && record.verified) {
    otpStore.delete(normalizedEmail);
    return true;
  }
  return false;
}

module.exports = {
  otpStore,
  generateOTP,
  sendOtpEmail,
  verifyOTP,
  consumeVerifiedOTP
};
