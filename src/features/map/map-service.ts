import { ToothStatus } from '@/src/domain/models';
import { toothStatusService } from '@/src/services';

import { createToothMapItems } from '@/src/features/map/map-model';

class ToothMapService {
  async load(profileId: string) {
    const currentStatuses = await toothStatusService.listCurrent(profileId);

    return {
      teeth: createToothMapItems(currentStatuses),
    };
  }

  async loadToothHistory(profileId: string, toothNumber: number) {
    return toothStatusService.listHistory(profileId, toothNumber, 10);
  }

  async saveTooth(input: {
    profileId: string;
    toothNumber: number;
    status: ToothStatus;
    note: string | null;
  }) {
    const currentStatuses = await toothStatusService.upsertStatus({
      ...input,
      source: 'map_screen',
    });

    return {
      teeth: createToothMapItems(currentStatuses),
      history: await this.loadToothHistory(input.profileId, input.toothNumber),
    };
  }
}

export const toothMapService = new ToothMapService();
