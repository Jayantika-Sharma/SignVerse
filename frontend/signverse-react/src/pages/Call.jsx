import { useCallback, useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import CamVideo from '../components/CamVideo.jsx';
import Icon from '../components/Icon.jsx';
import { Media, useMediaVersion } from '../lib/media.js';
import { SignVerse, SignVerseConfig } from '../lib/signverse.js';
import { canSpeak, speak, stopSpeaking, useVoices } from '../lib/speech.js';
import { useApp } from '../lib/store.jsx';
import { go } from '../lib/router.js';
import { avatarBg, initialsOf, timeNow } from '../lib/util.js';

/* ---------- PAGE 5 : the call ---------- */
const fmtTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function Call() {
  const { state, update } = useApp();
  const v = useMediaVersion();
  const sign = state.comm === 'sign';
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const stageRef = useRef(null);

  const [signOn, setSignOn] = useState(true);
  const [ccOn, setCcOn] = useState(true);
  const [live, setLive] = useState('');
  const [pulse, setPulse] = useState(false);
  const [status, setStatus] = useState({ state: 'off', text: 'Detection not connected' });
  const [history, setHistory] = useState([]);
  const [secs, setSecs] = useState(0);
  const [panel, setPanel] = useState(false);          // speak-aloud settings popover
  const voices = useVoices();
  const [chatOpen, setChatOpen] = useState(false);
  const [people, setPeople] = useState(false);
  const [handUp, setHandUp] = useState(false);          // off until the user clicks it
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState('');
  const [unread, setUnread] = useState(0);
  const chatEnd = useRef(null);
  const me = state.user || {};
  const myName = me.name || 'You';

  const camLive = state.cam && Media.hasVideo();

  // keep the latest speech settings available to the long-lived caption listener
  const speechRef = useRef(state.speech);
  speechRef.current = state.speech;
  const setSpeech = patch => update(s => ({ speech: { ...s.speech, ...patch } }));

  /* ---- camera + mic (stream is shared with the lobby) ---- */
  useEffect(() => {
    (async () => {
      Media.setMic(state.mic);
      if (state.cam && !Media.hasVideo()) await Media.startVideo(state.devices.videoIn);
      if (!Media.hasAudio()) await Media.startAudio(state.devices.audioIn);
    })();
    const t0 = Date.now();
    const id = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => { clearInterval(id); stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- detector -> UI ---- */
  useEffect(() => {
    let hideT = 0, last = { text: '', t: 0 }, pulseT = 0;
    const offStatus = SignVerse.on('status', s => setStatus(s));
    const offCaption = SignVerse.on('caption', ({ text, final }) => {
      clearTimeout(hideT);
      if (!text) { setLive(''); return; }
      setLive(text);
      hideT = setTimeout(() => setLive(''), SignVerseConfig.captionTimeoutMs);
      setPulse(true); clearTimeout(pulseT); pulseT = setTimeout(() => setPulse(false), 900);
      const now = Date.now();
      if (final && (text !== last.text || now - last.t > 3000)) {
        setHistory(h => [...h, { id: now + Math.random(), text, time: fmtTime(new Date()) }]);
        const sp = speechRef.current;
        if (sp.on) speak(text, { voice: sp.voice, rate: sp.rate });          // SPEAK ALOUD
      }
      if (final) last = { text, t: now };
    });
    // optional hand boxes from your detector
    const offResult = SignVerse.on('result', r => drawBoxes(r));
    return () => { offStatus(); offCaption(); offResult(); clearTimeout(hideT); clearTimeout(pulseT); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- start / stop detection ---- */
  useEffect(() => {
    const el = videoRef.current;
    if (!sign || !signOn || !camLive || !el) { SignVerse.stop(); if (sign && !signOn) SignVerse.setStatus('paused', 'Detection paused'); return; }
    const begin = () => SignVerse.start(el);
    if (el.readyState >= 2) begin(); else el.addEventListener('loadeddata', begin, { once: true });
    return () => { el.removeEventListener('loadeddata', begin); SignVerse.stop(); };
  }, [sign, signOn, camLive, v]);

  /* ---- boxes overlay ---- */
  const boxT = useRef(0);
  const drawBoxes = useCallback(r => {
    const c = overlayRef.current, st = stageRef.current; if (!c || !st) return;
    const rect = st.getBoundingClientRect(), d = devicePixelRatio || 1;
    if (c.width !== Math.round(rect.width * d)) { c.width = rect.width * d; c.height = rect.height * d; }
    const ctx = c.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0);
    const W = rect.width, H = rect.height; ctx.clearRect(0, 0, W, H);
    clearTimeout(boxT.current);
    if (!r.boxes?.length) return;
    const vid = videoRef.current, vw = vid?.videoWidth || 16, vh = vid?.videoHeight || 9;
    const s = Math.min(W / vw, H / vh), dw = vw * s, dh = vh * s, ox = (W - dw) / 2, oy = (H - dh) / 2;
    ctx.lineWidth = 3; ctx.strokeStyle = '#8b6df0'; ctx.fillStyle = '#6a4bd6'; ctx.font = '600 14px sans-serif';
    r.boxes.forEach(b => {
      const x = ox + (1 - b.x - b.w) * dw, y = oy + b.y * dh;          // the video is mirrored on screen
      ctx.strokeRect(x, y, b.w * dw, b.h * dh);
      if (b.label) ctx.fillText(b.label, x + 4, y - 6);
    });
    boxT.current = setTimeout(() => ctx.clearRect(0, 0, W, H), 600);
  }, []);

  /* ---- buttons ---- */
  const toggleMic = () => { const on = !state.mic; update({ mic: on }); Media.setMic(on); };
  const toggleCam = async () => {
    const on = !state.cam; update({ cam: on });
    if (on) await Media.startVideo(state.devices.videoIn); else Media.stopVideo();
  };
  const toggleSpeak = () => {
    const on = !state.speech.on; setSpeech({ on });
    if (on) speak('Speak aloud is on', { voice: state.speech.voice, rate: state.speech.rate }); else stopSpeaking();
  };
  const leave = () => { SignVerse.stop(); Media.stopAll(); stopSpeaking(); update({ comm: null, meeting: null }); go('meet'); };
  const sendMsg = e => {
    e.preventDefault();
    const t = draft.trim(); if (!t) return;
    setMsgs(m => [...m, { id: Date.now() + Math.random(), text: t, time: timeNow() }]);
    setDraft('');
  };
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: 'end' }); }, [msgs, chatOpen]);
  useEffect(() => {
    if (!people) return;
    const close = () => setPeople(false);
    const k = e => e.key === 'Escape' && close();
    window.addEventListener('click', close); window.addEventListener('keydown', k);
    return () => { window.removeEventListener('click', close); window.removeEventListener('keydown', k); };
  }, [people]);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');

  return (
    <section className={'page page-call' + (sign || chatOpen ? '' : ' nosign')}>
      <div className="call-wrap">
        <div className="call-main">
          <div ref={stageRef} className={'stage' + (camLive ? '' : ' no-video') + (pulse ? ' pulse' : '')}>
            <CamVideo ref={videoRef} />
            <canvas ref={overlayRef} className="overlay" />
            <Avatar />
            <span className="badge">You</span>
            {handUp && <span className="hand-badge" aria-label="Your hand is raised"><Icon name="hand" size={22} /></span>}
            {sign && (
              <span className="status-chip" data-state={status.state}><i className="dot" /><span>{status.text}</span></span>
            )}
            {sign && ccOn && live && <div className="live-caption" key={live} aria-live="polite">{live}</div>}
          </div>

          <div className="call-bar">
            <span className="meta"><b>{state.meeting?.code}</b><span>{mm}:{ss}</span></span>
            <div className="bar-ctls">
              <button className="ctl round" type="button" aria-pressed={state.mic} aria-label={state.mic ? 'Turn off microphone' : 'Turn on microphone'} onClick={toggleMic}><Icon name={state.mic ? 'mic' : 'micOff'} /></button>
              <button className="ctl round" type="button" aria-pressed={state.cam} aria-label={state.cam ? 'Turn off camera' : 'Turn on camera'} onClick={toggleCam}><Icon name={state.cam ? 'cam' : 'camOff'} /></button>
              {sign && <>
                <button className="ctl round accent" type="button" aria-pressed={ccOn} aria-label="Toggle captions" title="Captions" onClick={() => setCcOn(c => !c)}><Icon name="cc" /></button>
                <button className="ctl round accent" type="button" aria-pressed={signOn} aria-label="Pause sign detection" title="Sign detection" onClick={() => setSignOn(s => !s)}><Icon name="scan" /></button>
                {canSpeak && <button className="ctl round accent" type="button" aria-pressed={state.speech.on} aria-label="Speak captions aloud" title="Speak aloud" onClick={toggleSpeak}><Icon name={state.speech.on ? 'speaker' : 'speakerOff'} /></button>}
              </>}
              <button className="ctl round accent" type="button" aria-pressed={handUp} aria-label={handUp ? 'Lower hand' : 'Raise hand'} title={handUp ? 'Lower hand' : 'Raise hand'} onClick={() => setHandUp(h => !h)}><Icon name="hand" /></button>
              <button className="ctl round end" type="button" aria-label="Leave call" onClick={leave}><Icon name="end" /></button>
            </div>
            <div className="meta-right">
              <div className="people-wrap" onClick={e => e.stopPropagation()}>
                <button className="ctl mini" type="button" aria-label="Participants" aria-expanded={people} title="Participants" onClick={() => setPeople(p => !p)}>
                  <Icon name="people" size={22} /><span className="count">1</span>
                </button>
                {people && (
                  <div className="people-pop glass" role="dialog" aria-label="Participants">
                    <h4>People <small>(1)</small></h4>
                    <ul>
                      <li>
                        <span className="profile sm" style={{ background: avatarBg(me.color || 0) }}>{initialsOf(myName)}</span>
                        <span className="pname">{myName} <em>(You)</em></span>
                        {handUp && <span className="raised" title="Hand raised"><Icon name="hand" size={20} /></span>}
                        <Icon name={state.mic ? 'mic' : 'micOff'} size={18} />
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <button className="ctl mini" type="button" data-on={chatOpen} aria-label={chatOpen ? 'Close chat' : 'Open chat'} title="Chat" onClick={() => { setChatOpen(o => !o); setUnread(0); }}>
                <Icon name="chat" size={22} />{unread > 0 && !chatOpen && <span className="count">{unread}</span>}
              </button>
            </div>
          </div>
        </div>

        {(sign || chatOpen) && (
        <div className={'side-col' + (sign && chatOpen ? ' split' : '')}>
        {sign && (
          <aside className="cap-panel glass">
            <div className="cap-head">
              <h3>Live captions</h3>
              {canSpeak && (
                <div className="speak-ctl">
                  <label className="switch-row" title="Read new captions out loud">
                    <span>Speak aloud</span>
                    <button type="button" role="switch" aria-checked={state.speech.on} className={'switch' + (state.speech.on ? ' on' : '')} onClick={toggleSpeak}><i /></button>
                  </label>
                  <button type="button" className={'gear' + (panel ? ' on' : '')} aria-label="Voice settings" aria-expanded={panel} onClick={() => setPanel(p => !p)}><Icon name="gear" size={20} /></button>
                </div>
              )}
            </div>

            {panel && canSpeak && (
              <div className="voice-panel">
                <label>Voice
                  <select value={state.speech.voice} onChange={e => setSpeech({ voice: e.target.value })}>
                    <option value="">Default voice</option>
                    {voices.map(vc => <option key={vc.voiceURI} value={vc.voiceURI}>{vc.name} ({vc.lang})</option>)}
                  </select>
                </label>
                <label>Speed <b>{state.speech.rate.toFixed(1)}×</b>
                  <input type="range" min="0.5" max="2" step="0.1" value={state.speech.rate} onChange={e => setSpeech({ rate: +e.target.value })} />
                </label>
                <button type="button" className="btn btn-soft btn-sm" onClick={() => speak('Hello, this is how I will sound.', { voice: state.speech.voice, rate: state.speech.rate })}>
                  <Icon name="play" size={16} /> Test voice
                </button>
              </div>
            )}

            {history.length === 0 && <p className="empty">Signs you make will appear here as text.</p>}
            <ol className="cap-list" ref={el => { if (el) el.scrollTop = el.scrollHeight; }}>
              {history.map(h => (
                <li key={h.id}>
                  <div>
                    <small>{h.time}</small>
                    <span>{h.text}</span>
                  </div>
                  {canSpeak && (
                    <button type="button" className="say" aria-label={`Speak: ${h.text}`} title="Speak this" onClick={() => speak(h.text, { voice: state.speech.voice, rate: state.speech.rate })}>
                      <Icon name="speaker" size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </aside>
        )}
        {chatOpen && (
          <aside className="chat-panel glass" aria-label="In-call messages">
            <div className="cap-head">
              <h3>Chat</h3>
              <button type="button" className="gear" aria-label="Close chat" onClick={() => setChatOpen(false)}><Icon name="close" size={20} /></button>
            </div>
            <p className="chat-note">Messages are only visible to people in the call.</p>
            <div className="chat-list">
              {msgs.length === 0 && <p className="empty">No messages yet. Say hi!</p>}
              {msgs.map(m => (
                <div className="msg" key={m.id}>
                  <div className="msg-head"><b>You</b><small>{m.time}</small></div>
                  <div className="bubble">{m.text}</div>
                </div>
              ))}
              <span ref={chatEnd} />
            </div>
            <form className="chat-form" onSubmit={sendMsg}>
              <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Send a message" aria-label="Message" maxLength={500} />
              <button type="submit" className="say" aria-label="Send" disabled={!draft.trim()}><Icon name="send" size={18} /></button>
            </form>
          </aside>
        )}
        </div>
        )}
      </div>
    </section>
  );
}
