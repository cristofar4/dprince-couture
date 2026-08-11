/* ==========================================================================
   CUSTOM CURSOR

   Fine-pointer desktop only. Never created on touch devices or under
   reduced motion, and `pointer-events: none` guarantees it can never
   intercept a click. Context labels come from `data-cursor="View"`.
   ========================================================================== */

import { hasFinePointer, prefersReducedMotion } from './utils.js';

export function initCursor() {
  const gsap = window.gsap;
  if (!gsap) return;
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor is-hidden';
  cursor.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'cursor__label';
  cursor.appendChild(label);
  document.body.appendChild(cursor);

  // quickTo keeps this on the compositor rather than re-creating tweens
  const moveX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
  const moveY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });

  let visible = false;

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    if (!visible) {
      visible = true;
      cursor.classList.remove('is-hidden');
      gsap.set(cursor, { x: event.clientX, y: event.clientY });
    }
    moveX(event.clientX);
    moveY(event.clientY);
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    visible = false;
    cursor.classList.add('is-hidden');
  });

  /* ---- Expansion over interactive elements ------------------------------ */

  const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, [data-cursor]';

  function expand(text) {
    gsap.to(cursor, {
      width: text ? 76 : 46,
      height: text ? 76 : 46,
      margin: text ? '-38px 0 0 -38px' : '-23px 0 0 -23px',
      duration: 0.4,
      ease: 'power3.out'
    });
    if (text) {
      label.textContent = text;
      gsap.to(label, { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
    }
  }

  function contract() {
    gsap.to(cursor, {
      width: 10, height: 10, margin: '-5px 0 0 -5px',
      duration: 0.4, ease: 'power3.out'
    });
    gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.2, ease: 'power2.in' });
  }

  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest(INTERACTIVE);
    if (!target) return;
    expand(target.dataset.cursor || '');
  });

  document.addEventListener('pointerout', (event) => {
    const target = event.target.closest(INTERACTIVE);
    if (!target) return;
    // Ignore moves between children of the same interactive element
    if (target.contains(event.relatedTarget)) return;
    contract();
  });

  // Pressing feedback
  document.addEventListener('pointerdown', () => {
    gsap.to(cursor, { scale: 0.82, duration: 0.18, ease: 'power2.out' });
  });
  document.addEventListener('pointerup', () => {
    gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out' });
  });
}
