export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

export const radii = {
  xs: 8,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  overline: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  display: {
    fontSize: 32,
    lineHeight: 38,
  },
} as const;

const sharedColors = {
  primary: '#0F7B6C',
  primaryPressed: '#0B6256',
  primarySoft: '#D7F1EC',
  accent: '#1F9D8B',
  success: '#22A06B',
  warning: '#B7791F',
  danger: '#D64545',
  white: '#FFFFFF',
  black: '#111827',
} as const;

export const palette = {
  light: {
    ...sharedColors,
    background: '#F5F7FB',
    backgroundElevated: '#ECF2F8',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF2F8',
    surfaceAccent: '#F2FBF9',
    text: '#132238',
    textMuted: '#607086',
    textInverse: '#F8FBFF',
    border: '#D7DFEA',
    borderStrong: '#B8C6D8',
    tabIconDefault: '#7A8798',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
  dark: {
    ...sharedColors,
    background: '#09131F',
    backgroundElevated: '#10202F',
    surface: '#122132',
    surfaceMuted: '#183045',
    surfaceAccent: '#133A38',
    text: '#F5F8FC',
    textMuted: '#9DB1C6',
    textInverse: '#09131F',
    border: '#21384D',
    borderStrong: '#2D4C66',
    tabIconDefault: '#6D8196',
    shadow: 'rgba(0, 0, 0, 0.28)',
  },
} as const;

export const shadows = {
  card: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 3,
  },
  floating: {
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 5,
  },
} as const;
