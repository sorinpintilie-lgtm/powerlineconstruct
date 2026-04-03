const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    const nume = (data.nume || '').trim();
    const telefon = (data.telefon || '').trim();
    const email = (data.email || '').trim();
    const serviciu = (data.serviciu || '').trim();
    const mesaj = (data.mesaj || '').trim();

    if (!nume || !telefon || !serviciu || !mesaj) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Lipsesc câmpuri obligatorii.'
        })
      };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: process.env.CONTACT_TO_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      replyTo: email || process.env.SENDGRID_FROM_EMAIL,
      subject: `Cerere ofertă – ${serviciu}`,
      text:
        `Nume: ${nume}\n` +
        `Telefon: ${telefon}\n` +
        `Email: ${email || '-'}\n` +
        `Serviciu: ${serviciu}\n\n` +
        `Mesaj:\n${mesaj}`,
      html: `
        <h2>Cerere nouă de ofertă</h2>
        <p><strong>Nume:</strong> ${escapeHtml(nume)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(telefon)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email || '-')}</p>
        <p><strong>Serviciu:</strong> ${escapeHtml(serviciu)}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${escapeHtml(mesaj).replace(/\n/g, '<br>')}</p>
      `
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Mesaj trimis cu succes.'
      })
    };
  } catch (error) {
    console.error('SendGrid error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Eroare la trimitere.'
      })
    };
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}