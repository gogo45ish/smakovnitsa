// GSAP + Lenis smooth scroll setup, reduced-motion gating — design.md §8
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);
// Same curves as the CSS tokens (--ease-out / --ease-in-out / --ease-drawer)
export const EASE = {
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
};
CustomEase.create('out', 'M0,0 C0.23,1 0.32,1 1,1');
CustomEase.create('inOut', 'M0,0 C0.77,0 0.175,1 1,1');
CustomEase.create('drawer', 'M0,0 C0.32,0.72 0,1 1,1');
gsap.defaults({ ease: 'out', duration: 0.6 });

// Motion override for demos: ?motion=on forces full animation even when the OS asks
// for reduced motion; ?motion=off forces the reduced path; ?motion=auto clears it.
// index.html runs the same logic inline so html[data-motion] is right before the first paint.
const param = new URLSearchParams(location.search).get('motion');
let forced = null;
try {
  if (param === 'auto') localStorage.removeItem('smak-motion');
  else if (param === 'on' || param === 'off') localStorage.setItem('smak-motion', param);
  forced = localStorage.getItem('smak-motion');
} catch { forced = param; }

export const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const isReduced = () => (forced === 'on' ? false : forced === 'off' ? true : reducedQuery.matches);

// CSS reads html[data-motion] so the override reaches transitions too
const syncMotionAttr = () => { document.documentElement.dataset.motion = isReduced() ? 'reduce' : 'full'; };
syncMotionAttr();
reducedQuery.addEventListener?.('change', syncMotionAttr);

// Media queries for gsap.matchMedia() that respect the override
const ALWAYS = '(min-width: 0px)';
const NEVER = '(max-width: 0px)';
const MOTION = forced === 'on' ? ALWAYS : forced === 'off' ? NEVER : '(prefers-reduced-motion: no-preference)';
const REDUCED = forced === 'on' ? NEVER : forced === 'off' ? ALWAYS : '(prefers-reduced-motion: reduce)';
export const MQ = {
  desktop: `(min-width: 1024px) and ${MOTION}`,
  tablet: `(min-width: 768px) and ${MOTION}`,
  mobile: `(max-width: 767px) and ${MOTION}`,
  belowDesktop: `(max-width: 1023px) and ${MOTION}`,
  motion: MOTION,
  reduced: REDUCED,
};

export let lenis = null;

export function initScroll() {
  // The router restores scroll positions itself (RouteEffects)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!isReduced()) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Recalculate once fonts and images settle
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/**
 * Smooth (or immediate) scroll to an element. The sticky-header offset comes from
 * html { scroll-padding-top } — Lenis, scrollIntoView and keyboard focus all respect it.
 */
export function scrollToEl(el, immediate = false) {
  // Lenis caches the page height; after a route swap it is stale until its observer fires
  if (lenis) { lenis.resize(); lenis.scrollTo(el, { immediate, force: true, duration: 1.4 }); }
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' });
}

/** Jump to a y position with no animation (route changes, back/forward restore). */
export function scrollToY(y) {
  if (lenis) { lenis.resize(); lenis.scrollTo(y, { immediate: true, force: true }); }
  else window.scrollTo(0, y);
}

export function lockScroll(lock) {
  document.body.classList.toggle('is-locked', lock);
  if (lenis) (lock ? lenis.stop() : lenis.start());
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
