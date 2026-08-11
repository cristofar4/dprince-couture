/* ==========================================================================
   PRODUCT PAGE — gallery, size selection, quantity, accordion, add to bag
   ========================================================================== */

import { getProduct, PRODUCTS } from '../data/products.js';
import { formatPrice } from '../data/site.js';
import { productCard } from './cards.js';
import { addItem } from './cart.js';
import { $, $$, escapeHtml, getParam, announce, prefersReducedMotion } from '../core/utils.js';
import { revealBatch } from '../animations/shared.js';

export function initProduct() {
  const root = $('[data-product-page]');
  if (!root) return;

  const id = getParam('id');
  const product = getProduct(id) || PRODUCTS[0];

  if (!getProduct(id)) {
    // Unknown or missing id — show the first piece rather than an error page,
    // and correct the URL so refresh and sharing behave.
    const url = new URL(window.location.href);
    url.searchParams.set('id', product.id);
    window.history.replaceState({}, '', url);
  }

  document.title = `${product.name} — Dprince Couture`;

  renderHead(product);
  renderGallery(product);
  renderSizes(product);
  renderAccordion(product);
  initQuantity();
  initAddToBag(product);
  renderRelated(product);
}

/* ==========================================================================
   HEAD — title, price, colour, breadcrumb
   ========================================================================== */

function renderHead(product) {
  const set = (selector, value) => {
    const el = $(selector);
    if (el) el.textContent = value;
  };

  set('[data-product-name]', product.name);
  set('[data-product-price]', formatPrice(product.price));
  set('[data-product-colour]', product.colour);
  set('[data-product-summary]', product.summary);
  set('[data-breadcrumb-name]', product.name);

  const categoryLink = $('[data-breadcrumb-category]');
  if (categoryLink) {
    categoryLink.textContent = product.category;
    categoryLink.href = `shop.html?category=${encodeURIComponent(product.category)}`;
  }
}

/* ==========================================================================
   GALLERY — thumbnails, crossfade, keyboard arrows
   ========================================================================== */

function renderGallery(product) {
  const main = $('[data-gallery-main]');
  const thumbs = $('[data-gallery-thumbs]');
  if (!main || !thumbs) return;

  const images = product.gallery?.length ? product.gallery : [{ src: product.images[0], alt: product.alt }];

  main.innerHTML = images
    .map((image, index) => `
      <img class="gallery__img${index === 0 ? ' is-active' : ''}"
           src="${escapeHtml(image.src)}"
           alt="${escapeHtml(image.alt)}"
           width="900" height="1200"
           loading="${index === 0 ? 'eager' : 'lazy'}"
           fetchpriority="${index === 0 ? 'high' : 'auto'}"
           decoding="async">
    `)
    .join('');

  thumbs.innerHTML = images
    .map((image, index) => `
      <button type="button" class="gallery__thumb" data-index="${index}"
              aria-current="${index === 0}"
              aria-label="Show image ${index + 1} of ${images.length}">
        <img src="${escapeHtml(image.src)}" alt="" width="180" height="240" loading="lazy" decoding="async">
      </button>
    `)
    .join('');

  const slides = $$('.gallery__img', main);
  const buttons = $$('.gallery__thumb', thumbs);
  let active = 0;

  function show(index) {
    const next = (index + slides.length) % slides.length;
    if (next === active) return;

    const gsap = window.gsap;
    const outgoing = slides[active];
    const incoming = slides[next];

    if (gsap && !prefersReducedMotion()) {
      gsap.to(outgoing, { opacity: 0, duration: 0.4, ease: 'power2.out' });
      gsap.fromTo(incoming,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' }
      );
    } else {
      outgoing.style.opacity = '0';
      incoming.style.opacity = '1';
    }

    outgoing.classList.remove('is-active');
    incoming.classList.add('is-active');

    buttons[active]?.setAttribute('aria-current', 'false');
    buttons[next]?.setAttribute('aria-current', 'true');

    active = next;
    announce(`Image ${next + 1} of ${slides.length}`);
  }

  thumbs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-index]');
    if (!button) return;
    show(parseInt(button.dataset.index, 10));
  });

  // Left/right arrows move through the gallery when a thumb has focus
  thumbs.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = (active + direction + slides.length) % slides.length;
    show(next);
    buttons[next]?.focus();
  });
}

/* ==========================================================================
   SIZES — radio cards, plus a Bespoke option routed to booking
   ========================================================================== */

function renderSizes(product) {
  const container = $('[data-size-options]');
  if (!container) return;

  const options = [...product.sizes];
  const single = options.length === 1;

  container.innerHTML = options
    .map((size, index) => `
      <label class="radio-card">
        <input type="radio" name="size" value="${escapeHtml(size)}"
               ${single && index === 0 ? 'checked' : ''}>
        <span class="radio-card__face">${escapeHtml(size)}</span>
      </label>
    `)
    .join('') + `
      <label class="radio-card">
        <input type="radio" name="size" value="Bespoke">
        <span class="radio-card__face">Bespoke</span>
      </label>
    `;

  const note = $('[data-bespoke-note]');
  container.addEventListener('change', (event) => {
    const bespoke = event.target.value === 'Bespoke';
    note?.classList.toggle('is-visible', bespoke);

    const addButton = $('[data-add-to-bag]');
    const bookButton = $('[data-book-instead]');
    if (addButton) addButton.hidden = bespoke;
    if (bookButton) bookButton.hidden = !bespoke;

    // Clear a stale error the moment a size is chosen
    const message = $('[data-size-message]');
    if (message) { message.textContent = ''; message.className = 'field__message'; }
  });
}

/* ==========================================================================
   QUANTITY
   ========================================================================== */

function initQuantity() {
  const wrap = $('[data-quantity]');
  if (!wrap) return;

  const value = $('[data-qty-value]', wrap);
  const down = $('[data-qty-down]', wrap);
  const up = $('[data-qty-up]', wrap);

  function current() { return parseInt(value.textContent, 10) || 1; }

  function set(next) {
    const clamped = Math.min(Math.max(next, 1), 10);
    value.textContent = String(clamped);
    down.disabled = clamped <= 1;
    up.disabled = clamped >= 10;
    announce(`Quantity ${clamped}`);
  }

  down.addEventListener('click', () => set(current() - 1));
  up.addEventListener('click', () => set(current() + 1));
  set(1);
}

/* ==========================================================================
   ADD TO BAG
   ========================================================================== */

function initAddToBag(product) {
  const button = $('[data-add-to-bag]');
  if (!button) return;

  button.addEventListener('click', () => {
    const selected = $('[data-size-options] input[name="size"]:checked');
    const message = $('[data-size-message]');

    if (!selected) {
      if (message) {
        message.textContent = 'Choose a size before adding to your bag.';
        message.className = 'field__message field__message--error';
      }
      announce('Choose a size before adding to your bag.');
      $('[data-size-options] input')?.focus();
      return;
    }

    if (selected.value === 'Bespoke') {
      window.location.href = `booking.html?piece=${encodeURIComponent(product.id)}`;
      return;
    }

    const qty = parseInt($('[data-qty-value]')?.textContent, 10) || 1;
    const added = addItem(product.id, selected.value, qty);

    if (added) {
      if (message) { message.textContent = ''; message.className = 'field__message'; }
      document.dispatchEvent(new CustomEvent('cart:added'));
    }
  });
}

/* ==========================================================================
   ACCORDION
   ========================================================================== */

function renderAccordion(product) {
  const container = $('[data-accordion]');
  if (!container) return;

  const panels = [
    { title: 'Description', body: product.description },
    { title: 'Fabric & craft', body: product.fabric },
    { title: 'Fit & sizing', body: product.fit },
    { title: 'Care', body: product.care },
    {
      title: 'Shipping & returns',
      body:
        'Nationwide delivery in 3–5 working days, complimentary on orders above ₦500,000. ' +
        'International delivery is quoted on request. Ready-to-wear may be returned within 14 days ' +
        'unworn and with tags attached. Bespoke commissions are made to your measurements and cannot be returned.'
    }
  ];

  container.innerHTML = panels
    .map((panel, index) => {
      const panelId = `accordion-panel-${index}`;
      const buttonId = `accordion-button-${index}`;
      return `
        <div class="accordion__item">
          <h3>
            <button type="button" class="accordion__trigger" id="${buttonId}"
                    aria-expanded="${index === 0}" aria-controls="${panelId}">
              <span>${escapeHtml(panel.title)}</span>
              <span class="accordion__icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="accordion__panel" id="${panelId}" role="region" aria-labelledby="${buttonId}">
            <div class="accordion__inner">${escapeHtml(panel.body)}</div>
          </div>
        </div>
      `;
    })
    .join('');

  initAccordionBehaviour(container);
}

/** Exported so client-services can reuse the same accordion behaviour. */
export function initAccordionBehaviour(container) {
  const gsap = window.gsap;
  const reduced = prefersReducedMotion();

  const items = $$('.accordion__item', container);

  items.forEach((item) => {
    const trigger = $('.accordion__trigger', item);
    const panel = $('.accordion__panel', item);
    const inner = $('.accordion__inner', item);
    if (!trigger || !panel || !inner) return;

    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    panel.style.height = expanded ? 'auto' : '0px';

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isOpen));

      if (!gsap || reduced) {
        panel.style.height = isOpen ? '0px' : 'auto';
        window.ScrollTrigger?.refresh();
        return;
      }

      if (isOpen) {
        gsap.to(panel, {
          height: 0,
          duration: 0.45,
          ease: 'power2.inOut',
          onComplete: () => window.ScrollTrigger?.refresh()
        });
      } else {
        // Measure the natural height, then tween to it and release to auto
        const target = inner.offsetHeight;
        gsap.fromTo(panel,
          { height: 0 },
          {
            height: target,
            duration: 0.45,
            ease: 'power2.inOut',
            onComplete: () => {
              panel.style.height = 'auto';
              window.ScrollTrigger?.refresh();
            }
          }
        );
      }
    });
  });
}

/* ==========================================================================
   RELATED PIECES
   ========================================================================== */

function renderRelated(product) {
  const container = $('[data-related]');
  if (!container) return;

  // Same category first, then whatever else fills four slots
  const sameCategory = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id);
  const others = PRODUCTS.filter((p) => p.category !== product.category && p.id !== product.id);
  const related = [...sameCategory, ...others].slice(0, 4);

  container.innerHTML = related.map((item) => productCard(item)).join('');
  revealBatch('[data-related] [data-anim="rise"]');
}
