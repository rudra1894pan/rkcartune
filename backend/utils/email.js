const { Resend } = require('resend');

let resend = null;

function getClient() {
  if (resend) return resend;

  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — email notifications are disabled.');
    return null;
  }

  resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/**
 * Sends an email. Never throws — logs and swallows errors so a failed email
 * never breaks the booking flow itself (the booking still succeeds either way).
 */
async function sendEmail({ to, subject, html }) {
  try {
    const client = getClient();
    if (!client) return;

    const { data, error } = await client.emails.send({
      from: 'RKCartune <onboarding@resend.dev>', // shared Resend domain, works immediately
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[email] send failed:', error.message);
    } else {
      console.log(`[email] sent "${subject}" to ${to}`, data.id);
    }
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