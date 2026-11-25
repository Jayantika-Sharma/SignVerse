import { useEffect, useRef } from 'react';
import { pick, rand } from '../lib/util.js';

/* Hands and sentences fade in at a random FREE spot, drift, then fade out somewhere else.
 * New spots never overlap what is already visible or anything marked [data-avoid],
 * so the page never feels cluttered. They also float with a little cursor parallax. */
const HAND_COUNT = 5;
const SENTENCES = [
  'Every gesture tells a story',
  'Different expressions, one connection',
  'Some stories are told without ever being spoken',
  'Speak through gestures, connect through hearts',
  'Hands that speak, hearts that listen',
  'Silence has a language of its own',
  'Say it with your hands',
  'Every sign is a conversation'
];
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export default function FloatingHands({ conflictKey }) {
  const layerRef = useRef(null);
  const api = useRef({ clearConflicts() {} });

  useEffect(() => {
    const layer = layerRef.current;
    let active = [], timer = 0, alive = true;
    const timeouts = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timeouts.delete(t); fn(); }, ms); timeouts.add(t); };

    const maxActive = () => Math.max(4, Math.min(9, Math.round(layer.clientWidth * layer.clientHeight / 150000)));
    const avoidRects = () => {
      const lr = layer.getBoundingClientRect();
      return [...document.querySelectorAll('[data-avoid]')].filter(el => el.offsetParent !== null).map(el => {
        const r = el.getBoundingClientRect(), pad = 24;
        return { x: r.left - lr.left - pad, y: r.top - lr.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
      });
    };
    const fadeOut = entry => {
      entry.el.classList.remove('in');
      later(() => { entry.el.remove(); active = active.filter(a => a !== entry); }, 1700);
    };

    async function spawn() {
      if (!alive || active.length >= maxActive()) return;
      const isHand = Math.random() < 0.5;
      const el = document.createElement('div');
      const par = document.createElement('div');
      const inner = document.createElement('div');
      el.className = 'floater ' + (isHand ? 'hand' : 'text');
      par.className = 'par'; inner.className = 'inner';
      par.style.setProperty('--d', rand(0.3, 1).toFixed(2));
      inner.style.setProperty('--dur', rand(7, 12).toFixed(1) + 's');
      inner.style.setProperty('--dx', rand(-16, 16).toFixed(0) + 'px');
      inner.style.setProperty('--dy', rand(-18, 10).toFixed(0) + 'px');
      el.style.visibility = 'hidden';

      let text = '';
      if (isHand) {
        const img = new Image();
        img.alt = ''; img.draggable = false;
        img.src = `/assets/hands/hand-${1 + Math.floor(Math.random() * HAND_COUNT)}.png`;
        img.style.transform = `scaleX(${Math.random() < 0.5 ? -1 : 1}) rotate(${rand(-20, 20).toFixed(0)}deg)`;
        inner.appendChild(img); par.appendChild(inner); el.appendChild(par); layer.appendChild(el);
        try { await img.decode(); } catch { /* ignore */ }
        // keep every hand clearly smaller than the centre logo (max ~90px tall, ~110px wide)
        const ratio = (img.naturalWidth || 1) / (img.naturalHeight || 1);
        img.style.height = Math.min(rand(46, 90), 110 / ratio).toFixed(0) + 'px';
      } else {
        const used = active.map(a => a.text);
        const options = SENTENCES.filter(s => !used.includes(s));
        text = pick(options.length ? options : SENTENCES);
        inner.textContent = text;
        inner.style.fontSize = rand(20, 28).toFixed(0) + 'px';
        par.appendChild(inner); el.appendChild(par); layer.appendChild(el);
      }
      if (!alive) { el.remove(); return; }

      const w = el.offsetWidth, h = el.offsetHeight, L = layer.clientWidth, H = layer.clientHeight;
      const blocked = active.map(a => a.rect).concat(avoidRects());
      let rect = null;
      for (let i = 0; i < 40 && !rect; i++) {
        const x = rand(8, Math.max(9, L - w - 8)), y = rand(8, Math.max(9, H - h - 8));
        const r = { x: x - 28, y: y - 28, w: w + 56, h: h + 56 };
        if (!blocked.some(b => hit(r, b))) { rect = r; el.style.left = x + 'px'; el.style.top = y + 'px'; }
      }
      if (!rect) { el.remove(); return; }

      const entry = { el, rect, text };
      active.push(entry);
      el.style.visibility = '';
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
      later(() => fadeOut(entry), rand(3800, 7000));
    }

    api.current.clearConflicts = () => {
      const blocked = avoidRects();
      active.filter(a => blocked.some(b => hit(a.rect, b))).forEach(a => {
        a.rect = { x: -9999, y: -9999, w: 0, h: 0 };
        fadeOut(a);
      });
    };

    const parallax = e => {
      layer.style.setProperty('--mx', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
      layer.style.setProperty('--my', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
    };
    addEventListener('pointermove', parallax);

    spawn(); later(spawn, 500); later(spawn, 1100);
    timer = setInterval(spawn, 1100);

    return () => {
      alive = false; clearInterval(timer); timeouts.forEach(clearTimeout);
      removeEventListener('pointermove', parallax);
      layer.replaceChildren();
    };
  }, []);

  // when the register card replaces the hero (or back), fade out anything now underneath it
  useEffect(() => { const id = requestAnimationFrame(() => api.current.clearConflicts()); return () => cancelAnimationFrame(id); }, [conflictKey]);

  return <div ref={layerRef} className="floaters" aria-hidden="true" />;
}
