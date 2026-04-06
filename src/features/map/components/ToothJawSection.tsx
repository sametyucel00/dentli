import { View, useWindowDimensions } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { Card, Text } from '@/src/ui/base';

import { ToothMapItem } from '@/src/features/map/map-model';
import { ToothCell } from '@/src/features/map/components/ToothCell';

type ToothJawSectionProps = {
  title: string;
  subtitle: string;
  segments: readonly (readonly number[])[];
  teeth: ToothMapItem[];
  isInteractive: boolean;
  onSelectTooth: (toothNumber: number) => void;
};

export function ToothJawSection({
  title,
  subtitle,
  segments,
  teeth,
  isInteractive,
  onSelectTooth,
}: ToothJawSectionProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { isTablet, isExpanded } = useResponsiveLayout();
  const isCompactWidth = width < 390;

  return (
    <Card>
      <Text variant="title" weight="semibold">
        {title}
      </Text>
      <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
        {subtitle}
      </Text>

      <View
        style={{
          flexDirection: 'column',
          gap: isExpanded ? theme.spacing.lg : isCompactWidth ? theme.spacing.sm : theme.spacing.md,
          marginTop: theme.spacing.lg,
        }}>
        {segments.map((segment, segmentIndex) => (
          <View
            key={segmentIndex}
            style={{
              flexDirection: 'row',
              gap: isExpanded ? theme.spacing.md : isCompactWidth ? theme.spacing.xs + 1 : theme.spacing.sm,
              justifyContent: 'space-between',
              minWidth: isTablet ? 0 : undefined,
            }}>
            {segment.map((toothNumber) => {
              const tooth = teeth.find((item) => item.toothNumber === toothNumber);
              if (!tooth) return null;

              return (
                <View key={toothNumber} style={{ flex: 1, minWidth: 0 }}>
                  <ToothCell
                    disabled={!isInteractive}
                    isProblemZone={tooth.isProblemZone}
                    onPress={() => onSelectTooth(toothNumber)}
                    status={tooth.status}
                    toothNumber={toothNumber}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </Card>
  );
}
