import { useLayoutEffect, useRef } from 'react';
import { useGSAP, gsap, ScrollTrigger, isReduced } from '../../lib/scroll.js';
import { num } from '../../lib/format.js';

const format = (v, decimals) =>
  decimals ? num(+v.toFixed(decimals)).replace(/^(\d+)$/, `$1,${'0'.repeat(decimals)}`) : num(Math.round(v));

/**
 * Stat number that counts up from 0 the first time it scrolls into view.
 * GSAP owns the text node (React renders none), so the two never fight over it.
 */
export function CountUp({ to, decimals = 0 }) {
  const ref = useRef(null);
  useLayoutEffect(() => { ref.current.textContent = format(to, decimals); }, [to, decimals]);
  useGSAP(() => {
    const el = ref.current;
    if (isReduced()) return;
    const obj = { v: 0 };
    el.textContent = format(0, decimals);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(obj, {
        v: to,
        duration: to > 1000 ? 2.2 : 1.6,
        ease: 'power2.out',
        onUpdate: () => (el.textContent = format(obj.v, decimals)),
      }),
    });
    return () => { el.textContent = format(to, decimals); };
  });
  return <span ref={ref} data-count-to={to} />;
}
