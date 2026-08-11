/* ==========================================================================
   SCROLL — Lenis + ScrollTrigger integration

   The rules this file exists to enforce:
     • exactly one animation loop — GSAP's ticker drives Lenis, never a
       second requestAnimationFrame
     • Lenis scroll events drive ScrollTrigger.update
     • ScrollTrigger refreshes once fonts and above-fold images have settled
     • resize work is debounced
     • Lenis never initialises under prefers-reduced-motion, so native
       scrolling, keyboard paging and anchor jumps behave normally
   ========================================================================== */

import { prefersReducedMotion, debounce } from './utils.js';

let lenis = null;
let initialised = false;

/** The live Lenis instance, or null when smooth scrolling is off. */
export function getLenis() {
  return lenis;
}

export function initScroll() {
  if (initialised) return lenis;
  initialised = true;

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) {
    console.warn('[scroll] GSAP or ScrollTrigger unavailable — falling back to native scrolling.');
    return null;
  }

  gsap.registerPlugin(ScrollTrigger);

  const reduced = prefersReducedMotion();

  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native touch scrolling stays on: smoothing touch makes mobile feel
      // laggy and interferes with the lookbook's scroll-snap carousel.
      syncTouch: false,
      autoRaf: false
    });

    // Lenis position changes must push ScrollTrigger, or pinned sections drift.
    lenis.on('scroll', ScrollTrigger.update);

    // One loop. GSAP's ticker is already running, so Lenis rides on it.
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchor links must still work while Lenis owns the scroll position.
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -96 });
      // Move focus so keyboard and screen reader users land where they clicked
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });

    window.addEventListener('beforeunload', () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
    }, { once: true });
  }

  /* ---- Refresh discipline ------------------------------------------------
     Triggers measured before fonts swap or images decode are measured wrong.
     Each of these settles the layout, so each earns a refresh. */

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  // Any image that finishes late shifts everything under it.
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete) return;
    img.addEventListener('load', debouncedRefresh, { once: true });
    img.addEventListener('error', debouncedRefresh, { once: true });
  });

  const debouncedResize = debounce(() => ScrollTrigger.refresh(), 200);
  window.addEventListener('resize', debouncedResize);
  window.addEventListener('orientationchange', debouncedResize);

  return lenis;
}

const debouncedRefresh = debounce(() => {
  window.ScrollTrigger?.refresh();
}, 200);

/** Stop smooth scrolling — used while a drawer or menu is open. */
export function stopScroll() {
  if (lenis) {
    lenis.stop();
  } else {
    // No Lenis (reduced motion): lock the document instead
    document.documentElement.style.overflow = 'hidden';
  }
}

/** Resume smooth scrolling. */
export function startScroll() {
  if (lenis) {
    lenis.start();
  } else {
    document.documentElement.style.overflow = '';
  }
}

/** Scroll to a target, whichever scrolling mode is active. */
export function scrollTo(target, offset = -96) {
  if (lenis) {
    lenis.scrollTo(target, { offset });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: 'auto' });
}
