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

type DailyTargets = {
  brushing: number;
  floss: number;
  mouthwash: number;
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

function getStartOfWeekMonday(date: Date) {
  const value = getStartOfDay(date);
  const day = value.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + offset);
  return value;
}

function getStartOfMonth(date: Date) {
  const value = new Date(date.getFullYear(), date.getMonth(), 1);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getStartOfNextMonth(date: Date) {
  const value = new Date(date.getFullYear(), date.getMonth() + 1, 1);
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
  return Math.max(1, Math.min(routineSettings?.brushingFrequencyPerDay ?? 2, 2));
}

function getWeeklyCadenceDays(sessionsPerWeek: number) {
  const safeValue = Math.max(0, Math.min(sessionsPerWeek, 7));

  if (safeValue >= 7) return [0, 1, 2, 3, 4, 5, 6];
  if (safeValue >= 5) return [0, 1, 3, 4, 6];
  if (safeValue >= 3) return [0, 2, 4];
  if (safeValue >= 2) return [1, 4];
  if (safeValue >= 1) return [3];
  return [];
}

function getWeekdayIndexMonday(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function isCadenceScheduledForDate(date: Date, sessionsPerWeek: number) {
  return getWeeklyCadenceDays(sessionsPerWeek).includes(getWeekdayIndexMonday(date));
}

function getDailyTargets(routineSettings: RoutineSettings | null, date: Date): DailyTargets {
  const brushing = getExpectedBrushCount(routineSettings);
  const floss =
    routineSettings?.flossingEnabled &&
    isCadenceScheduledForDate(date, routineSettings.flossSessionsPerWeek ?? 1)
      ? 1
      : 0;
  const mouthwash =
    routineSettings?.mouthwashEnabled &&
    isCadenceScheduledForDate(date, routineSettings.mouthwashSessionsPerWeek ?? 1)
      ? 1
      : 0;

  return { brushing, floss, mouthwash };
}

function countDistinctActionDays(
  summaryMap: Map<string, DailySummary>,
  actionKey: 'floss' | 'mouthwash',
  startDate: Date,
  endDate: Date,
) {
  let completedCount = 0;

  for (let cursor = getStartOfDay(startDate); cursor < endDate; cursor = addDays(cursor, 1)) {
    const dayKey = toDayKey(cursor);
    const summary = summaryMap.get(dayKey);
    if (summary?.actionKeys.has(actionKey)) {
      completedCount += 1;
    }
  }

  return completedCount;
}

function countExpectedCadenceOccurrences(
  routineSettings: RoutineSettings | null,
  actionKey: 'floss' | 'mouthwash',
  startDate: Date,
  endDate: Date,
) {
  const enabled =
    actionKey === 'floss' ? routineSettings?.flossingEnabled : routineSettings?.mouthwashEnabled;
  const sessionsPerWeek =
    actionKey === 'floss'
      ? routineSettings?.flossSessionsPerWeek ?? 1
      : routineSettings?.mouthwashSessionsPerWeek ?? 1;

  if (!enabled) {
    return 0;
  }

  let expectedCount = 0;
  for (let cursor = getStartOfDay(startDate); cursor < endDate; cursor = addDays(cursor, 1)) {
    if (isCadenceScheduledForDate(cursor, sessionsPerWeek)) {
      expectedCount += 1;
    }
  }

  return expectedCount;
}

export function getDailyCompletionStats(
  summaryMap: Map<string, DailySummary>,
  routineSettings: RoutineSettings | null,
  date: Date,
) {
  const dayKey = toDayKey(date);
  const summary = summaryMap.get(dayKey) ?? {
    actionKeys: new Set<DailyActionKey>(),
    brushCount: 0,
  };
  const targets = getDailyTargets(routineSettings, date);
  const expectedCount = targets.brushing + targets.floss + targets.mouthwash;
  const completedCount =
    Math.min(summary.brushCount, targets.brushing) +
    (targets.floss > 0 && summary.actionKeys.has('floss') ? 1 : 0) +
    (targets.mouthwash > 0 && summary.actionKeys.has('mouthwash') ? 1 : 0);

  return {
    completedCount,
    expectedCount,
    completionRate: expectedCount === 0 ? 0 : completedCount / expectedCount,
  };
}

export function getCompletionTargetsForDateRange(
  summaryMap: Map<string, DailySummary>,
  routineSettings: RoutineSettings | null,
  startDate: Date,
  endDate: Date,
) {
  const brushing = countCompletedBrushing(summaryMap, routineSettings, startDate, endDate);
  const flossExpected = countExpectedCadenceOccurrences(
    routineSettings,
    'floss',
    startDate,
    endDate,
  );
  const flossCompleted = Math.min(
    countDistinctActionDays(summaryMap, 'floss', startDate, endDate),
    flossExpected,
  );
  const mouthwashExpected = countExpectedCadenceOccurrences(
    routineSettings,
    'mouthwash',
    startDate,
    endDate,
  );
  const mouthwashCompleted = Math.min(
    countDistinctActionDays(summaryMap, 'mouthwash', startDate, endDate),
    mouthwashExpected,
  );

  return {
    brushing,
    floss: {
      completedCount: flossCompleted,
      expectedCount: flossExpected,
      completionRate: flossExpected === 0 ? 0 : flossCompleted / flossExpected,
    },
    mouthwash: {
      completedCount: mouthwashCompleted,
      expectedCount: mouthwashExpected,
      completionRate: mouthwashExpected === 0 ? 0 : mouthwashCompleted / mouthwashExpected,
    },
  };
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
  const { brushing, floss, mouthwash } = getCompletionTargetsForDateRange(
    summaryMap,
    routineSettings,
    startDate,
    endDate,
  );
  const completedCount =
    brushing.completedCount + floss.completedCount + mouthwash.completedCount;
  const expectedCount = brushing.expectedCount + floss.expectedCount + mouthwash.expectedCount;

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
  routineSettings: RoutineSettings | null,
  startDate: Date,
  endDate: Date,
) {
  const expectedCount = countExpectedCadenceOccurrences(
    routineSettings,
    actionKey,
    startDate,
    endDate,
  );
  const completedCount = Math.min(
    countDistinctActionDays(summaryMap, actionKey, startDate, endDate),
    expectedCount,
  );

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
  const startDate = getStartOfWeekMonday(today);

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(startDate, index);
    const dayKey = toDayKey(date);
    const { completedCount, expectedCount, completionRate } = getDailyCompletionStats(
      summaryMap,
      routineSettings,
      date,
    );

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
  const endDate = getStartOfNextMonth(today);

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
      ...countCompletedBooleanAction(summaryMap, 'floss', routineSettings, startOfMonth, endDate),
    },
    {
      id: 'mouthwash',
      ...countCompletedBooleanAction(
        summaryMap,
        'mouthwash',
        routineSettings,
        startOfMonth,
        endDate,
      ),
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
