import { SymptomType } from '@/src/domain/models';

export const SYMPTOM_TYPE_OPTIONS: SymptomType[] = [
  'pain',
  'bleeding',
  'sensitivity',
  'swelling',
  'bad_breath',
];

export const SYMPTOM_SEVERITY_OPTIONS = [null, 2, 3, 5] as const;
