import { Appointment } from '@/src/domain/models';
import { createId, nowIso } from '@/src/lib/runtime';
import { appointmentsRepository } from '@/src/repositories';
import { notificationSchedulerService } from '@/src/services/notification-scheduler-service';
import { AppointmentMutationInput } from '@/src/services/appointment-service.types';
import { useAppStore } from '@/src/state/useAppStore';

function createReminderNotificationId(appointmentId: string) {
  return `appointment_${appointmentId}`;
}

class AppointmentService {
  async listByProfileId(profileId: string) {
    const appointments = await appointmentsRepository.listByProfileId(profileId);
    useAppStore.getState().cacheAppointments(profileId, appointments);
    return appointments;
  }

  async getById(id: string) {
    return appointmentsRepository.getById(id);
  }

  async getNextScheduledByProfileId(profileId: string, afterIso: string) {
    return appointmentsRepository.getNextScheduledByProfileId(profileId, afterIso);
  }

  async create(input: AppointmentMutationInput) {
    const timestamp = nowIso();
    const appointmentId = createId('appointment');
    const appointment: Appointment = {
      id: appointmentId,
      profileId: input.profileId,
      title: input.title,
      appointmentType: input.appointmentType,
      clinicName: input.clinicName,
      doctorName: input.doctorName,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      notes: input.notes,
      status: input.status,
      reminderEnabled: input.reminderEnabled,
      reminderMinutesBefore: input.reminderEnabled ? input.reminderMinutesBefore : null,
      reminderNotificationId:
        input.reminderEnabled && input.reminderMinutesBefore !== null
          ? createReminderNotificationId(appointmentId)
          : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await appointmentsRepository.create(appointment);
    await notificationSchedulerService.syncAppointmentReminder(appointment);
    await this.listByProfileId(input.profileId);
    return appointment;
  }

  async update(id: string, input: AppointmentMutationInput) {
    const existing = await appointmentsRepository.getById(id);
    if (!existing) return null;

    const appointment: Appointment = {
      ...existing,
      title: input.title,
      appointmentType: input.appointmentType,
      clinicName: input.clinicName,
      doctorName: input.doctorName,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      notes: input.notes,
      status: input.status,
      reminderEnabled: input.reminderEnabled,
      reminderMinutesBefore: input.reminderEnabled ? input.reminderMinutesBefore : null,
      reminderNotificationId:
        input.reminderEnabled && input.reminderMinutesBefore !== null
          ? createReminderNotificationId(id)
          : null,
      updatedAt: nowIso(),
    };

    await appointmentsRepository.update(appointment);
    if (
      existing.reminderNotificationId &&
      existing.reminderNotificationId !== appointment.reminderNotificationId
    ) {
      await notificationSchedulerService.syncAppointmentReminder({
        ...existing,
        reminderEnabled: false,
        reminderMinutesBefore: null,
        reminderNotificationId: null,
      });
    }
    await notificationSchedulerService.syncAppointmentReminder(appointment);
    await this.listByProfileId(existing.profileId);
    return appointment;
  }

  async delete(id: string) {
    const existing = await appointmentsRepository.getById(id);
    if (!existing) return;

    if (existing.reminderNotificationId) {
      await notificationSchedulerService.syncAppointmentReminder({
        ...existing,
        reminderEnabled: false,
        reminderMinutesBefore: null,
        reminderNotificationId: null,
      });
    }

    await appointmentsRepository.deleteById(id);
    await this.listByProfileId(existing.profileId);
  }

  async syncRemindersForProfile(profileId: string) {
    const appointments = await appointmentsRepository.listByProfileId(profileId);
    await notificationSchedulerService.syncAppointmentRemindersForProfile(profileId, appointments);
  }
}

export const appointmentService = new AppointmentService();
