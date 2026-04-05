import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';

export function FloatingActionButton({
  icon = 'add',
  onPress,
  accessibilityLabel,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const { theme } = useAppTheme();

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
        bottom: theme.spacing.xxxl,
        height: 56,
        justifyContent: 'center',
        position: 'absolute',
        right: theme.spacing.xl,
        width: 56,
        ...theme.shadows.floating,
      }}>
      <Ionicons color={theme.colors.textInverse} name={icon} size={24} />
    </Pressable>
  );
}
