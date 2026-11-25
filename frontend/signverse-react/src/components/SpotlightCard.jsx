/* A card with a soft spotlight that follows the cursor. (React Bits "SpotlightCard" style) */
export default function SpotlightCard({ children, className = '', color = 'rgba(167,139,250,.28)', ...rest }) {
  const move = e => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px');
    e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px');
  };
  return (
    <div className={'spot ' + className} onPointerMove={move} style={{ '--spot': color }} {...rest}>
      {children}
    </div>
  );
}
