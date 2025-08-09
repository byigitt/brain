import { fileStorage } from './fileStorage';
import { migrateToFileStorage } from './storageMigration';
import { Note } from '../types';

// Initialize migration on module load
let migrationPromise: Promise<boolean> | null = null;

async function ensureMigration() {
  if (!migrationPromise) {
    migrationPromise = migrateToFileStorage();
  }
  return migrationPromise;
}

export const storage = {
  async getAllNotes(): Promise<Note[]> {
    await ensureMigration();
    return fileStorage.getAllNotes();
  },

  async getNote(id: string): Promise<Note | null> {
    await ensureMigration();
    return fileStorage.getNote(id);
  },

  async saveNote(note: Note): Promise<void> {
    await ensureMigration();
    return fileStorage.saveNote(note);
  },

  async deleteNote(id: string): Promise<void> {
    await ensureMigration();
    return fileStorage.deleteNote(id);
  },

  async searchNotes(query: string): Promise<Note[]> {
    await ensureMigration();
    return fileStorage.searchNotes(query);
  },

  // New methods for file storage
  async changeStorageFolder(): Promise<string | null> {
    await ensureMigration();
    return fileStorage.changeStorageFolder();
  },

  async getStoragePath(): Promise<string> {
    await ensureMigration();
    return fileStorage.getStoragePath();
  },

  async exportAllNotes(): Promise<string> {
    await ensureMigration();
    return fileStorage.exportAllNotes();
  },

  async importNotes(jsonData: string): Promise<number> {
    await ensureMigration();
    return fileStorage.importNotes(jsonData);
  }
};