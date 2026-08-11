/* ==========================================================================
   SPLIT TEXT

   Splits a heading into lines for masked reveals, without a paid plugin.

   How the accessibility and layout requirements are met:
     • the original text is stored and restored verbatim on resize/teardown
     • the element carries aria-label with the original string, so assistive
       technology reads one continuous heading rather than fragments
     • splitting happens after fonts are ready, so line breaks are measured
       against the real typeface — no reflow surprise
     • measurement is done on the natural layout, so no layout shift occurs
     • under reduced motion nothing is split at all
   ========================================================================== */

import { prefersReducedMotion, debounce } from '../core/utils.js';

const instances = new Set();

/** Wrap each word in a span so line membership can be measured by offsetTop. */
function wrapWords(element) {
  const text = element.textContent.replace(/\s+/g, ' ').trim();
  const words = text.split(' ');
  element.innerHTML = words
    .map((word) => `<span class="split-word">${word}</span>`)
    .join(' ');
  return Array.from(element.querySelectorAll('.split-word'));
}

/** Group word spans into lines by their vertical offset. */
function groupIntoLines(words) {
  const lines = [];
  let currentTop = null;
  let current = null;

  words.forEach((word) => {
    const top = Math.round(word.offsetTop);
    if (currentTop === null || Math.abs(top - currentTop) > 2) {
      currentTop = top;
      current = [];
      lines.push(current);
    }
    current.push(word);
  });

  return lines;
}

/**
 * Split one element into masked lines.
 * @returns {{element: HTMLElement, lines: HTMLElement[], revert: Function}}
 */
export function splitLines(element) {
  const original = element.dataset.splitOriginal ?? element.innerHTML;
  element.dataset.splitOriginal = original;

  // Keep the accessible name intact regardless of how the DOM is chopped up
  if (!element.getAttribute('aria-label')) {
    element.setAttribute('aria-label', element.textContent.replace(/\s+/g, ' ').trim());
  }

  const words = wrapWords(element);
  const grouped = groupIntoLines(words);

  const html = grouped
    .map((line) => {
      const content = line.map((word) => word.textContent).join(' ');
      return `<span class="line"><span class="line__inner">${content}</span></span>`;
    })
    .join('');

  element.innerHTML = html;

  return {
    element,
    lines: Array.from(element.querySelectorAll('.line__inner')),
    revert() {
      element.innerHTML = element.dataset.splitOriginal;
      element.removeAttribute('aria-label');
      delete element.dataset.splitOriginal;
    }
  };
}

/** Split every word into its own span — used by the brand statement. */
export function splitWords(element) {
  const original = element.dataset.splitOriginal ?? element.innerHTML;
  element.dataset.splitOriginal = original;

  if (!element.getAttribute('aria-label')) {
    element.setAttribute('aria-label', element.textContent.replace(/\s+/g, ' ').trim());
  }

  const text = element.textContent.replace(/\s+/g, ' ').trim();
  element.innerHTML = text
    .split(' ')
    .map((word) => `<span class="word">${word}</span>`)
    .join(' ');

  return {
    element,
    words: Array.from(element.querySelectorAll('.word')),
    revert() {
      element.innerHTML = element.dataset.splitOriginal;
      element.removeAttribute('aria-label');
      delete element.dataset.splitOriginal;
    }
  };
}

/**
 * Register an element for line splitting with automatic re-split on resize.
 * `onSplit` receives the line elements each time, so callers can rebuild
 * their ScrollTrigger timelines against fresh nodes.
 */
export function registerSplit(element, onSplit) {
  if (prefersReducedMotion()) return null;

  let instance = splitLines(element);
  onSplit(instance.lines);

  const record = {
    element,
    resplit() {
      instance.revert();
      instance = splitLines(element);
      onSplit(instance.lines);
    },
    destroy() {
      instance.revert();
      instances.delete(record);
    }
  };

  instances.add(record);
  return record;
}

/* Re-split every registered heading once the viewport settles. Debounced,
   because measuring line boxes forces layout. */
const handleResize = debounce(() => {
  if (instances.size === 0) return;
  instances.forEach((record) => record.resplit());
  window.ScrollTrigger?.refresh();
}, 250);

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);
