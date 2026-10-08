// Address → delivery zone checker (hero and zones section) — design.md §6.2, §6.10
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { PICKUP_ADDRESS } from '../../data/zones.js';
import { setZone } from '../../store/cart.js';
import { checkAddress, zoneMessage, saveAddress } from '../../lib/address.js';
import { EASE, isReduced } from '../../lib/scroll.js';

export function AddressCheck() {
  const id = useId();
  const input = useRef(null);
  const out = useRef(null);
  const [result, setResult] = useState(null); // { tone: 'ok' | 'bad', text, invalid? }
  const [checks, setChecks] = useState(0);

  // Each check re-announces itself visually: same element, so replay a short enter
  useLayoutEffect(() => {
    if (!checks) return;
    out.current.animate(
      isReduced()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: 'translateY(-4px)', filter: 'blur(2px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
      { duration: 250, easing: EASE.out },
    );
  }, [checks]);

  const onSubmit = (e) => {
    e.preventDefault();
    const value = input.current.value;
    const res = checkAddress(value);
    if (res.error) {
      setResult({ tone: 'bad', text: res.error, invalid: true });
      input.current.focus();
    } else if (res.out) {
      setResult({ tone: 'bad', text: `Сюда пока не доставляем, но можно забрать самовывозом на ${PICKUP_ADDRESS}` });
    } else {
      setResult({ tone: 'ok', text: `✓ ${zoneMessage(res.zone)} (${res.zone.name.toLowerCase()} зона)` });
      setZone(res.zone.id);
      saveAddress(value.trim());
    }
    setChecks((n) => n + 1);
  };

  return (
    <div className="address-check on-dark" data-address-check>
      <form noValidate onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={id}>Адрес доставки</label>
        <input
          ref={input} className="input" id={id} name="address" type="text" autoComplete="street-address"
          placeholder="Улица и дом" list="addr-suggest" aria-invalid={result?.invalid || undefined}
          onInput={() => result?.invalid && setResult(null)}
        />
        <button className="btn btn-primary" type="submit">Проверить адрес</button>
      </form>
      <p ref={out} className={`address-result${result ? ` ${result.tone}` : ''}`} aria-live="polite" data-address-result>{result?.text}</p>
    </div>
  );
}
