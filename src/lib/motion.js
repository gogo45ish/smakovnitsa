// Small interaction primitives shared by the components.
import { gsap, EASE, isReduced } from './scroll.js';

/** A click that came from Enter/Space has detail 0 — keyboard actions don't animate. */
export const fromKeyboard = (e) => e?.detail === 0;

const digits = (s) => +String(s).replace(/[^\d]/g, '') || 0;

/**
 * A number that just changed in place rolls in from its direction: up when it grew, down when
 * it shrank. The element must be inline-block. Reduced motion: opacity only.
 */
export function tickAnim(el, prev, next) {
  if (!el?.isConnected || prev === '' || prev == null) return;
  const dir = digits(next) >= digits(prev) ? 1 : -1;
  const frames = isReduced()
    ? [{ opacity: 0.4 }, { opacity: 1 }]
    : [
        { transform: `translateY(${dir * 6}px)`, opacity: 0.2, filter: 'blur(2px)' },
        { transform: 'none', opacity: 1, filter: 'blur(0)' },
      ];
  el.animate(frames, { duration: 180, easing: EASE.out });
}

/**
 * Drag a drawer/sheet toward its closed side to dismiss it. Returns a disposer.
 * - claims the gesture only along `axis`, toward dismissal, and when `scroller` is at its top
 * - a quick flick (velocity > 0.11 px/ms) dismisses regardless of distance
 * - dragging the other way is damped instead of hitting a wall
 * - extra fingers after the first are ignored
 */
export function swipeToDismiss(el, { axis = 'y', scroller = null, ignore = null, enabled = () => true, onDismiss }) {
  let start = null;
  let locked = false;
  let dist = 0;
  let t0 = 0;
  const scrim = () => document.querySelector('[data-scrim]');
  const getScroller = () => (typeof scroller === 'function' ? scroller() : scroller);

  const size = () => (axis === 'y' ? el.offsetHeight : el.offsetWidth);
  const apply = (d) => {
    el.style.transform = axis === 'y' ? `translate3d(0, ${d}px, 0)` : `translate3d(${d}px, 0, 0)`;
    const s = scrim();
    if (s) s.style.opacity = String(Math.max(0, 1 - Math.max(0, d) / size()));
  };
  const release = () => {
    const s = scrim();
    el.classList.remove('is-dragging');
    s?.classList.remove('is-dragging');
    el.style.transform = '';
    if (s) s.style.opacity = '';
  };

  const onStart = (e) => {
    if (start || e.touches.length > 1 || !enabled()) return;
    if (ignore && e.target.closest(ignore)) return;
    const t = e.touches[0];
    start = { x: t.clientX, y: t.clientY };
    locked = false;
    dist = 0;
    t0 = performance.now();
  };

  const onMove = (e) => {
    if (!start || e.touches.length > 1) return;
    const t = e.touches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const main = axis === 'y' ? dy : dx;
    const cross = axis === 'y' ? dx : dy;

    if (!locked) {
      if (Math.abs(main) < 8 && Math.abs(cross) < 8) return;
      const sc = getScroller();
      const atTop = !sc || sc.scrollTop <= 0;
      if (Math.abs(main) <= Math.abs(cross) || main < 0 || !atTop) { start = null; return; }
      locked = true;
      el.classList.add('is-dragging');
      scrim()?.classList.add('is-dragging');
    }
    e.preventDefault();
    dist = main >= 0 ? main : -Math.pow(-main, 0.6); // friction past the open position
    apply(dist);
  };

  const onEnd = () => {
    if (!start) return;
    start = null;
    if (!locked) return;
    locked = false;
    const velocity = Math.abs(dist) / (performance.now() - t0);
    const dismiss = dist > size() * 0.3 || (dist > 12 && velocity > 0.11);
    // Clearing the inline transform in the same frame lets the CSS transition carry on
    // from the finger's position — to closed, or back to open.
    release();
    if (dismiss) onDismiss();
  };

  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchmove', onMove, { passive: false });
  el.addEventListener('touchend', onEnd);
  el.addEventListener('touchcancel', onEnd);
  return () => {
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchmove', onMove);
    el.removeEventListener('touchend', onEnd);
    el.removeEventListener('touchcancel', onEnd);
  };
}

let flights = 0;
/** True while a thumbnail is in the air — the header waits for it before bumping the badge. */
export const isFlying = () => flights > 0;

/** Desktop only: a thumbnail of the dish lobs into the header cart, then fires `cart:landed`. */
export function flyToCart(fromEl) {
  if (!fromEl || isReduced() || window.innerWidth < 1200) return;
  const target = document.querySelector('.header [data-cart-open]');
  if (!target) return;
  flights++;
  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const clone = document.createElement('img');
  clone.src = fromEl.currentSrc || fromEl.src;
  clone.alt = '';
  clone.className = 'fly-thumb';
  document.body.appendChild(clone);
  const size = 64;
  gsap.set(clone, { left: a.left + a.width / 2 - size / 2, top: a.top + a.height / 2 - size / 2 });
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  // A lob: rise fast (ease-out on y) while travelling across (ease-in-out on x) traces an arc.
  // Scale shrinks with the travel; opacity only goes in the last stretch so it never "pops".
  gsap.timeline({
    onComplete: () => {
      clone.remove();
      flights--;
      document.dispatchEvent(new CustomEvent('cart:landed'));
    },
  })
    .fromTo(clone, { scale: 0.9 }, { scale: 0.35, duration: 0.5, ease: 'inOut' }, 0)
    .to(clone, { x: dx, duration: 0.5, ease: 'inOut' }, 0)
    .to(clone, { y: dy, duration: 0.5, ease: 'out' }, 0)
    .to(clone, { autoAlpha: 0, duration: 0.12, ease: 'none' }, 0.38);
}
