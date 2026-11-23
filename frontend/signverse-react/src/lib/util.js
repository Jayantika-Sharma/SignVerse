export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const params = new URLSearchParams(location.search);
export const DEV = params.has('dev');          // index?dev  -> skip the login guard while testing

export function genCode() {
  const c = n => Array.from({ length: n }, () => 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 24)]).join('');
  return `${c(3)}-${c(4)}-${c(3)}`;
}
export function extractCode(v) {
  v = v.trim();
  try { const u = new URL(v); const seg = u.pathname.split('/').filter(Boolean).pop(); if (seg) return seg; } catch (e) { /* not a URL */ }
  return v.replace(/\s+/g, '');
}
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// profile avatar colours (gradient start, end)
export const AVATAR_COLORS = [
  ['#cdb9f7', '#8b6df0'], ['#ffd1b8', '#ff9a76'], ['#bfe3ff', '#5aa9ff'],
  ['#f9c6e8', '#e879c6'], ['#c6f0d8', '#4ec58b'], ['#ffe9a8', '#f2b632']
];
export const avatarBg = (i = 0) => { const [a, b] = AVATAR_COLORS[i % AVATAR_COLORS.length]; return `linear-gradient(135deg,${a},${b})`; };
export const initialsOf = name => (name || 'You').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
export const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
