import React, { useEffect, useState, useRef } from 'react';
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { Note } from '../types';
import { Calendar, Clock, Hash, FileText, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
}

const NoteEditorComponent = React.forwardRef<any, NoteEditorProps>(({ note, onSave, zenMode = false, onToggleZenMode }, ref) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom percentage
  const { theme } = useTheme();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDeleting = useRef(false);
  const isInitializing = useRef(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  const editor = useCreateBlockNote({
    initialContent: (() => {
      try {
        if (note?.content && note.content !== '' && typeof note.content === 'string' && note.content.startsWith('[')) {
          return JSON.parse(note.content);
        }
      } catch (e) {
        console.error('Error parsing initial content:', e);
      }
      return undefined;
    })(),
    uploadFile: undefined, // Disable file uploads to save memory
  });

  useEffect(() => {
    if (note && editor) {
      try {
        // Mark as initializing to prevent save during setup
        isInitializing.current = true;
        
        if (note.content && note.content !== '' && typeof note.content === 'string' && note.content.startsWith('[')) {
          const parsedContent = JSON.parse(note.content);
          editor.replaceBlocks(editor.document, parsedContent);
        } else {
          // For new notes with empty content, create default structure
          editor.replaceBlocks(editor.document, [
            {
              type: "heading",
              props: {
                level: 1,
              },
              content: "New Note",
            },
            {
              type: "paragraph",
              content: "",
            },
          ]);
        }
        updateWordCount();
        
        // Reset initializing flag after a brief delay
        setTimeout(() => {
          isInitializing.current = false;
        }, 10);
        
        // Focus editor for new notes (empty content)
        if (!note.content || note.content === '') {
          setTimeout(() => {
            const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
            if (editorElement) {
              editorElement.focus();
            }
          }, 0);
        }
      } catch (e) {
        console.error('Error parsing content:', e);
      }
    }
  }, [note?.id]);

  // Update editor theme when it changes
  useEffect(() => {
    if (editor) {
      // Force re-render of BlockNote with new theme
      const editorElement = document.querySelector('.bn-editor');
      if (editorElement) {
        editorElement.setAttribute('data-theme', theme);
      }
    }
  }, [theme, editor]);

  const updateWordCount = () => {
    if (editor) {
      const text = editor.document.map((block: any) => 
        typeof block.content === 'string' ? block.content : 
        Array.isArray(block.content) ? block.content.map((c: any) => c.text || '').join('') : ''
      ).join(' ');
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
    }
  };

  const handleSave = async () => {
    if (!note || !editor) return;
    
    setIsSaving(true);
    const blocks = editor.document;
    const content = JSON.stringify(blocks);
    
    // Extract title from first block (heading or paragraph)
    let title = 'Untitled';
    if (blocks.length > 0) {
      const firstBlock = blocks[0] as any;
      if (typeof firstBlock.content === 'string') {
        title = firstBlock.content.substring(0, 50).trim() || 'Untitled';
      } else if (Array.isArray(firstBlock.content)) {
        title = firstBlock.content.map((c: any) => c.text || '').join('').substring(0, 50).trim() || 'Untitled';
      }
    }
    
    onSave({
      ...note,
      title,
      content,
      updatedAt: new Date(),
    });

    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 300);
  };

  const handleChange = () => {
    // Don't save if we're deleting a note or initializing
    if (isDeleting.current || isInitializing.current) return;
    
    updateWordCount();
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // Save more aggressively - reduced debounce to 100ms
    saveTimeoutRef.current = setTimeout(handleSave, 100);
  };

  // Clear save timeout when note changes or component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [note?.id]);

  // Reset flags when note changes
  useEffect(() => {
    isDeleting.current = false;
    isInitializing.current = false;
  }, [note?.id]);

  // Handle Ctrl+Scroll for zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && editorContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        setZoomLevel(prev => {
          const newZoom = prev + delta;
          // Clamp between 50% and 200%
          return Math.min(Math.max(newZoom, 50), 200);
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Save on window blur or visibility change
  useEffect(() => {
    const handleBlur = () => {
      if (note && editor && !isDeleting.current) {
        handleSave();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && note && editor && !isDeleting.current) {
        handleSave();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [note, editor]);


  // Expose save and focus methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    save: handleSave,
    cancelSave: () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      isDeleting.current = true;
    },
    focus: () => {
      // Focus the BlockNote editor - try multiple selectors
      setTimeout(() => {
        const editorElement = document.querySelector('.ProseMirror') as HTMLElement ||
                             document.querySelector('.bn-editor [contenteditable]') as HTMLElement ||
                             document.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editorElement) {
          editorElement.focus();
          // Place cursor at the end
          const selection = window.getSelection();
          const range = document.createRange();
          if (selection && editorElement.lastChild) {
            range.selectNodeContents(editorElement);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 0);
    }
  }));

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  };

  if (!note) {
    return (
      <div style={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--editor-bg)',
        color: 'var(--muted)'
      }}>
        <div style={{ 
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p style={{ 
            fontSize: '1.125rem',
            fontWeight: 500,
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)'
          }}>
            No note selected
          </p>
          <p style={{ 
            fontSize: '0.875rem',
            color: 'var(--muted)'
          }}>
            Create a new note or select an existing one
          </p>
          <p style={{ 
            fontSize: '0.75rem',
            color: 'var(--muted)',
            marginTop: '1rem'
          }}>
            Press <kbd style={{
              padding: '0.125rem 0.375rem',
              backgroundColor: 'var(--surface)',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontFamily: 'JetBrains Mono, monospace',
              border: '1px solid var(--border)'
            }}>Ctrl+N</kbd> to create a new note
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--editor-bg)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        backgroundColor: zenMode ? 'var(--editor-bg)' : 'var(--surface)',
        transition: 'all 200ms',
        opacity: zenMode ? 0.3 : 1
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            fontSize: '0.8125rem',
            color: 'var(--muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} />
              <span>{formatDate(note.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Clock size={14} />
              <span>{getReadingTime()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <FileText size={14} />
              <span>{wordCount} words</span>
            </div>
            {note.tags && note.tags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Hash size={14} />
                <span>{note.tags.join(', ')}</span>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onToggleZenMode}
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
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--muted)';
              }}
              title={zenMode ? "Exit Zen mode (Ctrl+Shift+Z)" : "Enter Zen mode (Ctrl+Shift+Z)"}
            >
              {zenMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Editor */}
      <div 
        ref={editorContainerRef}
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: zenMode ? '3rem 2rem' : '2rem 1.5rem',
          transition: 'padding 200ms'
        }}
      >
        <div style={{ 
          maxWidth: zenMode ? '700px' : '900px',
          margin: '0 auto',
          transition: 'max-width 200ms',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          width: `${100 * (100 / zoomLevel)}%`
        }}>
          <BlockNoteView 
            editor={editor} 
            theme={theme}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Zoom indicator */}
      {zoomLevel !== 100 && (
        <div style={{
          position: 'fixed',
          bottom: '3.5rem',
          right: '1.5rem',
          padding: '0.25rem 0.5rem',
          backgroundColor: 'var(--surface)',
          borderRadius: '0.25rem',
          fontSize: '0.6875rem',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--muted)',
          border: '1px solid var(--border)',
          opacity: 0.7,
          pointerEvents: 'none'
        }}>
          {zoomLevel}%
        </div>
      )}

      {/* Save indicator - minimal */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        backgroundColor: 'var(--surface)',
        borderRadius: '0.25rem',
        fontSize: '0.6875rem',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 500,
        opacity: (isSaving || showSaved) ? 0.8 : 0,
        transform: (isSaving || showSaved) ? 'translateY(0)' : 'translateY(5px)',
        transition: 'all 150ms',
        pointerEvents: 'none',
        border: '1px solid var(--border)'
      }}>
        {showSaved ? (
          <>
            <div style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)'
            }} />
            <span style={{ color: 'var(--muted)' }}>Saved</span>
          </>
        ) : (
          <>
            <div style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: 'var(--muted)',
              animation: 'pulse 1s ease-in-out infinite'
            }} />
            <span style={{ color: 'var(--muted)' }}>Saving</span>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
});

NoteEditorComponent.displayName = 'NoteEditor';

export const NoteEditor = React.memo(NoteEditorComponent);