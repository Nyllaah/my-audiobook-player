import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audiobook } from '@/types/audiobook';
import { AudiobookNote } from '@/types/note';

const AUDIOBOOKS_KEY = '@audiobooks';
const SETTINGS_KEY = '@settings';
const NOTES_KEY = '@audiobook_notes';

export interface AppSettings {
  defaultPlaybackRate: number;
  skipForwardSeconds: number;
  skipBackwardSeconds: number;
  theme: 'light' | 'dark' | 'auto';
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultPlaybackRate: 1.0,
  skipForwardSeconds: 30,
  skipBackwardSeconds: 15,
  theme: 'auto',
};

export class StorageService {
  async getAudiobooks(): Promise<Audiobook[]> {
    try {
      const data = await AsyncStorage.getItem(AUDIOBOOKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get audiobooks:', error);
      return [];
    }
  }

  async saveAudiobooks(audiobooks: Audiobook[]): Promise<void> {
    try {
      await AsyncStorage.setItem(AUDIOBOOKS_KEY, JSON.stringify(audiobooks));
    } catch (error) {
      console.error('Failed to save audiobooks:', error);
    }
  }

  async addAudiobook(audiobook: Audiobook): Promise<void> {
    try {
      const audiobooks = await this.getAudiobooks();
      audiobooks.push(audiobook);
      await this.saveAudiobooks(audiobooks);
    } catch (error) {
      console.error('Failed to add audiobook:', error);
    }
  }

  async updateAudiobook(id: string, updates: Partial<Audiobook>): Promise<void> {
    try {
      const audiobooks = await this.getAudiobooks();
      const index = audiobooks.findIndex((book) => book.id === id);
      if (index !== -1) {
        audiobooks[index] = { ...audiobooks[index], ...updates };
        await this.saveAudiobooks(audiobooks);
      }
    } catch (error) {
      console.error('Failed to update audiobook:', error);
    }
  }

  async deleteAudiobook(id: string): Promise<void> {
    try {
      const audiobooks = await this.getAudiobooks();
      const filtered = audiobooks.filter((book) => book.id !== id);
      await this.saveAudiobooks(filtered);
      await this.deleteNotesForAudiobook(id);
    } catch (error) {
      console.error('Failed to delete audiobook:', error);
    }
  }

  async getNotes(audiobookId: string): Promise<AudiobookNote[]> {
    try {
      const data = await AsyncStorage.getItem(NOTES_KEY);
      const all: AudiobookNote[] = data ? JSON.parse(data) : [];
      return all.filter((n) => n.audiobookId === audiobookId).sort((a, b) => a.positionSeconds - b.positionSeconds);
    } catch (error) {
      console.error('Failed to get notes:', error);
      return [];
    }
  }

  async addNote(note: Omit<AudiobookNote, 'id' | 'createdAt'>): Promise<AudiobookNote> {
    try {
      const data = await AsyncStorage.getItem(NOTES_KEY);
      const all: AudiobookNote[] = data ? JSON.parse(data) : [];
      const newNote: AudiobookNote = {
        ...note,
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdAt: Date.now(),
      };
      all.push(newNote);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(all));
      return newNote;
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NOTES_KEY);
      const all: AudiobookNote[] = data ? JSON.parse(data) : [];
      const filtered = all.filter((n) => n.id !== noteId);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  private async deleteNotesForAudiobook(audiobookId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NOTES_KEY);
      const all: AudiobookNote[] = data ? JSON.parse(data) : [];
      const filtered = all.filter((n) => n.audiobookId !== audiobookId);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete notes for audiobook:', error);
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
}

export const storageService = new StorageService();
