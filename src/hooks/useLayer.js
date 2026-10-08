import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function trapFocus(e, el) {
  const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/**
 * Dialog behaviour for an always-mounted overlay (drawer, modal, burger menu):
 * focus moves in on open, Esc closes, Tab is trapped, and focus returns to the trigger on close.
 */
export function useLayer(ref, open, onClose, { initialFocus = FOCUSABLE } = {}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    const returnTo = document.activeElement;
    const raf = requestAnimationFrame(() => el.querySelector(initialFocus)?.focus({ preventScroll: true }));
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
      else if (e.key === 'Tab') trapFocus(e, el);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      // Only hand focus back if it is still inside the closing layer (not after a route change)
      if (el.contains(document.activeElement) && returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [open, ref, initialFocus]);
}
