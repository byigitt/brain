import React from 'react';
import { X } from 'lucide-react';
import { shortcuts } from '../hooks/useKeyboardShortcuts';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatKey = (shortcut: typeof shortcuts[0]) => {
    const keys = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.alt) keys.push('Alt');
    if (shortcut.shift) keys.push('Shift');
    keys.push(shortcut.key === 'ArrowUp' ? '↑' : 
               shortcut.key === 'ArrowDown' ? '↓' : 
               shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--modal-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }} onClick={onClose}>
      <div 
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          maxWidth: '480px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border)',
          position: 'relative',
          fontFamily: 'JetBrains Mono, monospace',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            padding: '0.375rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted)';
          }}
        >
          <X size={18} />
        </button>
        
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          color: 'var(--text)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          Keyboard Shortcuts
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          flex: 1,
          overflow: 'hidden'
        }}>
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.625rem 0.75rem',
                backgroundColor: 'var(--bg)',
                borderRadius: '0.375rem',
                border: '1px solid var(--border)',
                transition: 'all 150ms',
                gap: '0.5rem'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <span style={{ 
                color: 'var(--text)', 
                fontSize: '0.75rem',
                fontWeight: 450,
                fontFamily: 'JetBrains Mono, monospace',
                flex: 1
              }}>
                {shortcut.description}
              </span>
              <kbd style={{
                backgroundColor: 'var(--surface)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.625rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                whiteSpace: 'nowrap'
              }}>
                {formatKey(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};