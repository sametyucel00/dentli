import { CareItemType } from '@/src/domain/models';

export type CareItemMutationInput = {
  profileId: string;
  title: string;
  description: string | null;
  itemType: CareItemType;
  replacementCycleDays: number | null;
  lastReplacedAt: string | null;
};
