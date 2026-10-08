// Testimonials carousel (§6.9): 2 per view (1 on mobile), arrows, dots, drag with momentum
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGSAP, gsap, MQ, isReduced } from '../../lib/scroll.js';
import { fromKeyboard } from '../../lib/motion.js';
import { tg } from '../../lib/format.js';
import { Icon } from '../ui/Icon.jsx';

const REVIEWS = [
  { name: 'Анна М.', avatar: '/img/avatar-1.svg', source: 'Яндекс Карты', href: 'https://yandex.ru/maps/', text: 'Заказываем по пятницам всем отделом. Ни разу не опоздали, рис тёплый, рыба правда свежая — это чувствуется сразу.' },
  { name: 'Дмитрий К.', avatar: '/img/avatar-2.svg', source: '2ГИС', href: 'https://2gis.ru/', text: 'Филадельфия с угрём — лучшая в районе. Курьер позвонил за 5 минут, пакет аккуратный, ничего не помялось.' },
  { name: 'Екатерина С.', avatar: '/img/avatar-3.svg', source: 'Яндекс Карты', href: 'https://yandex.ru/maps/', text: 'Брали сет «Вечеринка» на день рождения. Привезли к 19:00 минута в минуту, гости в восторге.' },
  { name: 'Игорь П.', avatar: '/img/avatar-4.svg', source: 'Яндекс Карты', href: 'https://yandex.ru/maps/', text: 'Наконец-то доставка без кислотного дизайна и скидок «−70%». Просто вкусно и спокойно. Том ям тоже рекомендую.' },
];

const perViewNow = () => (window.innerWidth >= 900 ? 2 : 1);

export function Reviews() {
  const root = useRef(null);
  const viewport = useRef(null);
  const track = useRef(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(perViewNow);
  const instant = useRef(true);
  const drag = useRef({ pointer: null, startX: 0, baseX: 0, moved: 0, t0: 0 });
  const pages = REVIEWS.length - perView + 1;

  const step = () => {
    const first = track.current.children[0];
    return first.offsetWidth + parseFloat(getComputedStyle(track.current).columnGap || 24);
  };
  const go = (i, now = false) => {
    instant.current = now;
    setIndex(Math.max(0, Math.min(pages - 1, i)));
  };

  // Settling after a drag/arrow is on-screen movement that should land softly
  useLayoutEffect(() => {
    const x = -index * step();
    if (instant.current || isReduced()) gsap.set(track.current, { x });
    else gsap.to(track.current, { x, duration: 0.5, ease: 'drawer', overwrite: true });
    instant.current = false;
  }, [index, perView]);

  useEffect(() => {
    const onResize = () => {
      instant.current = true;
      setPerView(perViewNow());
      setIndex((i) => Math.min(i, REVIEWS.length - perViewNow()));
      gsap.set(track.current, { x: -Math.min(index, REVIEWS.length - perViewNow()) * step() });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pointer drag: momentum (a flick advances), friction past the ends, one pointer only
  const onPointerDown = (e) => {
    const d = drag.current;
    if (d.pointer !== null || e.button > 0 || e.target.closest('button')) return;
    Object.assign(d, { pointer: e.pointerId, moved: 0, startX: e.clientX, t0: performance.now(), baseX: gsap.getProperty(track.current, 'x') });
    gsap.killTweensOf(track.current);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (e.pointerId !== d.pointer) return;
    d.moved = e.clientX - d.startX;
    if (Math.abs(d.moved) > 4 && !viewport.current.classList.contains('is-dragging')) {
      viewport.current.classList.add('is-dragging');
      viewport.current.setPointerCapture(e.pointerId);
    }
    const min = -(pages - 1) * step();
    let x = d.baseX + d.moved;
    if (x > 0) x = Math.pow(x, 0.7);                    // damped past the first card
    else if (x < min) x = min - Math.pow(min - x, 0.7); // …and past the last
    gsap.set(track.current, { x });
  };
  const onPointerEnd = (e) => {
    const d = drag.current;
    if (e.pointerId !== d.pointer) return;
    d.pointer = null;
    const dragged = viewport.current.classList.contains('is-dragging');
    viewport.current.classList.remove('is-dragging');
    if (!dragged) return;
    const velocity = Math.abs(d.moved) / (performance.now() - d.t0);
    const far = Math.abs(d.moved) > step() * 0.2;
    const target = far || velocity > 0.11 ? index + (d.moved < 0 ? 1 : -1) : index;
    const clamped = Math.max(0, Math.min(pages - 1, target));
    if (clamped === index) gsap.to(track.current, { x: -index * step(), duration: 0.5, ease: 'drawer', overwrite: true });
    else go(clamped);
  };

  // Quote glyphs drift against the scroll
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.utils.toArray('[data-quote]', root.current).forEach((q) => {
        gsap.fromTo(q, { y: 20 }, { y: -20, ease: 'none', scrollTrigger: { trigger: q, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className="section theme-white reviews" aria-labelledby="reviews-title" data-reviews>
      <div className="container">
        <div className="reviews-head">
          <div>
            <span className="t-eyebrow" data-reveal>Отзывы</span>
            <h2 className="t-h2" id="reviews-title" data-split>Что говорят гости</h2>
          </div>
          <div className="reviews-nav">
            <button type="button" data-reviews-prev aria-label="Предыдущие отзывы" disabled={index === 0} onClick={(e) => go(index - 1, fromKeyboard(e))}><Icon name="arrowLeft" /></button>
            <button type="button" data-reviews-next aria-label="Следующие отзывы" disabled={index >= pages - 1} onClick={(e) => go(index + 1, fromKeyboard(e))}><Icon name="arrowRight" /></button>
          </div>
        </div>
        <div
          className="reviews-viewport" ref={viewport} data-reviews-viewport
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}
          // A drag that ends over a link must not follow it
          onClickCapture={(e) => { if (Math.abs(drag.current.moved) > 4) e.preventDefault(); }}
        >
          <div className="reviews-track" ref={track} data-reviews-track>
            {REVIEWS.map((r, n) => (
              <article key={r.name} className="review-card" aria-hidden={n < index || n >= index + perView}>
                <div className="quote" aria-hidden="true" data-quote>“</div>
                <blockquote className="t-body-lg">{tg(r.text)}</blockquote>
                <div className="who">
                  <img src={r.avatar} alt="" width="56" height="56" />
                  <div><strong>{r.name}</strong><a href={r.href} rel="noopener" tabIndex={n < index || n >= index + perView ? -1 : undefined}>{r.source} · ★★★★★</a></div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="reviews-dots" data-reviews-dots>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" aria-label={`Отзывы, страница ${i + 1}`} aria-current={i === index ? 'true' : undefined} data-dot={i}
              onClick={(e) => go(i, fromKeyboard(e))} />
          ))}
        </div>
      </div>
    </section>
  );
}
