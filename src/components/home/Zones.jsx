// Delivery zones (§6.10): zone table, address checker, Yandex map (or a drawn placeholder)
import { useRef, useState } from 'react';
import { useGSAP, gsap, isReduced } from '../../lib/scroll.js';
import { ZONES } from '../../data/zones.js';
import { rub } from '../../lib/format.js';
import { AddressCheck } from '../ui/AddressCheck.jsx';

// The restaurant's Yandex Maps place card, embedded with the official map widget
// (the widget brings its own «Открыть в Яндекс Картах» button).
// Source: https://yandex.ru/maps/org/smokovnitsa/134981248363/?ll=34.343282%2C44.576454&z=16.8
// To show another place: open it on yandex.ru/maps and put the part after /maps/ behind /map-widget/v1/.
// Empty MAP_EMBED → the drawn zone scheme instead.
export const MAP_EMBED = 'https://yandex.ru/map-widget/v1/org/smokovnitsa/134981248363/?ll=34.343282%2C44.576454&z=16.8';

const STREETS = [
  'M0 180 L800 140', 'M0 330 Q 400 300 800 360', 'M0 480 L800 450', 'M140 0 L180 600', 'M320 0 Q 300 300 360 600',
  'M520 0 L470 600', 'M680 0 Q 640 300 700 600', 'M0 60 L460 600', 'M800 80 L260 600', 'M60 600 L720 0',
];
const ZONE_PATHS = [
  ['M90 300 C 80 120 260 40 420 50 C 620 60 740 170 730 320 C 720 480 580 570 400 560 C 220 550 100 470 90 300Z', '#D9452B'],
  ['M170 300 C 170 170 290 110 410 115 C 560 120 650 200 645 310 C 640 430 540 490 410 485 C 270 480 170 420 170 300Z', '#E0B54A'],
  ['M260 300 C 265 220 330 185 405 188 C 490 190 555 235 550 305 C 545 380 480 410 405 408 C 320 406 255 370 260 300Z', '#6E9E5B'],
];
const KITCHENS = [[400, 300], [330, 250], [470, 340], [440, 230]];

/** Stylised dark city map with three zone rings around the kitchens; zones draw in on scroll */
function MapPlaceholder() {
  const ref = useRef(null);
  useGSAP(() => {
    if (isReduced()) return;
    const paths = ref.current.querySelectorAll('[data-zone-path]');
    gsap.set(paths, { fillOpacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true } })
      .from(paths, { drawSVG: '0%', duration: 1.6, stagger: 0.2, ease: 'inOut' })
      .to(paths, { fillOpacity: 0.1, duration: 0.6, stagger: 0.1 }, '-=0.6')
      .from(ref.current.querySelectorAll('[data-kitchens] circle'), { scale: 0.5, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.06, ease: 'out' }, '-=0.6');
  });
  return (
    <>
      <svg ref={ref} className="map-placeholder" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img"
        aria-label="Схема зон доставки: зелёная в центре, жёлтая и красная дальше от кухонь">
        <rect width="800" height="600" fill="#0B1514" />
        <g stroke="#ffffff" strokeOpacity=".07" strokeWidth="2" fill="none">{STREETS.map((d) => <path key={d} d={d} />)}</g>
        <path d="M-20 260 C 120 200 200 360 320 330 S 480 200 560 290 S 720 420 820 360" stroke="#1E3A44" strokeWidth="18" fill="none" opacity=".9" />
        <g fillOpacity=".1" strokeWidth="2" fill="none">
          {ZONE_PATHS.map(([d, c]) => <path key={c} data-zone-path d={d} stroke={c} fill={c} />)}
        </g>
        <g data-kitchens>
          {KITCHENS.map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}><circle r="14" fill="#BC914C" opacity=".2" /><circle r="6" fill="#BC914C" /></g>
          ))}
        </g>
      </svg>
      <p className="map-note">Схема зон. Подключите карту Яндекса в{' '}<code>src/components/home/Zones.jsx</code>.</p>
    </>
  );
}

/**
 * Live Yandex map. Loads lazily and fades in once ready (no white flash). Until clicked, a
 * transparent guard sits on top so wheel and swipe keep scrolling the page instead of the map;
 * it comes back when the pointer leaves.
 */
function YandexMap() {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <div className={`map-box${loaded ? ' is-loaded' : ''}`} data-map onPointerLeave={() => setActive(false)}>
      <iframe
        src={MAP_EMBED} title="Смаковница на Яндекс Картах" loading="lazy" allowFullScreen
        onLoad={() => setLoaded(true)} tabIndex={active ? 0 : -1}
      />
      {!active && (
        <button type="button" className="map-guard" onClick={() => setActive(true)}>
          <span>Нажмите, чтобы двигать карту</span>
        </button>
      )}
    </div>
  );
}

export function Zones() {
  return (
    <section className="section theme-dark noise" id="delivery" aria-labelledby="zones-title" data-zones>
      <div className="container zones-grid">
        <div>
          <span className="t-eyebrow" data-reveal>Доставка</span>
          <h2 className="t-h2" id="zones-title" data-split>Куда мы привозим</h2>
          <table className="zone-table" data-zone-table>
            <thead><tr><th scope="col">Зона</th><th scope="col">Время</th><th scope="col">Мин. заказ</th><th scope="col">Доставка</th></tr></thead>
            <tbody data-reveal-group>
              {ZONES.map((z) => (
                <tr key={z.id} data-reveal>
                  <td><span className="zone-name"><span className={`swatch ${z.id}`} aria-hidden="true" />{z.name}</span></td>
                  <td data-label="Время">{z.time}</td>
                  <td data-label="Мин. заказ">{rub(z.min)}</td>
                  <td data-label="Доставка">{z.freeFrom ? `бесплатно от ${rub(z.freeFrom)}` : rub(z.fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <AddressCheck />
        </div>
        {MAP_EMBED ? <YandexMap /> : <div className="map-box" data-map><MapPlaceholder /></div>}
      </div>
    </section>
  );
}
