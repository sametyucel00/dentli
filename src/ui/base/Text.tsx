import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text as RNText, TextStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';

export type AppTextVariant = 'caption' | 'body' | 'bodyStrong' | 'title' | 'display';
export type AppTextTone = 'default' | 'muted' | 'primary';
export type AppTextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

type Props = {
  children: ReactNode;
  variant?: AppTextVariant;
  color?: AppTextTone;
  weight?: AppTextWeight;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

const FONT_WEIGHTS: Record<AppTextWeight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export function Text({
  children,
  variant = 'body',
  color = 'default',
  weight = 'regular',
  style,
  numberOfLines,
}: Props) {
  const { theme } = useAppTheme();

  const textColor =
    color === 'muted'
      ? theme.colors.textMuted
      : color === 'primary'
        ? theme.colors.primary
        : theme.colors.text;

  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        theme.typography[variant],
        { color: textColor, fontWeight: FONT_WEIGHTS[weight] },
        style,
      ]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
