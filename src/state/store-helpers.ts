import { AppBootstrapData, AppCacheState, CacheEntry, EntityId } from '@/src/domain/models';
import { nowIso } from '@/src/lib/runtime';

type ProfileCacheCollection<T> = Record<EntityId, CacheEntry<T> | undefined>;

export type SelectedProfileCachePayload = Pick<
  AppBootstrapData,
  'selectedProfileId' | 'routineSettings' | 'appointments' | 'careItems' | 'toothCurrentStatuses'
>;

export function createCacheEntry<T>(data: T): CacheEntry<T> {
  return {
    data,
    updatedAt: nowIso(),
  };
}

export function setProfileCacheEntry<T>(
  collection: ProfileCacheCollection<T>,
  profileId: EntityId,
  data: T,
): ProfileCacheCollection<T> {
  return {
    ...collection,
    [profileId]: createCacheEntry(data),
  };
}

export function mergeSelectedProfileCache(
  cache: AppCacheState,
  {
    selectedProfileId,
    routineSettings,
    appointments,
    careItems,
    toothCurrentStatuses,
  }: SelectedProfileCachePayload,
): AppCacheState {
  if (!selectedProfileId) {
    return cache;
  }

  return {
    ...cache,
    routineSettingsByProfileId:
      routineSettings === null
        ? cache.routineSettingsByProfileId
        : setProfileCacheEntry(cache.routineSettingsByProfileId, selectedProfileId, routineSettings),
    appointmentsByProfileId: setProfileCacheEntry(
      cache.appointmentsByProfileId,
      selectedProfileId,
      appointments,
    ),
    careItemsByProfileId: setProfileCacheEntry(
      cache.careItemsByProfileId,
      selectedProfileId,
      careItems,
    ),
    toothCurrentStatusByProfileId: setProfileCacheEntry(
      cache.toothCurrentStatusByProfileId,
      selectedProfileId,
      toothCurrentStatuses,
    ),
  };
}

export function createEmptyCache(): AppCacheState {
  return {
    profiles: null,
    routineSettingsByProfileId: {},
    hygieneEventsByProfileId: {},
    symptomEventsByProfileId: {},
    appointmentsByProfileId: {},
    careItemsByProfileId: {},
    toothCurrentStatusByProfileId: {},
  };
}
