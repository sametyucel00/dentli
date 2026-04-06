import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base/Text';

export function FloatingActionButton({
  icon = 'add',
  label,
  onPress,
  accessibilityLabel,
  bottomOffset,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  bottomOffset?: number;
}) {
  const { colorScheme, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const resolvedBottomOffset = bottomOffset ?? 40 + insets.bottom;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? 'Open quick actions'}
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 999,
        bottom: resolvedBottomOffset,
        flexDirection: 'row',
        gap: label ? theme.spacing.sm : 0,
        height: 56,
        justifyContent: 'center',
        minWidth: label ? 132 : 56,
        paddingHorizontal: label ? theme.spacing.lg : 0,
        position: 'absolute',
        right: theme.spacing.xl,
        width: label ? undefined : 56,
        ...(colorScheme === 'dark' ? theme.shadows.floating : null),
      }}>
      <Ionicons color={theme.colors.textInverse} name={icon} size={24} />
      {label ? (
        <Text style={{ color: theme.colors.textInverse }} weight="semibold">
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
