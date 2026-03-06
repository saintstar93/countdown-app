import { useColorScheme } from 'react-native';
import { COLORS } from '~/constants/colors';
import { useSettingsStore } from '~/store/settingsStore';

/** Returns true if the effective color scheme is dark, respecting the user's themeMode setting. */
export function useIsDark(): boolean {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const systemScheme = useColorScheme();

  if (themeMode === 'dark') return true;
  if (themeMode === 'light') return false;
  return systemScheme === 'dark';
}

export function useTheme() {
  const isDark = useIsDark();

  return {
    isDark,
    colors: {
      background: isDark ? COLORS.background.dark : COLORS.background.light,
      text: isDark ? COLORS.text.primary.dark : COLORS.text.primary.light,
      textSecondary: isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light,
      tabBar: {
        background: isDark ? COLORS.tabBar.background.dark : COLORS.tabBar.background.light,
        active: isDark ? COLORS.tabBar.active.dark : COLORS.tabBar.active.light,
        inactive: isDark ? COLORS.tabBar.inactive.dark : COLORS.tabBar.inactive.light,
      },
    },
  };
}
