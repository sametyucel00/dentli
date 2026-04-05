import { SymptomEvent, SymptomType } from '@/src/domain/models';
import { createId, nowIso } from '@/src/lib/runtime';
import { symptomEventsRepository } from '@/src/repositories';

type SaveSymptomInput = {
  id?: string;
  profileId: string;
  symptomType: SymptomType;
  severity: number | null;
  toothNumber: number | null;
  notes: string | null;
  occurredAt?: string;
};

class SymptomService {
  async listByProfileId(profileId: string, limit?: number) {
    return symptomEventsRepository.listByProfileId(profileId, limit);
  }

  async create(input: SaveSymptomInput) {
    const symptom: SymptomEvent = {
      id: createId('symptom'),
      profileId: input.profileId,
      symptomType: input.symptomType,
      severity: input.severity,
      toothNumber: input.toothNumber,
      notes: input.notes,
      occurredAt: input.occurredAt ?? nowIso(),
    };

    await symptomEventsRepository.create(symptom);
    return symptom;
  }

  async update(input: SaveSymptomInput & { id: string }) {
    const existing = await symptomEventsRepository.getById(input.id);
    if (!existing) return null;

    const symptom: SymptomEvent = {
      ...existing,
      symptomType: input.symptomType,
      severity: input.severity,
      toothNumber: input.toothNumber,
      notes: input.notes,
      occurredAt: input.occurredAt ?? existing.occurredAt,
    };

    await symptomEventsRepository.update(symptom);
    return symptom;
  }

  async delete(id: string) {
    await symptomEventsRepository.deleteById(id);
  }
}

export const symptomService = new SymptomService();
