// Dish row (home menu, §6.6) and product card (/menu grid, §7.1)
import { TAG_LABELS } from '../../data/menu.js';
import { rub, pcsWeight, quote } from '../../lib/format.js';
import { openProduct } from '../../store/ui.js';
import { AddSlot } from './AddSlot.jsx';

export const Tags = ({ tags }) => tags.map((t) => <span key={t} className={`tag tag-${t}`}>{TAG_LABELS[t]}</span>);

/** Name link that opens the product dialog */
const OpenLink = ({ dish }) => (
  <a href="#" role="button" data-open-product={dish.id} onClick={(e) => { e.preventDefault(); openProduct(dish.id); }}>{dish.name}</a>
);

export function DishRow({ dish: d }) {
  return (
    <article className="dish-row" data-dish={d.id}>
      <img className="dish-thumb" src={d.img} alt={d.name} width="64" height="64" loading="lazy" data-open-product={d.id} onClick={() => openProduct(d.id)} />
      <div className="dish-main">
        <div className="dish-top"><h3 className="t-h4 dish-name"><OpenLink dish={d} /></h3></div>
        <p className="dish-desc">{d.desc}</p>
        <div className="dish-meta t-meta">
          <span>{pcsWeight(d)}</span>
          {d.tags.length > 0 && <span className="tags"><Tags tags={d.tags} /></span>}
        </div>
      </div>
      <span className="dish-leader" aria-hidden="true" />
      <div className="dish-side">
        <span className="t-price">{rub(d.price)}</span>
        <AddSlot dish={d} variant="icon" />
      </div>
    </article>
  );
}

export function ProductCard({ dish: d }) {
  const open = () => openProduct(d.id);
  return (
    <article className="product-card" data-dish={d.id}>
      <div
        className="media" role="button" tabIndex={0} data-open-product={d.id} aria-label={`Подробнее о ${quote(d.name)}`}
        onClick={open}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
      >
        <img src={d.img} alt={`${d.name}${d.pcs ? `, ${d.pcs} шт` : ''}`} loading="lazy" width="400" height="400" />
      </div>
      <div className="body">
        <h3 className="t-h4"><OpenLink dish={d} /></h3>
        <p className="desc">{d.desc}</p>
        <div className="meta-row t-meta">
          <span>{pcsWeight(d)}</span>
          {d.tags.length > 0 && <span className="tags"><Tags tags={d.tags} /></span>}
        </div>
        <div className="buy">
          <span className="t-price">{rub(d.price)}</span>
          <AddSlot dish={d} variant="label" />
        </div>
      </div>
    </article>
  );
}
