import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Clock, FolderOpen } from 'lucide-react';
import { Note } from '../types';

interface SidebarProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (note: Note) => void;
  onSearch: (query: string) => void;
  onShowShortcuts?: () => void;
  toggleTheme?: () => void;
  onNavigateToNotes?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);
  const [focusedNoteIndex, setFocusedNoteIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notesRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
    setFocusedNoteIndex(-1); // Reset focused note when searching
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (notes.length > 0) {
        const newIndex = 0;
        setFocusedNoteIndex(newIndex);
        notesRefs.current[newIndex]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (notes.length > 0) {
        const newIndex = notes.length - 1;
        setFocusedNoteIndex(newIndex);
        notesRefs.current[newIndex]?.focus();
      }
    } else if (e.key === 'Enter' && focusedNoteIndex >= 0 && notes[focusedNoteIndex]) {
      onSelectNote(notes[focusedNoteIndex]);
    }
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = (index + 1) % notes.length;
      setFocusedNoteIndex(newIndex);
      notesRefs.current[newIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = index === 0 ? notes.length - 1 : index - 1;
      setFocusedNoteIndex(newIndex);
      notesRefs.current[newIndex]?.focus();
    } else if (e.key === 'Enter') {
      onSelectNote(notes[index]);
    }
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        focusSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatDate = (date: Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffMs = now.getTime() - noteDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return noteDate.toLocaleDateString();
  };

  const getPreview = (note: Note) => {
    try {
      if (note.content.startsWith('[')) {
        const parsed = JSON.parse(note.content);
        // Skip the first block if it's the title
        const blocks = parsed.length > 1 ? parsed.slice(1) : parsed;
        const text = blocks.map((block: any) => 
          typeof block.content === 'string' ? block.content : 
          Array.isArray(block.content) ? block.content.map((c: any) => c.text || '').join('') : ''
        ).join(' ').trim();
        
        // Remove title from the beginning if it appears
        const cleanText = text.startsWith(note.title) ? text.substring(note.title.length).trim() : text;
        
        // Return only first 20 characters
        return cleanText.substring(0, 20).trim();
      }
    } catch {
      const cleanContent = note.content.replace(/<[^>]*>/g, '');
      // Remove title from content if it appears at the start
      const cleanText = cleanContent.startsWith(note.title) ? 
        cleanContent.substring(note.title.length).trim() : cleanContent;
      return cleanText.substring(0, 20).trim();
    }
    return note.content.substring(0, 20).trim();
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background-color 200ms',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <button
          onClick={onCreateNote}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'transform 150ms, box-shadow 150ms',
            fontFamily: 'JetBrains Mono, monospace'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.background = 'var(--accent-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'var(--accent)';
          }}
        >
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              pointerEvents: 'none'
            }} 
            size={15} 
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search notes..."
            style={{
              width: '100%',
              paddingLeft: '2.25rem',
              paddingRight: '0.75rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              color: 'var(--text)',
              outline: 'none',
              transition: 'border-color 150ms, background-color 150ms',
              fontFamily: 'JetBrains Mono, monospace'
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--input-bg)';
            }}
          />
        </div>
      </div>

      {/* Notes List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0.5rem'
      }}>
        {notes.length === 0 ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: '0.8125rem',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <FolderOpen size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
            <p style={{ fontWeight: 500 }}>No notes yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.375rem' }}>
              Press <kbd style={{
                padding: '0.125rem 0.375rem',
                backgroundColor: 'var(--surface)',
                borderRadius: '0.25rem',
                fontSize: '0.6875rem',
                fontFamily: 'JetBrains Mono, monospace',
                border: '1px solid var(--border)'
              }}>Ctrl+N</kbd> to create one
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  position: 'relative',
                  borderRadius: '0.5rem',
                  transition: 'all 150ms',
                  backgroundColor: selectedNote?.id === note.id 
                    ? 'var(--note-hover)' 
                    : hoveredNote === note.id 
                    ? 'var(--sidebar-hover)' 
                    : 'transparent',
                }}
                onMouseEnter={() => setHoveredNote(note.id)}
                onMouseLeave={() => setHoveredNote(null)}
              >
                <button
                  ref={(el) => { notesRefs.current[notes.indexOf(note)] = el; }}
                  onClick={() => onSelectNote(note)}
                  onKeyDown={(e) => handleNoteKeyDown(e, notes.indexOf(note))}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: selectedNote?.id === note.id 
                      ? '1px solid var(--border)' 
                      : '1px solid transparent',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    position: 'relative',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: focusedNoteIndex === notes.indexOf(note) ? '2px solid var(--accent)' : 'none',
                    outlineOffset: '-2px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <div style={{ 
                      marginTop: '0.125rem',
                      color: selectedNote?.id === note.id ? 'var(--accent)' : 'var(--muted)',
                      transition: 'color 150ms'
                    }}>
                      <FileText size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '0.25rem',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        {note.title || 'Untitled'}
                      </h3>
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4',
                        marginBottom: '0.375rem',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        {getPreview(note) || 'Empty note'}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontSize: '0.6875rem',
                        color: 'var(--muted)',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        <Clock size={11} />
                        <span>{formatDate(note.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Delete button on hover */}
                {hoveredNote === note.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note);
                    }}
                    style={{
                      position: 'absolute',
                      top: '0.625rem',
                      right: '0.625rem',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.375rem',
                      padding: '0.375rem',
                      cursor: 'pointer',
                      color: 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--danger)';
                      e.currentTarget.style.borderColor = 'var(--danger)';
                      e.currentTarget.style.background = 'var(--surface-hover)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--muted)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--surface)';
                    }}
                    title="Delete note (Ctrl+Shift+D)"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};