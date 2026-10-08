// Category tabs with a sliding gold block — design.md §6.6
import { useLayoutEffect, useRef } from 'react';
import { fromKeyboard } from '../../lib/motion.js';

/**
 * A duplicate "active" row is layered on top and clipped to the selected tab; animating that
 * clip moves the gold block and the dark label together (no colour seams).
 * First paint and keyboard navigation are instant. Controlled: `value` + `onChange(id, { instant })`.
 */
export function Tabs({ items, value, onChange, label }) {
  const wrap = useRef(null);
  const inner = useRef(null);
  const clip = useRef(null);
  const instantNext = useRef(true);
  const current = useRef(value);
  current.current = value;

  const clipTo = (instant) => {
    const tab = inner.current?.querySelector(`[data-tab="${current.current}"]`);
    if (!tab) return;
    const right = inner.current.offsetWidth - (tab.offsetLeft + tab.offsetWidth);
    if (instant) wrap.current.setAttribute('data-instant', '');
    clip.current.style.clipPath = `inset(0 ${right}px 0 ${tab.offsetLeft}px)`;
    if (instant) {
      clip.current.getBoundingClientRect(); // commit without a transition
      requestAnimationFrame(() => wrap.current?.removeAttribute('data-instant'));
    }
    return tab;
  };

  useLayoutEffect(() => {
    const instant = instantNext.current;
    instantNext.current = false;
    const tab = clipTo(instant);
    // keep the active tab visible when the row scrolls horizontally on mobile
    if (tab) wrap.current.scrollTo({ left: tab.offsetLeft - wrap.current.clientWidth / 2 + tab.offsetWidth / 2, behavior: instant ? 'auto' : 'smooth' });
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Layout changes (resize, web font swap) re-measure without animating
  useLayoutEffect(() => {
    let alive = true;
    const resync = () => alive && clipTo(true);
    const ro = new ResizeObserver(resync);
    ro.observe(inner.current);
    document.fonts?.ready.then(resync);
    return () => { alive = false; ro.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (id, instant) => {
    if (id === value) return;
    instantNext.current = instant;
    onChange(id, { instant });
  };

  const onKeyDown = (e) => {
    const i = items.findIndex((t) => t.id === value);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const item = items[(next + items.length) % items.length];
    select(item.id, true);
    inner.current.querySelector(`[data-tab="${item.id}"]`)?.focus();
  };

  return (
    <div className="tabs" ref={wrap} data-tabs>
      <div className="tabs-inner" role="tablist" aria-label={label} ref={inner} onKeyDown={onKeyDown}>
        {items.map((c) => (
          <button
            key={c.id} className="tab" type="button" role="tab" id={`tab-${c.id}`} data-tab={c.id}
            aria-selected={c.id === value} tabIndex={c.id === value ? 0 : -1}
            onClick={(e) => select(c.id, fromKeyboard(e))}
          >{c.title}</button>
        ))}
        <div className="tabs-active" aria-hidden="true" ref={clip}>
          {items.map((c) => <span key={c.id}>{c.title}</span>)}
        </div>
      </div>
    </div>
  );
}
