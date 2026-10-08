// Categories (§6.4): pinned horizontal scroll on desktop, stacked cards below
import { useRef } from 'react';
import { useGSAP, gsap, ScrollTrigger, MQ } from '../../lib/scroll.js';
import { tg } from '../../lib/format.js';
import { Link } from '../ui/Link.jsx';

const CARDS = [
  { id: 'rolls', title: 'Роллы', img: '/img/photos/plate-rolls.webp', alt: 'Маки с лососем и авокадо, вид сверху', text: 'Классические и авторские, от филадельфии до запечённых.' },
  { id: 'sets', title: 'Сеты', img: '/img/photos/plate-sets.webp', alt: 'Сет нигири на чёрной тарелке', text: 'Для компании от 2 до 10 человек. Выгоднее, чем по отдельности.' },
  { id: 'hot', title: 'Вок и горячее', img: '/img/photos/plate-wok.webp', alt: 'Жареная лапша с овощами на деревянном блюде', text: 'Лапша, рис, супы — на случай, если хочется тёплого.' },
];

export function Categories() {
  const root = useRef(null);
  const track = useRef(null);
  const progress = useRef(null);
  const index = useRef(null);
  // GSAP owns this class (it only exists while the desktop pin is live); React never re-renders it
  const setHorizontal = (on) => root.current.classList.toggle('is-horizontal', on);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    const plates = gsap.utils.toArray('[data-cat-plate]', root.current);

    mm.add(MQ.desktop, () => {
      setHorizontal(true);
      const distance = () => track.current.scrollWidth - window.innerWidth;
      const scroller = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(progress.current, { scaleX: self.progress });
            index.current.textContent = String(Math.min(3, 1 + Math.floor(self.progress * 3))).padStart(2, '0');
          },
        },
      });
      plates.forEach((plate) => {
        const card = plate.closest('.cat-card');
        gsap.fromTo(plate, { rotation: -120, scale: 0.75 }, {
          rotation: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: scroller, start: 'left right', end: 'center center', scrub: true },
        });
        gsap.from(card.querySelectorAll('h3, p, .link-arrow'), {
          y: 30, autoAlpha: 0, stagger: 0.08, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: scroller, start: 'left 85%', end: 'left 45%', scrub: true },
        });
      });
      ScrollTrigger.refresh();
      return () => setHorizontal(false);
    });

    // Below desktop: stacked cards with a staggered reveal and a gentle plate spin
    mm.add(MQ.belowDesktop, () => {
      gsap.from(root.current.querySelectorAll('.cat-card'), {
        y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'out',
        scrollTrigger: { trigger: track.current, start: 'top 80%', once: true },
      });
      plates.forEach((plate) => gsap.fromTo(plate, { rotation: -40 }, {
        rotation: 20, ease: 'none',
        scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true },
      }));
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className="section theme-white categories" data-categories aria-labelledby="cat-title">
      <div className="container cat-intro" data-reveal-group>
        <span className="t-eyebrow" data-reveal>Категории</span>
        <h2 className="t-h2" id="cat-title" data-reveal>С чего начнём?</h2>
      </div>
      <div className="cat-viewport">
        <div className="container cat-track" ref={track} data-cat-track>
          <div className="cat-intro-h">
            <span className="t-eyebrow">Категории</span>
            <h2 className="t-h2" aria-hidden="true">С чего начнём?</h2>
            <p>{tg('Три главных раздела меню. Листайте дальше — или сразу выбирайте.')}</p>
          </div>
          {CARDS.map((c) => (
            <Link key={c.id} className="cat-card" to={`/menu#${c.id}`}>
              <img className="plate" src={c.img} alt={c.alt} loading="lazy" data-cat-plate />
              <h3 className="t-h3">{c.title}</h3>
              <p>{tg(c.text)}</p>
              <span className="link-arrow">Смотреть <span className="arr">→</span></span>
            </Link>
          ))}
          <div className="cat-end" aria-hidden="true" />
        </div>
      </div>
      <div className="cat-counter" aria-hidden="true">
        <span ref={index} data-cat-index>01</span><span className="bar"><i ref={progress} data-cat-progress /></span><span>03</span>
      </div>
    </section>
  );
}
