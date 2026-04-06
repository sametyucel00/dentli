import { create } from 'zustand';

import {
  AppBootstrapData,
  AppBootstrapStatus,
  AppCacheState,
  AppPreferences,
  EntitlementSnapshot,
  Appointment,
  CareItem,
  Profile,
  RoutineSettings,
  SupportedLanguage,
  ThemeMode,
  ToothCurrentStatus,
} from '@/src/domain/models';
import { EMPTY_ENTITLEMENT_SNAPSHOT } from '@/src/features/monetization/model';
import {
  createCacheEntry,
  createEmptyCache,
  mergeSelectedProfileCache,
  setProfileCacheEntry,
} from '@/src/state/store-helpers';

type AppStoreState = {
  language: SupportedLanguage;
  themeMode: ThemeMode;
  selectedProfileId: string | null;
  isHydrated: boolean;
  bootstrapStatus: AppBootstrapStatus;
  bootstrapError: string | null;
  cache: AppCacheState;
  entitlements: EntitlementSnapshot;
  appPreferences: AppPreferences;
  setLanguage: (language: SupportedLanguage) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setEntitlements: (entitlements: EntitlementSnapshot) => void;
  setAppPreferences: (appPreferences: AppPreferences) => void;
  toggleThemeMode: () => void;
  selectProfile: (profileId: string | null) => void;
  setBootstrapState: (payload: {
    status: AppBootstrapStatus;
    error?: string | null;
  }) => void;
  hydrate: (data: AppBootstrapData) => void;
  setSelectedProfileContext: (payload: {
    selectedProfileId: string | null;
    routineSettings: RoutineSettings | null;
    appointments: Appointment[];
    careItems: CareItem[];
    toothCurrentStatuses: ToothCurrentStatus[];
    language?: SupportedLanguage;
  }) => void;
  cacheProfiles: (profiles: Profile[]) => void;
  cacheRoutineSettings: (profileId: string, settings: RoutineSettings) => void;
  cacheAppointments: (profileId: string, appointments: Appointment[]) => void;
  cacheCareItems: (profileId: string, careItems: CareItem[]) => void;
  cacheToothCurrentStatuses: (
    profileId: string,
    toothCurrentStatuses: ToothCurrentStatus[],
  ) => void;
  resetApp: () => void;
};

function getNextThemeMode(currentThemeMode: ThemeMode): ThemeMode {
  return currentThemeMode === 'dark' ? 'light' : 'dark';
}

const INITIAL_APP_PREFERENCES: AppPreferences = {
  biometricLockEnabled: false,
  updatedAt: new Date(0).toISOString(),
};

export const useAppStore = create<AppStoreState>((set) => ({
  language: 'en',
  themeMode: 'system',
  selectedProfileId: null,
  isHydrated: false,
  bootstrapStatus: 'idle',
  bootstrapError: null,
  cache: createEmptyCache(),
  entitlements: EMPTY_ENTITLEMENT_SNAPSHOT,
  appPreferences: INITIAL_APP_PREFERENCES,
  setLanguage: (language) => set({ language }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setEntitlements: (entitlements) => set({ entitlements }),
  setAppPreferences: (appPreferences) => set({ appPreferences }),
  toggleThemeMode: () =>
    set((state) => ({
      themeMode: getNextThemeMode(state.themeMode),
    })),
  selectProfile: (selectedProfileId) => set({ selectedProfileId }),
  setBootstrapState: ({ status, error = null }) =>
    set({
      bootstrapStatus: status,
      bootstrapError: error,
    }),
  hydrate: ({
    profiles,
    selectedProfileId,
    routineSettings,
    appointments,
    careItems,
    toothCurrentStatuses,
    entitlements,
    appPreferences,
  }) =>
    set((state) => ({
      isHydrated: true,
      bootstrapStatus: 'ready',
      bootstrapError: null,
      language:
        profiles.find((profile) => profile.id === selectedProfileId)?.preferredLanguage ??
        state.language,
      selectedProfileId,
      entitlements,
      appPreferences,
      cache: mergeSelectedProfileCache(
        {
          ...state.cache,
          profiles: createCacheEntry(profiles),
        },
        {
          selectedProfileId,
          routineSettings,
          appointments,
          careItems,
          toothCurrentStatuses,
        },
      ),
    })),
  setSelectedProfileContext: ({
    selectedProfileId,
    routineSettings,
    appointments,
    careItems,
    toothCurrentStatuses,
    language,
  }) =>
    set((state) => ({
      language: language ?? state.language,
      selectedProfileId,
      cache: mergeSelectedProfileCache(state.cache, {
        selectedProfileId,
        routineSettings,
        appointments,
        careItems,
        toothCurrentStatuses,
      }),
    })),
  cacheProfiles: (profiles) =>
    set((state) => ({
      cache: {
        ...state.cache,
        profiles: createCacheEntry(profiles),
      },
    })),
  cacheRoutineSettings: (profileId, settings) =>
    set((state) => ({
      cache: {
        ...state.cache,
        routineSettingsByProfileId: setProfileCacheEntry(
          state.cache.routineSettingsByProfileId,
          profileId,
          settings,
        ),
      },
    })),
  cacheAppointments: (profileId, appointments) =>
    set((state) => ({
      cache: {
        ...state.cache,
        appointmentsByProfileId: setProfileCacheEntry(
          state.cache.appointmentsByProfileId,
          profileId,
          appointments,
        ),
      },
    })),
  cacheCareItems: (profileId, careItems) =>
    set((state) => ({
      cache: {
        ...state.cache,
        careItemsByProfileId: setProfileCacheEntry(
          state.cache.careItemsByProfileId,
          profileId,
          careItems,
        ),
      },
    })),
  cacheToothCurrentStatuses: (profileId, toothCurrentStatuses) =>
    set((state) => ({
      cache: {
        ...state.cache,
        toothCurrentStatusByProfileId: setProfileCacheEntry(
          state.cache.toothCurrentStatusByProfileId,
          profileId,
          toothCurrentStatuses,
        ),
      },
    })),
  resetApp: () =>
    set({
      language: 'en',
      themeMode: 'system',
      selectedProfileId: null,
      isHydrated: false,
      bootstrapStatus: 'idle',
      bootstrapError: null,
      cache: createEmptyCache(),
      entitlements: EMPTY_ENTITLEMENT_SNAPSHOT,
      appPreferences: INITIAL_APP_PREFERENCES,
    }),
}));
