import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base/Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonTextVariant = 'body' | 'caption';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  compact?: boolean;
  titleVariant?: ButtonTextVariant;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
  accessibilityLabel,
  compact = false,
  titleVariant = 'body',
}: Props) {
  const { theme } = useAppTheme();

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.surfaceMuted
        : 'transparent';

  const borderColor = 'transparent';

  const textColor =
    variant === 'primary' ? theme.colors.textInverse : theme.colors.text;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          alignItems: 'center',
          backgroundColor,
          borderColor,
          borderWidth: 0,
          borderRadius: theme.radii.pill,
          justifyContent: 'center',
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
          paddingHorizontal: compact ? theme.spacing.md : theme.spacing.lg,
          paddingVertical: compact ? theme.spacing.sm + 2 : theme.spacing.md,
        },
        style,
      ]}>
      <Text
        variant={titleVariant}
        style={{ color: textColor, textAlign: 'center' }}
        weight="semibold">
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 0,
  },
});
