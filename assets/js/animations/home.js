/* ==========================================================================
   HOMEPAGE ANIMATIONS — hero entrance, parallax, scrubbed atelier footage
   ========================================================================== */

import { prefersReducedMotion } from '../core/utils.js';
import { splitLines } from './split.js';

/* ==========================================================================
   HERO ENTRANCE
   Called once the intro overlay has cleared.
   ========================================================================== */

export function playHero() {
  const gsap = window.gsap;
  const hero = document.querySelector('.hero');
  if (!gsap || !hero) return;

  const media = hero.querySelector('.hero__media');
  const video = hero.querySelector('.hero__media video, .hero__media img');
  const title = hero.querySelector('[data-split="hero"]');
  const support = hero.querySelectorAll('.hero__support, .hero__cta, .hero__scroll, .hero__caption');

  if (prefersReducedMotion()) {
    gsap.set([media, video, support], { clearProps: 'all' });
    if (media) gsap.set(media, { clipPath: 'none' });
    return;
  }

  const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } });

  if (media) {
    timeline.to(media, {
      clipPath: 'inset(0% 0 0% 0)',
      duration: 1.4
    }, 0);
  }

  if (video) {
    timeline.to(video, { scale: 1, duration: 1.6 }, 0);
  }

  if (title) {
    const { lines } = splitLines(title);
    // y:0 is not redundant. The CSS pre-state is translate3d(0,105%,0), which
    // GSAP parses into its pixel `y` property; setting yPercent alone stacks on
    // top of it, so the tween would land on the CSS offset instead of zero.
    gsap.set(lines, { y: 0, yPercent: 105 });
    timeline.to(lines, {
      yPercent: 0,
      duration: 1.1,
      stagger: 0.08
    }, 0.25);
  }

  if (support.length) {
    timeline.fromTo(support,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, clearProps: 'willChange' },
      0.55
    );
  }

  timeline.add(() => window.ScrollTrigger?.refresh());
}

/* ==========================================================================
   HERO PARALLAX — desktop only, transforms only
   ========================================================================== */

export function initHeroParallax() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || prefersReducedMotion()) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const video = hero.querySelector('.hero__media video, .hero__media img');
    const content = hero.querySelector('.hero__content');
    const tweens = [];

    if (video) {
      tweens.push(gsap.to(video, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
      }));
    }

    if (content) {
      tweens.push(gsap.to(content, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
      }));
    }

    return () => tweens.forEach((tween) => { tween.scrollTrigger?.kill(); tween.kill(); });
  });

  return mm;
}

/* ==========================================================================
   ATELIER FOOTAGE — scroll drives playback

   The clip is encoded all-intra (every frame a keyframe) specifically so
   seeking by currentTime is smooth. If the browser cannot keep up — or the
   metadata never arrives — this falls back to plain play-on-enter.
   ========================================================================== */

export function initCraftScrub() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const video = document.querySelector('[data-craft-video]');
  if (!video) return;

  // Reduced motion: never play, never pin. The poster carries the section.
  if (prefersReducedMotion()) {
    video.removeAttribute('autoplay');
    video.pause?.();
    return;
  }

  const mm = gsap.matchMedia();

  /* ---- Desktop: pin and scrub ------------------------------------------- */
  mm.add('(min-width: 1024px)', () => {
    let trigger = null;

    const build = () => {
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) {
        fallbackPlay(video);
        return;
      }

      video.pause();

      trigger = ScrollTrigger.create({
        trigger: video.closest('.craft') || video,
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const time = self.progress * duration;
          // Guard: seeking a not-yet-seekable video throws in some browsers
          if (video.readyState >= 2) {
            try { video.currentTime = time; } catch { /* seek not ready */ }
          }
        }
      });
    };

    if (video.readyState >= 1) build();
    else video.addEventListener('loadedmetadata', build, { once: true });

    return () => {
      trigger?.kill();
      video.removeEventListener('loadedmetadata', build);
    };
  });

  /* ---- Below 1024: play on enter, pause on exit — no pinning ------------- */
  mm.add('(max-width: 1023px)', () => {
    const trigger = ScrollTrigger.create({
      trigger: video,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: () => fallbackPlay(video),
      onEnterBack: () => fallbackPlay(video),
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause()
    });

    return () => trigger.kill();
  });

  return mm;
}

function fallbackPlay(video) {
  video.loop = true;
  const attempt = video.play();
  // Autoplay can still be refused; the poster remains, which is acceptable.
  if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
}

/* ==========================================================================
   CAMPAIGN SPLIT — counter-parallax between image and text
   ========================================================================== */

export function initCampaignSplit() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || prefersReducedMotion()) return;

  const section = document.querySelector('[data-campaign-split]');
  if (!section) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const media = section.querySelector('.campaign-split__media video, .campaign-split__media img');
    const body = section.querySelector('.campaign-split__body');
    const tweens = [];

    if (media) {
      tweens.push(gsap.fromTo(media,
        { yPercent: -8 },
        { yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
      ));
    }
    if (body) {
      tweens.push(gsap.fromTo(body,
        { yPercent: 4 },
        { yPercent: -4, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
      ));
    }

    return () => tweens.forEach((tween) => { tween.scrollTrigger?.kill(); tween.kill(); });
  });

  return mm;
}

/* ==========================================================================
   AUTOPLAY MANAGEMENT
   Below-fold videos only start once visible, and stop when they leave.
   ========================================================================== */

export function initLazyVideo() {
  const videos = document.querySelectorAll('video[data-lazy-play]');
  if (videos.length === 0) return;

  if (prefersReducedMotion()) {
    videos.forEach((video) => { video.removeAttribute('autoplay'); video.pause(); });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '200px 0px', threshold: 0.1 });

  videos.forEach((video) => observer.observe(video));
}

/* ==========================================================================
   HERO ROTATING PROMPT

   A short question sits under the headline while the campaign film plays, and
   the answer cycles: "a wedding agbada", "a coronation set", and so on. It
   tells a visitor within seconds that the house makes something for their
   occasion, which a silent campaign film does not.

   The rotator has a fixed height in CSS, so swapping lines can never shift
   the layout. Under reduced motion the lines still change — they just cut
   rather than slide, because the information matters more than the movement.
   ========================================================================== */

export const HERO_PROMPTS = [
  'a wedding agbada',
  'a coronation set',
  'a senator two-piece',
  'something for Sunday',
  'a kaftan cut to you',
  'an heirloom for your son'
];

export function initHeroPrompt() {
  const rotator = document.querySelector('[data-hero-rotator]');
  if (!rotator) return;

  const gsap = window.gsap;
  const reduced = prefersReducedMotion();

  // Build one element per phrase; only one is visible at a time.
  rotator.innerHTML = HERO_PROMPTS
    .map((text, index) => `<span class="hero__prompt-item"${index === 0 ? '' : ' aria-hidden="true"'}>${text}</span>`)
    .join('');

  const items = Array.from(rotator.children);
  let index = 0;
  let timer = null;

  if (!gsap || reduced) {
    // No GSAP or reduced motion: hard cut, same rhythm, no transform.
    items.forEach((item, i) => { item.style.opacity = i === 0 ? '1' : '0'; });
    timer = setInterval(() => {
      items[index].style.opacity = '0';
      items[index].setAttribute('aria-hidden', 'true');
      index = (index + 1) % items.length;
      items[index].style.opacity = '1';
      items[index].removeAttribute('aria-hidden');
    }, 3200);
  } else {
    gsap.set(items, { opacity: 0, yPercent: 100 });
    gsap.set(items[0], { opacity: 1, yPercent: 0 });

    timer = setInterval(() => {
      const current = items[index];
      const next = items[(index + 1) % items.length];

      gsap.to(current, { opacity: 0, yPercent: -100, duration: 0.55, ease: 'power3.inOut' });
      gsap.fromTo(next,
        { opacity: 0, yPercent: 100 },
        { opacity: 1, yPercent: 0, duration: 0.55, ease: 'power3.inOut' }
      );

      current.setAttribute('aria-hidden', 'true');
      next.removeAttribute('aria-hidden');
      index = (index + 1) % items.length;
    }, 3200);
  }

  // Stop the loop when the hero is off screen — no point animating unseen,
  // and it keeps the tab cheap when the visitor has scrolled away.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) return;
      clearInterval(timer);
      timer = null;
      observer.disconnect();
    });
  }, { threshold: 0 });
  observer.observe(rotator);

  window.addEventListener('beforeunload', () => clearInterval(timer), { once: true });
}
