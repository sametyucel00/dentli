import { CareItemType } from '@/src/domain/models';

export const CARE_ITEM_TYPE_OPTIONS: CareItemType[] = [
  'toothbrush',
  'toothpaste',
  'floss',
  'mouthwash',
  'interdental_brush',
  'water_flosser',
];

export const DEFAULT_TOOTHBRUSH_REPLACEMENT_DAYS = 90;

export const DEFAULT_CARE_ITEM_REPLACEMENT_DAYS: Partial<Record<CareItemType, number>> = {
  toothbrush: 90,
  toothpaste: 45,
  floss: 60,
  mouthwash: 45,
  interdental_brush: 30,
  water_flosser: 180,
};
