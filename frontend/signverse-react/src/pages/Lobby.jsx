import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import CamVideo from '../components/CamVideo.jsx';
import Icon from '../components/Icon.jsx';
import Magnet from '../components/Magnet.jsx';
import ShinyText from '../components/ShinyText.jsx';
import Tick from '../components/Tick.jsx';
import { Media, useMediaVersion } from '../lib/media.js';
import { useApp } from '../lib/store.jsx';
import { go } from '../lib/router.js';
import { SignVerseAPI } from '../lib/signverse.js';

/* ---------- PAGE 4 : camera preview + how will you communicate ---------- */
function DeviceSelect({ icon, label, items, value, onChange, fallback }) {
  return (
    <label className="dev">
      <Icon name={icon} className="d-ico" />
      <select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>
        {items.length === 0 && <option value="">{fallback || label}</option>}
        {items.map((d, i) => <option key={d.deviceId || i} value={d.deviceId}>{d.label || `${label} ${i + 1}`}</option>)}
      </select>
      <Icon name="chevron" className="d-chev" />
    </label>
  );
}

export default function Lobby() {
  const { state, update, toast } = useApp();
  const v = useMediaVersion();
  const [list, setList] = useState([]);
  const [hint, setHint] = useState(false);
  const [asking, setAsking] = useState(false);
  const levelRef = useRef(null);
  const boxRef = useRef(null);

  const refresh = async () => setList(await Media.devices());

  useEffect(() => {
    let live = true;
    (async () => {
      Media.setMic(state.mic);
      if (state.cam) await Media.startVideo(state.devices.videoIn);
      await Media.startAudio(state.devices.audioIn);
      if (live) refresh();                           // device names only appear after permission
    })();
    const off = Media.onLevel(l => levelRef.current?.style.setProperty('--lvl', l.toFixed(2)));
    navigator.mediaDevices?.addEventListener?.('devicechange', refresh);
    return () => { live = false; off(); navigator.mediaDevices?.removeEventListener?.('devicechange', refresh); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const camLive = state.cam && Media.hasVideo();
  const of = kind => list.filter(d => d.kind === kind);
  const pickDev = (key, items) => (items.some(d => d.deviceId === state.devices[key]) ? state.devices[key] : items[0]?.deviceId || '');

  const toggleMic = () => { const on = !state.mic; update({ mic: on }); Media.setMic(on); };
  const toggleCam = async () => {
    const on = !state.cam; update({ cam: on });
    if (on) await Media.startVideo(state.devices.videoIn); else Media.stopVideo();
  };
  const setDevice = async (key, id) => {
    update(s => ({ devices: { ...s.devices, [key]: id } }));
    if (key === 'audioIn') { Media.stopAudio(); await Media.startAudio(id); }
    if (key === 'videoIn' && state.cam) { Media.stopVideo(); await Media.startVideo(id); }
  };
  const choose = (val, on) => { update({ comm: on ? val : null }); setHint(false); };

  const askToJoin = async () => {
    if (!state.comm) {
      setHint(true);
      const b = boxRef.current; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      return;
    }
    setAsking(true);
    try {
      const res = await SignVerseAPI.askToJoin(state.meeting.code);
      if (!res.ok) throw new Error(res.error || 'Could not join');
      go('call');                                                   // -> PAGE 5
    } catch (e) { toast(e.message); setAsking(false); }
  };

  const camMsg = Media.camError && state.cam
    ? (Media.camError.name === 'NotAllowedError' ? 'Camera is blocked. Allow camera access in your browser address bar.' : 'Camera unavailable: ' + (Media.camError.message || Media.camError.name))
    : '';

  return (
    <section className="page page-center">
      <div className="lobby-card glass">
        <div className="lobby-left">
          <div className={'preview' + (camLive ? '' : ' no-video')} data-v={v}>
            <CamVideo />
            <Avatar />
            {camMsg && <p className="cam-msg">{camMsg}</p>}
            <div className="preview-ctls">
              <button className="ctl" type="button" aria-pressed={state.mic} aria-label={state.mic ? 'Turn off microphone' : 'Turn on microphone'} onClick={toggleMic}>
                <Icon name={state.mic ? 'mic' : 'micOff'} />
              </button>
              <button className="ctl" type="button" aria-pressed={state.cam} aria-label={state.cam ? 'Turn off camera' : 'Turn on camera'} onClick={toggleCam}>
                <Icon name={state.cam ? 'cam' : 'camOff'} />
              </button>
              <span ref={levelRef} className="ctl level" title="Microphone level"><Icon name="dots" /></span>
            </div>
          </div>

          <div className="devices">
            <DeviceSelect icon="mic" label="Microphone" items={of('audioinput')} value={pickDev('audioIn', of('audioinput'))} onChange={id => setDevice('audioIn', id)} />
            <DeviceSelect icon="speaker" label="Speaker" items={of('audiooutput')} value={pickDev('audioOut', of('audiooutput'))} onChange={id => setDevice('audioOut', id)} fallback="Speaker (default)" />
            <DeviceSelect icon="cam" label="Camera" items={of('videoinput')} value={pickDev('videoIn', of('videoinput'))} onChange={id => setDevice('videoIn', id)} />
            <label className="dev">
              <Icon name="bg" className="d-ico" />
              <select aria-label="Backgrounds" defaultValue="none">
                <option value="none">Backgrounds</option>
                <option value="blur" disabled>Blur (coming soon)</option>
              </select>
              <Icon name="chevron" className="d-chev" />
            </label>
          </div>
        </div>

        <aside className="lobby-right">
          <div ref={boxRef} className="comm-box">
            <p className="comm-q">How would you like to communicate?</p>
            <label className={'comm-opt' + (state.comm === 'sign' ? ' sel' : '')}>
              <Icon name="hand" className="co-ico" />
              <Tick checked={state.comm === 'sign'} onChange={c => choose('sign', c)} name="comm">With sign</Tick>
            </label>
            <label className={'comm-opt' + (state.comm === 'nosign' ? ' sel' : '')}>
              <Icon name="chat" className="co-ico" />
              <Tick checked={state.comm === 'nosign'} onChange={c => choose('nosign', c)} name="comm">Without sign</Tick>
            </label>
            {hint && <p className="hint" role="alert">Please choose one to continue.</p>}
          </div>

          <h3 className="ready">Ready to join?</h3>
          <Magnet strength={5}>
            <button className="btn btn-primary btn-lg" type="button" onClick={askToJoin} disabled={asking}>
              <ShinyText text={asking ? 'Asking…' : 'Ask to Join'} className="on-dark" speed={4} />
            </button>
          </Magnet>
          <p className="code-line">Meeting code: <b>{state.meeting?.code}</b></p>
        </aside>
      </div>
    </section>
  );
}
