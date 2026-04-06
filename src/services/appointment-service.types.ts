import { Appointment } from '@/src/domain/models';

export type AppointmentMutationInput = {
  profileId: string;
  title: string;
  appointmentType: Appointment['appointmentType'];
  clinicName: string | null;
  doctorName: string | null;
  startsAt: string;
  endsAt: string | null;
  notes: string | null;
  status: Appointment['status'];
  reminderEnabled: boolean;
  reminderMinutesBefore: number | null;
};
