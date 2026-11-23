import { useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';

/* Settings window – the toggles remember their position but don't change the app yet. */
const TABS = [
  { id: 'general', label: 'General', icon: 'gear' },
  { id: 'av', label: 'Audio & video', icon: 'cam' },
  { id: 'captions', label: 'Captions & speech', icon: 'cc' },
  { id: 'access', label: 'Accessibility', icon: 'person' },
  { id: 'notif', label: 'Notifications', icon: 'bell' },
  { id: 'privacy', label: 'Privacy', icon: 'info' }
];
const DEFAULTS = {
  lang: 'English', startCam: true, tips: true,
  noise: true, hd: true, mirror: true,
  showCc: true, ccSize: 'Medium', autoSpeak: false, rate: 1,
  motion: false, contrast: false, bigText: false,
  sndMsg: true, desktop: false, hands: true,
  online: true, friends: true, analytics: false
};

function Row({ title, desc, children }) {
  return <div className="s-row"><div><b>{title}</b>{desc && <small>{desc}</small>}</div><div>{children}</div></div>;
}
function Toggle({ on, onChange, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={'switch' + (on ? ' on' : '')} onClick={() => onChange(!on)}><i /></button>;
}

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState('general');
  const [s, setS] = useState(() => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('sv_settings') || '{}') }; } catch { return DEFAULTS; } });
  const set = (k, v) => setS(x => { const n = { ...x, [k]: v }; try { localStorage.setItem('sv_settings', JSON.stringify(n)); } catch { /* ignore */ } return n; });
  const T = (k, title, desc) => <Row title={title} desc={desc}><Toggle on={s[k]} onChange={v => set(k, v)} label={title} /></Row>;

  return (
    <Modal title="Settings" onClose={onClose} wide className="settings">
      <div className="set-wrap">
        <nav className="set-tabs">
          {TABS.map(t => <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}><Icon name={t.icon} size={18} />{t.label}</button>)}
        </nav>
        <div className="set-pane">
          {tab === 'general' && <>
            <Row title="Language" desc="Language of menus and buttons">
              <select className="txt sm" value={s.lang} onChange={e => set('lang', e.target.value)}>{['English', 'Español', 'हिन्दी', 'Français', 'Deutsch'].map(l => <option key={l}>{l}</option>)}</select>
            </Row>
            <Row title="Theme" desc="More themes are coming soon"><span className="pill-tag">Light lavender</span></Row>
            {T('startCam', 'Start calls with camera on', 'Your camera is on when you open the preview')}
            {T('tips', 'Show helpful tips', 'Small hints while you use SignVerse')}
          </>}
          {tab === 'av' && <>
            {T('noise', 'Noise suppression', 'Reduce background noise from your microphone')}
            {T('hd', 'HD video', 'Use 720p video when your camera supports it')}
            {T('mirror', 'Mirror my video', 'Show your own video like a mirror')}
          </>}
          {tab === 'captions' && <>
            {T('showCc', 'Show live captions', 'Captions appear over the video during calls')}
            <Row title="Caption size"><select className="txt sm" value={s.ccSize} onChange={e => set('ccSize', e.target.value)}>{['Small', 'Medium', 'Large'].map(l => <option key={l}>{l}</option>)}</select></Row>
            {T('autoSpeak', 'Speak captions aloud by default', 'Read every new caption out loud')}
            <Row title="Speaking speed" desc={s.rate.toFixed(1) + '×'}><input type="range" min="0.5" max="2" step="0.1" value={s.rate} onChange={e => set('rate', +e.target.value)} /></Row>
          </>}
          {tab === 'access' && <>
            {T('motion', 'Reduce motion', 'Calmer animations')}
            {T('contrast', 'High contrast', 'Stronger text and borders')}
            {T('bigText', 'Larger text', 'Make text easier to read')}
          </>}
          {tab === 'notif' && <>
            {T('sndMsg', 'Message sounds', 'Play a sound for new chat messages')}
            {T('desktop', 'Desktop notifications', 'Get alerts when SignVerse is in the background')}
            {T('hands', 'Raised-hand alerts', 'Tell me when someone raises their hand')}
          </>}
          {tab === 'privacy' && <>
            {T('online', 'Show when I am online', 'Let people in Community see your status')}
            {T('friends', 'Allow friend requests', 'Anyone can send you a friend request')}
            {T('analytics', 'Share usage data', 'Help improve SignVerse')}
          </>}
          <p className="set-note">These settings are shown for preview and will start working in a later update.</p>
        </div>
      </div>
    </Modal>
  );
}
