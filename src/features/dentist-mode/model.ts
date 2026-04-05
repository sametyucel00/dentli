import { SymptomEvent, ToothStatus } from '@/src/domain/models';

export type DentistModeRecentEvent = {
  id: string;
  type: 'hygiene' | 'symptom' | 'appointment' | 'tooth';
  timestamp: string;
  title: string;
  detail: string | null;
};

export type DentistModeSummary = {
  generatedAt: string;
  periodDays: number;
  stats: {
    totalHygieneEvents: number;
    totalSymptoms: number;
    totalAppointments: number;
    totalToothUpdates: number;
  };
  hygieneRates: {
    brushingRate: number;
    flossRate: number;
    mouthwashRate: number;
  };
  problemTeeth: {
    toothNumber: number;
    status: ToothStatus;
    occurrences: number;
  }[];
  symptoms: SymptomEvent[];
  recentEvents: DentistModeRecentEvent[];
};
