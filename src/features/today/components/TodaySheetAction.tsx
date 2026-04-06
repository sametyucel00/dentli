import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

export function TodaySheetAction({
  icon,
  label,
  description,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description?: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radii.md,
        flexBasis: '48%',
        gap: theme.spacing.sm,
        justifyContent: 'center',
        minHeight: 112,
        opacity: pressed ? 0.82 : 1,
        padding: theme.spacing.lg,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}>
      <Ionicons color={theme.colors.primary} name={icon} size={20} />
      <Text style={{ textAlign: 'center' }} weight="semibold">
        {label}
      </Text>
      {description ? (
        <Text
          color="muted"
          numberOfLines={2}
          style={{ textAlign: 'center' }}
          variant="caption">
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}
