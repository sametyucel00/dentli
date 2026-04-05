import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base/Text';

export function OptionPills<T extends string | number | null>({
  options,
  selectedValue,
  onSelect,
  labelMap,
}: {
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  labelMap: (value: T) => string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
      {options.map((option) => {
        const selected = option === selectedValue;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={String(option)}
            onPress={() => onSelect(option)}
            style={{
              backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceMuted,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radii.pill,
              borderWidth: 1,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
            }}>
            <Text
              style={{ color: selected ? theme.colors.textInverse : theme.colors.text }}
              variant="caption"
              weight="semibold">
              {labelMap(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
