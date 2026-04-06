import { useState } from 'react';
import { TextInput } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';

export function TextField({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  accessibilityLabel,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
  accessibilityLabel?: string;
}) {
  const { colorScheme, theme } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusBorderColor =
    colorScheme === 'dark' ? theme.colors.accent : theme.colors.primary;

  return (
    <TextInput
      accessibilityLabel={accessibilityLabel ?? placeholder}
      keyboardType={keyboardType}
      onBlur={() => setIsFocused(false)}
      onChangeText={onChangeText}
      onFocus={() => setIsFocused(true)}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      style={{
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: focusBorderColor,
        borderRadius: theme.radii.md,
        borderWidth: isFocused ? 1 : 0,
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      }}
      value={value}
    />
  );
}
