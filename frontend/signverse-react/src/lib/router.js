import { useSyncExternalStore } from 'react';

// tiny hash router:  #/  #/register  #/login  #/meet  #/lobby  #/call
const parse = () => location.hash.replace(/^#\/?/, '').split('?')[0];
const subscribe = cb => { window.addEventListener('hashchange', cb); return () => window.removeEventListener('hashchange', cb); };
export const useRoute = () => useSyncExternalStore(subscribe, parse);
export const go = name => { location.hash = '#/' + name; };
