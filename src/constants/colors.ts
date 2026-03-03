export const COLORS = {
  // Brand
  primary: '#1a1a1a',
  accent: '#F5A623',

  // Backgrounds
  background: {
    light: '#F5F0E8',
    dark: '#111111',
  },

  // Polaroid
  polaroid: {
    frame: '#FAFAFA',
    shadow: 'rgba(0,0,0,0.15)',
    border: '#E8E0D0',
  },

  // Text
  text: {
    primary: {
      light: '#1a1a1a',
      dark: '#F5F0E8',
    },
    secondary: {
      light: '#6B7280',
      dark: '#9CA3AF',
    },
  },

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Tabs
  tabBar: {
    background: {
      light: '#FFFFFF',
      dark: '#111111',
    },
    active: {
      light: '#1a1a1a',
      dark: '#FFFFFF',
    },
    inactive: {
      light: '#9CA3AF',
      dark: '#6B7280',
    },
  },
} as const;
