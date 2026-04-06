import { DEFAULT_CARE_ITEM_REPLACEMENT_DAYS } from '@/src/domain/care';
import { CareItem, CareItemType } from '@/src/domain/models';
import { CareItemMutationInput } from '@/src/services/care-service.types';

export type CareItemDraft = {
  title: string;
  description: string;
  itemType: CareItemType;
  replacementCycleDays: string;
  lastReplacedAt: string;
};

export type CareCountdown = {
  daysLeft: number | null;
  dueNow: boolean;
};

export function createDefaultCareDateTime() {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString();
}

export function createInitialCareItemDraft(): CareItemDraft {
  return {
    title: '',
    description: '',
    itemType: 'toothbrush',
    replacementCycleDays: `${DEFAULT_CARE_ITEM_REPLACEMENT_DAYS.toothbrush ?? ''}`,
    lastReplacedAt: createDefaultCareDateTime(),
  };
}

export function mapCareItemToDraft(item: CareItem): CareItemDraft {
  return {
    title: item.title,
    description: item.description ?? '',
    itemType: item.itemType,
    replacementCycleDays: item.replacementCycleDays?.toString() ?? '',
    lastReplacedAt: item.lastReplacedAt ?? createDefaultCareDateTime(),
  };
}

export function getCareCountdown(item: CareItem): CareCountdown {
  if (!item.trackingEnabled || !item.lastReplacedAt || !item.replacementCycleDays) {
    return { daysLeft: null, dueNow: false };
  }

  const nextReplacementAt = new Date(item.lastReplacedAt);
  nextReplacementAt.setDate(
    nextReplacementAt.getDate() + item.replacementCycleDays,
  );

  const daysLeft = Math.ceil(
    (nextReplacementAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return {
    daysLeft,
    dueNow: daysLeft <= 0,
  };
}

export function mapDraftToCareItemInput(
  profileId: string,
  draft: CareItemDraft,
): CareItemMutationInput {
  const fallbackReplacementDays = DEFAULT_CARE_ITEM_REPLACEMENT_DAYS[draft.itemType] ?? null;
  return {
    profileId,
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    itemType: draft.itemType,
    replacementCycleDays: draft.replacementCycleDays
      ? Number(draft.replacementCycleDays)
      : fallbackReplacementDays,
    lastReplacedAt: draft.lastReplacedAt.trim() || null,
  };
}
