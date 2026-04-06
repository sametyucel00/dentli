import { View } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
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

  return (
    <Card>
      <Text variant="title" weight="semibold">
        {title}
      </Text>
      <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
        {subtitle}
      </Text>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        {segments.map((segment, segmentIndex) => (
          <View
            key={segmentIndex}
            style={{
              flex: 1,
              gap: theme.spacing.sm,
            }}>
            {segment.map((toothNumber) => {
              const tooth = teeth.find((item) => item.toothNumber === toothNumber);
              if (!tooth) return null;

              return (
                <ToothCell
                  key={toothNumber}
                  disabled={!isInteractive}
                  isProblemZone={tooth.isProblemZone}
                  onPress={() => onSelectTooth(toothNumber)}
                  status={tooth.status}
                  toothNumber={toothNumber}
                />
              );
            })}
          </View>
        ))}
      </View>
    </Card>
  );
}
