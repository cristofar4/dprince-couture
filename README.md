# Dprince Couture

A production-quality luxury fashion website for a Nigerian ceremonial tailoring
house — agbada, kaftan, senator and accessories, cut in Lagos and Abuja.

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
├── booking.html                Appointment request
├── contact.html                Enquiries and ateliers
├── cart.html                   Shopping bag
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
    │   │   ├── cart.js         State, localStorage, drawer, totals
    │   │   ├── cards.js        Product and journal card markup
    │   │   ├── shop.js         Filtering, sorting, live count
    │   │   ├── product.js      Gallery, sizes, quantity, accordion
    │   │   ├── forms.js        Validation engine
    │   │   └── booking.js      Appointment request flow
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

Shipping and free-delivery thresholds are read by the cart:

```js
shipping: { flatRate: 15000, freeThreshold: 500000 }
```

The wordmark also appears as literal text in each HTML file's header, footer
and (on `index.html`) the intro overlay. Search for `DPRINCE` to change it
everywhere.

### Products

`assets/js/data/products.js` — one object per piece. Add, remove or reorder
freely; the homepage, shop, product page, cart and related-products rails all
derive from this array.

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

## What this frontend does not do

Two boundaries are stated in the UI itself rather than hidden:

- **The cart takes no payment.** No payment processor is connected, no order
  is placed, and no card details are collected anywhere on this site. The
  checkout notice on `cart.html` and the payment section of
  `client-services.html` both say so plainly. Wiring a real processor is a
  backend task and deliberately out of scope here.
- **Booking requests a slot, it does not reserve one.** Submitting the form
  issues a reference (`DPC-…`) and states that the atelier will confirm within
  one working day. Nothing is written to a calendar.

Form submissions are validated and acknowledged client-side only. There is no
backend; connect the two forms to your own endpoint in
`assets/js/modules/forms.js` (`onValid`) and `assets/js/modules/booking.js`
(`wireSubmit`).

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

**Palette**, sampled from the campaign photography:

| Token | Hex | Use | Contrast on `--bone` |
|---|---|---|---|
| `--bone` | `#F1EDE4` | page ground | — |
| `--cloth` | `#F5F2EB` | raised surfaces | — |
| `--ink` | `#131313` | primary text, footer | 16.4:1 AAA |
| `--slate` | `#5C5F61` | muted text, prices | 5.0:1 AA |
| `--rule` | `#DDD6C8` | hairlines | — |
| `--clay` | `#A4562F` | accent, links, focus ring | 5.1:1 AA |
| `--bronze` | `#8B5E3C` | categories | — |
| `--gold` | `#B39055` | decorative only, never text | 2.6:1 ✗ |

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

**A note on `yPercent` and CSS percentage transforms.** The pre-animation
states in `animations.css` use `translate3d(0, 105%, 0)`. GSAP parses that into
its *pixel* `y` property, so setting `yPercent` alone stacks on top of it and
the reveal finishes at the CSS offset instead of at zero. Every split-line and
intro-character reveal therefore sets `{ y: 0, yPercent: … }` explicitly. If
you add a reveal that translates by percentage, do the same.

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
is the first focusable element. Focus is trapped in the mobile menu and cart
drawer, returned to the invoking control on close, and Escape closes both.
Cart changes and filter results are announced through a polite live region;
validation errors are bound with `aria-invalid` and `aria-describedby` and
always carry a glyph as well as colour. All touch targets are at least
44 × 44px. Focus rings are never removed.

---

## Verified

Driven with Playwright at 360 / 390 / 768 / 1440px:

- all 11 pages load with no console errors and no failed requests
- all 36 asset references resolve
- cart: add, quantity, remove, totals, free-shipping threshold, localStorage
  persistence across navigation, cross-tab sync
- shop: category filter, sort, live result count, URL deep links
- forms: empty-submit blocking, email validation, `aria-describedby` binding,
  success states
- booking: required fields, Sunday rejection, reference issue, success state
- no horizontal overflow on any page at any breakpoint
- mobile menu opens, traps focus, closes on Escape
- reduced motion: nothing hidden, nothing pinned, no cursor, no intro
- scroll-scrubbed video tracks scroll progress linearly across the pin

57 functional assertions passing.
