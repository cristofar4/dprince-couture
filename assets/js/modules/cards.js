/* ==========================================================================
   CARD RENDERERS — shared by the homepage, shop and journal
   ========================================================================== */

import { formatPrice } from '../data/site.js';
import { escapeHtml } from '../core/utils.js';

/**
 * Product card markup.
 * `eager` skips lazy-loading for above-the-fold cards.
 */
export function productCard(product, { eager = false } = {}) {
  const [main, hover] = product.images;
  const loading = eager ? 'eager' : 'lazy';
  const fetchPriority = eager ? 'high' : 'auto';

  const badge = product.badge
    ? `<span class="product-card__badge">${escapeHtml(product.badge)}</span>`
    : '';

  const hoverImage = hover
    ? `<img class="product-card__img product-card__img--hover" src="${escapeHtml(hover)}"
            alt="" aria-hidden="true" width="900" height="1200"
            loading="lazy" decoding="async">`
    : '';

  return `
    <article class="product-card" data-anim="rise">
      <div class="product-card__media">
        ${badge}
        <img class="product-card__img product-card__img--main"
             src="${escapeHtml(main)}"
             alt="${escapeHtml(product.alt)}"
             width="900" height="1200"
             loading="${loading}" fetchpriority="${fetchPriority}" decoding="async">
        ${hoverImage}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">
          <a class="product-card__link" href="product.html?id=${encodeURIComponent(product.id)}"
             data-cursor="View">${escapeHtml(product.name)}</a>
        </h3>
        <p class="product-card__meta">
          <span>${escapeHtml(product.colour)}</span>
          <span class="product-card__price">${formatPrice(product.price)}</span>
        </p>
      </div>
    </article>
  `;
}

/** Journal card markup. */
export function journalCard(article) {
  return `
    <article class="journal-card" data-anim="rise">
      <div class="journal-card__media">
        <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}"
             width="900" height="1125" loading="lazy" decoding="async">
      </div>
      <div class="stack stack--sm">
        <p class="journal-card__meta">
          <span class="journal-card__cat">${escapeHtml(article.category)}</span>
          <span>${escapeHtml(article.dateLabel)}</span>
          <span>${escapeHtml(article.readTime)}</span>
        </p>
        <h3 class="journal-card__title">
          <a class="journal-card__link" href="article.html?id=${encodeURIComponent(article.id)}"
             data-cursor="Read">${escapeHtml(article.title)}</a>
        </h3>
        <p class="small muted">${escapeHtml(article.excerpt)}</p>
      </div>
    </article>
  `;
}
