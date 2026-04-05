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
  const { theme } = useAppTheme();

  return (
    <TextInput
      accessibilityLabel={accessibilityLabel ?? placeholder}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      style={{
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      }}
      value={value}
    />
  );
}
