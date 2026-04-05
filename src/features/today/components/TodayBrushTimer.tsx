import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

const SIZE = 220;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatSeconds(secondsLeft: number) {
  return `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(
    secondsLeft % 60,
  ).padStart(2, '0')}`;
}

export function TodayBrushTimer({
  secondsLeft,
  progress,
  quadrants,
  activeQuadrantIndex,
  title,
}: {
  secondsLeft: number;
  progress: number;
  quadrants: readonly { id: string; label: string }[];
  activeQuadrantIndex: number;
  title: string;
}) {
  const { theme } = useAppTheme();
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={{ alignItems: 'center', marginTop: theme.spacing.sm }}>
      <View style={{ alignItems: 'center', height: SIZE + 36, justifyContent: 'center', width: SIZE + 36 }}>
        <View style={{ position: 'absolute' }}>
          <Svg height={SIZE} width={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              fill="none"
              r={RADIUS}
              stroke={theme.colors.surfaceMuted}
              strokeWidth={STROKE_WIDTH}
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              fill="none"
              r={RADIUS}
              stroke={theme.colors.primary}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth={STROKE_WIDTH}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>
        </View>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: 999,
            borderWidth: 1,
            height: 154,
            justifyContent: 'center',
            width: 154,
          }}>
          <Text color="muted" variant="caption" weight="semibold">
            {title}
          </Text>
          <Text style={{ marginTop: theme.spacing.xs }} variant="display" weight="bold">
            {formatSeconds(secondsLeft)}
          </Text>
        </View>

        {quadrants.map((quadrant, index) => {
          const isActive = index === activeQuadrantIndex;
          const positionStyle =
            index === 0
              ? { right: -6, top: 20 }
              : index === 1
                ? { bottom: 20, right: -6 }
                : index === 2
                  ? { bottom: 20, left: -6 }
                  : { left: -6, top: 20 };

          return (
            <View
              key={quadrant.id}
              style={[
                {
                  alignItems: 'center',
                  backgroundColor: isActive
                    ? theme.colors.primarySoft
                    : theme.colors.surface,
                  borderColor: isActive
                    ? theme.colors.primary
                    : theme.colors.border,
                  borderRadius: theme.radii.pill,
                  borderWidth: 1,
                  maxWidth: 96,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  position: 'absolute',
                },
                positionStyle,
              ]}>
              <Text
                style={{ textAlign: 'center' }}
                variant="caption"
                weight={isActive ? 'bold' : 'medium'}>
                {quadrant.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
