import { CareItem, CareItemType } from '@/src/domain/models';
import { DEFAULT_TOOTHBRUSH_REPLACEMENT_DAYS } from '@/src/domain/care';
import { createId, nowIso } from '@/src/lib/runtime';
import { careItemsRepository } from '@/src/repositories';
import { CareItemMutationInput } from '@/src/services/care-service.types';
import { useAppStore } from '@/src/state/useAppStore';

function resolveReplacementCycleDays(
  itemType: CareItemType,
  replacementCycleDays: number | null,
) {
  if (itemType === 'toothbrush') {
    return replacementCycleDays ?? DEFAULT_TOOTHBRUSH_REPLACEMENT_DAYS;
  }

  return replacementCycleDays;
}

function isReplacementTrackingEnabled(
  itemType: CareItemType,
  replacementCycleDays: number | null,
  lastReplacedAt: string | null,
) {
  return itemType === 'toothbrush' || replacementCycleDays !== null || lastReplacedAt !== null;
}

class CareService {
  async listByProfileId(profileId: string) {
    const careItems = await careItemsRepository.listByProfileId(profileId);
    useAppStore.getState().cacheCareItems(profileId, careItems);
    return careItems;
  }

  async create(input: CareItemMutationInput) {
    const timestamp = nowIso();
    const replacementCycleDays = resolveReplacementCycleDays(
      input.itemType,
      input.replacementCycleDays,
    );

    const careItem: CareItem = {
      id: createId('care'),
      profileId: input.profileId,
      title: input.title,
      description: input.description,
      category: 'note',
      itemType: input.itemType,
      status: 'active',
      trackingEnabled: isReplacementTrackingEnabled(
        input.itemType,
        replacementCycleDays,
        input.lastReplacedAt,
      ),
      replacementCycleDays,
      lastReplacedAt: input.lastReplacedAt,
      dueAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await careItemsRepository.create(careItem);
    await this.listByProfileId(input.profileId);
    return careItem;
  }

  async update(id: string, input: CareItemMutationInput) {
    const existing = await careItemsRepository.getById(id);
    if (!existing) return null;

    const replacementCycleDays = resolveReplacementCycleDays(
      input.itemType,
      input.replacementCycleDays,
    );

    const careItem: CareItem = {
      ...existing,
      title: input.title,
      description: input.description,
      itemType: input.itemType,
      trackingEnabled: isReplacementTrackingEnabled(
        input.itemType,
        replacementCycleDays,
        input.lastReplacedAt,
      ),
      replacementCycleDays,
      lastReplacedAt: input.lastReplacedAt,
      updatedAt: nowIso(),
    };

    await careItemsRepository.update(careItem);
    await this.listByProfileId(existing.profileId);
    return careItem;
  }

  async delete(id: string) {
    const existing = await careItemsRepository.getById(id);
    if (!existing) return;

    await careItemsRepository.deleteById(id);
    await this.listByProfileId(existing.profileId);
  }
}

export const careService = new CareService();
