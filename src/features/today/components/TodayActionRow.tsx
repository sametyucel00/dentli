import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { TodayActionDefinition } from '@/src/features/today/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

type Props = {
  action: TodayActionDefinition;
  completed: boolean;
  isLast: boolean;
  label: string;
  optionalLabel: string;
  helperLabel: string;
  onPress: () => void;
};

export function TodayActionRow({
  action,
  completed,
  isLast,
  label,
  optionalLabel,
  helperLabel,
  onPress,
}: Props) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ checked: completed }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          opacity: pressed ? 0.78 : 1,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md + 2,
        },
      ]}>
      <View style={{ flex: 1 }}>
        <Text weight="semibold">{label}</Text>
        <Text color="muted" variant="caption" style={{ marginTop: theme.spacing.xxs }}>
          {helperLabel}
          {action.optional && !completed ? ` • ${optionalLabel}` : ''}
        </Text>
      </View>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: completed ? theme.colors.primary : theme.colors.surfaceMuted,
            borderColor: completed ? theme.colors.primary : theme.colors.borderStrong,
          },
        ]}>
        {completed ? (
          <Ionicons color={theme.colors.textInverse} name="checkmark" size={16} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dot: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
