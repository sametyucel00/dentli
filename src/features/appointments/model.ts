import { Appointment } from '@/src/domain/models';
import { AppointmentMutationInput } from '@/src/services/appointment-service.types';

export const APPOINTMENT_REMINDER_OPTIONS = [
  { value: null, labelKey: 'appointments.reminders.none' },
  { value: 1440, labelKey: 'appointments.reminders.oneDay' },
  { value: 10080, labelKey: 'appointments.reminders.oneWeek' },
] as const;

export type AppointmentDraft = {
  title: string;
  appointmentType: Appointment['appointmentType'];
  clinicName: string;
  doctorName: string;
  startsAt: string;
  endsAt: string;
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
    appointmentType: 'checkup',
    clinicName: '',
    doctorName: '',
    startsAt: createDefaultAppointmentDateTime(),
    endsAt: '',
    notes: '',
    status: 'scheduled',
    reminderMinutesBefore: null,
  };
}

export function mapAppointmentToDraft(appointment: Appointment): AppointmentDraft {
  return {
    title: appointment.title,
    appointmentType: appointment.appointmentType,
    clinicName: appointment.clinicName ?? '',
    doctorName: appointment.doctorName ?? '',
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt ?? '',
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
    appointmentType: draft.appointmentType,
    clinicName: draft.clinicName.trim() || null,
    doctorName: draft.doctorName.trim() || null,
    startsAt: draft.startsAt,
    endsAt: draft.endsAt.trim() || null,
    notes: draft.notes.trim() || null,
    status: draft.status,
    reminderEnabled: draft.reminderMinutesBefore !== null,
    reminderMinutesBefore: draft.reminderMinutesBefore,
  };
}
