/* ==========================================================================
   DELIVERY — how a commission request reaches the owner

   Right now this is in DEMO mode: requests are validated, given a reference
   and recorded in the dashboard, but nothing leaves the browser. The UI says
   so; it does not pretend a message was sent.

   To make it real, change MODE below and fill in the matching config. Each
   route is already implemented — no other file needs editing.

     'demo'      nothing is sent (current)
     'formspree' POSTs to a Formspree form; the owner gets an email
     'whatsapp'  opens WhatsApp with the request pre-filled
     'email'     opens the visitor's mail client with the request pre-filled
   ========================================================================== */

export const DELIVERY = {
  MODE: 'formspree',

  formspree: {
    // Live form. Free tier covers roughly 50 submissions a month; past that
    // Formspree holds them and emails a warning, so watch the count if the
    // house starts getting real traffic.
    endpoint: 'https://formspree.io/f/mkjwrzow'
  },

  whatsapp: {
    // International format, digits only — no +, spaces or dashes.
    // 0903 696 1268 in local Nigerian form.
    number: '2349036961268'
  },

  email: {
    address: 'atelier@dprincecouture.com'
  }
};

/** Human-readable transcript of a request — used by every delivery route. */
export function formatRequest(data) {
  const lines = [
    'NEW COMMISSION REQUEST',
    `Reference: ${data.reference}`,
    '',
    `Style:      ${data.styleName || '—'}`,
    `Fabric:     ${data.fabric || '—'}`,
    `Colour:     ${data.colour || '—'}`,
    `Occasion:   ${data.occasion || '—'}`,
    `Needed by:  ${data.needed || '—'}`,
    '',
    'CLIENT',
    `Name:   ${data.name}`,
    `Email:  ${data.email}`,
    `Phone:  ${data.phone || '—'}`,
    `City:   ${data.city || '—'}`,
    ''
  ];

  const measurements = Object.entries(data.measurements || {})
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}cm`);

  if (measurements.length) {
    lines.push('MEASUREMENTS', measurements.join('  ·  '), '');
  }

  if (data.message) lines.push('MESSAGE', data.message, '');

  return lines.join('\n');
}

/**
 * Deliver a request.
 * @returns {Promise<{ok: boolean, mode: string, message: string}>}
 */
export async function deliver(data) {
  const transcript = formatRequest(data);

  switch (DELIVERY.MODE) {
    case 'formspree': {
      try {
        const response = await fetch(DELIVERY.formspree.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, _subject: `Commission request ${data.reference}`, transcript })
        });
        if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
        return {
          ok: true,
          mode: 'formspree',
          message: 'Your request has been sent to the atelier.'
        };
      } catch (error) {
        console.error('[delivery] Formspree submission failed.', error);
        return {
          ok: false,
          mode: 'formspree',
          message:
            'We could not send your request just now. Please check your connection ' +
            'and try again, or contact the atelier directly.'
        };
      }
    }

    case 'whatsapp': {
      const url = `https://wa.me/${DELIVERY.whatsapp.number}?text=${encodeURIComponent(transcript)}`;
      window.open(url, '_blank', 'noopener');
      return {
        ok: true,
        mode: 'whatsapp',
        message: 'WhatsApp has opened with your request — press send to deliver it.'
      };
    }

    case 'email': {
      const subject = encodeURIComponent(`Commission request ${data.reference}`);
      const body = encodeURIComponent(transcript);
      window.location.href = `mailto:${DELIVERY.email.address}?subject=${subject}&body=${body}`;
      return {
        ok: true,
        mode: 'email',
        message: 'Your mail app has opened with the request — press send to deliver it.'
      };
    }

    case 'demo':
    default:
      return {
        ok: true,
        mode: 'demo',
        message:
          'Your request has been recorded in this browser. No message has been ' +
          'sent — this site is not yet connected to the atelier.'
      };
  }
}
