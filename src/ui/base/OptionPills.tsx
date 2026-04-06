import { Pressable, StyleProp, View, ViewStyle, useWindowDimensions } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base/Text';

export function OptionPills<T extends string | number | boolean | null>({
  options,
  selectedValue,
  onSelect,
  labelMap,
  containerStyle,
}: {
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  labelMap: (value: T) => string;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const { colorScheme, theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 390;
  const isNarrowWidth = width < 360;

  return (
    <View
      style={[
        {
          alignItems: 'center',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: isCompactWidth ? theme.spacing.xs : theme.spacing.sm,
          justifyContent: 'center',
        },
        containerStyle,
      ]}>
      {options.map((option) => {
        const selected = option === selectedValue;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={String(option)}
            onPress={() => onSelect(option)}
            style={{
              alignItems: 'center',
              backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceMuted,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radii.pill,
              borderWidth: colorScheme === 'dark' ? 1 : 0,
              flexShrink: 1,
              justifyContent: 'center',
              maxWidth: isNarrowWidth ? '100%' : undefined,
              minHeight: 40,
              minWidth: isCompactWidth ? 78 : 92,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: isCompactWidth ? theme.spacing.xs + 1 : theme.spacing.sm,
            }}>
            <Text
              numberOfLines={2}
              style={{
                color: selected ? theme.colors.textInverse : theme.colors.text,
                lineHeight: theme.typography.caption.fontSize * 1.25,
                textAlign: 'center',
              }}
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
