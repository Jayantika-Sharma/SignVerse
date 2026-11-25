import { useEffect, useRef, useState } from 'react';
import FloatingHands from '../components/FloatingHands.jsx';
import BlurText from '../components/BlurText.jsx';
import ShinyText from '../components/ShinyText.jsx';
import TiltCard from '../components/TiltCard.jsx';
import Magnet from '../components/Magnet.jsx';
import SpotlightCard from '../components/SpotlightCard.jsx';
import Tick from '../components/Tick.jsx';
import Icon from '../components/Icon.jsx';
import { useApp } from '../lib/store.jsx';
import { go } from '../lib/router.js';
import { EMAIL_RE } from '../lib/util.js';
import { SignVerseAPI } from '../lib/signverse.js';

/* ---------- PAGE 1 : hero ---------- */
// each phrase has its own hand picture so the sign changes together with the caption
const DEMO = [
  { text: 'Hello, nice to meet you', hand: 1 },
  { text: 'Thank you so much', hand: 2 },
  { text: 'How are you today?', hand: 3 },
  { text: 'Let’s start the call', hand: 5 }
];

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(n => (n + 1) % DEMO.length), 3400); return () => clearInterval(t); }, []);
  return (
    <div className="hero" data-avoid>
      <TiltCard max={9} className="hero-logo-wrap">
        <div className="hero-halo" />
        <img className="hero-logo" src="/assets/logo.png" alt="SignVerse logo" />
      </TiltCard>
      <h1 className="wordmark"><BlurText text="SignVerse" by="letters" delay={70} /></h1>
      <p className="tagline"><ShinyText text="Bridging Sign Language and Digital Conversation" /></p>

      <div className="cap-demo" aria-hidden="true">
        <img key={'h' + i} className="cap-hand" src={`/assets/hands/hand-${DEMO[i].hand}.png`} alt="" />
        <span className="arrow">→</span>
        <BlurText key={i} text={DEMO[i].text} delay={60} className="cap-demo-text" />
      </div>

      <div className="hero-cta">
        <Magnet><a className="btn btn-primary btn-lg" href="#/register">Get started</a></Magnet>
        <a className="link-quiet" href="#/login">I already have an account</a>
      </div>
    </div>
  );
}

/* ---------- PAGE 2 : create account / log in ---------- */
function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s;
}

function AuthCard({ mode }) {
  const { update, toast } = useApp();
  const reg = mode === 'register';
  const [v, setV] = useState({ first: '', last: '', email: '', password: '', terms: false });
  const [err, setErr] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const card = useRef(null);

  useEffect(() => { setErr({}); }, [mode]);

  const check = vals => {
    const e = {};
    if (reg && !vals.first.trim()) e.first = 'Please enter your first name';
    if (reg && !vals.last.trim()) e.last = 'Please enter your last name';
    const email = vals.email.trim();
    if (!email) e.email = 'Please enter your email';
    else if (!EMAIL_RE.test(email)) e.email = 'Enter a valid email address (e.g. name@example.com)';
    if (!vals.password) e.password = 'Please enter a password';
    else if (reg && vals.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (reg && !vals.terms) e.terms = 'Please accept the Terms & Conditions';
    return e;
  };
  const set = (k, val) => {
    const next = { ...v, [k]: val };
    setV(next);
    if (Object.keys(err).length) setErr(check(next));          // live re-check once something was flagged
  };
  const shake = () => { const c = card.current; c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); };

  const finish = async promise => {
    setBusy(true);
    try {
      const res = await promise;
      if (!res.ok) throw new Error(res.error || 'Something went wrong');
      update({ user: res.user });
      go('meet');                                                 // -> PAGE 3
    } catch (e) { toast(e.message); } finally { setBusy(false); }
  };
  const submit = e => {
    e.preventDefault();
    const errs = check(v); setErr(errs);
    if (Object.keys(errs).length) { shake(); return; }
    finish(reg
      ? SignVerseAPI.register({ first: v.first.trim(), last: v.last.trim(), email: v.email.trim(), password: v.password })
      : SignVerseAPI.login({ email: v.email.trim(), password: v.password }));
  };

  const Field = ({ name, type = 'text', placeholder, auto, extra }) => (
    <div className={'field' + (err[name] ? ' invalid' : '')}>
      <div className="input-wrap">
        <input name={name} type={type} placeholder={placeholder} autoComplete={auto} value={v[name]}
               onChange={e => set(name, e.target.value)} aria-invalid={!!err[name]} />
        {extra}
      </div>
      {err[name] && <span className="err" role="alert">{err[name]}</span>}
    </div>
  );
  const pw = strength(v.password);

  return (
    <SpotlightCard className="auth-card" data-avoid>
      <div ref={card} className="auth-inner">
        <h2><BlurText key={mode} text={reg ? 'Create an account' : 'Welcome back'} delay={80} /></h2>
        <p className="auth-switch">
          {reg ? <>Already have an account? <a href="#/login">Log in</a></> : <>New to SignVerse? <a href="#/register">Register</a></>}
        </p>

        <form onSubmit={submit} noValidate>
          {reg && (
            <div className="row2">
              {Field({ name: 'first', placeholder: 'First Name', auto: 'given-name' })}
              {Field({ name: 'last', placeholder: 'Last Name', auto: 'family-name' })}
            </div>
          )}
          {Field({ name: 'email', type: 'email', placeholder: 'Email', auto: 'email' })}
          {Field({
            name: 'password', type: showPw ? 'text' : 'password', placeholder: 'Password', auto: reg ? 'new-password' : 'current-password',
            extra: <button type="button" className="eye" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(s => !s)}><Icon name={showPw ? 'eyeOff' : 'eye'} size={20} /></button>
          })}
          {reg && v.password && (
            <div className="meter" aria-hidden="true">{[0, 1, 2, 3].map(n => <i key={n} className={n < pw ? 'on s' + pw : ''} />)}</div>
          )}

          {reg && (
            <div className={'field' + (err.terms ? ' invalid' : '')}>
              <Tick checked={v.terms} onChange={c => set('terms', c)} name="terms">
                I agree to <a href="#" className="inline-link" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>Terms &amp; Conditions</a>.
              </Tick>
              {err.terms && <span className="err" role="alert">{err.terms}</span>}
            </div>
          )}

          <Magnet block strength={6} padding={30}>
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              <ShinyText text={busy ? 'Please wait…' : reg ? 'Register' : 'Log in'} speed={4} className="on-dark" />
            </button>
          </Magnet>
        </form>

        <div className="divider"><span>{reg ? 'or register with' : 'or log in with'}</span></div>
        <div className="social">
          <button type="button" className="btn btn-ghost" onClick={() => finish(SignVerseAPI.oauth('google'))}><Icon name="google" size={20} />Google</button>
          <button type="button" className="btn btn-ghost" onClick={() => finish(SignVerseAPI.oauth('apple'))}><Icon name="apple" size={20} />Apple</button>
        </div>
      </div>
    </SpotlightCard>
  );
}

export default function Landing({ route }) {
  const form = route === 'register' || route === 'login';
  return (
    <section className="page page-landing">
      <FloatingHands conflictKey={form ? route : 'hero'} />
      {form ? <AuthCard key={route} mode={route} /> : <Hero />}
    </section>
  );
}
