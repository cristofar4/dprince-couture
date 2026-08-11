/* ==========================================================================
   INTRO SEQUENCE

   Plays once per session on the homepage: wordmark characters clip up, a
   hairline draws, the overlay lifts away and hands off to the hero timeline.

   Constraints honoured:
     • never traps the visitor — total run is ~1.9s and a watchdog force-ends
       it if anything stalls
     • skipped entirely on repeat visits within a session (sessionStorage)
     • skipped entirely under reduced motion
     • skipped when JavaScript cannot run, because the overlay markup is only
       inserted by this module
   ========================================================================== */

import { prefersReducedMotion } from './utils.js';

const SESSION_KEY = 'dprince:intro-played';

/**
 * @param {Function} onComplete called once the overlay is gone, whether the
 *        sequence ran, was skipped, or was force-ended.
 */
export function initIntro(onComplete = () => {}) {
  const gsap = window.gsap;
  const host = document.querySelector('[data-intro]');

  const finish = () => {
    document.body.classList.remove('no-scroll');
    onComplete();
  };

  // Nothing to do: no overlay on this page, no GSAP, reduced motion, or the
  // intro already played this session.
  if (!host || !gsap || prefersReducedMotion() || sessionStorage.getItem(SESSION_KEY)) {
    host?.remove();
    finish();
    return;
  }

  sessionStorage.setItem(SESSION_KEY, '1');
  document.body.classList.add('no-scroll');

  const chars = host.querySelectorAll('.intro__char');
  const rule = host.querySelector('.intro__rule');

  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    host.remove();
    finish();
  };

  const timeline = gsap.timeline({ onComplete: end });

  // Same reasoning as the split-line reveals: the CSS pre-state is a percentage
  // translate, which GSAP parses into pixel `y`. Zero it so yPercent alone owns
  // the transform and the characters land flush.
  gsap.set(chars, { y: 0, yPercent: 110 });

  timeline
    .to(chars, {
      yPercent: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.045
    })
    .to(rule, {
      scaleX: 1,
      duration: 0.7,
      ease: 'power3.inOut'
    }, '-=0.45')
    .to(host, {
      yPercent: -100,
      duration: 0.8,
      ease: 'expo.inOut'
    }, '+=0.15');

  // Watchdog: if a tween never fires its callback the visitor must not be
  // left staring at a black screen.
  window.setTimeout(end, 3200);
}
