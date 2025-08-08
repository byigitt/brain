import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export const shortcuts: ShortcutConfig[] = [
  {
    key: 'n',
    ctrl: true,
    action: () => {},
    description: 'Create new note'
  },
  {
    key: 's',
    ctrl: true,
    action: () => {},
    description: 'Save current note'
  },
  {
    key: 'f',
    ctrl: true,
    action: () => {},
    description: 'Search notes'
  },
  {
    key: 'k',
    ctrl: true,
    action: () => {},
    description: 'Show shortcuts'
  },
  {
    key: 'd',
    ctrl: true,
    shift: true,
    action: () => {},
    description: 'Delete current note'
  },
  {
    key: 't',
    ctrl: true,
    shift: true,
    action: () => {},
    description: 'Toggle theme'
  },
  {
    key: 'ArrowDown',
    alt: true,
    action: () => {},
    description: 'Next note'
  },
  {
    key: 'ArrowUp',
    alt: true,
    action: () => {},
    description: 'Previous note'
  },
  {
    key: 'Escape',
    action: () => {},
    description: 'Close dialogs/Clear search'
  },
  {
    key: 'Enter',
    ctrl: true,
    action: () => {},
    description: 'Toggle editor focus'
  }
];

export const useKeyboardShortcuts = (
  onNewNote: () => void,
  onSave: () => void,
  onSearch: () => void,
  onShowShortcuts: () => void,
  onDelete: () => void,
  onToggleTheme: () => void,
  onNextNote: () => void,
  onPrevNote: () => void,
  onEscape: () => void,
  onFocusEditor: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow default behavior for undo/redo
      if (e.ctrlKey && (e.key === 'z' || e.key === 'y')) {
        return; // Let the editor handle undo/redo
      }
      
      // Check for shortcuts
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        onNewNote();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        onSave();
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        onSearch();
      } else if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        onShowShortcuts();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDelete();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        onToggleTheme();
      } else if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        onNextNote();
      } else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        onPrevNote();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        onFocusEditor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewNote, onSave, onSearch, onShowShortcuts, onDelete, onToggleTheme, onNextNote, onPrevNote, onEscape, onFocusEditor]);
};