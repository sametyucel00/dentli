import { ToothStatus, ToothStatusHistory } from '@/src/domain/models';
import { createId, nowIso } from '@/src/lib/runtime';
import { toothStatusRepository } from '@/src/repositories';
import { databaseService } from '@/src/services/database-service';
import { useAppStore } from '@/src/state/useAppStore';

type UpsertToothStatusInput = {
  profileId: string;
  toothNumber: number;
  status: ToothStatus;
  note: string | null;
  source: string;
};

class ToothStatusService {
  async listCurrent(profileId: string) {
    const currentStatuses = await toothStatusRepository.listCurrentByProfileId(profileId);
    useAppStore.getState().cacheToothCurrentStatuses(profileId, currentStatuses);
    return currentStatuses;
  }

  async listHistory(profileId: string, toothNumber: number, limit?: number) {
    return toothStatusRepository.listHistoryByToothNumber(profileId, toothNumber, limit);
  }

  async upsertStatus(input: UpsertToothStatusInput) {
    const timestamp = nowIso();

    await databaseService.withTransaction(async () => {
      await toothStatusRepository.upsertCurrentStatus({
        id: createId('tooth'),
        profileId: input.profileId,
        toothNumber: input.toothNumber,
        status: input.status,
        note: input.note,
        recordedAt: timestamp,
        updatedAt: timestamp,
      });

      const historyEntry: ToothStatusHistory = {
        id: createId('history'),
        profileId: input.profileId,
        toothNumber: input.toothNumber,
        status: input.status,
        note: input.note,
        recordedAt: timestamp,
        source: input.source,
      };

      await toothStatusRepository.appendHistory(historyEntry);
    });

    return this.listCurrent(input.profileId);
  }

  async updateHistoryEntry(input: ToothStatusHistory) {
    await databaseService.withTransaction(async () => {
      await toothStatusRepository.updateHistory(input);
      await this.syncCurrentStatusFromHistory(input.profileId, input.toothNumber);
    });

    return {
      currentStatuses: await this.listCurrent(input.profileId),
      history: await this.listHistory(input.profileId, input.toothNumber, 10),
    };
  }

  async deleteHistoryEntry(profileId: string, toothNumber: number, historyId: string) {
    await databaseService.withTransaction(async () => {
      await toothStatusRepository.deleteHistoryById(historyId);
      await this.syncCurrentStatusFromHistory(profileId, toothNumber);
    });

    return {
      currentStatuses: await this.listCurrent(profileId),
      history: await this.listHistory(profileId, toothNumber, 10),
    };
  }

  private async syncCurrentStatusFromHistory(profileId: string, toothNumber: number) {
    const [latestHistoryEntry, currentStatus] = await Promise.all([
      toothStatusRepository.listHistoryByToothNumber(profileId, toothNumber, 1),
      toothStatusRepository.getCurrentByToothNumber(profileId, toothNumber),
    ]);

    const latestEntry = latestHistoryEntry[0] ?? null;

    if (!latestEntry) {
      if (currentStatus) {
        await toothStatusRepository.deleteCurrentByProfileAndTooth(profileId, toothNumber);
      }

      return;
    }

    await toothStatusRepository.upsertCurrentStatus({
      id: currentStatus?.id ?? createId('tooth'),
      profileId,
      toothNumber,
      status: latestEntry.status,
      note: latestEntry.note,
      recordedAt: latestEntry.recordedAt,
      updatedAt: nowIso(),
    });
  }
}

export const toothStatusService = new ToothStatusService();
