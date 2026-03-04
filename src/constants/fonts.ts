export const FONTS = {
  regular: 'SpaceMono',
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const POLAROID_FONTS: { key: string; label: string; family: string | undefined }[] = [
  { key: 'sans',      label: 'Moderno',  family: undefined },
  { key: 'georgia',   label: 'Georgia',  family: 'Georgia' },
  { key: 'palatino',  label: 'Palatino', family: 'Palatino' },
  { key: 'times',     label: 'Times',    family: 'Times New Roman' },
  { key: 'courier',   label: 'Courier',  family: 'Courier New' },
  { key: 'spacemono', label: 'Mono',     family: 'SpaceMono' },
];
