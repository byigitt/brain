import React from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  sidebarPosition: 'left' | 'right';
  onTogglePosition: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  sidebarPosition,
  onTogglePosition,
}) => {
  React.useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        padding: '0.25rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        minWidth: '180px',
        fontFamily: 'JetBrains Mono, monospace',
        animation: 'fadeIn 150ms ease-out',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onTogglePosition();
          onClose();
        }}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '0.375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          color: 'var(--text)',
          transition: 'all 150ms',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text)';
        }}
      >
        {sidebarPosition === 'left' ? (
          <>
            <PanelRight size={14} />
            <span>Move to Right</span>
          </>
        ) : (
          <>
            <PanelLeft size={14} />
            <span>Move to Left</span>
          </>
        )}
      </button>
    </div>
  );
};