import { ToothStatus } from '@/src/domain/models';
import { DentistModeSummary } from '@/src/features/dentist-mode/model';
import {
  appointmentsRepository,
  hygieneEventsRepository,
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

    const [appointments, hygieneEvents, symptoms, toothHistory] = await Promise.all([
      appointmentsRepository.listByProfileId(profileId),
      hygieneEventsRepository.listByProfileId(profileId, 240),
      symptomEventsRepository.listByProfileId(profileId, 120),
      toothStatusRepository.listHistoryByProfileId(profileId),
    ]);

    const recentHygiene = hygieneEvents.filter((event) => event.occurredAt >= startIso);
    const recentSymptoms = symptoms.filter((event) => event.occurredAt >= startIso);
    const recentAppointments = appointments.filter((event) => event.startsAt >= startIso);
    const recentToothUpdates = toothHistory.filter((event) => event.recordedAt >= startIso);

    const brushCount = recentHygiene.filter((event) => event.eventType === 'brush').length;
    const flossCount = recentHygiene.filter((event) => event.eventType === 'floss').length;
    const mouthwashCount = recentHygiene.filter((event) => event.eventType === 'mouthwash').length;
    const hygieneTargetDays = 30;

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
        detail: event.providerName ?? null,
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
        brushingRate: percentage(brushCount, hygieneTargetDays * 2),
        flossRate: percentage(flossCount, hygieneTargetDays),
        mouthwashRate: percentage(mouthwashCount, hygieneTargetDays),
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
