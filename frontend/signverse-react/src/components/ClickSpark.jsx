import { useEffect, useRef } from 'react';

/* Little sparks burst out wherever you click. (React Bits "ClickSpark" style) */
export default function ClickSpark({ color = '#8b6df0', count = 9, size = 11, radius = 34, duration = 520 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let sparks = [], raf = 0;
    const fit = () => {
      const d = devicePixelRatio || 1;
      c.width = innerWidth * d; c.height = innerHeight * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const draw = now => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      sparks = sparks.filter(s => now - s.t0 < duration);
      for (const s of sparks) {
        const p = (now - s.t0) / duration, e = 1 - Math.pow(1 - p, 3);
        const d1 = e * radius, d2 = d1 + size * (1 - p);
        ctx.strokeStyle = color; ctx.globalAlpha = 1 - p; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x + d1 * Math.cos(s.a), s.y + d1 * Math.sin(s.a));
        ctx.lineTo(s.x + d2 * Math.cos(s.a), s.y + d2 * Math.sin(s.a));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };
    const click = e => {
      const t0 = performance.now();
      for (let i = 0; i < count; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 * i) / count, t0 });
      if (!raf) raf = requestAnimationFrame(draw);
    };
    fit();
    addEventListener('resize', fit); addEventListener('click', click);
    return () => { removeEventListener('resize', fit); removeEventListener('click', click); cancelAnimationFrame(raf); };
  }, [color, count, size, radius, duration]);
  return <canvas ref={ref} className="clickspark" aria-hidden="true" />;
}
