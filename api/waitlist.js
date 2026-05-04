const nodemailer = require('nodemailer');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (response, statusCode, body) => {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(body));
};

module.exports = async (request, response) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    json(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const chunks = [];

    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const email = String(body.email || '').trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      json(response, 400, { error: 'Please enter a valid email address.' });
      return;
    }

    const smtpUser = process.env.GOOGLE_SMTP_USER;
    const smtpPass = process.env.GOOGLE_SMTP_PASS;
    const notifyTo = process.env.WAITLIST_NOTIFY_TO;
    const notifyFrom = process.env.WAITLIST_NOTIFY_FROM || smtpUser;

    if (!smtpUser || !smtpPass || !notifyTo) {
      json(response, 500, { error: 'Waitlist email service is not configured.' });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: notifyFrom,
      to: notifyTo,
      subject: 'New Almond Bloom waitlist signup',
      html: `<p>New waitlist signup:</p><p><strong>${email}</strong></p>`,
      text: `New Almond Bloom waitlist signup: ${email}`,
    });

    json(response, 200, { ok: true });
  } catch (error) {
    json(response, 500, { error: 'Waitlist submission failed.' });
  }
};
