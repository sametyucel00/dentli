import { Appointment } from '@/src/domain/models';

export type AppointmentMutationInput = {
  profileId: string;
  title: string;
  providerName: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  notes: string | null;
  status: Appointment['status'];
  reminderEnabled: boolean;
  reminderMinutesBefore: number | null;
};
