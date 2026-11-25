import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useApp } from '../lib/store.jsx';
import { go } from '../lib/router.js';
import { avatarBg, initialsOf } from '../lib/util.js';

const LINKS = [
  { label: 'Start Call', to: 'meet' },
  { label: 'Community', to: 'community' },
  { label: 'Learn Sign', to: 'learn' },
  { label: 'About', to: 'about' }
];
const ACTIVE = { meet: 0, lobby: 0, call: 0, community: 1, learn: 2, about: 3 };

export default function Header({ view, route }) {
  const { state, update, openModal } = useApp();
  const [hover, setHover] = useState(null);
  const [menu, setMenu] = useState(false);
  const [ind, setInd] = useState({ left: 0, width: 0 });
  const refs = useRef([]);
  const active = ACTIVE[route] ?? 0;
  const idx = hover ?? active;

  useLayoutEffect(() => {
    if (view !== 'app') return;
    const el = refs.current[idx];
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [idx, view]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    addEventListener('click', close);
    return () => removeEventListener('click', close);
  }, [menu]);

  const u = state.user || {};
  const open = m => { setMenu(false); openModal(m); };

  return (
    <header className="topbar">
      <a className="brand" href={state.user ? '#/meet' : '#/'} aria-label="SignVerse home">
        <img src="/assets/logo.png" alt="" className="brand-logo" />
        <span className="brand-name">Sign<em>Verse</em></span>
      </a>

      {view === 'app' ? (
        <nav className="nav" aria-label="Main" onMouseLeave={() => setHover(null)}>
          <span className="nav-ind" style={{ left: ind.left, width: ind.width }} />
          {LINKS.map((l, i) => (
            <a key={l.label} ref={el => (refs.current[i] = el)} href={'#/' + l.to}
               className={'nav-link' + (i === idx ? ' on' : '')} aria-current={i === active ? 'page' : undefined}
               onMouseEnter={() => setHover(i)}>
              {l.label}
            </a>
          ))}
        </nav>
      ) : <span />}

      <div className="topbar-right">
        {view === 'public' ? (
          <a className="btn btn-soft" href="#/register">Login / Register</a>
        ) : (
          <div className="profile-wrap" onClick={e => e.stopPropagation()}>
            <button className="profile" type="button" aria-label="Profile menu" aria-expanded={menu} style={{ background: avatarBg(u.color || 0) }} onClick={() => setMenu(m => !m)}>{initialsOf(u.name)}</button>
            {menu && (
              <div className="menu">
                <div className="menu-head">
                  <span className="profile sm" style={{ background: avatarBg(u.color || 0) }}>{initialsOf(u.name)}</span>
                  <div>
                    <b>{u.name || 'Guest'}{u.pronouns && u.pronouns !== 'Prefer not to say' ? <em> · {u.pronouns}</em> : null}</b>
                    {u.email && <small>{u.email}</small>}
                  </div>
                </div>
                <hr />
                <button type="button" onClick={() => open('profile')}><Icon name="person" size={20} />Manage profile</button>
                <button type="button" onClick={() => open('addprofile')}><Icon name="personAdd" size={20} />Add profile</button>
                <button type="button" onClick={() => open('help')}><Icon name="help" size={20} />Help / Customer support</button>
                <button type="button" onClick={() => open('settings')}><Icon name="gear" size={20} />Settings</button>
                <hr />
                <button type="button" className="danger" onClick={() => { update({ user: null, meeting: null, comm: null }); setMenu(false); go(''); }}><Icon name="logout" size={20} />Log out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
