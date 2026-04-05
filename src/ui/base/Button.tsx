import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base/Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const { theme } = useAppTheme();

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.surfaceMuted
        : 'transparent';

  const borderColor =
    variant === 'ghost' ? theme.colors.border : backgroundColor;

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
          backgroundColor,
          borderColor,
          borderRadius: theme.radii.pill,
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
        style,
      ]}>
      <Text
        style={{ color: textColor, textAlign: 'center' }}
        weight="semibold">
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    minWidth: 140,
  },
});
