/* =====================================================================
 * SignVerse  –  BRIDGE FILE  (this is the file you edit to connect OpenCV)
 * =====================================================================
 *
 * The React UI never talks to OpenCV directly. It only uses the small API
 * at the bottom of this file:
 *
 *      SignVerse.start(videoElement)   -> called when the call page opens
 *      SignVerse.stop()                -> called when the call ends / is paused
 *      SignVerse.handleResult({...})   -> detector gives the UI a caption
 *
 * Pick ONE way to connect your OpenCV code (set SignVerseConfig.mode):
 *
 *  'http'      Browser sends a JPEG frame ~8x/second to POST /api/predict,
 *              your Python (see server_example.py) answers with JSON.
 *  'websocket' Same idea over a WebSocket (faster, good for real-time).
 *  'manual'    You push results yourself from any script:
 *                  SignVerse.handleResult({ caption: "hello" })
 *              (also available in the browser console as window.SignVerse)
 *  'demo'      Fake captions so you can see the UI working. Open the site
 *              with  ?demo  in the address, e.g.  http://localhost:5173/?demo
 *  'off'       (default) camera only, no detection.
 *
 * RESULT FORMAT your detector should return (all fields optional except caption):
 *   {
 *     "caption":    "hello",        // text of the detected sign ("" = nothing detected)
 *     "confidence": 0.93,           // 0..1
 *     "final":      true,           // false = partial/in-progress, not saved to history
 *     "boxes": [                    // optional, drawn on the video. Normalised 0..1,
 *        { "x":0.2,"y":0.3,"w":0.2,"h":0.3,"label":"hand" }   // in the UN-mirrored frame
 *     ]
 *   }
 * ===================================================================== */

/* ------------------------- 1. SETTINGS ------------------------- */
export const SignVerseConfig = {
  mode: new URLSearchParams(location.search).has('demo') ? 'demo' : 'off',   // <- change 'off' to 'http'

  httpEndpoint: '/api/predict',          // mode 'http'
  wsEndpoint:   'ws://localhost:8765',   // mode 'websocket'

  fps: 8,                // how many frames per second are sent to Python
  frameWidth: 640,       // frames are downscaled to this width before sending
  jpegQuality: 0.7,
  captionTimeoutMs: 4000 // live caption disappears after this long with no new result
};

/* ------------------------- 2. ACCOUNT / MEETING STUBS -------------------------
 * There is no backend yet, so these just succeed. Replace the bodies with real
 * fetch() calls when you have an API.                                         */
const sleep = ms => new Promise(r => setTimeout(r, ms));

export const SignVerseAPI = {
  async register({ first, last, email }) {
    await sleep(400);                                    // TODO: POST /api/register
    return { ok: true, user: { name: `${first} ${last}`.trim(), email } };
  },
  async login({ email }) {
    await sleep(400);                                    // TODO: POST /api/login
    return { ok: true, user: { name: email.split('@')[0], email } };
  },
  async oauth(provider) {                                // 'google' | 'apple'
    await sleep(400);                                    // TODO: real OAuth redirect/popup
    return { ok: true, user: { name: provider === 'google' ? 'Google user' : 'Apple user', email: '' } };
  },
  async askToJoin() {
    await sleep(500);                                    // TODO: ask host / signalling server
    return { ok: true };
  }
};

/* ------------------------- 3. SIGN DETECTION BRIDGE ------------------------- */
export const SignVerse = (() => {
  const cfg = SignVerseConfig;
  const listeners = { caption: [], status: [], result: [] };
  const frameCanvas = document.createElement('canvas');

  let video = null, loop = null, busy = false, ws = null, wsTimer = null;
  let demoTimer = null, lastErr = 0, active = false;

  /** subscribe: events are 'caption' | 'status' | 'result'. Returns an unsubscribe fn. */
  const on = (ev, fn) => { listeners[ev].push(fn); return () => { listeners[ev] = listeners[ev].filter(f => f !== fn); }; };
  const emit = (ev, p) => listeners[ev].forEach(fn => { try { fn(p); } catch (e) { console.error(e); } });
  const setStatus = (state, text) => emit('status', { state, text });

  /** Grab the current (un-mirrored) camera frame as a JPEG Blob. */
  function getFrame() {
    return new Promise(resolve => {
      if (!video || !video.videoWidth) return resolve(null);
      const w = cfg.frameWidth, h = Math.round(video.videoHeight * w / video.videoWidth);
      frameCanvas.width = w; frameCanvas.height = h;
      frameCanvas.getContext('2d').drawImage(video, 0, 0, w, h);
      frameCanvas.toBlob(resolve, 'image/jpeg', cfg.jpegQuality);
    });
  }

  /** Give the UI a result from your detector (string or object, see header). */
  function handleResult(r) {
    if (typeof r === 'string') r = { caption: r };
    if (!r) return;
    emit('result', r);
    if (typeof r.caption === 'string') {
      emit('caption', { text: r.caption, confidence: r.confidence, final: r.final !== false });
    }
  }

  /* ---- mode: http ---- */
  function startHttp() {
    setStatus('connected', 'Waiting for detector…');
    loop = setInterval(async () => {
      if (busy || !active) return;
      busy = true;
      try {
        const blob = await getFrame();
        if (!blob) return;
        const res = await fetch(cfg.httpEndpoint, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        handleResult(await res.json());
        setStatus('connected', 'Sign detection on');
      } catch (e) {
        if (Date.now() - lastErr > 5000) { console.warn('[SignVerse] detector error:', e); lastErr = Date.now(); }
        setStatus('error', 'Detector unreachable');
      } finally { busy = false; }
    }, 1000 / cfg.fps);
  }

  /* ---- mode: websocket ---- */
  function startWs() {
    const open = () => {
      if (!active) return;
      ws = new WebSocket(cfg.wsEndpoint);
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => setStatus('connected', 'Sign detection on');
      ws.onmessage = ev => { try { handleResult(JSON.parse(ev.data)); } catch (e) { console.warn(e); } };
      ws.onclose = () => { setStatus('error', 'Detector disconnected'); if (active) wsTimer = setTimeout(open, 2000); };
      ws.onerror = () => ws.close();
    };
    open();
    loop = setInterval(async () => {
      if (busy || !ws || ws.readyState !== 1) return;
      busy = true;
      try { const blob = await getFrame(); if (blob) ws.send(await blob.arrayBuffer()); }
      finally { busy = false; }
    }, 1000 / cfg.fps);
  }

  /* ---- mode: demo ---- */
  function startDemo() {
    const samples = ['Hello', 'Thank you', 'How are you?', 'Nice to meet you', 'Yes', 'Please help me', 'Goodbye'];
    let i = 0;
    setStatus('demo', 'Demo captions (no detector)');
    demoTimer = setInterval(() => handleResult({ caption: samples[i++ % samples.length], confidence: 0.9 }), 3200);
  }

  /** Start detection on a <video> element. */
  function start(videoEl) {
    stop();
    video = videoEl; active = true;
    switch (cfg.mode) {
      case 'http':      startHttp(); break;
      case 'websocket': startWs();   break;
      case 'demo':      startDemo(); break;
      case 'manual':    setStatus('connected', 'Waiting for your detector…'); break;
      default:          setStatus('off', 'Detection not connected');
    }
  }

  function stop() {
    active = false;
    clearInterval(loop); clearInterval(demoTimer); clearTimeout(wsTimer);
    loop = demoTimer = wsTimer = null; busy = false;
    if (ws) { ws.onclose = null; try { ws.close(); } catch { /* ignore */ } ws = null; }
    emit('caption', { text: '', final: false });
  }

  const api = {
    config: cfg,
    start, stop, on, handleResult, getFrame, setStatus,
    pushCaption: text => handleResult({ caption: text }),   // handy from the browser console
    get video() { return video; }
  };
  window.SignVerse = api;                                   // so you can call it from the console too
  return api;
})();
