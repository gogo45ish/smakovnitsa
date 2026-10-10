// /checkout — design.md §7.5
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { snapshot, clear, setZone } from '../store/cart.js';
import { toast } from '../store/ui.js';
import { PICKUP_ADDRESS } from '../data/zones.js';
import { PAY, payMethod } from '../data/payment.js';
import { useCart } from '../hooks/useCart.js';
import { useReveals } from '../hooks/useReveals.js';
import { gsap, isReduced, scrollToEl } from '../lib/scroll.js';
import { checkAddress, zoneMessage, savedAddress } from '../lib/address.js';
import { rub } from '../lib/format.js';
import { createOrder } from '../lib/api.js';
import { Summary } from '../components/ui/Summary.jsx';
import { Num } from '../components/ui/Num.jsx';
import { Link, ArrowLink } from '../components/ui/Link.jsx';

const NB = ' ';
const ERRORS = {
  name: 'Как к вам обращаться?',
  phone: 'Введите номер полностью: +7 (___) ___-__-__',
  address: 'Укажите улицу и номер дома',
  consent: 'Без согласия мы не можем принять заказ',
};

/* ---------- Phone mask: +7 (___) ___-__-__ ---------- */
function formatPhone(value) {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('8') || d.startsWith('7')) d = d.slice(1);
  d = d.slice(0, 10);
  const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
  let out = '+7';
  if (d.length) out += ` (${p[0]}`;
  if (d.length >= 3) out += ')';
  if (d.length > 3) out += ` ${p[1]}`;
  if (d.length > 6) out += `-${p[2]}`;
  if (d.length > 8) out += `-${p[3]}`;
  return { text: d.length ? out : '', digits: d };
}

function makeSlots() {
  const slots = [];
  const now = new Date();
  const t = new Date(now);
  t.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
  t.setHours(t.getHours() + 1);
  const closing = new Date(now); closing.setHours(23, 0, 0, 0);
  if (t > closing) { t.setDate(t.getDate() + 1); t.setHours(11, 0, 0, 0); closing.setDate(closing.getDate() + 1); }
  const tomorrow = t.getDate() !== now.getDate();
  while (t <= closing && slots.length < 12) {
    slots.push(`${tomorrow ? 'завтра ' : ''}${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`);
    t.setMinutes(t.getMinutes() + 30);
  }
  return slots;
}

/** Label + input + inline error, wired with aria-invalid / aria-describedby */
function Field({ name, label, error, required, hint, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`} data-field={name}>
      <label htmlFor={`co-${name}`}>{label}{required && <span className="req" aria-hidden="true"> *</span>}</label>
      {children}
      <span className="field-error" id={`err-${name}`}>{error}</span>
      {hint}
    </div>
  );
}

export default function CheckoutPage() {
  const main = useRef(null);
  const formRef = useRef(null);
  const slotsRef = useRef(null);
  const navigate = useNavigate();
  const t = useCart();
  useReveals(main);

  const [f, setF] = useState(() => ({
    name: '', phone: '', address: savedAddress(), entrance: '', floor: '', flat: '', intercom: '', comment: '',
    method: 'courier', when: 'asap', pay: 'card', change: '', consent: false, marketing: false,
  }));
  const [persons, setPersons] = useState(2);
  const [slot, setSlot] = useState(null);
  const [errors, setErrors] = useState({});
  const [zone, setZoneState] = useState(null); // result of the last address check
  const [minError, setMinError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Back from the payment page can restore this page from bfcache mid-submit
  useEffect(() => {
    const onShow = (e) => { if (e.persisted) setSubmitting(false); };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);
  const slots = useMemo(makeSlots, []);

  const set = (name, value) => {
    setF((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };
  const bind = (name) => ({ id: `co-${name}`, name, value: f[name], onChange: (e) => set(name, e.target.value) });
  const invalid = (name) => (errors[name] ? { 'aria-invalid': true, 'aria-describedby': `err-${name}` } : {});

  // Live zone hint once the address is committed (blur), and for an address prefilled from the home page
  const updateZone = (value = f.address) => {
    const res = checkAddress(value);
    setZoneState(res);
    if (res.zone) setZone(res.zone.id);
    return res;
  };
  useEffect(() => { if (f.address) updateZone(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Slots cascade in when «Ко времени» is picked
  useLayoutEffect(() => {
    if (f.when === 'slot' && !isReduced()) gsap.from(slotsRef.current.children, { y: 10, autoAlpha: 0, stagger: 0.03, duration: 0.3 });
  }, [f.when]);

  const pickup = f.method === 'pickup';
  const online = !!payMethod(f.pay)?.online;
  const view = pickup ? { ...t, delivery: 0, total: t.subtotal - t.discount } : t;
  useEffect(() => { setMinError(''); }, [t.subtotal, f.method]);

  const zoneHint = zone?.zone ? `✓ ${zoneMessage(zone.zone)}` : zone?.out ? `Сюда пока не доставляем, но можно забрать самовывозом на ${PICKUP_ADDRESS}` : '';

  const focusField = (name) => {
    const field = formRef.current.querySelector(`[data-field="${name}"]`);
    scrollToEl(field);
    field.querySelector('input').focus({ preventScroll: true });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!t.count || submitting) return;
    const next = {
      name: !f.name.trim() && ERRORS.name,
      phone: formatPhone(f.phone).digits.length !== 10 && ERRORS.phone,
      address: !pickup && !!checkAddress(f.address).error && ERRORS.address,
      consent: !f.consent && ERRORS.consent,
    };

    if (!pickup && !next.address) {
      const res = updateZone();
      if (res.out) next.address = 'Адрес вне зоны доставки — выберите самовывоз';
      else if (res.zone && t.subtotal < res.zone.min && !Object.values(next).some(Boolean)) {
        setMinError(`Минимальный заказ для этой зоны — ${rub(res.zone.min)}. Добавьте ещё на ${rub(res.zone.min - t.subtotal)}.`);
        return;
      }
    }
    setErrors(next);
    const firstBad = Object.keys(next).find((k) => next[k]);

    if (f.when === 'slot' && !slot) {
      if (!isReduced()) gsap.fromTo(slotsRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
      if (!firstBad) { slotsRef.current.querySelector('button')?.focus(); return; }
    }
    if (firstBad) { focusField(firstBad); return; }

    // The server re-prices the order from the menu; for online payment it returns the ЮKassa page
    setSubmitting(true);
    try {
      const res = await createOrder({
        ...f, slot, persons, items: snapshot(), promo: t.promo,
        phone: formatPhone(f.phone).digits,
      });
      if (res.confirmationUrl) {
        // The cart stays until the payment succeeds (OrderPage clears it), so a failed payment loses nothing
        window.location.assign(res.confirmationUrl);
        return;
      }
      clear();
      navigate(`/order?id=${res.id}`, { viewTransition: true });
    } catch (err) {
      setSubmitting(false);
      if (err.field === 'min') setMinError(err.message);
      else if (err.field && ERRORS[err.field]) { setErrors((x) => ({ ...x, [err.field]: err.message })); focusField(err.field); }
      else toast(err.message);
    }
  };

  return (
    <main id="main" tabIndex={-1} ref={main} className="checkout">
      <title>Оформление заказа — Смаковница</title>
      <meta name="robots" content="noindex" />
      <section className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Хлебные крошки">
            <Link to="/">Главная</Link><span aria-hidden="true">/</span><Link to="/menu">Меню</Link><span aria-hidden="true">/</span><span aria-current="page">Оформление</span>
          </nav>
          <h1 className="t-h2" data-split>Оформление заказа</h1>
        </div>
      </section>

      <div className="container">
        <form className="checkout-grid" noValidate ref={formRef} onSubmit={onSubmit} data-checkout-form>
          <div>
            {/* 1. Контакты */}
            <fieldset className="co-block" data-reveal>
              <legend className="sr-only">Контакты</legend>
              <h2 className="t-h3" aria-hidden="true"><span className="n">01</span>Контакты</h2>
              <div className="co-row two">
                <Field name="name" label="Имя" required error={errors.name}>
                  <input className="input" autoComplete="given-name" required {...bind('name')} {...invalid('name')} />
                </Field>
                <Field name="phone" label="Телефон" required error={errors.phone}>
                  <input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" required
                    {...bind('phone')} {...invalid('phone')}
                    onChange={(e) => set('phone', formatPhone(e.target.value).text)}
                    onFocus={() => { if (!f.phone) set('phone', '+7 ('); }}
                    onBlur={() => { if (f.phone === '+7 (') set('phone', ''); }} />
                </Field>
              </div>
              <p className="co-hint">Вход по SMS-коду — по желанию, чтобы копить бонусы. Пароли не нужны.</p>
            </fieldset>

            {/* 2. Доставка */}
            <fieldset className="co-block" data-reveal>
              <legend className="sr-only">Доставка</legend>
              <h2 className="t-h3" aria-hidden="true"><span className="n">02</span>Доставка</h2>
              <div className="segmented" role="radiogroup" aria-label="Способ получения">
                {[['courier', 'Курьер'], ['pickup', 'Самовывоз']].map(([v, l]) => (
                  <label key={v}><input type="radio" name="method" value={v} checked={f.method === v} onChange={() => set('method', v)} /><span>{l}</span></label>
                ))}
              </div>
              <div className="co-row" hidden={pickup} data-courier-fields>
                <Field name="address" label="Адрес" required error={errors.address}
                  hint={<span className="co-hint" data-zone-hint aria-live="polite">{zoneHint}</span>}>
                  <input className="input" autoComplete="street-address" placeholder="Улица и дом" list="addr-suggest" required
                    {...bind('address')} {...invalid('address')} onBlur={(e) => e.target.value && updateZone(e.target.value)} />
                </Field>
                <div className="co-row four">
                  <div className="field"><label htmlFor="co-entrance">Подъезд</label><input className="input" inputMode="numeric" {...bind('entrance')} /></div>
                  <div className="field"><label htmlFor="co-floor">Этаж</label><input className="input" inputMode="numeric" {...bind('floor')} /></div>
                  <div className="field"><label htmlFor="co-flat">Квартира</label><input className="input" {...bind('flat')} /></div>
                  <div className="field"><label htmlFor="co-intercom">Домофон</label><input className="input" {...bind('intercom')} /></div>
                </div>
                <div className="field"><label htmlFor="co-comment">Комментарий курьеру</label><textarea className="input" rows="3" placeholder="Например: позвоните, когда подъедете" {...bind('comment')} /></div>
              </div>
              <div hidden={!pickup} data-pickup-fields>
                <p className="t-body-lg">Заберите заказ на{NB}<strong>Тверской, 12</strong> — будет готов через ~25{NB}мин.</p>
                <p className="co-hint">Ежедневно 10:00–23:00</p>
              </div>
            </fieldset>

            {/* 3. Время */}
            <fieldset className="co-block" data-reveal>
              <legend className="sr-only">Время</legend>
              <h2 className="t-h3" aria-hidden="true"><span className="n">03</span>Время</h2>
              <div className="radio-cards">
                <label className="radio-card"><input type="radio" name="when" value="asap" checked={f.when === 'asap'} onChange={() => set('when', 'asap')} /><span>Как можно скорее<small data-eta>~{zone?.zone?.eta ?? 45} мин</small></span></label>
                <label className="radio-card"><input type="radio" name="when" value="slot" checked={f.when === 'slot'} onChange={() => set('when', 'slot')} /><span>Ко времени<small>{slot ?? 'Выберите слот'}</small></span></label>
              </div>
              <div className="slots" ref={slotsRef} hidden={f.when !== 'slot'} role="group" aria-label="Время доставки" data-slots>
                {slots.map((s) => <button key={s} type="button" aria-pressed={slot === s} data-slot={s} onClick={() => setSlot(s)}>{s}</button>)}
              </div>
            </fieldset>

            {/* 4. Оплата */}
            <fieldset className="co-block" data-reveal>
              <legend className="sr-only">Оплата</legend>
              <h2 className="t-h3" aria-hidden="true"><span className="n">04</span>Оплата</h2>
              <div className="radio-cards">
                {PAY.map((p) => (
                  <label key={p.value} className="radio-card">
                    <input type="radio" name="pay" value={p.value} checked={f.pay === p.value} onChange={() => set('pay', p.value)} />
                    <span>{p.label}{p.note && <small>{p.note}</small>}</span>
                  </label>
                ))}
              </div>
              <div className="field" hidden={f.pay !== 'cash'} data-change-field>
                <label htmlFor="co-change">Сдача с …</label>
                <input className="input" inputMode="numeric" placeholder="Например, 5000" {...bind('change')} />
              </div>
            </fieldset>

            {/* 5. Персоны */}
            <fieldset className="co-block" data-reveal>
              <legend className="sr-only">Персоны и приборы</legend>
              <h2 className="t-h3" aria-hidden="true"><span className="n">05</span>Персоны / приборы</h2>
              <div className="stepper" role="group" aria-label="Количество персон">
                <button type="button" data-persons="-1" aria-label="Меньше" disabled={persons <= 1} onClick={() => setPersons((p) => Math.max(1, p - 1))}>−</button>
                <Num as="output" value={persons} data-persons-out />
                <button type="button" data-persons="1" aria-label="Больше" disabled={persons >= 30} onClick={() => setPersons((p) => Math.min(30, p + 1))}>+</button>
              </div>
            </fieldset>

            {/* 6. Согласие */}
            <fieldset className="co-block" data-reveal>
              <legend className="sr-only">Согласие</legend>
              <div className={`field${errors.consent ? ' has-error' : ''}`} data-field="consent">
                <label className="consent">
                  <input className="check" type="checkbox" name="consent" required checked={f.consent} onChange={(e) => set('consent', e.target.checked)}
                    aria-invalid={errors.consent ? true : undefined} aria-describedby="err-consent" />{' '}
                  <span>Согласен на{NB}обработку персональных данных в{NB}соответствии с{NB}<a href="#">Политикой конфиденциальности</a> (152-ФЗ)</span>
                </label>
                <span className="field-error" id="err-consent">{ERRORS.consent}</span>
              </div>
              <label className="consent">
                <input className="check" type="checkbox" name="marketing" checked={f.marketing} onChange={(e) => set('marketing', e.target.checked)} />{' '}
                <span>Хочу получать SMS об{NB}акциях (по желанию)</span>
              </label>
            </fieldset>
          </div>

          {/* 7. Summary */}
          <aside className="co-summary" aria-labelledby="sum-title" data-co-summary>
            <h2 className="t-h3" id="sum-title">Ваш заказ</h2>
            {t.count ? (
              <>
                <ul className="line-items">
                  {t.lines.map((l) => (
                    <li key={l.key}>
                      <img src={l.dish.img} alt="" width="56" height="56" />
                      <div><div className="li-name">{l.dish.name}</div><span className="li-extra">{l.qty} × {rub(l.dish.price)}</span></div>
                      <span className="li-price">{rub(l.sum)}</span>
                    </li>
                  ))}
                </ul>
                <Summary t={view} />
              </>
            ) : (
              <div className="co-empty"><p>Корзина пуста.</p><ArrowLink to="/menu">Перейти в меню</ArrowLink></div>
            )}
            {minError && <p className="field-error" role="alert" style={{ display: 'block' }} data-min-error>{minError}</p>}
            <button className="btn btn-primary btn-block" type="submit" disabled={!t.count || submitting} aria-busy={submitting || undefined} data-co-submit>
              {submitting
                ? (online ? 'Переходим к оплате…' : 'Отправляем заказ…')
                : t.count ? <>{online ? 'Оплатить' : 'Подтвердить заказ'} · <Num value={rub(view.total)} /></> : 'Подтвердить заказ'}
            </button>
            {online && <p className="co-hint" style={{ textAlign: 'center' }}>Оплата на защищённой странице ЮKassa</p>}
          </aside>
        </form>
      </div>
    </main>
  );
}
