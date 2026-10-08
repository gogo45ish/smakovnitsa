// What happens on every navigation: close overlays, restore or reset scroll, jump to #hash,
// and move focus to the new page for keyboard and screen-reader users.
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { ScrollTrigger, scrollToEl, scrollToY } from '../../lib/scroll.js';
import { closeLayer, setMenu } from '../../store/ui.js';

const target = (hash) => hash && document.getElementById(decodeURIComponent(hash.slice(1)));

export function RouteEffects() {
  const location = useLocation();
  const navType = useNavigationType();
  const prevPath = useRef(null);
  const positions = useRef(new Map()); // location.key → scrollY, for back/forward
  const keyRef = useRef(location.key);

  // Remember where the reader is on the current entry
  useEffect(() => {
    const onScroll = () => positions.current.set(keyRef.current, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Must render after <Outlet/>: this layout effect then runs once the new page has mounted
  // its ScrollTriggers (pins add height), and inside the view transition's update.
  useLayoutEffect(() => {
    keyRef.current = location.key;
    const firstLoad = prevPath.current === null;
    const samePage = prevPath.current === location.pathname;
    prevPath.current = location.pathname;

    if (!samePage) {
      closeLayer();
      setMenu(false);
      ScrollTrigger.refresh();
    }

    if (!firstLoad && !samePage) document.getElementById('main')?.focus({ preventScroll: true });

    const el = target(location.hash);
    if (el) scrollToEl(el, !samePage);
    else if (!samePage) {
      const y = navType === 'POP' ? positions.current.get(location.key) ?? 0 : 0;
      scrollToY(y);
      // Pins can be rebuilt right after mount (StrictMode in dev, late font metrics) — re-assert once
      const raf = requestAnimationFrame(() => { if (Math.abs(window.scrollY - y) > 2) scrollToY(y); });
      return () => cancelAnimationFrame(raf);
    }
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // A deep link with a #hash lands again once images and fonts have settled the layout
  useEffect(() => {
    const onLoad = () => {
      ScrollTrigger.refresh();
      const el = target(window.location.hash);
      if (el) scrollToEl(el, true);
    };
    if (document.readyState === 'complete') return;
    window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
