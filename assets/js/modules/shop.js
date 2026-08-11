/* ==========================================================================
   SHOP — category filtering, sorting, live result count
   ========================================================================== */

import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { productCard } from './cards.js';
import { $, $$, announce, getParam, prefersReducedMotion } from '../core/utils.js';
import { revealBatch } from '../animations/shared.js';

const SORTS = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  newest: (a, b) => Number(b.newArrival) - Number(a.newArrival) || b.price - a.price
};

export function initShop() {
  const grid = $('[data-shop-grid]');
  if (!grid) return;

  const chipContainer = $('[data-filter-group]');
  const sortSelect = $('[data-sort]');
  const countEl = $('[data-result-count]');
  const emptyEl = $('[data-shop-empty]');

  // Deep links: shop.html?category=Kaftan
  const requested = getParam('category');
  let activeCategory = CATEGORIES.includes(requested) ? requested : 'All';
  let activeSort = 'featured';

  /* ---- Filter chips ----------------------------------------------------- */
  if (chipContainer) {
    chipContainer.innerHTML = CATEGORIES.map(
      (category) => `
        <button type="button" class="filter-chip" data-category="${category}"
                aria-pressed="${category === activeCategory}">${category}</button>
      `
    ).join('');

    chipContainer.addEventListener('click', (event) => {
      const button = event.target.closest('[data-category]');
      if (!button) return;
      activeCategory = button.dataset.category;
      syncChips();
      apply();
    });
  }

  function syncChips() {
    $$('[data-category]', chipContainer).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.category === activeCategory));
    });
  }

  /* ---- Sort ------------------------------------------------------------- */
  sortSelect?.addEventListener('change', () => {
    activeSort = sortSelect.value;
    apply();
  });

  /* ---- Apply ------------------------------------------------------------ */
  function currentSet() {
    const filtered = activeCategory === 'All'
      ? [...PRODUCTS]
      : PRODUCTS.filter((product) => product.category === activeCategory);
    return filtered.sort(SORTS[activeSort] || SORTS.featured);
  }

  function paint(products) {
    grid.innerHTML = products.map((product, index) => productCard(product, { eager: index < 4 })).join('');

    if (countEl) {
      countEl.textContent = products.length === 1 ? '1 piece' : `${products.length} pieces`;
    }
    if (emptyEl) emptyEl.hidden = products.length > 0;

    // Newly injected cards need their reveal wiring rebuilt
    revealBatch('[data-shop-grid] [data-anim="rise"]');
    window.ScrollTrigger?.refresh();
  }

  function apply({ silent = false } = {}) {
    const products = currentSet();
    const gsap = window.gsap;

    // Keep the URL shareable without adding history entries per click
    const url = new URL(window.location.href);
    if (activeCategory === 'All') url.searchParams.delete('category');
    else url.searchParams.set('category', activeCategory);
    window.history.replaceState({}, '', url);

    if (!silent) {
      announce(
        `${products.length} ${products.length === 1 ? 'piece' : 'pieces'} shown` +
        (activeCategory === 'All' ? '.' : ` in ${activeCategory}.`)
      );
    }

    if (gsap && !prefersReducedMotion()) {
      gsap.to(grid, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => {
          paint(products);
          gsap.fromTo(grid, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        }
      });
    } else {
      paint(products);
    }
  }

  syncChips();
  apply({ silent: true });
}
