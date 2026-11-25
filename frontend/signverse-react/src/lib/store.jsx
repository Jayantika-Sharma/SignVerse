import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const KEY = 'sv_state_v2';
const defaults = {
  user: null, meeting: null, comm: null,            // comm: 'sign' | 'nosign'
  mic: true, cam: true,
  devices: { audioIn: '', audioOut: '', videoIn: '' },
  speech: { on: false, voice: '', rate: 1 }          // "Speak aloud" settings
};
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try { return { ...defaults, ...JSON.parse(sessionStorage.getItem(KEY) || '{}') }; } catch { return defaults; }
  });
  const [toastMsg, setToastMsg] = useState('');
  const [modal, setModal] = useState(null);          // 'profile' | 'addprofile' | 'help' | 'settings'
  const timer = useRef();

  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);

  const update = useCallback(p => setState(s => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })), []);
  const toast = useCallback(msg => {
    setToastMsg(msg); clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(''), 2800);
  }, []);

  return (
    <Ctx.Provider value={{ state, update, toast, modal, openModal: setModal, closeModal: () => setModal(null) }}>
      {children}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </Ctx.Provider>
  );
}
