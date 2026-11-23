/* Custom tick box (checkbox). */
export default function Tick({ checked, onChange, children, name, className = '' }) {
  return (
    <label className={'tick ' + className}>
      <input type="checkbox" name={name} checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="tick-box" aria-hidden="true" />
      <span className="tick-label">{children}</span>
    </label>
  );
}
