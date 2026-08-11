/* ==========================================================================
   SEARCH — full-screen overlay, searches the whole catalogue

   Matches on name, category, colour and summary. Results update as you type,
   debounced, and are announced to assistive technology.
   ========================================================================== */

import { getCatalogue } from './store.js';
import { productCard } from './cards.js';
import { $, $$, escapeHtml, debounce, trapFocus, announce, prefersReducedMotion } from '../core/utils.js';
import { stopScroll, startScroll } from '../core/scroll.js';

const SUGGESTIONS = ['Agbada', 'Kaftan', 'Senator', 'Wedding', 'Black', 'White'];

export function initSearch() {
  const overlay = $('[data-search-overlay]');
  const openers = $$('[data-search-open]');
  if (!overlay || openers.length === 0) return;

  const input = $('[data-search-input]', overlay);
  const results = $('[data-search-results]', overlay);
  const meta = $('[data-search-meta]', overlay);
  const closeButton = $('[data-search-close]', overlay);
  const suggestionWrap = $('[data-search-suggestions]', overlay);

  const gsap = window.gsap;
  const reduced = prefersReducedMotion();
  let open = false;
  let release = null;

  /* ---- Suggestions ------------------------------------------------------ */
  if (suggestionWrap) {
    suggestionWrap.innerHTML = SUGGESTIONS
      .map((term) => `<button type="button" class="search-suggestion" data-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`)
      .join('');
    suggestionWrap.addEventListener('click', (event) => {
      const button = event.target.closest('[data-term]');
      if (!button) return;
      input.value = button.dataset.term;
      run();
      input.focus();
    });
  }

  /* ---- Query ------------------------------------------------------------ */
  function match(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/);

    return getCatalogue().filter((item) => {
      const haystack = [item.name, item.category, item.colour, item.summary, item.badge]
        .filter(Boolean).join(' ').toLowerCase();
      // Every term must appear somewhere — narrows rather than widens
      return terms.every((term) => haystack.includes(term));
    });
  }

  function run() {
    const query = input.value;
    const found = match(query);

    if (!query.trim()) {
      results.innerHTML = '';
      meta.textContent = 'Type to search the collection';
      if (suggestionWrap) suggestionWrap.hidden = false;
      return;
    }

    if (suggestionWrap) suggestionWrap.hidden = true;

    if (found.length === 0) {
      results.innerHTML = '';
      meta.textContent = `Nothing matches “${query.trim()}”`;
      announce(`No pieces match ${query.trim()}.`);
      return;
    }

    meta.textContent = found.length === 1 ? '1 piece' : `${found.length} pieces`;
    results.innerHTML = found.map((item) => productCard(item, { eager: true })).join('');
    // These cards are injected after page load, so clear the reveal state
    $$('[data-anim]', results).forEach((el) => {
      el.removeAttribute('data-anim');
      el.style.opacity = '';
      el.style.transform = '';
    });
    announce(`${found.length} ${found.length === 1 ? 'piece matches' : 'pieces match'} ${query.trim()}.`);
  }

  const debouncedRun = debounce(run, 180);
  input.addEventListener('input', debouncedRun);

  // Enter with a single result goes straight there
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const found = match(input.value);
    if (found.length === 1) window.location.href = `product.html?id=${encodeURIComponent(found[0].id)}`;
  });

  /* ---- Open / close ----------------------------------------------------- */
  function openSearch() {
    if (open) return;
    open = true;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    stopScroll();

    if (gsap && !reduced) {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    } else {
      overlay.style.opacity = '1';
    }

    run();
    release = trapFocus(overlay, { onEscape: closeSearch });
    input.focus();
  }

  function closeSearch() {
    if (!open) return;
    open = false;

    overlay.setAttribute('aria-hidden', 'true');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    startScroll();

    const finish = () => {
      overlay.classList.remove('is-open');
      if (!gsap || reduced) overlay.style.opacity = '';
    };

    if (gsap && !reduced) {
      gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: finish });
    } else {
      finish();
    }

    release?.();
    release = null;
  }

  openers.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openSearch();
    });
  });
  closeButton?.addEventListener('click', closeSearch);

  // "/" opens search, the way most catalogues behave — but never while the
  // visitor is already typing somewhere else.
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || open) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    event.preventDefault();
    openSearch();
  });
}
