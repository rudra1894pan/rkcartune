const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[email] EMAIL_USER/EMAIL_PASS not set — email notifications are disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail', // swap to host/port config below if using a non-Gmail SMTP provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

/**
 * Sends an email. Never throws — logs and swallows errors so a failed email
 * never breaks the booking flow itself (the booking still succeeds either way).
 */
async function sendEmail({ to, subject, html }) {
  try {
    const t = getTransporter();
    if (!t) return;

    await t.sendMail({
      from: `"RKCartune" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[email] sent "${subject}" to ${to}`);
  } catch (err) {
    console.error('[email] send failed:', err.message);
  }
}

function bookingRequestedEmail({ adminEmail, userName, userPhone, carLabel, visitDate }) {
  return sendEmail({
    to: adminEmail,
    subject: `New viewing request — ${carLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2 style="color:#FF5A1F;">New Booking Request</h2>
        <p><strong>${userName}</strong> (${userPhone}) requested a viewing for:</p>
        <p style="font-size:18px;"><strong>${carLabel}</strong></p>
        <p>Preferred visit date: <strong>${new Date(visitDate).toLocaleDateString()}</strong></p>
        <p>Log in to the admin panel to confirm or cancel this request.</p>
      </div>
    `,
  });
}

function bookingStatusUpdatedEmail({ userEmail, userName, carLabel, status }) {
  const statusLabel = status === 'confirmed' ? 'Confirmed ✅' : 'Cancelled ❌';
  const statusColor = status === 'confirmed' ? '#C9FF3D' : '#FF5A1F';

  return sendEmail({
    to: userEmail,
    subject: `Your viewing request was ${status}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2 style="color:${statusColor};">Booking ${statusLabel}</h2>
        <p>Hi ${userName},</p>
        <p>Your requested viewing for <strong>${carLabel}</strong> has been <strong>${status}</strong> by RKCartune.</p>
        <p>Log in to your account to see full details.</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, bookingRequestedEmail, bookingStatusUpdatedEmail };
