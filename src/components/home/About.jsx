// About (§6.3): clip wipe on the chef photo with inner parallax, stats count up
import { useRef } from 'react';
import { useGSAP, gsap, MQ } from '../../lib/scroll.js';
import { tg } from '../../lib/format.js';
import { Link } from '../ui/Link.jsx';
import { CountUp } from '../ui/CountUp.jsx';

const NB = ' ';

export function About() {
  const media = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(media.current, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut',
        scrollTrigger: { trigger: media.current, start: 'top 80%', once: true },
      });
      gsap.fromTo(media.current.querySelector('img'), { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: media.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    return () => mm.revert();
  });

  return (
    <section className="section theme-white" id="about" aria-labelledby="about-title">
      <div className="container">
        <div className="about-grid">
          <div className="about-copy" data-reveal-group>
            <span className="t-eyebrow" data-reveal>О нас</span>
            <h2 className="t-h2" id="about-title" data-split>Каждый ролл — как в{NB}ресторане</h2>
            <p className="t-body-lg" data-reveal>
              {tg('Мы начинали как маленькая кухня на Тверской и до сих пор работаем так же: шеф сам выбирает рыбу утром, рис варим небольшими партиями, а ролл собираем только после того, как вы нажали «Оформить».')}
            </p>
            <Link className="btn btn-primary" to="/#menu" data-reveal>Заказать</Link>
          </div>
          <div className="about-media" ref={media} data-clip-reveal>
            <img src="/img/chef.svg" alt="Руки шефа нарезают ролл с лососем" loading="lazy" />
          </div>
        </div>
        <div className="stats-row" data-reveal-group>
          <div className="stat" data-reveal><span className="t-stat"><CountUp to={45} />{NB}мин</span><p>среднее время доставки</p></div>
          <div className="stat" data-reveal><span className="t-stat"><CountUp to={120} />+</span><p>позиций в{NB}меню</p></div>
          <div className="stat" data-reveal><span className="t-stat"><CountUp to={4.9} decimals={1} /></span><p>рейтинг на{NB}Яндекс Картах</p></div>
          <div className="stat" data-reveal><span className="t-stat"><CountUp to={250000} />+</span><p>доставленных заказов</p></div>
        </div>
      </div>
    </section>
  );
}
