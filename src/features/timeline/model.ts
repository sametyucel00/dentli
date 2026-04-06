import {
  Appointment,
  HygieneEvent,
  SymptomEvent,
  SymptomType,
  ToothStatus,
  ToothStatusHistory,
} from '@/src/domain/models';
import { createTomorrowAtNine } from '@/src/features/today/formatters';

export type TimelineFilter = 'all' | 'hygiene' | 'symptom' | 'appointment' | 'tooth';

export type TimelineItem =
  | {
      id: string;
      kind: 'hygiene';
      occurredAt: string;
      event: HygieneEvent;
    }
  | {
      id: string;
      kind: 'symptom';
      occurredAt: string;
      event: SymptomEvent;
    }
  | {
      id: string;
      kind: 'appointment';
      occurredAt: string;
      event: Appointment;
    }
  | {
      id: string;
      kind: 'tooth';
      occurredAt: string;
      event: ToothStatusHistory;
    };

export const TIMELINE_FILTERS: TimelineFilter[] = [
  'all',
  'hygiene',
  'symptom',
  'appointment',
  'tooth',
];

export type TimelineSymptomDraft = {
  symptomType: SymptomType;
  severity: number | null;
  toothNumber: string;
  notes: string;
  occurredAt: string;
};

export type TimelineAppointmentDraft = {
  title: string;
  appointmentType: Appointment['appointmentType'];
  clinicName: string;
  doctorName: string;
  startsAt: string;
  status: Appointment['status'];
};

export type TimelineHygieneDraft = {
  occurredAt: string;
  notes: string;
};

export type TimelineToothDraft = {
  status: ToothStatus;
  note: string;
  recordedAt: string;
};

export const INITIAL_TIMELINE_SYMPTOM_DRAFT: TimelineSymptomDraft = {
  symptomType: 'sensitivity',
  severity: null,
  toothNumber: '',
  notes: '',
  occurredAt: new Date().toISOString(),
};

export const INITIAL_TIMELINE_APPOINTMENT_DRAFT: TimelineAppointmentDraft = {
  title: '',
  appointmentType: 'checkup',
  clinicName: '',
  doctorName: '',
  startsAt: createTomorrowAtNine(),
  status: 'scheduled',
};

export const INITIAL_TIMELINE_HYGIENE_DRAFT: TimelineHygieneDraft = {
  occurredAt: new Date().toISOString(),
  notes: '',
};

export const INITIAL_TIMELINE_TOOTH_DRAFT: TimelineToothDraft = {
  status: 'healthy',
  note: '',
  recordedAt: new Date().toISOString(),
};
