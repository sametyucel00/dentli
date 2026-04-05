import { HygieneEvent, RoutineSettings } from '@/src/domain/models';
import { InsightItem } from '@/src/features/insights/model';

function getStartOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getDayDifference(fromDate: Date, toDate: Date) {
  return Math.floor(
    (getStartOfDay(toDate).getTime() - getStartOfDay(fromDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function hasAction(todayEvents: HygieneEvent[], actionKey: HygieneEvent['actionKey']) {
  return todayEvents.some((event) => event.actionKey === actionKey);
}

export function getToothbrushDaysLeft(routineSettings: RoutineSettings | null) {
  if (!routineSettings?.toothbrushLastReplacedAt) {
    return null;
  }

  const replacementAt = new Date(routineSettings.toothbrushLastReplacedAt);
  const dueDate = new Date(replacementAt);
  dueDate.setDate(
    dueDate.getDate() + routineSettings.toothbrushReplacementIntervalDays,
  );

  const diffMs = dueDate.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function buildInsightItems(input: {
  todayEvents: HygieneEvent[];
  routineSettings: RoutineSettings | null;
  lastFlossEvent: HygieneEvent | null;
  toothbrushDaysLeft: number | null;
  now?: Date;
}) {
  const insights: InsightItem[] = [];
  const now = input.now ?? new Date();

  if (input.routineSettings?.flossingEnabled) {
    const daysSinceFloss = input.lastFlossEvent
      ? getDayDifference(new Date(input.lastFlossEvent.occurredAt), now)
      : null;

    if (daysSinceFloss === null || daysSinceFloss >= 3) {
      insights.push({
        id: 'floss_gap',
        tone: 'neutral',
        titleKey: 'insights.rules.flossGap.title',
        bodyKey: 'insights.rules.flossGap.body',
        bodyValues: {
          count: daysSinceFloss ?? 3,
        },
      });
    }
  }

  if (now.getHours() >= 21 && !hasAction(input.todayEvents, 'night_brush')) {
    insights.push({
      id: 'night_brush',
      tone: 'neutral',
      titleKey: 'insights.rules.nightBrush.title',
      bodyKey: 'insights.rules.nightBrush.body',
    });
  }

  if (input.toothbrushDaysLeft !== null && input.toothbrushDaysLeft <= 0) {
    insights.push({
      id: 'toothbrush_expired',
      tone: 'warning',
      titleKey: 'insights.rules.toothbrushExpired.title',
      bodyKey: 'insights.rules.toothbrushExpired.body',
    });
  } else if (
    input.toothbrushDaysLeft !== null &&
    input.toothbrushDaysLeft <= 7
  ) {
    insights.push({
      id: 'toothbrush_soon',
      tone: 'positive',
      titleKey: 'insights.rules.toothbrushSoon.title',
      bodyKey: 'insights.rules.toothbrushSoon.body',
      bodyValues: {
        count: input.toothbrushDaysLeft,
      },
    });
  }

  return insights.slice(0, 3);
}
