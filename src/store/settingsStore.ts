import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CountdownFormat } from '~/types/event';
import { DEFAULT_COUNTDOWN_FORMAT } from '~/constants/countdown';
import { dbFetchProfile } from '~/services/database';
import type { Language } from '~/i18n';

export type ThemeMode = 'system' | 'light' | 'dark';

export const ACCENT_COLORS = [
  { key: 'orange', value: '#E8754A', label: 'Arancione' },
  { key: 'blue',   value: '#4A8CE8', label: 'Blu' },
  { key: 'purple', value: '#8B72E8', label: 'Viola' },
  { key: 'green',  value: '#4ABB7B', label: 'Verde' },
  { key: 'pink',   value: '#E8587A', label: 'Rosa' },
  { key: 'teal',   value: '#2EB8A6', label: 'Teal' },
] as const;

export type AccentKey = typeof ACCENT_COLORS[number]['key'];
export const DEFAULT_ACCENT = '#E8754A';

interface SettingsStore {
  defaultCountdownFormat: CountdownFormat;
  notificationsEnabled: boolean;
  themeMode: ThemeMode;
  accentColor: string;
  language: Language;
  setDefaultCountdownFormat: (format: CountdownFormat) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setLanguage: (language: Language) => void;
  /** Fetch profile from Supabase and apply theme preference */
  loadProfile: (userId: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultCountdownFormat: DEFAULT_COUNTDOWN_FORMAT,
      notificationsEnabled: true,
      themeMode: 'system' as ThemeMode,
      accentColor: DEFAULT_ACCENT,
      language: 'en' as Language,

      setDefaultCountdownFormat: (format) => set({ defaultCountdownFormat: format }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setAccentColor: (color) => set({ accentColor: color }),
      setLanguage: (language) => set({ language }),

      loadProfile: async (userId) => {
        const { themePreference, error } = await dbFetchProfile(userId);
        if (error || !themePreference) return;
        set({ themeMode: themePreference });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
