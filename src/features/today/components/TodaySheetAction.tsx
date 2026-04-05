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
        borderColor: theme.colors.border,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        opacity: pressed ? 0.82 : 1,
        padding: theme.spacing.lg,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}>
      <Ionicons color={theme.colors.primary} name={icon} size={20} />
      <Text style={{ marginLeft: theme.spacing.md, flex: 1 }} weight="semibold">
        {label}
      </Text>
      {description ? (
        <Text
          color="muted"
          numberOfLines={1}
          style={{ flex: 1.1, marginLeft: theme.spacing.sm, textAlign: 'right' }}
          variant="caption">
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}
