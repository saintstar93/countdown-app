import { useSettingsStore } from '~/store/settingsStore';

export function useAccentColor(): string {
  return useSettingsStore((s) => s.accentColor);
}
