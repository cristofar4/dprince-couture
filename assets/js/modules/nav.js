/* ==========================================================================
   NAVIGATION — header state, mobile menu, focus management
   ========================================================================== */

import { $, $$, trapFocus, prefersReducedMotion } from '../core/utils.js';
import { stopScroll, startScroll } from '../core/scroll.js';

export function initNav() {
  initHeaderState();
  initMobileMenu();
  markCurrentPage();
}

/* ==========================================================================
   HEADER — transparent over the hero, solid once scrolled
   ========================================================================== */

function initHeaderState() {
  const header = $('.site-header');
  if (!header) return;

  const { gsap, ScrollTrigger } = window;

  const apply = (solid) => header.classList.toggle('is-solid', solid);

  if (gsap && ScrollTrigger) {
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onToggle: (self) => apply(self.isActive)
    });
  } else {
    const onScroll = () => apply(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

/* ==========================================================================
   MOBILE MENU
   ========================================================================== */

function initMobileMenu() {
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const closeButton = $('[data-menu-close]', menu);
  const links = $$('.mobile-menu__link', menu);
  const gsap = window.gsap;
  const reduced = prefersReducedMotion();

  let open = false;
  let release = null;

  function openMenu() {
    if (open) return;
    open = true;

    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    stopScroll();

    if (gsap && !reduced) {
      gsap.set(menu, { xPercent: 100 });
      gsap.to(menu, { xPercent: 0, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo(links,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05, delay: 0.15 }
      );
    } else {
      menu.style.transform = 'translateX(0)';
    }

    release = trapFocus(menu, { onEscape: closeMenu });
    (closeButton || links[0])?.focus();
  }

  function closeMenu() {
    if (!open) return;
    open = false;

    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    startScroll();

    const finish = () => {
      menu.classList.remove('is-open');
      if (!gsap || reduced) menu.style.transform = '';
    };

    if (gsap && !reduced) {
      gsap.to(menu, { xPercent: 100, duration: 0.4, ease: 'power3.in', onComplete: finish });
    } else {
      finish();
    }

    release?.();
    release = null;
  }

  toggle.addEventListener('click', () => (open ? closeMenu() : openMenu()));
  closeButton?.addEventListener('click', closeMenu);

  // Navigating away closes the menu so the transition overlay is not covered
  links.forEach((link) => link.addEventListener('click', closeMenu));

  // Returning to desktop width must not strand the menu open
  window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });
}

/* ==========================================================================
   CURRENT PAGE
   ========================================================================== */

function markCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';

  $$('.nav-link, .mobile-menu__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const target = href.split('?')[0].split('#')[0];
    if (target === path) {
      link.setAttribute('aria-current', 'page');
    }
  });
}
