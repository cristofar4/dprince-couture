/* ==========================================================================
   OWNER DASHBOARD

   Add, edit and remove designs, and read commission requests.

   Storage is this browser's localStorage. That is a real limit, not a
   placeholder: designs added here appear on this device only, and clearing
   browser data erases them. The dashboard says so on screen rather than
   letting the owner believe they have published to the world.

   Photos are downscaled to 900px before storage — localStorage caps at about
   5MB and two phone photos would blow that on their own.
   ========================================================================== */

import {
  getOwnDesigns, getCatalogue, addDesign, updateDesign, removeDesign,
  getEnquiries, markEnquiryRead, removeEnquiry, subscribe
} from './store.js';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { formatPrice } from '../data/site.js';
import { formatRequest } from './delivery.js';
import { validateForm } from './forms.js';
import { $, $$, escapeHtml, announce, toast } from '../core/utils.js';

const MAX_IMAGE_PX = 900;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

let editingId = null;
let pendingImage = null;

export function initDashboard() {
  const root = $('[data-dashboard]');
  if (!root) return;

  initTabs();
  initDesignForm();
  initImageUpload();
  subscribe(renderAll);
  renderAll();
}

/* ==========================================================================
   TABS
   ========================================================================== */

function initTabs() {
  const buttons = $$('[data-dash-tab]');
  const panels = $$('[data-dash-panel]');

  function select(name) {
    buttons.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.dashTab === name)));
    panels.forEach((p) => { p.hidden = p.dataset.dashPanel !== name; });
    window.ScrollTrigger?.refresh();
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => select(button.dataset.dashTab));
    // Arrow-key movement between tabs, per the WAI-ARIA tabs pattern
    button.addEventListener('keydown', (event) => {
      const index = buttons.indexOf(button);
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = buttons[(index + 1) % buttons.length];
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = buttons[(index - 1 + buttons.length) % buttons.length];
      if (!next) return;
      event.preventDefault();
      next.focus();
      select(next.dataset.dashTab);
    });
  });

  select('overview');
}

/* ==========================================================================
   RENDER
   ========================================================================== */

function renderAll() {
  renderStats();
  renderDesignList();
  renderEnquiries();
}

function renderStats() {
  const own = getOwnDesigns();
  const enquiries = getEnquiries();
  const unread = enquiries.filter((e) => !e.read).length;

  const set = (selector, value) => {
    const el = $(selector);
    if (el) el.textContent = String(value);
  };

  set('[data-stat-designs]', PRODUCTS.length + own.length);
  set('[data-stat-own]', own.length);
  set('[data-stat-enquiries]', enquiries.length);

  const badge = $('[data-unread-badge]');
  if (badge) {
    badge.textContent = unread ? `${unread} unread` : 'All read';
    badge.classList.toggle('dash-badge--own', unread > 0);
  }
}

function renderDesignList() {
  const list = $('[data-design-list]');
  if (!list) return;

  const own = getOwnDesigns();
  const house = PRODUCTS;

  const row = (item, isOwn) => `
    <div class="dash-row" data-design-row="${escapeHtml(item.id)}">
      <div class="dash-row__media">
        <img src="${escapeHtml(item.images[0])}" alt="" width="120" height="160" loading="lazy" decoding="async">
      </div>
      <div>
        <p class="dash-row__name">${escapeHtml(item.name)}</p>
        <p class="dash-row__meta">
          ${escapeHtml(item.category)} · from ${formatPrice(item.price)}
          <span class="dash-badge${isOwn ? ' dash-badge--own' : ''}">${isOwn ? 'Added by you' : 'House line'}</span>
        </p>
      </div>
      <div class="dash-row__actions">
        <a class="btn btn--ghost btn--sm" href="product.html?id=${encodeURIComponent(item.id)}">View</a>
        ${isOwn ? `
          <button type="button" class="btn btn--ghost btn--sm" data-edit="${escapeHtml(item.id)}">Edit</button>
          <button type="button" class="btn btn--ghost btn--sm" data-delete="${escapeHtml(item.id)}">Delete</button>
        ` : ''}
      </div>
    </div>
  `;

  list.innerHTML = `
    ${own.length ? `
      <h3 class="label muted">Your designs (${own.length})</h3>
      ${own.map((item) => row(item, true)).join('')}
    ` : `
      <div class="notice">You have not added any designs yet. Use the form below — they
      will appear on the shop and homepage on this device.</div>
    `}
    <h3 class="label muted" style="margin-block-start:var(--s5)">House line (${house.length})</h3>
    ${house.map((item) => row(item, false)).join('')}
  `;

  list.addEventListener('click', onListClick);
}

function onListClick(event) {
  const editButton = event.target.closest('[data-edit]');
  const deleteButton = event.target.closest('[data-delete]');

  if (editButton) {
    startEdit(editButton.dataset.edit);
    return;
  }

  if (deleteButton) {
    const id = deleteButton.dataset.delete;
    const design = getCatalogue().find((item) => item.id === id);
    // Destructive and irreversible — confirm before removing
    if (!window.confirm(`Delete “${design?.name ?? id}”? This cannot be undone.`)) return;
    const result = removeDesign(id);
    if (result.ok) {
      toast('Design deleted');
      announce(`${design?.name ?? 'Design'} deleted.`);
      if (editingId === id) resetForm();
    }
  }
}

function renderEnquiries() {
  const list = $('[data-enquiry-list]');
  if (!list) return;

  const enquiries = getEnquiries();

  if (enquiries.length === 0) {
    list.innerHTML = `
      <div class="notice">No commission requests yet. Requests sent through the
      site appear here, newest first.</div>`;
    return;
  }

  list.innerHTML = enquiries
    .map((e) => {
      const measurements = Object.entries(e.measurements || {});
      const when = new Date(e.createdAt).toLocaleString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      return `
        <article class="enquiry-card" data-enquiry="${escapeHtml(e.reference)}">
          <div class="enquiry-card__head">
            <div>
              <p class="label">${escapeHtml(e.reference)}</p>
              <p class="small muted">${escapeHtml(when)}</p>
            </div>
            <span class="dash-badge${e.read ? '' : ' dash-badge--own'}">${e.read ? 'Read' : 'New'}</span>
          </div>
          <dl>
            <dt>Style</dt><dd>${escapeHtml(e.styleName || '—')}</dd>
            <dt>Client</dt><dd>${escapeHtml(e.name)}</dd>
            <dt>Email</dt><dd><a class="link" href="mailto:${escapeHtml(e.email)}">${escapeHtml(e.email)}</a></dd>
            ${e.phone ? `<dt>Phone</dt><dd><a class="link" href="tel:${escapeHtml(e.phone)}">${escapeHtml(e.phone)}</a></dd>` : ''}
            ${e.occasion ? `<dt>Occasion</dt><dd>${escapeHtml(e.occasion)}</dd>` : ''}
            ${e.needed ? `<dt>Needed by</dt><dd>${escapeHtml(e.needed)}</dd>` : ''}
            ${e.fabric ? `<dt>Fabric</dt><dd>${escapeHtml(e.fabric)}</dd>` : ''}
            ${measurements.length ? `<dt>Measurements</dt><dd>${measurements.map(([k, v]) => `${escapeHtml(k)} ${escapeHtml(v)}cm`).join(' · ')}</dd>` : ''}
            ${e.message ? `<dt>Message</dt><dd>${escapeHtml(e.message)}</dd>` : ''}
          </dl>
          <div class="dash-row__actions">
            ${e.read ? '' : `<button type="button" class="btn btn--ghost btn--sm" data-mark-read="${escapeHtml(e.reference)}">Mark read</button>`}
            <button type="button" class="btn btn--ghost btn--sm" data-copy="${escapeHtml(e.reference)}">Copy details</button>
            <button type="button" class="btn btn--ghost btn--sm" data-remove-enquiry="${escapeHtml(e.reference)}">Delete</button>
          </div>
        </article>
      `;
    })
    .join('');

  list.addEventListener('click', onEnquiryClick);
}

async function onEnquiryClick(event) {
  const read = event.target.closest('[data-mark-read]');
  const copy = event.target.closest('[data-copy]');
  const remove = event.target.closest('[data-remove-enquiry]');

  if (read) {
    markEnquiryRead(read.dataset.markRead);
    announce('Marked as read.');
    return;
  }

  if (copy) {
    const entry = getEnquiries().find((e) => e.reference === copy.dataset.copy);
    if (!entry) return;
    const text = formatRequest(entry);
    try {
      await navigator.clipboard.writeText(text);
      toast('Details copied');
      announce('Request details copied to the clipboard.');
    } catch {
      // Clipboard access is refused in some contexts; show it instead
      window.prompt('Copy the request details:', text);
    }
    return;
  }

  if (remove) {
    if (!window.confirm('Delete this request? This cannot be undone.')) return;
    removeEnquiry(remove.dataset.removeEnquiry);
    toast('Request deleted');
    announce('Request deleted.');
  }
}

/* ==========================================================================
   IMAGE UPLOAD — downscaled before storage
   ========================================================================== */

function initImageUpload() {
  const input = $('[data-design-image]');
  const preview = $('[data-design-preview]');
  const message = input?.closest('.field')?.querySelector('.field__message');
  if (!input) return;

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (message) {
        message.textContent = 'Choose an image file (JPEG, PNG or WebP).';
        message.className = 'field__message field__message--error';
      }
      input.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      if (message) {
        message.textContent = 'That image is over 8MB. Choose a smaller one.';
        message.className = 'field__message field__message--error';
      }
      input.value = '';
      return;
    }

    try {
      pendingImage = await downscale(file);
      if (preview) {
        preview.innerHTML = `<img src="${pendingImage}" alt="Preview of the design photo you selected">`;
      }
      if (message) {
        message.textContent = 'Photo ready.';
        message.className = 'field__message field__message--success';
      }
      announce('Photo ready.');
    } catch (error) {
      console.error('[dashboard] Could not process image.', error);
      if (message) {
        message.textContent = 'That image could not be read. Try a different file.';
        message.className = 'field__message field__message--error';
      }
    }
  });
}

/** Read a file, scale its longest edge to MAX_IMAGE_PX, return a data URL. */
function downscale(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('decode failed'));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_PX / Math.max(image.width, image.height));
        const w = Math.round(image.width * scale);
        const h = Math.round(image.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(image, 0, 0, w, h);

        // WebP where supported, JPEG otherwise — both far smaller than PNG
        const webp = canvas.toDataURL('image/webp', 0.82);
        resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ==========================================================================
   DESIGN FORM
   ========================================================================== */

function initDesignForm() {
  const form = $('[data-design-form]');
  if (!form) return;

  const select = $('#d-category', form);
  if (select) {
    select.innerHTML = CATEGORIES.filter((c) => c !== 'All')
      .map((c) => `<option>${escapeHtml(c)}</option>`)
      .join('');
  }

  $('[data-cancel-edit]')?.addEventListener('click', resetForm);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const { valid, firstInvalid, errors } = validateForm(form);
    const status = $('[data-form-status]', form);

    if (!valid) {
      if (status) {
        status.textContent = errors === 1
          ? 'One field needs your attention.'
          : `${errors} fields need your attention.`;
        status.className = 'field__message field__message--error';
      }
      firstInvalid?.focus();
      return;
    }

    if (!editingId && !pendingImage) {
      if (status) {
        status.textContent = 'Add a photo of the design before saving.';
        status.className = 'field__message field__message--error';
      }
      announce('Add a photo of the design before saving.');
      $('[data-design-image]')?.focus();
      return;
    }

    const data = {
      name: $('#d-name', form).value.trim(),
      category: $('#d-category', form).value,
      price: $('#d-price', form).value,
      colour: $('#d-colour', form).value.trim(),
      summary: $('#d-summary', form).value.trim(),
      description: $('#d-description', form).value.trim(),
      alt: `${$('#d-name', form).value.trim()}, ${$('#d-colour', form).value.trim()}.`
    };
    if (pendingImage) data.image = pendingImage;

    const result = editingId ? updateDesign(editingId, data) : addDesign(data);

    if (!result.ok) {
      if (status) {
        status.textContent = result.message;
        status.className = 'field__message field__message--error';
      }
      announce(result.message);
      return;
    }

    const wasEditing = Boolean(editingId);
    resetForm();

    if (status) {
      status.textContent = wasEditing
        ? 'Design updated. It is live on this device.'
        : 'Design added. It is live on the shop and homepage on this device.';
      status.className = 'field__message field__message--success';
    }
    toast(wasEditing ? 'Design updated' : 'Design added');
    announce(wasEditing ? 'Design updated.' : 'Design added to the catalogue.');
  });
}

function startEdit(id) {
  const design = getOwnDesigns().find((item) => item.id === id);
  if (!design) return;

  editingId = id;
  pendingImage = null;

  const form = $('[data-design-form]');
  $('#d-name', form).value = design.name;
  $('#d-category', form).value = design.category;
  $('#d-price', form).value = design.price;
  $('#d-colour', form).value = design.colour;
  $('#d-summary', form).value = design.summary || '';
  $('#d-description', form).value = design.description || '';

  const preview = $('[data-design-preview]');
  if (preview) preview.innerHTML = `<img src="${escapeHtml(design.images[0])}" alt="Current photo for ${escapeHtml(design.name)}">`;

  $('[data-form-title]').textContent = `Editing “${design.name}”`;
  $('[data-form-submit]').textContent = 'Save changes';
  $('[data-cancel-edit]').hidden = false;
  $('[data-image-hint]').textContent = 'Leave the photo empty to keep the current one.';

  // The form lives further down the panel; take the owner to it
  form.scrollIntoView({ behavior: 'auto', block: 'start' });
  $('#d-name', form).focus();
  announce(`Editing ${design.name}.`);
}

function resetForm() {
  const form = $('[data-design-form]');
  if (!form) return;

  form.reset();
  editingId = null;
  pendingImage = null;

  $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
  $$('.field__message', form).forEach((el) => { el.textContent = ''; el.className = 'field__message'; });

  const preview = $('[data-design-preview]');
  if (preview) preview.innerHTML = '';

  $('[data-form-title]').textContent = 'Add a design';
  $('[data-form-submit]').textContent = 'Add design';
  $('[data-cancel-edit]').hidden = true;
  $('[data-image-hint]').textContent = 'JPEG, PNG or WebP. Downscaled to 900px automatically.';
}
