/* ==========================================================================
   PRODUCT DATA — Dprince Couture
   One object per piece. `images[0]` is the card image; `images[1]` is the
   hover/second view. `gallery` drives the product page. Prices are whole
   naira integers — no kobo, no strings.
   ========================================================================== */

export const CATEGORIES = ['All', 'Agbada', 'Kaftan', 'Senator', 'Accessories'];

export const GARMENT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const PRODUCTS = [
  {
    id: 'aare-ceremonial-agbada',
    name: 'Ààrẹ Ceremonial Agbada',
    category: 'Agbada',
    price: 890000,
    colour: 'Chalk white / silver thread',
    badge: 'Ceremonial',
    featured: true,
    newArrival: true,
    sizes: GARMENT_SIZES,
    images: [
      'assets/img/editorial/campaign-agbada-01.webp',
      'assets/img/editorial/campaign-agbada-02.webp'
    ],
    gallery: [
      { src: 'assets/img/editorial/campaign-agbada-01.webp', alt: 'Model wearing the Ààrẹ ceremonial agbada in chalk white with silver thread embroidery, holding a carved opa staff.' },
      { src: 'assets/img/editorial/campaign-agbada-02.webp', alt: 'Full-length view of the Ààrẹ agbada showing the draped shoulder and floor-length sokoto.' },
      { src: 'assets/img/products/ileke-detail.webp', alt: 'Close detail of the silver embroidery panel and layered coral bead strands at the chest.' },
      { src: 'assets/img/editorial/craft-detail.webp', alt: 'Atelier detail: chalk pattern lines marked across dark cloth before cutting.' }
    ],
    alt: 'Ààrẹ ceremonial agbada in chalk white cotton damask with silver thread embroidery.',
    summary: 'A four-piece ceremonial ensemble in hand-loomed damask, embroidered over eleven days.',
    description:
      'Cut in the manner reserved for chieftaincy, the Ààrẹ is a four-piece ceremonial ensemble — the flowing agbada, the embroidered buba worn beneath, a tailored sokoto, and a matching fìlà. The silver-thread panel at the chest is worked entirely by hand across eleven days, its motif drawn from the aso-oke weaving traditions of Ìsẹ̀yìn. The shoulder is engineered to hold its fall without stiffening, so the garment moves with the wearer rather than against him.',
    fabric:
      'Hand-loomed cotton damask, 220gsm, woven in Ìsẹ̀yìn. Silver viscose embroidery thread. Unlined body with a bound interior seam finish. Mother-of-pearl closure at the buba.',
    fit:
      'Generous ceremonial cut. The agbada is intended to fall to mid-calf and drape wide at the shoulder. Take your usual size; for a fuller sweep, size up. Model is 187cm and wears M.',
    care:
      'Dry clean only, by a specialist familiar with metallic embroidery. Press on the reverse under a cloth. Store folded with acid-free tissue between the embroidered panels, never on a hanger.'
  },

  {
    id: 'ojiji-satin-kaftan',
    name: 'Òjìjì Satin Kaftan',
    category: 'Kaftan',
    price: 425000,
    colour: 'Obsidian',
    badge: null,
    featured: true,
    newArrival: true,
    sizes: GARMENT_SIZES,
    images: [
      'assets/img/products/ojiji-satin-senator.webp',
      'assets/img/editorial/craft-detail.webp'
    ],
    gallery: [
      { src: 'assets/img/products/ojiji-satin-senator.webp', alt: 'Òjìjì satin kaftan in obsidian black with a woven placket and gold hardware tab.' },
      { src: 'assets/img/editorial/craft-detail.webp', alt: 'Atelier detail: chalk pattern lines marked across dark cloth before cutting.' },
      { src: 'assets/img/journal/atelier-craft.webp', alt: 'Hands guiding black cloth beneath the needle in the Dprince Couture atelier.' }
    ],
    alt: 'Òjìjì satin kaftan in obsidian black with textured woven placket and gold tab.',
    summary: 'Liquid satin against a hand-woven placket — restraint with one deliberate interruption.',
    description:
      'Òjìjì means shadow, and the piece is built around the way light refuses to settle on it. The body is a heavy satin-faced twill that falls without cling; running the length of the front is a placket hand-woven in matching thread, its texture the only thing that catches the eye. A single brushed-gold tab marks the welt pocket. Everything else is left alone.',
    fabric:
      'Satin-faced cotton twill, 180gsm. Hand-woven textured placket in matched thread. Brushed brass hardware. Half-lined through the shoulder.',
    fit:
      'Relaxed straight cut through the body with a set three-quarter sleeve. Falls to mid-thigh. Take your usual size. Model is 187cm and wears M.',
    care:
      'Dry clean only. Do not tumble dry. Cool iron on the reverse; avoid direct heat on the woven placket. Hang on a broad wooden hanger.'
  },

  {
    id: 'opa-carved-staff',
    name: 'Ọ̀pá Carved Staff',
    category: 'Accessories',
    price: 340000,
    colour: 'Ebonised iroko',
    badge: 'By commission',
    featured: false,
    newArrival: false,
    sizes: ['One size'],
    images: [
      'assets/img/products/opa-detail.webp',
      'assets/img/editorial/campaign-agbada-01.webp'
    ],
    gallery: [
      { src: 'assets/img/products/opa-detail.webp', alt: 'Carved finial of the Ọ̀pá ceremonial staff in ebonised iroko.' },
      { src: 'assets/img/editorial/campaign-agbada-01.webp', alt: 'The Ọ̀pá staff held alongside the Ààrẹ ceremonial agbada.' }
    ],
    alt: 'Ọ̀pá ceremonial staff in ebonised iroko with a carved openwork finial.',
    summary: 'Turned and carved by a single hand in Òyó, finished in ebonised iroko.',
    description:
      'A ceremonial staff turned from a single length of iroko and carved with an openwork finial, then ebonised to a deep matte black. Each is made by one carver in Òyó and no two finials are alike — the openwork is cut freehand. Supplied with a cotton sleeve. Height 118cm.',
    fabric:
      'Iroko hardwood, ebonised and hand-waxed. Height 118cm, finial width 14cm. Weight approximately 1.4kg.',
    fit:
      'One size. Commissioned pieces may be cut to a specified height between 100cm and 130cm — request this at booking.',
    care:
      'Wipe with a dry cloth. Re-wax annually with a clear furniture wax. Keep out of direct sunlight and away from radiators; iroko will check if it dries too fast.'
  },

  {
    id: 'eko-noir-senator',
    name: 'Èkó Noir Senator',
    category: 'Senator',
    price: 310000,
    colour: 'Obsidian',
    badge: null,
    featured: true,
    newArrival: true,
    sizes: GARMENT_SIZES,
    images: [
      'assets/img/products/eko-noir-senator.webp',
      'assets/img/products/aaye-charcoal-twopiece.webp'
    ],
    gallery: [
      { src: 'assets/img/products/eko-noir-senator.webp', alt: 'Èkó Noir senator shirt in black wool crepe with angled dart seams and stud closures.' },
      { src: 'assets/img/products/aaye-charcoal-twopiece.webp', alt: 'The senator silhouette shown with matching tailored trousers.' },
      { src: 'assets/img/editorial/craft-detail.webp', alt: 'Atelier detail: pattern template laid across marked cloth.' }
    ],
    alt: 'Èkó Noir senator shirt in black wool crepe with angled dart seams and two stud closures.',
    summary: 'Angled darts drawn as architecture, closed with two blackened studs.',
    description:
      'The Èkó takes the senator shirt and treats its seams as drawing rather than construction. Two angled darts run from the underarm to a point at the waist, each terminating in a blackened metal stud that does the work of a button without announcing itself. A yoke seam crosses the chest at the shoulder blade line. In wool crepe the whole thing reads as one continuous plane.',
    fabric:
      'Wool crepe, 240gsm, with a dry hand and a matte finish. Blackened brass studs. Bound interior seams. Unlined.',
    fit:
      'Straight cut with a slight suppression at the waist created by the darts. Three-quarter sleeve. Falls to upper thigh. Take your usual size. Model is 187cm and wears M.',
    care:
      'Dry clean only. Press with steam on the reverse. Do not press directly over the studs. Hang on a broad hanger to keep the shoulder line.'
  },

  {
    id: 'osan-sun-senator',
    name: 'Ọ̀sán Sun Senator',
    category: 'Senator',
    price: 295000,
    colour: 'Marigold',
    badge: 'New season',
    featured: false,
    newArrival: true,
    sizes: GARMENT_SIZES,
    images: [
      'assets/img/products/osan-yellow-senator.webp',
      'assets/img/products/ile-ivory-pinstripe.webp'
    ],
    gallery: [
      { src: 'assets/img/products/osan-yellow-senator.webp', alt: 'Ọ̀sán Sun senator in marigold with contrast braid at the collar and shoulder seam.' },
      { src: 'assets/img/products/ile-ivory-pinstripe.webp', alt: 'The same senator cut shown in ivory pinstripe.' }
    ],
    alt: 'Ọ̀sán Sun senator shirt in marigold cotton with dark contrast braid at the collar and shoulder.',
    summary: 'Marigold, edged in a dark braid that stops it short of festive.',
    description:
      'Ọ̀sán is the hour the light turns — early afternoon, when the colour of everything intensifies before it softens. The piece is a clean senator cut in a saturated marigold cotton, held in check by a narrow dark braid worked into the collar and the shoulder seam. Three engraved studs close the front. A matching pouch is included.',
    fabric:
      'Mercerised cotton suiting, 200gsm. Hand-applied contrast braid in charcoal. Engraved brass studs. Matching cotton pouch supplied.',
    fit:
      'Straight cut, three-quarter sleeve, falls to upper thigh. Take your usual size. Model is 187cm and wears M.',
    care:
      'Dry clean recommended. If washing, cold hand wash separately — the marigold will bleed on first wash. Cool iron on the reverse. Do not bleach.'
  },

  {
    id: 'aaye-charcoal-twopiece',
    name: 'Ààyè Charcoal Two-Piece',
    category: 'Senator',
    price: 285000,
    colour: 'Charcoal',
    badge: null,
    featured: false,
    newArrival: true,
    sizes: GARMENT_SIZES,
    images: [
      'assets/img/products/aaye-charcoal-twopiece.webp',
      'assets/img/products/eko-noir-senator.webp'
    ],
    gallery: [
      { src: 'assets/img/products/aaye-charcoal-twopiece.webp', alt: 'Ààyè charcoal two-piece: senator shirt with welt pocket and matching drawstring trousers.' },
      { src: 'assets/img/products/eko-noir-senator.webp', alt: 'Detail of the seam construction across the chest yoke.' }
    ],
    alt: 'Ààyè charcoal two-piece senator with welt pocket and matching tailored drawstring trousers.',
    summary: 'The everyday two-piece — shirt and trouser, cut to be worn hard.',
    description:
      'Ààyè means room, space to move, and this is the piece in the collection designed to be worn most often. A softly tailored senator shirt with a welt chest pocket and a slim brushed tab, paired with matching trousers cut straight with a drawstring waist. The cloth is a hard-wearing twill that presses flat and stays that way through a long day.',
    fabric:
      'Cotton-rich twill, 210gsm, with a small proportion of elastane for recovery. Horn-effect buttons. Drawstring waist in matching cord.',
    fit:
      'Shirt: straight, three-quarter sleeve, upper-thigh length. Trouser: straight leg, mid-rise, drawstring waist. Sold as a set. Take your usual size. Model is 187cm and wears M.',
    care:
      'Machine wash cold on a gentle cycle, inside out. Line dry in shade. Warm iron. Do not tumble dry.'
  },

  {
    id: 'adire-slate-kaftan',
    name: 'Àdìrẹ Slate Kaftan',
    category: 'Kaftan',
    price: 265000,
    colour: 'Slate',
    badge: null,
    featured: true,
    newArrival: false,
    sizes: GARMENT_SIZES,
    images: [
      'assets/img/products/adire-slate-kaftan.webp',
      'assets/img/products/ara-taupe-vneck.webp'
    ],
    gallery: [
      { src: 'assets/img/products/adire-slate-kaftan.webp', alt: 'Àdìrẹ slate kaftan in mid-grey with a concealed placket and single button at the throat.' },
      { src: 'assets/img/products/ara-taupe-vneck.webp', alt: 'The same relaxed kaftan cut shown in taupe.' }
    ],
    alt: 'Àdìrẹ slate kaftan in mid-grey cotton with a concealed placket and single throat button.',
    summary: 'One button at the throat. Nothing else asks for attention.',
    description:
      'The plainest thing in the collection and the hardest to get right. A single button at the throat, a concealed placket, a dropped shoulder that reads as ease rather than slouch. In a slate grey cotton with a faint vertical slub, so the surface has movement without pattern. This is the piece clients buy second, once they trust the house.',
    fabric:
      'Slub-textured cotton, 190gsm, garment-washed for softness. Corozo button. Bound neckline. Unlined.',
    fit:
      'Relaxed with a dropped shoulder and a wide three-quarter sleeve. Falls to mid-thigh. Sized generously — if you prefer a closer line, size down. Model is 187cm and wears M.',
    care:
      'Machine wash cold on a gentle cycle. Line dry in shade. Warm iron while slightly damp. The slub will soften with each wash.'
  },

  {
    id: 'ara-taupe-vneck',
    name: 'Àrà Taupe V-Neck',
    category: 'Kaftan',
    price: 255000,
    colour: 'Taupe',
    badge: null,
    featured: false,
    newArrival: false,
    sizes: GARMENT_SIZES,
    images: [
      'assets/img/products/ara-taupe-vneck.webp',
      'assets/img/products/adire-slate-kaftan.webp'
    ],
    gallery: [
      { src: 'assets/img/products/ara-taupe-vneck.webp', alt: 'Àrà taupe kaftan with a deep overlapping V-neck and split cuff detail.' },
      { src: 'assets/img/products/adire-slate-kaftan.webp', alt: 'The relaxed kaftan silhouette shown in slate.' }
    ],
    alt: 'Àrà taupe kaftan with a deep overlapping V-neck, metal bar trim and split cuffs.',
    summary: 'A crossed V-neck held by a single metal bar, with cuffs cut open.',
    description:
      'Àrà means wonder, or a thing made with unusual care. The neckline crosses like a wrapped robe and is caught at the point by one polished metal bar — no buttons, no ties. Each cuff is split and left unjoined so the sleeve falls in two planes. In a warm taupe crepe that holds the shape of the fold.',
    fabric:
      'Polyester-viscose crepe, 195gsm, with a matte dry finish and good drape recovery. Polished nickel bar trim.',
    fit:
      'Relaxed through the body with a wide sleeve and split cuff. Falls to mid-thigh. Take your usual size. Model is 187cm and wears M.',
    care:
      'Dry clean recommended. If washing, cold gentle cycle in a mesh bag. Cool iron on the reverse. Do not press the metal bar.'
  },

  {
    id: 'ile-ivory-pinstripe',
    name: 'Ilé Ivory Pinstripe',
    category: 'Kaftan',
    price: 240000,
    colour: 'Ivory',
    badge: null,
    featured: false,
    newArrival: false,
    sizes: GARMENT_SIZES,
    images: [
      'assets/img/products/ile-ivory-pinstripe.webp',
      'assets/img/products/osan-yellow-senator.webp'
    ],
    gallery: [
      { src: 'assets/img/products/ile-ivory-pinstripe.webp', alt: 'Ilé ivory kaftan in fine self-coloured pinstripe with a long sleeve and welt pocket.' },
      { src: 'assets/img/products/osan-yellow-senator.webp', alt: 'The same house cut shown in marigold.' }
    ],
    alt: 'Ilé ivory kaftan in fine tonal pinstripe with long cuffed sleeves and a welt chest pocket.',
    summary: 'A tonal pinstripe you only find at arm’s length.',
    description:
      'Ilé is home — the piece you own longest. Woven in an ivory cotton with a self-coloured pinstripe that only reveals itself close up, cut with a full-length cuffed sleeve and a single welt pocket set high on the chest. A concealed placket keeps the front unbroken. The most quietly formal thing the house makes.',
    fabric:
      'Yarn-dyed cotton with tonal pinstripe, 185gsm. Concealed placket. Single-button mitred cuff. Bound interior seams.',
    fit:
      'Straight cut with a full-length sleeve and mitred cuff. Falls to upper thigh. Take your usual size. Model is 187cm and wears M.',
    care:
      'Machine wash cold, inside out. Line dry in shade. Warm iron while damp for a crisp finish. Do not bleach — the ivory will yellow.'
  },

  {
    id: 'ileke-coral-set',
    name: 'Ìlẹ̀kẹ̀ Coral Bead Set',
    category: 'Accessories',
    price: 180000,
    colour: 'Coral / onyx',
    badge: null,
    featured: false,
    newArrival: false,
    sizes: ['One size'],
    images: [
      'assets/img/products/ileke-detail.webp',
      'assets/img/editorial/campaign-agbada-02.webp'
    ],
    gallery: [
      { src: 'assets/img/products/ileke-detail.webp', alt: 'Layered coral and onyx bead strands resting against embroidered white cloth.' },
      { src: 'assets/img/editorial/campaign-agbada-02.webp', alt: 'The bead set worn with the Ààrẹ ceremonial agbada.' }
    ],
    alt: 'Ìlẹ̀kẹ̀ bead set: three graduated strands of coral and polished onyx.',
    summary: 'Three graduated strands, coral and onyx, strung on waxed silk.',
    description:
      'Three strands of graduated bead, alternating coral with polished onyx, strung by hand on waxed silk cord and finished with a brass barrel clasp. Coral has been worn as a mark of standing across Yoruba ceremonial dress for centuries; these are cut and polished in Benin City. Lengths 46cm, 52cm and 58cm, worn together or singly.',
    fabric:
      'Natural coral, polished onyx, waxed silk cord, brass barrel clasp. Three strands: 46cm, 52cm, 58cm. Supplied in a lined box.',
    fit:
      'One size, worn layered or as single strands. Longer lengths can be strung to order — request this at booking.',
    care:
      'Wipe with a soft dry cloth after wearing. Keep away from perfume, oil and water; coral is porous and will dull. Store flat in the box supplied, never hung.'
  },

  {
    id: 'fila-asooke-cap',
    name: 'Fìlà Aso-Oke Cap',
    category: 'Accessories',
    price: 65000,
    colour: 'Chalk white / silver',
    badge: null,
    featured: false,
    newArrival: false,
    sizes: ['One size'],
    images: [
      'assets/img/products/fila-detail.webp',
      'assets/img/editorial/campaign-agbada-01.webp'
    ],
    gallery: [
      { src: 'assets/img/products/fila-detail.webp', alt: 'Fìlà cap in chalk aso-oke with circular silver embroidered medallions.' },
      { src: 'assets/img/editorial/campaign-agbada-01.webp', alt: 'The fìlà worn with the Ààrẹ ceremonial agbada.' }
    ],
    alt: 'Fìlà cap in chalk white aso-oke with circular silver embroidered medallions.',
    summary: 'Hand-woven aso-oke, embroidered in silver, shaped by wearing.',
    description:
      'The abetí ajá form — soft-sided, meant to be folded to the wearer’s own angle. Woven in chalk aso-oke on a narrow loom and embroidered with circular silver medallions at the crown and band. It arrives unshaped; it takes its final form from being worn, which is the point.',
    fabric:
      'Hand-loomed aso-oke, cotton with silver-effect viscose. Cotton lining. Unstructured crown. Circumference adjusts 56–60cm.',
    fit:
      'One size, 56–60cm. Fold to the left or right as preferred; the cap will hold the shape after a few wearings.',
    care:
      'Spot clean only. Do not machine wash — the aso-oke weave will pull. Store flat, not crushed. Steam lightly to refresh the crown.'
  }
];

/** Look up a single product by id. Returns undefined when not found. */
export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

/** Products in a category. 'All' returns everything, in catalogue order. */
export function byCategory(category) {
  if (!category || category === 'All') return [...PRODUCTS];
  return PRODUCTS.filter((p) => p.category === category);
}
