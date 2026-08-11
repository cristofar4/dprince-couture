/* ==========================================================================
   PRODUCT PAGE — gallery, details accordion, related pieces

   There is no bag and no quantity stepper: every piece is made to order, so
   the page ends in a commission request rather than a purchase. Sizes and
   measurements are collected on the commission form, where they belong.
   ========================================================================== */

import { getDesign, getCatalogue } from './store.js';
import { formatPrice } from '../data/site.js';
import { productCard } from './cards.js';
import { $, $$, escapeHtml, getParam, announce, prefersReducedMotion } from '../core/utils.js';
import { revealBatch } from '../animations/shared.js';

export function initProduct() {
  const root = $('[data-product-page]');
  if (!root) return;

  const id = getParam('id');
  const catalogue = getCatalogue();
  const product = getDesign(id) || catalogue[0];
  if (!product) return;

  if (!getDesign(id)) {
    // Unknown id — show the first piece and correct the URL so refresh and
    // sharing behave, rather than presenting an error page.
    const url = new URL(window.location.href);
    url.searchParams.set('id', product.id);
    window.history.replaceState({}, '', url);
  }

  document.title = `${product.name} — Dprince Couture`;

  renderHead(product);
  renderGallery(product);
  renderAccordion(product);
  wireRequest(product);
  renderRelated(product, catalogue);
}

/* ==========================================================================
   HEAD
   ========================================================================== */

function renderHead(product) {
  const set = (selector, value) => {
    const el = $(selector);
    if (el) el.textContent = value;
  };

  set('[data-product-name]', product.name);
  set('[data-product-price]', `From ${formatPrice(product.price)}`);
  set('[data-product-colour]', product.colour);
  set('[data-product-summary]', product.summary);
  set('[data-breadcrumb-name]', product.name);

  const categoryLink = $('[data-breadcrumb-category]');
  if (categoryLink) {
    categoryLink.textContent = product.category;
    categoryLink.href = `shop.html?category=${encodeURIComponent(product.category)}`;
  }

  const sizes = $('[data-product-sizes]');
  if (sizes) {
    sizes.textContent = product.sizes.join(' · ');
  }
}

/* ==========================================================================
   GALLERY — thumbnails, crossfade, keyboard arrows
   ========================================================================== */

function renderGallery(product) {
  const main = $('[data-gallery-main]');
  const thumbs = $('[data-gallery-thumbs]');
  if (!main || !thumbs) return;

  const images = product.gallery?.length
    ? product.gallery
    : [{ src: product.images[0], alt: product.alt }];

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

  // A single image needs no thumbnail strip
  if (images.length < 2) {
    thumbs.hidden = true;
    return;
  }

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
   REQUEST CTA
   ========================================================================== */

function wireRequest(product) {
  $$('[data-request-design]').forEach((link) => {
    link.href = `commission.html?design=${encodeURIComponent(product.id)}`;
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
      title: 'Commissioning this piece',
      body:
        'Every garment is cut to the wearer. A ceremonial agbada takes ten to fourteen ' +
        'weeks from first appointment to collection; a kaftan or senator, six to eight. ' +
        'The figure shown is a starting point — final cost depends on cloth and the ' +
        'amount of embroidery. Nothing is charged until the atelier has confirmed a quote.'
    }
  ].filter((panel) => panel.body && panel.body.trim());

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

  $$('.accordion__item', container).forEach((item) => {
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
          height: 0, duration: 0.45, ease: 'power2.inOut',
          onComplete: () => window.ScrollTrigger?.refresh()
        });
      } else {
        const target = inner.offsetHeight;
        gsap.fromTo(panel, { height: 0 }, {
          height: target, duration: 0.45, ease: 'power2.inOut',
          onComplete: () => { panel.style.height = 'auto'; window.ScrollTrigger?.refresh(); }
        });
      }
    });
  });
}

/* ==========================================================================
   RELATED
   ========================================================================== */

function renderRelated(product, catalogue) {
  const container = $('[data-related]');
  if (!container) return;

  const sameCategory = catalogue.filter((p) => p.category === product.category && p.id !== product.id);
  const others = catalogue.filter((p) => p.category !== product.category && p.id !== product.id);
  const related = [...sameCategory, ...others].slice(0, 4);

  container.innerHTML = related.map((item) => productCard(item)).join('');
  revealBatch('[data-related] [data-anim="rise"]');
}
