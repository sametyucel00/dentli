import { ToothCurrentStatus, ToothStatus } from '@/src/domain/models';
import { TOOTH_PROBLEM_ZONE_STATUSES, TOTAL_TEETH_COUNT } from '@/src/domain/teeth';

export type ToothMapItem = {
  toothNumber: number;
  status: ToothStatus;
  note: string | null;
  recordedAt: string | null;
  isProblemZone: boolean;
};

export function isProblemZoneStatus(status: ToothStatus) {
  return TOOTH_PROBLEM_ZONE_STATUSES.includes(status);
}

export function createToothMapItems(currentStatuses: ToothCurrentStatus[]): ToothMapItem[] {
  const statusByToothNumber = new Map(
    currentStatuses.map((status) => [status.toothNumber, status] as const),
  );

  return Array.from({ length: TOTAL_TEETH_COUNT }, (_, index) => {
    const toothNumber = index + 1;
    const currentStatus = statusByToothNumber.get(toothNumber);
    const status = currentStatus?.status ?? 'healthy';

    return {
      toothNumber,
      status,
      note: currentStatus?.note ?? null,
      recordedAt: currentStatus?.recordedAt ?? null,
      isProblemZone: isProblemZoneStatus(status),
    };
  });
}
