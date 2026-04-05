import { DailyActionKey, HygieneEvent, RoutineSettings } from '@/src/domain/models';
import {
  AnalyticsHeatmapCell,
  MonthlyCompletionMetric,
  YearlyCompletionMonth,
} from '@/src/features/profile/model';

function getStartOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function getStartOfMonth(date: Date) {
  const value = new Date(date.getFullYear(), date.getMonth(), 1);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function getStartOfYear(date: Date) {
  const value = new Date(date.getFullYear(), 0, 1);
  value.setHours(0, 0, 0, 0);
  return value;
}

function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getExpectedDailyActionKeys(
  routineSettings: RoutineSettings | null,
): DailyActionKey[] {
  const actions: DailyActionKey[] = [];
  const brushCount = Math.min(routineSettings?.brushingFrequencyPerDay ?? 2, 2);

  if (brushCount >= 1) {
    actions.push('morning_brush');
  }

  if (brushCount >= 2) {
    actions.push('night_brush');
  }

  if (routineSettings?.flossingEnabled) {
    actions.push('floss');
  }

  if (routineSettings?.mouthwashEnabled) {
    actions.push('mouthwash');
  }

  return actions;
}

export function createHygieneActionMap(events: HygieneEvent[]) {
  const actionMap = new Map<string, Set<DailyActionKey>>();

  for (const event of events) {
    if (!event.actionKey) {
      continue;
    }

    const dayKey = toDayKey(new Date(event.occurredAt));
    const dayActions = actionMap.get(dayKey) ?? new Set<DailyActionKey>();
    dayActions.add(event.actionKey);
    actionMap.set(dayKey, dayActions);
  }

  return actionMap;
}

function toIntensity(completionRate: number): AnalyticsHeatmapCell['intensity'] {
  if (completionRate >= 1) return 4;
  if (completionRate >= 0.67) return 3;
  if (completionRate >= 0.34) return 2;
  if (completionRate > 0) return 1;
  return 0;
}

function countCompletedActions(
  eventMap: Map<string, Set<DailyActionKey>>,
  expectedActionKeys: DailyActionKey[],
  startDate: Date,
  endDate: Date,
) {
  let completedCount = 0;
  let expectedCount = 0;

  for (
    let cursor = getStartOfDay(startDate);
    cursor < endDate;
    cursor = addDays(cursor, 1)
  ) {
    const dayKey = toDayKey(cursor);
    const dayActions = eventMap.get(dayKey) ?? new Set<DailyActionKey>();

    expectedCount += expectedActionKeys.length;

    for (const actionKey of expectedActionKeys) {
      if (dayActions.has(actionKey)) {
        completedCount += 1;
      }
    }
  }

  return {
    completedCount,
    expectedCount,
    completionRate: expectedCount === 0 ? 0 : completedCount / expectedCount,
  };
}

export function buildWeeklyHeatmap(
  eventMap: Map<string, Set<DailyActionKey>>,
  expectedActionKeys: DailyActionKey[],
  locale: string,
  today: Date,
) {
  const cells: AnalyticsHeatmapCell[] = [];
  const startDate = addDays(getStartOfDay(today), -6);

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(startDate, index);
    const dayKey = toDayKey(date);
    const dayActions = eventMap.get(dayKey) ?? new Set<DailyActionKey>();
    const completedCount = expectedActionKeys.filter((actionKey) =>
      dayActions.has(actionKey),
    ).length;
    const expectedCount = expectedActionKeys.length;
    const completionRate =
      expectedCount === 0 ? 0 : completedCount / expectedCount;

    cells.push({
      id: dayKey,
      date: date.toISOString(),
      dayLabel: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
      completedCount,
      expectedCount,
      completionRate,
      intensity: toIntensity(completionRate),
    });
  }

  return cells;
}

export function buildMonthlyCompletion(
  eventMap: Map<string, Set<DailyActionKey>>,
  routineSettings: RoutineSettings | null,
  today: Date,
) {
  const startOfMonth = getStartOfMonth(today);
  const endDate = addDays(getStartOfDay(today), 1);
  const overallKeys = getExpectedDailyActionKeys(routineSettings);
  const brushingKeys = overallKeys.filter(
    (actionKey) => actionKey === 'morning_brush' || actionKey === 'night_brush',
  );
  const flossKeys = overallKeys.filter((actionKey) => actionKey === 'floss');
  const mouthwashKeys = overallKeys.filter((actionKey) => actionKey === 'mouthwash');

  return [
    {
      id: 'overall',
      ...countCompletedActions(eventMap, overallKeys, startOfMonth, endDate),
    },
    {
      id: 'brushing',
      ...countCompletedActions(eventMap, brushingKeys, startOfMonth, endDate),
    },
    {
      id: 'floss',
      ...countCompletedActions(eventMap, flossKeys, startOfMonth, endDate),
    },
    {
      id: 'mouthwash',
      ...countCompletedActions(eventMap, mouthwashKeys, startOfMonth, endDate),
    },
  ] satisfies MonthlyCompletionMetric[];
}

export function buildYearlyCompletion(
  eventMap: Map<string, Set<DailyActionKey>>,
  expectedActionKeys: DailyActionKey[],
  locale: string,
  today: Date,
) {
  const months: YearlyCompletionMonth[] = [];
  const year = today.getFullYear();

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const monthStart = new Date(year, monthIndex, 1);
    monthStart.setHours(0, 0, 0, 0);
    const nextMonthStart = new Date(year, monthIndex + 1, 1);
    nextMonthStart.setHours(0, 0, 0, 0);

    const isFutureMonth = monthStart > today;
    const rangeEnd =
      nextMonthStart > today ? addDays(getStartOfDay(today), 1) : nextMonthStart;
    const counts = isFutureMonth
      ? { completionRate: null }
      : countCompletedActions(eventMap, expectedActionKeys, monthStart, rangeEnd);

    months.push({
      id: `${year}-${monthIndex + 1}`,
      monthLabel: new Intl.DateTimeFormat(locale, { month: 'short' }).format(monthStart),
      completionRate: isFutureMonth ? null : counts.completionRate,
    });
  }

  return months;
}
