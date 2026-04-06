import { ToothStatus } from '@/src/domain/models';
import { DentistModeSummary } from '@/src/features/dentist-mode/model';
import {
  createDailySummaryMap,
  getCompletionTargetsForDateRange,
} from '@/src/features/profile/analytics';
import {
  appointmentsRepository,
  hygieneEventsRepository,
  routineSettingsRepository,
  symptomEventsRepository,
  toothStatusRepository,
} from '@/src/repositories';

function getRangeStart(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function percentage(completed: number, target: number) {
  if (target <= 0) return 0;
  return Math.round((completed / target) * 100);
}

export class DentistModeService {
  async load(profileId: string): Promise<DentistModeSummary> {
    const startIso = getRangeStart(30);

    const [appointments, hygieneEvents, routineSettings, symptoms, toothHistory] =
      await Promise.all([
        appointmentsRepository.listByProfileId(profileId),
        hygieneEventsRepository.listByProfileId(profileId, 240),
        routineSettingsRepository.getByProfileId(profileId),
        symptomEventsRepository.listByProfileId(profileId, 120),
        toothStatusRepository.listHistoryByProfileId(profileId),
      ]);

    const recentHygiene = hygieneEvents.filter((event) => event.occurredAt >= startIso);
    const recentSymptoms = symptoms.filter((event) => event.occurredAt >= startIso);
    const recentAppointments = appointments.filter((event) => event.startsAt >= startIso);
    const recentToothUpdates = toothHistory.filter((event) => event.recordedAt >= startIso);
    const summaryMap = createDailySummaryMap(recentHygiene);
    const rangeStart = new Date(startIso);
    const rangeEnd = new Date();
    rangeEnd.setHours(23, 59, 59, 999);
    const { brushing, floss, mouthwash } = getCompletionTargetsForDateRange(
      summaryMap,
      routineSettings,
      rangeStart,
      rangeEnd,
    );

    const problemTeethMap = new Map<number, { status: ToothStatus; count: number }>();
    for (const update of recentToothUpdates) {
      if (update.status === 'healthy') continue;
      const current = problemTeethMap.get(update.toothNumber);
      problemTeethMap.set(update.toothNumber, {
        status: update.status,
        count: (current?.count ?? 0) + 1,
      });
    }

    const recentEvents = [
      ...recentHygiene.map((event) => ({
        id: event.id,
        type: 'hygiene' as const,
        timestamp: event.occurredAt,
        title: event.actionKey ?? event.eventType,
        detail: event.notes ?? null,
      })),
      ...recentSymptoms.map((event) => ({
        id: event.id,
        type: 'symptom' as const,
        timestamp: event.occurredAt,
        title: event.symptomType,
        detail: event.notes ?? null,
      })),
      ...recentAppointments.map((event) => ({
        id: event.id,
        type: 'appointment' as const,
        timestamp: event.startsAt,
        title: event.title,
        detail: [event.clinicName, event.doctorName].filter(Boolean).join(' • ') || null,
      })),
      ...recentToothUpdates.map((event) => ({
        id: event.id,
        type: 'tooth' as const,
        timestamp: event.recordedAt,
        title: `Tooth ${event.toothNumber}`,
        detail: event.status,
      })),
    ]
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 12);

    return {
      generatedAt: new Date().toISOString(),
      periodDays: 30,
      stats: {
        totalHygieneEvents: recentHygiene.length,
        totalSymptoms: recentSymptoms.length,
        totalAppointments: recentAppointments.length,
        totalToothUpdates: recentToothUpdates.length,
      },
      hygieneRates: {
        brushingRate: percentage(brushing.completedCount, brushing.expectedCount),
        flossRate: percentage(floss.completedCount, floss.expectedCount),
        mouthwashRate: percentage(mouthwash.completedCount, mouthwash.expectedCount),
      },
      problemTeeth: Array.from(problemTeethMap.entries()).map(([toothNumber, value]) => ({
        toothNumber,
        status: value.status,
        occurrences: value.count,
      })),
      symptoms: recentSymptoms,
      recentEvents,
    };
  }
}

export const dentistModeService = new DentistModeService();
