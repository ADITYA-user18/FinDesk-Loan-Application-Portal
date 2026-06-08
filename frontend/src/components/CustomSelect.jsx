import { useState, useRef, useEffect, memo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Fully custom styled dropdown — replaces native <select>.
 * Props match a controlled input: value, onChange(value), options, placeholder, className, error
 */
const CustomSelect = memo(function CustomSelect({
  value, onChange, options = [], placeholder = 'Select…',
  className = '', error = false, id,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') setOpen(false); }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const selectedLabel = options.find(o =>
    (typeof o === 'string' ? o : o.value) === value
  );
  const displayLabel = selectedLabel
    ? (typeof selectedLabel === 'string' ? selectedLabel : selectedLabel.label)
    : null;

  return (
    <div ref={ref} style={{ position: 'relative' }} id={id}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`form-input ${className} ${error ? 'error' : ''}`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left',
          borderColor: open ? 'var(--border-focus)' : error ? 'var(--danger)' : 'var(--border)',
          boxShadow: open ? '0 0 0 3px var(--primary-glow)' : 'none',
          color: displayLabel ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{displayLabel || placeholder}</span>
        <ChevronDown
          size={15}
          strokeWidth={2}
          style={{
            flexShrink: 0,
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            zIndex: 500,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            animation: 'slideUp 0.12s ease',
            listStyle: 'none',
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {options.map((opt) => {
            const val   = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            const isSelected = val === value;
            return (
              <li
                key={val}
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(val); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  background: isSelected ? 'rgba(251,191,36,0.12)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                {label}
                {isSelected && <Check size={13} strokeWidth={2.5} color="var(--primary)" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

export default CustomSelect;
