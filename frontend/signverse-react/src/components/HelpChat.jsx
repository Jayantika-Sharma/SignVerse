import { useEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import { timeNow } from '../lib/util.js';

/* Built-in helper: answers common questions about SignVerse from a ready-made list.
 * (No server needed. To use a real AI later, replace `reply()` with a fetch to your backend.) */
const KB = [
  { k: ['start', 'new meeting', 'create meeting', 'host', 'begin call', 'make a call'],
    a: 'To start a meeting: open **Start Call**, press **Start a new meeting**, pick how you want to communicate on the preview screen (With sign / Without sign) and press **Ask to Join**. Your meeting code is shown under the button.' },
  { k: ['join', 'code', 'link', 'enter meeting'],
    a: 'To join: open **Start Call**, type or paste the meeting code or link into **Enter a code or link**, then press **Join**. You will see the camera preview first.' },
  { k: ['community', 'server', 'channel', 'discord', 'group chat'],
    a: '**Community** is a Discord-style space. On the left are servers, next to them the channels of the selected server (text and voice), in the middle the chat and on the right the member list. You can post messages, react to them and create new servers and channels. For now everything is stored on your own device only.' },
  { k: ['learn', 'alphabet', 'asl', 'cue card', 'flashcard', 'a-z', 'fingerspell'],
    a: '**Learn Sign** has flip cards for the ASL alphabet A–Z. Click a card to flip it and see how to make the sign, use the arrows to move between letters and tick **I know this** to track your progress.' },
  { k: ['about', 'signverse', 'what is this', 'what does this app'],
    a: 'SignVerse is a video-call space for people who use sign language. Your camera reads your signs and turns them into live captions that others can read, and **Speak aloud** can read them out loud too.' },
  { k: ['caption', 'detect', 'recogn', 'transcri', 'subtitle'],
    a: 'Choose **With sign** before joining. During the call, SignVerse watches your camera and shows what you sign as **live captions** over the video and in the captions panel. Keep your hands in view and well lit for the best results. If you see "Detection not connected", the detector is not switched on yet.' },
  { k: ['speak', 'aloud', 'voice', 'read out', 'text to speech', 'tts', 'sound'],
    a: 'Turn on **Speak aloud** in the Live captions panel (or the speaker button in the call bar) and every new caption is read out loud. The gear next to it lets you choose the voice and speed, and every caption has its own speaker button.' },
  { k: ['camera', 'webcam', 'video not', 'black', 'blocked', 'permission'],
    a: 'If your camera does not show: allow camera access (click the camera icon in the browser address bar), make sure no other app is using it, then choose it in the **Camera** dropdown on the preview screen.' },
  { k: ['mic', 'microphone', 'audio', 'hear'],
    a: 'Use the microphone button on the preview or call bar to mute and unmute. Pick the right device in the **Microphone** dropdown. The dotted circle next to it moves when your mic picks up sound.' },
  { k: ['raise', 'hand up'],
    a: 'Press the **raise hand** button in the call bar to let people know you want to speak. A hand then shows next to your name in the **participants** list. Press it again to lower it.' },
  { k: ['chat', 'message in call', 'type in call'],
    a: 'Open the **chat** button in the call bar to type messages during a call. Close it any time to give the captions the whole panel back.' },
  { k: ['participant', 'people', 'who is in'],
    a: 'The **people** button in the call bar shows who is in the call and who has raised a hand.' },
  { k: ['profile', 'bio', 'pronoun', 'name', 'avatar', 'photo'],
    a: 'Click your avatar in the top right and choose **Manage profile** to change your name, bio, pronouns, avatar colour and the sign languages you use.' },
  { k: ['setting', 'preference', 'notification', 'privacy'],
    a: 'Open your avatar menu and choose **Settings** for general, audio & video, captions, accessibility, notification and privacy options.' },
  { k: ['login', 'log in', 'register', 'sign up', 'account', 'password', 'log out', 'logout'],
    a: 'Use **Login / Register** on the main page to create an account or log in with Google or Apple. To log out, open your avatar menu and choose **Log out**.' }
];
const SUGGEST = ['How do I start a meeting?', 'What does Community do?', 'How do live captions work?', 'How does Speak aloud work?', 'My camera is not working', 'How do I learn sign language?'];

function reply(q) {
  const t = q.toLowerCase();
  if (/^(hi|hello|hey|namaste|hola)\b/.test(t)) return 'Hi! I can help you find your way around SignVerse. What would you like to know?';
  if (/thank/.test(t)) return 'You are welcome! Ask me anything else any time.';
  let best = null, score = 0;
  for (const e of KB) { const s = e.k.filter(k => t.includes(k)).length; if (s > score) { score = s; best = e; } }
  return best ? best.a : 'I am not sure about that one yet. I can help with starting or joining a meeting, captions, Speak aloud, Community, Learn Sign, your profile and settings. Try one of the suggestions below.';
}
const bold = s => s.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));

export default function HelpChat({ onClose }) {
  const [msgs, setMsgs] = useState([{ from: 'bot', text: 'Hi, I am the SignVerse helper. Ask me how things work: starting a meeting, captions, Community and more.', t: timeNow() }]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, typing]);

  const send = q => {
    q = q.trim(); if (!q || typing) return;
    setMsgs(m => [...m, { from: 'me', text: q, t: timeNow() }]); setText(''); setTyping(true);
    setTimeout(() => { setMsgs(m => [...m, { from: 'bot', text: reply(q), t: timeNow() }]); setTyping(false); }, 650);
  };
  const asked = msgs.filter(m => m.from === 'me').map(m => m.text);
  const chips = SUGGEST.filter(s => !asked.includes(s)).slice(0, 4);

  return (
    <Modal title="Help & support" onClose={onClose} className="help">
      <div className="help-body">
        <div className="help-list">
          {msgs.map((m, i) => (
            <div key={i} className={'hmsg ' + m.from}>
              {m.from === 'bot' && <span className="hbot"><Icon name="help" size={18} /></span>}
              <div className="hbub"><p>{bold(m.text)}</p><small>{m.t}</small></div>
            </div>
          ))}
          {typing && <div className="hmsg bot"><span className="hbot"><Icon name="help" size={18} /></span><div className="hbub typing"><i /><i /><i /></div></div>}
          <div ref={end} />
        </div>
        <div className="chips help-chips">
          {chips.map(c => <button key={c} type="button" className="chip" onClick={() => send(c)}>{c}</button>)}
        </div>
        <form className="help-input" onSubmit={e => { e.preventDefault(); send(text); }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask a question…" aria-label="Ask a question" autoFocus />
          <button type="submit" className="send" aria-label="Send" disabled={!text.trim()}><Icon name="send" size={20} /></button>
        </form>
      </div>
    </Modal>
  );
}
