// Cart drawer — design.md §7.3
import { useEffect, useRef, useState } from 'react';
import { setQty, applyPromo, add } from '../../store/cart.js';
import { byId, UPSELL_IDS } from '../../data/menu.js';
import { closeLayer, useUI } from '../../store/ui.js';
import { useCart } from '../../hooks/useCart.js';
import { useLayer } from '../../hooks/useLayer.js';
import { EASE, isReduced } from '../../lib/scroll.js';
import { swipeToDismiss } from '../../lib/motion.js';
import { rub, plural, WORDS, quote } from '../../lib/format.js';
import { Icon } from '../ui/Icon.jsx';
import { Num } from '../ui/Num.jsx';
import { Summary } from '../ui/Summary.jsx';
import { Link, ArrowLink } from '../ui/Link.jsx';

const ADDON_LABELS = { ginger: 'имбирь', wasabi: 'васаби', soy: 'соевый соус' };

function AddonText({ addons }) {
  if (!addons) return null;
  const parts = Object.entries(addons).filter(([, v]) => v).map(([k, v]) => (k === 'sticks' ? `палочки × ${v}` : ADDON_LABELS[k]));
  return parts.length ? <span className="li-extra">+ {parts.join(', ')}</span> : null;
}

/** Exit for a line item: fade + nudge right, then collapse its height so the list closes up. */
async function playExit(li) {
  if (isReduced()) {
    await li.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }).finished;
    return;
  }
  const h = li.offsetHeight;
  li.style.overflow = 'hidden';
  await li.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(16px)' }],
    { duration: 150, easing: EASE.out, fill: 'forwards' },
  ).finished;
  await li.animate(
    [{ height: `${h}px` }, { height: '0px', paddingTop: '0px', paddingBottom: '0px', borderBottomWidth: '0px' }],
    { duration: 200, easing: EASE.out, fill: 'forwards' },
  ).finished;
}

function LineItem({ line: l, isNew, onRemoved }) {
  const ref = useRef(null);
  const leaving = useRef(false);

  // Leaving the list: play the exit first, then commit
  const remove = async () => {
    if (leaving.current) return;
    leaving.current = true;
    ref.current.dataset.leaving = ''; // styling hook: no clicks on a row that is on its way out
    const hadFocus = ref.current.contains(document.activeElement);
    await playExit(ref.current);
    setQty(l.key, 0);
    if (hadFocus) onRemoved();
  };

  return (
    <li ref={ref} data-key={l.key} className={isNew ? 'is-new' : undefined}>
      <img src={l.dish.img} alt="" width="64" height="64" />
      <div>
        <div className="li-name">{l.dish.name}</div>
        <AddonText addons={l.addons} />
        <div className="stepper" role="group" aria-label={`Количество ${quote(l.dish.name)}`}>
          <button type="button" data-line-dec={l.key} aria-label="Убрать одну" onClick={() => (l.qty > 1 ? setQty(l.key, l.qty - 1) : remove())}>−</button>
          <Num as="output" value={l.qty} />
          <button type="button" data-line-inc={l.key} aria-label="Добавить ещё" onClick={() => setQty(l.key, l.qty + 1)}>+</button>
        </div>
      </div>
      <div className="li-side">
        <Num className="li-price" value={rub(l.sum)} />
        <button className="li-remove" type="button" data-line-remove={l.key} onClick={remove}>Удалить</button>
      </div>
    </li>
  );
}

/** Free-delivery bar: mounts empty and fills, then follows the subtotal via the CSS transition */
function FreeBar({ ratio }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(ratio));
    return () => cancelAnimationFrame(raf);
  }, [ratio]);
  return <div className="bar"><i data-bar style={{ transform: `scaleX(${shown})` }} /></div>;
}

function Promo({ t }) {
  const [open, setOpen] = useState(!!t.promo);
  const [error, setError] = useState('');
  const form = useRef(null);
  const onSubmit = (e) => {
    e.preventDefault();
    if (applyPromo(e.currentTarget.code.value)) { setError(''); return; }
    setError('Такого промокода нет. Попробуйте СМАК10');
    if (!isReduced()) {
      form.current.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }],
        { duration: 320, easing: 'ease-out' },
      );
    }
  };
  return (
    <div className="promo">
      <details open={open || !!t.promo} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>Есть промокод?<i className="plus-minus" aria-hidden="true" /></summary>
        <form ref={form} data-promo-form onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="promo-code">Промокод</label>
          <input className="input" id="promo-code" name="code" placeholder="Например, СМАК10" defaultValue={t.promo ?? ''} autoComplete="off"
            aria-invalid={error ? true : undefined} aria-describedby="promo-msg" />
          <button className="btn btn-primary" type="submit">OK</button>
        </form>
        <p className="promo-msg" id="promo-msg" data-promo-msg aria-live="polite">{t.promo ? `Промокод ${t.promo} применён: −10%` : error}</p>
      </details>
    </div>
  );
}

function Body({ t }) {
  const known = useRef(null); // keys from the previous render — anything else just arrived
  const isNew = (key) => known.current !== null && !known.current.has(key);
  useEffect(() => { known.current = new Set(t.lines.map((l) => l.key)); });

  const ratio = t.freeFrom ? Math.min(1, t.subtotal / t.freeFrom) : 1;
  const upsell = UPSELL_IDS.map(byId).filter((d) => !t.lines.some((l) => l.id === d.id)).slice(0, 4);
  const focusClose = () => document.querySelector('[data-drawer-close]')?.focus();

  return (
    <>
      <div className="free-progress">
        {t.freeFrom == null
          ? <p>Доставка в красную зону — {rub(t.delivery)}</p>
          : t.toFree > 0
            ? <p>Ещё <strong>{rub(t.toFree)}</strong> до бесплатной доставки</p>
            : <p>Доставка бесплатная ✓</p>}
        <FreeBar ratio={ratio} />
      </div>
      <ul className="line-items">
        {t.lines.map((l) => <LineItem key={l.key} line={l} isNew={isNew(l.key)} onRemoved={focusClose} />)}
      </ul>
      {upsell.length > 0 && (
        <div className="upsell">
          <h3>Добавить к заказу</h3>
          <div className="upsell-row" data-lenis-prevent>
            {upsell.map((d) => (
              <div key={d.id} className="upsell-card" data-dish>
                <img src={d.img} alt={d.name} />
                <span>{d.name}</span>
                <div className="row">
                  <span className="li-price">{rub(d.price)}</span>
                  <button className="icon-btn" type="button" data-add={d.id} aria-label={`Добавить ${quote(d.name)}`} onClick={() => add(d.id)}><Icon name="plus" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Promo t={t} />
    </>
  );
}

export function CartDrawer() {
  const open = useUI((s) => s.layer === 'cart');
  const t = useCart();
  const ref = useRef(null);
  useLayer(ref, open, closeLayer);

  // Swipe right to close (touch); the upsell row keeps its own horizontal scroll
  useEffect(() => swipeToDismiss(ref.current, { axis: 'x', ignore: '.upsell-row, input', onDismiss: closeLayer }), []);

  return (
    <aside ref={ref} className={`drawer${open ? ' is-open' : ''}`} id="cart-drawer" data-drawer
      role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden={!open} inert={!open}>
      <div className="drawer-head">
        <h2 className="t-h3" id="cart-title">Корзина <span className="count" data-drawer-count>{t.count ? plural(t.count, WORDS.items) : ''}</span></h2>
        <button className="icon-ghost" type="button" data-drawer-close aria-label="Закрыть корзину" onClick={closeLayer}><Icon name="x" /></button>
      </div>
      <div className="drawer-body" data-drawer-body data-lenis-prevent>
        {t.count ? <Body t={t} /> : (
          <div className="cart-empty">
            <h3 className="t-h3">Здесь пока пусто</h3>
            <p>Начните с наших хитов — филадельфия и сет «На двоих» разлетаются первыми.</p>
            <ArrowLink to="/menu" style={{ color: 'var(--salmon-deep)' }} onClick={closeLayer}>Перейти в меню</ArrowLink>
          </div>
        )}
      </div>
      <div className="drawer-foot" data-drawer-foot>
        {t.count > 0 && (
          <>
            <Summary t={t} />
            <Link className="btn btn-primary btn-block" to="/checkout" style={{ minHeight: 56 }} onClick={closeLayer}>Оформить заказ</Link>
          </>
        )}
      </div>
    </aside>
  );
}
