import { Pressable, View, useWindowDimensions } from 'react-native';

import { ToothStatus } from '@/src/domain/models';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

type ToothCellProps = {
  toothNumber: number;
  status: ToothStatus;
  isProblemZone: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function getStatusColors(status: ToothStatus, isProblemZone: boolean, colors: any) {
  if (isProblemZone) {
    return {
      backgroundColor: colors.surfaceAccent,
      borderColor: colors.warning,
      textColor: colors.text,
    };
  }

  if (status === 'healthy') {
    return {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      textColor: colors.text,
    };
  }

  return {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderStrong,
    textColor: colors.text,
  };
}

export function ToothCell({
  toothNumber,
  status,
  isProblemZone,
  disabled = false,
  onPress,
}: ToothCellProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 390;
  const colors = getStatusColors(status, isProblemZone, theme.colors);

  return (
    <Pressable
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          justifyContent: 'center',
          minHeight: isCompactWidth ? 46 : 52,
          minWidth: 0,
          opacity: disabled ? 0.65 : pressed ? 0.9 : 1,
          paddingVertical: isCompactWidth ? theme.spacing.xs + 1 : theme.spacing.sm,
          position: 'relative',
          width: '100%',
        },
      ]}>
      {isProblemZone ? (
        <View
          style={{
            backgroundColor: theme.colors.warning,
            borderRadius: theme.radii.pill,
            height: 8,
            position: 'absolute',
            right: theme.spacing.xs,
            top: theme.spacing.xs,
            width: 8,
          }}
        />
      ) : null}
      <Text style={{ color: colors.textColor }} variant="caption" weight="semibold">
        {toothNumber}
      </Text>
    </Pressable>
  );
}
