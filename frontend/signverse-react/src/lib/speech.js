import { useEffect, useState } from 'react';

/* "Speak aloud" – reads captions with the browser's built-in text-to-speech.
 * No server and no API key needed. */
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function useVoices() {
  const [voices, setVoices] = useState(() => (canSpeak ? speechSynthesis.getVoices() : []));
  useEffect(() => {
    if (!canSpeak) return;
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
    return () => speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);
  return voices;
}

/** Say `text` out loud. opts: { voice: voiceURI, rate: 0.5..2, pitch: 0..2 } */
export function speak(text, { voice = '', rate = 1, pitch = 1 } = {}) {
  if (!canSpeak || !text) return;
  // live captions: if a backlog builds up, drop it so speech never lags behind the signer
  if (speechSynthesis.speaking && speechSynthesis.pending) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = voice && speechSynthesis.getVoices().find(x => x.voiceURI === voice);
  if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = rate; u.pitch = pitch;
  speechSynthesis.speak(u);
}
export const stopSpeaking = () => { if (canSpeak) speechSynthesis.cancel(); };
