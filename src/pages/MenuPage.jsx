// /menu — sticky category tabs with scroll-spy, product grid, promo parallax (§7.1, §7.9)
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGSAP, gsap, ScrollTrigger, isReduced } from '../lib/scroll.js';
import { CATEGORIES, byCat } from '../data/menu.js';
import { plural } from '../lib/format.js';
import { useReveals } from '../hooks/useReveals.js';
import { Tabs } from '../components/ui/Tabs.jsx';
import { ProductCard } from '../components/ui/Dish.jsx';
import { Link } from '../components/ui/Link.jsx';

const NB = ' ';
const PROMOS = [
  { img: '/img/promo.svg', alt: 'Роллы с лососем на тёмной тарелке', title: `«Счастливые часы» — −20% на${NB}роллы`, text: 'Каждый день с 15:00 до 17:00.' },
  { img: '/img/plate-party.svg', alt: 'Большой сет на круглой тарелке', contain: true, title: `−10% на${NB}первый заказ`, text: <>Промокод <strong style={{ color: 'var(--gold)' }}>СМАК10</strong> в{NB}корзине.</> },
];

export default function MenuPage() {
  const main = useRef(null);
  const navigate = useNavigate();
  const [tab, setTab] = useState(CATEGORIES[0].id);
  const jumping = useRef(false);
  useReveals(main);

  useGSAP(() => {
    // Scroll-spy keeps the tabs in sync with the section in the middle of the screen
    CATEGORIES.forEach((c) => {
      ScrollTrigger.create({
        trigger: `#${c.id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => { if (self.isActive && !jumping.current) setTab(c.id); },
      });
    });
    if (isReduced()) return;

    // Cards rise in batches as they enter
    gsap.set('.product-card', { autoAlpha: 0, y: 16 });
    ScrollTrigger.batch('.product-card', {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'out' }),
    });

    // Promo images drift inside their frames
    gsap.utils.toArray('[data-promo-img]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -10 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }, { scope: main });

  // Tabs jump to sections (the URL hash follows, so the position is shareable)
  const onTab = (id) => {
    setTab(id);
    jumping.current = true;
    navigate({ hash: id }, { replace: true, preventScrollReset: true });
    setTimeout(() => (jumping.current = false), 1500);
  };

  return (
    <main id="main" tabIndex={-1} ref={main} className="theme-dark noise">
      <title>Меню — Смаковница</title>
      <meta name="description" content="Роллы, сеты, суши, горячее и напитки с доставкой по Москве." />
      <section className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Хлебные крошки"><Link to="/">Главная</Link><span aria-hidden="true">/</span><span aria-current="page">Меню</span></nav>
          <span className="t-eyebrow" data-reveal>Меню</span>
          <h1 className="t-h2" data-split>Всё, что мы готовим</h1>
          <p className="t-body-lg muted" data-reveal>
            Каждую позицию собираем после заказа. Нажмите на{NB}блюдо, чтобы увидеть состав, КБЖУ и{NB}добавить имбирь, васаби или палочки.
          </p>
        </div>
      </section>

      <section className="container" id="promo" aria-label="Акции">
        <div className="promo-row" data-reveal-group>
          {PROMOS.map((p) => (
            <article key={p.img} className="promo-banner" data-reveal>
              <div className="media">
                <img src={p.img} alt={p.alt} data-promo-img style={p.contain ? { objectFit: 'contain', background: '#0B1514' } : undefined} />
              </div>
              <div className="body">
                <span className="t-eyebrow">Акция</span>
                <h2 className="t-h3">{p.title}</h2>
                <p className="muted">{p.text}</p>
                <span className="dates">до 31.10.2026</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="menu-tabs-bar" data-menu-tabs-bar>
        <div className="container"><Tabs items={CATEGORIES} value={tab} onChange={onTab} label="Категории меню" /></div>
      </div>

      <div className="container menu-page-end" data-menu-cats>
        {CATEGORIES.map((c) => {
          const dishes = byCat(c.id);
          return (
            <section key={c.id} className="menu-cat" id={c.id} aria-labelledby={`h-${c.id}`}>
              <div className="menu-cat-head"><h2 className="t-h2" id={`h-${c.id}`}>{c.title}</h2><span>{plural(dishes.length, ['позиция', 'позиции', 'позиций'])}</span></div>
              <div className="product-grid">{dishes.map((d) => <ProductCard key={d.id} dish={d} />)}</div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
