/* ==========================================================================
   FORMS — newsletter and contact validation

   Validation is done on submit (and re-validated on input once a field has
   errored, so corrections clear immediately). Errors are announced, bound
   with aria-describedby, and always carry a glyph as well as colour.
   ========================================================================== */

import { $, $$, announce, prefersReducedMotion } from '../core/utils.js';

/* A deliberately permissive pattern: the aim is to catch typos, not to
   adjudicate the RFC. Anything stricter rejects valid addresses. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const RULES = {
  required: (value) => value.trim().length > 0,
  email: (value) => EMAIL_PATTERN.test(value.trim()),
  minLength: (value, length) => value.trim().length >= Number(length),
  phone: (value) => value.trim() === '' || /^[+\d][\d\s()-]{6,}$/.test(value.trim())
};

const MESSAGES = {
  required: 'This field is required.',
  email: 'Enter a valid email address, for example name@example.com.',
  minLength: (length) => `Please enter at least ${length} characters.`,
  phone: 'Enter a valid phone number, or leave this field empty.'
};

/** Validate a single control. Returns an error string, or '' when valid. */
export function validateField(field) {
  const value = field.value ?? '';
  const rules = (field.dataset.validate || '').split('|').filter(Boolean);

  for (const rule of rules) {
    const [name, argument] = rule.split(':');
    const check = RULES[name];
    if (!check) continue;

    if (!check(value, argument)) {
      const message = MESSAGES[name];
      return typeof message === 'function' ? message(argument) : message;
    }
  }

  if (field.type === 'checkbox' && field.required && !field.checked) {
    return 'Please confirm to continue.';
  }

  return '';
}

function setFieldState(field, error) {
  const wrapper = field.closest('.field, .field--check') || field.parentElement;
  const message = wrapper?.querySelector('.field__message');

  if (error) {
    field.setAttribute('aria-invalid', 'true');
    if (message) {
      message.textContent = error;
      message.className = 'field__message field__message--error';
      if (!message.id) message.id = `${field.id || field.name}-message`;
      field.setAttribute('aria-describedby', message.id);
    }
  } else {
    field.removeAttribute('aria-invalid');
    if (message) {
      message.textContent = '';
      message.className = 'field__message';
    }
  }
}

/**
 * Validate a whole form.
 * @returns {{valid: boolean, firstInvalid: HTMLElement|null, errors: number}}
 */
export function validateForm(form) {
  const fields = $$('[data-validate], [required]', form);
  let firstInvalid = null;
  let errors = 0;

  fields.forEach((field) => {
    const error = validateField(field);
    setFieldState(field, error);
    if (error) {
      errors += 1;
      if (!firstInvalid) firstInvalid = field;
    }
  });

  return { valid: errors === 0, firstInvalid, errors };
}

/** Shake feedback on failure — replaced by message-only under reduced motion. */
function failFeedback(form) {
  const gsap = window.gsap;
  if (!gsap || prefersReducedMotion()) return;
  gsap.fromTo(form,
    { x: -6 },
    { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.4)' }
  );
}

/**
 * Wire a form up with validation and a success state.
 * `onValid` receives the FormData and returns an optional success message.
 */
export function enhanceForm(form, { onValid, successMessage } = {}) {
  if (!form) return;

  const status = $('[data-form-status]', form);

  // Once a field has errored, re-check as the visitor types so the error
  // clears the moment it is fixed.
  form.addEventListener('input', (event) => {
    const field = event.target;
    if (!field.matches('[data-validate], [required]')) return;
    if (field.getAttribute('aria-invalid') !== 'true') return;
    setFieldState(field, validateField(field));
  });

  form.addEventListener('submit', (event) => {
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
      failFeedback(form);
      firstInvalid?.focus();
      return;
    }

    const data = new FormData(form);
    const message = onValid?.(data, form) ?? successMessage ?? 'Thank you.';

    if (status) {
      status.textContent = message;
      status.className = 'field__message field__message--success';
    }
    announce(message);
  });
}

/* ==========================================================================
   NEWSLETTER — present on every page
   ========================================================================== */

export function initNewsletter() {
  $$('[data-newsletter]').forEach((form) => {
    enhanceForm(form, {
      onValid: (data, formEl) => {
        const email = String(data.get('email') || '').trim();
        formEl.reset();
        // No backend is connected — this confirms the intent only.
        return `Thank you. ${email} has been added to the house list.`;
      }
    });
  });
}

/* ==========================================================================
   CONTACT
   ========================================================================== */

export function initContactForm() {
  const form = $('[data-contact-form]');
  if (!form) return;

  enhanceForm(form, {
    onValid: (data, formEl) => {
      const name = String(data.get('name') || '').trim().split(' ')[0];
      formEl.reset();
      return `Thank you${name ? `, ${name}` : ''}. Your enquiry has been recorded and the atelier will reply within two working days.`;
    }
  });
}
