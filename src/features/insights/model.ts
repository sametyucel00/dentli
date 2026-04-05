export type InsightTone = 'neutral' | 'warning' | 'positive';

export type InsightItem = {
  id: string;
  tone: InsightTone;
  titleKey: string;
  bodyKey: string;
  bodyValues?: Record<string, string | number>;
};
