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

    const resendApiKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.WAITLIST_NOTIFY_TO;
    const notifyFrom = process.env.WAITLIST_NOTIFY_FROM || 'Almond Bloom <onboarding@resend.dev>';

    if (!resendApiKey || !notifyTo) {
      json(response, 500, { error: 'Waitlist email service is not configured.' });
      return;
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: notifyFrom,
        to: notifyTo,
        subject: 'New Almond Bloom waitlist signup',
        html: `<p>New waitlist signup:</p><p><strong>${email}</strong></p>`,
        text: `New Almond Bloom waitlist signup: ${email}`,
      }),
    });

    if (!resendResponse.ok) {
      json(response, 502, { error: 'Waitlist email could not be sent.' });
      return;
    }

    json(response, 200, { ok: true });
  } catch (error) {
    json(response, 500, { error: 'Waitlist submission failed.' });
  }
};
