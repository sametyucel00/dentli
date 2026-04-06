import { DailyActionKey, HygieneEventType } from '@/src/domain/models';
import { InsightItem } from '@/src/features/insights/model';
export { SYMPTOM_TYPE_OPTIONS } from '@/src/domain/symptoms';

export type TodayActionDefinition = {
  key: DailyActionKey;
  eventType: HygieneEventType;
  titleKey: string;
  optional?: boolean;
};

export const TODAY_ACTIONS: TodayActionDefinition[] = [
  {
    key: 'morning_brush',
    eventType: 'brush',
    titleKey: 'today.actions.morningBrush',
  },
  {
    key: 'night_brush',
    eventType: 'brush',
    titleKey: 'today.actions.nightBrush',
  },
  {
    key: 'floss',
    eventType: 'floss',
    titleKey: 'today.actions.floss',
  },
  {
    key: 'mouthwash',
    eventType: 'mouthwash',
    titleKey: 'today.actions.mouthwash',
  },
] as const;

export type BrushCompletionChoice = 'morning_brush' | 'night_brush';

export type TimerQuadrant = {
  id: string;
  titleKey: string;
};

export const TIMER_DURATION_SECONDS = 120;
export const TIMER_QUADRANTS: TimerQuadrant[] = [
  { id: 'upper_right', titleKey: 'today.timer.quadrants.upperRight' },
  { id: 'lower_right', titleKey: 'today.timer.quadrants.lowerRight' },
  { id: 'lower_left', titleKey: 'today.timer.quadrants.lowerLeft' },
  { id: 'upper_left', titleKey: 'today.timer.quadrants.upperLeft' },
] as const;

export type TodayInsight = InsightItem;

export type TodayQuickStatus = {
  lastBrushAt: string | null;
  lastFlossAt: string | null;
  toothbrushDaysLeft: number | null;
  nextDentalCheckAt: string | null;
};

export type TodayActionState = Record<
  DailyActionKey,
  {
    completed: boolean;
    eventId: string | null;
  }
>;

export type TodaySheetMode =
  | 'actions'
  | 'symptom'
  | 'appointment'
  | 'timer'
  | 'tooth'
  | null;

export const TODAY_INITIAL_ACTION_STATE: TodayActionState = {
  morning_brush: { completed: false, eventId: null },
  night_brush: { completed: false, eventId: null },
  floss: { completed: false, eventId: null },
  mouthwash: { completed: false, eventId: null },
};

export const TODAY_INITIAL_QUICK_STATUS: TodayQuickStatus = {
  lastBrushAt: null,
  lastFlossAt: null,
  toothbrushDaysLeft: null,
  nextDentalCheckAt: null,
};
