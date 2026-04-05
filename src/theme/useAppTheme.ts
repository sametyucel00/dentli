import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useAppStore } from '@/src/state/useAppStore';
import { createAppTheme } from '@/src/theme';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.themeMode);

  const colorScheme =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode;

  const theme = useMemo(() => createAppTheme(colorScheme), [colorScheme]);

  return {
    colorScheme,
    theme,
  };
}
