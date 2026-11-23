import { useEffect, useRef } from 'react';

/* Pulls its child gently towards the cursor when it gets close. (React Bits "Magnet" style) */
export default function Magnet({ children, padding = 70, strength = 3.2, block = false, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const move = e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const inside = Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding;
      el.style.transform = inside ? `translate(${dx / strength}px,${dy / strength}px)` : '';
    };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, [padding, strength]);
  return <div ref={ref} className={'magnet ' + (block ? 'block ' : '') + className}>{children}</div>;
}
