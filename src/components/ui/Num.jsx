import { useLayoutEffect, useRef } from 'react';
import { tickAnim } from '../../lib/motion.js';

/**
 * A value that rolls when it changes in place (quantities, prices, totals).
 * First render is static; later changes roll up when growing and down when shrinking.
 */
export function Num({ value, as: Tag = 'span', style, ...rest }) {
  const ref = useRef(null);
  const prev = useRef(value);
  useLayoutEffect(() => {
    if (prev.current === value) return;
    tickAnim(ref.current, prev.current, value);
    prev.current = value;
  }, [value]);
  return <Tag ref={ref} style={{ display: 'inline-block', ...style }} {...rest}>{value}</Tag>;
}
