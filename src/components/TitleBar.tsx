import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Minus, Square, X, Moon, Sun, Command, Brain } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TitleBarProps {
  onShowShortcuts: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onShowShortcuts }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      data-tauri-drag-region
      style={{
        height: '32px',
        background: 'var(--titlebar)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '1rem',
        paddingRight: '0.5rem',
        borderBottom: '1px solid var(--border)',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        position: 'relative',
        zIndex: 100
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          paddingLeft: '0.5rem'
        }}
      >
        <Brain 
          size={13} 
          style={{ 
            color: 'var(--muted)',
            opacity: 0.7
          }} 
        />
        <span style={{
          fontSize: '0.6875rem',
          color: 'var(--muted)',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.05em',
          opacity: 0.8
        }}>
          brain
        </span>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.375rem'
        }}
      >
        <button
          onClick={onShowShortcuts}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            padding: '0.375rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted)';
          }}
          title="Keyboard Shortcuts (Ctrl+K)"
        >
          <Command size={15} />
        </button>
        
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            padding: '0.375rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted)';
          }}
          title="Toggle Theme (Ctrl+Shift+T)"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        
        <div style={{ 
          width: '1px', 
          height: '18px', 
          backgroundColor: 'var(--border)', 
          margin: '0 0.25rem' 
        }} />
        
        <button
          onClick={() => appWindow.minimize()}
          style={{
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
            e.currentTarget.style.backgroundColor = 'var(--surface)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted)';
          }}
        >
          <Minus size={15} />
        </button>
        
        <button
          onClick={() => appWindow.toggleMaximize()}
          style={{
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
            e.currentTarget.style.backgroundColor = 'var(--surface)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted)';
          }}
        >
          <Square size={13} />
        </button>
        
        <button
          onClick={() => appWindow.close()}
          style={{
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
            e.currentTarget.style.backgroundColor = 'var(--danger)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted)';
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};