// Sticky header: shrink on scroll, nav, cart button with total + badge — design.md §6.1
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useGSAP, ScrollTrigger, EASE, isReduced } from '../../lib/scroll.js';
import { isFlying } from '../../lib/motion.js';
import { useCart } from '../../hooks/useCart.js';
import { openCart, setMenu, useUI, announce } from '../../store/ui.js';
import { rub, plural, WORDS } from '../../lib/format.js';
import { Link, NavLink } from '../ui/Link.jsx';
import { Icon, LogoMark } from '../ui/Icon.jsx';
import { Num } from '../ui/Num.jsx';

const CITIES = ['Москва', 'Химки', 'Мытищи'];

// Spring-ish pop: overshoot then settle, short enough to stack on rapid adds
const bump = (el) => el?.animate(
  [{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.35 }, { transform: 'scale(1)' }],
  { duration: 320, easing: EASE.out },
);

export const Logo = (props) => (
  <Link className="logo" to="/" {...props}><LogoMark /><span>Смаковница</span></Link>
);

export function Header() {
  const t = useCart();
  const menuOpen = useUI((s) => s.menuOpen);
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [city, setCity] = useState(CITIES[0]);
  const badge = useRef(null);
  const prevCount = useRef(t.count);

  useGSAP(() => {
    ScrollTrigger.create({ start: 120, end: 'max', onToggle: (self) => setScrolled(self.isActive) });
  });

  // Badge pops when the count grows (0→1 is the badge's own @starting-style entrance).
  // If a thumbnail is flying to the cart, pop when it lands — cause, then effect.
  useEffect(() => {
    const prev = prevCount.current;
    prevCount.current = t.count;
    if (prev === t.count) return;
    if (t.count > prev && prev > 0 && !isReduced()) {
      if (isFlying()) document.addEventListener('cart:landed', () => bump(badge.current), { once: true });
      else bump(badge.current);
    }
    announce(`В корзине ${plural(t.count, WORDS.items)} на сумму ${rub(t.subtotal)}`);
  }, [t.count, t.subtotal]);

  const onCart = () => {
    // On checkout the order summary is already on screen
    if (pathname !== '/checkout') openCart();
  };

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`} data-header>
      <div className="topbar">
        <div className="container">
          <span className="topbar-info">Доставка 10:00–23:00 · Бесплатно от 1 500 ₽</span>
          <button className="city-switch" type="button" aria-label={`Город: ${city}. Сменить`} data-city
            onClick={() => setCity((c) => CITIES[(CITIES.indexOf(c) + 1) % CITIES.length])}>
            <span data-city-name>{city}</span><Icon name="chevronDown" />
          </button>
        </div>
      </div>
      <div className="header">
        <div className="container">
          <Logo aria-label="Смаковница — на главную" />
          <nav className="nav" aria-label="Основное меню">
            <NavLink to="/menu" end>Меню</NavLink>
            <Link to="/menu#promo">Акции</Link>
            <Link to="/#delivery">Доставка</Link>
            <Link to="/#about">О нас</Link>
          </nav>
          <div className="header-actions">
            <a className="header-phone" href="tel:+74951234567">+7 (495) 123-45-67</a>
            <Link className="icon-ghost header-profile" to="/checkout" aria-label="Оформление заказа"><Icon name="user" /></Link>
            <button className="cart-btn" type="button" data-cart-open aria-label={`Открыть корзину: ${plural(t.count, WORDS.items)}`} onClick={onCart}>
              <Icon name="bag" />
              <span className="cart-btn-label">Корзина · <Num value={rub(t.subtotal)} data-cart-total /></span>
              <span ref={badge} className="cart-badge" data-cart-count data-count={t.count} aria-hidden="true">{t.count}</span>
            </button>
            <button className="icon-ghost burger" type="button" data-burger aria-label="Открыть меню"
              aria-expanded={menuOpen} aria-controls="menu-overlay" onClick={() => setMenu(true)}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
