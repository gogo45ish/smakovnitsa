// For companies (§6.8): hours card slides in, platter photo opens up and zooms out
import { useRef } from 'react';
import { useGSAP, gsap, MQ } from '../../lib/scroll.js';
import { tg } from '../../lib/format.js';
import { Link } from '../ui/Link.jsx';

export function Events() {
  const root = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const card = root.current.querySelector('[data-hours-card]');
      const photo = root.current.querySelector('[data-events-photo]');
      gsap.from(card, { x: 32, autoAlpha: 0, duration: 0.9, ease: 'out', scrollTrigger: { trigger: card, start: 'top 80%', once: true } });
      gsap.from(card.querySelectorAll('.row'), {
        autoAlpha: 0, x: 12, stagger: 0.06, duration: 0.6, delay: 0.25,
        scrollTrigger: { trigger: card, start: 'top 80%', once: true },
      });
      gsap.fromTo(photo.querySelector('img'), { scale: 1.2 }, {
        scale: 1, ease: 'none', scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom 60%', scrub: true },
      });
      gsap.fromTo(photo, { clipPath: 'inset(8% 6% 8% 6%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: photo, start: 'top bottom', end: 'top 30%', scrub: true },
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className="section theme-dark noise" aria-labelledby="events-title">
      <div className="container">
        <div className="events-grid">
          <div className="events-copy" data-reveal-group>
            <span className="t-eyebrow" data-reveal>Для компаний</span>
            <h2 className="t-h2" id="events-title" data-split>Праздник, офис, вечеринка?</h2>
            <p className="t-body-lg muted" data-reveal>
              {tg('Соберём сет на 10–50 человек под ваш бюджет и вкусы гостей. Примем предзаказ за сутки, привезём точно ко времени, добавим палочки, соусы и одноразовую посуду.')}
            </p>
            <Link className="btn btn-primary" to="/menu#sets" data-reveal>Заказать сет на компанию</Link>
          </div>
          <div className="hours-card" data-hours-card>
            <h3 className="t-h3">Часы доставки</h3>
            <div className="row"><span>Пн–Чт</span><span>10:00–23:00</span></div>
            <div className="row"><span>Пт–Вс</span><span>10:00–01:00</span></div>
            <div className="row happy"><span>«Счастливые часы»</span><span>15:00–17:00 · −20% на{' '}роллы</span></div>
            <p className="call">Звоните: <a href="tel:+74951234567">+7 (495) 123-45-67</a></p>
          </div>
        </div>
        <div className="events-photo" data-events-photo>
          <img src="/img/photos/platter.webp" alt="Большой сет роллов для вечеринки в деревянной лодке" loading="lazy" data-events-img />
        </div>
      </div>
    </section>
  );
}
