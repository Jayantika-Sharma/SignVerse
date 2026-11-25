import { useEffect, useRef } from 'react';

/* Soft drifting colour clouds + a glow that follows the cursor. (React Bits "Aurora" style) */
export default function Aurora() {
  const glow = useRef(null);
  useEffect(() => {
    let x = innerWidth / 2, y = innerHeight / 3, tx = x, ty = y, raf = 0;
    const move = e => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.07; y += (ty - y) * 0.07;
      if (glow.current) glow.current.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', move);
    loop();
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="aurora" aria-hidden="true">
      <i className="blob b1" /><i className="blob b2" /><i className="blob b3" /><i className="blob b4" />
      <div className="dotgrid" />
      <div ref={glow} className="aurora-glow" />
    </div>
  );
}
