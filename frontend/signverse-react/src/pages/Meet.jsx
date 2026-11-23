import { useRef, useState } from 'react';
import BlurText from '../components/BlurText.jsx';
import Icon from '../components/Icon.jsx';
import Magnet from '../components/Magnet.jsx';
import { useApp } from '../lib/store.jsx';
import { go } from '../lib/router.js';
import { extractCode, genCode } from '../lib/util.js';

/* ---------- PAGE 3 : enter a code or link / start a new meeting ---------- */
export default function Meet() {
  const { state, update } = useApp();
  const [code, setCode] = useState('');
  const [hint, setHint] = useState(false);
  const row = useRef(null);
  const first = (state.user?.name || '').split(' ')[0];

  const join = e => {
    e.preventDefault();
    if (!code.trim()) {
      setHint(true);
      row.current.classList.remove('shake'); void row.current.offsetWidth; row.current.classList.add('shake');
      return;
    }
    update({ meeting: { code: extractCode(code), created: false }, comm: null });
    go('lobby');                                                    // -> PAGE 4
  };
  const create = () => { update({ meeting: { code: genCode(), created: true }, comm: null }); go('lobby'); };

  return (
    <section className="page page-center">
      <div className="meet">
        <h1 className="meet-title"><BlurText text={first ? `Hi ${first}, ready to sign?` : 'Ready to sign?'} delay={80} /></h1>
        <p className="meet-sub">Join a call with a code or link, or start a new one.</p>

        <form ref={row} className={'pill-row' + (code.trim() ? '' : ' empty')} onSubmit={join} noValidate>
          <Icon name="link" className="lead" />
          <input value={code} onChange={e => { setCode(e.target.value); setHint(false); }} placeholder="Enter a code or link" autoComplete="off" aria-label="Meeting code or link" />
          <button className="join-btn" type="submit">Join</button>
        </form>
        {hint && <p className="meet-hint" role="alert">Enter a meeting code or link first.</p>}

        <div className="or"><span>OR</span></div>

        <Magnet block strength={9} padding={20}>
          <button className="pill-row as-button" type="button" onClick={create}>
            <Icon name="phone" className="lead" />
            <span className="pill-text">Start a new meeting</span>
            <span className="join-btn">Join</span>
          </button>
        </Magnet>
      </div>
    </section>
  );
}
