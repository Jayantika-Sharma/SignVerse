import { useEffect } from 'react';
import Icon from './Icon.jsx';

export default function Modal({ title, onClose, wide = false, className = '', children }) {
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={'modal glass ' + (wide ? 'wide ' : '') + className} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="modal-x" aria-label="Close" onClick={onClose}><Icon name="close" size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
