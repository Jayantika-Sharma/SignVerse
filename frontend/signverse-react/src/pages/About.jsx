import { useEffect, useRef } from 'react';
import BlurText from '../components/BlurText.jsx';
import Icon from '../components/Icon.jsx';
import Magnet from '../components/Magnet.jsx';
import SpotlightCard from '../components/SpotlightCard.jsx';

/* ---------- ABOUT : a scroll story ---------- */
function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={'reveal ' + className} style={{ '--rd': delay + 'ms' }}>{children}</Tag>;
}

const STEPS = [
  { icon: 'cam', title: 'You sign', text: 'Turn on your camera and sign naturally, just like you would face to face.' },
  { icon: 'scan', title: 'SignVerse watches', text: 'Your hands are followed in real time, right in your browser window.' },
  { icon: 'cc', title: 'Words appear', text: 'What you sign shows up instantly as live captions for everyone in the call.' },
  { icon: 'speaker', title: 'Or is spoken', text: 'Turn on Speak aloud and captions are read out loud for people who prefer to listen.' }
];
const VALUES = [
  { n: '01', title: 'Everyone belongs', text: 'A call should feel the same whether you sign, speak or type. No one has to adapt to the room.' },
  { n: '02', title: 'Signing is a language', text: 'Sign languages are rich, complete languages with their own grammar and culture, and we treat them that way.' },
  { n: '03', title: 'Technology should listen', text: 'We build tools that meet people where they are, instead of asking people to change how they communicate.' }
];
const CAPS = ['Hello!', 'Nice to meet you', 'Thank you so much', 'How are you today?', 'Can you see me clearly?', 'Let’s start the meeting', 'I would like to ask a question', 'See you tomorrow', 'That makes sense', 'Welcome everyone'];

export default function About() {
  return (
    <section className="page page-about">
      {/* ---- 1. hero with orbiting hands ---- */}
      <div className="ab-hero">
        <div className="orbit-wrap" aria-hidden="true">
          <div className="orbit o1">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <div key={n} className="orb-hand" style={{ '--a': i * 72 + 'deg' }}>
                <img src={`/assets/hands/hand-${n}.png`} alt="" />
              </div>
            ))}
          </div>
          <div className="ring r1" /><div className="ring r2" />
          <img className="ab-logo" src="/assets/logo.png" alt="" />
        </div>
        <h1 className="ab-title"><BlurText text="Conversations without barriers" delay={90} /></h1>
        <p className="ab-lead">SignVerse is a video-call space built for people who sign. Your signs become words on screen, so everyone in the call can follow along.</p>
        <div className="scroll-cue" aria-hidden="true"><i /><span>Scroll to explore</span></div>
      </div>

      {/* ---- 2. how it works ---- */}
      <div className="ab-block">
        <Reveal as="h2" className="ab-h2">How it works</Reveal>
        <div className="pipeline">
          <div className="pipe-line"><i /></div>
          {STEPS.map((s, i) => (
            <Reveal key={s.title} className="pipe-step" delay={i * 160}>
              <div className="pipe-node"><Icon name={s.icon} size={30} /><span>{i + 1}</span></div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ---- 3. what we believe ---- */}
      <div className="ab-block">
        <Reveal as="h2" className="ab-h2">What we believe</Reveal>
        <div className="values">
          {VALUES.map((v, i) => (
            <Reveal key={v.n} delay={i * 140} className="val-wrap">
              <SpotlightCard className="val" style={{ '--bob': i * 0.8 + 's' }}>
                <span className="val-n">{v.n}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ---- 4. captions ribbon ---- */}
      <div className="ribbon" aria-hidden="true">
        {[0, 1].map(row => (
          <div key={row} className={'ribbon-row' + (row ? ' rev' : '')}>
            <div className="ribbon-track">
              {[...CAPS, ...CAPS].map((c, i) => <span key={i} className="cap-bubble">{c}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* ---- 5. call to action ---- */}
      <Reveal className="ab-cta">
        <h2>Ready to talk?</h2>
        <p>Start a call, or learn the ASL alphabet first.</p>
        <div className="cta-row">
          <Magnet><a className="btn btn-primary btn-lg" href="#/meet">Start a call</a></Magnet>
          <a className="btn btn-soft btn-lg" href="#/learn">Learn Sign</a>
        </div>
      </Reveal>
    </section>
  );
}
