/* ==========================================================================
   BOOKING — appointment request

   This is a REQUEST, not a reservation. No calendar system is connected, so
   the success state issues a reference and says explicitly that the atelier
   will confirm. Nothing here claims a slot has been held.
   ========================================================================== */

import { SITE } from '../data/site.js';
import { getProduct } from '../data/products.js';
import { $, $$, escapeHtml, announce, getParam, prefersReducedMotion } from '../core/utils.js';
import { validateForm, enhanceForm } from './forms.js';
import { scrollTo } from '../core/scroll.js';

const APPOINTMENT_TYPES = [
  { id: 'bespoke', title: 'Bespoke commission', meta: '90 minutes · 22-point measurement, cloth selection and pattern draft' },
  { id: 'fitting', title: 'Fitting', meta: '45 minutes · For a commission already in progress' },
  { id: 'virtual', title: 'Virtual consultation', meta: '30 minutes · Guided self-measurement, held over video' }
];

const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

export function initBooking() {
  const form = $('[data-booking-form]');
  if (!form) return;

  renderTypes();
  renderAteliers();
  renderDateBounds();
  renderSlots();
  prefillPiece();
  wireSummary();
  wireSubmit(form);
}

/* ==========================================================================
   APPOINTMENT TYPE
   ========================================================================== */

function renderTypes() {
  const container = $('[data-appointment-types]');
  if (!container) return;

  container.innerHTML = APPOINTMENT_TYPES
    .map((type, index) => `
      <label class="radio-card radio-card--wide">
        <input type="radio" name="appointmentType" value="${escapeHtml(type.title)}"
               data-type-id="${type.id}" ${index === 0 ? 'checked' : ''} required>
        <span class="radio-card__face">
          <span class="radio-card__title">${escapeHtml(type.title)}</span>
          <span class="radio-card__meta">${escapeHtml(type.meta)}</span>
        </span>
      </label>
    `)
    .join('');
}

/* ==========================================================================
   ATELIER
   ========================================================================== */

function renderAteliers() {
  const container = $('[data-atelier-options]');
  if (!container) return;

  container.innerHTML = SITE.ateliers
    .map((atelier, index) => `
      <label class="radio-card">
        <input type="radio" name="atelier" value="${escapeHtml(atelier.city)}"
               ${index === 0 ? 'checked' : ''} required>
        <span class="radio-card__face">${escapeHtml(atelier.city)}</span>
      </label>
    `)
    .join('');
}

/* ==========================================================================
   DATE — tomorrow through 60 days out
   ========================================================================== */

function renderDateBounds() {
  const input = $('[data-booking-date]');
  if (!input) return;

  const today = new Date();
  const min = new Date(today);
  min.setDate(min.getDate() + 1);

  const max = new Date(today);
  max.setDate(max.getDate() + 60);

  const iso = (date) => date.toISOString().split('T')[0];
  input.min = iso(min);
  input.max = iso(max);

  const note = $('[data-date-note]');

  input.addEventListener('change', () => {
    if (!input.value) return;
    // Ateliers close on Sundays; parse as local to avoid a timezone shift
    const [year, month, day] = input.value.split('-').map(Number);
    const chosen = new Date(year, month - 1, day);

    if (chosen.getDay() === 0) {
      input.setCustomValidity('closed');
      if (note) {
        note.textContent = 'The ateliers are closed on Sundays. Please choose another day.';
        note.className = 'field__message field__message--error';
      }
      announce('The ateliers are closed on Sundays. Please choose another day.');
    } else {
      input.setCustomValidity('');
      if (note) { note.textContent = ''; note.className = 'field__message'; }
    }
  });
}

/* ==========================================================================
   TIME SLOTS
   ========================================================================== */

function renderSlots() {
  const container = $('[data-slot-grid]');
  if (!container) return;

  container.innerHTML = SLOTS
    .map((slot, index) => `
      <label class="radio-card">
        <input type="radio" name="slot" value="${escapeHtml(slot)}" ${index === 0 ? 'checked' : ''} required>
        <span class="radio-card__face">${escapeHtml(slot)}</span>
      </label>
    `)
    .join('');
}

/* ==========================================================================
   PREFILL — arriving from a product page's Bespoke option
   ========================================================================== */

function prefillPiece() {
  const pieceId = getParam('piece');
  if (!pieceId) return;

  const product = getProduct(pieceId);
  if (!product) return;

  const occasion = $('[data-booking-notes]');
  if (occasion && !occasion.value) {
    occasion.value = `I would like to commission the ${product.name} as a bespoke piece.`;
  }

  const banner = $('[data-piece-banner]');
  if (banner) {
    banner.hidden = false;
    banner.innerHTML = `Commissioning <strong>${escapeHtml(product.name)}</strong>. Add anything else below.`;
  }
}

/* ==========================================================================
   LIVE SUMMARY
   ========================================================================== */

function wireSummary() {
  const form = $('[data-booking-form]');
  const summary = $('[data-booking-summary]');
  if (!form || !summary) return;

  function update() {
    const data = new FormData(form);
    const rows = [
      ['Appointment', data.get('appointmentType')],
      ['Atelier', data.get('atelier')],
      ['Date', formatDate(data.get('date'))],
      ['Time', data.get('slot')]
    ];

    summary.innerHTML = rows
      .map(([label, value]) => `
        <div class="booking-summary__row">
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value || '—')}</dd>
        </div>
      `)
      .join('');
  }

  function formatDate(value) {
    if (!value) return '';
    const [year, month, day] = String(value).split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long' });
  }

  form.addEventListener('change', update);
  form.addEventListener('input', update);
  update();
}

/* ==========================================================================
   SUBMIT
   ========================================================================== */

function reference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase().padStart(2, '0');
  return `DPC-${stamp}${random}`;
}

function wireSubmit(form) {
  const success = $('[data-booking-success]');
  const status = $('[data-form-status]', form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const dateInput = $('[data-booking-date]', form);
    const { valid, firstInvalid, errors } = validateForm(form);

    // A Sunday selection is a custom validity, checked alongside the rules
    const sundayBlocked = dateInput && dateInput.validationMessage === 'closed';

    if (!valid || sundayBlocked) {
      const total = errors + (sundayBlocked ? 1 : 0);
      if (status) {
        status.textContent = total === 1
          ? 'One field needs your attention.'
          : `${total} fields need your attention.`;
        status.className = 'field__message field__message--error';
      }
      announce(total === 1 ? 'One field needs your attention.' : `${total} fields need your attention.`);

      const gsap = window.gsap;
      if (gsap && !prefersReducedMotion()) {
        gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
      }

      (sundayBlocked ? dateInput : firstInvalid)?.focus();
      return;
    }

    const data = new FormData(form);
    const ref = reference();

    if (success) {
      $('[data-booking-ref]', success).textContent = ref;
      $('[data-booking-recap]', success).textContent =
        `${data.get('appointmentType')} · ${data.get('atelier')} atelier · ${data.get('date')} at ${data.get('slot')}`;

      form.hidden = true;
      success.classList.add('is-visible');
      success.setAttribute('tabindex', '-1');
      success.focus({ preventScroll: true });
      scrollTo(success, -120);
    }

    announce(
      `Appointment request received. Your reference is ${ref}. ` +
      'The atelier will confirm your slot by email within one working day.'
    );
  });
}

/* Newsletter-style enhancement is not applied here — booking has its own
   submit handler because the success state replaces the form entirely. */
export { enhanceForm };
