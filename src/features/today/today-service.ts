import {
  Appointment,
  DailyActionKey,
  HygieneEvent,
  RoutineSettings,
  SymptomEvent,
  ToothCurrentStatus,
  ToothStatus,
} from '@/src/domain/models';
import { createId, nowIso } from '@/src/lib/runtime';
import {
  buildInsightItems,
  getToothbrushDaysLeft,
} from '@/src/features/insights/insights-engine';
import {
  hygieneEventsRepository,
  routineSettingsRepository,
} from '@/src/repositories';
import { appointmentService, symptomService, toothStatusService } from '@/src/services';

import {
  BrushCompletionChoice,
  TODAY_ACTIONS,
  TodayInsight,
  TodayQuickStatus,
} from '@/src/features/today/model';

type TodaySnapshot = {
  routineSettings: RoutineSettings | null;
  todayEvents: HygieneEvent[];
  lastBrushEvent: HygieneEvent | null;
  lastFlossEvent: HygieneEvent | null;
  nextAppointment: Appointment | null;
  recentSymptoms: SymptomEvent[];
  toothStatuses: ToothCurrentStatus[];
};

function getDayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function getActionEvent(todayEvents: HygieneEvent[], actionKey: DailyActionKey) {
  return todayEvents.find((event) => event.actionKey === actionKey) ?? null;
}

export class TodayService {
  async load(profileId: string) {
    const { startIso, endIso } = getDayRange();

    const [
      routineSettings,
      todayEvents,
      lastBrushEvent,
      lastFlossEvent,
      nextAppointment,
      recentSymptoms,
      toothStatuses,
    ] = await Promise.all([
      routineSettingsRepository.getByProfileId(profileId),
      hygieneEventsRepository.listByDateRange(profileId, startIso, endIso),
      hygieneEventsRepository.getLatestByType(profileId, 'brush'),
      hygieneEventsRepository.getLatestByType(profileId, 'floss'),
      appointmentService.getNextScheduledByProfileId(profileId, nowIso()),
      symptomService.listByProfileId(profileId, 5),
      toothStatusService.listCurrent(profileId),
    ]);

    const actionState = Object.fromEntries(
      TODAY_ACTIONS.map((action) => [action.key, getActionEvent(todayEvents, action.key)]),
    ) as Record<DailyActionKey, HygieneEvent | null>;

    const quickStatus: TodayQuickStatus = {
      lastBrushAt: lastBrushEvent?.occurredAt ?? null,
      lastFlossAt: lastFlossEvent?.occurredAt ?? null,
      toothbrushDaysLeft: getToothbrushDaysLeft(routineSettings),
      nextDentalCheckAt: nextAppointment?.startsAt ?? null,
    };

    const visibleActions = TODAY_ACTIONS.filter(
      (action) => !action.optional || routineSettings?.mouthwashEnabled,
    );

    return {
      snapshot: {
        routineSettings,
        todayEvents,
        lastBrushEvent,
        lastFlossEvent,
        nextAppointment,
        recentSymptoms,
        toothStatuses,
      } satisfies TodaySnapshot,
      visibleActions,
      actionState,
      quickStatus,
      insights: buildInsightItems({
        todayEvents,
        routineSettings,
        lastFlossEvent,
        toothbrushDaysLeft: quickStatus.toothbrushDaysLeft,
      }) as TodayInsight[],
    };
  }

  async toggleAction(
    profileId: string,
    actionKey: DailyActionKey,
  ) {
    const { startIso, endIso } = getDayRange();
    const existingEvent = await hygieneEventsRepository.getByActionKeyInRange(
      profileId,
      actionKey,
      startIso,
      endIso,
    );

    if (existingEvent) {
      await hygieneEventsRepository.deleteById(existingEvent.id);
      return false;
    }

    const action = TODAY_ACTIONS.find((item) => item.key === actionKey);
    if (!action) {
      return false;
    }

    const event: HygieneEvent = {
      id: createId('hygiene'),
      profileId,
      eventType: action.eventType,
      actionKey,
      occurredAt: nowIso(),
      durationSeconds: null,
      notes: null,
    };

    await hygieneEventsRepository.create(event);
    return true;
  }

  async addSymptom(input: {
    profileId: string;
    symptomType: SymptomEvent['symptomType'];
    severity: number | null;
    toothNumber: number | null;
    notes: string | null;
  }) {
    await symptomService.create(input);
  }

  async addAppointment(input: {
    profileId: string;
    title: string;
    doctorName: string | null;
    startsAt: string;
  }) {
    await appointmentService.create({
      profileId: input.profileId,
      title: input.title,
      appointmentType: 'checkup',
      clinicName: null,
      doctorName: input.doctorName,
      startsAt: input.startsAt,
      endsAt: null,
      notes: null,
      status: 'scheduled',
      reminderEnabled: false,
      reminderMinutesBefore: null,
    });
  }

  async updateTooth(input: {
    profileId: string;
    toothNumber: number;
    status: ToothStatus;
    note: string | null;
  }) {
    await toothStatusService.upsertStatus({
      profileId: input.profileId,
      toothNumber: input.toothNumber,
      status: input.status,
      note: input.note,
      source: 'today_sheet',
    });
  }

  async completeBrushTimer(
    profileId: string,
    completionChoice: BrushCompletionChoice,
    durationSeconds: number,
  ) {
    const { startIso, endIso } = getDayRange();
    const existingEvent = await hygieneEventsRepository.getByActionKeyInRange(
      profileId,
      completionChoice,
      startIso,
      endIso,
    );

    if (existingEvent) {
      await hygieneEventsRepository.deleteById(existingEvent.id);
    }

    const event: HygieneEvent = {
      id: createId('hygiene'),
      profileId,
      eventType: 'brush',
      actionKey: completionChoice,
      occurredAt: nowIso(),
      durationSeconds,
      notes: 'timer_completion',
    };

    await hygieneEventsRepository.create(event);
  }

  async addExtraCareEvent(
    profileId: string,
    actionKey: Extract<DailyActionKey, 'floss' | 'mouthwash'>,
  ) {
    const action = TODAY_ACTIONS.find((item) => item.key === actionKey);
    if (!action) {
      return;
    }

    const event: HygieneEvent = {
      id: createId('hygiene'),
      profileId,
      eventType: action.eventType,
      actionKey,
      occurredAt: nowIso(),
      durationSeconds: null,
      notes: null,
    };

    await hygieneEventsRepository.create(event);
  }
}

export const todayService = new TodayService();
