import { useColorScheme } from 'react-native';
import { COLORS } from '~/constants/colors';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
