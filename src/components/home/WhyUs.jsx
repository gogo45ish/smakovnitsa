// Why us (§6.5): staggered list, opposing collage parallax, «since» badge settles in
import { useRef } from 'react';
import { useGSAP, gsap, MQ } from '../../lib/scroll.js';
import { Icon } from '../ui/Icon.jsx';

const NB = ' ';
const ITEMS = [
  { icon: 'fish', title: `Охлаждённая рыба, не${NB}заморозка`, text: `Лосось и${NB}тунец поступают каждое утро.` },
  { icon: 'knife', title: 'Готовим после заказа', text: `Ничего не${NB}лежит на${NB}витрине.` },
  { icon: 'thermo', title: `Термосумки и${NB}точное время`, text: `Курьер в${NB}приложении на${NB}карте.` },
];

export function WhyUs() {
  const collage = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const q = gsap.utils.selector(collage);
      const st = { trigger: collage.current, start: 'top bottom', end: 'bottom top', scrub: true };
      gsap.fromTo(q('[data-collage-a]'), { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: st });
      gsap.fromTo(q('[data-collage-b]'), { yPercent: 0 }, { yPercent: -12, ease: 'none', scrollTrigger: { ...st } });
      gsap.fromTo(q('.c-square'), { y: 80 }, { y: -20, ease: 'none', scrollTrigger: { ...st } });
      gsap.from(q('[data-since]'), {
        scale: 0.92, y: 16, autoAlpha: 0, rotation: -4, filter: 'blur(4px)', duration: 0.9, ease: 'out', clearProps: 'filter',
        scrollTrigger: { trigger: collage.current, start: 'top 60%', once: true },
      });
    });
    return () => mm.revert();
  });

  return (
    <section className="section theme-rice" aria-labelledby="why-title">
      <div className="container why-grid">
        <div>
          <span className="t-eyebrow" data-reveal>Почему мы</span>
          <h2 className="t-h2" id="why-title" data-split>Больше, чем просто доставка</h2>
          <ul className="why-list" data-reveal-group>
            {ITEMS.map((it) => (
              <li key={it.icon} className="why-item" data-reveal>
                <Icon name={it.icon} />
                <div><h3 className="t-h4">{it.title}</h3><p>{it.text}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="collage" ref={collage} data-collage>
          <div className="c-tall"><img src="/img/photos/collage-tall.webp" alt="Башня из роллов с лососем и огурцом" loading="lazy" data-collage-a /></div>
          <div className="c-square"><img src="/img/photos/collage-square.webp" alt="Ролл с лососем и икрой на чёрной тарелке" loading="lazy" data-collage-b /></div>
          <div className="since-badge" data-since><span>Готовим с</span><strong>2014</strong></div>
        </div>
      </div>
    </section>
  );
}
