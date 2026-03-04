import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CountdownFormat } from '~/types/event';
import { DEFAULT_COUNTDOWN_FORMAT } from '~/constants/countdown';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsStore {
  defaultCountdownFormat: CountdownFormat;
  notificationsEnabled: boolean;
  themeMode: ThemeMode;
  setDefaultCountdownFormat: (format: CountdownFormat) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultCountdownFormat: DEFAULT_COUNTDOWN_FORMAT,
      notificationsEnabled: true,
      themeMode: 'system' as ThemeMode,

      setDefaultCountdownFormat: (format) => set({ defaultCountdownFormat: format }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
