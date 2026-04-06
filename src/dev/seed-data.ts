import {
  Appointment,
  CareItem,
  HygieneEvent,
  Profile,
  RoutineSettings,
  SymptomEvent,
  ToothCurrentStatus,
  ToothStatusHistory,
} from '@/src/domain/models';
import { createId, nowIso } from '@/src/lib/runtime';
import {
  appointmentsRepository,
  careItemsRepository,
  hygieneEventsRepository,
  profileRepository,
  routineSettingsRepository,
  symptomEventsRepository,
  toothStatusRepository,
} from '@/src/repositories';
import { databaseService } from '@/src/services/database-service';

let skipNextSeed = false;
const DEV_SEED_ENABLED = process.env.EXPO_PUBLIC_ENABLE_DEV_SEED === '1';

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function skipNextDevelopmentSeed() {
  skipNextSeed = true;
}

export async function seedDevelopmentData() {
  if (!__DEV__ || !DEV_SEED_ENABLED) return;
  if (skipNextSeed) {
    skipNextSeed = false;
    return;
  }

  const existingProfiles = await profileRepository.list();
  if (existingProfiles.length > 0) return;

  const timestamp = nowIso();
  const profileId = createId('profile');

  const profile: Profile = {
    id: profileId,
    firstName: 'Mina',
    lastName: 'Kaya',
    preferredLanguage: 'en',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const routineSettings: RoutineSettings = {
    id: createId('routine'),
    profileId,
    brushingFrequencyPerDay: 2,
    flossingEnabled: true,
    mouthwashEnabled: true,
    remindersEnabled: true,
    reminderTime: '21:00',
    morningReminderTime: '08:30',
    nightReminderTime: '21:00',
    quietHoursStart: '22:30',
    quietHoursEnd: '07:30',
    toothbrushReplacementIntervalDays: 90,
    toothbrushLastReplacedAt: hoursFromNow(-(24 * 72)),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const hygieneEvents: HygieneEvent[] = [
    {
      id: createId('hygiene'),
      profileId,
      eventType: 'brush',
      actionKey: 'morning_brush',
      occurredAt: hoursFromNow(-10),
      durationSeconds: 125,
      notes: 'Morning routine',
    },
    {
      id: createId('hygiene'),
      profileId,
      eventType: 'brush',
      actionKey: 'night_brush',
      occurredAt: hoursFromNow(-36),
      durationSeconds: 140,
      notes: 'Night routine',
    },
    {
      id: createId('hygiene'),
      profileId,
      eventType: 'floss',
      actionKey: 'floss',
      occurredAt: hoursFromNow(-32),
      durationSeconds: 90,
      notes: 'Evening floss',
    },
  ];

  const symptomEvent: SymptomEvent = {
    id: createId('symptom'),
    profileId,
    symptomType: 'sensitivity',
    severity: 2,
    toothNumber: 14,
    notes: 'Cold drinks',
    occurredAt: hoursFromNow(-24),
  };

  const appointmentId = createId('appointment');

  const appointment: Appointment = {
    id: appointmentId,
    profileId,
    title: 'Routine cleaning',
    providerName: 'Dentli Clinic',
    startsAt: hoursFromNow(48),
    endsAt: hoursFromNow(49),
    location: 'Istanbul',
    notes: 'Bring previous x-rays',
    status: 'scheduled',
    reminderEnabled: true,
    reminderMinutesBefore: 1440,
    reminderNotificationId: `appointment_${appointmentId}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const careItem: CareItem = {
    id: createId('care'),
    profileId,
    title: 'Main toothbrush',
    description: 'Soft bristles, replace on schedule.',
    category: 'note',
    itemType: 'toothbrush',
    status: 'active',
    trackingEnabled: true,
    replacementCycleDays: 90,
    lastReplacedAt: hoursFromNow(-(24 * 72)),
    dueAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const currentStatuses: ToothCurrentStatus[] = [
    {
      id: createId('tooth'),
      profileId,
      toothNumber: 14,
      status: 'sensitivity',
      note: 'Cold drinks trigger it.',
      recordedAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createId('tooth'),
      profileId,
      toothNumber: 3,
      status: 'crown',
      note: 'Existing crown from last year.',
      recordedAt: hoursFromNow(-(24 * 14)),
      updatedAt: hoursFromNow(-(24 * 14)),
    },
    {
      id: createId('tooth'),
      profileId,
      toothNumber: 30,
      status: 'filling',
      note: 'Composite filling.',
      recordedAt: hoursFromNow(-(24 * 40)),
      updatedAt: hoursFromNow(-(24 * 40)),
    },
  ];

  const historyEntries: ToothStatusHistory[] = [
    {
      id: createId('history'),
      profileId,
      toothNumber: 14,
      status: 'sensitivity',
      note: 'Sensitivity noted during setup.',
      recordedAt: timestamp,
      source: 'bootstrap_seed',
    },
    {
      id: createId('history'),
      profileId,
      toothNumber: 3,
      status: 'crown',
      note: 'Crown placed after prior treatment.',
      recordedAt: hoursFromNow(-(24 * 14)),
      source: 'bootstrap_seed',
    },
    {
      id: createId('history'),
      profileId,
      toothNumber: 30,
      status: 'filling',
      note: 'Filling completed successfully.',
      recordedAt: hoursFromNow(-(24 * 40)),
      source: 'bootstrap_seed',
    },
  ];

  await databaseService.withTransaction(async () => {
    await profileRepository.create(profile);
    await routineSettingsRepository.upsert(routineSettings);
    for (const hygieneEvent of hygieneEvents) {
      await hygieneEventsRepository.create(hygieneEvent);
    }
    await symptomEventsRepository.create(symptomEvent);
    await appointmentsRepository.create(appointment);
    await careItemsRepository.create(careItem);
    for (const currentStatus of currentStatuses) {
      await toothStatusRepository.upsertCurrentStatus(currentStatus);
    }
    for (const historyEntry of historyEntries) {
      await toothStatusRepository.appendHistory(historyEntry);
    }
  });
}
