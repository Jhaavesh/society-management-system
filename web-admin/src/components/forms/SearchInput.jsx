import { useRef, useEffect } from 'react';
import { Icon } from '../ui/Icon.jsx';

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={\search-wrapper \\} style={{ position: 'relative', width: '100%' }}>
      <Icon name='search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
      <input
        ref={inputRef}
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='search-input'
        style={{
          width: '100%',
          padding: '11px 13px 11px 40px',
          border: '1px solid var(--line)',
          borderRadius: '9px',
          outline: 'none',
          background: '#fff',
          color: 'var(--ink)',
          fontSize: '12px',
        }}
      />
      {value && (
        <button
          type='button'
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
            padding: '4px',
          }}
          aria-label='Clear search'
        >
          <Icon name='x' size={16} />
        </button>
      )}
    </div>
  );
}
