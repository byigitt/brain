import localforage from 'localforage';
import { Note } from '../types';

const NOTES_KEY = 'brain_notes';

localforage.config({
  name: 'brain',
  storeName: 'notes',
});

export const storage = {
  async getAllNotes(): Promise<Note[]> {
    try {
      const notes = await localforage.getItem<Note[]>(NOTES_KEY);
      return notes || [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  async getNote(id: string): Promise<Note | null> {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.id === id) || null;
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  },

  async saveNote(note: Note): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const existingIndex = notes.findIndex(n => n.id === note.id);
      
      if (existingIndex >= 0) {
        notes[existingIndex] = { ...note, updatedAt: new Date() };
      } else {
        notes.push(note);
      }
      
      await localforage.setItem(NOTES_KEY, notes);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const filtered = notes.filter(note => note.id !== id);
      await localforage.setItem(NOTES_KEY, filtered);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  },

  async searchNotes(query: string): Promise<Note[]> {
    try {
      const notes = await this.getAllNotes();
      const lowercaseQuery = query.toLowerCase();
      
      return notes.filter(note => 
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }
};