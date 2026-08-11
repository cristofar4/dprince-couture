/* ==========================================================================
   HORIZONTAL LOOKBOOK

   Desktop (≥1024px): the section pins and vertical scroll drives the track
   sideways, with a progress bar bound to trigger progress.

   Below 1024px: no pinning at all. The track becomes a native scroll-snap
   carousel, which is both cheaper and far easier to escape on a phone.

   All of this lives inside gsap.matchMedia(), so switching breakpoints
   creates and reverts the correct setup with no leaked ScrollTriggers.
   ========================================================================== */

import { prefersReducedMotion } from '../core/utils.js';

export function initLookbook() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const section = document.querySelector('[data-lookbook]');
  if (!section) return;

  const viewport = section.querySelector('.lookbook__viewport');
  const track = section.querySelector('.lookbook__track');
  const bar = section.querySelector('.lookbook__progress-bar');
  if (!viewport || !track) return;

  // Reduced motion: leave the CSS stack in place and fill the progress bar.
  if (prefersReducedMotion()) {
    if (bar) gsap.set(bar, { scaleX: 1 });
    return;
  }

  const mm = gsap.matchMedia();

  /* ---- Desktop: pinned horizontal --------------------------------------- */
  mm.add('(min-width: 1024px)', () => {
    // Measured inside the callback so a resize recalculates from scratch
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        // Pin duration tracks content width, so it never overstays
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (bar) gsap.set(bar, { scaleX: self.progress });
        }
      }
    });

    // Gentle counter-parallax inside each panel
    const inners = section.querySelectorAll('.look__media--inner');
    const innerTweens = Array.from(inners).map((inner) =>
      gsap.fromTo(inner,
        { xPercent: -5 },
        {
          xPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: inner.closest('.look'),
            containerAnimation: tween,
            start: 'left right',
            end: 'right left',
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      )
    );

    return () => {
      innerTweens.forEach((item) => { item.scrollTrigger?.kill(); item.kill(); });
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
    };
  });

  /* ---- Tablet and below: native carousel, progress from scrollLeft ------- */
  mm.add('(max-width: 1023px)', () => {
    if (!bar) return;

    const update = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      const progress = max > 0 ? viewport.scrollLeft / max : 0;
      gsap.set(bar, { scaleX: progress });
    };

    viewport.addEventListener('scroll', update, { passive: true });
    update();

    return () => viewport.removeEventListener('scroll', update);
  });

  return mm;
}
