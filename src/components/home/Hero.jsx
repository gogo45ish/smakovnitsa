// Hero (§6.2): line/word intro, then a pinned scroll scene on tablet and up
import { useRef } from 'react';
import { useGSAP, gsap, SplitText, MQ } from '../../lib/scroll.js';
import { tg } from '../../lib/format.js';
import { AddressCheck } from '../ui/AddressCheck.jsx';
import { ArrowLink } from '../ui/Link.jsx';

export function Hero() {
  const root = useRef(null);

  useGSAP((_, contextSafe) => {
    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(root);
    const title = q('[data-hero-title]')[0];
    let alive = true;

    // Intro on load. Hidden states are set synchronously (before the first paint), the timeline
    // waits for the display font because the split depends on real line breaks.
    mm.add(MQ.motion, () => {
      // Idle rotation: one turn per 90s, on the img (scroll scrub drives the wrapper)
      gsap.to(q('[data-hero-plate]'), { rotation: 360, duration: 90, ease: 'none', repeat: -1 });
      gsap.set(title, { autoAlpha: 0 });
      gsap.set(q('[data-hero-fade]'), { y: 16, autoAlpha: 0 });
      gsap.set(q('[data-hero-plate-wrap]'), { yPercent: 30, scale: 0.7, autoAlpha: 0 });
      gsap.set(q('[data-hero-bamboo]'), { x: -80, y: -60, rotation: -12, autoAlpha: 0 });
      gsap.set(q('[data-hero-momiji]'), { x: 80, autoAlpha: 0 });
      gsap.set(q('[data-hero-hint]'), { autoAlpha: 0 });

      let split;
      document.fonts.ready.then(contextSafe(() => {
        if (!alive) return;
        split = SplitText.create(title, { type: 'lines,words', mask: 'lines', wordsClass: 'word' });
        gsap.set(title, { autoAlpha: 1 });
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .from(split.words, { yPercent: 110, duration: 1.2, stagger: 0.06 })
          .from(title.querySelectorAll('.accent .word'), { color: '#FFFFFF', duration: 1.2, ease: 'power2.out' }, 0.5)
          .to(q('[data-hero-fade]'), { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'out' }, 0.6)
          .to(q('[data-hero-plate-wrap]'), { yPercent: 0, scale: 1, autoAlpha: 1, duration: 1.6 }, 0.3)
          .to(q('[data-hero-bamboo]'), { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 1.6 }, 0.4)
          .to(q('[data-hero-momiji]'), { x: 0, autoAlpha: 1, duration: 1.6 }, 0.6)
          .to(q('[data-hero-hint]'), { autoAlpha: 1, duration: 0.6 }, 1.2);
      }));
      return () => split?.revert();
    });

    mm.add(MQ.reduced, () => {
      gsap.from(q('[data-hero-copy], [data-hero-plate-wrap]'), { autoAlpha: 0, duration: 0.15 });
    });

    // Pinned scroll scene
    mm.add(MQ.tablet, () => {
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top 64px', end: '+=110%', pin: true, scrub: 1, anticipatePin: 1 },
      })
        .to(q('[data-hero-copy]'), { yPercent: -35, autoAlpha: 0, duration: 0.5 }, 0)
        .to(q('[data-hero-hint]'), { autoAlpha: 0, duration: 0.1 }, 0)
        .to(q('[data-hero-plate-wrap]'), { yPercent: -50, scale: 1.08, rotation: 60, duration: 1 }, 0)
        .to(q('[data-hero-bamboo]'), { y: -140, x: -80, rotation: -8, duration: 1 }, 0)
        .to(q('[data-hero-momiji]'), { y: 160, rotation: 10, duration: 1 }, 0);
    });

    // Mobile: subtle parallax, no pin (§8)
    mm.add(MQ.mobile, () => {
      gsap.to(q('[data-hero-plate-wrap]'), {
        y: -40, rotation: 20, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    });

    return () => { alive = false; mm.revert(); };
  }, { scope: root });

  return (
    <section ref={root} className="hero theme-dark noise" data-hero aria-labelledby="hero-title">
      <img className="hero-bamboo" src="/img/bamboo.svg" alt="" aria-hidden="true" data-hero-bamboo />
      <img className="hero-momiji" src="/img/momiji.svg" alt="" aria-hidden="true" data-hero-momiji />
      <div className="container hero-copy" data-hero-copy>
        <h1 className="t-display" id="hero-title" data-hero-title>
          <span className="line">Свежие роллы —</span>
          <span className="line accent">прямо к{' '}вашей двери</span>
        </h1>
        <p className="t-body-lg muted hero-lead" data-hero-fade>
          {tg('Готовим из охлаждённой рыбы после вашего заказа. Привезём за 45 минут или вернём деньги.')}
        </p>
        <div className="hero-actions" data-hero-fade>
          <AddressCheck />
          <ArrowLink to="/#menu">Смотреть меню</ArrowLink>
        </div>
      </div>
      <div className="hero-plate-wrap" data-hero-plate-wrap>
        <div className="hero-plate-glow" />
        <img className="hero-plate" src="/img/photos/plate-hero.webp" alt="Нигири и роллы с лососем на тёмной круглой тарелке" data-hero-plate width="760" height="760" fetchPriority="high" decoding="async" />
      </div>
      <div className="hero-scroll-hint" aria-hidden="true" data-hero-hint><span>Листайте</span><i /></div>
    </section>
  );
}
