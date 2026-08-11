/* ==========================================================================
   JOURNAL DATA — Dprince Couture
   `body` is an array of blocks so article.html can render without parsing
   HTML strings. Block types: 'p', 'h2', 'quote', 'image'.
   ========================================================================== */

export const ARTICLES = [
  {
    id: 'eleven-days-of-thread',
    title: 'Eleven Days of Thread',
    category: 'Craft',
    date: '2026-07-18',
    dateLabel: '18 July 2026',
    readTime: '6 min',
    featured: true,
    image: 'assets/img/journal/atelier-craft.webp',
    alt: 'Hands guiding dark cloth beneath a needle in the Dprince Couture atelier.',
    excerpt:
      'The embroidery panel on a ceremonial agbada takes eleven working days. We spent one of them at the bench, watching a motif arrive one stitch at a time.',
    body: [
      { type: 'p', text: 'There is a moment, roughly four days into the embroidery of a ceremonial agbada, when the motif stops being a set of chalk marks and starts being an object. Before that point it is instruction. After it, it is a thing with weight, and the person working on it changes how they hold the cloth.' },
      { type: 'p', text: 'Ṣègun has embroidered for the house for nine years. He works seated, the cloth drawn across his knee rather than held in a frame, which is not how the technique is taught and is entirely how he does it. The panel in front of him is the chest of an Ààrẹ — 340 millimetres by 210, silver viscose on chalk damask, a motif adapted from an aso-oke weaving pattern that predates every person in the room.' },
      { type: 'h2', text: 'The economics of slowness' },
      { type: 'p', text: 'Eleven days is not a marketing number. It is what the panel takes when it is worked by one pair of hands without shortcuts, and the reason it is one pair of hands is consistency of tension. Two embroiderers produce two tensions, and on a flat silver thread against a woven ground the difference reads as a ripple across the finished panel. You would not be able to name what was wrong with it. You would simply find it cheap.' },
      { type: 'quote', text: 'You cannot hurry the middle of a motif. You can only hurry the beginning, and then you spend the end fixing it.', attribution: 'Ṣègun, embroidery, Lagos atelier' },
      { type: 'p', text: 'The house makes fourteen ceremonial agbada in a season. That ceiling is set by embroidery capacity and nothing else, and there has been more than one conversation about raising it. The conversations end the same way each time: the panel is the reason anyone commissions the garment, so the panel sets the pace.' },
      { type: 'image', src: 'assets/img/editorial/craft-detail.webp', alt: 'Chalk pattern lines marked across dark cloth on the cutting table.' },
      { type: 'h2', text: 'What survives the wearing' },
      { type: 'p', text: 'A ceremonial garment is worn perhaps a dozen times in its first decade and then, if it has been made properly, it is inherited. That changes the brief. Seams are bound rather than overlocked because a bound seam can be opened and let out by a tailor who has never seen the garment before. The embroidery is worked on the ground cloth rather than on an applied panel, because applied panels lift at the corners after twenty years.' },
      { type: 'p', text: 'None of this is visible in a photograph. It is the part of the work that only announces itself in 2046, to someone who never met the person who made it.' }
    ]
  },
  {
    id: 'the-shoulder-problem',
    title: 'The Shoulder Problem',
    category: 'Craft',
    date: '2026-06-30',
    dateLabel: '30 June 2026',
    readTime: '5 min',
    featured: false,
    image: 'assets/img/journal/campaign-agbada.webp',
    alt: 'Ceremonial agbada photographed in a stone colonnade, the shoulder falling in a wide arc.',
    excerpt:
      'An agbada lives or dies at the shoulder. Too soft and it collapses; too stiff and it wears the man. The fix is a sixty-year-old trick and a millimetre of ease.',
    body: [
      { type: 'p', text: 'Every problem in an agbada is a shoulder problem. The garment has no fastening to hold it, no waist to sit on, and roughly three metres of cloth hanging off a line about forty-five centimetres wide. Whatever that line does, the rest of the garment repeats, amplified, all the way to the hem.' },
      { type: 'h2', text: 'Two wrong answers' },
      { type: 'p', text: 'The first wrong answer is to stiffen it. Fuse the shoulder, add a canvas, and the fall becomes predictable — and the garment becomes furniture. It holds a perfect arc while the wearer moves independently inside it. You see this constantly in ceremonial dress made for photography rather than for wearing.' },
      { type: 'p', text: 'The second wrong answer is to do nothing, which produces a shoulder that collapses inward within an hour and reads, from ten metres, as a man wearing a bedsheet.' },
      { type: 'quote', text: 'The shoulder should forget the wearer is there, and the wearer should forget the shoulder is there. Both at once.', attribution: 'From the house cutting notes' },
      { type: 'h2', text: 'The millimetre' },
      { type: 'p', text: 'What the house does instead is old: a narrow strip of loosely woven linen, cut on the true bias, laid into the shoulder seam and eased in by about one and a half millimetres over the span. Eased, not stretched. The bias lets the strip give in one direction and hold in the other, so the seam resists collapse without resisting movement.' },
      { type: 'p', text: 'One and a half millimetres. On a garment costing what this one costs, the entire difference between grandeur and costume is a measurement most tailors would round away.' }
    ]
  },
  {
    id: 'colour-of-the-afternoon',
    title: 'The Colour of the Afternoon',
    category: 'Collection',
    date: '2026-06-11',
    dateLabel: '11 June 2026',
    readTime: '4 min',
    featured: false,
    image: 'assets/img/journal/look-01.webp',
    alt: 'Model in ceremonial dress photographed against a bare plaster wall in strong afternoon light.',
    excerpt:
      'Ọ̀sán is the hour before the light softens, when every colour is at its loudest. Getting a marigold to hold that without tipping into festive took four dye lots.',
    body: [
      { type: 'p', text: 'Yoruba divides the day finely, and Ọ̀sán is the stretch of early afternoon when the sun is past its height but the air has not yet begun to cool. It is the hour when colour is most saturated — the last moment before everything starts turning golden and forgiving.' },
      { type: 'h2', text: 'Four lots' },
      { type: 'p', text: 'The first dye lot came back the colour of a taxi. The second corrected so hard toward ochre that it read as mustard under interior light, which is where most of these garments are actually worn. The third was close and dulled by about eight per cent too much black in the base.' },
      { type: 'p', text: 'The fourth held. What makes it hold is not the yellow but the charcoal braid at the collar and shoulder seam — roughly four millimetres of dark edge that gives the eye somewhere to rest. Without it the marigold has no boundary and reads as celebration. With it, the same colour reads as intent.' },
      { type: 'quote', text: 'A strong colour needs an edge, or it becomes an occasion rather than a garment.', attribution: 'From the AW26 collection notes' },
      { type: 'p', text: 'This is the argument for restraint that is not actually about restraint. The braid is not there to tone the piece down. It is there so the colour can be as loud as it is without apologising for itself.' }
    ]
  },
  {
    id: 'what-bespoke-means-here',
    title: 'What Bespoke Means Here',
    category: 'The House',
    date: '2026-05-24',
    dateLabel: '24 May 2026',
    readTime: '7 min',
    featured: false,
    image: 'assets/img/journal/hero-campaign.webp',
    alt: 'Detail of a textured kaftan and coral bead strands photographed from behind.',
    excerpt:
      'The word has been worn thin by people who mean “we will pick a lining for you”. Here is the actual sequence, from first appointment to final fitting, and what each stage costs in time.',
    body: [
      { type: 'p', text: 'Bespoke has been diluted to the point where it can mean almost nothing — a choice of button, a name embroidered inside a collar. What follows is what the word covers at this house, stage by stage, so that anyone booking an appointment knows precisely what they are buying and how long it will take.' },
      { type: 'h2', text: 'First appointment — ninety minutes' },
      { type: 'p', text: 'Measurement, twenty-two points, taken twice. A conversation about the occasion, because a garment for a coronation and a garment for a wedding are different objects even when they look identical. Cloth is selected from what is in the house; if nothing is right, we will source, which adds three to five weeks.' },
      { type: 'h2', text: 'Pattern and first cut — three weeks' },
      { type: 'p', text: 'A paper pattern is drafted specifically. It is kept afterwards, filed under the client’s name, and every subsequent commission starts from it rather than from a block. This is the part that most distinguishes bespoke from made-to-measure, and it is the part clients never see.' },
      { type: 'h2', text: 'First fitting — the honest one' },
      { type: 'p', text: 'The garment is presented in a basted state, tacked together in contrast thread, deliberately unfinished. It will look wrong. It is meant to. This is the fitting where things get taken apart, and clients who have only bought ready-to-wear often find it alarming.' },
      { type: 'quote', text: 'If the first fitting looks finished, something has been decided without you.', attribution: 'Head of atelier, Lagos' },
      { type: 'h2', text: 'Second fitting and finish — four to six weeks' },
      { type: 'p', text: 'Adjustments are made, the garment is taken apart and rebuilt, embroidery is worked if the commission includes it. Total elapsed time from first appointment to collection is ten to fourteen weeks for a ceremonial piece, six to eight for a kaftan or senator. We do not compress this for a fee, because the compression would come out of the fittings, which is the part you are actually paying for.' }
    ]
  },
  {
    id: 'iseyin-narrow-loom',
    title: 'Ìsẹ̀yìn and the Narrow Loom',
    category: 'Craft',
    date: '2026-05-02',
    dateLabel: '2 May 2026',
    readTime: '6 min',
    featured: false,
    image: 'assets/img/journal/look-03.webp',
    alt: 'Ceremonial garment photographed in low light, the weave texture catching a raking highlight.',
    excerpt:
      'Aso-oke is woven in strips a hand’s width across, then joined. That constraint is four centuries old and it still decides how the house designs a panel.',
    body: [
      { type: 'p', text: 'Aso-oke comes off a narrow horizontal loom in strips roughly ten to fifteen centimetres wide. To make a cloth wide enough for a garment, those strips are cut and joined edge to edge. Every piece of true aso-oke therefore has seams running through it at regular intervals, and those seams are not a defect — they are the evidence of the method.' },
      { type: 'h2', text: 'Designing to the strip' },
      { type: 'p', text: 'The consequence for anyone designing with the cloth is that motif placement is not free. A pattern has to either sit within a strip width or be deliberately composed to cross the joins in a way that resolves. Ignore this and the joins cut through the design at intervals that look like error.' },
      { type: 'p', text: 'The house works to the strip. The circular medallions on the fìlà are sized to sit inside a single strip width with a margin either side. It is a constraint imported from a loom none of our own machines resemble, and honouring it is the difference between using aso-oke and quoting it.' },
      { type: 'quote', text: 'The loom is the oldest member of the design team, and it does not take notes.', attribution: 'From the house cutting notes' },
      { type: 'image', src: 'assets/img/products/fila-detail.webp', alt: 'Silver embroidered medallions sized to sit within a single aso-oke strip width.' },
      { type: 'p', text: 'Ìsẹ̀yìn, in Ọ̀yọ́ State, remains the centre of this weaving. The house buys from four weaving families there, and the arrangement is deliberately slow — orders are placed a season ahead, at a price set by the weavers.' }
    ]
  },
  {
    id: 'against-the-photograph',
    title: 'Against the Photograph',
    category: 'The House',
    date: '2026-04-15',
    dateLabel: '15 April 2026',
    readTime: '4 min',
    featured: false,
    image: 'assets/img/journal/look-05.webp',
    alt: 'Model photographed mid-movement, ceremonial cloth blurred by motion.',
    excerpt:
      'Garments increasingly get designed for the camera rather than the room. It is a quiet catastrophe for tailoring, and it shows up first at the hem.',
    body: [
      { type: 'p', text: 'A camera flattens. It removes weight, it removes the sound cloth makes, and it removes the way a garment behaves in the four seconds after someone turns around. Design for the camera long enough and you begin optimising for a still frame — which means optimising for stiffness, high contrast, and a silhouette that reads instantly.' },
      { type: 'h2', text: 'Where it shows' },
      { type: 'p', text: 'It shows first at the hem. A hem weighted for photography hangs dead straight and does nothing when the wearer moves. A hem weighted for wearing has a small amount of swing designed into it, which photographs as slight untidiness and reads, in a room, as life.' },
      { type: 'p', text: 'The house has lost campaign images to this. A garment that moves correctly frequently photographs worse than one that does not, and there is a real temptation to fix the garment rather than accept the photograph.' },
      { type: 'quote', text: 'The client is not standing still in a studio. He is walking into a room where everyone already knows what he paid.', attribution: 'Founder’s note, house archive' },
      { type: 'p', text: 'So the standard is the room. If a piece has to be slightly harder to photograph in order to behave properly when it is worn, that is a trade the house makes without much discussion — and it is why the campaign imagery leans on motion rather than the perfectly held pose.' }
    ]
  }
];

/** Look up one article by id. */
export function getArticle(id) {
  return ARTICLES.find((a) => a.id === id);
}
