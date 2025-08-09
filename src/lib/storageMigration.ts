import localforage from 'localforage';
import { fileStorage } from './fileStorage';
import { Note } from '../types';

const NOTES_KEY = 'brain_notes';
const MIGRATION_KEY = 'brain_migration_completed';

export async function migrateToFileStorage(): Promise<boolean> {
  try {
    // Check if migration has already been completed
    const migrationCompleted = localStorage.getItem(MIGRATION_KEY);
    if (migrationCompleted === 'true') {
      return true;
    }

    // Get notes from localforage
    const oldNotes = await localforage.getItem<Note[]>(NOTES_KEY);
    
    if (oldNotes && oldNotes.length > 0) {
      console.log(`Migrating ${oldNotes.length} notes to file storage...`);
      
      // Save each note to file storage
      for (const note of oldNotes) {
        // Ensure dates are Date objects
        note.createdAt = new Date(note.createdAt);
        note.updatedAt = new Date(note.updatedAt);
        
        await fileStorage.saveNote(note);
      }
      
      // Clear localforage after successful migration
      await localforage.removeItem(NOTES_KEY);
      
      // Mark migration as completed
      localStorage.setItem(MIGRATION_KEY, 'true');
      
      console.log('Migration completed successfully');
      return true;
    }
    
    // No notes to migrate, mark as completed
    localStorage.setItem(MIGRATION_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    return false;
  }
}

export async function resetMigration(): Promise<void> {
  localStorage.removeItem(MIGRATION_KEY);
}