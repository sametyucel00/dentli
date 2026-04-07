import { ToothStatus } from '@/src/domain/models';

export const TOTAL_TEETH_COUNT = 32;

export const TOOTH_STATUS_OPTIONS: ToothStatus[] = [
  'healthy',
  'cavity',
  'filling',
  'root_canal',
  'implant',
  'crown',
  'cracked',
  'sensitivity',
  'missing',
];

export const TOOTH_PROBLEM_ZONE_STATUSES: ToothStatus[] = [
  'cavity',
  'root_canal',
  'cracked',
  'sensitivity',
  'missing',
];

export const UPPER_JAW_SEGMENTS = [
  [1, 2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15, 16],
] as const;

export const LOWER_JAW_SEGMENTS = [
  [32, 31, 30, 29, 28, 27, 26, 25],
  [24, 23, 22, 21, 20, 19, 18, 17],
] as const;
