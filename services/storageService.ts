import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audiobook } from '@/types/audiobook';

const AUDIOBOOKS_KEY = '@audiobooks';
const SETTINGS_KEY = '@settings';

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
    } catch (error) {
      console.error('Failed to delete audiobook:', error);
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
