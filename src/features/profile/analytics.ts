import { DailyActionKey, HygieneEvent, RoutineSettings } from '@/src/domain/models';
import {
  AnalyticsHeatmapCell,
  MonthlyCompletionMetric,
  YearlyCompletionMonth,
} from '@/src/features/profile/model';

type DailySummary = {
  actionKeys: Set<DailyActionKey>;
  brushCount: number;
};

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

function getExpectedBrushCount(routineSettings: RoutineSettings | null) {
  return Math.max(1, Math.min(routineSettings?.brushingFrequencyPerDay ?? 2, 3));
}

function getExpectedFlossCount(routineSettings: RoutineSettings | null) {
  if (!routineSettings?.flossingEnabled) {
    return 0;
  }

  return Math.max(1, Math.min(routineSettings.flossSessionsPerWeek ?? 3, 7)) / 7;
}

function getExpectedMouthwashCount(routineSettings: RoutineSettings | null) {
  return routineSettings?.mouthwashEnabled ? 1 : 0;
}

export function createDailySummaryMap(events: HygieneEvent[]) {
  const summaryMap = new Map<string, DailySummary>();

  for (const event of events) {
    const dayKey = toDayKey(new Date(event.occurredAt));
    const summary = summaryMap.get(dayKey) ?? {
      actionKeys: new Set<DailyActionKey>(),
      brushCount: 0,
    };

    if (event.eventType === 'brush') {
      summary.brushCount += 1;
    }

    if (event.actionKey) {
      summary.actionKeys.add(event.actionKey);
    }

    summaryMap.set(dayKey, summary);
  }

  return summaryMap;
}

function toIntensity(completionRate: number): AnalyticsHeatmapCell['intensity'] {
  if (completionRate >= 1) return 4;
  if (completionRate >= 0.67) return 3;
  if (completionRate >= 0.34) return 2;
  if (completionRate > 0) return 1;
  return 0;
}

function countCompletedActions(
  summaryMap: Map<string, DailySummary>,
  routineSettings: RoutineSettings | null,
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
    const summary = summaryMap.get(dayKey) ?? {
      actionKeys: new Set<DailyActionKey>(),
      brushCount: 0,
    };

    const expectedBrushCount = getExpectedBrushCount(routineSettings);
    const expectedFlossCount = getExpectedFlossCount(routineSettings);
    const expectedMouthwashCount = getExpectedMouthwashCount(routineSettings);

    expectedCount += expectedBrushCount + expectedFlossCount + expectedMouthwashCount;
    completedCount += Math.min(summary.brushCount, expectedBrushCount);
    completedCount += summary.actionKeys.has('floss') ? expectedFlossCount : 0;
    completedCount += summary.actionKeys.has('mouthwash') ? expectedMouthwashCount : 0;
  }

  return {
    completedCount,
    expectedCount,
    completionRate: expectedCount === 0 ? 0 : completedCount / expectedCount,
  };
}

function countCompletedBrushing(
  summaryMap: Map<string, DailySummary>,
  routineSettings: RoutineSettings | null,
  startDate: Date,
  endDate: Date,
) {
  let completedCount = 0;
  let expectedCount = 0;
  const expectedBrushCount = getExpectedBrushCount(routineSettings);

  for (
    let cursor = getStartOfDay(startDate);
    cursor < endDate;
    cursor = addDays(cursor, 1)
  ) {
    const dayKey = toDayKey(cursor);
    const summary = summaryMap.get(dayKey) ?? {
      actionKeys: new Set<DailyActionKey>(),
      brushCount: 0,
    };

    expectedCount += expectedBrushCount;
    completedCount += Math.min(summary.brushCount, expectedBrushCount);
  }

  return {
    completedCount,
    expectedCount,
    completionRate: expectedCount === 0 ? 0 : completedCount / expectedCount,
  };
}

function countCompletedBooleanAction(
  summaryMap: Map<string, DailySummary>,
  actionKey: 'floss' | 'mouthwash',
  expectedPerDay: number,
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
    const summary = summaryMap.get(dayKey) ?? {
      actionKeys: new Set<DailyActionKey>(),
      brushCount: 0,
    };

    expectedCount += expectedPerDay;
    completedCount += summary.actionKeys.has(actionKey) ? expectedPerDay : 0;
  }

  return {
    completedCount,
    expectedCount,
    completionRate: expectedCount === 0 ? 0 : completedCount / expectedCount,
  };
}

export function buildWeeklyHeatmap(
  summaryMap: Map<string, DailySummary>,
  routineSettings: RoutineSettings | null,
  locale: string,
  today: Date,
) {
  const cells: AnalyticsHeatmapCell[] = [];
  const startDate = addDays(getStartOfDay(today), -6);

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(startDate, index);
    const dayKey = toDayKey(date);
    const summary = summaryMap.get(dayKey) ?? {
      actionKeys: new Set<DailyActionKey>(),
      brushCount: 0,
    };
    const expectedBrushCount = getExpectedBrushCount(routineSettings);
    const expectedFlossCount = getExpectedFlossCount(routineSettings);
    const expectedMouthwashCount = getExpectedMouthwashCount(routineSettings);
    const expectedCount = expectedBrushCount + expectedFlossCount + expectedMouthwashCount;
    const completedCount =
      Math.min(summary.brushCount, expectedBrushCount) +
      (summary.actionKeys.has('floss') ? expectedFlossCount : 0) +
      (summary.actionKeys.has('mouthwash') ? expectedMouthwashCount : 0);
    const completionRate = expectedCount === 0 ? 0 : completedCount / expectedCount;

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
  summaryMap: Map<string, DailySummary>,
  routineSettings: RoutineSettings | null,
  today: Date,
) {
  const startOfMonth = getStartOfMonth(today);
  const endDate = addDays(getStartOfDay(today), 1);
  const flossExpected = getExpectedFlossCount(routineSettings);
  const mouthwashExpected = getExpectedMouthwashCount(routineSettings);

  return [
    {
      id: 'overall',
      ...countCompletedActions(summaryMap, routineSettings, startOfMonth, endDate),
    },
    {
      id: 'brushing',
      ...countCompletedBrushing(summaryMap, routineSettings, startOfMonth, endDate),
    },
    {
      id: 'floss',
      ...countCompletedBooleanAction(summaryMap, 'floss', flossExpected, startOfMonth, endDate),
    },
    {
      id: 'mouthwash',
      ...countCompletedBooleanAction(summaryMap, 'mouthwash', mouthwashExpected, startOfMonth, endDate),
    },
  ] satisfies MonthlyCompletionMetric[];
}

export function buildYearlyCompletion(
  summaryMap: Map<string, DailySummary>,
  routineSettings: RoutineSettings | null,
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
      : countCompletedActions(summaryMap, routineSettings, monthStart, rangeEnd);

    months.push({
      id: `${year}-${monthIndex + 1}`,
      monthLabel: new Intl.DateTimeFormat(locale, { month: 'short' }).format(monthStart),
      completionRate: isFutureMonth ? null : counts.completionRate,
    });
  }

  return months;
}
