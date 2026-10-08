// Home menu (§6.6): tabs swap the dish list and the featured plate
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGSAP, gsap, EASE, MQ, isReduced } from '../../lib/scroll.js';
import { CATEGORIES, byCat } from '../../data/menu.js';
import { Tabs } from '../ui/Tabs.jsx';
import { DishRow } from '../ui/Dish.jsx';
import { Link } from '../ui/Link.jsx';

const plateOf = (cat) => CATEGORIES.find((c) => c.id === cat).plate;

/**
 * Two stacked plates crossfade; blur makes the swap read as one plate turning.
 * Each plate animates in on mount and out once it is no longer current, then removes itself —
 * so rapid clicks just stack short-lived exits, and the last plate always wins.
 */
function FeaturePlate({ cat, current, animate, onGone }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!animate) return;
    gsap.fromTo(ref.current,
      { autoAlpha: 0, rotation: -40, scale: 0.96, filter: 'blur(4px)' },
      { autoAlpha: 1, rotation: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'out' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (current) return;
    const tween = gsap.to(ref.current, {
      autoAlpha: 0, rotation: '+=40', scale: 0.96, filter: 'blur(4px)', duration: 0.35, ease: 'out', overwrite: true, onComplete: onGone,
    });
    return () => tween.kill();
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps
  return <img ref={ref} src={plateOf(cat)} alt="" data-feature-plate />;
}

export function MenuSection() {
  const root = useRef(null);
  const list = useRef(null);
  const caption = useRef(null);
  const [tab, setTab] = useState(CATEGORIES[0].id);       // selected tab
  const [shown, setShown] = useState(CATEGORIES[0].id);   // list on screen (lags during the exit)
  const [plates, setPlates] = useState([{ key: 0, cat: CATEGORIES[0].id, animate: false }]);
  const token = useRef(0);
  const enterNext = useRef(false);

  // Warm the cache so a crossfade never fades into an unloaded image
  useEffect(() => { CATEGORIES.forEach((c) => { new Image().src = c.plate; }); }, []);

  // Scroll decor: the stage drifts and the botanical rises through the section
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true };
      gsap.fromTo('[data-feature-stage]', { rotation: -25 }, { rotation: 25, ease: 'none', scrollTrigger: st });
      gsap.fromTo('[data-menu-momiji]', { y: 80, rotation: -10 }, { y: -40, rotation: 6, ease: 'none', scrollTrigger: { ...st } });
    });
    return () => mm.revert();
  }, { scope: root });

  // New rows rise in with a short stagger
  useLayoutEffect(() => {
    if (!enterNext.current) return;
    enterNext.current = false;
    gsap.fromTo(list.current.children,
      { y: 8, autoAlpha: 0, filter: 'blur(2px)' },
      { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.3, stagger: 0.035, ease: 'out', clearProps: 'filter,transform' });
  }, [shown]);

  const onChange = (cat, { instant }) => {
    const my = ++token.current;
    setTab(cat);
    if (isReduced() || instant) {
      setShown(cat);
      setPlates([{ key: my, cat, animate: false }]);
      return;
    }
    // Exit fast and together (120ms), then swap; a newer click cancels this one
    gsap.to(list.current.children, {
      autoAlpha: 0, filter: 'blur(2px)', duration: 0.12, ease: 'out', overwrite: true,
      onComplete: () => { if (my === token.current) { enterNext.current = true; setShown(cat); } },
    });
    setPlates((ps) => [...ps, { key: my, cat, animate: true }]);
    caption.current.animate([{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 250, easing: EASE.out });
  };

  const title = CATEGORIES.find((c) => c.id === tab).title;

  return (
    <section ref={root} className="section theme-dark noise menu-section" id="menu" aria-labelledby="menu-title" data-menu-section>
      <div className="container">
        <div className="section-head" data-reveal-group>
          <span className="t-eyebrow" data-reveal>Меню</span>
          <h2 className="t-h2" id="menu-title" data-reveal>Выберите своё</h2>
        </div>
        <div className="tabs-sticky">
          <div className="tabs-wrap"><Tabs items={CATEGORIES} value={tab} onChange={onChange} label="Категории меню" /></div>
        </div>
        <div className="menu-layout">
          <div className="menu-feature" aria-hidden="true">
            <div className="plate-sticky">
              <div className="plate-stage" data-feature-stage>
                {plates.map((p, i) => (
                  <FeaturePlate key={p.key} cat={p.cat} animate={p.animate} current={i === plates.length - 1}
                    onGone={() => setPlates((ps) => ps.filter((x) => x.key !== p.key))} />
                ))}
              </div>
              <span className="caption" ref={caption} data-feature-caption>{title}</span>
            </div>
          </div>
          <div>
            <div className="dish-list" role="tabpanel" aria-labelledby={`tab-${shown}`} ref={list} data-dish-list>
              {byCat(shown).slice(0, 6).map((d) => <DishRow key={d.id} dish={d} />)}
            </div>
          </div>
        </div>
        <div className="menu-cta"><Link className="btn btn-outline-dark" to="/menu">Всё меню <span aria-hidden="true">→</span></Link></div>
      </div>
      <img className="menu-momiji" src="/img/momiji.svg" alt="" aria-hidden="true" data-menu-momiji />
    </section>
  );
}
