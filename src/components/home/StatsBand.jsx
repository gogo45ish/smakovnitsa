// Stats band (§6.7): the inset frame draws itself in as it scrolls through
import { useRef } from 'react';
import { useGSAP, gsap, MQ } from '../../lib/scroll.js';
import { CountUp } from '../ui/CountUp.jsx';

const NB = ' ';
const STATS = [
  { to: 1200, suffix: '+', label: `заказов в${NB}день` },
  { to: 18, label: 'поваров' },
  { to: 4, label: `кухни по${NB}Москве` },
  { to: 12, label: `наград и${NB}премий` },
];

export function StatsBand() {
  const band = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const q = gsap.utils.selector(band);
      gsap.timeline({ scrollTrigger: { trigger: band.current, start: 'top 85%', end: 'top 35%', scrub: 1 } })
        .from(q('.frame.t'), { scaleX: 0, ease: 'none' })
        .from(q('.frame.r'), { scaleY: 0, ease: 'none' })
        .from(q('.frame.b'), { scaleX: 0, ease: 'none' })
        .from(q('.frame.l'), { scaleY: 0, ease: 'none' });
    });
    return () => mm.revert();
  });

  return (
    <section ref={band} className="stats-band" aria-label="Смаковница в цифрах" data-stats-band>
      <div className="stats-band-inner">
        <i className="frame t" /><i className="frame r" /><i className="frame b" /><i className="frame l" />
        <div className="container grid4" data-reveal-group>
          {STATS.map((s) => (
            <div key={s.label} className="stat" data-reveal>
              <span className="t-stat"><CountUp to={s.to} />{s.suffix}</span><p>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
