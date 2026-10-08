// [+] → stepper morph with fly-to-cart — design.md §6.6, §8
import { useEffect, useLayoutEffect, useRef } from 'react';
import { add, decrement } from '../../store/cart.js';
import { useQty } from '../../hooks/useCart.js';
import { flyToCart, fromKeyboard } from '../../lib/motion.js';
import { quote } from '../../lib/format.js';
import { Icon } from './Icon.jsx';
import { Num } from './Num.jsx';

/**
 * Add button that becomes a stepper once the dish is in the cart.
 * The swap blurs/scales in via CSS @starting-style, but only for a real switch — never on the
 * first paint of a list. Focus follows the swap so keyboard users stay on the control.
 */
export function AddSlot({ dish, variant = 'icon' }) {
  const qty = useQty(dish.id);
  const ref = useRef(null);
  const mounted = useRef(false);
  const refocus = useRef(false);
  const inCart = qty > 0;
  const name = quote(dish.name);

  useEffect(() => { mounted.current = true; }, []);
  useLayoutEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    ref.current.querySelector(inCart ? '[data-inc]' : '[data-add]')?.focus();
  }, [inCart]);

  const keepFocus = () => { refocus.current = ref.current.contains(document.activeElement); };
  const onAdd = (e) => {
    keepFocus();
    if (!fromKeyboard(e)) flyToCart(e.currentTarget.closest('[data-dish]')?.querySelector('img'));
    add(dish.id);
  };
  const onDec = () => {
    if (qty === 1) keepFocus();
    decrement(dish.id);
  };

  return (
    <div ref={ref} className="add-slot" data-add-slot={dish.id} data-variant={variant} data-morph={mounted.current ? '' : undefined}>
      {inCart ? (
        <div className="stepper" role="group" aria-label={`Количество ${name}`}>
          <button type="button" data-dec={dish.id} aria-label="Убрать одну" onClick={onDec}>−</button>
          <Num as="output" value={qty} />
          <button type="button" data-inc={dish.id} aria-label="Добавить ещё" onClick={() => add(dish.id)}>+</button>
        </div>
      ) : variant === 'label' ? (
        <button className="btn btn-primary" type="button" data-add={dish.id} aria-label={`Добавить ${name} в корзину`} onClick={onAdd}>В корзину</button>
      ) : (
        <button className="icon-btn" type="button" data-add={dish.id} aria-label={`Добавить ${name} в корзину`} onClick={onAdd}><Icon name="plus" /></button>
      )}
    </div>
  );
}
