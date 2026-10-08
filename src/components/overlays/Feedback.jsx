// Toast, screen-reader announcements, cookie card (§7.9) and sticky mobile cart bar (§7.4)
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useUI, openCart } from '../../store/ui.js';
import { useCart } from '../../hooks/useCart.js';
import { EASE, isReduced } from '../../lib/scroll.js';
import { rub } from '../../lib/format.js';
import { SUGGEST } from '../../lib/address.js';
import { Icon } from '../ui/Icon.jsx';
import { Num } from '../ui/Num.jsx';

const TOAST_MS = 2600;

/**
 * Sonner rules: the timer pauses while hovered or while the tab is hidden; a new message
 * arriving on a visible toast crossfades (blur bridges the swap) instead of re-entering.
 */
export function Toast() {
  const toast = useUI((s) => s.toast);
  const [visible, setVisible] = useState(false);
  const text = useRef(null);
  const timer = useRef({ id: null, remaining: 0, startedAt: 0 });
  const wasVisible = useRef(false);

  const hide = () => { timer.current = { id: null, remaining: 0, startedAt: 0 }; setVisible(false); };
  const run = (ms) => {
    clearTimeout(timer.current.id);
    timer.current = { id: setTimeout(hide, ms), remaining: ms, startedAt: performance.now() };
  };
  const pause = () => {
    const t = timer.current;
    if (!t.id) return;
    clearTimeout(t.id);
    timer.current = { id: null, remaining: t.remaining - (performance.now() - t.startedAt), startedAt: 0 };
  };
  const resume = () => { if (!timer.current.id && timer.current.remaining > 0) run(timer.current.remaining); };

  useLayoutEffect(() => {
    if (!toast) return;
    if (wasVisible.current && !isReduced()) {
      text.current.animate([{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 200, easing: EASE.out });
    }
    setVisible(true);
    run(TOAST_MS);
    if (document.hidden) pause();
  }, [toast]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { wasVisible.current = visible; }, [visible]);

  useEffect(() => {
    const onVis = () => (document.hidden ? pause() : resume());
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); clearTimeout(timer.current.id); };
  }, []);

  return (
    <div className={`toast${visible ? ' is-visible' : ''}`} data-toast role="status" onPointerEnter={pause} onPointerLeave={resume}>
      <span className="toast-text" ref={text} data-toast-text>{toast?.msg}</span>
    </div>
  );
}

/** Polite live region; clearing first makes a repeated message announce again */
export function LiveRegion() {
  const live = useUI((s) => s.live);
  const [text, setText] = useState('');
  useEffect(() => {
    if (!live) return;
    setText('');
    const id = setTimeout(() => setText(live.msg), 50);
    return () => clearTimeout(id);
  }, [live]);
  return <div className="sr-only" aria-live="polite" data-live>{text}</div>;
}

export function CookieCard() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem('smak-cookie') === '1'; } catch { /* ignore */ }
    if (seen) return;
    const id = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(id);
  }, []);
  const close = () => {
    setVisible(false);
    try { localStorage.setItem('smak-cookie', '1'); } catch { /* ignore */ }
  };
  return (
    <div className={`cookie${visible ? ' is-visible' : ''}`} data-cookie role="region" aria-label="Уведомление о cookie" inert={!visible}>
      <p>Мы используем cookie и Яндекс Метрику, чтобы сайт работал лучше.</p>
      <div className="row">
        <button className="btn btn-primary" type="button" data-cookie-accept onClick={close}>Принять</button>
        <button className="btn btn-outline-dark" type="button" data-cookie-settings onClick={close}>Только необходимые</button>
      </div>
    </div>
  );
}

export function MobileCartBar() {
  const t = useCart();
  const { pathname } = useLocation();
  const show = !['/checkout', '/order'].includes(pathname) && t.count > 0;
  useEffect(() => {
    document.body.classList.toggle('has-cart-bar', show);
  }, [show]);
  return (
    <div className={`mobile-cart-bar${show ? ' is-visible' : ''}`} data-cart-bar inert={!show}>
      <button type="button" data-cart-open onClick={openCart}>
        <span className="left"><Icon name="bag" /><Num value={t.count} data-bar-count /> · <Num value={rub(t.total)} data-bar-total /></span>
        <span className="go">Оформить →</span>
      </button>
    </div>
  );
}

/** Address suggestions shared by every address input (list="addr-suggest") */
export const AddressSuggestions = () => (
  <datalist id="addr-suggest">{SUGGEST.map((s) => <option key={s} value={s} />)}</datalist>
);
