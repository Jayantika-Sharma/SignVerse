/* 3D tilt that follows the cursor. (React Bits "TiltedCard" style) */
export default function TiltCard({ children, max = 10, className = '' }) {
  const move = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(700px) rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg)`;
  };
  const leave = e => { e.currentTarget.style.transform = ''; };
  return <div className={'tilt ' + className} onPointerMove={move} onPointerLeave={leave}>{children}</div>;
}
