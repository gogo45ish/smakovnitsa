// Generic scroll reveals and split headings for a page — design.md §8
// Markup hooks: [data-reveal], [data-reveal-group] (children stagger together), [data-split].
import { useGSAP, gsap, SplitText, isReduced } from '../lib/scroll.js';

const ONCE = { start: 'top 80%', once: true };

function reveal(items, trigger, reduced) {
  if (!items.length) return;
  if (reduced) {
    gsap.from(items, { autoAlpha: 0, duration: 0.15, ease: 'none', scrollTrigger: { trigger, ...ONCE } });
    return;
  }
  gsap.from(items, { autoAlpha: 0, y: 16, duration: 0.7, ease: 'out', stagger: 0.06, scrollTrigger: { trigger, ...ONCE } });
}

/**
 * Runs in a layout effect, so the hidden "from" state is applied before the first paint —
 * content never flashes visible and then disappears. Everything is reverted on unmount.
 */
export function useReveals(scope) {
  useGSAP((_, contextSafe) => {
    const root = scope.current;
    const reduced = isReduced();

    const grouped = new Set();
    root.querySelectorAll('[data-reveal-group]').forEach((group) => {
      const items = [...group.querySelectorAll('[data-reveal]')];
      items.forEach((i) => grouped.add(i));
      reveal(items, group, reduced);
    });
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      if (!grouped.has(el)) reveal([el], el, reduced);
    });

    // Split headings: line-by-line masked rise once the display font is in (line breaks depend on it)
    const splits = root.querySelectorAll('[data-split]');
    if (reduced) { splits.forEach((el) => reveal([el], el, true)); return; }
    if (!splits.length) return;
    gsap.set(splits, { autoAlpha: 0 });
    let alive = true;
    document.fonts.ready.then(contextSafe(() => {
      if (!alive) return;
      splits.forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { autoAlpha: 1 });
            return gsap.from(self.lines, {
              yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.09,
              scrollTrigger: { trigger: el, ...ONCE },
            });
          },
        });
      });
    }));
    return () => { alive = false; };
  }, { scope });
}
