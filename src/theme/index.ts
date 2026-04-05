import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';

import { palette, radii, shadows, spacing, typography } from '@/src/theme/tokens';

export type AppThemeMode = keyof typeof palette;
export type AppTheme = {
  mode: AppThemeMode;
  colors: (typeof palette)[AppThemeMode];
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
};

export function createAppTheme(mode: AppThemeMode): AppTheme {
  return {
    mode,
    colors: palette[mode],
    spacing,
    radii,
    typography,
    shadows,
  };
}

export function createNavigationTheme(theme: AppTheme): NavigationTheme {
  const baseTheme =
    theme.mode === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.accent,
    },
  };
}
