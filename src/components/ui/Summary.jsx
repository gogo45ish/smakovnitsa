import { rub } from '../../lib/format.js';
import { Num } from './Num.jsx';

/** Order totals block — cart drawer, checkout and order pages */
export function Summary({ t }) {
  return (
    <div className="summary">
      <div className="row"><span>Товары</span><Num value={rub(t.subtotal)} /></div>
      <div className="row"><span>Доставка</span><span>{t.delivery ? rub(t.delivery) : 'бесплатно'}</span></div>
      {t.discount > 0 && <div className="row discount"><span>Скидка</span><span>−{rub(t.discount)}</span></div>}
      <div className="row total"><span>Итого</span><strong><Num value={rub(t.total)} /></strong></div>
    </div>
  );
}
