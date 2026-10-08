// /order — status stepper with mock progression — design.md §7.6
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useGSAP, gsap, isReduced } from '../lib/scroll.js';
import { byId } from '../data/menu.js';
import { replaceItems } from '../store/cart.js';
import { openCart } from '../store/ui.js';
import { rub } from '../lib/format.js';
import { Icon } from '../components/ui/Icon.jsx';
import { Summary } from '../components/ui/Summary.jsx';
import { ArrowLink } from '../components/ui/Link.jsx';

const STEPS = [
  { title: 'Принят', text: 'Заказ передан на кухню', icon: 'check' },
  { title: 'Готовится', text: 'Шеф собирает роллы прямо сейчас', icon: 'knife' },
  { title: 'Курьер в пути', text: 'Курьер Алексей, белая Skoda · А 123 ВС', icon: 'thermo' },
  { title: 'Доставлен', text: 'Приятного аппетита!', icon: 'bag' },
];
// Mock timing: each status advances after N seconds (real app: websocket / Telegram bot)
const STEP_SECONDS = [0, 8, 20, 45];

const pickup = (data) => data.method === 'pickup';

function loadOrder() {
  try { return JSON.parse(localStorage.getItem('smak-order')); } catch { return null; }
}

/** Courier dot travelling along the route while the order is on its way */
function CourierMap() {
  const ref = useRef(null);
  useGSAP(() => {
    const route = ref.current.querySelector('[data-route]');
    const dot = ref.current.querySelector('[data-courier]');
    const len = route.getTotalLength();
    const proxy = { t: 0 };
    const place = () => { const p = route.getPointAtLength(proxy.t * len); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); };
    place();
    if (isReduced()) return;
    gsap.from(ref.current, { height: 0, autoAlpha: 0, duration: 0.5, ease: 'out' });
    gsap.to(proxy, { t: 1, duration: STEP_SECONDS[3] - STEP_SECONDS[2], ease: 'none', onUpdate: place });
  });
  return (
    <div ref={ref} className="courier-map" aria-label="Курьер на карте">
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g stroke="#fff" strokeOpacity=".07" strokeWidth="2" fill="none"><path d="M0 40 L400 60" /><path d="M0 120 L400 100" /><path d="M80 0 L120 180" /><path d="M260 0 L240 180" /></g>
        <path data-route d="M40 150 C 120 140 110 70 200 80 S 320 50 360 30" stroke="#F37D2F" strokeWidth="3" fill="none" strokeDasharray="6 6" />
        <circle cx="360" cy="30" r="8" fill="#BC914C" />
        <circle data-courier r="7" fill="#F37D2F" />
      </svg>
    </div>
  );
}

function OrderStatus({ data }) {
  const root = useRef(null);
  const stepsRef = useRef(null);
  const elapsed = (Date.now() - data.createdAt) / 1000;
  const [step, setStep] = useState(() => STEP_SECONDS.reduce((acc, s, i) => (elapsed >= s ? i : acc), 0));
  const pickup = data.method === 'pickup';

  useEffect(() => {
    const timers = STEP_SECONDS.map((s, i) => s > elapsed && setTimeout(() => setStep((cur) => Math.max(cur, i)), (s - elapsed) * 1000));
    return () => timers.forEach((id) => id && clearTimeout(id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Connectors between finished steps fill top-down
  useLayoutEffect(() => {
    stepsRef.current.querySelectorAll('.fill').forEach((fill, i) => {
      if (i >= step) return;
      if (isReduced()) gsap.set(fill, { scaleY: 1 });
      else gsap.to(fill, { scaleY: 1, duration: 0.8, ease: 'inOut' });
    });
  }, [step]);

  useGSAP(() => {
    if (isReduced()) return;
    gsap.from(stepsRef.current.children, { x: -16, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: 'out', delay: 0.15 });
    gsap.from('[data-order-card]', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'out', delay: 0.25 });
  }, { scope: root });

  const repeat = () => { replaceItems(data.items); openCart(); };
  const last = STEPS.length - 1;

  return (
    <div ref={root} className="container order-wrap">
      <div>
        <ol className="order-steps" ref={stepsRef} aria-label="Статус заказа" data-order-steps>
          {STEPS.map((s, i) => (
            <li key={s.title} data-step={i} aria-current={i === step ? 'step' : undefined}
              className={`order-step${i < step || (step === last && i === step) ? ' is-done' : ''}${i === step && step < last ? ' is-current' : ''}`}>
              <span className="dot"><Icon name={s.icon} /></span>
              <span className="fill" aria-hidden="true" />
              <div>
                <h3 className="t-h4">{s.title}</h3>
                <p>{i === 2 && pickup ? `Ждём вас на ${data.address}` : s.text}</p>
                {i === 2 && !pickup && step >= 2 && <CourierMap />}
              </div>
            </li>
          ))}
        </ol>
        <div className="order-actions">
          <a className="btn btn-primary" href="tel:+74951234567"><Icon name="phone" /> Позвонить курьеру</a>
          <button className="btn btn-outline-dark" type="button" data-repeat onClick={repeat}>Повторить заказ</button>
        </div>
      </div>
      <aside className="order-card" aria-labelledby="order-sum-title" data-order-card>
        <h2 className="t-h3" id="order-sum-title" style={{ marginBottom: 16 }}>Состав заказа</h2>
        <div className="order-meta">
          <span>{pickup ? 'Самовывоз' : 'Адрес'}: <strong>{data.address}</strong></span>
          <span>Оплата: <strong>{data.pay}</strong> · Персон: <strong>{data.persons}</strong></span>
        </div>
        <ul className="line-items">
          {data.items.map((it) => {
            const d = byId(it.id);
            return d && (
              <li key={it.key ?? it.id}>
                <img src={d.img} alt="" width="48" height="48" />
                <div><div className="li-name">{d.name}</div><span className="li-extra" style={{ color: 'var(--text-on-dark-muted)' }}>{it.qty} × {rub(d.price)}</span></div>
                <span className="li-price">{rub(d.price * it.qty)}</span>
              </li>
            );
          })}
        </ul>
        <Summary t={data} />
      </aside>
    </div>
  );
}

export default function OrderPage() {
  const [params] = useSearchParams();
  const [data] = useState(loadOrder);
  const id = params.get('id');
  const found = data && (!id || String(data.id) === id);

  return (
    <main id="main" tabIndex={-1} className="theme-dark noise">
      <title>{found ? `Заказ №${data.id} — Смаковница` : 'Заказ не найден — Смаковница'}</title>
      <meta name="robots" content="noindex" />
      <section className="page-hero">
        <div className="container">
          <span className="t-eyebrow">{found ? `Заказ №${data.id}` : 'Заказ'}</span>
          <h1 className="t-h2">{found ? 'Спасибо!' : 'Заказ не найден'}</h1>
          <p className="t-body-lg muted">
            {!found
              ? <>Возможно, он был оформлен на другом устройстве. <ArrowLink to="/menu" style={{ color: 'var(--salmon)' }}>Перейти в меню</ArrowLink></>
              : pickup(data)
                ? `Заказ №${data.id} принят. Будет готов к ${data.when} на ${data.address}.`
                : `Заказ №${data.id} принят. Привезём к ${data.when}.`}
          </p>
        </div>
      </section>
      {found && <OrderStatus data={data} />}
    </main>
  );
}
