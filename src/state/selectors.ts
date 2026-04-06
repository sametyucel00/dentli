import { SupportedLanguage } from '@/src/domain/models';
import { hasPremiumFeature } from '@/src/features/monetization/model';
import { useAppStore } from '@/src/state/useAppStore';
import { useShallow } from 'zustand/react/shallow';

const EMPTY_ARRAY: string[] = [];

function getProfileCollectionCount<T>(
  collection: Record<string, { data: T[] } | undefined>,
  profileId: string | null,
) {
  return profileId ? collection[profileId]?.data.length ?? 0 : 0;
}

export function getAlternateLanguage(language: string): SupportedLanguage {
  return language === 'tr' ? 'en' : 'tr';
}

export function useSelectedProfileSummary() {
  return useAppStore(
    useShallow((state) => {
      const selectedProfileId = state.selectedProfileId;
      const profiles = state.cache.profiles?.data ?? [];
      const selectedProfile =
        profiles.find((profile) => profile.id === selectedProfileId) ?? null;
      const appointmentsCount = getProfileCollectionCount(
        state.cache.appointmentsByProfileId,
        selectedProfileId,
      );
      const careItemsCount = getProfileCollectionCount(
        state.cache.careItemsByProfileId,
        selectedProfileId,
      );

      return {
        selectedProfile,
        appointmentsCount,
        careItemsCount,
      };
    }),
  );
}

export function useEntitlementSummary() {
  return useAppStore(
    useShallow((state) => ({
      entitlements: state.entitlements,
      isPro: state.entitlements.plan === 'pro',
      hasAdvancedAnalytics: hasPremiumFeature(state.entitlements, 'analytics_advanced'),
      hasMultiProfile: hasPremiumFeature(state.entitlements, 'multi_profile'),
    })),
  );
}

export function useAccessibleProfileIds() {
  return useAppStore(
    useShallow((state) => {
      const profiles = state.cache.profiles?.data;
      if (!profiles || profiles.length === 0) {
        return EMPTY_ARRAY;
      }

      const profileIds = profiles.map((profile) => profile.id);

      if (hasPremiumFeature(state.entitlements, 'multi_profile')) {
        return profileIds;
      }

      return profileIds.slice(0, 1);
    }),
  );
}
