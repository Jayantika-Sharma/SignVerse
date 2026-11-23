/* Starter data for Community. Everything is stored in this browser only (localStorage)
 * until a real backend exists. The members / welcome messages are SAMPLE content. */
export const KEY = 'sv_community_v1';
const ch = (id, name, type = 'text') => ({ id, name, type });

export const SEED = {
  servers: [
    { id: 's1', name: 'SignVerse HQ', color: 0, cats: [
      { name: 'Start here', channels: [ch('c1', 'welcome'), ch('c2', 'announcements')] },
      { name: 'Chat', channels: [ch('c3', 'general'), ch('c4', 'sign-practice'), ch('c5', 'show-and-tell')] },
      { name: 'Voice & video', channels: [ch('v1', 'Hangout', 'voice'), ch('v2', 'Practice room', 'voice')] }
    ] },
    { id: 's2', name: 'ASL Beginners', color: 2, cats: [
      { name: 'Learning', channels: [ch('c6', 'alphabet-help'), ch('c7', 'daily-sign'), ch('c8', 'questions')] },
      { name: 'Voice & video', channels: [ch('v3', 'Study session', 'voice')] }
    ] },
    { id: 's3', name: 'Study Buddies', color: 4, cats: [
      { name: 'Text channels', channels: [ch('c9', 'general'), ch('c10', 'resources')] },
      { name: 'Voice & video', channels: [ch('v4', 'Quiet room', 'voice')] }
    ] }
  ],
  dms: [ch('d1', 'Maya'), ch('d2', 'Arjun')],
  messages: {
    c1: [{ id: 'm1', user: 'SignBot', bot: true, color: 0, text: 'Welcome to SignVerse HQ! 👋 This is a friendly space to meet people, practise signing and share tips.', t: '09:00' },
         { id: 'm2', user: 'SignBot', bot: true, color: 0, text: 'Say hi in #general, practise in #sign-practice, or hop into a voice room.', t: '09:01' }],
    c2: [{ id: 'm3', user: 'SignBot', bot: true, color: 0, text: 'New: Speak aloud now reads live captions out loud during calls. 🔊', t: '09:05' }],
    c3: [{ id: 'm4', user: 'Maya', color: 3, text: 'Hi everyone! Just joined 🙌', t: '10:12' },
         { id: 'm5', user: 'Arjun', color: 2, text: 'Welcome Maya! Have you tried the alphabet cards in Learn Sign?', t: '10:14' }],
    c4: [{ id: 'm6', user: 'Lena', color: 4, text: 'Anyone up for a practice call later today?', t: '11:30' }],
    c6: [{ id: 'm7', user: 'Priya', color: 1, text: 'Tip: keep your wrist relaxed when you fingerspell, it makes letters much clearer.', t: '08:45' }],
    d1: [{ id: 'm8', user: 'Maya', color: 3, text: 'Hey! Are you joining the practice call?', t: '09:20' }]
  },
  members: [
    { name: 'SignBot', bot: true, color: 0, status: 'online' },
    { name: 'Maya', color: 3, status: 'online' },
    { name: 'Arjun', color: 2, status: 'online' },
    { name: 'Lena', color: 4, status: 'idle' },
    { name: 'Priya', color: 1, status: 'dnd' },
    { name: 'Sam', color: 5, status: 'offline' },
    { name: 'Leo', color: 2, status: 'offline' }
  ]
};

export function loadCommunity() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s?.servers) return s; } catch { /* fresh start */ }
  return SEED;
}
export const saveCommunity = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* ignore */ } };
