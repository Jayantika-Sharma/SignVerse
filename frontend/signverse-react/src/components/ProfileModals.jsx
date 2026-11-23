import { useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import { useApp } from '../lib/store.jsx';
import { AVATAR_COLORS, avatarBg, initialsOf } from '../lib/util.js';

const PRONOUNS = ['', 'she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'Prefer not to say'];
const LANGS = ['ASL', 'BSL', 'ISL', 'LSF', 'Auslan', 'Other'];
const WAYS = [['sign', 'Sign language'], ['captions', 'Voice + captions'], ['text', 'Text / chat']];

/* ---------------- Manage Profile ---------------- */
export function ManageProfile({ onClose }) {
  const { state, update, toast } = useApp();
  const u = state.user || {};
  const [f, setF] = useState({
    name: u.name || '', username: u.username || '', pronouns: u.pronouns || '', bio: u.bio || '',
    langs: u.langs || ['ASL'], way: u.way || 'sign', color: u.color || 0
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const toggleLang = l => set('langs', f.langs.includes(l) ? f.langs.filter(x => x !== l) : [...f.langs, l]);
  const save = e => {
    e.preventDefault();
    update({ user: { ...u, ...f, name: f.name.trim() || u.name } });
    toast('Profile saved'); onClose();
  };
  return (
    <Modal title="Manage profile" onClose={onClose}>
      <form className="modal-body" onSubmit={save}>
        <div className="pf-top">
          <div className="pf-avatar" style={{ background: avatarBg(f.color) }}>{initialsOf(f.name)}</div>
          <div>
            <p className="lbl">Avatar colour</p>
            <div className="swatches">
              {AVATAR_COLORS.map((_, i) => (
                <button key={i} type="button" className={'swatch' + (f.color === i ? ' on' : '')} style={{ background: avatarBg(i) }} aria-label={'Colour ' + (i + 1)} onClick={() => set('color', i)} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid2">
          <label className="lbl">Display name
            <input className="txt" value={f.name} onChange={e => set('name', e.target.value)} maxLength={40} />
          </label>
          <label className="lbl">Username
            <input className="txt" value={f.username} onChange={e => set('username', e.target.value.replace(/\s/g, ''))} placeholder="@yourname" maxLength={24} />
          </label>
        </div>
        <div className="grid2">
          <label className="lbl">Pronouns
            <select className="txt" value={f.pronouns} onChange={e => set('pronouns', e.target.value)}>
              {PRONOUNS.map(p => <option key={p} value={p}>{p || 'Select…'}</option>)}
            </select>
          </label>
          <label className="lbl">Email
            <input className="txt" value={u.email || ''} disabled placeholder="Not set" />
          </label>
        </div>
        <label className="lbl">About me
          <textarea className="txt" rows={3} maxLength={160} value={f.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell people a little about yourself…" />
          <small className="count">{f.bio.length}/160</small>
        </label>

        <div>
          <p className="lbl">Sign languages I use</p>
          <div className="chips">
            {LANGS.map(l => <button type="button" key={l} className={'chip' + (f.langs.includes(l) ? ' on' : '')} onClick={() => toggleLang(l)}>{l}</button>)}
          </div>
        </div>
        <div>
          <p className="lbl">Preferred way to communicate</p>
          <div className="chips">
            {WAYS.map(([v, t]) => <button type="button" key={v} className={'chip' + (f.way === v ? ' on' : '')} onClick={() => set('way', v)}>{t}</button>)}
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-soft" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Add Profile (display only) ---------------- */
export function AddProfile({ onClose }) {
  const { state, toast } = useApp();
  const u = state.user || {};
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState('Personal');
  return (
    <Modal title="Profiles" onClose={onClose}>
      <div className="modal-body">
        <p className="muted">Switch between profiles for different parts of your life.</p>
        <div className="prof-row active">
          <div className="pf-avatar sm" style={{ background: avatarBg(u.color || 0) }}>{initialsOf(u.name)}</div>
          <div className="grow"><b>{u.name || 'You'}</b><small>{u.email || 'Personal profile'}</small></div>
          <span className="pill-tag">Active</span>
        </div>
        {adding ? (
          <div className="add-form">
            <input className="txt" placeholder="Profile name" />
            <div className="chips">
              {['Personal', 'Work', 'Family', 'Friends'].map(k => <button key={k} type="button" className={'chip' + (kind === k ? ' on' : '')} onClick={() => setKind(k)}>{k}</button>)}
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-soft" onClick={() => setAdding(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => { toast('Multiple profiles are coming soon'); setAdding(false); }}>Add profile</button>
            </div>
          </div>
        ) : (
          <button type="button" className="prof-row add" onClick={() => setAdding(true)}>
            <div className="pf-avatar sm dashed"><Icon name="plus" size={20} /></div>
            <div className="grow"><b>Add another profile</b><small>Create a separate profile</small></div>
          </button>
        )}
      </div>
    </Modal>
  );
}
