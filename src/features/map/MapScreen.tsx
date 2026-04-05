import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  LOWER_JAW_SEGMENTS,
  TOTAL_TEETH_COUNT,
  UPPER_JAW_SEGMENTS,
} from '@/src/domain/teeth';
import { ProAccessCard, useFeatureAccess } from '@/src/features/monetization';
import { ToothEditSheet, ToothJawSection } from '@/src/features/map/components';
import { useToothMapScreen } from '@/src/features/map/useToothMapScreen';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Card, Screen, StateMessageCard, Text } from '@/src/ui/base';

const PREVIEW_TOOTH_NUMBERS = new Set([1, 2, 3, 4, 29, 30, 31, 32]);

export function MapScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const isFocused = useIsFocused();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const map = useToothMapScreen(selectedProfileId, isFocused);
  const hasFullMapAccess = useFeatureAccess('tooth_map_full');
  const visibleTeeth = hasFullMapAccess
    ? map.teeth
    : map.teeth.filter((tooth) => PREVIEW_TOOTH_NUMBERS.has(tooth.toothNumber));
  const previewProblemZoneCount = visibleTeeth.filter((tooth) => tooth.isProblemZone).length;

  return (
    <>
      <Screen contentContainerStyle={{ paddingBottom: theme.spacing.xxxxl }}>
        <Text color="primary" variant="caption" weight="semibold">
          {t('toothMap.header.kicker')}
        </Text>
        <Text style={{ marginTop: theme.spacing.sm }} variant="display" weight="bold">
          {t('toothMap.header.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.md }}>
          {t('toothMap.header.description')}
        </Text>

        <Card style={{ marginTop: theme.spacing.xl }}>
          <Text variant="title" weight="semibold">
            {t('toothMap.summary.title')}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: theme.spacing.xl,
              marginTop: theme.spacing.lg,
            }}>
            <View style={{ flex: 1 }}>
              <Text color="muted" variant="caption">
                {t('toothMap.summary.problemZones')}
              </Text>
              <Text style={{ marginTop: theme.spacing.xs }} variant="title" weight="bold">
                {hasFullMapAccess ? map.problemZoneCount : previewProblemZoneCount}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text color="muted" variant="caption">
                {t('toothMap.summary.totalTeeth')}
              </Text>
              <Text style={{ marginTop: theme.spacing.xs }} variant="title" weight="bold">
                {TOTAL_TEETH_COUNT}
              </Text>
            </View>
          </View>
          <Text color="muted" style={{ marginTop: theme.spacing.lg }}>
            {t('toothMap.summary.helper')}
          </Text>
        </Card>

        {map.error ? (
          <StateMessageCard
            actionLabel={t('common.retry')}
            body={map.error}
            onActionPress={() => void map.reload()}
            title={t('common.errorTitle')}
          />
        ) : map.loading ? (
          <StateMessageCard title={t('toothMap.loading')} />
        ) : (
          <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
            {!hasFullMapAccess ? (
              <ProAccessCard
                body={t('monetization.gates.toothMapFull.body')}
                featureKeys={['tooth_map_full']}
                title={t('monetization.gates.toothMapFull.title')}
              />
            ) : null}
            <ToothJawSection
              onSelectTooth={hasFullMapAccess ? map.openTooth : () => undefined}
              segments={hasFullMapAccess ? UPPER_JAW_SEGMENTS : [UPPER_JAW_SEGMENTS[0]]}
              subtitle={t('toothMap.jaws.upperSubtitle')}
              teeth={visibleTeeth}
              title={t('toothMap.jaws.upper')}
            />
            <ToothJawSection
              onSelectTooth={hasFullMapAccess ? map.openTooth : () => undefined}
              segments={hasFullMapAccess ? LOWER_JAW_SEGMENTS : [LOWER_JAW_SEGMENTS[0]]}
              subtitle={t('toothMap.jaws.lowerSubtitle')}
              teeth={visibleTeeth}
              title={t('toothMap.jaws.lower')}
            />
          </View>
        )}
      </Screen>

      <ToothEditSheet
        history={map.history}
        note={map.draftNote}
        onChangeNote={map.setDraftNote}
        onChangeStatus={map.setDraftStatus}
        onClose={map.closeEditor}
        onSave={() => void map.saveTooth()}
        recordedAt={map.selectedTooth?.recordedAt ?? null}
        status={map.draftStatus}
        toothNumber={map.selectedToothNumber}
        visible={hasFullMapAccess && map.selectedToothNumber !== null}
      />
    </>
  );
}
