import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { TitleBar } from './components/TitleBar';
import { ContextMenu } from './components/ContextMenu';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { storage } from './lib/storage';
import { Note } from './types';
import { PanelLeft } from 'lucide-react';

function AppContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(
    () => (localStorage.getItem('sidebarPosition') as 'left' | 'right') || 'left'
  );
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [previousFocusElement, setPreviousFocusElement] = useState<HTMLElement | null>(null);
  const { toggleTheme } = useTheme();
  const editorRef = useRef<any>(null);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const loadedNotes = await storage.getAllNotes();
      setNotes(loadedNotes);
      setFilteredNotes(loadedNotes);
      
      // If there are notes and none selected, select the first one
      if (loadedNotes.length > 0 && !selectedNote) {
        setSelectedNote(loadedNotes[0]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = () => {
    // Create minimal note object first
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '', // Start with empty content for faster creation
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };

    // Update state immediately for instant feedback
    setNotes([newNote, ...notes]);
    setFilteredNotes([newNote, ...filteredNotes]);
    
    // Directly set the selected note without saving the previous one
    setSelectedNote(newNote);
    
    // Note will be saved when user starts typing (through the editor's onChange)
  };

  const handleSaveNote = async (updatedNote: Note) => {
    await storage.saveNote(updatedNote);
    
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    setSelectedNote(updatedNote);
  };

  const handleDeleteNote = async (note: Note) => {
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    
    // Cancel any pending saves
    if (editorRef.current?.cancelSave) {
      editorRef.current.cancelSave();
    }
    
    await storage.deleteNote(noteToDelete.id);
    const updatedNotes = notes.filter(note => note.id !== noteToDelete.id);
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    
    if (selectedNote?.id === noteToDelete.id) {
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    }
    
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const results = await storage.searchNotes(query);
      setFilteredNotes(results);
    }
  };

  const handleNextNote = async () => {
    if (filteredNotes.length === 0) return;
    const currentIndex = filteredNotes.findIndex(n => n.id === selectedNote?.id);
    const nextIndex = (currentIndex + 1) % filteredNotes.length;
    await handleSelectNote(filteredNotes[nextIndex]);
  };

  const handlePrevNote = async () => {
    if (filteredNotes.length === 0) return;
    const currentIndex = filteredNotes.findIndex(n => n.id === selectedNote?.id);
    const prevIndex = currentIndex === 0 ? filteredNotes.length - 1 : currentIndex - 1;
    await handleSelectNote(filteredNotes[prevIndex]);
  };

  const handleSelectNote = async (note: Note | null, skipSave: boolean = false) => {
    // Save current note before switching (unless explicitly skipped)
    if (!skipSave && selectedNote && editorRef.current?.save) {
      await editorRef.current.save();
    }
    
    // If selecting a note, load its full content (sidebar only has preview)
    if (note) {
      const fullNote = await storage.getNote(note.id);
      setSelectedNote(fullNote);
    } else {
      setSelectedNote(null);
    }
  };

  const handleStoragePathChange = async () => {
    // Reload notes from new location
    await loadNotes();
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleSidebarPosition = () => {
    const newPosition = sidebarPosition === 'left' ? 'right' : 'left';
    setSidebarPosition(newPosition);
    localStorage.setItem('sidebarPosition', newPosition);
  };

  const handleSidebarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleToggleZenMode = () => {
    setZenMode(!zenMode);
  };

  const handleEscape = () => {
    setShowShortcuts(false);
    // Clear search if search input is focused
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput && document.activeElement === searchInput) {
      searchInput.value = '';
      searchInput.blur();
      handleSearch('');
    }
  };

  // Mouse handlers for resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 500) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Effect for resize handling - must be before any conditional returns
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Use handleCreateNote directly - no need for debouncing since it's instant now

  // Keyboard shortcuts
  useKeyboardShortcuts(
    handleCreateNote,
    () => editorRef.current?.save?.(),
    () => (document.querySelector('input[type="text"]') as HTMLInputElement)?.focus(),
    () => setShowShortcuts(true),
    () => selectedNote && handleDeleteNote(selectedNote),
    toggleTheme,
    handleNextNote,
    handlePrevNote,
    handleEscape,
    () => {
      const activeElement = document.activeElement as HTMLElement;
      const isInEditor = activeElement?.closest('.ProseMirror') || 
                        activeElement?.closest('.bn-editor') ||
                        activeElement?.hasAttribute('contenteditable');
      
      if (isInEditor && previousFocusElement) {
        // Go back to previous focus
        previousFocusElement.focus();
        setPreviousFocusElement(null);
      } else if (!isInEditor) {
        // Save current focus and go to editor
        setPreviousFocusElement(activeElement);
        if (editorRef.current?.focus) {
          editorRef.current.focus();
        }
      }
    },
    handleToggleSidebar,
    handleToggleZenMode
  );

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg)'
      }}>
        <div style={{ color: 'var(--muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg)',
        overflow: 'hidden'
      }}>
        <TitleBar onShowShortcuts={() => setShowShortcuts(true)} />
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <>
            {/* Toggle button - always visible */}
            {sidebarCollapsed && (
              <button
                onClick={handleToggleSidebar}
                style={{
                  position: 'absolute',
                  [sidebarPosition === 'left' ? 'left' : 'right']: '0.75rem',
                  bottom: '0.75rem',
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 20,
                  color: 'var(--muted)',
                  transition: 'all 150ms',
                  opacity: zenMode ? 0.3 : 1
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--surface)';
                  e.currentTarget.style.color = 'var(--muted)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = zenMode ? '0.3' : '1';
                }}
                title="Expand sidebar (Ctrl+B)"
              >
                <PanelLeft size={18} />
              </button>
            )}
            
            <div 
              style={{ 
                width: sidebarCollapsed ? '0px' : `${sidebarWidth}px`,
                position: 'relative',
                flexShrink: 0,
                transition: 'width 200ms ease-in-out',
                overflow: 'hidden',
                order: sidebarPosition === 'left' ? 0 : 2
              }}
              onContextMenu={handleSidebarContextMenu}
            >
              <div style={{
                width: `${sidebarWidth}px`,
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0
              }}>
                <Sidebar
                  notes={filteredNotes}
                  selectedNote={selectedNote}
                  onSelectNote={handleSelectNote}
                  onCreateNote={handleCreateNote}
                  onDeleteNote={handleDeleteNote}
                  onSearch={handleSearch}
                  onShowShortcuts={() => setShowShortcuts(true)}
                  toggleTheme={toggleTheme}
                  onStoragePathChange={handleStoragePathChange}
                  collapsed={sidebarCollapsed}
                  onToggleCollapse={handleToggleSidebar}
                  zenMode={zenMode}
                />
                {/* Resize handle */}
                {!sidebarCollapsed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      [sidebarPosition === 'left' ? 'right' : 'left']: -2,
                      bottom: 0,
                      width: '4px',
                      cursor: 'col-resize',
                      backgroundColor: isResizing ? 'var(--accent)' : 'transparent',
                      transition: 'background-color 150ms',
                      zIndex: 10
                    }}
                    onMouseDown={() => setIsResizing(true)}
                    onMouseEnter={e => {
                      if (!isResizing) {
                        e.currentTarget.style.backgroundColor = 'var(--border)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isResizing) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </>
          <div style={{ flex: 1, display: 'flex', order: 1 }}>
            <NoteEditor
              ref={editorRef}
              note={selectedNote}
              onSave={handleSaveNote}
              zenMode={zenMode}
              onToggleZenMode={handleToggleZenMode}
            />
          </div>
        </div>
      </div>
      <ShortcutsModal 
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title || 'this note'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        danger={true}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          sidebarPosition={sidebarPosition}
          onTogglePosition={handleToggleSidebarPosition}
        />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;