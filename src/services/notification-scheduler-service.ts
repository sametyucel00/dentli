import { Appointment, DailyActionKey, HygieneEvent, RoutineSettings } from '@/src/domain/models';
import i18n from '@/src/i18n';
import { appointmentsRepository, hygieneEventsRepository, routineSettingsRepository } from '@/src/repositories';
import { notificationService, NotificationRequest } from '@/src/services/notification-service';

const DEFAULT_ROUTINE_MINUTES = {
  morning_brush: 8 * 60 + 30,
  night_brush: 21 * 60,
  floss: 21 * 60 + 15,
  mouthwash: 21 * 60 + 30,
} satisfies Record<DailyActionKey, number>;

const ACTION_TIME_WINDOWS = {
  morning_brush: { min: 6 * 60, max: 11 * 60 },
  night_brush: { min: 19 * 60, max: 22 * 60 },
  floss: { min: 19 * 60 + 30, max: 22 * 60 },
  mouthwash: { min: 20 * 60, max: 22 * 60 },
} satisfies Record<DailyActionKey, { min: number; max: number }>;

function createRoutineNotificationId(profileId: string, actionKey: DailyActionKey) {
  return `routine_${profileId}_${actionKey}`;
}

function createRoutineFollowUpNotificationId(profileId: string) {
  return `routine_${profileId}_follow_up`;
}

function createToothbrushNotificationId(profileId: string) {
  return `care_${profileId}_toothbrush`;
}

function createDentalCheckNotificationId(profileId: string) {
  return `dental_${profileId}_check`;
}

function parseTimeToMinutes(value: string | null) {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function addLocalDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function setMinutesOnDate(date: Date, minutes: number) {
  const value = new Date(date);
  value.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return value;
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = startOfDay(date);
  value.setDate(value.getDate() + 1);
  return value;
}

function resolveQuietHours(routineSettings: RoutineSettings) {
  return {
    startMinutes: parseTimeToMinutes(routineSettings.quietHoursStart) ?? 22 * 60,
    endMinutes: parseTimeToMinutes(routineSettings.quietHoursEnd) ?? 8 * 60,
  };
}

function isWithinQuietHours(date: Date, quietHours: { startMinutes: number; endMinutes: number }) {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  if (quietHours.startMinutes === quietHours.endMinutes) {
    return false;
  }

  if (quietHours.startMinutes < quietHours.endMinutes) {
    return currentMinutes >= quietHours.startMinutes && currentMinutes < quietHours.endMinutes;
  }

  return currentMinutes >= quietHours.startMinutes || currentMinutes < quietHours.endMinutes;
}

function minutesToHourMinute(minutes: number) {
  return {
    hour: Math.floor(minutes / 60),
    minute: minutes % 60,
  };
}

function nextAllowedDate(date: Date, quietHours: { startMinutes: number; endMinutes: number }) {
  const hour = date.getHours();
  const value = new Date(date);

  if (!isWithinQuietHours(value, quietHours)) {
    return value;
  }

  if (hour * 60 + value.getMinutes() >= quietHours.startMinutes) {
    value.setDate(value.getDate() + 1);
  }

  const nextStart = minutesToHourMinute(quietHours.endMinutes);
  value.setHours(nextStart.hour, nextStart.minute, 0, 0);
  return value;
}

function previousAllowedDate(date: Date, quietHours: { startMinutes: number; endMinutes: number }) {
  const value = new Date(date);

  if (!isWithinQuietHours(value, quietHours)) {
    return value;
  }

  if (value.getHours() * 60 + value.getMinutes() < quietHours.endMinutes) {
    value.setDate(value.getDate() - 1);
  }

  const lastAllowedMinutes = quietHours.startMinutes - 30;
  const adjusted = lastAllowedMinutes >= 0 ? lastAllowedMinutes : 23 * 60 + 30;
  const previousStart = minutesToHourMinute(adjusted);
  value.setHours(previousStart.hour, previousStart.minute, 0, 0);
  return value;
}

function clampMinutes(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function averageCompletionMinutes(events: HygieneEvent[], fallbackMinutes: number, actionKey: DailyActionKey) {
  if (events.length === 0) {
    return fallbackMinutes;
  }

  const total = events.reduce((sum, event) => {
    const date = new Date(event.occurredAt);
    return sum + date.getHours() * 60 + date.getMinutes();
  }, 0);

  const average = Math.round(total / events.length);
  const window = ACTION_TIME_WINDOWS[actionKey];
  return clampMinutes(average, window.min, window.max);
}

function hasActionToday(todayEvents: HygieneEvent[], actionKey: DailyActionKey) {
  return todayEvents.some((event) => event.actionKey === actionKey);
}

function buildRoutineNotificationCopy(actionKey: DailyActionKey) {
  return {
    title: i18n.t(`notifications.routines.${actionKey}.title`),
    body: i18n.t(`notifications.routines.${actionKey}.body`),
  };
}

function getActionLabelKey(actionKey: DailyActionKey) {
  switch (actionKey) {
    case 'morning_brush':
      return 'today.actions.morningBrush';
    case 'night_brush':
      return 'today.actions.nightBrush';
    case 'floss':
      return 'today.actions.floss';
    case 'mouthwash':
      return 'today.actions.mouthwash';
  }
}

function buildRoutineScheduleDate(input: {
  actionKey: DailyActionKey;
  adaptiveMinutes: number;
  preferredMinutes: number;
  todayEvents: HygieneEvent[];
  now: Date;
  quietHours: { startMinutes: number; endMinutes: number };
}) {
  const baseMinutes = input.adaptiveMinutes || input.preferredMinutes;
  const scheduleToday = setMinutesOnDate(input.now, baseMinutes);
  const alreadyDone = hasActionToday(input.todayEvents, input.actionKey);
  const hasPassed = scheduleToday.getTime() <= input.now.getTime() + 90 * 60 * 1000;

  if (alreadyDone || hasPassed) {
    return nextAllowedDate(setMinutesOnDate(addLocalDays(input.now, 1), baseMinutes), input.quietHours);
  }

  return nextAllowedDate(scheduleToday, input.quietHours);
}

function buildFlossScheduleDate(input: {
  now: Date;
  quietHours: { startMinutes: number; endMinutes: number };
  sessionsPerWeek: number;
  actionKey: 'floss' | 'mouthwash';
  lastEvent: HygieneEvent | null;
  todayEvents: HygieneEvent[];
  preferredMinutes: number;
}) {
  if (hasActionToday(input.todayEvents, input.actionKey)) {
    return nextAllowedDate(
      setMinutesOnDate(addLocalDays(input.now, 1), input.preferredMinutes),
      input.quietHours,
    );
  }

  const cadenceDays = Math.max(
    1,
    Math.round(7 / Math.max(1, Math.min(input.sessionsPerWeek, 7))),
  );

  if (!input.lastEvent) {
    return nextAllowedDate(setMinutesOnDate(input.now, input.preferredMinutes), input.quietHours);
  }

  const lastEventAt = new Date(input.lastEvent.occurredAt);
  const dueDate = setMinutesOnDate(addLocalDays(lastEventAt, cadenceDays), input.preferredMinutes);
  return dueDate.getTime() <= input.now.getTime()
    ? nextAllowedDate(setMinutesOnDate(input.now, input.preferredMinutes), input.quietHours)
    : nextAllowedDate(dueDate, input.quietHours);
}

function isCadenceDueToday(
  now: Date,
  sessionsPerWeek: number,
  lastEvent: HygieneEvent | null,
  preferredMinutes: number,
) {
  const cadenceDays = Math.max(1, Math.round(7 / Math.max(1, Math.min(sessionsPerWeek, 7))));
  if (!lastEvent) {
    return true;
  }

  const dueDate = setMinutesOnDate(addLocalDays(new Date(lastEvent.occurredAt), cadenceDays), preferredMinutes);
  return dueDate.getTime() <= now.getTime();
}

function findMissedCareAction(input: {
  routineSettings: RoutineSettings;
  todayEvents: HygieneEvent[];
  now: Date;
  lastFlossEvent: HygieneEvent | null;
  lastMouthwashEvent: HygieneEvent | null;
  nightBaseMinutes: number;
}) {
  const currentMinutes = input.now.getHours() * 60 + input.now.getMinutes();

  if (
    input.routineSettings.brushingFrequencyPerDay >= 1 &&
    currentMinutes >= ACTION_TIME_WINDOWS.morning_brush.max &&
    !hasActionToday(input.todayEvents, 'morning_brush')
  ) {
    return 'morning_brush' as const;
  }

  if (
    input.routineSettings.brushingFrequencyPerDay >= 2 &&
    currentMinutes >= ACTION_TIME_WINDOWS.night_brush.max &&
    !hasActionToday(input.todayEvents, 'night_brush')
  ) {
    return 'night_brush' as const;
  }

  if (
    input.routineSettings.flossingEnabled &&
    isCadenceDueToday(
      input.now,
      input.routineSettings.flossSessionsPerWeek,
      input.lastFlossEvent,
      input.nightBaseMinutes + 15,
    ) &&
    currentMinutes >= ACTION_TIME_WINDOWS.floss.max &&
    !hasActionToday(input.todayEvents, 'floss')
  ) {
    return 'floss' as const;
  }

  if (
    input.routineSettings.mouthwashEnabled &&
    isCadenceDueToday(
      input.now,
      input.routineSettings.mouthwashSessionsPerWeek,
      input.lastMouthwashEvent,
      input.nightBaseMinutes + 30,
    ) &&
    currentMinutes >= ACTION_TIME_WINDOWS.mouthwash.max &&
    !hasActionToday(input.todayEvents, 'mouthwash')
  ) {
    return 'mouthwash' as const;
  }

  return null;
}

function buildAppointmentReminderSchedule(
  appointment: Appointment,
  now: Date,
  quietHours: { startMinutes: number; endMinutes: number },
) {
  if (!appointment.reminderEnabled || appointment.reminderMinutesBefore === null) {
    return null;
  }

  const rawDate = new Date(
    new Date(appointment.startsAt).getTime() - appointment.reminderMinutesBefore * 60 * 1000,
  );

  if (rawDate.getTime() <= now.getTime()) {
    return null;
  }

  const allowedDate = previousAllowedDate(rawDate, quietHours);
  if (allowedDate.getTime() <= now.getTime()) {
    return null;
  }

  if (allowedDate.getTime() >= new Date(appointment.startsAt).getTime()) {
    return null;
  }

  return allowedDate;
}

class NotificationSchedulerService {
  async syncForProfile(profileId: string) {
    await notificationService.cancelByPrefix(`routine_${profileId}_`);
    await notificationService.cancelByPrefix(`care_${profileId}_`);
    await notificationService.cancelByPrefix(`dental_${profileId}_`);

    const [routineSettings, appointments] = await Promise.all([
      routineSettingsRepository.getByProfileId(profileId),
      appointmentsRepository.listByProfileId(profileId),
    ]);

    if (!routineSettings?.remindersEnabled) {
      await this.syncAppointmentRemindersForProfile(profileId, appointments);
      return;
    }

    const now = new Date();
    const quietHours = resolveQuietHours(routineSettings);
    const [todayEvents, recentMorningBrushes, recentNightBrushes, recentFlosses, recentMouthwashes] =
      await Promise.all([
        hygieneEventsRepository.listByDateRange(profileId, startOfDay(now).toISOString(), endOfDay(now).toISOString()),
        hygieneEventsRepository.listByActionKey(profileId, 'morning_brush'),
        hygieneEventsRepository.listByActionKey(profileId, 'night_brush'),
        hygieneEventsRepository.listByActionKey(profileId, 'floss'),
        hygieneEventsRepository.listByActionKey(profileId, 'mouthwash'),
      ]);

    const morningBaseMinutes =
      parseTimeToMinutes(routineSettings.morningReminderTime) ??
      DEFAULT_ROUTINE_MINUTES.morning_brush;
    const nightBaseMinutes =
      parseTimeToMinutes(routineSettings.nightReminderTime) ??
      parseTimeToMinutes(routineSettings.reminderTime) ??
      DEFAULT_ROUTINE_MINUTES.night_brush;
    const adaptiveMinutesByAction: Record<DailyActionKey, number> = {
      morning_brush: averageCompletionMinutes(recentMorningBrushes, morningBaseMinutes, 'morning_brush'),
      night_brush: averageCompletionMinutes(recentNightBrushes, nightBaseMinutes, 'night_brush'),
      floss: averageCompletionMinutes(recentFlosses, nightBaseMinutes + 15, 'floss'),
      mouthwash: averageCompletionMinutes(recentMouthwashes, nightBaseMinutes + 30, 'mouthwash'),
    };

    if (routineSettings.brushingFrequencyPerDay >= 1) {
      await this.scheduleRoutineReminder(profileId, 'morning_brush', todayEvents, now, adaptiveMinutesByAction.morning_brush, morningBaseMinutes, quietHours);
    }

    if (routineSettings.brushingFrequencyPerDay >= 2) {
      await this.scheduleRoutineReminder(profileId, 'night_brush', todayEvents, now, adaptiveMinutesByAction.night_brush, nightBaseMinutes, quietHours);
    }

    await notificationService.cancel(`routine_${profileId}_third_brush`);

    if (routineSettings.flossingEnabled) {
      await this.scheduleFlossReminder(
        profileId,
        routineSettings,
        todayEvents,
        now,
        recentFlosses[0] ?? null,
        nightBaseMinutes + 15,
        quietHours,
      );
    }

    if (routineSettings.mouthwashEnabled) {
      await this.scheduleMouthwashReminder(
        profileId,
        routineSettings,
        todayEvents,
        now,
        recentMouthwashes[0] ?? null,
        nightBaseMinutes + 30,
        quietHours,
      );
    }

    await this.scheduleMissedCareFollowUp(
      profileId,
      routineSettings,
      todayEvents,
      now,
      quietHours,
      recentFlosses[0] ?? null,
      recentMouthwashes[0] ?? null,
      nightBaseMinutes,
    );

    await this.scheduleToothbrushReminder(profileId, routineSettings, now, quietHours);
    await this.scheduleDentalCheckReminder(profileId, appointments, now, quietHours);
    await this.syncAppointmentRemindersForProfile(profileId, appointments, quietHours);
  }

  async syncAppointmentReminder(appointment: Appointment) {
    const routineSettings = appointment.profileId
      ? await routineSettingsRepository.getByProfileId(appointment.profileId)
      : null;
    const quietHours = resolveQuietHours(
      routineSettings ?? {
        id: '',
        profileId: appointment.profileId,
        brushingFrequencyPerDay: 2,
        flossingEnabled: true,
        flossSessionsPerWeek: 1,
        mouthwashEnabled: false,
        mouthwashSessionsPerWeek: 1,
        remindersEnabled: true,
        reminderTime: null,
        morningReminderTime: null,
        nightReminderTime: null,
        quietHoursStart: null,
        quietHoursEnd: null,
        toothbrushReplacementIntervalDays: 90,
        toothbrushLastReplacedAt: null,
        createdAt: '',
        updatedAt: '',
      },
    );
    const request = this.buildAppointmentReminderRequest(appointment, new Date(), quietHours);

    if (!request) {
      if (appointment.reminderNotificationId) {
        await notificationService.cancel(appointment.reminderNotificationId);
      }
      return;
    }

    await notificationService.schedule(request);
  }

  async syncAppointmentRemindersForProfile(
    profileId: string,
    appointments?: Appointment[],
    quietHours?: { startMinutes: number; endMinutes: number },
  ) {
    const appointmentList = appointments ?? (await appointmentsRepository.listByProfileId(profileId));
    const profileQuietHours =
      quietHours ??
      resolveQuietHours(
        (await routineSettingsRepository.getByProfileId(profileId)) ?? {
          id: '',
          profileId,
          brushingFrequencyPerDay: 2,
          flossingEnabled: true,
          flossSessionsPerWeek: 1,
          mouthwashEnabled: false,
          mouthwashSessionsPerWeek: 1,
          remindersEnabled: true,
          reminderTime: null,
          morningReminderTime: null,
          nightReminderTime: null,
          quietHoursStart: null,
          quietHoursEnd: null,
          toothbrushReplacementIntervalDays: 90,
          toothbrushLastReplacedAt: null,
          createdAt: '',
          updatedAt: '',
        },
      );
    const activeReminderIds = new Set(
      appointmentList
        .map((appointment) =>
          appointment.reminderEnabled ? appointment.reminderNotificationId : null,
        )
        .filter((value): value is string => Boolean(value)),
    );
    const scheduledNotifications = await notificationService.listScheduled();

    for (const scheduledNotification of scheduledNotifications) {
      if (
        scheduledNotification.intent === 'appointment_reminder' &&
        scheduledNotification.profileId === profileId &&
        !activeReminderIds.has(scheduledNotification.id)
      ) {
        await notificationService.cancel(scheduledNotification.id);
      }
    }

    for (const appointment of appointmentList) {
      const request = this.buildAppointmentReminderRequest(appointment, new Date(), profileQuietHours);

      if (!request) {
        if (appointment.reminderNotificationId) {
          await notificationService.cancel(appointment.reminderNotificationId);
        }
        continue;
      }

      await notificationService.schedule(request);
    }
  }

  private async scheduleRoutineReminder(
    profileId: string,
    actionKey: DailyActionKey,
    todayEvents: HygieneEvent[],
    now: Date,
    adaptiveMinutes: number,
    preferredMinutes: number,
    quietHours: { startMinutes: number; endMinutes: number },
  ) {
    const scheduledFor = buildRoutineScheduleDate({
      actionKey,
      adaptiveMinutes,
      preferredMinutes,
      todayEvents,
      now,
      quietHours,
    });

    const copy = buildRoutineNotificationCopy(actionKey);
    await notificationService.schedule({
      id: createRoutineNotificationId(profileId, actionKey),
      profileId,
      intent: 'routine_reminder',
      title: copy.title,
      body: copy.body,
      scheduledFor: scheduledFor.toISOString(),
    });
  }

  private async scheduleFlossReminder(
    profileId: string,
    routineSettings: RoutineSettings,
    todayEvents: HygieneEvent[],
    now: Date,
    lastFlossEvent: HygieneEvent | null,
    preferredMinutes: number,
    quietHours: { startMinutes: number; endMinutes: number },
  ) {
    const scheduledFor = buildFlossScheduleDate({
      now,
      quietHours,
      sessionsPerWeek: routineSettings.flossSessionsPerWeek,
      actionKey: 'floss',
      lastEvent: lastFlossEvent,
      todayEvents,
      preferredMinutes,
    });
    const copy = buildRoutineNotificationCopy('floss');

    await notificationService.schedule({
      id: createRoutineNotificationId(profileId, 'floss'),
      profileId,
      intent: 'routine_reminder',
      title: copy.title,
      body: copy.body,
      scheduledFor: scheduledFor.toISOString(),
    });
  }

  private async scheduleMouthwashReminder(
    profileId: string,
    routineSettings: RoutineSettings,
    todayEvents: HygieneEvent[],
    now: Date,
    lastMouthwashEvent: HygieneEvent | null,
    preferredMinutes: number,
    quietHours: { startMinutes: number; endMinutes: number },
  ) {
    const scheduledFor = buildFlossScheduleDate({
      now,
      quietHours,
      sessionsPerWeek: routineSettings.mouthwashSessionsPerWeek,
      actionKey: 'mouthwash',
      lastEvent: lastMouthwashEvent,
      todayEvents,
      preferredMinutes,
    });
    const copy = buildRoutineNotificationCopy('mouthwash');

    await notificationService.schedule({
      id: createRoutineNotificationId(profileId, 'mouthwash'),
      profileId,
      intent: 'routine_reminder',
      title: copy.title,
      body: copy.body,
      scheduledFor: scheduledFor.toISOString(),
    });
  }

  private async scheduleMissedCareFollowUp(
    profileId: string,
    routineSettings: RoutineSettings,
    todayEvents: HygieneEvent[],
    now: Date,
    quietHours: { startMinutes: number; endMinutes: number },
    lastFlossEvent: HygieneEvent | null,
    lastMouthwashEvent: HygieneEvent | null,
    nightBaseMinutes: number,
  ) {
    const missedActionKey = findMissedCareAction({
      routineSettings,
      todayEvents,
      now,
      lastFlossEvent,
      lastMouthwashEvent,
      nightBaseMinutes,
    });

    if (!missedActionKey) {
      await notificationService.cancel(createRoutineFollowUpNotificationId(profileId));
      return;
    }

    const scheduledFor = nextAllowedDate(new Date(now.getTime() + 15 * 60 * 1000), quietHours);

    await notificationService.schedule({
      id: createRoutineFollowUpNotificationId(profileId),
      profileId,
      intent: 'routine_follow_up',
      title: i18n.t('notifications.followUp.title'),
      body: i18n.t('notifications.followUp.body', {
        action: i18n.t(getActionLabelKey(missedActionKey)),
      }),
      scheduledFor: scheduledFor.toISOString(),
    });
  }

  private async scheduleToothbrushReminder(
    profileId: string,
    routineSettings: RoutineSettings,
    now: Date,
    quietHours: { startMinutes: number; endMinutes: number },
  ) {
    if (!routineSettings.toothbrushLastReplacedAt) {
      return;
    }

    const dueDate = new Date(routineSettings.toothbrushLastReplacedAt);
    dueDate.setDate(dueDate.getDate() + routineSettings.toothbrushReplacementIntervalDays);
    dueDate.setHours(10, 0, 0, 0);

    const scheduledFor = dueDate.getTime() <= now.getTime()
      ? nextAllowedDate(new Date(now.getTime() + 60 * 60 * 1000), quietHours)
      : nextAllowedDate(dueDate, quietHours);

    await notificationService.schedule({
      id: createToothbrushNotificationId(profileId),
      profileId,
      intent: 'care_item_due',
      title: i18n.t('notifications.toothbrush.title'),
      body: i18n.t('notifications.toothbrush.body'),
      scheduledFor: scheduledFor.toISOString(),
    });
  }

  private async scheduleDentalCheckReminder(
    profileId: string,
    appointments: Appointment[],
    now: Date,
    quietHours: { startMinutes: number; endMinutes: number },
  ) {
    const futureScheduledAppointment = appointments.find(
      (appointment) =>
        appointment.status === 'scheduled' &&
        new Date(appointment.startsAt).getTime() > now.getTime(),
    );

    if (futureScheduledAppointment) {
      await notificationService.cancel(createDentalCheckNotificationId(profileId));
      return;
    }

    const latestAppointment = [...appointments]
      .filter((appointment) => appointment.status !== 'cancelled')
      .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())[0] ?? null;

    const dueDate = latestAppointment
      ? new Date(latestAppointment.startsAt)
      : new Date(now);

    dueDate.setDate(dueDate.getDate() + (latestAppointment ? 180 : 30));
    dueDate.setHours(10, 0, 0, 0);

    const scheduledFor = dueDate.getTime() <= now.getTime()
      ? nextAllowedDate(new Date(now.getTime() + 2 * 60 * 60 * 1000), quietHours)
      : nextAllowedDate(dueDate, quietHours);

    await notificationService.schedule({
      id: createDentalCheckNotificationId(profileId),
      profileId,
      intent: 'dental_check_reminder',
      title: i18n.t('notifications.dentalCheck.title'),
      body: i18n.t('notifications.dentalCheck.body'),
      scheduledFor: scheduledFor.toISOString(),
    });
  }

  private buildAppointmentReminderRequest(
    appointment: Appointment,
    now: Date,
    quietHours: { startMinutes: number; endMinutes: number },
  ): NotificationRequest | null {
    const scheduledFor = buildAppointmentReminderSchedule(appointment, now, quietHours);
    if (!scheduledFor || !appointment.reminderNotificationId) {
      return null;
    }

    return {
      id: appointment.reminderNotificationId,
      profileId: appointment.profileId,
      intent: 'appointment_reminder',
      title: appointment.title,
      body:
        [appointment.clinicName, appointment.doctorName].filter(Boolean).join(' · ') ||
        i18n.t('notifications.appointment.body'),
      scheduledFor: scheduledFor.toISOString(),
    };
  }
}

export const notificationSchedulerService = new NotificationSchedulerService();
