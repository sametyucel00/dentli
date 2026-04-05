import { InsightItem } from '@/src/features/insights/model';

export type AnalyticsHeatmapCell = {
  id: string;
  date: string;
  dayLabel: string;
  completedCount: number;
  expectedCount: number;
  completionRate: number;
  intensity: 0 | 1 | 2 | 3 | 4;
};

export type MonthlyCompletionMetric = {
  id: 'overall' | 'brushing' | 'floss' | 'mouthwash';
  completedCount: number;
  expectedCount: number;
  completionRate: number;
};

export type YearlyCompletionMonth = {
  id: string;
  monthLabel: string;
  completionRate: number | null;
};

export type ProfileAnalytics = {
  weeklyHeatmap: AnalyticsHeatmapCell[];
  monthlyCompletion: MonthlyCompletionMetric[];
  yearlyCompletion: YearlyCompletionMonth[];
  insights: InsightItem[];
};

export const EMPTY_PROFILE_ANALYTICS: ProfileAnalytics = {
  weeklyHeatmap: [],
  monthlyCompletion: [],
  yearlyCompletion: [],
  insights: [],
};
