/* ==========================================================================
   MAIN — per-page bootstrap

   Every page loads this one module. `document.body.dataset.page` decides
   which page modules run, so nothing initialises work it does not need.
   ========================================================================== */

import { initScroll } from './core/scroll.js';
import { initTransitions } from './core/transitions.js';
import { initCursor } from './core/cursor.js';
import { initIntro } from './core/intro.js';

import { initNav } from './modules/nav.js';
import { initCart } from './modules/cart.js';
import { initShop } from './modules/shop.js';
import { initProduct, initAccordionBehaviour } from './modules/product.js';
import { initNewsletter, initContactForm } from './modules/forms.js';
import { initBooking } from './modules/booking.js';

import {
  revealBatch,
  initGenericReveals,
  initSplitHeadings,
  initStatement,
  initParallax
} from './animations/shared.js';
import { playHero, initHeroParallax, initCraftScrub, initCampaignSplit, initLazyVideo } from './animations/home.js';
import { initLookbook } from './animations/lookbook.js';

import { PRODUCTS } from './data/products.js';
import { ARTICLES, getArticle } from './data/journal.js';
import { productCard, journalCard } from './modules/cards.js';
import { $, $$, escapeHtml, getParam } from './core/utils.js';

/* ==========================================================================
   BOOT
   ========================================================================== */

function boot() {
  const page = document.body.dataset.page || 'index';

  // Core, every page
  initScroll();
  initTransitions();
  initCursor();
  initNav();
  initCart();
  initNewsletter();

  // Page modules
  const pages = {
    index: initHome,
    shop: initShop,
    product: initProduct,
    lookbook: initLookbookPage,
    about: () => {},
    journal: initJournalIndex,
    article: initArticlePage,
    contact: initContactForm,
    cart: () => {},
    booking: initBooking,
    'client-services': initServicesPage
  };

  pages[page]?.();

  // Shared reveals run after page content is in the DOM
  initGenericReveals();
  initSplitHeadings();
  initStatement();
  initParallax();
  initLazyVideo();

  // The intro only exists on the homepage; elsewhere the callback fires
  // immediately and the hero timeline is a no-op.
  initIntro(() => {
    if (page === 'index') playHero();
    window.ScrollTrigger?.refresh();
  });
}

/* ==========================================================================
   HOMEPAGE
   ========================================================================== */

function initHome() {
  // New arrivals — first four load eagerly, they are close to the fold
  const arrivals = $('[data-new-arrivals]');
  if (arrivals) {
    const items = PRODUCTS.filter((product) => product.newArrival).slice(0, 8);
    arrivals.innerHTML = items.map((product, index) => productCard(product, { eager: index < 4 })).join('');
  }

  // Selected pieces
  const selected = $('[data-selected-products]');
  if (selected) {
    const items = PRODUCTS.filter((product) => product.featured).slice(0, 3);
    selected.innerHTML = items.map((product) => productCard(product)).join('');
  }

  // Journal preview
  const journal = $('[data-journal-preview]');
  if (journal) {
    journal.innerHTML = ARTICLES.slice(0, 3).map(journalCard).join('');
  }

  revealBatch('[data-new-arrivals] [data-anim="rise"]');
  revealBatch('[data-selected-products] [data-anim="rise"]');
  revealBatch('[data-journal-preview] [data-anim="rise"]');

  initHeroParallax();
  initCampaignSplit();
  initCraftScrub();
  initLookbook();
}

/* ==========================================================================
   LOOKBOOK PAGE
   ========================================================================== */

function initLookbookPage() {
  initLookbook();
}

/* ==========================================================================
   JOURNAL INDEX
   ========================================================================== */

function initJournalIndex() {
  const feature = $('[data-journal-feature]');
  const grid = $('[data-journal-grid]');

  const featured = ARTICLES.find((article) => article.featured) || ARTICLES[0];
  const rest = ARTICLES.filter((article) => article.id !== featured.id);

  if (feature) {
    feature.innerHTML = `
      <div class="journal-feature__media">
        <img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featured.alt)}"
             width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
      </div>
      <div class="journal-feature__body">
        <p class="journal-card__meta">
          <span class="journal-card__cat">${escapeHtml(featured.category)}</span>
          <span>${escapeHtml(featured.dateLabel)}</span>
          <span>${escapeHtml(featured.readTime)}</span>
        </p>
        <h2 class="d3"><a href="article.html?id=${encodeURIComponent(featured.id)}" data-cursor="Read">${escapeHtml(featured.title)}</a></h2>
        <p class="lead">${escapeHtml(featured.excerpt)}</p>
        <a class="btn-text" href="article.html?id=${encodeURIComponent(featured.id)}">Read the story</a>
      </div>
    `;
  }

  if (grid) {
    grid.innerHTML = rest.map(journalCard).join('');
    revealBatch('[data-journal-grid] [data-anim="rise"]');
  }
}

/* ==========================================================================
   ARTICLE PAGE
   ========================================================================== */

function initArticlePage() {
  const root = $('[data-article-page]');
  if (!root) return;

  const id = getParam('id');
  const article = getArticle(id) || ARTICLES[0];

  if (!getArticle(id)) {
    const url = new URL(window.location.href);
    url.searchParams.set('id', article.id);
    window.history.replaceState({}, '', url);
  }

  document.title = `${article.title} — Dprince Couture`;

  const hero = $('[data-article-hero]');
  if (hero) {
    hero.innerHTML = `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}"
      width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">`;
  }

  const title = $('[data-article-title]');
  if (title) title.textContent = article.title;

  const meta = $('[data-article-meta]');
  if (meta) {
    meta.innerHTML = `
      <span class="journal-card__cat">${escapeHtml(article.category)}</span>
      <span>${escapeHtml(article.dateLabel)}</span>
      <span>${escapeHtml(article.readTime)} read</span>
    `;
  }

  const body = $('[data-article-body]');
  if (body) {
    body.innerHTML = article.body
      .map((block) => {
        if (block.type === 'p') return `<p>${escapeHtml(block.text)}</p>`;
        if (block.type === 'h2') return `<h2>${escapeHtml(block.text)}</h2>`;
        if (block.type === 'quote') {
          return `<blockquote><p>${escapeHtml(block.text)}</p><footer>${escapeHtml(block.attribution)}</footer></blockquote>`;
        }
        if (block.type === 'image') {
          return `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}"
            width="900" height="1125" loading="lazy" decoding="async"></figure>`;
        }
        return '';
      })
      .join('');
  }

  const related = $('[data-article-related]');
  if (related) {
    const others = ARTICLES.filter((item) => item.id !== article.id).slice(0, 3);
    related.innerHTML = others.map(journalCard).join('');
    revealBatch('[data-article-related] [data-anim="rise"]');
  }
}

/* ==========================================================================
   CLIENT SERVICES
   ========================================================================== */

function initServicesPage() {
  $$('[data-accordion-static]').forEach((container) => initAccordionBehaviour(container));
}

/* ==========================================================================
   START
   ========================================================================== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
