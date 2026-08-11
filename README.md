# Dprince Couture

A production-quality website for a Nigerian ceremonial tailoring house — agbada,
kaftan, senator and accessories, cut in Lagos and Abuja.

The house makes to order, so this is **not a shop**. There is no bag and no
checkout: a visitor finds a style, sends a commission request with their
measurements, and the owner reads it in a dashboard.

Built with HTML5, CSS3 and vanilla JavaScript. The only third-party
dependencies are **GSAP**, **ScrollTrigger** and **Lenis**, all vendored
locally. No framework, no build step, no bundler, no package manager.

---

## Running it

The site uses ES modules, so it must be served over HTTP — opening
`index.html` from the filesystem (`file://`) will not work.

```bash
python3 serve.py          # http://localhost:8000
python3 serve.py 3000     # a different port
```

`serve.py` is a plain static server that **also implements HTTP Range
requests**. That matters: the scroll-scrubbed atelier film on the homepage
seeks through the video by setting `currentTime`, and a server without Range
support leaves the video unseekable, so the scrub silently does nothing.
Python's built-in `http.server` does *not* implement Range — everything else
works under it, but that one effect will not.

Any real static host (nginx, Apache, Netlify, Vercel, GitHub Pages, S3 +
CloudFront) supports Range and needs no configuration.

**Browser support.** Chrome, Edge, Firefox, Safari and mobile equivalents, all
current versions. Video is H.264/MP4, which every shipping browser decodes.
Some Chromium builds compiled without proprietary codecs (Playwright's bundled
Chromium, certain Linux distro builds) cannot decode H.264; there the poster
frames display and the site degrades cleanly rather than breaking.

---

## File tree

```
dprince-couture/
├── index.html                  Homepage
├── shop.html                   Collection, filterable
├── product.html                Product template — reads ?id=
├── lookbook.html               AW26 campaign, pinned horizontal
├── about.html                  The house
├── journal.html                Stories index
├── article.html                Article template — reads ?id=
├── commission.html             Commission request — replaces the bag
├── dashboard.html              Owner: add designs, read requests
├── contact.html                Enquiries and ateliers
├── client-services.html        Shipping / returns / sizing / care / payment / FAQ
├── serve.py                    Local dev server with Range support
├── README.md
└── assets/
    ├── css/
    │   ├── reset.css           Reset + reduced-motion defaults
    │   ├── tokens.css          All design tokens — colour, type, space, ratio
    │   ├── base.css            @font-face, elements, type classes, focus
    │   ├── layout.css          Containers, 12-column grid, section rhythm
    │   ├── components.css      Header, nav, buttons, fields, cards, drawer…
    │   ├── pages.css           Page-specific composition
    │   └── animations.css      Pre-animation states + reduced-motion overrides
    ├── js/
    │   ├── main.js             Per-page bootstrap
    │   ├── data/
    │   │   ├── site.js         Brand, nav, footer, ateliers, shipping rules
    │   │   ├── products.js     The catalogue
    │   │   └── journal.js      The articles
    │   ├── core/
    │   │   ├── utils.js        Focus trap, live region, helpers
    │   │   ├── scroll.js       Lenis + ScrollTrigger integration
    │   │   ├── transitions.js  Page transition overlay
    │   │   ├── cursor.js       Custom cursor
    │   │   └── intro.js        Intro sequence
    │   ├── modules/
    │   │   ├── nav.js          Header state, mobile menu
    │   │   ├── store.js        Catalogue + owner designs + enquiries
    │   │   ├── delivery.js     How a request reaches the owner
    │   │   ├── search.js       Full-screen search overlay
    │   │   ├── cards.js        Product and journal card markup
    │   │   ├── shop.js         Filtering, sorting, live count
    │   │   ├── product.js      Gallery, accordion, request handoff
    │   │   ├── forms.js        Validation engine
    │   │   ├── commission.js   Commission request flow
    │   │   └── dashboard.js    Owner dashboard
    │   └── animations/
    │       ├── split.js        Line/word splitting with resize re-split
    │       ├── shared.js       Reveals, split headings, parallax
    │       ├── home.js         Hero, parallax, scrubbed video
    │       └── lookbook.js     Pinned horizontal lookbook
    ├── fonts/                  Fraunces + Archivo, self-hosted woff2 subsets
    ├── img/
    │   ├── products/           Catalogue imagery
    │   ├── editorial/          Campaign and detail imagery
    │   ├── journal/            Article imagery
    │   └── posters/            Video poster frames
    ├── vendor/                 gsap, ScrollTrigger, lenis
    └── video/                  Campaign and atelier film
```

---

## Customising it

Everything you are likely to change lives in three data files. None of them
require touching markup, CSS or animation code.

### Brand, navigation, footer, contact

`assets/js/data/site.js` — wordmark, tagline, announcement bar, nav order,
footer columns, atelier addresses and hours, email, shipping rules, currency.

Delivery rates still live here for the client-services page, even though
nothing is sold online:

```js
shipping: { flatRate: 15000, freeThreshold: 500000 }
```

The wordmark also appears as literal text in each HTML file's header, footer
and (on `index.html`) the intro overlay. Search for `DPRINCE` to change it
everywhere.

### Products

`assets/js/data/products.js` — one object per piece. Add, remove or reorder
freely; the homepage, shop, product page, search and related-products rails
all derive from this array — merged with anything the owner adds in the
dashboard.

```js
{
  id: 'unique-slug',            // used in product.html?id=
  name: 'Ààrẹ Ceremonial Agbada',
  category: 'Agbada',           // must exist in CATEGORIES
  price: 890000,                // whole naira, no kobo, no string
  colour: 'Chalk white / silver thread',
  badge: 'Ceremonial',          // or null
  featured: true,               // appears in "Selected"
  newArrival: true,             // appears in "New this season"
  sizes: GARMENT_SIZES,         // or ['One size']
  images: [main, hover],        // card image, then hover image
  gallery: [{ src, alt }, …],   // product page gallery
  alt: 'Descriptive alt text.',
  summary: 'One line.',
  description: '…', fabric: '…', fit: '…', care: '…'
}
```

Categories are declared at the top of the same file. Adding one to
`CATEGORIES` adds its filter chip and footer link automatically.

### Journal

`assets/js/data/journal.js` — articles are block arrays rather than HTML
strings, so nothing is injected unescaped. Block types: `p`, `h2`, `quote`,
`image`.

### Design tokens

`assets/css/tokens.css` is the single source of truth for colour, type scale,
spacing, ratios and motion. Nothing below it hard-codes a colour or a size, so
re-skinning the site is a matter of editing that one file.

---

## Replacing the imagery

Drop replacements at the same paths and nothing else needs to change. Keep the
aspect ratios or the grid will shift:

| Slot | Ratio | Path |
|---|---|---|
| Product card / gallery | 3:4 | `assets/img/products/` |
| Editorial | 4:5 | `assets/img/editorial/` |
| Journal card | 4:5 | `assets/img/journal/` |
| Campaign video | 9:16 | `assets/video/` |
| Video poster | 9:16 | `assets/img/posters/` |
| Craft detail | 1:1 | `assets/img/editorial/craft-detail.webp` |

Every `<img>` carries explicit `width`/`height` and every media box has a CSS
`aspect-ratio`, so replacing an asset cannot introduce layout shift.

To regenerate poster frames after swapping a video:

```bash
ffmpeg -ss 2 -i assets/video/hero-campaign.mp4 -frames:v 1 -q:v 3 \
       assets/img/posters/hero-campaign.jpg
```

The scroll-scrubbed atelier clip is encoded **all-intra** — every frame a
keyframe — so seeking is smooth. If you replace it, re-encode the same way or
the scrub will stutter:

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -crf 31 -preset slow \
       -g 1 -keyint_min 1 -sc_threshold 0 -movflags +faststart \
       assets/video/atelier-craft.mp4
```

### Asset provenance — read before going live

The photography and film currently in this repository were supplied as
**visual direction references**. They carry other makers' marks — mannequin
tags reading "Mavr & Dama", "RASHA Ltd" and "Rich Wardrobe", a photographer's
watermark on the campaign stills, and creator handles on the source films.

They are fine as art direction. **They are not cleared for use as this brand's
own product photography**, and should be replaced with rights-cleared imagery
before this site is published. The asset table above exists to make that a
filename-level change.

The atelier addresses, phone numbers and email in `site.js` are placeholders
and must also be replaced.

---

## How a commission request reaches the owner

**Live.** The commission form posts to Formspree, which emails the atelier.
Delivery mode is set in `assets/js/modules/delivery.js`:

```js
MODE: 'formspree',
formspree: { endpoint: 'https://formspree.io/f/mkjwrzow' }
```

Each email carries the reference (`DPC-…`), the chosen style, cloth, colour,
occasion, date needed, the client's contact details, every measurement they
gave, and their message — both as structured fields and as a readable
transcript, so it is legible straight from the inbox.

**Before you rely on it, send one real test.** Formspree needs a new form
activated: the first submission triggers a confirmation email to the form
owner, and until that is clicked, submissions are held rather than delivered.
Run the site, submit the form once, and check the inbox.

The free tier covers roughly 50 submissions a month. Past that Formspree holds
them and emails a warning, so keep an eye on the count if enquiries pick up.

**If a send fails** — server error, or the visitor is offline — the form says
so, stays filled in so nothing is retyped, and the attempt is still recorded in
the dashboard marked undelivered. A failure never shows a false success.

### Other delivery routes

Change `MODE` to switch; all are already written.

| Mode | What happens | Setup |
|---|---|---|
| `'formspree'` | Emailed to the atelier | **current** |
| `'whatsapp'` | Opens WhatsApp pre-filled | number already set: `2349036961268` |
| `'email'` | Opens the visitor's mail app | set `DELIVERY.email.address` |
| `'demo'` | Nothing sent, recorded locally | none — useful while testing |

The notice on the form rewrites itself to match whichever mode is active, so
the site never overstates what it does.

---

## The owner dashboard

`dashboard.html` — add designs with a photo, price, colour and description;
edit or delete them; read commission requests and copy their details.

**Storage is this browser's `localStorage`, and that is a real limit.** A design
the owner adds appears on the shop, the homepage and in search *on their own
device only*. Nothing is uploaded, because this build has no server. Clearing
browser data erases it. The dashboard states this at the top rather than letting
the owner believe they have published to the world.

Photos are downscaled to 900px and re-encoded as WebP before storage —
`localStorage` caps at roughly 5MB and two untouched phone photos would exceed
it on their own. If the quota is hit anyway, the save fails with a message
explaining what to do rather than silently losing the design.

**To publish a design to every visitor**, do one of:

1. Add it to `assets/js/data/products.js` and drop its photo in
   `assets/img/products/`. Permanent, free, works for everyone.
2. Connect a backend and swap `modules/store.js` to read and write it. The
   module boundary is already in the right place for this.

The dashboard is not access-controlled. It is a page in a static site, so anyone
with the URL can open it. Before going live, either remove the footer link and
the file, or put the site behind a login your host provides.

---

## What this frontend does not do

- **It takes no payment.** No processor is connected, no order can be placed,
  and no card details are collected anywhere. The house works on deposit and
  balance in the atelier; `client-services.html#payment` says so.
- **It does not reserve anything.** A commission request is a request. The
  atelier replies with a quote and a fitting date.
- **The dashboard does not publish.** See above.

---

## Design system

**Typeface pairing** — Fraunces (display, variable, `opsz` 9–144) and Archivo
(sans, variable). Both self-hosted as latin / latin-ext / **vietnamese** woff2
subsets.

The vietnamese subset is not optional here. Yoruba dot-below vowels — `ẹ`
(U+1EB9) and `ọ` (U+1ECD) — live in U+1EA0–1EF1, which the latin-ext subset
does not cover. Bodoni Moda was the original display choice and was dropped
for exactly this reason: it ships no vietnamese subset, so names like *Ààrẹ*
and *Ìlẹ̀kẹ̀* fell back to a system serif mid-word.

**Palette** — deep emerald, cool bone and antique gold. Emerald carries the
ceremonial register without quoting the flag literally, and white, black and
marigold garments all read cleanly against a cool ground.

| Token | Hex | Use | Contrast on `--bone` |
|---|---|---|---|
| `--bone` | `#ECEEE9` | page ground | — |
| `--cloth` | `#F4F6F2` | cards, panels | — |
| `--ink` | `#0E1A16` | primary text, dark sections | 15.0:1 AAA |
| `--emerald` | `#1B4D3E` | brand accent, links, focus ring | 8.1:1 AAA |
| `--sage` | `#576860` | muted text, metadata | 5.0:1 AA |
| `--rule` | `#D3D8D2` | hairlines | — |
| `--gold` | `#C6A15B` | decorative on light; legible as text on `--ink` only | 2.0:1 ✗ / 7.5:1 on ink |

**Spacing** is an 8pt scale. **Grid** is 12 columns on desktop, 8 on tablet, 4
on mobile. **Breakpoints** at 360 / 480 / 768 / 1024 / 1280 / 1600. Corners are
square throughout and there are no shadows except on overlay panels —
separation comes from whitespace and hairlines.

---

## Animation notes

**Lenis and ScrollTrigger share one loop.** GSAP's ticker drives
`lenis.raf()`; there is no second `requestAnimationFrame`. Lenis scroll events
push `ScrollTrigger.update`. ScrollTrigger refreshes after `document.fonts.ready`,
on `window.load`, after any late image decode, and on a 200ms-debounced resize.

**Everything responsive lives in `gsap.matchMedia()`** so triggers are created
and reverted per breakpoint with no leaks. The horizontal lookbook pins only
at ≥1024px, for 1.2 viewports; below that it is a native scroll-snap carousel
with no pinning at all.

**A note on percentage transforms and GSAP — read this before adding one.**
Several resting states in CSS are percentage translates: `translate3d(0,105%,0)`
on split lines, `translateX(100%)` on the mobile menu. GSAP parses those into
its *pixel* `x`/`y` properties, so setting `xPercent`/`yPercent` alone stacks on
top (200% total) and the tween back to `0` lands on the CSS offset rather than
at zero.

This bit twice. The hero headline never appeared, and later the mobile menu
"opened" a full viewport off-screen — `aria-hidden` flipped, focus was trapped,
and nothing was visible. Every such animation therefore sets the pixel
component explicitly: `{ x: 0, xPercent: 100 }`, `{ y: 0, yPercent: 105 }`. If
you add a reveal that translates by percentage, do the same — and assert the
element's **bounding rect**, not just its attributes, or the bug hides from
your tests exactly as it hid from mine.

### Reduced motion

`prefers-reduced-motion: reduce` is honoured throughout. An inline script in
each `<head>` adds `.has-anim` to the document **only** when JavaScript is
running and reduced motion is not requested — so pre-animation hidden states
are never applied without a script able to undo them. With reduced motion on:

- Lenis never initialises; native scrolling, keyboard paging and anchors work
- parallax, split reveals and the custom cursor are all skipped
- the intro overlay is removed from the DOM before it can paint
- nothing is pinned — the lookbook becomes a vertical stack
- page transitions reduce to a 0.15s fade
- all content renders at its natural end state

The same guarantee holds with JavaScript disabled entirely: no `.has-anim`
class means no hidden states, and every page reads as plain semantic HTML.

---

## Accessibility

Semantic landmarks, one `h1` per page and no skipped heading levels. Skip link
is the first focusable element. Focus is trapped in the mobile menu and the
search overlay, returned to the invoking control on close, and Escape closes
both. Search results and filter changes are announced through a live region;
validation errors are bound with `aria-invalid` and `aria-describedby` and
always carry a glyph as well as colour. All touch targets are at least
44 × 44px. Focus rings are never removed.

---

## Verified

Driven with Playwright at 320 / 360 / 390 / 412 / 768 / 1024 / 1440px — **245 assertions passing**:

- all 11 pages load with no console errors, one `h1`, alt text on every image
- no cart markup survives anywhere
- search: opens, focuses, filters live, empty state, Escape closes
- hero prompt: renders, cycles, fixed height so it cannot shift layout
- commission: style picker, 9 measurement fields, validation, reference issued,
  request recorded, notice matches the live delivery mode
- Formspree integration: correct endpoint, method, headers and payload; server
  error, offline and success paths all handled without losing the visitor's work
- product → commission handoff preselects the right design
- dashboard: photo upload and downscale, design saved, appears on shop and in
  search, edit, delete, request list
- hamburger visible at 360/390/768 with three 2px bars and a ≥44px target
- mobile menu, driven by real taps: opens **on screen**, fills the viewport,
  links pass a hit test at their centre, closes, and reopens cleanly — checked
  on first visit, on a repeat visit with the intro skipped, and under reduced
  motion
- product cards: nothing escapes the card panel at 320–1440px, and names and
  prices share a baseline across every row
- mobile menu contact block: call, WhatsApp and email are all ≥44px targets,
  inside the panel, and pass a hit test; the commission CTA stays reachable
  after scrolling, down to a 320×640 screen
- the six-item nav does not collide with the wordmark or search at ≥1024px,
  and the hamburger takes over below that
- no horizontal overflow at any breakpoint
- reduced motion: nothing hidden, nothing pinned, no cursor, no intro, and the
  hero prompt still cycles readably
- scroll-scrubbed video tracks scroll progress linearly across the pin
