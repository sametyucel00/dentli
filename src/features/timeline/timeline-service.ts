import { Appointment, HygieneEvent, SymptomEvent, ToothStatusHistory } from '@/src/domain/models';
import { nowIso } from '@/src/lib/runtime';
import {
  appointmentsRepository,
  hygieneEventsRepository,
  symptomEventsRepository,
  toothStatusRepository,
} from '@/src/repositories';
import { symptomService, toothStatusService } from '@/src/services';

import { TimelineItem } from '@/src/features/timeline/model';

function sortTimelineItems(items: TimelineItem[]) {
  return [...items].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

class TimelineService {
  async load(profileId: string) {
    const [hygieneEvents, symptomEvents, appointments, toothUpdates] = await Promise.all([
      hygieneEventsRepository.listByProfileId(profileId, 120),
      symptomEventsRepository.listByProfileId(profileId, 120),
      appointmentsRepository.listByProfileId(profileId),
      toothStatusRepository.listHistoryByProfileId(profileId),
    ]);

    return sortTimelineItems([
      ...hygieneEvents.map(
        (event) =>
          ({
            id: event.id,
            kind: 'hygiene',
            occurredAt: event.occurredAt,
            event,
          }) satisfies TimelineItem,
      ),
      ...symptomEvents.map(
        (event) =>
          ({
            id: event.id,
            kind: 'symptom',
            occurredAt: event.occurredAt,
            event,
          }) satisfies TimelineItem,
      ),
      ...appointments.map(
        (event) =>
          ({
            id: event.id,
            kind: 'appointment',
            occurredAt: event.startsAt,
            event,
          }) satisfies TimelineItem,
      ),
      ...toothUpdates.map(
        (event) =>
          ({
            id: event.id,
            kind: 'tooth',
            occurredAt: event.recordedAt,
            event,
          }) satisfies TimelineItem,
      ),
    ]);
  }

  async updateHygieneEvent(event: HygieneEvent) {
    await hygieneEventsRepository.update(event);
  }

  async deleteHygieneEvent(id: string) {
    await hygieneEventsRepository.deleteById(id);
  }

  async createSymptom(input: {
    profileId: string;
    symptomType: SymptomEvent['symptomType'];
    severity: number | null;
    toothNumber: number | null;
    notes: string | null;
    occurredAt?: string;
  }) {
    await symptomService.create(input);
  }

  async updateSymptom(event: SymptomEvent) {
    await symptomService.update({
      id: event.id,
      profileId: event.profileId,
      symptomType: event.symptomType,
      severity: event.severity,
      toothNumber: event.toothNumber,
      notes: event.notes,
      occurredAt: event.occurredAt,
    });
  }

  async deleteSymptom(id: string) {
    await symptomService.delete(id);
  }

  async updateAppointment(event: Appointment) {
    await appointmentsRepository.update({
      ...event,
      updatedAt: nowIso(),
    });
  }

  async deleteAppointment(id: string) {
    await appointmentsRepository.deleteById(id);
  }

  async updateToothUpdate(event: ToothStatusHistory) {
    await toothStatusService.updateHistoryEntry(event);
  }

  async deleteToothUpdate(event: ToothStatusHistory) {
    await toothStatusService.deleteHistoryEntry(event.profileId, event.toothNumber, event.id);
  }
}

export const timelineService = new TimelineService();
