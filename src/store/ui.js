// UI state shared across the tree: which overlay is open, the burger menu, toasts and
// screen-reader announcements. A tiny external store so any component (or a GSAP callback)
// can open the cart or fire a toast without prop drilling.
import { useSyncExternalStore } from 'react';

let state = {
  layer: null,        // 'cart' | 'product' | null — one overlay at a time
  productId: null,
  productKey: 0,      // bumps on every open so the modal content starts fresh
  menuOpen: false,
  toast: null,        // { id, msg }
  live: null,         // { id, msg }
};
const listeners = new Set();
let seq = 0;

const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

/** useUI((s) => s.layer) — select a slice; return primitives or stable references. */
export const useUI = (selector) => useSyncExternalStore(subscribe, () => selector(state));

export const openCart = () => set({ layer: 'cart', menuOpen: false });
export const openProduct = (id) => set({ layer: 'product', productId: id, productKey: state.productKey + 1, menuOpen: false });
export const closeLayer = () => { if (state.layer) set({ layer: null }); };
export const setMenu = (open) => { if (state.menuOpen !== open) set({ menuOpen: open }); };
export const toast = (msg) => set({ toast: { id: ++seq, msg } });
export const announce = (msg) => set({ live: { id: ++seq, msg } });
