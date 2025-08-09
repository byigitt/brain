import { fs, path } from '@tauri-apps/api';
import { documentDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/api/dialog';
import { Note } from '../types';

const SETTINGS_KEY = 'brain_storage_path';
const DEFAULT_FOLDER_NAME = 'Brain';

export class FileStorage {
  private storagePathPromise: Promise<string>;

  constructor() {
    this.storagePathPromise = this.initializeStoragePath();
  }

  private async initializeStoragePath(): Promise<string> {
    // Try to get saved path from localStorage
    const savedPath = localStorage.getItem(SETTINGS_KEY);
    if (savedPath && await this.pathExists(savedPath)) {
      return savedPath;
    }

    // Create default path in Documents/Brain
    const docsDir = await documentDir();
    const defaultPath = await path.join(docsDir, DEFAULT_FOLDER_NAME);
    
    // Create the folder if it doesn't exist
    if (!await this.pathExists(defaultPath)) {
      await fs.createDir(defaultPath, { recursive: true });
    }
    
    localStorage.setItem(SETTINGS_KEY, defaultPath);
    return defaultPath;
  }

  private async pathExists(path: string): Promise<boolean> {
    try {
      await fs.readDir(path);
      return true;
    } catch {
      return false;
    }
  }

  async getStoragePath(): Promise<string> {
    return this.storagePathPromise;
  }

  async changeStorageFolder(): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await this.getStoragePath(),
      title: 'Select Notes Storage Folder'
    });

    if (selected && typeof selected === 'string') {
      localStorage.setItem(SETTINGS_KEY, selected);
      this.storagePathPromise = Promise.resolve(selected);
      
      // Create a Brain subfolder if the selected folder is not already named Brain
      const folderName = await path.basename(selected);
      if (folderName !== DEFAULT_FOLDER_NAME) {
        const brainPath = await path.join(selected, DEFAULT_FOLDER_NAME);
        if (!await this.pathExists(brainPath)) {
          await fs.createDir(brainPath, { recursive: true });
        }
        localStorage.setItem(SETTINGS_KEY, brainPath);
        this.storagePathPromise = Promise.resolve(brainPath);
        return brainPath;
      }
      
      return selected;
    }
    
    return null;
  }

  private async getNotePath(noteId: string): Promise<string> {
    const storagePath = await this.getStoragePath();
    return path.join(storagePath, `${noteId}.json`);
  }

  private async getIndexPath(): Promise<string> {
    const storagePath = await this.getStoragePath();
    return path.join(storagePath, '.index.json');
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const storagePath = await this.getStoragePath();
      const files = await fs.readDir(storagePath);
      const notes: Note[] = [];

      // Only load note metadata, not full content for list display
      for (const file of files) {
        if (file.name?.endsWith('.json') && !file.name.startsWith('.')) {
          try {
            const filePath = await path.join(storagePath, file.name);
            const content = await fs.readTextFile(filePath);
            const note = JSON.parse(content) as Note;
            
            // For list display, only keep essential fields to reduce memory
            const lightNote: Note = {
              id: note.id,
              title: note.title,
              content: note.content.substring(0, 200), // Only keep preview
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt),
              tags: note.tags
            };
            
            notes.push(lightNote);
          } catch (error) {
            console.error(`Error reading note ${file.name}:`, error);
          }
        }
      }

      // Sort by updated date, newest first
      return notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Error getting notes:', error);
      
      // If the folder doesn't exist, create it
      const storagePath = await this.getStoragePath();
      if (!await this.pathExists(storagePath)) {
        await fs.createDir(storagePath, { recursive: true });
      }
      
      return [];
    }
  }

  async getNote(id: string): Promise<Note | null> {
    try {
      const notePath = await this.getNotePath(id);
      const content = await fs.readTextFile(notePath);
      const note = JSON.parse(content) as Note;
      
      // Ensure dates are Date objects
      note.createdAt = new Date(note.createdAt);
      note.updatedAt = new Date(note.updatedAt);
      
      return note;
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  }

  async saveNote(note: Note): Promise<void> {
    try {
      const notePath = await this.getNotePath(note.id);
      const noteData = {
        ...note,
        updatedAt: new Date().toISOString(),
        createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt
      };
      
      await fs.writeTextFile(notePath, JSON.stringify(noteData, null, 2));
      
      // Update index for faster searching
      await this.updateIndex();
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const notePath = await this.getNotePath(id);
      await fs.removeFile(notePath);
      
      // Update index
      await this.updateIndex();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

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

  private async updateIndex(): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const indexPath = await this.getIndexPath();
      
      const index = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        noteCount: notes.length,
        notes: notes.map(n => ({
          id: n.id,
          title: n.title,
          tags: n.tags,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt
        }))
      };
      
      await fs.writeTextFile(indexPath, JSON.stringify(index, null, 2));
    } catch (error) {
      console.error('Error updating index:', error);
    }
  }

  async exportAllNotes(): Promise<string> {
    const notes = await this.getAllNotes();
    return JSON.stringify(notes, null, 2);
  }

  async importNotes(jsonData: string): Promise<number> {
    try {
      const importedNotes = JSON.parse(jsonData) as Note[];
      let importCount = 0;
      
      for (const note of importedNotes) {
        // Generate new ID to avoid conflicts
        const newNote: Note = {
          ...note,
          id: `imported_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date()
        };
        
        await this.saveNote(newNote);
        importCount++;
      }
      
      return importCount;
    } catch (error) {
      console.error('Error importing notes:', error);
      throw error;
    }
  }
}

export const fileStorage = new FileStorage();