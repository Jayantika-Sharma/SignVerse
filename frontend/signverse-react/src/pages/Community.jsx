import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import { useApp } from '../lib/store.jsx';
import { loadCommunity, saveCommunity } from '../lib/community.js';
import { avatarBg, initialsOf, timeNow } from '../lib/util.js';

/* ---------- COMMUNITY : Discord-style layout (local only for now) ---------- */
const REACTS = ['👍', '❤️', '😂', '🙌'];
const letter = n => (n || '?').trim()[0]?.toUpperCase();

function Av({ name, color = 0, size = 40, status }) {
  return (
    <span className="dc-av" style={{ width: size, height: size, background: avatarBg(color), fontSize: size * 0.38 }}>
      {initialsOf(name).slice(0, 2)}
      {status && <i className={'st ' + status} />}
    </span>
  );
}

export default function Community() {
  const { state } = useApp();
  const me = state.user?.name || 'You';
  const myColor = state.user?.color || 0;

  const [data, setData] = useState(loadCommunity);
  const [sid, setSid] = useState('home');                 // selected server ('home' = direct messages)
  const [cid, setCid] = useState('d1');
  const [text, setText] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const [dlg, setDlg] = useState(null);                   // {kind:'server'} | {kind:'channel', cat}
  const [voice, setVoice] = useState(null);               // {sid, id, name}
  const [mic, setMic] = useState(true);
  const [deaf, setDeaf] = useState(false);
  const [cam, setCam] = useState(false);
  const listEnd = useRef(null);

  useEffect(() => saveCommunity(data), [data]);

  const server = data.servers.find(s => s.id === sid);
  const channels = useMemo(() => (sid === 'home' ? data.dms : server?.cats.flatMap(c => c.channels) || []), [sid, data, server]);
  const channel = channels.find(c => c.id === cid) || channels.find(c => c.type !== 'voice') || channels[0];
  const msgs = data.messages[channel?.id] || [];
  useEffect(() => { listEnd.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, channel?.id]);

  const pickServer = id => {
    setSid(id);
    const first = id === 'home' ? data.dms[0] : data.servers.find(s => s.id === id).cats.flatMap(c => c.channels).find(c => c.type === 'text');
    setCid(first?.id);
  };
  const send = e => {
    e.preventDefault();
    const t = text.trim(); if (!t || !channel || channel.type === 'voice') return;
    const m = { id: 'm' + Date.now(), user: me, me: true, color: myColor, text: t, t: timeNow() };
    setData(d => ({ ...d, messages: { ...d.messages, [channel.id]: [...(d.messages[channel.id] || []), m] } }));
    setText('');
  };
  const react = (mid, emo) => setData(d => ({
    ...d, messages: { ...d.messages, [channel.id]: d.messages[channel.id].map(m => {
      if (m.id !== mid) return m;
      const r = { ...(m.react || {}) }; const list = r[emo] || [];
      r[emo] = list.includes(me) ? list.filter(x => x !== me) : [...list, me];
      if (!r[emo].length) delete r[emo];
      return { ...m, react: r };
    }) }
  }));
  const addServer = name => {
    const id = 's' + Date.now();
    const s = { id, name, color: data.servers.length % 6, cats: [
      { name: 'Text channels', channels: [{ id: id + 'c', name: 'general', type: 'text' }] },
      { name: 'Voice & video', channels: [{ id: id + 'v', name: 'Lounge', type: 'voice' }] }
    ] };
    setData(d => ({ ...d, servers: [...d.servers, s], messages: { ...d.messages, [id + 'c']: [{ id: 'w' + id, user: 'SignBot', bot: true, color: 0, text: `Welcome to ${name}! 🎉 This is the start of your new server.`, t: timeNow() }] } }));
    setSid(id); setCid(id + 'c'); setDlg(null);
  };
  const addChannel = (catName, name, type) => {
    const id = 'n' + Date.now();
    const clean = type === 'text' ? name.toLowerCase().replace(/\s+/g, '-') : name;
    setData(d => ({ ...d, servers: d.servers.map(s => s.id !== sid ? s : { ...s, cats: s.cats.map(c => c.name !== catName ? c : { ...c, channels: [...c.channels, { id, name: clean, type }] }) }) }));
    if (type === 'text') setCid(id); setDlg(null);
  };
  const joinVoice = c => { setVoice({ sid, id: c.id, name: c.name, server: server?.name }); setCid(c.id); };

  const online = data.members.filter(m => m.status !== 'offline');
  const offline = data.members.filter(m => m.status === 'offline');
  const inVoiceView = channel?.type === 'voice';

  return (
    <section className="page page-dc">
      <div className="dc glass">
        {/* ---- server rail ---- */}
        <nav className="dc-rail" aria-label="Servers">
          <button type="button" className={'rail-btn home' + (sid === 'home' ? ' on' : '')} onClick={() => pickServer('home')} title="Direct messages"><img src="/assets/logo.png" alt="Home" /></button>
          <span className="rail-sep" />
          {data.servers.map(s => (
            <button key={s.id} type="button" className={'rail-btn' + (sid === s.id ? ' on' : '')} style={{ background: avatarBg(s.color) }} onClick={() => pickServer(s.id)} title={s.name}>
              {letter(s.name)}
            </button>
          ))}
          <button type="button" className="rail-btn add" onClick={() => setDlg({ kind: 'server' })} title="Add a server"><Icon name="plus" size={26} /></button>
        </nav>

        {/* ---- channel list ---- */}
        <aside className="dc-side">
          <div className="side-head"><b>{sid === 'home' ? 'Direct messages' : server?.name}</b><Icon name="chevron" size={22} /></div>
          <div className="side-scroll">
            {sid === 'home' ? (
              <>
                <button type="button" className="ch find"><Icon name="search" size={18} />Find or start a chat</button>
                <p className="cat">Direct messages</p>
                {data.dms.map(c => (
                  <button key={c.id} type="button" className={'ch dm' + (cid === c.id ? ' on' : '')} onClick={() => setCid(c.id)}>
                    <Av name={c.name} color={data.members.find(m => m.name === c.name)?.color} size={30} status={data.members.find(m => m.name === c.name)?.status} />{c.name}
                  </button>
                ))}
              </>
            ) : server?.cats.map(cat => (
              <div key={cat.name}>
                <div className="cat-row"><p className="cat">{cat.name}</p><button type="button" className="cat-add" aria-label={'Add channel to ' + cat.name} onClick={() => setDlg({ kind: 'channel', cat: cat.name })}><Icon name="plus" size={18} /></button></div>
                {cat.channels.map(c => (
                  <button key={c.id} type="button" className={'ch' + (cid === c.id ? ' on' : '') + (voice?.id === c.id ? ' live' : '')} onClick={() => (c.type === 'voice' ? joinVoice(c) : setCid(c.id))}>
                    <Icon name={c.type === 'voice' ? 'speaker' : 'hash'} size={19} />{c.name}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {voice && (
            <div className="voice-bar">
              <div><b>Voice connected</b><small>{voice.name} · {voice.server}</small></div>
              <button type="button" className="vb-end" aria-label="Disconnect" onClick={() => { setVoice(null); if (inVoiceView) pickServer(sid); }}><Icon name="end" size={20} /></button>
            </div>
          )}
          <div className="user-panel">
            <Av name={me} color={myColor} size={38} status="online" />
            <div className="up-name"><b>{me}</b><small>Online</small></div>
            <button type="button" className={'up-btn' + (!mic ? ' off' : '')} aria-pressed={mic} aria-label="Mute" onClick={() => setMic(m => !m)}><Icon name={mic ? 'mic' : 'micOff'} size={20} /></button>
            <button type="button" className={'up-btn' + (deaf ? ' off' : '')} aria-pressed={!deaf} aria-label="Deafen" onClick={() => setDeaf(d => !d)}><Icon name="headset" size={20} /></button>
          </div>
        </aside>

        {/* ---- main ---- */}
        <div className="dc-main">
          <div className="main-head">
            <Icon name={inVoiceView ? 'speaker' : sid === 'home' ? 'person' : 'hash'} size={22} className="mh-ico" />
            <b>{channel?.name}</b>
            <span className="topic">{inVoiceView ? 'Voice channel' : sid === 'home' ? 'Direct message' : 'Say hi and share what you are learning'}</span>
            <div className="mh-right">
              <label className="search"><Icon name="search" size={18} /><input placeholder="Search" aria-label="Search" /></label>
              <button type="button" className={'mh-btn' + (showMembers ? ' on' : '')} aria-pressed={showMembers} aria-label="Toggle member list" onClick={() => setShowMembers(s => !s)}><Icon name="people" size={22} /></button>
            </div>
          </div>

          {inVoiceView ? (
            <div className="voice-room">
              <div className="tiles">
                <div className={'tile' + (mic ? ' talk' : '')}>{cam ? <span className="cam-on">Camera on</span> : <Av name={me} color={myColor} size={92} />}<span className="tn">{me}{!mic && <Icon name="micOff" size={16} />}</span></div>
              </div>
              <p className="muted">You are the only one here. Invite friends to join this room!</p>
              <div className="vr-ctls">
                <button type="button" className={'ctl round' + (!mic ? ' offc' : '')} aria-pressed={mic} aria-label="Microphone" onClick={() => setMic(m => !m)}><Icon name={mic ? 'mic' : 'micOff'} /></button>
                <button type="button" className="ctl round" aria-pressed={cam} aria-label="Camera" onClick={() => setCam(c => !c)}><Icon name={cam ? 'cam' : 'camOff'} /></button>
                <button type="button" className="ctl round end" aria-label="Leave voice" onClick={() => { setVoice(null); pickServer(sid); }}><Icon name="end" /></button>
              </div>
            </div>
          ) : (
            <>
              <div className="msgs">
                <div className="intro">
                  <span className="intro-ico"><Icon name={sid === 'home' ? 'person' : 'hash'} size={34} /></span>
                  <h2>{sid === 'home' ? channel?.name : 'Welcome to #' + channel?.name}</h2>
                  <p>{sid === 'home' ? `This is the beginning of your chat with ${channel?.name}.` : 'This is the start of the channel.'}</p>
                </div>
                {msgs.map(m => (
                  <div key={m.id} className="msg">
                    <Av name={m.user} color={m.color} size={42} />
                    <div className="mbody">
                      <div className="mmeta"><b>{m.user}</b>{m.bot && <span className="tag">BOT</span>}<small>{m.t}</small></div>
                      <p>{m.text}</p>
                      {m.react && <div className="reacts">{Object.entries(m.react).map(([e, who]) => (
                        <button key={e} type="button" className={'rx' + (who.includes(me) ? ' mine' : '')} onClick={() => react(m.id, e)}>{e}<span>{who.length}</span></button>
                      ))}</div>}
                    </div>
                    <div className="mtools">{REACTS.map(e => <button key={e} type="button" aria-label={'React ' + e} onClick={() => react(m.id, e)}>{e}</button>)}</div>
                  </div>
                ))}
                <div ref={listEnd} />
              </div>
              <form className="composer" onSubmit={send}>
                <button type="button" className="cp-plus" aria-label="Attach" tabIndex={-1}><Icon name="plus" size={22} /></button>
                <input value={text} onChange={e => setText(e.target.value)} placeholder={sid === 'home' ? `Message @${channel?.name}` : `Message #${channel?.name}`} aria-label="Message" />
                <button type="button" className="cp-emoji" aria-label="Emoji" onClick={() => setText(t => t + '🙌')}><Icon name="smile" size={24} /></button>
                <button type="submit" className="send" aria-label="Send" disabled={!text.trim()}><Icon name="send" size={20} /></button>
              </form>
            </>
          )}
        </div>

        {/* ---- members ---- */}
        {showMembers && (
          <aside className="dc-members">
            <p className="cat">Online — {online.length + 1}</p>
            <div className="mem"><Av name={me} color={myColor} size={34} status="online" /><span>{me}<em> (you)</em></span></div>
            {online.map(m => <div key={m.name} className="mem"><Av name={m.name} color={m.color} size={34} status={m.status} /><span>{m.name}</span>{m.bot && <span className="tag">BOT</span>}</div>)}
            <p className="cat">Offline — {offline.length}</p>
            {offline.map(m => <div key={m.name} className="mem off"><Av name={m.name} color={m.color} size={34} status="offline" /><span>{m.name}</span></div>)}
          </aside>
        )}
      </div>

      {dlg?.kind === 'server' && <NewServer onClose={() => setDlg(null)} onCreate={addServer} />}
      {dlg?.kind === 'channel' && <NewChannel cat={dlg.cat} onClose={() => setDlg(null)} onCreate={(n, t) => addChannel(dlg.cat, n, t)} />}
    </section>
  );
}

function NewServer({ onClose, onCreate }) {
  const [name, setName] = useState('');
  return (
    <Modal title="Create a server" onClose={onClose}>
      <form className="modal-body" onSubmit={e => { e.preventDefault(); if (name.trim()) onCreate(name.trim()); }}>
        <p className="muted">Your server is where you and your friends hang out. Make yours and start talking.</p>
        <label className="lbl">Server name<input className="txt" autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={30} placeholder="My signing circle" /></label>
        <div className="modal-foot"><button type="button" className="btn btn-soft" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!name.trim()}>Create</button></div>
      </form>
    </Modal>
  );
}
function NewChannel({ cat, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  return (
    <Modal title={`Create channel in ${cat}`} onClose={onClose}>
      <form className="modal-body" onSubmit={e => { e.preventDefault(); if (name.trim()) onCreate(name.trim(), type); }}>
        <div className="chips">
          <button type="button" className={'chip' + (type === 'text' ? ' on' : '')} onClick={() => setType('text')}># Text</button>
          <button type="button" className={'chip' + (type === 'voice' ? ' on' : '')} onClick={() => setType('voice')}>Voice</button>
        </div>
        <label className="lbl">Channel name<input className="txt" autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={30} placeholder="new-channel" /></label>
        <div className="modal-foot"><button type="button" className="btn btn-soft" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!name.trim()}>Create channel</button></div>
      </form>
    </Modal>
  );
}
