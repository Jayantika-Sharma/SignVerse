import { useCallback, useEffect, useMemo, useState } from 'react';
import AslHand from '../components/AslHand.jsx';
import BlurText from '../components/BlurText.jsx';
import Icon from '../components/Icon.jsx';
import Magnet from '../components/Magnet.jsx';
import { LETTERS } from '../lib/asl.js';

/* ---------- LEARN SIGN : ASL alphabet cue cards ---------- */
const KEY = 'sv_learned';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

export default function Learn() {
  const [order, setOrder] = useState(() => LETTERS.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dir, setDir] = useState(1);
  const [learned, setLearned] = useState(load);
  const shuffled = order.some((v, i) => v !== i);
  const L = LETTERS[order[pos]];

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(learned)); } catch { /* ignore */ } }, [learned]);

  const go = useCallback(d => { setDir(d); setFlipped(false); setPos(p => (p + d + LETTERS.length) % LETTERS.length); }, []);
  const jump = i => { setDir(i > pos ? 1 : -1); setFlipped(false); setPos(i); };
  const flip = useCallback(() => setFlipped(f => !f), []);
  const toggleKnown = () => setLearned(l => (l.includes(L.ch) ? l.filter(x => x !== L.ch) : [...l, L.ch]));
  const shuffle = () => {
    if (shuffled) setOrder(LETTERS.map((_, i) => i));
    else setOrder(o => { const a = [...o]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
    setPos(0); setFlipped(false);
  };

  useEffect(() => {
    const k = e => {
      if (e.target.closest?.('input,textarea,select')) return;
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ' || e.key === 'Enter') { if (!e.target.closest?.('button,a')) { e.preventDefault(); flip(); } }
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [go, flip]);

  const pct = Math.round((learned.length / LETTERS.length) * 100);
  const strip = useMemo(() => order.map((idx, i) => ({ ...LETTERS[idx], i })), [order]);
  const known = learned.includes(L.ch);

  return (
    <section className="page page-learn">
      <div className="learn">
        <h1 className="page-title"><BlurText text="Learn the ASL alphabet" delay={80} /></h1>
        <p className="page-sub">Tap a card to flip it and see how to sign each letter.</p>

        <div className="progress" aria-label={`${learned.length} of 26 letters learned`}>
          <div className="bar"><i style={{ width: pct + '%' }} /></div>
          <span><b>{learned.length}</b> / 26 learned</span>
        </div>

        <div className="deck-row">
          <button type="button" className="arrow-btn" aria-label="Previous letter" onClick={() => go(-1)}><Icon name="left" size={28} /></button>

          <div className="deck">
            <div className="deck-back b1" /><div className="deck-back b2" />
            <div key={pos} className={'card-slot ' + (dir > 0 ? 'from-r' : 'from-l')}>
              <div className={'flipcard' + (flipped ? ' flipped' : '')} onClick={flip} role="button" tabIndex={0} aria-label={flipped ? `Letter ${L.ch} – how to sign it` : `Letter ${L.ch} – tap to flip`}
                   onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } }}>
                <div className="face front">
                  <span className="counter">{pos + 1} / 26</span>
                  <span className="big-letter">{L.ch}</span>
                  <span className="flip-hint"><Icon name="flip" size={18} />Tap to see the sign</span>
                </div>
                <div className="face back">
                  <span className="mini-letter">{L.ch}</span>
                  <div className="hand-box"><AslHand shape={L.s} /></div>
                  <p className="how">{L.tip}</p>
                  <span className="simplified">Simplified drawing</span>
                </div>
              </div>
            </div>
          </div>

          <button type="button" className="arrow-btn" aria-label="Next letter" onClick={() => go(1)}><Icon name="right" size={28} /></button>
        </div>

        <div className="learn-actions">
          <Magnet strength={6}>
            <button type="button" className={'btn ' + (known ? 'btn-primary' : 'btn-soft')} onClick={toggleKnown}>
              <Icon name="check" size={20} />{known ? 'You know this!' : 'I know this'}
            </button>
          </Magnet>
          <button type="button" className={'btn btn-soft' + (shuffled ? ' on' : '')} onClick={shuffle}><Icon name="shuffle" size={20} />{shuffled ? 'Back to A–Z' : 'Shuffle'}</button>
        </div>

        <div className="strip" role="list">
          {strip.map(c => (
            <button key={c.ch} type="button" role="listitem" className={'chip-l' + (c.i === pos ? ' cur' : '') + (learned.includes(c.ch) ? ' done' : '')}
                    style={{ animationDelay: c.i * 28 + 'ms' }} onClick={() => jump(c.i)} aria-label={`Letter ${c.ch}`}>
              {c.ch}
            </button>
          ))}
        </div>
        <p className="kbd-hint">Tip: use the ← → keys to move and Space to flip.</p>
      </div>
    </section>
  );
}
