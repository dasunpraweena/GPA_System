import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

/**
 * Creates and returns configured Nodemailer SMTP transporter
 */
const getTransporter = () => {
  if (!config.email.host || !config.email.user) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port || 587,
    secure: config.email.port === 465, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: config.email.user,
      pass: config.email.pass
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
};

/**
 * Resolves safe 'from' address.
 * For Outlook/Office 365, Microsoft rejects messages if the from address
 * doesn't match the authenticated account (SendAsDenied error).
 */
const getFromAddress = () => {
  if (!config.email.user) return config.email.from;
  const isOutlook = (config.email.host && (config.email.host.includes('outlook') || config.email.host.includes('office365'))) ||
                    (config.email.user.includes('@outlook.') || config.email.user.includes('@hotmail.') || config.email.user.includes('@live.'));
  if (isOutlook) {
    return `"Semester GPA System" <${config.email.user}>`;
  }
  return config.email.from || `"Semester GPA System" <${config.email.user}>`;
};

/**
 * Sends verification email to student university mailbox
 */
export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${config.clientOrigin}?auth=verify-token&token=${token}&email=${encodeURIComponent(email)}`;

  console.log('\n======================================================');
  console.log('✉️  EMAIL VERIFICATION LINK');
  console.log(`To: ${email}`);
  console.log(`Verification URL: ${verifyUrl}`);
  console.log('======================================================\n');

  const transporter = getTransporter();
  if (transporter) {
    try {
      const fromAddr = getFromAddress();
      const info = await transporter.sendMail({
        from: fromAddr,
        to: email,
        subject: 'Verify your University Email — Semester GPA System (SUSL)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #dce5df; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #1b4338; color: #ffffff; border-radius: 10px; font-family: Georgia, serif; font-size: 26px; font-weight: bold;">Σ</div>
              <h2 style="color: #1b4338; margin: 12px 0 4px; font-size: 22px;">Semester GPA System</h2>
              <p style="color: #63736e; font-size: 13px; margin: 0;">Sabaragamuwa University of Sri Lanka · Faculty of Computing</p>
            </div>
            
            <p style="color: #192d2a; font-size: 15px; line-height: 1.6;">Hello,</p>
            <p style="color: #192d2a; font-size: 15px; line-height: 1.6;">
              Thank you for registering. Please confirm that you own this university mailbox (<strong>${email}</strong>) to activate your account and access your academic results.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background: #1b4338; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                Verify University Email
              </a>
            </div>

            <p style="color: #6a7975; font-size: 13px; line-height: 1.5;">
              Or copy and paste this link into your browser:<br/>
              <a href="${verifyUrl}" style="color: #245d40; word-break: break-all;">${verifyUrl}</a>
            </p>

            <div style="margin-top: 30px; padding-top: 18px; border-top: 1px solid #e1e7e5; color: #8b9d96; font-size: 12px; line-height: 1.5;">
              This single-use link expires in 24 hours. If you did not create an account on the Semester GPA system, please ignore this email.
            </div>
          </div>
        `
      });
      console.log(`[Mailer] Real email successfully delivered via SMTP to ${email}. MessageId: ${info.messageId}`);
    } catch (err) {
      console.error(`[Mailer] Failed to send email via SMTP to ${email}:`, err.message);
    }
  } else {
    console.log('[Mailer] SMTP credentials not set in backend/.env. Using console output above.');
  }

  return verifyUrl;
};

/**
 * Sends password reset email
 */
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${config.clientOrigin}?auth=reset&token=${token}&email=${encodeURIComponent(email)}`;

  console.log('\n======================================================');
  console.log('🔑 PASSWORD RESET LINK');
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('======================================================\n');

  const transporter = getTransporter();
  if (transporter) {
    try {
      const fromAddr = getFromAddress();
      const info = await transporter.sendMail({
        from: fromAddr,
        to: email,
        subject: 'Reset your Password — Semester GPA System (SUSL)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #dce5df; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #1b4338; color: #ffffff; border-radius: 10px; font-family: Georgia, serif; font-size: 26px; font-weight: bold;">Σ</div>
              <h2 style="color: #1b4338; margin: 12px 0 4px; font-size: 22px;">Semester GPA System</h2>
              <p style="color: #63736e; font-size: 13px; margin: 0;">Sabaragamuwa University of Sri Lanka · Faculty of Computing</p>
            </div>
            
            <p style="color: #192d2a; font-size: 15px; line-height: 1.6;">Hello,</p>
            <p style="color: #192d2a; font-size: 15px; line-height: 1.6;">
              We received a request to reset the password for your account (<strong>${email}</strong>). Click the button below to choose a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #1b4338; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="color: #6a7975; font-size: 13px; line-height: 1.5;">
              Or copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color: #245d40; word-break: break-all;">${resetUrl}</a>
            </p>

            <div style="margin-top: 30px; padding-top: 18px; border-top: 1px solid #e1e7e5; color: #8b9d96; font-size: 12px; line-height: 1.5;">
              This link is valid for 1 hour. If you did not request a password reset, your password will remain unchanged.
            </div>
          </div>
        `
      });
      console.log(`[Mailer] Password reset email delivered via SMTP to ${email}. MessageId: ${info.messageId}`);
    } catch (err) {
      console.error(`[Mailer] Failed to send password reset email via SMTP to ${email}:`, err.message);
    }
  }

  return resetUrl;
};
