import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { TitleBar } from './components/TitleBar';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { storage } from './lib/storage';
import { Note } from './types';

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
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: JSON.stringify([
        {
          type: "heading",
          props: {
            level: 1,
          },
          content: "New Note",
        },
        {
          type: "paragraph",
          content: "Start writing here...",
        },
      ]),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };

    setNotes([newNote, ...notes]);
    setFilteredNotes([newNote, ...filteredNotes]);
    setSelectedNote(newNote);
    storage.saveNote(newNote);
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

  const handleNextNote = () => {
    if (filteredNotes.length === 0) return;
    const currentIndex = filteredNotes.findIndex(n => n.id === selectedNote?.id);
    const nextIndex = (currentIndex + 1) % filteredNotes.length;
    setSelectedNote(filteredNotes[nextIndex]);
  };

  const handlePrevNote = () => {
    if (filteredNotes.length === 0) return;
    const currentIndex = filteredNotes.findIndex(n => n.id === selectedNote?.id);
    const prevIndex = currentIndex === 0 ? filteredNotes.length - 1 : currentIndex - 1;
    setSelectedNote(filteredNotes[prevIndex]);
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
    }
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
          <div style={{ 
            width: `${sidebarWidth}px`,
            position: 'relative',
            flexShrink: 0
          }}>
            <Sidebar
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              onSearch={handleSearch}
              onShowShortcuts={() => setShowShortcuts(true)}
              toggleTheme={toggleTheme}
            />
            {/* Resize handle */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: -2,
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
          </div>
          <NoteEditor
            ref={editorRef}
            note={selectedNote}
            onSave={handleSaveNote}
          />
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