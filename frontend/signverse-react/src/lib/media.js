import { useSyncExternalStore } from 'react';

/* Camera / microphone manager. ONE MediaStream is shared by the lobby preview and
 * the call page, so the browser only asks for permission once. */
let version = 0;
const subs = new Set();
const bump = () => { version++; subs.forEach(f => f()); };
const levelSubs = new Set();

export const useMediaVersion = () =>
  useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => version);

export const Media = {
  stream: new MediaStream(),
  camError: null,
  micError: null,
  micEnabled: true,
  _ctx: null, _raf: 0,

  hasVideo() { return this.stream.getVideoTracks().some(t => t.readyState === 'live'); },
  hasAudio() { return this.stream.getAudioTracks().some(t => t.readyState === 'live'); },

  startVideo(deviceId) {                       // de-duplicated: parallel callers share one request
    if (this.hasVideo()) return Promise.resolve(true);
    return (this._vp ||= this._startVideo(deviceId).finally(() => { this._vp = null; }));
  },
  async _startVideo(deviceId) {
    if (!navigator.mediaDevices?.getUserMedia) { this.camError = new Error('Camera needs https or localhost'); bump(); return false; }
    const v = { width: { ideal: 1280 }, height: { ideal: 720 } };
    if (deviceId) v.deviceId = { ideal: deviceId };
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: v });
      s.getVideoTracks().forEach(t => this.stream.addTrack(t));
      this.camError = null; bump(); return true;
    } catch (e) { this.camError = e; bump(); return false; }
  },
  stopVideo() { this.stream.getVideoTracks().forEach(t => { t.stop(); this.stream.removeTrack(t); }); bump(); },

  startAudio(deviceId) {
    if (this.hasAudio()) { this.setMic(this.micEnabled); return Promise.resolve(true); }
    return (this._ap ||= this._startAudio(deviceId).finally(() => { this._ap = null; }));
  },
  async _startAudio(deviceId) {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    const a = { echoCancellation: true, noiseSuppression: true };
    if (deviceId) a.deviceId = { ideal: deviceId };
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: a });
      s.getAudioTracks().forEach(t => this.stream.addTrack(t));
      this.micError = null; this.setMic(this.micEnabled); this._meter(); bump(); return true;
    } catch (e) { this.micError = e; bump(); return false; }
  },
  stopAudio() { this._stopMeter(); this.stream.getAudioTracks().forEach(t => { t.stop(); this.stream.removeTrack(t); }); bump(); },
  setMic(on) { this.micEnabled = on; this.stream.getAudioTracks().forEach(t => { t.enabled = on; }); },
  stopAll() { this.stopVideo(); this.stopAudio(); },

  /** subscribe to the mic level (0..1); returns an unsubscribe fn */
  onLevel(fn) { levelSubs.add(fn); return () => levelSubs.delete(fn); },
  _meter() {
    this._stopMeter();
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._ctx.resume();
      const src = this._ctx.createMediaStreamSource(new MediaStream(this.stream.getAudioTracks()));
      const an = this._ctx.createAnalyser(); an.fftSize = 256; src.connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let sum = 0; for (const v of buf) { const d = (v - 128) / 128; sum += d * d; }
        const lvl = this.micEnabled ? Math.min(1, Math.sqrt(sum / buf.length) * 5) : 0;
        levelSubs.forEach(f => f(lvl));
        this._raf = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* the meter is cosmetic */ }
  },
  _stopMeter() {
    cancelAnimationFrame(this._raf);
    if (this._ctx) { this._ctx.close().catch(() => {}); this._ctx = null; }
  },

  async devices() {
    try { return await navigator.mediaDevices.enumerateDevices(); } catch { return []; }
  }
};
