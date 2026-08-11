/* ==========================================================================
   PAGE TRANSITIONS

   A full-screen ink overlay wipes up before navigation and wipes away on
   arrival. The guarantees that matter:
     • the screen is NEVER left covered — a watchdog forces navigation, and
       pageshow always clears the overlay (including bfcache restores)
     • back/forward behaviour is untouched: this is real navigation, not a
       history shim
     • external links, downloads, mailto/tel, new tabs and modified clicks
       all bypass the overlay entirely
     • reduced motion downgrades to a short fade
   ========================================================================== */

import { prefersReducedMotion, isExternalLink } from './utils.js';

let overlay = null;
let navigating = false;

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'transition-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  return overlay;
}

export function initTransitions() {
  const gsap = window.gsap;
  if (!gsap) return;

  const reduced = prefersReducedMotion();
  const el = ensureOverlay();

  /* ---- Arrival ----------------------------------------------------------
     `pageshow` rather than DOMContentLoaded so that a bfcache restore (back
     button) also clears the overlay instead of restoring it mid-wipe. */
  const reveal = () => {
    navigating = false;
    if (reduced) {
      gsap.set(el, { opacity: 0, scaleY: 0 });
      return;
    }
    gsap.set(el, { scaleY: 1, transformOrigin: 'top', opacity: 1 });
    gsap.to(el, {
      scaleY: 0,
      duration: 0.65,
      ease: 'power3.out',
      onComplete: () => gsap.set(el, { transformOrigin: 'bottom' })
    });
  };

  window.addEventListener('pageshow', reveal);

  /* ---- Departure -------------------------------------------------------- */
  document.addEventListener('click', (event) => {
    // Respect modified clicks — cmd/ctrl/shift/alt open in new tabs or windows
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    if (isExternalLink(anchor)) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    // Same page, different hash — let the browser handle it
    const url = new URL(anchor.href);
    if (url.pathname === window.location.pathname && url.hash) return;

    event.preventDefault();
    if (navigating) return;
    navigating = true;

    const go = () => { window.location.href = anchor.href; };

    if (reduced) {
      gsap.set(el, { scaleY: 1, transformOrigin: 'bottom', opacity: 0 });
      gsap.to(el, { opacity: 1, duration: 0.15, ease: 'none', onComplete: go });
      // Watchdog — never let a failed callback strand the visitor
      window.setTimeout(go, 400);
      return;
    }

    gsap.set(el, { transformOrigin: 'bottom', opacity: 1 });
    gsap.fromTo(el,
      { scaleY: 0 },
      { scaleY: 1, duration: 0.55, ease: 'power3.inOut', onComplete: go }
    );
    window.setTimeout(go, 1200);
  });
}
