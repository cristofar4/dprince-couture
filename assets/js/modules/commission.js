/* ==========================================================================
   COMMISSION — the request flow that replaces the shopping bag

   The house makes to order, so the visitor does not buy: they choose a style,
   give their measurements and details, and send a request. What happens to
   that request is decided in modules/delivery.js.
   ========================================================================== */

import { getCatalogue, getDesign, addEnquiry } from './store.js';
import { formatPrice } from '../data/site.js';
import { deliver, DELIVERY } from './delivery.js';
import { validateForm } from './forms.js';
import { $, $$, escapeHtml, getParam, announce, prefersReducedMotion } from '../core/utils.js';
import { scrollTo } from '../core/scroll.js';

const MEASUREMENTS = [
  ['chest', 'Chest'], ['waist', 'Waist'], ['hip', 'Hip'],
  ['shoulder', 'Shoulder'], ['sleeve', 'Sleeve'], ['length', 'Full length'],
  ['neck', 'Neck'], ['thigh', 'Thigh'], ['height', 'Height']
];

export function initCommission() {
  const form = $('[data-commission-form]');
  if (!form) return;

  renderStyles();
  renderMeasurements();
  wireSummary();
  wireSubmit(form);
  showDeliveryNotice();
}

/* ==========================================================================
   STYLE PICKER — every design in the catalogue, plus "something else"
   ========================================================================== */

function renderStyles() {
  const picker = $('[data-style-picker]');
  if (!picker) return;

  const catalogue = getCatalogue();
  const preselect = getParam('design');

  picker.innerHTML = catalogue
    .map((item, index) => `
      <label class="style-option">
        <input type="radio" name="style" value="${escapeHtml(item.id)}"
               data-style-name="${escapeHtml(item.name)}"
               data-style-price="${item.price}"
               ${preselect === item.id || (!preselect && index === 0) ? 'checked' : ''}>
        <span class="style-option__face">
          <span class="style-option__media">
            <img src="${escapeHtml(item.images[0])}" alt="${escapeHtml(item.alt)}"
                 width="450" height="600" loading="lazy" decoding="async">
          </span>
          <span class="style-option__name">${escapeHtml(item.name)}</span>
          <span class="style-option__meta">${escapeHtml(item.category)} · from ${formatPrice(item.price)}</span>
        </span>
      </label>
    `)
    .join('') + `
      <label class="style-option">
        <input type="radio" name="style" value="other" data-style-name="Something else"
               data-style-price="0">
        <span class="style-option__face">
          <span class="style-option__media" style="display:grid;place-items:center;background:var(--cloth)">
            <span class="micro muted" style="padding:1rem;text-align:center">Describe it below</span>
          </span>
          <span class="style-option__name">Something else</span>
          <span class="style-option__meta">Quoted after consultation</span>
        </span>
      </label>
    `;

  // Arriving from a product page — say so, and scroll the choice into view
  if (preselect) {
    const design = getDesign(preselect);
    const banner = $('[data-style-banner]');
    if (design && banner) {
      banner.hidden = false;
      banner.innerHTML = `Requesting <strong>${escapeHtml(design.name)}</strong>. Change the style below if you would rather commission something else.`;
    }
  }
}

/* ==========================================================================
   MEASUREMENTS — all optional, and said to be optional
   ========================================================================== */

function renderMeasurements() {
  const grid = $('[data-measure-grid]');
  if (!grid) return;

  grid.innerHTML = MEASUREMENTS
    .map(([key, label]) => `
      <div class="field">
        <label class="field__label" for="m-${key}">${label} (cm)</label>
        <input class="field__control" type="number" id="m-${key}" name="m-${key}"
               min="0" max="300" step="0.5" inputmode="decimal" data-measure="${key}">
        <p class="field__message"></p>
      </div>
    `)
    .join('');
}

/* ==========================================================================
   LIVE SUMMARY
   ========================================================================== */

function wireSummary() {
  const form = $('[data-commission-form]');
  const summary = $('[data-commission-summary]');
  if (!form || !summary) return;

  function update() {
    const style = $('input[name="style"]:checked', form);
    const fabric = $('#fabric', form);
    const occasion = $('#occasion', form);
    const needed = $('#needed', form);
    const filled = $$('[data-measure]', form).filter((input) => input.value).length;

    const rows = [
      ['Style', style?.dataset.styleName || '—'],
      ['From', style && Number(style.dataset.stylePrice) > 0
        ? formatPrice(Number(style.dataset.stylePrice)) : 'On consultation'],
      ['Fabric', fabric?.value || '—'],
      ['Occasion', occasion?.value || '—'],
      ['Needed by', formatDate(needed?.value) || '—'],
      ['Measurements', filled ? `${filled} of ${MEASUREMENTS.length} given` : 'None yet']
    ];

    summary.innerHTML = rows
      .map(([label, value]) => `
        <div class="commission-summary__row">
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(String(value))}</dd>
        </div>
      `)
      .join('');
  }

  form.addEventListener('change', update);
  form.addEventListener('input', update);
  update();
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ==========================================================================
   DELIVERY NOTICE — states plainly what will happen on submit
   ========================================================================== */

function showDeliveryNotice() {
  const notice = $('[data-delivery-notice]');
  if (!notice) return;

  const copy = {
    demo:
      '<strong>This site is not yet connected to the atelier.</strong> Your request ' +
      'is validated and saved to the owner’s dashboard in this browser, but no ' +
      'message is sent anywhere. See README, “Connecting the form”.',
    formspree:
      '<strong>Your request is emailed to the atelier</strong> as soon as you send it. ' +
      'You will get a reference to quote in any follow-up.',
    whatsapp:
      '<strong>Your request opens in WhatsApp</strong> pre-filled and addressed to the ' +
      'atelier. Press send in WhatsApp to deliver it.',
    email:
      '<strong>Your request opens in your mail app</strong> pre-filled and addressed to ' +
      'the atelier. Press send to deliver it.'
  };

  notice.innerHTML = copy[DELIVERY.MODE] || copy.demo;
}

/* ==========================================================================
   SUBMIT
   ========================================================================== */

function reference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase().padStart(2, '0');
  return `DPC-${stamp}${random}`;
}

function collect(form) {
  const style = $('input[name="style"]:checked', form);
  const measurements = {};
  $$('[data-measure]', form).forEach((input) => {
    if (input.value) measurements[input.dataset.measure] = input.value;
  });

  return {
    reference: reference(),
    styleId: style?.value || '',
    styleName: style?.dataset.styleName || '',
    stylePrice: Number(style?.dataset.stylePrice) || 0,
    fabric: $('#fabric', form)?.value || '',
    colour: $('#colour', form)?.value || '',
    occasion: $('#occasion', form)?.value || '',
    needed: $('#needed', form)?.value || '',
    name: $('#name', form)?.value || '',
    email: $('#email', form)?.value || '',
    phone: $('#phone', form)?.value || '',
    city: $('#city', form)?.value || '',
    message: $('#message', form)?.value || '',
    measurements
  };
}

function wireSubmit(form) {
  const success = $('[data-commission-success]');
  const status = $('[data-form-status]', form);
  const submitButton = $('button[type="submit"]', form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { valid, firstInvalid, errors } = validateForm(form);

    if (!valid) {
      if (status) {
        status.textContent = errors === 1
          ? 'One field needs your attention.'
          : `${errors} fields need your attention.`;
        status.className = 'field__message field__message--error';
      }
      announce(errors === 1 ? 'One field needs your attention.' : `${errors} fields need your attention.`);

      const gsap = window.gsap;
      if (gsap && !prefersReducedMotion()) {
        gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
      }
      firstInvalid?.focus();
      return;
    }

    const data = collect(form);

    // Guard against a double submit while an async delivery is in flight
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
    }
    if (status) {
      status.textContent = 'Sending your request…';
      status.className = 'field__message';
    }

    const result = await deliver(data);

    // Record it either way so the owner's dashboard reflects what happened
    const stored = addEnquiry({ ...data, delivery: result.mode, delivered: result.ok });

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Send this request';
    }

    if (!result.ok) {
      if (status) {
        status.textContent = result.message;
        status.className = 'field__message field__message--error';
      }
      announce(result.message);
      return;
    }

    if (!stored.ok) {
      console.warn('[commission] Request delivered but not recorded locally.', stored.message);
    }

    if (success) {
      $('[data-commission-ref]', success).textContent = data.reference;
      $('[data-commission-recap]', success).textContent =
        `${data.styleName}${data.occasion ? ` · ${data.occasion}` : ''}${data.needed ? ` · needed by ${formatDate(data.needed)}` : ''}`;
      const note = $('[data-commission-note]', success);
      if (note) note.textContent = result.message;

      form.hidden = true;
      success.classList.add('is-visible');
      success.setAttribute('tabindex', '-1');
      success.focus({ preventScroll: true });
      scrollTo(success, -120);
    }

    announce(`Request received. Your reference is ${data.reference}. ${result.message}`);
  });
}
