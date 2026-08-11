/* ==========================================================================
   UTILITIES — shared helpers
   ========================================================================== */

/** True when the visitor has asked the OS for reduced motion. */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True for devices with a precise pointer — used to gate the custom cursor. */
export function hasFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Trailing-edge debounce. Used for expensive resize work. */
export function debounce(fn, wait = 200) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/** Clamp a number into a range. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export const $  = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/** Escape a string for safe insertion into innerHTML. */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==========================================================================
   FOCUS MANAGEMENT
   ========================================================================== */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function getFocusable(container) {
  return $$(FOCUSABLE, container).filter((el) => {
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
  });
}

/**
 * Trap Tab focus inside a container. Returns a release function that removes
 * the listener and restores focus to whatever was focused beforehand.
 */
export function trapFocus(container, { onEscape } = {}) {
  const previouslyFocused = document.activeElement;

  function handleKeydown(event) {
    if (event.key === 'Escape' && typeof onEscape === 'function') {
      onEscape();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = getFocusable(container);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', handleKeydown);

  return function release({ restoreFocus = true } = {}) {
    document.removeEventListener('keydown', handleKeydown);
    if (restoreFocus && previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  };
}

/* ==========================================================================
   SCREEN READER ANNOUNCEMENTS
   ========================================================================== */

let liveRegion = null;

function ensureLiveRegion() {
  if (liveRegion) return liveRegion;
  liveRegion = document.createElement('div');
  liveRegion.className = 'visually-hidden';
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  document.body.appendChild(liveRegion);
  return liveRegion;
}

/** Announce a message to assistive technology without moving focus. */
export function announce(message) {
  const region = ensureLiveRegion();
  // Clearing first forces re-announcement of an identical string
  region.textContent = '';
  window.setTimeout(() => { region.textContent = message; }, 60);
}

/* ==========================================================================
   VISUAL TOAST — paired with announce() for sighted users
   ========================================================================== */

let toastEl = null;
let toastTimer = null;

export function toast(message) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'announcer';
    toastEl.setAttribute('aria-hidden', 'true'); // announce() covers AT
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;

  const gsap = window.gsap;
  clearTimeout(toastTimer);

  if (gsap && !prefersReducedMotion()) {
    gsap.killTweensOf(toastEl);
    gsap.fromTo(toastEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    toastTimer = setTimeout(() => {
      gsap.to(toastEl, { opacity: 0, y: 12, duration: 0.3, ease: 'power2.in' });
    }, 2600);
  } else {
    toastEl.style.opacity = '1';
    toastTimer = setTimeout(() => { toastEl.style.opacity = '0'; }, 2600);
  }
}

/* ==========================================================================
   URL HELPERS
   ========================================================================== */

export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** True for links that should bypass the page-transition overlay. */
export function isExternalLink(anchor) {
  if (!anchor || !anchor.href) return true;
  if (anchor.target && anchor.target !== '_self') return true;
  if (anchor.hasAttribute('download')) return true;
  if (anchor.dataset.noTransition !== undefined) return true;

  const protocol = anchor.protocol;
  if (protocol === 'mailto:' || protocol === 'tel:' || protocol === 'sms:') return true;

  return anchor.host !== window.location.host;
}
