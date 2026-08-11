/* ==========================================================================
   STORE — the catalogue the site actually renders, plus enquiry records

   The built-in catalogue in data/products.js is the house's permanent line.
   The owner can add further designs through the dashboard; those are held in
   this browser's localStorage and merged on top.

   BROWSER-ONLY, AND DELIBERATELY SO. Designs the owner adds here are visible
   on their own device only — nothing is uploaded, because this build has no
   backend. Publishing a design to every visitor means either moving it into
   data/products.js or connecting a server. The dashboard says this plainly
   rather than implying a reach it does not have.
   ========================================================================== */

import { PRODUCTS, CATEGORIES as BASE_CATEGORIES } from '../data/products.js';

const DESIGNS_KEY = 'dprince:designs:v1';
const ENQUIRIES_KEY = 'dprince:enquiries:v1';

const listeners = new Set();

/** Subscribe to catalogue/enquiry changes. Returns an unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn());
}

/* ==========================================================================
   LOW-LEVEL PERSISTENCE
   ========================================================================== */

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`[store] Could not read ${key}; treating as empty.`, error);
    return [];
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    // Most likely cause here is the 5MB localStorage quota, which a couple of
    // full-size photos will hit. The caller surfaces this to the owner.
    console.warn(`[store] Could not write ${key}.`, error);
    return {
      ok: false,
      message:
        'This browser is out of storage space. Photos are large — remove an ' +
        'older design, or use a smaller image, then try again.'
    };
  }
}

/* ==========================================================================
   DESIGNS
   ========================================================================== */

/** Owner-added designs only. */
export function getOwnDesigns() {
  return read(DESIGNS_KEY);
}

/** The full catalogue: house line first, then anything the owner has added. */
export function getCatalogue() {
  return [...PRODUCTS, ...getOwnDesigns()];
}

export function getDesign(id) {
  return getCatalogue().find((item) => item.id === id);
}

/** Categories present in the catalogue, in a stable display order. */
export function getCategories() {
  const found = new Set(getCatalogue().map((item) => item.category));
  const ordered = BASE_CATEGORIES.filter((c) => c === 'All' || found.has(c));
  // Any category the owner invented that is not in the base list
  found.forEach((c) => { if (!ordered.includes(c)) ordered.push(c); });
  return ordered;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics for a clean URL slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'design';
}

/** Create a design. `data` mirrors the product shape; image is a data URL. */
export function addDesign(data) {
  const designs = getOwnDesigns();

  let id = slugify(data.name);
  const taken = new Set(getCatalogue().map((item) => item.id));
  let n = 2;
  while (taken.has(id)) { id = `${slugify(data.name)}-${n}`; n += 1; }

  const design = {
    id,
    name: data.name,
    category: data.category,
    price: Number(data.price) || 0,
    colour: data.colour || '',
    badge: data.badge || null,
    featured: Boolean(data.featured),
    newArrival: true,
    isOwn: true,
    createdAt: new Date().toISOString(),
    sizes: data.sizes && data.sizes.length ? data.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
    images: [data.image, data.image],
    gallery: [{ src: data.image, alt: data.alt || `${data.name}.` }],
    alt: data.alt || `${data.name}.`,
    summary: data.summary || '',
    description: data.description || '',
    fabric: data.fabric || '',
    fit: data.fit || '',
    care: data.care || ''
  };

  designs.push(design);
  const result = write(DESIGNS_KEY, designs);
  if (result.ok) emit();
  return { ...result, design };
}

export function updateDesign(id, patch) {
  const designs = getOwnDesigns();
  const index = designs.findIndex((item) => item.id === id);
  if (index === -1) return { ok: false, message: 'That design no longer exists.' };

  const next = { ...designs[index], ...patch };
  if (patch.image) {
    next.images = [patch.image, patch.image];
    next.gallery = [{ src: patch.image, alt: next.alt || `${next.name}.` }];
  }
  if (patch.price !== undefined) next.price = Number(patch.price) || 0;

  designs[index] = next;
  const result = write(DESIGNS_KEY, designs);
  if (result.ok) emit();
  return result;
}

export function removeDesign(id) {
  const designs = getOwnDesigns().filter((item) => item.id !== id);
  const result = write(DESIGNS_KEY, designs);
  if (result.ok) emit();
  return result;
}

/* ==========================================================================
   ENQUIRIES
   Commission requests are recorded here so the dashboard has something real
   to show. This is NOT delivery — see modules/delivery.js.
   ========================================================================== */

export function getEnquiries() {
  return read(ENQUIRIES_KEY).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addEnquiry(record) {
  const enquiries = read(ENQUIRIES_KEY);
  const entry = {
    ...record,
    reference: record.reference,
    createdAt: new Date().toISOString(),
    read: false
  };
  enquiries.push(entry);
  const result = write(ENQUIRIES_KEY, enquiries);
  if (result.ok) emit();
  return result;
}

export function markEnquiryRead(reference) {
  const enquiries = read(ENQUIRIES_KEY);
  const entry = enquiries.find((item) => item.reference === reference);
  if (!entry) return { ok: false };
  entry.read = true;
  const result = write(ENQUIRIES_KEY, enquiries);
  if (result.ok) emit();
  return result;
}

export function removeEnquiry(reference) {
  const enquiries = read(ENQUIRIES_KEY).filter((item) => item.reference !== reference);
  const result = write(ENQUIRIES_KEY, enquiries);
  if (result.ok) emit();
  return result;
}

/* Keep multiple tabs in step */
window.addEventListener('storage', (event) => {
  if (event.key === DESIGNS_KEY || event.key === ENQUIRIES_KEY) emit();
});
