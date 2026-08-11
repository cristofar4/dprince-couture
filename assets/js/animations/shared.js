/* ==========================================================================
   SHARED ANIMATIONS — reveals used on every page

   Everything here is created inside gsap.matchMedia() where behaviour differs
   by breakpoint, and every ScrollTrigger is tracked so it can be killed when
   its media query stops matching. `will-change` is cleared on completion.
   ========================================================================== */

import { prefersReducedMotion } from '../core/utils.js';
import { registerSplit, splitWords } from './split.js';

/** ScrollTriggers created outside matchMedia, killed on teardown. */
const tracked = [];

function track(trigger) {
  if (trigger) tracked.push(trigger);
  return trigger;
}

export function killShared() {
  tracked.forEach((trigger) => trigger.kill());
  tracked.length = 0;
}

/** Clear will-change once a tween is done — it is expensive left on. */
function settle(targets) {
  const gsap = window.gsap;
  gsap.set(targets, { clearProps: 'willChange' });
  (Array.isArray(targets) ? targets : [targets]).forEach?.((el) => {
    el?.classList?.add('anim-done');
  });
}

/* ==========================================================================
   BATCH REVEAL — staggered rise for grids
   ========================================================================== */

/**
 * Reveal elements in row batches as they enter the viewport.
 * Safe to call again after a grid re-renders; previous batch triggers for
 * the same selector are killed first.
 */
export function revealBatch(selector, options = {}) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;

  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0, clearProps: 'willChange' });
    return;
  }

  // Remove stale triggers belonging to nodes that no longer exist
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger.vars.id === `batch:${selector}`) trigger.kill();
  });

  const {
    y = 40,
    duration = 0.7,
    stagger = 0.09,
    start = 'top 88%'
  } = options;

  gsap.set(elements, { opacity: 0, y });

  ScrollTrigger.batch(elements, {
    id: `batch:${selector}`,
    start,
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration,
        ease: 'power3.out',
        stagger,
        overwrite: true,
        onComplete: () => settle(batch)
      });

      // Product copy lands just after its image, never before
      batch.forEach((card) => {
        const body = card.querySelector('.product-card__body, .journal-card__title');
        if (!body) return;
        gsap.fromTo(body,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.12 }
        );
      });
    }
  });
}

/* ==========================================================================
   GENERIC ELEMENT REVEALS — [data-anim]
   ========================================================================== */

export function initGenericReveals(scope = document) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const nodes = scope.querySelectorAll(
    '[data-anim="rise"]:not(.product-card):not(.journal-card), ' +
    '[data-anim="rise-sm"], [data-anim="fade"], [data-anim="clip"], ' +
    '[data-anim="clip-up"], [data-anim="draw"]'
  );

  if (nodes.length === 0) return;

  if (prefersReducedMotion()) {
    gsap.set(nodes, { opacity: 1, y: 0, clipPath: 'none', scaleX: 1, clearProps: 'willChange' });
    return;
  }

  nodes.forEach((node) => {
    const kind = node.dataset.anim;
    const from = {};
    const to = { duration: 0.9, ease: 'power4.out', onComplete: () => settle(node) };

    if (kind === 'rise')      { Object.assign(from, { opacity: 0, y: 40 });  Object.assign(to, { opacity: 1, y: 0 }); }
    if (kind === 'rise-sm')   { Object.assign(from, { opacity: 0, y: 20 });  Object.assign(to, { opacity: 1, y: 0 }); to.duration = 0.7; }
    if (kind === 'fade')      { Object.assign(from, { opacity: 0 });         Object.assign(to, { opacity: 1 }); }
    if (kind === 'clip')      { Object.assign(from, { clipPath: 'inset(0 100% 0 0)' }); Object.assign(to, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'expo.inOut' }); }
    if (kind === 'clip-up')   { Object.assign(from, { clipPath: 'inset(100% 0 0 0)' }); Object.assign(to, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.inOut' }); }
    if (kind === 'draw')      { Object.assign(from, { scaleX: 0 });          Object.assign(to, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }); }

    to.scrollTrigger = { trigger: node, start: 'top 88%', once: true };
    track(gsap.fromTo(node, from, to).scrollTrigger);
  });
}

/* ==========================================================================
   SPLIT HEADINGS — [data-split]
   ========================================================================== */

export function initSplitHeadings(scope = document) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  if (prefersReducedMotion()) return;

  scope.querySelectorAll('[data-split]').forEach((heading) => {
    // Hero headings are driven by the hero timeline, not on scroll
    if (heading.dataset.split === 'hero') return;

    registerSplit(heading, (lines) => {
      // y:0 clears the pixel component GSAP parses out of the CSS pre-state
      // (translate3d(0,105%,0)); without it yPercent stacks and the reveal
      // finishes at the CSS offset rather than at zero.
      gsap.set(lines, { y: 0, yPercent: 105 });
      gsap.to(lines, {
        yPercent: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.07,
        onComplete: () => settle(lines),
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true }
      });
    });
  });
}

/* ==========================================================================
   BRAND STATEMENT — word-by-word opacity
   ========================================================================== */

export function initStatement(scope = document) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const statement = scope.querySelector('[data-split-words]');
  if (!statement) return;

  if (prefersReducedMotion()) {
    statement.querySelectorAll('.word').forEach((word) => { word.style.opacity = '1'; });
    return;
  }

  const { words } = splitWords(statement);
  gsap.set(words, { opacity: 0.12 });

  track(gsap.to(words, {
    opacity: 1,
    duration: 1.4,
    ease: 'power2.out',
    stagger: 0.03,
    scrollTrigger: { trigger: statement, start: 'top 75%', once: true }
  }).scrollTrigger);
}

/* ==========================================================================
   PARALLAX — [data-parallax]
   Desktop only, transforms only, disabled under reduced motion.
   ========================================================================== */

export function initParallax(scope = document) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  if (prefersReducedMotion()) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const items = scope.querySelectorAll('[data-parallax]');
    const tweens = [];

    items.forEach((item) => {
      const amount = parseFloat(item.dataset.parallax) || 8;
      tweens.push(
        gsap.fromTo(item,
          { yPercent: -amount / 2 },
          {
            yPercent: amount / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: item.closest('section, .hero') || item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        )
      );
    });

    // matchMedia teardown — kills the triggers when the query stops matching
    return () => tweens.forEach((tween) => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  });

  return mm;
}
