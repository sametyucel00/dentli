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
  if (status === 'healthy') {
    return {
      backgroundColor: colors.surface,
      borderColor: colors.success,
      textColor: colors.text,
      badgeColor: colors.success,
      badgeLabel: 'OK',
    };
  }

  if (status === 'cavity') {
    return {
      backgroundColor: colors.surfaceAccent,
      borderColor: colors.danger,
      textColor: colors.text,
      badgeColor: colors.danger,
      badgeLabel: 'CV',
    };
  }

  if (status === 'missing') {
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.danger,
      textColor: colors.text,
      badgeColor: colors.danger,
      badgeLabel: 'MS',
    };
  }

  if (status === 'root_canal') {
    return {
      backgroundColor: colors.surfaceAccent,
      borderColor: colors.warning,
      textColor: colors.text,
      badgeColor: colors.warning,
      badgeLabel: 'RC',
    };
  }

  if (status === 'filling') {
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.primary,
      textColor: colors.text,
      badgeColor: colors.primary,
      badgeLabel: 'FL',
    };
  }

  if (status === 'implant') {
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.accent,
      textColor: colors.text,
      badgeColor: colors.accent,
      badgeLabel: 'IM',
    };
  }

  if (status === 'crown') {
    return {
      backgroundColor: colors.surfaceAccent,
      borderColor: colors.borderStrong,
      textColor: colors.text,
      badgeColor: colors.borderStrong,
      badgeLabel: 'CR',
    };
  }

  if (status === 'cracked') {
    return {
      backgroundColor: colors.surfaceAccent,
      borderColor: colors.warning,
      textColor: colors.text,
      badgeColor: colors.warning,
      badgeLabel: 'CK',
    };
  }

  if (status === 'sensitivity') {
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.accent,
      textColor: colors.text,
      badgeColor: colors.accent,
      badgeLabel: 'SN',
    };
  }

  if (isProblemZone) {
    return {
      backgroundColor: colors.surfaceAccent,
      borderColor: colors.warning,
      textColor: colors.text,
      badgeColor: colors.warning,
      badgeLabel: '!',
    };
  }

  return {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderStrong,
    textColor: colors.text,
    badgeColor: colors.borderStrong,
    badgeLabel: null,
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
      {colors.badgeLabel ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.badgeColor,
            borderRadius: theme.radii.pill,
            height: 18,
            justifyContent: 'center',
            position: 'absolute',
            right: -4,
            top: -6,
            width: 22,
          }}>
          <Text style={{ color: theme.colors.textInverse, fontSize: 8, lineHeight: 9 }} weight="bold">
            {colors.badgeLabel}
          </Text>
        </View>
      ) : null}
      <Text style={{ color: colors.textColor }} variant="caption" weight="semibold">
        {toothNumber}
      </Text>
    </Pressable>
  );
}
