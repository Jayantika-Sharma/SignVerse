/* Simplified hand drawing for the ASL cards (built from the recipe in lib/asl.js). */
const SKIN = '#f6edff', SKIN_D = '#e7d8ff', LINE = '#6a4bd6', W = 2.2;
const X = [40, 55, 70, 84];             // finger centres
const LEN = [50, 56, 50, 40];           // finger lengths
const BASE = 74;

function Cap({ x, y, w, h, fill = SKIN, rot = 0, cx = 0, cy = 0, r }) {
  return <rect x={x} y={y} width={w} height={h} rx={r ?? Math.min(w, h) / 2} fill={fill} stroke={LINE} strokeWidth={W} transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined} />;
}

function Finger({ i, state, angle = 0 }) {
  const cx = X[i], len = LEN[i];
  const t = angle ? `rotate(${angle} ${cx} ${BASE})` : undefined;
  if (state === 'u') return <g transform={t}><Cap x={cx - 6.5} y={BASE - len} w={13} h={len + 8} /></g>;
  if (state === 'h') return (
    <g transform={t}>
      <Cap x={cx - 6.5} y={BASE - len * 0.52} w={13} h={len * 0.52 + 8} />
      <circle cx={cx} cy={BASE - len * 0.52 + 1} r={7} fill={SKIN_D} stroke={LINE} strokeWidth={W} />
    </g>
  );
  return <Cap x={cx - 6.5} y={62} w={13} h={24} fill={SKIN_D} />;          // folded: knuckle bump
}

function Thumb({ kind, over }) {
  const cap = (x, y, w, h, rot, rx, ry, fill = SKIN) => <Cap x={x} y={y} w={w} h={h} rot={rot} cx={rx} cy={ry} fill={fill} />;
  switch (kind) {
    case 'out':    return cap(30, 66, 13, 42, -62, 36, 108);
    case 'up':     return cap(21, 64, 13, 44, -3, 28, 108);
    case 'across': return cap(26, 84, 52, 13, -6, 52, 90);
    case 'between':return cap(30, 78, 30, 13, -22, 40, 85);
    case 'tuck':
      return <>
        {cap(30, 88, 22, 13, 0, 40, 94, SKIN_D)}
        {over ? Array.from({ length: over }, (_, k) => <path key={k} d={`M ${36 + k * 11} 74 q 5 12 0 26`} fill="none" stroke={LINE} strokeWidth={1.8} strokeLinecap="round" />) : null}
      </>;
    default: return null;
  }
}

function Ring({ kind }) {
  const ring = (cx, cy, r, opening) => (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={LINE} strokeWidth={15} strokeDasharray={opening ? `${2 * Math.PI * r * 0.72} 999` : undefined} strokeDashoffset={opening ? -2 * Math.PI * r * 0.14 : undefined} strokeLinecap="round" transform={opening ? `rotate(180 ${cx} ${cy})` : undefined} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={SKIN} strokeWidth={11} strokeDasharray={opening ? `${2 * Math.PI * r * 0.72} 999` : undefined} strokeDashoffset={opening ? -2 * Math.PI * r * 0.14 : undefined} strokeLinecap="round" transform={opening ? `rotate(180 ${cx} ${cy})` : undefined} />
    </>
  );
  if (kind === 'o') return ring(60, 56, 26, false);
  if (kind === 'c') return ring(58, 56, 28, true);
  if (kind === 'd') return ring(66, 96, 13, false);
  if (kind === 'f') return ring(40, 84, 12, false);
  return null;
}

export default function AslHand({ shape, className = '' }) {
  const { f = '', t = 'none', a = [0, 0, 0, 0], rot = 0, ring, over, move } = shape;
  const fingers = ring === 'o' || ring === 'c' ? [] : f.split('');
  // draw the "down" fingers first so raised fingers stay in front
  const order = [0, 1, 2, 3].sort((p, q) => (fingers[p] === 'd' ? 0 : 1) - (fingers[q] === 'd' ? 0 : 1));
  return (
    <svg className={'asl-hand ' + className} viewBox="0 0 120 150" role="img" aria-hidden="true">
      <g transform={rot ? `rotate(${rot} 60 80)` : undefined}>
        <Cap x={44} y={106} w={32} h={42} r={9} fill={SKIN_D} />                    {/* wrist */}
        <Cap x={28} y={64} w={62} h={56} r={20} />                                   {/* palm */}
        {order.map(i => fingers[i] && <Finger key={i} i={i} state={fingers[i]} angle={a[i]} />)}
        <Thumb kind={t} over={over} />
        <Ring kind={ring} />
      </g>
      {move === 'J' && (
        <path className="move" d="M96 28 L96 70 Q96 96 70 98" fill="none" stroke="#ff7ab8" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 8" />
      )}
      {move === 'Z' && (
        <path className="move" d="M28 26 L94 26 L28 78 L94 78" fill="none" stroke="#ff7ab8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 8" />
      )}
    </svg>
  );
}
