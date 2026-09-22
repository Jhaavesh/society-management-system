import { useEffect } from 'react';
import { Icon } from './Icon.jsx';

export function Modal({ isOpen, onClose, title, children, className = '' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className={\modal \} onClick={(e) => e.stopPropagation()}>
        <div className='modal-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>{title}</h3>
          <button className='modal-close' onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
            <Icon name='x' size={20} />
          </button>
        </div>
        <div className='modal-content'>{children}</div>
      </div>
    </div>
  );
}
