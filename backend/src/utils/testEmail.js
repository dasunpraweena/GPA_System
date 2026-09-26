import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const testEmail = async () => {
  const targetEmail = process.argv[2] || config.email.user;

  console.log('--- Testing SMTP Email Configuration ---');
  console.log('Host:', config.email.host || '(empty)');
  console.log('Port:', config.email.port);
  console.log('User:', config.email.user || '(empty)');
  console.log('Sending test message to:', targetEmail || '(no target email specified)');
  console.log('----------------------------------------\n');

  if (!config.email.host || !config.email.user || !config.email.pass) {
    console.error('❌ Error: SMTP_HOST, SMTP_USER, or SMTP_PASS is missing in backend/.env.');
    console.log('\nPlease open backend/.env and configure your email settings.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port || 587,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });

  const fromAddr = (config.email.host.includes('outlook') || config.email.host.includes('office365') || config.email.user.includes('@outlook.') || config.email.user.includes('@hotmail.'))
    ? `"Semester GPA System" <${config.email.user}>`
    : (config.email.from || `"Semester GPA System" <${config.email.user}>`);

  try {
    console.log('1. Connecting and verifying SMTP server...');
    await transporter.verify();
    console.log('✅ SMTP connection and authentication successful!\n');

    if (targetEmail) {
      console.log(`2. Sending test email from ${fromAddr} to ${targetEmail}...`);
      const info = await transporter.sendMail({
        from: fromAddr,
        to: targetEmail,
        subject: 'Test Email — Semester GPA System (SUSL)',
        text: 'This is a test email verifying that your Outlook/Office 365 SMTP configuration in backend/.env is working properly!'
      });
      console.log(`✅ Test email delivered successfully! Message ID: ${info.messageId}`);
    }
  } catch (err) {
    console.error('❌ SMTP test failed with error:');
    console.error(err.message);
    if (err.message.includes('SendAsDenied')) {
      console.log('\n💡 Tip for Outlook/Office 365: The sender "from" address must match your username.');
    }
    if (err.message.includes('535') || err.message.includes('Authentication') || err.message.includes('Invalid login')) {
      console.log('\n💡 Tip: If you have Two-Step Verification enabled on your Microsoft account, you must create and use an App Password.');
    }
  }
};

testEmail();
