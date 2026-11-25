import { useEffect, useRef } from 'react';
import Aurora from './components/Aurora.jsx';
import ClickSpark from './components/ClickSpark.jsx';
import Header from './components/Header.jsx';
import Landing from './pages/Landing.jsx';
import Meet from './pages/Meet.jsx';
import Lobby from './pages/Lobby.jsx';
import Call from './pages/Call.jsx';
import Learn from './pages/Learn.jsx';
import About from './pages/About.jsx';
import Community from './pages/Community.jsx';
import Modals from './components/Modals.jsx';
import { useRoute, go } from './lib/router.js';
import { useApp } from './lib/store.jsx';
import { Media } from './lib/media.js';
import { SignVerse } from './lib/signverse.js';
import { DEV, genCode, params } from './lib/util.js';

const KNOWN = ['', 'register', 'login', 'meet', 'lobby', 'call', 'community', 'learn', 'about'];
const NEEDS_USER = ['meet', 'lobby', 'call', 'community', 'learn', 'about'];
const IN_CALL = r => r === 'lobby' || r === 'call';

export default function App() {
  const raw = useRoute();
  const route = KNOWN.includes(raw) ? raw : '';
  const { state, update } = useApp();
  const prev = useRef(null);

  /* ---- guards: pages 3-5 need an account; 4-5 need a meeting; 5 needs a choice ---- */
  let redirect = null;
  if (NEEDS_USER.includes(route) && !state.user && !DEV) redirect = 'register';
  else if (IN_CALL(route) && !state.meeting && !DEV) redirect = 'meet';
  else if (route === 'call' && !state.comm && !DEV) redirect = 'lobby';

  useEffect(() => {
    if (redirect) { go(redirect); return; }
    if (DEV) {   // ?dev lets you open any page directly while testing
      if (!state.user && NEEDS_USER.includes(route)) update({ user: { name: 'Dev', email: '' } });
      if (!state.meeting && IN_CALL(route)) update({ meeting: { code: genCode() } });
      if (!state.comm && route === 'call') update({ comm: params.get('mode') === 'nosign' ? 'nosign' : 'sign' });
    }
  }, [redirect, route]);       // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- leaving lobby/call -> release camera & mic ---- */
  useEffect(() => {
    if (prev.current && IN_CALL(prev.current) && !IN_CALL(route)) { SignVerse.stop(); Media.stopAll(); }
    prev.current = route;
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    const f = () => Media.stopAll();
    addEventListener('beforeunload', f);
    return () => removeEventListener('beforeunload', f);
  }, []);

  if (redirect) return null;
  const view = route === '' || route === 'register' || route === 'login' ? 'public' : 'app';

  // DEV: wait one render for the placeholder state to be filled in
  if (DEV && ((NEEDS_USER.includes(route) && !state.user) || (IN_CALL(route) && !state.meeting) || (route === 'call' && !state.comm))) return null;

  return (
    <>
      <Aurora />
      <ClickSpark />
      <Header view={view} route={route} />
      <main key={route === 'register' || route === 'login' || route === '' ? 'landing' : route}>
        {view === 'public' && <Landing route={route} />}
        {route === 'meet' && <Meet />}
        {route === 'lobby' && <Lobby />}
        {route === 'call' && <Call />}
        {route === 'community' && <Community />}
        {route === 'learn' && <Learn />}
        {route === 'about' && <About />}
      </main>
      <Modals />
    </>
  );
}
