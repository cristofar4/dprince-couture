/* ==========================================================================
   CART — state, persistence, drawer, totals

   The cart is a frontend experience only. Nothing here processes a payment
   and the UI says so plainly at the checkout boundary; see `checkout-notice`
   in the markup and README, "Production payment processing".
   ========================================================================== */

import { SITE, formatPrice } from '../data/site.js';
import { getProduct } from '../data/products.js';
import { $, $$, escapeHtml, trapFocus, announce, toast, prefersReducedMotion } from '../core/utils.js';
import { stopScroll, startScroll } from '../core/scroll.js';

const STORAGE_KEY = 'dprince:cart:v1';

/** @type {{id:string,size:string,qty:number}[]} */
let lines = [];
const subscribers = new Set();

/* ==========================================================================
   PERSISTENCE
   ========================================================================== */

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop anything that no longer matches a real product — the catalogue
    // may have changed since the cart was written.
    return parsed.filter(
      (line) => line && typeof line.id === 'string' && getProduct(line.id) && Number(line.qty) > 0
    ).map((line) => ({
      id: line.id,
      size: String(line.size || 'One size'),
      qty: Math.min(Math.max(parseInt(line.qty, 10) || 1, 1), 99)
    }));
  } catch (error) {
    console.warn('[cart] Could not read stored cart — starting empty.', error);
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch (error) {
    // Private browsing or a full quota. The cart still works for this session.
    console.warn('[cart] Could not persist cart.', error);
  }
}

/* ==========================================================================
   STATE
   ========================================================================== */

function keyOf(id, size) { return `${id}::${size}`; }

export function getLines() {
  return lines.map((line) => ({ ...line, product: getProduct(line.id) }));
}

export function getCount() {
  return lines.reduce((total, line) => total + line.qty, 0);
}

export function getTotals() {
  const subtotal = lines.reduce((total, line) => {
    const product = getProduct(line.id);
    return total + (product ? product.price * line.qty : 0);
  }, 0);

  const shipping =
    subtotal === 0 || subtotal >= SITE.shipping.freeThreshold ? 0 : SITE.shipping.flatRate;

  return { subtotal, shipping, total: subtotal + shipping };
}

function notify() {
  save();
  subscribers.forEach((fn) => fn());
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function addItem(id, size, qty = 1) {
  const product = getProduct(id);
  if (!product) return false;

  const resolvedSize = size || (product.sizes.length === 1 ? product.sizes[0] : null);
  if (!resolvedSize) return false;

  const existing = lines.find((line) => keyOf(line.id, line.size) === keyOf(id, resolvedSize));
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, 99);
  } else {
    lines.push({ id, size: resolvedSize, qty: Math.min(qty, 99) });
  }

  notify();
  announce(`${product.name}, size ${resolvedSize}, added to your bag. ${getCount()} items in bag.`);
  toast('Added to bag');
  return true;
}

export function updateQty(id, size, qty) {
  const line = lines.find((item) => keyOf(item.id, item.size) === keyOf(id, size));
  if (!line) return;

  const next = Math.min(Math.max(qty, 0), 99);
  if (next === 0) {
    removeItem(id, size);
    return;
  }

  line.qty = next;
  notify();
  const product = getProduct(id);
  announce(`${product?.name ?? 'Item'} quantity updated to ${next}.`);
}

export function removeItem(id, size) {
  const product = getProduct(id);
  lines = lines.filter((line) => keyOf(line.id, line.size) !== keyOf(id, size));
  notify();
  announce(`${product?.name ?? 'Item'} removed from your bag. ${getCount()} items remaining.`);
  toast('Removed from bag');
}

export function clearCart() {
  lines = [];
  notify();
  announce('Bag emptied.');
}

/* ==========================================================================
   RENDERING
   ========================================================================== */

function lineMarkup(line) {
  const product = getProduct(line.id);
  if (!product) return '';

  const image = product.images[0];
  const lineTotal = product.price * line.qty;

  return `
    <li class="cart-line" data-line="${escapeHtml(line.id)}" data-size="${escapeHtml(line.size)}">
      <a class="cart-line__media" href="product.html?id=${encodeURIComponent(product.id)}" tabindex="-1" aria-hidden="true">
        <img src="${escapeHtml(image)}" alt="" width="240" height="320" loading="lazy" decoding="async">
      </a>
      <div class="cart-line__body">
        <div class="cart-line__top">
          <a class="cart-line__name" href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a>
          <span class="cart-line__price">${formatPrice(lineTotal)}</span>
        </div>
        <p class="cart-line__meta">Size ${escapeHtml(line.size)} · ${escapeHtml(product.colour)}</p>
        <div class="cart-line__actions">
          <div class="qty">
            <button type="button" class="qty__btn" data-qty-down
              aria-label="Decrease quantity of ${escapeHtml(product.name)}">&minus;</button>
            <span class="qty__value" aria-live="off">${line.qty}</span>
            <button type="button" class="qty__btn" data-qty-up
              aria-label="Increase quantity of ${escapeHtml(product.name)}">+</button>
          </div>
          <button type="button" class="cart-line__remove" data-remove>
            Remove<span class="visually-hidden"> ${escapeHtml(product.name)}, size ${escapeHtml(line.size)}</span>
          </button>
        </div>
      </div>
    </li>
  `;
}

function totalsMarkup() {
  const { subtotal, shipping, total } = getTotals();
  const shippingLabel = subtotal === 0
    ? '—'
    : shipping === 0 ? 'Complimentary' : formatPrice(shipping);

  return `
    <div class="cart-total-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    <div class="cart-total-row"><span>Delivery</span><span>${shippingLabel}</span></div>
    <div class="cart-total-row cart-total-row--grand"><span>Total</span><span>${formatPrice(total)}</span></div>
  `;
}

const EMPTY_MARKUP = `
  <div class="empty-state">
    <p class="d4">Your bag is empty</p>
    <p class="muted small">Pieces you add will be held here.</p>
    <a class="btn btn--secondary" href="shop.html">Browse the collection</a>
  </div>
`;

/** Render every cart surface currently on the page. */
function render() {
  const count = getCount();

  // Bag indicators in the header
  $$('[data-bag-count]').forEach((el) => {
    el.textContent = String(count);
    el.classList.toggle('is-filled', count > 0);
  });
  $$('[data-bag-label]').forEach((el) => {
    el.textContent = count === 1 ? '1 item in bag' : `${count} items in bag`;
  });

  // Line lists — drawer and cart page share the same markup
  $$('[data-cart-lines]').forEach((list) => {
    if (lines.length === 0) {
      list.innerHTML = '';
      list.hidden = true;
    } else {
      list.hidden = false;
      list.innerHTML = lines.map(lineMarkup).join('');
    }
  });

  $$('[data-cart-empty]').forEach((el) => {
    el.innerHTML = lines.length === 0 ? EMPTY_MARKUP : '';
    el.hidden = lines.length > 0;
  });

  $$('[data-cart-totals]').forEach((el) => { el.innerHTML = totalsMarkup(); });

  $$('[data-cart-has-items]').forEach((el) => { el.hidden = lines.length === 0; });

  window.ScrollTrigger?.refresh();
}

/* ==========================================================================
   DRAWER
   ========================================================================== */

function initDrawer() {
  const drawer = $('[data-cart-drawer]');
  const backdrop = $('[data-cart-backdrop]');
  if (!drawer || !backdrop) return;

  const gsap = window.gsap;
  const reduced = prefersReducedMotion();
  let open = false;
  let release = null;

  function openDrawer() {
    if (open) return;
    open = true;

    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    stopScroll();

    if (gsap && !reduced) {
      gsap.set(drawer, { xPercent: 100 });
      gsap.to(drawer, { xPercent: 0, duration: 0.5, ease: 'power3.out' });
      gsap.to(backdrop, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    } else {
      drawer.style.transform = 'translateX(0)';
      backdrop.style.opacity = '1';
    }

    release = trapFocus(drawer, { onEscape: closeDrawer });
    $('[data-cart-close]', drawer)?.focus();
  }

  function closeDrawer() {
    if (!open) return;
    open = false;

    drawer.setAttribute('aria-hidden', 'true');
    startScroll();

    const finish = () => {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      if (!gsap || reduced) {
        drawer.style.transform = '';
        backdrop.style.opacity = '';
      }
    };

    if (gsap && !reduced) {
      gsap.to(drawer, { xPercent: 100, duration: 0.4, ease: 'power3.in', onComplete: finish });
      gsap.to(backdrop, { opacity: 0, duration: 0.35, ease: 'power2.in' });
    } else {
      finish();
    }

    release?.();
    release = null;
  }

  $$('[data-cart-open]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openDrawer();
    });
  });

  $$('[data-cart-close]').forEach((button) => button.addEventListener('click', closeDrawer));
  backdrop.addEventListener('click', closeDrawer);

  // Adding an item from anywhere opens the drawer so the change is visible
  document.addEventListener('cart:added', openDrawer);
}

/* ==========================================================================
   EVENT DELEGATION — quantity and removal, drawer and page alike
   ========================================================================== */

function initLineControls() {
  document.addEventListener('click', (event) => {
    const lineEl = event.target.closest('[data-line]');
    if (!lineEl) return;

    const id = lineEl.dataset.line;
    const size = lineEl.dataset.size;
    const line = lines.find((item) => keyOf(item.id, item.size) === keyOf(id, size));
    if (!line) return;

    if (event.target.closest('[data-qty-up]')) {
      updateQty(id, size, line.qty + 1);
    } else if (event.target.closest('[data-qty-down]')) {
      updateQty(id, size, line.qty - 1);
    } else if (event.target.closest('[data-remove]')) {
      removeItem(id, size);
    }
  });
}

/* ==========================================================================
   INIT
   ========================================================================== */

export function initCart() {
  lines = load();
  subscribe(render);
  initDrawer();
  initLineControls();
  render();

  // Keep multiple open tabs consistent
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    lines = load();
    render();
  });
}
