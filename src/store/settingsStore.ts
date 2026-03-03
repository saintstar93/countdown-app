import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CountdownFormat } from '~/types/event';
import { DEFAULT_COUNTDOWN_FORMAT } from '~/constants/countdown';

interface SettingsStore {
  defaultCountdownFormat: CountdownFormat;
  notificationsEnabled: boolean;
  setDefaultCountdownFormat: (format: CountdownFormat) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultCountdownFormat: DEFAULT_COUNTDOWN_FORMAT,
      notificationsEnabled: true,

      setDefaultCountdownFormat: (format) => set({ defaultCountdownFormat: format }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
