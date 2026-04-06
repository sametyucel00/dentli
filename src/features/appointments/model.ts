import { Appointment } from '@/src/domain/models';
import { AppointmentMutationInput } from '@/src/services/appointment-service.types';

export const APPOINTMENT_REMINDER_OPTIONS = [
  { value: null, labelKey: 'appointments.reminders.none' },
  { value: 15, labelKey: 'appointments.reminders.fifteenMinutes' },
  { value: 60, labelKey: 'appointments.reminders.oneHour' },
  { value: 1440, labelKey: 'appointments.reminders.oneDay' },
] as const;

export type AppointmentDraft = {
  title: string;
  providerName: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string;
  status: Appointment['status'];
  reminderMinutesBefore: number | null;
};

function roundToNextHalfHour(date: Date) {
  const value = new Date(date);
  value.setSeconds(0, 0);
  const currentMinutes = value.getMinutes();
  const roundedMinutes = currentMinutes === 0 ? 0 : currentMinutes <= 30 ? 30 : 60;
  if (roundedMinutes === 60) {
    value.setHours(value.getHours() + 1, 0, 0, 0);
  } else {
    value.setMinutes(roundedMinutes, 0, 0);
  }
  return value;
}

export function createDefaultAppointmentDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return roundToNextHalfHour(now).toISOString();
}

export function createInitialAppointmentDraft(): AppointmentDraft {
  return {
    title: '',
    providerName: '',
    startsAt: createDefaultAppointmentDateTime(),
    endsAt: '',
    location: '',
    notes: '',
    status: 'scheduled',
    reminderMinutesBefore: null,
  };
}

export function mapAppointmentToDraft(appointment: Appointment): AppointmentDraft {
  return {
    title: appointment.title,
    providerName: appointment.providerName ?? '',
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt ?? '',
    location: appointment.location ?? '',
    notes: appointment.notes ?? '',
    status: appointment.status,
    reminderMinutesBefore: appointment.reminderEnabled
      ? appointment.reminderMinutesBefore
      : null,
  };
}

export function mapDraftToAppointmentInput(
  profileId: string,
  draft: AppointmentDraft,
): AppointmentMutationInput {
  return {
    profileId,
    title: draft.title.trim(),
    providerName: draft.providerName.trim() || null,
    startsAt: draft.startsAt,
    endsAt: draft.endsAt.trim() || null,
    location: draft.location.trim() || null,
    notes: draft.notes.trim() || null,
    status: draft.status,
    reminderEnabled: draft.reminderMinutesBefore !== null,
    reminderMinutesBefore: draft.reminderMinutesBefore,
  };
}
