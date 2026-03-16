import { useSettingsStore } from '~/store/settingsStore';
import { en } from './translations/en';
import { it } from './translations/it';

export type Language = 'en' | 'it';

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  return language === 'it' ? it : en;
}

export { en, it };
