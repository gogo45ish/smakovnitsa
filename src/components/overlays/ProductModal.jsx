// Product modal (desktop) / bottom sheet (mobile) — design.md §7.2
import { useEffect, useRef, useState } from 'react';
import { byId } from '../../data/menu.js';
import { add } from '../../store/cart.js';
import { closeLayer, toast, useUI } from '../../store/ui.js';
import { useLayer } from '../../hooks/useLayer.js';
import { swipeToDismiss } from '../../lib/motion.js';
import { rub, pcsWeight, num, quote } from '../../lib/format.js';
import { Icon } from '../ui/Icon.jsx';
import { Num } from '../ui/Num.jsx';
import { Tags } from '../ui/Dish.jsx';

const FREE_ADDONS = [['ginger', 'Имбирь'], ['wasabi', 'Васаби'], ['soy', 'Соевый соус']];

function ProductContent({ dish: d }) {
  const [qty, setQty] = useState(1);
  const [addons, setAddons] = useState({ ginger: true, wasabi: true, soy: true, sticks: 2 });
  const isFood = d.cat !== 'drinks';
  const sticks = (delta) => setAddons((a) => ({ ...a, sticks: Math.max(0, Math.min(20, a.sticks + delta)) }));

  const onAdd = () => {
    add(d.id, qty, isFood ? addons : null);
    closeLayer();
    toast(`${quote(d.name)} в корзине`);
  };

  return (
    <>
      <div className="modal-scroll" data-modal-body data-lenis-prevent>
        <div className="modal-grid">
          <div className="modal-media"><img src={d.img} alt={`${d.name}${d.pcs ? `, ${d.pcs} шт` : ''}`} /></div>
          <div className="modal-info theme-white">
            <div>
              <h2 className="t-h3" id="pm-title">{d.name}</h2>
              <p className="t-meta">{pcsWeight(d)}{d.persons ? ` · на ${d.persons} персоны` : ''}</p>
            </div>
            {d.tags.length > 0 && <div className="tags"><Tags tags={d.tags} /></div>}
            <p>{d.desc}</p>
            <table className="kbju">
              <caption>Пищевая ценность на 100 г</caption>
              <thead><tr><th scope="col">ккал</th><th scope="col">белки</th><th scope="col">жиры</th><th scope="col">углеводы</th></tr></thead>
              <tbody><tr><td>{num(d.kbju.kcal)}</td><td>{num(d.kbju.p)}</td><td>{num(d.kbju.f)}</td><td>{num(d.kbju.c)}</td></tr></tbody>
            </table>
            <p className="t-meta"><strong>Аллергены:</strong> {d.allergens}</p>
            {isFood && (
              <div className="addons">
                <h4>Добавить бесплатно</h4>
                {FREE_ADDONS.map(([k, label]) => (
                  <div key={k} className="addon">
                    <label>
                      <input className="check" type="checkbox" data-addon={k} checked={addons[k]}
                        onChange={(e) => setAddons((a) => ({ ...a, [k]: e.target.checked }))} /> {label}
                    </label>
                    <span className="free">0 ₽</span>
                  </div>
                ))}
                <div className="addon">
                  <span>Палочки, шт.</span>
                  <div className="stepper" role="group" aria-label="Палочки">
                    <button type="button" data-sticks="-1" aria-label="Меньше палочек" onClick={() => sticks(-1)}>−</button>
                    <Num as="output" value={addons.sticks} />
                    <button type="button" data-sticks="1" aria-label="Больше палочек" onClick={() => sticks(1)}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-foot" data-modal-foot>
        <div className="stepper" role="group" aria-label="Количество">
          <button type="button" data-mqty="-1" aria-label="Меньше" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <Num as="output" value={qty} data-mqty-out />
          <button type="button" data-mqty="1" aria-label="Больше" onClick={() => setQty((q) => q + 1)}>+</button>
        </div>
        <button className="btn btn-primary" type="button" data-modal-add onClick={onAdd}>
          Добавить · <Num value={rub(d.price * qty)} data-mprice />
        </button>
      </div>
    </>
  );
}

export function ProductModal() {
  const open = useUI((s) => s.layer === 'product');
  const id = useUI((s) => s.productId);
  const openKey = useUI((s) => s.productKey);
  const ref = useRef(null);
  const dish = id && byId(id);
  useLayer(ref, open, closeLayer);

  // Bottom sheet on phones: drag down to dismiss — only once its content is scrolled to the top
  useEffect(() => {
    const el = ref.current;
    const mobile = window.matchMedia('(max-width: 767px)');
    return swipeToDismiss(el, {
      axis: 'y',
      scroller: () => el.querySelector('[data-modal-body]'),
      ignore: '.modal-foot',
      enabled: () => mobile.matches,
      onDismiss: closeLayer,
    });
  }, []);

  return (
    <div ref={ref} className={`modal${open ? ' is-open' : ''}`} id="product-modal" data-modal
      role="dialog" aria-modal="true" aria-labelledby="pm-title" aria-hidden={!open} inert={!open}>
      <span className="sheet-grabber" aria-hidden="true" />
      <button className="icon-ghost modal-close" type="button" data-modal-close aria-label="Закрыть" onClick={closeLayer}><Icon name="x" /></button>
      {/* keyed by open count: every open starts at qty 1 with default add-ons, scrolled to the top */}
      {dish && <ProductContent key={openKey} dish={dish} />}
    </div>
  );
}
