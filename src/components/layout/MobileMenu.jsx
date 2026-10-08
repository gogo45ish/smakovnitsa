// Burger overlay — links cascade in via CSS transition-delay (--i)
import { useRef } from 'react';
import { setMenu, useUI } from '../../store/ui.js';
import { useLayer } from '../../hooks/useLayer.js';
import { Link } from '../ui/Link.jsx';
import { Icon } from '../ui/Icon.jsx';
import { Logo } from './Header.jsx';

const LINKS = [
  ['/menu', 'Меню'],
  ['/menu#promo', 'Акции'],
  ['/#delivery', 'Доставка'],
  ['/#about', 'О нас'],
];

export function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const ref = useRef(null);
  const close = () => setMenu(false);
  useLayer(ref, open, close, { initialFocus: '[data-burger-close]' });

  return (
    <div ref={ref} className={`menu-overlay${open ? ' is-open' : ''}`} id="menu-overlay" data-menu-overlay
      role="dialog" aria-modal="true" aria-label="Меню" aria-hidden={!open} inert={!open}>
      <div className="menu-overlay-top">
        <Logo onClick={close} />
        <button className="icon-ghost" type="button" data-burger-close aria-label="Закрыть меню" onClick={close}><Icon name="x" /></button>
      </div>
      <nav aria-label="Мобильное меню">
        {LINKS.map(([to, label], i) => <Link key={to} to={to} style={{ '--i': i }} onClick={close}>{label}</Link>)}
      </nav>
      <div className="menu-overlay-foot">
        <span>Доставка 10:00–23:00</span>
        <a href="tel:+74951234567">+7 (495) 123-45-67</a>
      </div>
    </div>
  );
}
